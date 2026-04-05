const mongoose = require('mongoose');

const influencerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  followers: {
    type: Number,
    required: true,
  },
  engagementRate: {
    type: Number,
    required: true,
  },
  category: {
    type: String,
    required: true,
  },
}, { timestamps: true });

module.exports = mongoose.model('Influencer', influencerSchema);
