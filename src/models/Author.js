const mongoose = require('mongoose');

const AuthorSchema = new mongoose.Schema({
  name: {
    en: { type: String, required: true },
    ar: { type: String, required: true },
  },
  email: { type: String, unique: true, required: true },
  biography: {
    en: { type: String },
    ar: { type: String },
  },
  profileImageUrl: { type: String },
  birthDate: { type: Date },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Author', AuthorSchema);
