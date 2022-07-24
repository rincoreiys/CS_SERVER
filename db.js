const mongoose = require("mongoose")
const DB = "mongodb+srv://febri7299:rincoreiys123@cluster0.oillm.mongodb.net/CS"
mongoose.connect(DB, {
    useNewUrlParser : true,
    useUnifiedTopology: true,
    keepAlive: true,
    family: 4, // Use IPv4, skip trying IPv6
})


module.exports.Account =  require('./models/account')
module.exports.Routine = require('./models/routine')
module.exports.Account_Routine = require('./models/account_routine')
module.exports.Product = require('./models/product')
