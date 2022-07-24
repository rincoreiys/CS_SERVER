const { Account } = require("../db")
const { Store } = require("../store")
// const { Store } = require("../store")

// const array_to_dictionary = (array, key, exclude = []) =>  Object.assign({}, ...array.map((x) => {
//     t = x 
//     exclude.forEach(e => {delete t[e]})
//     delete t[key]
//     return ({ [x[key]] : t })
//   })
// )

namespace = io.of("/web")
namespace.on("connection", async (socket) => {
  state.client = socket
  console.log("WEB CLIENT CONNECTED")
  // accounts = array_to_dictionary(await Account.find(), "id", ["_id", "p"])
  // socket.emit("sync", {accounts :  state.accounts, nodes})
  socket.emit("sync", store.serialize())

  socket.on("sync", () => {
    socket.emit("sync", store.serialize())
  })

  socket.on("disconnect", () => { 
    state.client = null
  })
  
  socket.on("set_maintenance",  (state) => {
    store["set_maintenance"](state)
  })
})
