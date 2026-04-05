const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const generateToken = (user) => {
  const payload = {
    user: {
      id: user.id
    }
  };
  return jwt.sign(payload, process.env.JWT_SECRET || 'fallback_secret_for_development', { expiresIn: '7d' });
};

exports.register = async (req, res) => {
  try {
    const { email, password, influencerName } = req.body;

    if (!email || !password || !influencerName) {
      return res.status(400).json({ error: 'Please enter all fields' });
    }

    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ error: 'User already exists' });
    }

    user = new User({ email, password, influencerName });

    // Encrypt password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);

    await user.save();

    const token = generateToken(user);
    res.json({ token, user: { id: user.id, email: user.email, influencerName: user.influencerName } });

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Please enter all fields' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: 'Invalid Credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid Credentials' });
    }

    const token = generateToken(user);
    res.json({ token, user: { id: user.id, email: user.email, influencerName: user.influencerName } });

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const { influencerName, instagram } = req.body;
    const updates = {};
    if (influencerName) updates.influencerName = influencerName;
    if (instagram !== undefined) updates.instagram = instagram;

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: updates },
      { new: true }
    ).select('-password');

    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};
