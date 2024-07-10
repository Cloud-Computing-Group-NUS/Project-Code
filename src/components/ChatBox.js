// import React, { useState, useRef, useEffect } from 'react';
// import { Send } from 'lucide-react';

// const ChatBox = ({ messages, onSendMessage }) => {
//   const [input, setInput] = useState('');
//   const messagesEndRef = useRef(null);

//   const scrollToBottom = () => {
//     messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
//   };

//   useEffect(scrollToBottom, [messages]);

//   const handleSend = () => {
//     if (input.trim()) {
//       onSendMessage(input);
//       setInput('');
//     }
//   };

//   return (
//     <div className="flex flex-col h-full mt-[-28px]"> {/* 添加负的顶部外边距 */}
//       <div className="flex-grow overflow-y-auto p-4 space-y-4">
//         {messages.map((msg, index) => (
//           <div 
//             key={index} 
//             className={`p-2 rounded-lg ${
//               msg.sender === 'user' 
//                 ? 'bg-blue-100 ml-auto text-right' 
//                 : 'bg-gray-100'
//             } max-w-3/4`}
//           >
//             {msg.content}
//           </div>
//         ))}
//         <div ref={messagesEndRef} />
//       </div>
//       <div className="flex p-4 bg-white border-t">
//         <input
//           type="text"
//           className="flex-grow mr-2 p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
//           value={input}
//           onChange={(e) => setInput(e.target.value)}
//           onKeyPress={(e) => e.key === 'Enter' && handleSend()}
//           placeholder="Type your message..."
//         />
//         <button 
//           onClick={handleSend} 
//           className="p-2 bg-blue-500 text-white rounded-md transition duration-300 ease-in-out hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
//         >
//           <Send size={20} />
//         </button>
//       </div>
//     </div>
//   );
// };

// export default ChatBox;

import React, { useState, useRef, useEffect } from 'react';
import { Send } from 'lucide-react';

const ChatBox = ({ messages, onSendMessage }) => {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages]);

  const handleSend = () => {
    if (input.trim()) {
      onSendMessage(input);
      setInput('');
    }
  };

  return (
    <div 
      className="flex flex-col h-full" 
      style={{ 
        width: 'calc(100% * 8 / 9)', 
        marginLeft: 'auto', 
        maxHeight: '500px', 
        height: '260px' // 确保父容器高度固定
      }} 
    >
      <div 
        className="flex-grow overflow-y-auto p-4 space-y-4" 
        style={{ 
          maxHeight: 'calc(50% - 60px)' // 确保内容容器有固定的高度
        }} 
      >
        {messages.map((msg, index) => (
          <div 
            key={index} 
            className={`p-2 rounded-lg ${
              msg.sender === 'user' 
                ? 'bg-blue-100 ml-auto text-right' 
                : 'bg-gray-100'
            }`} 
            style={{ maxWidth: 'calc(75% * 8 / 9)' }}
          >
            {msg.content}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <div className="flex p-4 bg-white border-t" style={{ height: '65px' }}>
        <input
          type="text"
          className="flex-grow mr-2 p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Type your message..."
        />
        <button 
          onClick={handleSend} 
          className="p-2 bg-blue-500 text-white rounded-md transition duration-300 ease-in-out hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
        >
          <Send size={20} />
        </button>
      </div>
    </div>
  );
};

export default ChatBox;
