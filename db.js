const mongoose = require("mongoose")
const DB = "mongodb://febri7299:rincoreiys123@cluster0-shard-00-00.oillm.mongodb.net:27017,cluster0-shard-00-01.oillm.mongodb.net:27017,cluster0-shard-00-02.oillm.mongodb.net:27017/CS?replicaSet=atlas-i5tsn3-shard-0&ssl=true&authSource=admin"
mongoose.connect(DB, {
    useNewUrlParser : true,
    useUnifiedTopology: true,
    keepAlive: true,
    family: 4, // Use IPv4, skip trying IPv6
})


module.exports.Account =  require('./models/account')
module.exports.Routine = require('./models/routine')
module.exports.Product = require('./models/product')
