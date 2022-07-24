const { Account, Routine, Account_Routine } = require("./db");
const {generate_daily_log, isExist, currentDate, formatYMD} = require('./helper')
const catchAsync = require("./utils/catchAsync");


module.exports.register = (router) => {
  router.route("/account").get(async (req, res, next) => {
    res.json(await Account.find());
  });
  router.post("/account", async (req, res, next) => {
    try{
        let dt = req.body;
        dt = dt.map((v, i) => {
            delete v._id
            delete v.created_at

            v.priority =  i
            return v
         })
        let result = await Account.insertMany(dt);
        state.accounts =  collect(await Account.find({}).sort({priority: 1})).mapWithKeys(account => [account.id, account]).all()
        res.json(result);
    }catch(e){
        console.log(e)
        res.status(500).send("Internal Error")
    }
  
  });
  router.patch("/account/:id", async (req, res, next) => {
    try{
        let dt = req.body;
        let result = await Account.findByIdAndUpdate(req.params.id ,dt, {new: true})
        state.accounts[req.params.id] = result
        res.status(200).send(result);
    }catch(e){
        console.log(e)
        res.status(500).send("Internal Error")
    }
  
  });
  router.delete("/account/:id", async (req, res, next) => {
    try{
        let dt = req.body;
        let result = await Account.findByIdAndDelete(req.params.id ,dt)
        
        delete state.accounts[req.params.id]
        res.status(200).send(result);
    }catch(e){
        console.log(e)
        res.status(500).send("Internal Error")
    }
  
  });
  router.route("/routine").get(async (req, res, next) => {
    res.json(await Routine.find());
  });
  router.post("/routine", async (req, res, next) => {
    try{
        let dt = req.body;
        let result = await Routine.insertMany(dt);
        res.json(result);
    }catch(e){
        res.status(500).send(`Internal Error`)
    }
    
  });

  return router;
};
