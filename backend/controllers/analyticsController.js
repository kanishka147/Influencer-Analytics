const Influencer = require('../models/Influencer');
const Report = require('../models/Report');
const { GoogleGenAI } = require('@google/genai');

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || 'dummy' });

// Basic categorization map for brand fit calculation
const categoryMultipliers = {
  'Tech': 0.05,
  'Beauty': 0.04,
  'Fashion': 0.035,
  'Gaming': 0.045,
  'Lifestyle': 0.025,
  'Default': 0.03
};

const generateProsAndConsStatic = (influencer, brandCategory) => {
  const pros = [];
  const cons = [];

  const nicheMap = {
    'Lifestyle': ['Beauty', 'Fashion', 'Travel', 'Health'],
    'Tech': ['Gaming', 'Software', 'Gadgets'],
    'Beauty': ['Fashion', 'Lifestyle', 'Health'],
    'Fitness': ['Health', 'Lifestyle', 'Nutrition']
  };

  if (influencer.engagementRate > 3.5) {
    pros.push(`Solid engagement (${influencer.engagementRate}%), indicating high audience trust.`);
  } else if (influencer.engagementRate < 1.5) {
    cons.push('Engagement is below 1.5%, which might result in lower conversions.');
  }

  if (influencer.followers > 50000) {
    pros.push('Macro-influencer reach with established credibility.');
  } else {
    pros.push('Micro-influencer status with high authenticity.');
  }

  const compatibleNiches = nicheMap[influencer.category] || [];
  const isMatch = brandCategory && (
    influencer.category.toLowerCase() === brandCategory.toLowerCase() || 
    compatibleNiches.some(n => n.toLowerCase() === brandCategory.toLowerCase())
  );

  if (isMatch) {
    pros.push(`Great category alignment: ${influencer.category} creators are very effective for ${brandCategory}.`);
  } else if (brandCategory) {
    cons.push('Brand niche is outside the primary category, but could work for general reach.');
  }

  return { pros, cons };
};

const generateAIAnalytics = async (influencer, brandName, brandCategory) => {
  // Graceful fallback if no actual Key provided by user
  if (!process.env.GEMINI_API_KEY) {
    const { pros, cons } = generateProsAndConsStatic(influencer, brandCategory);
    
    // Original fallback math logic
    const multiplier = categoryMultipliers[influencer.category] || categoryMultipliers['Default'];
    const earningsEstimate = Math.round(influencer.followers * (influencer.engagementRate / 100) * multiplier);
    
    let score = 'Average';
    let scoreVal = 0;
    if (influencer.engagementRate >= 4) scoreVal += 2;
    if (influencer.engagementRate >= 2 && influencer.engagementRate < 4) scoreVal += 1;
    if (brandCategory && influencer.category.toLowerCase() === brandCategory.toLowerCase()) scoreVal += 1;
    if (influencer.followers >= 10000) scoreVal += 1;

    if (scoreVal >= 3) score = 'Good';
    else if (scoreVal === 2) score = 'Average';
    else score = 'Poor';

    return { pros, cons, earningsEstimate, score };
  }

  try {
    const prompt = `Act as an expert Influencer Marketing & Financial Analyst. 
    Analyze the brand fit and fair market value for this potential collaboration:
    Brand: ${brandName} (${brandCategory || 'General'})
    Influencer: ${influencer.name}
    Niche: ${influencer.category}
    Followers: ${influencer.followers}
    Engagement Rate: ${influencer.engagementRate}%

    Tasks:
    1. Determine a "Fit Score" (Choose exactly one: Excellent, Good, Average, Poor).
    2. Estimate the "Fair Market Value" in Indian Rupees (INR) for a single high-quality sponsored post. Consider the influencer's category (Tech/Beauty is higher), their engagement rate, and their follower tier.
    3. List 3 key Pros and 2 Risks.

    Important Guidelines for Scores:
    - Excellent: If niche and brand category match perfectly AND engagement is >4%.
    - Good: If niche matches OR engagement is high (>3%).
    - Average: Standard baseline.
    - Poor: If there is a major niche mismatch.

    Format your response EXACTLY as valid JSON:
    {
      "score": "Excellent",
      "earningsEstimate": 45000,
      "pros": ["Point 1", "Point 2", "Point 3"],
      "cons": ["Risk 1", "Risk 2"]
    }
    No additional text, markdown, or commentary.`;

    const response = await ai.models.generateContent({
      model: 'gemini-1.5-flash',
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
    });
    
    // The new SDK uses .text (property), not .text() (function)
    // We also clean the string in case the AI added markdown blocks
    const cleanText = response.text.replace(/```json/gi, '').replace(/```/g, '').trim();
    const result = JSON.parse(cleanText);
    
    return { 
      pros: result.pros || [], 
      cons: result.cons || [],
      score: result.score || 'Average',
      earningsEstimate: Number(result.earningsEstimate) || 0
    };
  } catch (error) {
    console.error("AI Analytics failed:", error.message);
    const errorMessage = error.message.includes('429') || error.message.includes('EXHAUSTED')
      ? 'AI Quota exceeded - please try again in a few minutes.'
      : 'AI temporarily restricted - showing estimated data.';
      
    return { 
      pros: [`Analyzed based on follower count (${influencer.followers}) and engagement (${influencer.engagementRate}%).`], 
      cons: [errorMessage],
      earningsEstimate: 0,
      score: 'Average'
    };
  }
}

