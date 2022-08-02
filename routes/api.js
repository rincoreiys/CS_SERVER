const express = require("express");
const catchAsync = require("../utils/catchAsync");
const router = express.Router();
const { Account_Routine, Account, Product } = require("./../db");
const { currentDate, formatYMD, generate_daily_log } = require("./../helper");
const findIndexByKey = (collection, key, value) =>
  collection.indexOf(collection.find((c) => c[key] == value));

const moment = require('moment-timezone')

async function tryCatch(proc, onFailed, onDone){

}

router.route("/").get((req, res, next) => {
  res.status(200).send("aa");
});

router
  .route("/product")
  .get((req, res, next) => {
    res.status(200).send("aa");
  })
  .post(
    catchAsync(async (req, res, next) => {
      let dt = req.body;
      let result = await Product.insertMany(dt);
      res.status(200).send(result);
    })
  );


router
  .route("/account/reset_routine")
  .patch(
    catchAsync(async (req, res, next) => {
      let result = await Account.updateMany({}, {
        $set : {
          done: []
        }
      })
      res.status(200).send(result);
    })
  );

router
  .route("/account/test")
  .patch(
    catchAsync(async (req, res, next) => {
      let result = await Account.updateMany({}, {
        $set : {
          last_login: moment().subtract(1, "days").toDate()
        }
      })
      res.status(200).send(result);
    })
  );

  router
  .route("/account/reset_backpack")
  .patch(
    catchAsync(async (req, res, next) => {
      let result = await Account.updateMany({}, {
        $set : {
          "config.has_big_pixie": false
        }
      })
      res.status(200).send(result);
    })
  );


// router
//   .route("/account_routine/:date?/:character?/:routine?")
//   .get(
//     catchAsync(async (req, res, next) => {
//       let date = formatYMD(req.params.date) || currentDate();
//       let result = await Account_Routine.find({ date });
//       res.status(200).send(result);
//     })
//   )
//   .post(
//     catchAsync(async (req, res, next) => {
//       let date =  req.params.date ? formatYMD(req.params.date) : currentDate()
//       let result = await generate_daily_log(date);
//       res.status(200).send(result);
//     })
//   )
//   .patch(
//     catchAsync(async (req, res, next) => {
      
//       let date = formatYMD(req.params.date) || currentDate()
//       let character = req.params.character || null
//       let routine = req.params.routine || null
//       console.log("account.log", findIndexByKey(state.account_routines.logs, 'character', character))
//       if (!!character && !!routine){
//         let result = await Account_Routine.updateMany(
//           { date, "logs.character" : character },
//           {
//             $addToSet: {
//               "logs.$.done": routine,
//             },
//           },
//           {
//             new: true
//           }
//         )
//         res.send(result)

//       } 
//       res.status(500).send("No Action Performed")
//     })
//   )

router.route("/account/reorder").patch(
  catchAsync(async (req, res, next) => {
    console.log("reordering");
    let accounts = req.body;
    let changes = accounts.filter(
      (a, index) => a.character !== store.state.accounts[index].character
    );

    // //UPDATING DB, THEN LOCAL
    const batch_query = () => {
      jobQueries = [];

      accounts.forEach((a, index) => {
        if (changes.find((c) => a._id == c._id)) {
          // console.log(a.character, "changed index");
          jobQueries.push(
            Account.findByIdAndUpdate(a._id, { $set: { priority: index } })
          );
        }
      });
      return Promise.all(jobQueries);
    };

    await batch_query();
    store.state.accounts = await Account.find().sort({ priority: 1 }).lean();
    // console.log(changes)
    console.log(
      "done reordering",
      store.state.accounts.map((a) => a.character)
    );
    res.status(200).send(store.state.accounts);
  })
);

router.route("/account/:id").patch(
  catchAsync(async (req, res, next) => {
    let dt = req.body;
    console.log("character update", dt);
    let result = await Account.findByIdAndUpdate(req.params.id, dt, {
      new: true,
    }).lean();
    let index = findIndexByKey(state.accounts, "_id", req.params.id);
    if (index > -1) state.accounts[index] = result;
    res.status(200).send(result);
  })
);

router.route("/account/").get(
  catchAsync(async (req, res, next) => {
    let result = await Account.find()
    // let index = findIndexByKey(state.accounts, "_id", req.params.id);
    // if (index > -1) state.accounts[index] = result;
    res.status(200).send(result);
  })
);
module.exports = router;

// const { Account, Routine, Account_Routine } = require("./db");
// const {generate_daily_log, isExist, currentDate, formatYMD} = require('./helper')
// const catchAsync = require("./utils/catchAsync");

// module.exports.register = (router) => {
//   router.route("/account").get(async (req, res, next) => {
//     res.json(await Account.find());
//   });
//   router.post("/account", async (req, res, next) => {
//     try{
//         let dt = req.body;
//         dt = dt.map((v, i) => {
//             delete v._id
//             delete v.created_at

//             v.priority =  i
//             return v
//          })
//         let result = await Account.insertMany(dt);
//         state.accounts =  collect(await Account.find({}).sort({priority: 1})).mapWithKeys(account => [account.id, account]).all()
//         res.json(result);
//     }catch(e){
//         console.log(e)
//         res.status(500).send("Internal Error")
//     }

//   });
//   router.delete("/account/:id", async (req, res, next) => {
//     try{
//         let dt = req.body;
//         let result = await Account.findByIdAndDelete(req.params.id ,dt)

//         delete state.accounts[req.params.id]
//         res.status(200).send(result);
//     }catch(e){
//         console.log(e)
//         res.status(500).send("Internal Error")
//     }

//   });
//   router.route("/routine").get(async (req, res, next) => {
//     res.json(await Routine.find());
//   });
//   router.post("/routine", async (req, res, next) => {
//     try{
//         let dt = req.body;
//         let result = await Routine.insertMany(dt);
//         res.json(result);
//     }catch(e){
//         res.status(500).send(`Internal Error`)
//     }

//   });

//   return router;
// };
