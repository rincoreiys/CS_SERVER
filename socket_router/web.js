const { Account } = require("../db")
// const { Store } = require("../store")

const array_to_dictionary = (array, key, exclude = []) =>  Object.assign({}, ...array.map((x) => {
    t = x 
    exclude.forEach(e => {delete t[e]})
    delete t[key]
    return ({ [x[key]] : t })
  })
)

let accounts = []

namespace = io.of("/web")
const { nodes } = state
namespace.on("connection", async (socket) => {
  state.client = socket
  console.log("WEB CLIENT CONNECTED")
  // accounts = array_to_dictionary(await Account.find(), "id", ["_id", "p"])
  // socket.emit("sync", {accounts :  state.accounts, nodes})
  socket.emit("sync", {"routines": state.routines, "accounts": state.accounts})

  socket.on("bind_character", async (node_target, character) => {
    //console.log(node_target, character)
    await state.socket_nodes[node_target].emit("load_character", character, (response) => {
      console.log("FROM LOAD CHARACTER", response)
    })
  })

  socket.on("delegate_routine",async (node_target, routines) => {
    await state.socket_nodes[node_target].emit("delegate_routine", routines, (response) => {
      console.log("FROM LOAD ROUTINE", response)
    })
  })
})
