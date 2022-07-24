const mongoose  = require("mongoose")

const scm =  {
    email: {
        required:true,
        type: String
    },
    password: {
        required:true,
        type: String,
    },
    character:{
        type: String
    },
    phone_number:{
        type: String
    }
}

const schema = new mongoose.Schema(scm, {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } ,
    toJSON : { virtuals: true},
    toObject : { virtuals: true}
})


schema.index({email: 1}, {unique:true})
// schema.pre('save', function(next){
//    this.total = this.price * this.qty
//    next()
// })
const Customers = mongoose.model('customer', schema)
module.exports = Customers
