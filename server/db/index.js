const mongoose = require('mongoose')

mongoose
    // .connect('mongodb://172.29.240.1:30001,172.29.240.1:30002,172.29.240.1:30003/landtag-demo?replicaSet=redak', { useNewUrlParser: true, })
    // .connect('mongodb://localhost:27017/landtag-demo', { useNewUrlParser: true, })
    .connect(process.env.MONGODB_URL, { useNewUrlParser: true, })
    // .connect('mongodb://192.168.18.13:27017/landtag-demo', { useNewUrlParser: true, })
    // .connect('mongodb://admin:ritservice2022@192.168.0.101:27018,192.168.0.101:27019,192.168.0.101:27020/landtag-demo', { useNewUrlParser: true, })
    .catch(e => {
        console.error('Connection error', e.message)
    })

const db = mongoose.connection

module.exports = db