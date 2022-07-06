const express = require('express')
const [fs, http, path,  app, cors, collect]  = [require("fs"), require('http'),  require("path"),  express(),  require('cors'), require('collect.js')]

app.use(cors())
app.use(express.urlencoded({ extended: false })) //POST Body Purpose
app.use(express.json({limit: '100kb'}))
const server = http.createServer(app)
const router = require('./router').register(app)
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

//DYNAMIC IMPORT
normalizedPath = path.join(__dirname, "socket_router")
fs.readdirSync(normalizedPath).forEach((file)  => {
  require(path.join(normalizedPath, file))
})



//START SERVER AFTER DATA INITIALIZE
store.init().then(() => {
  console.log("SERVER UP")
  server.listen(3000)
})
