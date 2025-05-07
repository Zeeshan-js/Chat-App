

export function Typing () {

    return(
        <div className="inline-flex items-center w-fit gap-1 bg-gray-600 rounded-3xl p-2">
            <span className=" animate-bounce h-3 w-3 rounded-full bg-white" style={{ animationDelay: "0s"}}></span>
            <span className=" animate-bounce h-3 w-3 rounded-full bg-white" style={{ animationDelay: "0.3s"}}></span>
            <span className="animate-bounce h-3 w-3 rounded-full bg-white" style={{ animationDelay: "0.5s"}}></span>
        </div>
        
    )
}