const express = require('express')
const cors = require('cors')
const connect = require('./db/mongoose')
const userRouter = require('./routes/user.router')
const postRouter = require('./routes/post.router')

const swaggerUi = require('swagger-ui-express')
const swaggerJsdoc = require('swagger-jsdoc')

const app = express()
const PORT = process.env.PORT || 5000

connect(process.env.DB_URL)
app.use(cors())

const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API Documentation',
      version: '1.0.0',
      description: 'API documentation for my application',
    },
    servers: [
      {
        url: `http://localhost:${PORT}/`,
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT', // Optional, can specify format like JWT
        },
      },
    },
    security: [
      {
        bearerAuth: [], // Apply bearerAuth globally
      },
    ],
  },
  apis: ['./src/routes/*.router.js'],
};

const swaggerDocs = swaggerJsdoc(swaggerOptions);

app.use(express.json())
app.use('/api/users', userRouter)
app.use('/api/posts', postRouter)

// Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));


app.use('/',(req,res) => {res.send('server is running!')})

app.listen(PORT, () => {
   console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Swagger docs available at http://localhost:${PORT}/api-docs`);
})
