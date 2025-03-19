import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"
import { Server } from "socket.io"
import { createServer } from "http"


const app = express()

const httpServer = createServer(app)

const io = new Server(httpServer, {
  pingTimeout: 60000,
  cors: {
    origin: process.env.CORS_ORIGIN,
    credentials: true
  }
})

app.set("io", io)


app.use(cors({
  origin: process.env.CORS_ORIGIN,
  credentials: true  
}))
app.use(express.urlencoded({ limit: "16kb", extended: true}))
app.use(express.json({ limit: "16kb" }))
app.use(express.static("public"))
app.use(cookieParser())


initializeSocketIo(io)


// import all the Routes here
import userRoute from "./routes/user.routes.js"
import chatRoute from "./routes/chat.routes.js"
import messageRoute from "./routes/message.routes.js"
import { initializeSocketIo } from "./common/index.js"

  app.use("/api/v1/user", userRoute)
  app.use("/api/v1/chat-app/chats", chatRoute)
  app.use("/api/v1/chat-app/messages", messageRoute)

export { httpServer };