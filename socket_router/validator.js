
module.exports.register = (io) => {
    namespace = io.of('/validator')
    browserNamespace = io.of('browser')
    namespace.on("connection",function(socket) {
        socket.on("sync_browser_status", (data) => {
            
            // console.log("browser_loaded", data)
            // .emit("browser_state_changed", data)
        })

    })
}