exports.generateReport = async (req, res) => {
  try {
    const { influencerId, brandName, brandCategory } = req.body;
    const userId = req.user.id; // From auth middleware

    const influencer = await Influencer.findById(influencerId);
    if (!influencer) {
      return res.status(404).json({ error: 'Influencer not found' });
    }

    const { pros, cons, earningsEstimate: aiEstimate, score: aiScore } = await generateAIAnalytics(influencer, brandName, brandCategory);
    
    // Improved Static Fallback Math (if AI fails or is missing)
    const multiplier = categoryMultipliers[influencer.category] || categoryMultipliers['Default'];
    const followerPay = influencer.followers * multiplier; 
    const engagementBonus = (influencer.followers * (influencer.engagementRate / 100) * 1.5);
    const staticEstimate = Math.round(followerPay + engagementBonus);

    const earningsEstimate = aiEstimate || staticEstimate;
    const score = aiScore || 'Average';

    const report = new Report({
      brandName,
      userId,
      influencerId: influencer._id,
      pros,
      cons,
      earningsEstimate,
      score
    });

    await report.save();
    await report.populate('influencerId');

    res.status(201).json(report);
  } catch (error) {
    console.error('Error generating report:', error.message);
    if (error.stack) console.error(error.stack);
    res.status(500).json({ 
      error: 'Server error generating report', 
      details: error.message 
    });
  }
};

exports.getAllReports = async (req, res) => {
  try {
    // Only return reports for the authenticated user
    const reports = await Report.find({ userId: req.user.id }).populate('influencerId').sort({ createdAt: -1 });
    res.status(200).json(reports);
  } catch (error) {
    console.error('Error fetching reports:', error);
    res.status(500).json({ error: 'Server error fetching reports' });
  }
};

exports.createInfluencer = async (req, res) => {
  try {
    const { name, followers, likes, comments, category } = req.body;

    if (!name || followers === undefined || likes === undefined || comments === undefined || !category) {
      return res.status(400).json({ error: 'All fields are required.' });
    }

    const rawEngagementRate = ((Number(likes) + Number(comments)) / Number(followers)) * 100;
    const engagementRate = parseFloat(rawEngagementRate.toFixed(2));

    const influencer = new Influencer({
      name,
      followers,
      engagementRate,
      category
    });

    await influencer.save();
    res.status(201).json(influencer);
  } catch (error) {
    console.error('Error creating influencer:', error);
    res.status(500).json({ error: 'Server error creating influencer' });
  }
};

exports.getAllInfluencers = async (req, res) => {
  try {
    const influencers = await Influencer.find().sort({ createdAt: -1 });
    res.status(200).json(influencers);
  } catch (error) {
    console.error('Error fetching influencers:', error);
    res.status(500).json({ error: 'Server error fetching influencers' });
  }
};

exports.updateReportStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['Draft', 'Pitch Sent', 'Negotiating', 'Active', 'Completed'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status value' });
    }

    const report = await Report.findOneAndUpdate(
      { _id: id, userId: req.user.id },
      { status },
      { new: true }
    ).populate('influencerId');

    if (!report) {
      return res.status(404).json({ error: 'Report not found' });
    }

    res.json(report);
  } catch (error) {
    console.error('Error updating report status:', error);
    res.status(500).json({ error: 'Server error updating status' });
  }
};

exports.getInfluencerById = async (req, res) => {
  try {
    const influencer = await Influencer.findById(req.params.id);
    if (!influencer) {
      return res.status(404).json({ error: 'Influencer not found' });
    }
    res.json(influencer);
  } catch (error) {
    console.error('Error fetching influencer:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.getInfluencerReports = async (req, res) => {
  try {
    const reports = await Report.find({
      influencerId: req.params.id,
      userId: req.user.id
    }).populate('influencerId').sort({ createdAt: -1 });
    res.json(reports);
  } catch (error) {
    console.error('Error fetching influencer reports:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.getReportById = async (req, res) => {
  try {
    const report = await Report.findOne({
      _id: req.params.id,
      userId: req.user.id
    }).populate('influencerId');
    if (!report) {
      return res.status(404).json({ error: 'Report not found' });
    }
    res.json(report);
  } catch (error) {
    console.error('Error fetching report:', error);
    res.status(500).json({ error: 'Server error' });
  }
};
