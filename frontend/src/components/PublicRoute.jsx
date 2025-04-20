import { Children } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import { Navigate } from "react-router-dom";


// Define a public route which take in children as its props
const PublicRoute = ({ children }) => {
    
    // extracts both from context
    
    try {
        const { token, user } = useAuth()
    
        // if there is token and userID then we navigate to main page
        if ( token && user._id ) {
            return <Navigate to='/main' replace />
        }
        return children
    } catch (error) {
        console.log(error)
    }
}

export default PublicRoute;