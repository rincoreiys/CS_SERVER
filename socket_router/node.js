const { Account_Routine, Account } = require("../db")
const { findIndex } = require("../helper")
const { RESET_HOUR } = require('./../cron')
const  moment = require('moment-timezone')
namespace = io.of('/node')
// const only = (obj, keys) => collect(obj).only(keys).all()
let pending_job = []

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
                
            if (!["logged_in"].includes(v))  { 
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



    socket.on("on_character_routine_done", async({response, character, routine}) => {
        // console.log(response)
        // console.log("account.log", findIndex(state.account_routines.logs, 'character', character))
        let character_index = findIndex(state.accounts, "character", character)
        // console.log("index", character_index)
        if(character_index > -1){
            console.log("include", !state.accounts[character_index].done.includes(routine))
            if(!state.accounts[character_index].done.includes(routine)){
                let date = new Date()
                let hour = date.getHours()
                //IF BELOW RESET HOUR USE PREVIOUS DAY, else already reset use today
                let dateString =  hour>= RESET_HOUR ? moment(date).format("YYYY-MM-DD") : moment(date).subtract(1, "days").format("YYYY-MM-DD")
                
                await Account.updateOne(
                {  "character" : character },
                {
                    $addToSet: {
                        "done": routine,
                    },
                }
                ).then(() => {
                    state.accounts[character_index].done.push(routine)
                    store.sync_to_web()
                })
            } 
        }
   
    })

    socket.on("on_sync_done_routines", async({character, done}) => {
        // console.log(response)
        // console.log("account.log", findIndex(state.account_routines.logs, 'character', character))
        let character_index = findIndex(state.accounts, "character", character)
        // console.log("index", character_index)
        if(character_index > -1){
            await Account.updateOne(
            {  "character" : character },
            {
                $addToSet: {
                    "done": done,
                },
            }
            ).then(() => {
                let done_routine =  state.accounts[character_index].done
                state.accounts[character_index].done = [...done_routine,  ...(done.filter(d => !done_routine.find(dr => d == dr)))]
                store.sync_to_web()
            })
        }
    })

    socket.on("set_character_bag_state", async({character, bag_state}) => {
        let character_index = findIndex(state.accounts, "character". character)
        await Account.updateOne({character}, {
            $set : {
                "state.bag_already_empty_before" : bag_state
            }
        }).then(() => { }).finally(() => {
            state.accounts[character_index].state.bag_already_empty_before = bag_state
            store.sync_to_web()
        })

    })

    socket.on("on_routine_index_changed", ({response, routine, node_number, routine_index } ) =>{
        if (state.client){
            state.nodes[node_number].active_index = routine_index
            state.nodes[node_number].active_routine = routine
            state.client.emit("sync",  store.serialize())
        }
    })

    socket.on("on_character_needs_sync", async({response, character, needs, state}) => {
        let character_index = findIndex(state.account_routines.logs, "character", character)
        // console.log("index", character_index)
        if(character_index > -1){
            console.log("include",!state.accounts[character_index].needs.includes("DK"))
            if(!state.accounts[character_index].needs.includes("DK")){
                await Account.updateOne(
                { "character" : character },
                {
                    [state ? "$addToSet": "$pull"] : {
                        "needs": needs,
                    },
                }
                ).then((data) => {
                    console.log(data)
                    state.accounts[character_index].needs.push("DK")
                }).catch(ex => {
                    console.log(ex)
                })
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


