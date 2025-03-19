import { httpServer } from "./app.js"
import connectDB from "./db/connectDB.js"
import dotenv from "dotenv"

dotenv.config()

connectDB()

const port = process.env.PORT || 3000

httpServer.listen(port, () => {
  console.log(`Server is listening on ${port}`)
})
