// These are some functions to help us with our projects
import fs from "fs"


// returns the file's static path from where the server is serving the static image
export const getStaticFilePath = (req, filename) => {
    return `${req}://${req.get("host")}/images/${filename}`
}

 
// returns the file local path in the file system to assists the future removal
export const getLocalPath = (fileName) => {
    return `public/images/${fileName}`
}


// this function removes the local files from file system

export const removeLocalFile = async (localFile) => {
    fs.unlink(localFile, (err) => {
        if (err) {
            console.log("Error while removing file", err)
        } else {
            console.log("Local file removed", localFile)
        }
    })
}