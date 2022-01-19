const express = require('express')
const cors = require('cors')
const connect = require('./db/mongoose')
const userRouter = require('./routes/user.router')
const postRouter = require('./routes/post.router')

const app = express()
const PORT = process.env.PORT || 5000

connect(process.env.DB_URL)

app.use(cors())

app.use(express.json())
app.use('/api/users', userRouter)
app.use('/api/posts', postRouter)

app.listen(PORT, () => {
  console.log(`Server up at port ${PORT}`)
})
