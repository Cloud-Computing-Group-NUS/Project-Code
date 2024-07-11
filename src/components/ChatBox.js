// import React, { useState, useRef, useEffect } from 'react';
// import { Send } from 'lucide-react';

// const ChatBox = ({ messages, onSendMessage }) => {
//   const [input, setInput] = useState('');
//   const messagesEndRef = useRef(null);

//   const scrollToBottom = () => {
//     messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
//   };

//   useEffect(scrollToBottom, [messages]);

//   const handleSend = async () => {
//     if (input.trim()) {
//       // 发送用户消息
//       onSendMessage({ content: input, sender: 'user' });
      
//       // 模拟 API 调用来获取 AI 响应
//       try {
//         // 这里应该是实际的 API 调用，现在我们只是模拟一个异步操作
//         const aiResponse = await simulateApiCall(input);
        
//         // 发送 AI 响应
//         onSendMessage({ content: aiResponse, sender: 'ai' });
//       } catch (error) {
//         console.error('Error getting AI response:', error);
//         // 可以在这里添加错误处理，比如向用户显示一条错误消息
//       }

//       setInput('');
//     }
//   };

//   // 模拟 API 调用的函数
//   const simulateApiCall = (userInput) => {
//     return new Promise((resolve) => {
//       // 模拟网络延迟
//       setTimeout(() => {
//         // 暂时只是重复用户的输入作为 AI 的响应
//         resolve(`AI 回复: ${userInput}`);
//       }, 1000); // 1秒的延迟
//     });
//   };

//   return (
//     <div className="flex flex-col h-full overflow-hidden">
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
//           placeholder="输入您的消息..."
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
    <div className="flex flex-col h-full overflow-hidden">
      <div className="flex-grow overflow-y-auto p-4 space-y-4">
        {messages.map((msg, index) => (
          <div 
            key={index} 
            className={`p-2 rounded-lg ${
              msg.sender === 'user' 
                ? 'bg-blue-100 ml-auto text-right' 
                : 'bg-gray-100'
            } max-w-3/4`}
          >
            {msg.content}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <div className="flex p-4 bg-white border-t">
        <input
          type="text"
          className="flex-grow mr-2 p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Enter your message..."
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