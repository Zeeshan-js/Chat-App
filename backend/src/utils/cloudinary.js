import { v2 as cloudinary } from "cloudinary"
import fs from "fs"

    // Configuration
    cloudinary.config({ 
        cloud_name: process.env.CLOUDINARY_NAME, 
        api_key: process.env.CLOUDINARY_API_KEY, 
        api_secret: process.env.CLOUDINARY_API_SECRET
    });
    
    // Upload an image
    const cloudinaryUpload = async (filePath) => {
        // Check for file Path
        if (!filePath) return null
        
        try {
            // Upload it on cloudinary
            const upload = await cloudinary.uploader.upload(filePath, { resource_type: "auto" })
            console.log(filePath)
            
            // After uploading remove from local storage
            fs.unlinkSync(filePath)
            return upload   
        } catch (error) {
            fs.unlinkSync(filePath)
            return null
        }
    }

    export { cloudinaryUpload };
