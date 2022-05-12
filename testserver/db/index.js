const mongoose = require('mongoose')

mongoose
    // .connect('mongodb://172.29.240.1:30001,172.29.240.1:30002,172.29.240.1:30003/landtag-demo?replicaSet=redak', { useNewUrlParser: true, })
    // .connect('mongodb://localhost:27017/landtag-demo-test', { useNewUrlParser: true, })
    .connect(process.env.MONGODB_URL, { useNewUrlParser: true, })
    .catch(e => {
        console.error('Connection error', e.message)
    })

const db = mongoose.connection

module.exports = db