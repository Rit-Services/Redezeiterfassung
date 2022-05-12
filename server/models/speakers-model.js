const mongoose = require('mongoose')
const Schema = mongoose.Schema

const details = new Schema(
    {
        "abg-id": {type: String, required: false},
        "nachname":  {type: String, required: false},
        "vorname": {type: String, required: false},
        "fraktion": {type: String, required: false},
        "titel": {type: String, required: false},
        "namenspraefix": {type: String, required: false},
        "funktion": {type: String, required: false},
        "kennung": {type: String, required: false},

    }
)

const Red = new Schema({
    redner: {type: [details], required:false}
})

const SpeakersList = new Schema(
    {
        Abgeordnetenliste: {type: [Red], required: false},
    }
)

module.exports = mongoose.model('speakers', SpeakersList)