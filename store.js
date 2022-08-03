const { Account, Routine, Product } = require('./db')
const moment = require('moment-timezone');
const { findIndex } = require('./helper');
const DEFAULT_NODE = {
    state: false,
    account: null,
    active_routine: null,
    active_index: 0,

}

const MAINTENANCE_HOUR = 15
const MAINTENANCE_END = 19
const MAINTENANCE_DAY = "Thursday"



module.exports.Store = class Store{
    state =  {  
        maintenance: this.is_maintenance(),
        accounts: [],
        account_routines: {},
        nodes: {
            1: DEFAULT_NODE,
            2: DEFAULT_NODE,
            3: DEFAULT_NODE,
            4: DEFAULT_NODE,
            5: DEFAULT_NODE,
        },
        routines: [],
        on_hold_character: [], //by character, added when retrying login and stuck
        online_character: [], // added when character logged in
        stuck_character: [], // added when character stucked
        done_character: ["aabbcc"],

        //WILL BE RESET EVERY SERVER RESET
        socket_nodes:  {},
        
        client: null,
       

        //EMITER
       
    }
    
    serialize( state  = this.state){
        let data = Object.assign({} , state)
        let excluded =  ['client' , 'socket_nodes']
        excluded.forEach((v) => {
            delete data[v]
        })
        return data 
    }

    sync_to_web(state = this.state){
        if( store.state.client)  store.state.client.emit("sync", store.serialize())
    }

    undone_routine(account, state = this.state){
        let character_index = findIndex(state.accounts, 'character', account.character)
        if (character_index > -1 ) {
            let character_log = state.accounts[character_index].done
            let routines_list =  state.routines.map(r => r.class_name)

            let undone = account.routines.filter(cr => !character_log.includes(cr))
            // console.log(account, account.routines, character_log, undone )

            //ONLY RETURN EXIST ROUTINE && UNDONE
            return undone
        }
        return []
    }



    get_available_character( state  = this.state ){

        let is_related_same_server_on = (account) => {
            let ret = false
            account.relation_character.forEach((character, i) => {
                if (check_in_account_bucket(character)) { 
                    ret =  true
                }
            })
            return ret
        }
    
        let  check_in_account_bucket = (character ) => {
            return (
                state.on_hold_character.includes(character) ||
                state.online_character.includes(character) ||
                state.stuck_character.includes(character) ||
                state.done_character.includes(character) 
            )
        }
    
        let undone = (character) => this.undone_routine(character)
        // console.log("get_available_character", state.on_hold_character)
        let available_account = Object.assign({}, state.accounts.find((v, i) => 
            !check_in_account_bucket(v.character) && 
            !is_related_same_server_on(v) &&
            undone(v).length
        ))
        
        // console.log(state.accounts)

        if (typeof available_account !== "undefined") {
            state.on_hold_character.push(available_account.character)
            // console.log("character", available_account)
            // console.log("character", available_account.character)
            // console.log("routines", available_account.routines)
            available_account.routines = available_account.routines.map(r => state.routines.find(rr => rr.class_name == r)).filter(r => !!r)
            available_account.need_changeline = moment(available_account.last_login).tz("Asia/Jakarta").diff(moment(), "hours") >= 1
        } 

        return available_account
        
    }

    release_character(node_number, character, state  = this.state ){
        let account_index = state.on_hold_character.indexOf(character)
        if (account_index > - 1)  state.on_hold_character.splice(account_index, 1)
        let online_index = state.online_character.indexOf(character)
        if (online_index > - 1)  state.online_character.splice(online_index, 1)
        console.log("Release" , account_index, online_index)
    }

    is_maintenance(){
        let date =  new Date()
        let hour = date.getHours()
        return  ( 
            date.toLocaleString('en-us', {weekday: 'long'}) == MAINTENANCE_DAY &&
            ( hour  >= MAINTENANCE_HOUR  && hour <= MAINTENANCE_END) 
        )
    }

    on_character_done(node_number, character,state  = this.state ){
        this.release_character(node_number, character)
        if (!state.done_character.includes(character))  state.done_character.push(character)

    }

    on_character_logged_in(node_number, character,state  = this.state ){
        this.release_character(node_number, character)
        if (!state.online_character.includes(character))   { 
            state.online_character.push(character)
            state.nodes[node_number].account = state.accounts.find(a => a.character == character)

            let last_login = new Date()
            let account = state.accounts[findIndex(state.accounts, 'character', character)]
            account.last_login = last_login
            Account.updateOne({character}, {
                $set : {
                    last_login
                }
            })
            

        }
    }

    on_character_request(node_number, character,state  = this.state){  }
    on_character_load_failed(node_number, character, state  = this.state){
        this.release_character(node_number, character)
    }

    on_character_stuck(node_number, character, state  = this.state ){
        this.release_character(node_number , character)
        if (!state.stuck_character.includes(character))  state.stuck_character.push(character)
        this.sync_to_web()
        //WILL BE RELEASED IN 5 MIN 
        setTimeout(() => {
            let account_index = state.stuck_character.indexOf(character)
            if (account_index > - 1)  state.stuck_character.splice(account_index, 1)
        }, 300000)  
    }

    on_character_disconnected(node_number, character, state  = this.state ){
        this.release_character(node_number, character)
        this.sync_to_web()
    }

    set_maintenance( state  = this.state){
        state.maintenance = true
        state.on_hold_character = []
        state.online_character = []
        state.stuck_character = []
        let exist_socket_node = Object.values(state.socket_nodes).filter(s => !!s)

        // console.log(exist_socket_node)
        exist_socket_node.forEach(
            (socket) => {
                mode ? socket.emit("maintenance_start") : socket.emit("maintenance_end")
            }
        )
        this.sync_to_web()
    }

    check_maintenance(state  = this.state){
        let exist_socket_node = Object.values(state.socket_nodes).filter(s => !!s)
        exist_socket_node.forEach(
            (socket) => {
                socket.emit("check_maintenance") 
            }
        )
        this.sync_to_web()
    }
    
    async init(){
        this.state.accounts =   await Account.find({}).sort({priority: 1}).lean()
        this.state.routines =  (await Routine.find({}).lean()).map(doc => {
            if (doc.routine_type == "Dungeon"){
                doc.require_dk = false
            }
            return doc
        })
        this.state.products = await Product.find().lean()
    }
   
}



// function objectMap(object, mapFn) {
//     return Object.keys(object).reduce(function(result, key) {
//         result[key] = mapFn(object[key])
//         return result
//     }, {})
// }
