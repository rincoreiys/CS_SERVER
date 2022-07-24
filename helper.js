const {Account, Account_Routine} = require("./db")
const moment = require('moment-timezone');
const catchAsync = require("./utils/catchAsync");
const options = { upsert: true, new: true, setDefaultsOnInsert: true };




class Model{
    constructor(model) {
        this.model = model
    }
    async createIfNotExist(query, doc){
        let exist = await this.model.findOne(query).lean()
 
        if(!exist){
            exist =   await this.model.create(doc)
        }
        return exist
    }
}

class appError extends Error {
    constructor(message, statusCode, res = null){
        super(message)
        this.statusCode = statusCode
        this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error'
        this.isOperational  = true
    }
}


async function isExist(e) {
   return  typeof e !== "undefined" && typeof e !== "null"
}

function findIndex(collection, key, value){
    let item = collection.find(c => c[key] == value)
    let index = collection.indexOf(item)
    return index

}

function currentDate(){
   return  moment(new Date()).tz("Asia/Jakarta").format("YYYY-MM-DD")
}
function formatYMD(date){
   return  moment(new Date(date)).tz("Asia/Jakarta").format("YYYY-MM-DD")
}

async function  generate_daily_log(dateString)  {
    let logs =   store.state.accounts.map(({character}) => ({character}))
    let date =  moment(new Date(dateString)).format("YYYY-MM-DD") 

    // let dt = 
    let account_routine = new Model(Account_Routine)
    let result = await account_routine.createIfNotExist({date}, {date, logs})
    // console.log(logs)
    // let dt = {
    //     date,
    //     logs
    // }
    // console.log(dt)

    // let result = await Account_Routine.create(dt)
    await alter_previous_daily_log(dateString)
    return result
}

async function  alter_previous_daily_log(dateString)  {
    await Account_Routine.deleteMany(
        {
            date: {
                $lt:  moment(new Date(dateString)).format("YYYY-MM-DD") 
            }
        }
    )
}


module.exports = {
    generate_daily_log, alter_previous_daily_log,
    isExist,
    currentDate,
    formatYMD,
    findIndex
}