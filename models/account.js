const mongoose  = require("mongoose")

const scm =  {
    level: Number,
    account: String,
    password: String,
    character: String,
    server_number: Number,
    server_id : Number,
    priority: Number,
    config: {
        loot_focus: {
            type: String,
            default: "item"
        },
        routine: {
            require_dk: [String],
            skip_enter: [String]
        },
        disable: {
            type: Boolean,
            default: false
        },
        corruption_limit: {
            type: Number,
            default: 0
        }
    },
    needs: [String], //DK, GOLD, Teleport
    routines: [String]
}



const schema = new mongoose.Schema(scm, {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } ,
    toJSON : { virtuals: true},
    toObject : { virtuals: true}
})


schema.index({account: 1, character: 1, server_number:1}, {unique:true})
// schema.pre('save', function(next){
//    this.total = this.price * this.qty
//    next()
// })
const Accounts = mongoose.model('account', schema)
// Accounts.watch().on('change', async(data) => {
//     state.account = await Accounts.find()
// });
module.exports = Accounts
