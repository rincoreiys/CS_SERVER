const express = require('express')
const fs = require("fs")
const http = require('http')
const path = require("path")
const cors = require('cors')
const collect =  require('collect.js')
const err = require('./utils/appError')
const app = express()

const {JSONFileSync, Low}= require("lowdb-cjs")

app.use(cors())
app.use(express.urlencoded({ extended: false })) //POST Body Purpose
app.use(express.json({limit: '1000kb'}))

const server = http.createServer(app)
const { Server } = require("socket.io");
const store =  new (require('./store')).Store()

const io =  new Server(server, {
  cors: {
      origin: "*",
      methods: ["GET", "POST"],
      allowedHeaders: ["my-custom-header"],
      credentials: true
    }
});

global.store = store
global.collect = collect
global.state = store.state
global.io = io

const api =  require('./routes/api')
//Routes middleware
app.use('/api', api)
app.use(err.internalError)
//START SERVER AFTER DATA INITIALIZE
store.init().then( () => {
  //DYNAMIC IMPORT
  console.log("before reset", state.done_character)
  normalizedPath = path.join(__dirname, "socket_router")
  fs.readdirSync(normalizedPath).forEach((file)  => {
    require(path.join(normalizedPath, file))
  })

  require("./cron")
})


console.log("SERVER UP")
server.listen(3000)
