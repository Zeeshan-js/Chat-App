import mongoose from "mongoose"

const DB_NAME="MONGO_DATA"

const connectDB = async () => {
    try {
        const dbPort = await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
        console.log("Database is connected !!",dbPort.connection.host)
    } catch (error) {
        console.log("Failed to connect to database :",error)
        process.exit(1)
    }
}

export default connectDB;