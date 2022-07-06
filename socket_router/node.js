namespace = io.of('/node')
// const only = (obj, keys) => collect(obj).only(keys).all()
namespace.on("connection",  async(socket) =>  {
    let  node_number = socket.handshake.query.number
    state.socket_nodes[node_number]  =  socket
    const sync_nodes = () => {
        try{
            // console.log(state.nodes)
            // console.log("sync to client",  only(Object.values(state.nodes), ["hwnd", "character"]))
            state.client.emit("sync", state.nodes)
        }catch(e){
            console.log("Web client not connected")
        }
    }
    const only = (obj, keys =[]) => {
        keys.forEach(k => {delete obj[k]})

    }
    // console.log(`Node number ${node_number} connected`)

    //DYNAMIC CHRACTER EVENT LISTENER
    ["logged_in", "stuck", "disconnected"].forEach((v) => {
        socket.on(`on_character_${v}`, ({response, character}) => {
             
            console.log(response)
            //DETERMINE NEXT ACTION
            switch(store[`on_character_${v}`](character)) {
                case "relog": socket.emit("handle_character", character) 
                    break;
                case "switch": socket.emit("handle_character", store.get_available_character())
                    break;
                default:
              }
        })
    })

    //FIRST CHARACTER REQUEST
    // socket.emit("handle_character", store.get_available_character())

    socket.on("disconnect", data => {
        delete state.nodes[node_number]
        console.log(`Node number ${node_number} disconnected`)
        sync_nodes()
    })
    
    socket.on("sync", (node) => {
        console.log(node)
        state.nodes[node_number] = node
        sync_nodes()
        
    })      
})



// await sio.emit('on_logged_in', data={"response" : f"Character ${character['chracter']} is online", "character": character},  namespace="/node" )
// await self.instance.run(character["routines"])
// Thread(target=detect_error, daemon=True).start()

// except TimeoutException as te:
// await sio.emit('on_load_failed', data={"response" : f"Character ${character['chracter']} failed to loaded, posibility your internet too slow"},  namespace="/node" )

// except LoginStuckException as le: 
// await sio.emit('on_character_stuck', data={"response" : f"Character ${character['chracter']} stuck online, wait for 15 min or so"},  namespace="/node" )

// except DisconnectException as de:
// await sio.emit('on_character_disconnected', data={"response" : f"Character ${character['chracter']} disconnected, retrying login"},  namespace="/node" )
