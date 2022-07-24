const mongoose  = require("mongoose")

const scm =  {
    name: {
        required:true,
        type: String
    },
    desc: String,
    unit: String,
    code:{
        type: String,
        uppercase: true
    },
    price: Number,
    stock:{
        type: Number
    },
    category:{
        type: String
    },
    icon: {
        type: String
    }
}

const schema = new mongoose.Schema(scm, {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } ,
    toJSON : { virtuals: true},
    toObject : { virtuals: true}
})


schema.index({name: 1}, {unique:true})
// schema.pre('save', function(next){
//    this.total = this.price * this.qty
//    next()
// })
const Products = mongoose.model('product', schema)
module.exports = Products
