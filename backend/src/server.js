import app from "./app.js"
import { Server } from "socket.io"
import { createServer } from "http"
import connectDB from "./db/connectDB.js"
import dotenv from "dotenv"

dotenv.config()

connectDB()

const server = createServer(app)
const io = new Server(server)

io.on("connection", (socket) => {
  console.log("a user is connected")
})


server.listen(3000, () => {
  console.log("server is listening on 3000")
})