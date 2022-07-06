
const moment = require('moment')

const {Instance, Routine, Account} =  require('./../DB')

let ROUTINE_POOL = []
let HANDLED_POOL = []
let DONE_POOL = []
let cron = require('node-cron');
const RESET_HOUR = 11
cron.schedule(`00 00 ${RESET_HOUR} * * 0-6` , async() => {
    console.log("TRIGERRED")
    await  create_new_day_log()
    setTimeout(async() => {
        DONE_POOL
    }, 5000)

});

async function fetch_routine(){
    let routine_pool = await Routine.find()
    // console.log(routine_pool)
    if (routine_pool){
       
        routine_pool = routine_pool.map(rp => {
            rp.routine = rp.routine.filter((rr) =>  { 
                console.log("RPPP" ,  moment(rp.date).format("YYYY-MM-DD").toString() , moment().format("YYYY-MM-DD").toString() , moment(rp.date).format("YYYY-MM-DD").toString() == moment().format("YYYY-MM-DD").toString())
                return moment(rr.date).format("YYYY-MM-DD").toString() == moment().format("YYYY-MM-DD").toString()
            }
            )
            return rp
        })
    }
    ROUTINE_POOL.push(routine_pool)
    return routine_pool  
}


async function create_new_day_log(){
    let accounts = await Account.find()
    accounts.forEach(async account => {
        let mapped_routine = account.routine.map(ar => ({name : ar}) )
        await Routine.findOneAndUpdate({
            account,
            'routine.date': { $ne : moment().format("YYYY-MM-DD")}

        }, {
            "$push" : {
                'routine' : {
                    date: moment().format("YYYY-MM-DD"),
                    log: mapped_routine
                }
            }
        })
    })
}


function attach(handle, collection = HANDLED_POOL){
    collection.push(handle)
    console.log(handle)
    return handle

}

function detach(handle, collection = HANDLED_POOL){ 
    collection.splice(collection.indexOf(handle), 1)
}

function is_it_already_reset(handle){
    let finish_record = moment(handle.finish_at);
    let current_time = moment()
 
    next_this_activity_reset =  moment(finish_record).add("1", "days").set({
        hour: RESET_HOUR, 
        minute: 0,
        second:0
    });

    is_alread_reset = current_time.diff(reset) >= 0
    if(is_alread_reset){
        detach(handle,  DONE_POOL)
            //console.log("ALready reset");
    }

    return  is_alread_reset
    
    
    
}


module.exports.register = async({io, state}) => {
    namespace = io.of('/pool')
    if(!ROUTINE_POOL.length) fetch_routine()
    namespace.on("connection", async socket =>  {
        socket.on("request_job", (profile_number, callback)  => {
            let job
            for (const [i, rp] of ROUTINE_POOL) {
                hndl =  HANDLED_POOL.find(hp => hp.account == rp.account)
                dhndl =  DONE_POOL.find(dp => dp.account == rp.account)
                if(hndl){
                    if(!hnd_pool.browser.status) detach(hndl)
                }
                else {
                    function add_job(){
                        return attach({
                            ...rp,
                            browser: {
                                status: true,
                                profile_number
                            }
                        })
                    }
                    if(!dhndl){
                        job = add_job()
                        break 
                    }else if(is_it_already_reset(dhndl)){
                        job = add_job()
                        break 
                    }   
                
                }
            }
        })

        socket.on("finish_job",  (handle, callback) => {
            detach(handle)
            attach({
                ...handle,
                finish_at : Date.now()
            }, DONE_POOL)
        })

        socket.on("sync_pool", callback => {
            callback({ROUTINE_POOL, HANDLED_POOL, DONE_POOL})
        })
    })
}
