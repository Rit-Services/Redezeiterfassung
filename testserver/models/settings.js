const mongoose = require('mongoose')
const Schema = mongoose.Schema

const Settings = new Schema(
    {
        "apiKey": {type: String, required: false},
        "streamingIP": {type: String, required: false},
        "adminPassword": {type: String, required: false},
    }
)

module.exports = mongoose.model('settings', Settings)