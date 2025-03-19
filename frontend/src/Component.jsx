import { useEffect, useState } from "react";
import { Menu, Search } from "lucide-react";
import axios from "axios";
import Chat from "./Chat.jsx"


function Component() {

  



  return (
    <div className="h-screen flex items-center justify-center bg-[#222831]">
      <div className="border h-9/12 w-8/12 rounded-3xl bg-[#393E46]">
      <Chat />
      </div>
    </div>
  );
}

export default Component;
