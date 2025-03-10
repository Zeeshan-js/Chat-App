import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"



const app = express()

app.use(cors({
  origin: process.env.CORS_ORIGIN,
  credentials: true  
}))
app.use(express.urlencoded({ limit: "16kb", extended: true}))
app.use(express.json({ limit: "16kb" }))
app.use(express.static("public"))
app.use(cookieParser())


  app.get("/api/v1/", (req, res) => {
    res.send("This is working")
  })


// import all the Routes here
import userRoute from "./routes/user.routes.js"
import chatRoute from "./routes/chat.routes.js"
import messageRoute from "./routes/message.routes.js"

  app.use("/api/v1/user", userRoute)
  app.use("/api/v1/chat-app/chats", chatRoute)
  app.use("/api/v1/chat-app/messages", messageRoute)

export default app;