const express = require('express')
const User = require('../models/user.model')
const auth = require('../middleware/auth')

const router = new express.Router()

// /api/user
router.get('/me', auth, (req, res) => {
  res.status(200).send(req.user)
})

router.post('/signup', async (req, res) => {
  const user = new User(req.body)
  try {
    const find = await User.findOne({ email: user.email })
    if (find) {
      return res.status(400).json({ msg: 'invalid Credentials' })
    }
    await user.save()
    const token = await user.generateAuthToken()
    res.status(201).json({ user, token })
  } catch (e) {
    res.status(400).json(e)
  }
})

router.post('/login', async (req, res) => {
  try {
    const user = await User.findByCredentials(req.body.email, req.body.password)
    const token = await user.generateAuthToken()
    res.status(200).send({ user, token })
  } catch (e) {
    res.status(400).send(e)
  }
})

router.post('/logout', auth, async (req, res) => {
  const user = req.user
  try {
    user.token = ''
    console.log(user)
    await user.save()
    res.json({ msg: 'logged out' })
  } catch (e) {
    res.status(500).send()
  }
})

router.put('/me', auth, async (req, res) => {
  const updates = Object.keys(req.body)
  const allowedUpdates = ['name', 'email', 'password']
  const isValidOperation = updates.every((update) =>
    allowedUpdates.includes(update)
  )

  if (!isValidOperation) {
    return res.status(400).send({ msg: 'Invalid updates!' })
  }

  try {
    updates.forEach((update) => (req.user[update] = req.body[update]))
    await req.user.save()

    res.send(req.user)
  } catch (e) {
    res.status(400).send(e)
  }
})

module.exports = router
