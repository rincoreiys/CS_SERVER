const mongoose  = require("mongoose")
const scm =  {
    class_name: {
        type:String
    },
    routine_type: {
        type: String,
        default: "Dungeon",
    },
    subroutine:{
        type: Object,
        default: null
    },
    scroll_index:{
        type:Number,
        default: 0
    }
   
}

const schema = new mongoose.Schema(scm)

schema.index({class_name: 1, routine_type: 1}, {unique:true})

// schema.pre('save', function(next){
//    this.total = this.price * this.qty
//    next()
// })
const Routines = mongoose.model('routine', schema)
module.exports = Routines
