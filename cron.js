const RESET_HOUR = 11
const MAINTENANCE_HOUR = 15
const MAINTENANCE_END = 19
const CRON_CONFIG = {
    timezone: "Asia/Jakarta"
} 
const  cron = require('node-cron');
const {Account_Routine, Account} = require('./db')
const {generate_daily_log} = require('./helper')

const moment = require('moment-timezone');

var daily_reset = cron.schedule(`0 0 ${RESET_HOUR} * * *`, async() =>  {
  state.done_character = []
  console.log("after reset", state.done_character)
  await Account.updateMany({}, {
    $set: {
      "done": []
    }
  })

  for (const [key, socket] of Object.entries(state.socket_nodes)) {
    socket.emit("daily_reset")
  }
}, CRON_CONFIG);

var maintenance_start = cron.schedule(`0 0 ${MAINTENANCE_HOUR} * * Thursday`, () =>  {
  console.log("MAINTENANCE")
  store.set_maintenance(true)
}, CRON_CONFIG);


//CHECK MAINTENANCE STATUS EVERY 20 MIN
var check_mt_state = cron.schedule(`0 */20 ${MAINTENANCE_HOUR+1},${MAINTENANCE_HOUR+2},${MAINTENANCE_HOUR+3},${MAINTENANCE_HOUR+4} * * Thursday`, () =>  {
  console.log("CHECK PERIODICALLY MT")
  store.check_maintenance()
}, CRON_CONFIG);


//TEST

module.exports = {
  RESET_HOUR,
  MAINTENANCE_HOUR
}








