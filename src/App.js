import React, { useState, useEffect } from 'react';
import { Folder, File, Send, Save, Edit, PlusCircle, Trash2 } from 'lucide-react';
import FileTree from './components/FileTree';
import Editor from './components/Editor';
import ChatBox from './components/ChatBox';
import axios from 'axios';
import io from 'socket.io-client';

const socket = io('http://localhost:3000');  // 假设后端在3001端口

// 示例文件系统
const initialFileSystem = [
  { 
    id: '1', 
    name: 'Example Folder', 
    type: 'folder',
    children: [
      { id: '2', name: 'example.md', type: 'file', content: '# Example Markdown\n\nThis is a sample markdown file.' },
      { id: '3', name: 'example.py', type: 'file', content: 'print("Hello, World!")' },
    ]
  },
  { id: '4', name: 'example.cpp', type: 'file', content: '#include <iostream>\n\nint main() {\n    std::cout << "Hello, World!" << std::endl;\n    return 0;\n}' },
];

function App() {
  const [fileSystem, setFileSystem] = useState(initialFileSystem);
  const [selectedFile, setSelectedFile] = useState(initialFileSystem[0].children[0]);  // 默认选择第一个文件
  const [aiModifiedContent, setAiModifiedContent] = useState('');
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    // 设置 Socket.io 监听器
    socket.on('fileSystemUpdate', (updatedFileSystem) => {
      setFileSystem(updatedFileSystem);
    });

    return () => {
      socket.off('fileSystemUpdate');
    };
  }, []);

  const handleSelectFile = (file) => {
    setSelectedFile(file);
    setAiModifiedContent('');
  };

  const handleContentChange = (newContent) => {
    setSelectedFile({ ...selectedFile, content: newContent });
  };

  const handleSaveContent = async () => {
    try {
      // 这里应该发送请求到后端保存文件内容
      // await axios.post('/api/save-file', { fileId: selectedFile.id, content: selectedFile.content });
      
      // 更新本地文件系统
      setFileSystem(prevFileSystem => {
        const updateFile = (items) => {
          return items.map(item => {
            if (item.id === selectedFile.id) {
              return { ...item, content: selectedFile.content };
            }
            if (item.children) {
              return { ...item, children: updateFile(item.children) };
            }
            return item;
          });
        };
        return updateFile(prevFileSystem);
      });

      console.log('File saved successfully');
    } catch (error) {
      console.error('Error saving file:', error);
    }
  };

  const handleSendMessage = async (message) => {
    setMessages([...messages, { sender: 'user', content: message }]);
    try {
      const response = await axios.post('/api/chat', { message, context: messages });
      setMessages(prevMessages => [...prevMessages, { sender: 'ai', content: response.data.reply }]);
    } catch (error) {
      console.error('Error sending message:', error);
      setMessages(prevMessages => [...prevMessages, { sender: 'ai', content: message }]);
    }
  };

  const handleGenerateModification = async () => {
    try {
      const response = await axios.post('/api/generate-modification', { content: selectedFile.content });
      setAiModifiedContent(response.data.modifiedContent);
    } catch (error) {
      console.error('Error generating modification:', error);
    }
  };

  const handleSubmitModification = async () => {
    try {
      await axios.post('/api/submit-modification', {
        fileId: selectedFile.id,
        content: selectedFile.content,
        modifiedContent: aiModifiedContent,
        chatHistory: messages
      });
      // 更新文件系统
      setFileSystem(prevFileSystem => {
        const updateFile = (items) => {
          return items.map(item => {
            if (item.id === selectedFile.id) {
              return { ...item, content: aiModifiedContent };
            }
            if (item.children) {
              return { ...item, children: updateFile(item.children) };
            }
            return item;
          });
        };
        return updateFile(prevFileSystem);
      });
      setSelectedFile(prev => ({ ...prev, content: aiModifiedContent }));
      setAiModifiedContent('');
    } catch (error) {
      console.error('Error submitting modification:', error);
    }
  };

  const handleCreateFile = (parentId, fileName) => {
    const newFile = { 
      id: Date.now().toString(), 
      name: fileName, 
      type: 'file',
      content: '' 
    };
    setFileSystem(prevFileSystem => {
      const addFile = (items) => {
        return items.map(item => {
          if (item.id === parentId) {
            return { ...item, children: [...(item.children || []), newFile] };
          }
          if (item.children) {
            return { ...item, children: addFile(item.children) };
          }
          return item;
        });
      };
      return addFile(prevFileSystem);
    });
  };

  const handleDeleteFile = (fileId) => {
    setFileSystem(prevFileSystem => {
      const deleteFile = (items) => {
        return items.filter(item => {
          if (item.id === fileId) {
            return false;
          }
          if (item.children) {
            item.children = deleteFile(item.children);
          }
          return true;
        });
      };
      return deleteFile(prevFileSystem);
    });
    if (selectedFile && selectedFile.id === fileId) {
      setSelectedFile(null);
    }
  };

  return (
    <div className="h-screen flex flex-col bg-gray-100">
      <div className="flex-grow flex p-4 space-x-4">
        <div className="w-1/4 bg-white rounded-lg shadow-md p-4 overflow-y-auto">
          <h2 className="text-xl font-bold mb-4 text-gray-800">Files</h2>
          <FileTree 
            files={fileSystem} 
            onSelectFile={handleSelectFile} 
            onCreateFile={handleCreateFile}
            onDeleteFile={handleDeleteFile}
            selectedFileId={selectedFile ? selectedFile.id : null}
          />
        </div>
        <div className="w-3/4 flex flex-col space-y-4">
          <div className="flex-grow flex space-x-4">
            <div className="w-1/2 bg-white rounded-lg shadow-md p-4 flex flex-col">
              <h2 className="text-xl font-bold mb-4 text-gray-800">Original Content</h2>
              <div className="flex-grow">
                <Editor 
                  file={selectedFile}
                  onChange={handleContentChange}
                />
              </div>
              <button 
                onClick={handleSaveContent}
                className="mt-2 p-2 bg-green-500 text-white rounded-md flex items-center justify-center transition duration-300 ease-in-out hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50"
              >
                <Save size={20} className="mr-1" />
                Save Changes
              </button>
            </div>
            <div className="w-1/2 bg-white rounded-lg shadow-md p-4">
              <h2 className="text-xl font-bold mb-4 text-gray-800">AI Modified Content</h2>
              <Editor 
                file={{ ...selectedFile, content: aiModifiedContent }}
                onChange={setAiModifiedContent}
              />
            </div>
          </div>
          <div className="h-1/3 bg-white rounded-lg shadow-md p-4">
            <h2 className="text-xl font-bold mb-4 text-gray-800">Chat</h2>
            <ChatBox messages={messages} onSendMessage={handleSendMessage} />
          </div>
        </div>
      </div>
      <div className="flex justify-end p-4 space-x-2">
        <button 
          onClick={handleGenerateModification} 
          className="p-2 bg-green-500 text-white rounded-md flex items-center transition duration-300 ease-in-out hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50"
        >
          <Edit size={20} className="mr-1" />
          Generate Modification
        </button>
        <button 
          onClick={handleSubmitModification} 
          className="p-2 bg-blue-500 text-white rounded-md flex items-center transition duration-300 ease-in-out hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
        >
          <Save size={20} className="mr-1" />
          Submit Modification
        </button>
      </div>
    </div>
  );
}

export default App;