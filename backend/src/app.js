import express from "express"
import cors from "cors"



const app = express()

app.use(express.json({ limit: "16kb" }))
app.use(cors({ credentials: true, origin: process.env.CORS_ORIGIN}))

  app.get("/api/v1/user", (req, res) => {
    res.send("This is working")
  })

export default app;