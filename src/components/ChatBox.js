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
      generateAIResponse(input); // 生成AI回复
    }
  };

  const generateAIResponse = (userInput) => {
    // 模拟AI生成回复
    const aiResponse = `AI 回复: ${userInput}`;
    const aiMessage = { content: aiResponse, sender: 'ai' };
    onSendMessage(aiMessage);
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
            {typeof msg.content === 'string' ? msg.content : ''}
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
          placeholder="输入您的消息..."
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
