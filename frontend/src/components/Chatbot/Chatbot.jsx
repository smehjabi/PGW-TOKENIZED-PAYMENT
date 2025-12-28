import React, { useState } from "react";
import { FaCommentDots } from "react-icons/fa";

const Chatbot = () => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");

  const getBotReply = (text) => {
    const message = text.toLowerCase();
    if (message.includes("hi") || message.includes("hello")) {
      return "Hello! 👋 How can I help you today?";
    }
    if (message.includes("menu")) {
      return "You can check our menu at /menu.";
    }
    if (message.includes("order")) {
      return "To place an order, go to your cart and checkout.";
    }
    if (message.includes("thank")) {
      return "You're welcome! 😊";
    }
    return "Sorry, I didn't understand that. Can you rephrase?";
  };

  const sendMessage = () => {
    if (!input) return;

    // Add user message
    setMessages((prev) => [...prev, { from: "user", text: input }]);

    // Bot reply
    setTimeout(() => {
      const reply = getBotReply(input);
      setMessages((prev) => [...prev, { from: "bot", text: reply }]);
    }, 500);

    setInput("");
  };

  return (
    <div style={{ position: "fixed", bottom: 20, right: 20, zIndex: 1000 }}>
      {open && (
        <div className="bg-white shadow-lg rounded-lg flex flex-col p-4 w-80">
          <div className="flex-1 mb-2 max-h-64 overflow-y-auto">
            {messages.map((msg, i) => (
              <div key={i} className={msg.from === "user" ? "text-right" : "text-left"}>
                <span
                  className={`inline-block px-3 py-1 rounded-lg ${
                    msg.from === "user" ? "bg-red-500 text-white" : "bg-gray-200 text-gray-800"
                  }`}
                >
                  {msg.text}
                </span>
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="flex-1 border rounded px-2 py-1"
              placeholder="Type a message..."
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            />
            <button
              onClick={sendMessage}
              className="bg-red-600 text-white px-3 py-1 rounded"
            >
              Send
            </button>
          </div>
        </div>
      )}

      <button
        onClick={() => setOpen(!open)}
        className="bg-red-600 text-white p-3 rounded-full shadow-lg flex items-center justify-center hover:bg-red-700 transition"
      >
        <FaCommentDots size={20} />
      </button>
    </div>
  );
};

export default Chatbot;
