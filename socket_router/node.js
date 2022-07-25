const { Account_Routine } = require("../db")
const { findIndex } = require("../helper")

namespace = io.of('/node')
// const only = (obj, keys) => collect(obj).only(keys).all()
namespace.on("connection",  async(socket) =>  {
    let node_number =  socket.handshake.query.number
    
    // console.log(state)
    console.log("before node connect", state.nodes)
    state.socket_nodes[node_number]  =  socket
    state.nodes[node_number] = {...state.nodes[node_number], ...{
        state: true
    }}
    console.log(`Node number ${node_number} connected`)
    console.log(state.nodes)
    store.sync_to_web()
    // const sync_nodes = () => {
    //     try{
    //         // console.log(state.nodes)
    //         // console.log("sync to client",  only(Object.values(state.nodes), ["hwnd", "character"]))
    //         state.client.emit("sync", state.nodes)
    //     }catch(e){
    //         console.log("Web client not connected")
    //     }
    // }
    // const only = (obj, keys =[]) => {
    //     keys.forEach(k => {delete obj[k]})

    // }

    //DYNAMIC CHRACTER EVENT LISTENER
    let events =  ["logged_in", "load_failed", "stuck", "disconnected", "request",  "done"]
    events.forEach((v) => {
        socket.on(`on_character_${v}`, ({response, character}) => {  
            console.log(response)
            if(store[`on_character_${v}`]) store[`on_character_${v}`](node_number, character) //ONLY RUN METHOD IF IMPLEMENTED
            
            if (state.maintenace){
                socket.emit("maintenance_start")
                return //DONT CONTINUE REQUEST
            }
                
            if (!["logged_in", "load_failed"].includes(v))  { 
                taken_character =  store.get_available_character()
                if(taken_character){
                    console.log("TRY TO HANDLE", taken_character['character'])
                    socket.emit("handle_character", taken_character)
                }else{
                    console.log("ALL CHARACTER DONE")
                }
               
            }  
            store.sync_to_web()
        })
    })

    socket.on("on_character_routine_done", async(character, routine_name) => {
        let character_index = findIndex(state.account_routines.logs, "character", character)
        if(character_index > -1){
           
            if(!state.account_routines.logs[character_index].done.includes(routine_name)){
                let date = formatYMD(req.params.date) || currentDate()
                let character = req.params.character || null
                let routine = req.params.routine || null
                if (!!character && !!routine){
                  let result = await Account_Routine.updateOne(
                    { date, "logs.character" : character },
                    {
                      $addToSet: {
                        "logs.$.done": routine,
                      },
                    }
                  )
          
                } 
            } 
        }
   
    })



    socket.on("maintenance_done", () => {
        state.maintenace = false
        console.log("maintenance done, logging toon")
        taken_character =  store.get_available_character()
        socket.emit("handle_character", taken_character)
    })

    //FIRST CHARACTER REQUEST
    socket.on("terminate", ({response, character}) => {
        console.log(response)
        store.release_character(node_number, character)
    })
    socket.on("disconnect", () => {
        if (state.nodes[node_number].account) store.release_character(node_number, state.nodes[node_number].account.character)
        state.nodes[node_number].state = false
        state.nodes[node_number].account = null
        console.log(`Node number ${node_number} disconnected`)
        store.sync_to_web()
    })
    
    socket.on("sync", () => {
        store.sync_to_web()
        
    })      
})


