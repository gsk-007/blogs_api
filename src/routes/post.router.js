const express = require('express')
const Post = require('../models/post.model')
const auth = require('../middleware/auth')

const router = new express.Router()

// /api/post/allposts GET to get all posts

router.get('/allpost', async (req, res) => {
  try {
    const posts = await Post.find({}).exec()
    res.status(200).json(posts)
  } catch (e) {
    res.status(500).end()
  }
})

// For creating a new post
router.post('/', auth, async (req, res) => {
  const post = new Post({ ...req.body, author: req.user._id })
  try {
    await post.save()
    res.status(201).send(post)
  } catch (e) {
    res.status(500).send(e)
  }
})

// Editing a post
router.put('/:id', auth, async (req, res) => {
  const updates = Object.keys(req.body)

  const allowedUpdates = ['title', 'description', 'body']
  const isValidOperation = updates.every((update) =>
    allowedUpdates.includes(update)
  )

  if (!isValidOperation) {
    return res.status(400).send({ error: 'Invalid updates!' })
  }

  try {
    const post = await Post.findOne({
      _id: req.params.id,
      author: req.user._id,
    })

    if (!post) {
      return res.status(404).json({ msg: 'Invalid Request' })
    }

    updates.forEach((update) => (post[update] = req.body[update]))

    await post.save()

    res.status(200).send(post)
  } catch (e) {
    res.status(500).json({ msg: 'Server Error' })
  }
})

// Fetching Post by id
router.get('/:id', auth, async (req, res) => {
  const _id = req.params.id

  try {
    const post = await Post.findOne({ _id })
    if (!post) {
      return res.status(404).end()
    }
    res.json(post)
  } catch (e) {
    res.status(500).json({ msg: 'Server Error' })
  }
})

// Deleting a post
router.delete('/:id', auth, async (req, res) => {
  try {
    const post = await Task.findOneAndDelete({
      _id: req.params.id,
      author: req.user._id,
    })
    if (!post) {
      return res.status(404).send()
    }
    res.send(post)
  } catch (e) {
    res.status(500).send(e)
  }
})

// Adding Likes
router.put('/:id/like', auth, async (req, res) => {
  const _id = req.params.id

  try {
    const post = await Post.findOne({ _id })

    if (!post) {
      return res.status(404).end()
    }

    post.likes = post.likes + 1
    const present = post.likedBy.find((id) => id.toString() === req.user.id)
    if (present) {
      return res.status(401).json({ msg: 'GET LOST!' })
    }
    post.likedBy = post.likedBy.concat(req.user.id)
    await post.save()
    res.json(post)
  } catch (e) {
    res.status(500).send(e)
  }
})

// Removing Likes
router.put('/:id/unlike', auth, async (req, res) => {
  const _id = req.params.id

  try {
    const post = await Post.findOne({ _id })
    if (!post) {
      return res.status(404).end()
    }

    if (post.likes === 0) {
      return res.status(401).json({ msg: 'GET LOST!' })
    }
    post.likes = post.likes - 1

    post.likedBy = post.likedBy.filter((id) => id.toString() !== req.user.id)

    await post.save()
    res.json(post)
  } catch (e) {
    res.status(500).end()
  }
})

module.exports = router
