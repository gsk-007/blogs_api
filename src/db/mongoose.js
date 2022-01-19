const mongoose = require('mongoose')

const connect = (url) => {
  mongoose
    .connect(url, {
      useNewUrlParser: true,
    }).then(()=> console.log("db connected successfully")).catch((e)=> console.log(e))
}

module.exports = connect