import React, { useState } from "react";

const ChatInput = ({ onSendMessage }) => {
  const [message, setMessage] = useState("");

  const handleSubmit = (message) => {
    if (message !== "") {onSendMessage(message); setMessage("")};
  };

  return (
    <div className="p-4 backdrop-blur-0 flex items-center gap-3 shrink-0">
      <div className="flex items-center gap-3 rounded-full bg-gray-900/50 p-2 border border-gray-700/100 flex-grow">
        <input
          type="text"
          id="chatMSG"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Enter Message"
          className="flex-1 bg-transparent px-4 py-2.5 focus:outline-none text-gray-100 placeholder-gray-300 text-sm "
          onKeyDown={(e)=>{
            if (e.key == "Enter") handleSubmit();
          }}  
        />
      </div>
      <button
        type="submit"
        className="p-2.5 bg-blue-600 hover:bg-blue-700 transition-colors duration-200 rounded-full"
        onClick={handleSubmit}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          class="size-6"
        >
          <path
            fill-rule="evenodd"
            d="M12.97 3.97a.75.75 0 0 1 1.06 0l7.5 7.5a.75.75 0 0 1 0 1.06l-7.5 7.5a.75.75 0 1 1-1.06-1.06l6.22-6.22H3a.75.75 0 0 1 0-1.5h16.19l-6.22-6.22a.75.75 0 0 1 0-1.06Z"
            clip-rule="evenodd"
          />
        </svg>
      </button>
    </div>
  );
};

export default ChatInput;
