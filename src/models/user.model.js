const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

// TO add: Liked Posts
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    unique: true,
    required: true,
    trim: true,
    validate(value) {
      if (!validator.isEmail(value)) {
        throw new Error('Email is invalid')
      }
    },
  },
  password: {
    type: String,
    required: true,
    trim: true,
    minlength: 7,
    validate(value) {
      if (value.toLowerCase().includes('password')) {
        throw new Error('Password cannot contain "password"')
      }
    },
  },
  token: {
    type: String,
  },
})

userSchema.pre('save', async function (next) {
  const user = this
  if (user.isModified('password')) {
    const salt = bcrypt.genSaltSync()
    user.password = bcrypt.hashSync(user.password, salt)
  }
  next()
})

userSchema.statics.findByCredentials = async (email, password) => {
  const user = await User.findOne({ email })

  if (!user) {
    throw new Error('Unable to Login')
  }

  const isMatch = bcrypt.compareSync(password, user.password)

  if (!isMatch) {
    throw new Error('Unable to login')
  }

  return user
}

userSchema.methods.generateAuthToken = async function () {
  const user = this
  const token = jwt.sign(
    { email: user.email, id: user._id.toString() },
    process.env.JWT_SECRET,
    { expiresIn: '8h' }
  )
  user.token = token
  await user.save()
  return token
}

const User = mongoose.model('User', userSchema)

module.exports = User
