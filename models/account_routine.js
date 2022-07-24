const mongoose  = require("mongoose")

const scm =  {
    date: Date,
    logs: [{
        character: {
            type: String
        },
        done: [String],
        overall_done:{
            type: Boolean,
            default: false
        }
    }]
}

const schema = new mongoose.Schema(scm, {
    toJSON : { virtuals: true},
    toObject : { virtuals: true}
})


schema.index({date:1}, {unique:true})

const Account_Routines = mongoose.model('account_routine', schema)
module.exports = Account_Routines
