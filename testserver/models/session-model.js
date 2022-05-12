const mongoose = require('mongoose')
const Schema = mongoose.Schema

const DollarSign = new Schema(
    {
        ID: {type: String,required: false},
    },
    {timestamp: false},
)

const SubjectOfItem = new Schema(
    {
        subjectNumber: {type: String, required: false},
        subjectVisible: {type: String, required: false},
        itemPostfix:{type: String, required: false},
        title: {type: String, required: false},
        consultationType: {type: String, required: false},
        consultationTypeKZ: {type: String, required: false},
        subjectArt: {type: String, required: false},
        incomingPrint: {type: String, required: false},
        incomingPrintLink: {type: String, required: false},
        applicant: {type: String, required: false},
        applicantText: {type: String, required: false},
        rejects: {type: String, required: false},
        rejectsdrs: {type: String, required: false},
        rejectsdrsLink: {type: String, required: false},
        rejectRecommendation: {type: String, required: false},
        additionalApplicationdrs: {type: [String], required: false},
        additionalApplication: {type: [String], required: false},
        additionalApplicationGroup: {type: [String], required: false},
        additionalApplicationGroupText: {type: [String], required: false},
        $: {type: {DollarSign}, required: false},
    },
    {timestamps: true},
)


const Group = new Schema(
    {
        name: {type: String, required: false},
        duration: {type: String, required: false},
    },
    {timestamps:true},
)

const ItemTiming = new Schema(
    {
        groups: {type: [Group], required: false},
    },
    {timestamps:true}
)

const Item = new Schema(
    {
        itemNumber: {type: String, required: false},
        itemBeginning: {type: String, required: false},
        itemDuration: {type: String, required: false},
        itemLR: {type: String, required: false},
        itemBuffer: {type: String, required: false},
        itemQuantitybg: {type: String, required: false},
        endTime: {type: String,required: false},
        totalItemTime: {type: String,required: false},
        itemTimings: {type: [ItemTiming], required: false},
        subjectOfItems: {type: [SubjectOfItem], required: false},
        $: {type: {DollarSign}, required: false},
    },
    {timestamps: true}
)

const Meeting = new Schema(
    {
        quantityItems: {type: String, required: false},
        meetingNumber: {type: String, required: false},
        meetingDate: {type: String, required: false},
        meetingTime: {type: String, required: false},
        items: {type: [Item], required: false},
        $: {type: {DollarSign}, required: false},
    },
    {timestamps: true}
)

const Session = new Schema(
    {
        sessionNumber: {type: String, required: false},
        sessionStart: {type: String, required: false},
        sessionEnd: {type: String, required: false},
        numberOfDays: {type: String, required: false},
        meetings: {type: [Meeting], required: false},
        $: {type: {DollarSign}, required: false},
    },
    {timestamps: true}
)

module.exports = mongoose.model('sessions', Session)