const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
  brandName: {
    type: String,
    required: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  influencerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Influencer',
    required: true,
  },
  pros: [{
    type: String
  }],
  cons: [{
    type: String
  }],
  earningsEstimate: {
    type: Number,
    required: true,
  },
  score: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ['Draft', 'Pitch Sent', 'Negotiating', 'Active', 'Completed'],
    default: 'Draft',
  },
}, { timestamps: true });

module.exports = mongoose.model('Report', reportSchema);
