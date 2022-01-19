const mongoose = require('mongoose')

const postSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    minlength: 5,
  },
  description: {
    type: String,
    required: true,
    trim: true,
  },
  body: {
    type: String,
    required: true,
    trim: true,
    minlength: 20,
  },
  likes: {
    type: Number,
    default: 0,
  },
  likedBy: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      unique: true,
    },
  ],
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    //     required:true,
  },
})

const Post = mongoose.model('Post', postSchema)

module.exports = Post
