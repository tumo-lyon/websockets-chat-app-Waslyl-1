import express from "express"
import { createServer } from "node:http"
import { Server as SocketServer} from "socket.io";
const app = express()
const server = createServer(app);
const io = new SocketServer(server)
const port = 3000;

app.use(express.static("public"));

app.get("/", (req, res) => {
    res.redirect("/index.html")
});

const PORT = process.env.PORT || port;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

const typingUsers = new Set();
io.on('connection', (socket) => { // <-- Quand un client se CONNECTE   
	console.log('New connection', socket.id);
    
    io.emit("system_message", {
        content: `Welcome ${socket.id}`
    })

    socket.on("typing_start", () => {
        typingUsers.add(socket.id);
        io.emit("typing", Array.from(typingUsers))
    })

    socket.on("typing_stop", () => {
        typingUsers.delete(socket.id);
        io.emit("typing", [])
    })

    socket.on("user_message_send", (data) => {
        for (const [id, sock] of io.sockets.sockets) {
            sock.emit("user_message", {
                author: socket.id,
                content: data.content,
                time: new Date().toLocaleTimeString(),
                isMe: id === socket.id
            })
        }    
    })

	socket.on('disconnect', () => { // <-- Quand un client se DECONNECTE
		console.log('Disconnected', socket.id);

        io.emit("system_message", {
            content: `Bye ${socket.id}`
        })
	});
});