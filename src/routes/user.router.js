const express = require('express')
const User = require('../models/user.model')
const auth = require('../middleware/auth')

const router = new express.Router()


/**
 * @swagger
 * /api/users/me:
 *   get:
 *     summary: Get the authenticated user's details
 *     description: Returns the details of the currently authenticated user.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully retrieved user details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   description: User's unique identifier
 *                 name:
 *                   type: string
 *                   description: User's name
 *                 email:
 *                   type: string
 *                   description: User's email address
 *       401:
 *         description: Unauthorized, no valid token provided
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Error message
 *                   example: "Unauthorized"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Error message
 *                   example: "Internal server error"
 */
router.get('/me', auth, (req, res) => {
  res.status(200).send(req.user)
})

/**
 * @swagger
 * /api/users/signup:
 *   post:
 *     summary: Register a new user
 *     tags:
 *       - Users
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *             properties:
 *               name:
 *                 type: string
 *                 description: User's name
 *                 example: user
 *               email:
 *                 type: string
 *                 description: User's email address
 *                 example: user@example.com
 *               password:
 *                 type: string
 *                 description: User's password
 *                 example: StrongPassword123
 *     responses:
 *       201:
 *         description: User created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   type: object
 *                   description: Details of the created user
 *                   properties:
 *                     _id:
 *                       type: string
 *                       description: User ID
 *                       example: 64f7c1234abcd567ef90123
 *                     email:
 *                       type: string
 *                       description: User's email address
 *                       example: user@example.com
 *                 token:
 *                   type: string
 *                   description: Authentication token
 *                   example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9
 *       400:
 *         description: Invalid input or user already exists
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 msg:
 *                   type: string
 *                   description: Error message
 *                   example: invalid Credentials
 *       500:
 *         description: Internal server error
 */

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

/**
 * @swagger
 * /api/users/login:
 *   post:
 *     summary: Login a user
 *     description: Authenticate a user by email and password, and return a JWT token.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 description: User's email address
 *                 example: "user@example.com"
 *               password:
 *                 type: string
 *                 description: User's password
 *                 example: "password123"
 *     responses:
 *       200:
 *         description: Successful login, returns user details and token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   type: object
 *                   description: The authenticated user object
 *                   properties:
 *                     id:
 *                       type: string
 *                       description: User's unique identifier
 *                     name:
 *                       type: string
 *                       description: User's name
 *                     email:
 *                       type: string
 *                       description: User's email address
 *                 token:
 *                   type: string
 *                   description: JWT authentication token
 *       400:
 *         description: Invalid credentials or server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Error message
 *                   example: "Invalid login credentials"
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Error message
 *                   example: "Internal server error"
 */
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
