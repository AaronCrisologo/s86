const mongoose = require("mongoose");

// Subdocument schema for a single comment on a movie
const commentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    userEmail: {
      type: String,
      required: true,
      lowercase: true,
    },
    comment: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { timestamps: { createdAt: "dateCommented", updatedAt: false } }
);

const movieSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    director: {
      type: String,
      required: true,
      trim: true,
    },
    year: {
      type: Number,
      required: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    genre: {
      type: String,
      required: true,
      trim: true,
    },
    comments: [commentSchema],
  },
  { timestamps: { createdAt: "dateAdded", updatedAt: "dateUpdated" } }
);

module.exports = mongoose.model("Movie", movieSchema);