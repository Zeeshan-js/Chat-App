import { httpServer } from "./app.js"
import connectDB from "./db/connectDB.js"
import dotenv from "dotenv"

dotenv.config()

connectDB()

const PORT = process.env.PORT || 3000

httpServer.listen(PORT, () => {
  console.log(`Server is listening on ${PORT}`)
})
