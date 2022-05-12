const mongoose = require('mongoose')
const Schema = mongoose.Schema

const Utils = new Schema(
    {
        activeIndex: {type: String, required: false},
        LR:{type: String, required: false},
        SPD: {type: String, required: false},
        CDU: {type: String, required: false},
        greens: {type: String, required: false},
        FDP: {type: String, required: false},
    }
)

module.exports = mongoose.model('utils', Utils)