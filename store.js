const { Account, Routine } = require('./db')
const { createClient } = require("redis")
const client = createClient({
  url: 'redis://127.0.0.1:6379'
});

const DEFAULT_NODE = {
    hwnd: 0,
    character: null
}

module.exports.Store = class Store{
    state =  {  
        accounts: [],
        nodes: {
            1: DEFAULT_NODE,
            2: DEFAULT_NODE,
            3: DEFAULT_NODE,
        },
        routines: [],
        on_hold_character: [], //by character, added when retrying login and stuck
        online_character: [], // added when character logged in
        stuck_character: [], // added when character stucked

        //WILL BE RESET EVERY SERVER RESET
        done_character: [],

        //EMITER
        socket_nodes: {},
        client: {}
    }
    

    get_available_character( state  = this.state ){
        console.log("get_available_character", state.on_hold_character)
        let available_account = state.accounts.find((v, i) => 
            !state.on_hold_character.includes(v.character) &&
            !state.online_character.includes(v.character) &&
            !state.stuck_character.includes(v.character) &&
            !state.done_character.includes(v.character)
        )
        console.log("available_account", available_account)
        if (typeof available_account !== "undefined") {
            state.on_hold_character.push(available_account.account)
            // print( this.on_hold_character)
        } 
        return available_account
    }

    release_character(character){
        let account_index = on_hold_character.indexOf(character)
        if (account_index > - 1) delete on_hold_character[account_index]
    }

    on_character_done(character,state  = this.state ){
        if (!state.done_character.includes(character))  state.done_character.push(character)
        this.release_character(character)
    }

    on_logged_in(character,state  = this.state ){
        if (!state.online_character.includes(character))  state.online_character.push(character)
    }

    on_character_stuck(character,state  = this.state ){
        
    }
    
    async init(){
        this.state.accounts =   collect(await Account.find({}).sort({priority: 1})).mapWithKeys(account => [account.id, account]).all()
        this.state.routines =  (await Routine.find({}).lean()).map(doc => {
            if (doc.routine_type == "Dungeon"){
                doc.require_dk = false
            }
            return doc

        })

        
        //  .map(r => {
           
        //     return r
        // })
        // console.log(this.state.account)
    }
    async save(){
        await client.set("cs_web", this.state)
    }
}


// function objectMap(object, mapFn) {
//     return Object.keys(object).reduce(function(result, key) {
//         result[key] = mapFn(object[key])
//         return result
//     }, {})
// }
