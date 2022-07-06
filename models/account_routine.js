const mongoose  = require("mongoose")
const routine_scm =  new mongoose.Schema({
    name: String,
    done: Boolean
})

const scm =  {
    date: Date,
    log: {
        character: {
            type: String,
            required: true
        },
        routines: [
            {   
                name: String,
                done: {
                    type: Date,
                    default: null
                }
            }
        ]
    }
}

const schema = new mongoose.Schema(scm, {
    toJSON : { virtuals: true},
    toObject : { virtuals: true}
})


schema.index({date:1}, {unique:true})

const Account_Routines = mongoose.model('account_routine', schema)
module.exports = Account_Routines
