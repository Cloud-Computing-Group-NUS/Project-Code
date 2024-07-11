// import React, { useState, useEffect, useCallback } from 'react';
// import { Save, Edit } from 'lucide-react';
// import FileTree from './components/FileTree';
// import Editor from './components/Editor';
// import ChatBox from './components/ChatBox';
// import axios from 'axios';

// function App() {
//   const [fileSystem, setFileSystem] = useState([]);
//   const [selectedFile, setSelectedFile] = useState(null);
//   const [aiModifiedContent, setAiModifiedContent] = useState('');
//   const [messages, setMessages] = useState([]);

//   // useEffect(() => {
//   //   // 在 sessionStorage 中生成并存储唯一用户ID
//   //   if (!sessionStorage.getItem('userId')) {
//   //     sessionStorage.setItem('userId', `user_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`);
//   //   }
//   //   fetchInitialFileSystem();
//   //   // 每个访问应用的用户都有一个唯一的标识符，并且在用户首次访问时加载初始的文件系统数据
//   // }, []);

//   useEffect(() => {
//     // 在 sessionStorage 中生成并存储唯一用户ID
//     const existingUserId = sessionStorage.getItem('userId');
//     console.log('Existing user ID:', existingUserId);
    
//     if (!existingUserId) {
//       const newUserId = `user_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
//       sessionStorage.setItem('userId', newUserId);
//       console.log('New user ID generated:', newUserId);
//     } else {
//       console.log('User ID already exists:', existingUserId);
//     }
  
//     fetchInitialFileSystem();
  
//     // 清理函数通常在这里定义，但在这个案例中并不需要
//     return () => {};
//   }, []);
  

//   const fetchInitialFileSystem = async () => {
//     try {
//       const response = await axios.get('http://cloud-drive-service:80/api/initialFileSystem');
//       setFileSystem(response.data);
//       if (response.data.length > 0) {
//         setSelectedFile(response.data[0]);
//       }
//     } catch (error) {
//       console.error('Error fetching initial file system:', error);
//     }
//   };

//   const handleSaveContent = useCallback(async () => {
//     if (!selectedFile) return;
//     try {
//       await axios.post('http://cloud-drive-service:80/api/saveFile', { file: selectedFile });
//       console.log('File saved successfully');
//     } catch (error) {
//       console.error('Error saving file:', error);
//     }
//   }, [selectedFile]);

//   useEffect(() => {
//     const handleKeyDown = (event) => {
//       if (event.ctrlKey && event.key === 's') {
//         event.preventDefault();
//         handleSaveContent();
//       }
//     };

//     document.addEventListener('keydown', handleKeyDown);

//     return () => {
//       document.removeEventListener('keydown', handleKeyDown);
//     };
//   }, [handleSaveContent]);

//   const handleSelectFile = (file) => {
//     setSelectedFile(file);
//     setAiModifiedContent('');
//   };

//   const handleContentChange = (newContent) => {
//     setSelectedFile({ ...selectedFile, content: newContent });
//   };

//   const handleSendMessage = async (message) => {
//     const userId = sessionStorage.getItem('userId');
    
//     const formattedMessage = {
//       sender: userId,
//       content: message,
//       timestamp: new Date().toISOString(),
//       file: selectedFile
//     };

//     setMessages(prevMessages => [...prevMessages, { sender: 'user', content: message }]);

//     try {
//       const response = await axios.post('http://ai-agent:5000/ai_agent', { message, file: selectedFile, userId });
//       setMessages(prevMessages => [...prevMessages, { sender: 'ai', content: response.data.content }]);
//     } catch (error) {
//       console.error('Error sending message:', error);
//       setMessages(prevMessages => [...prevMessages, { sender: 'ai', content: 'Sorry, there was an error processing your request.' }]);
//     }
//   };

//   const handleGenerateModification = async () => {
//     try {
//       const response = await axios.post('http://ai-agent:5000/ai_agent', { 
//         message: "Generate a modification for this file", 
//         file: selectedFile 
//       });
//       setAiModifiedContent(response.data.content);
//     } catch (error) {
//       console.error('Error generating modification:', error);
//     }
//   };

//   const handleSubmitModification = async () => {
//     if (!selectedFile) return;
//     try {
//       await axios.post('http://cloud-drive-service:80/api/saveFile', { 
//         file: { ...selectedFile, content: aiModifiedContent } 
//       });
//       setSelectedFile(prev => ({ ...prev, content: aiModifiedContent }));
//       setAiModifiedContent('');
//       fetchInitialFileSystem(); // Refresh the file system
//     } catch (error) {
//       console.error('Error submitting modification:', error);
//     }
//   };

//   const handleCreateFile = async (parentId, fileName) => {
//     try {
//       await axios.post('http://cloud-drive-service:80/api/createFile', { parentId, fileName });
//       fetchInitialFileSystem(); // Refresh the file system
//     } catch (error) {
//       console.error('Error creating file:', error);
//     }
//   };

//   const handleDeleteFile = async (fileId) => {
//     try {
//       await axios.delete(`http://cloud-drive-service:80/api/deleteFile/${fileId}`);
//       fetchInitialFileSystem(); // Refresh the file system
//       if (selectedFile && selectedFile.id === fileId) {
//         setSelectedFile(null);
//       }
//     } catch (error) {
//       console.error('Error deleting file:', error);
//     }
//   };

//   return (
//     <div className="h-screen flex flex-col bg-gray-100 overflow-hidden">
//       <div className="flex-grow flex p-4 space-x-4 overflow-hidden">
//         <div className="w-1/4 bg-white rounded-lg shadow-md p-4 flex flex-col overflow-hidden">
//           <h2 className="text-xl font-bold mb-4 text-gray-800">Files</h2>
//           <div className="flex-grow overflow-y-auto">
//             <FileTree 
//               files={fileSystem} 
//               onSelectFile={handleSelectFile} 
//               onCreateFile={handleCreateFile}
//               onDeleteFile={handleDeleteFile}
//               selectedFileId={selectedFile ? selectedFile.id : null}
//             />
//           </div>
//         </div>
//         <div className="w-3/4 flex flex-col space-y-4 overflow-hidden">
//           <div className="flex-grow flex space-x-4 overflow-hidden">
//             <div className="w-1/2 bg-white rounded-lg shadow-md p-4 flex flex-col overflow-hidden">
//               <h2 className="text-xl font-bold mb-4 text-gray-800">Original Content</h2>
//               <div className="flex-grow overflow-hidden">
//                 <Editor 
//                   file={selectedFile}
//                   onChange={handleContentChange}
//                   onSave={handleSaveContent}
//                 />
//               </div>
//             </div>
//             <div className="w-1/2 bg-white rounded-lg shadow-md p-4 flex flex-col overflow-hidden">
//               <h2 className="text-xl font-bold mb-4 text-gray-800">AI Modified Content</h2>
//               <div className="flex-grow overflow-hidden">
//                 <Editor 
//                   file={{ ...selectedFile, content: aiModifiedContent }}
//                   onChange={setAiModifiedContent}
//                   onSave={handleSaveContent}
//                 />
//               </div>
//             </div>
//           </div>
//           <div className="h-1/3 bg-white rounded-lg shadow-md p-4 overflow-hidden">
//             <h2 className="text-xl font-bold mb-4 text-gray-800">Chat</h2>
//             <ChatBox messages={messages} onSendMessage={handleSendMessage} />
//           </div>
//         </div>
//       </div>
//       <div className="p-4 flex space-x-2 bg-gray-200">
//         <button 
//           onClick={handleGenerateModification} 
//           className="p-2 bg-green-500 text-white rounded-md flex items-center transition duration-300 ease-in-out hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50"
//         >
//           <Edit size={20} className="mr-1" />
//           Generate Modification
//         </button>
//         <button 
//           onClick={handleSubmitModification} 
//           className="p-2 bg-blue-500 text-white rounded-md flex items-center transition duration-300 ease-in-out hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
//         >
//           <Save size={20} className="mr-1" />
//           Submit Modification
//         </button>
//       </div>
//     </div>
//   );
// }

// export default App;

import React, { useState, useEffect, useCallback } from 'react';
import { Save, Edit } from 'lucide-react';
import FileTree from './components/FileTree';
import Editor from './components/Editor';
import ChatBox from './components/ChatBox';
import axios from 'axios';

function App() {
  const [fileSystem, setFileSystem] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [aiModifiedContent, setAiModifiedContent] = useState('');
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    const existingUserId = sessionStorage.getItem('userId');
    if (!existingUserId) {
      const newUserId = `user_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
      sessionStorage.setItem('userId', newUserId);
    }

    fetchInitialFileSystem();

    // Cleanup function
    return () => {
      const userId = sessionStorage.getItem('userId');
      const formattedMessage = {
        sender: userId,
      };

      // Sending formattedMessage to the backend
      axios.post('http://your-backend-api-url', formattedMessage)
        .then(response => {
          console.log('Message sent successfully:', response.data);
        })
        .catch(error => {
          console.error('Error sending message:', error);
        });
    };
  }, [selectedFile]);

  const fetchInitialFileSystem = async () => {
    try {
      const response = await axios.get('http://cloud-drive-service:80/api/initialFileSystem');
      setFileSystem(response.data);
      if (response.data.length > 0) {
        setSelectedFile(response.data[0]);
      }
    } catch (error) {
      console.error('Error fetching initial file system:', error);
    }
  };

  const handleSaveContent = useCallback(async () => {
    if (!selectedFile) return;
    try {
      await axios.post('http://cloud-drive-service:80/api/saveFile', { file: selectedFile });
      console.log('File saved successfully');
    } catch (error) {
      console.error('Error saving file:', error);
    }
  }, [selectedFile]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.ctrlKey && event.key === 's') {
        event.preventDefault();
        handleSaveContent();
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleSaveContent]);

  const handleSelectFile = (file) => {
    setSelectedFile(file);
    setAiModifiedContent('');
  };

  const handleContentChange = (newContent) => {
    setSelectedFile({ ...selectedFile, content: newContent });
  };

  const handleSendMessage = async (message) => {
    const userId = sessionStorage.getItem('userId');

    const formattedMessage = {
      sender: userId,
      content: message,
      timestamp: new Date().toISOString(),
      file: selectedFile
    };

    setMessages(prevMessages => [...prevMessages, { sender: 'user', content: message }]);

    try {
      const response = await axios.post('http://ai-agent:5000/ai_agent', { message, file: selectedFile, userId });
      setMessages(prevMessages => [...prevMessages, { sender: 'ai', content: response.data.content }]);
    } catch (error) {
      console.error('Error sending message:', error);
      setMessages(prevMessages => [...prevMessages, { sender: 'ai', content: 'Sorry, there was an error processing your request.' }]);
    }
  };

  const handleGenerateModification = async () => {
    try {
      const response = await axios.post('http://ai-agent:5000/ai_agent', {
        message: "Generate a modification for this file",
        file: selectedFile
      });
      setAiModifiedContent(response.data.content);
    } catch (error) {
      console.error('Error generating modification:', error);
    }
  };

  const handleSubmitModification = async () => {
    if (!selectedFile) return;
    try {
      await axios.post('http://cloud-drive-service:80/api/saveFile', {
        file: { ...selectedFile, content: aiModifiedContent }
      });
      setSelectedFile(prev => ({ ...prev, content: aiModifiedContent }));
      setAiModifiedContent('');
      fetchInitialFileSystem(); // Refresh the file system
    } catch (error) {
      console.error('Error submitting modification:', error);
    }
  };

  const handleCreateFile = async (parentId, fileName) => {
    try {
      await axios.post('http://cloud-drive-service:80/api/createFile', { parentId, fileName });
      fetchInitialFileSystem(); // Refresh the file system
    } catch (error) {
      console.error('Error creating file:', error);
    }
  };

  const handleDeleteFile = async (fileId) => {
    try {
      await axios.delete(`http://cloud-drive-service:80/api/deleteFile/${fileId}`);
      fetchInitialFileSystem(); // Refresh the file system
      if (selectedFile && selectedFile.id === fileId) {
        setSelectedFile(null);
      }
    } catch (error) {
      console.error('Error deleting file:', error);
    }
  };

  return (
    <div className="h-screen flex flex-col bg-gray-100 overflow-hidden">
      <div className="flex-grow flex p-4 space-x-4 overflow-hidden">
        <div className="w-1/4 bg-white rounded-lg shadow-md p-4 flex flex-col overflow-hidden">
          <h2 className="text-xl font-bold mb-4 text-gray-800">Files</h2>
          <div className="flex-grow overflow-y-auto">
            <FileTree
              files={fileSystem}
              onSelectFile={handleSelectFile}
              onCreateFile={handleCreateFile}
              onDeleteFile={handleDeleteFile}
              selectedFileId={selectedFile ? selectedFile.id : null}
            />
          </div>
        </div>
        <div className="w-3/4 flex flex-col space-y-4 overflow-hidden">
          <div className="flex-grow flex space-x-4 overflow-hidden">
            <div className="w-1/2 bg-white rounded-lg shadow-md p-4 flex flex-col overflow-hidden">
              <h2 className="text-xl font-bold mb-4 text-gray-800">Original Content</h2>
              <div className="flex-grow overflow-hidden">
                <Editor
                  file={selectedFile}
                  onChange={handleContentChange}
                  onSave={handleSaveContent}
                />
              </div>
            </div>
            <div className="w-1/2 bg-white rounded-lg shadow-md p-4 flex flex-col overflow-hidden">
              <h2 className="text-xl font-bold mb-4 text-gray-800">AI Modified Content</h2>
              <div className="flex-grow overflow-hidden">
                <Editor
                  file={{ ...selectedFile, content: aiModifiedContent }}
                  onChange={setAiModifiedContent}
                  onSave={handleSaveContent}
                />
              </div>
            </div>
          </div>
          <div className="h-1/3 bg-white rounded-lg shadow-md p-4 overflow-hidden">
            <h2 className="text-xl font-bold mb-4 text-gray-800">Chat</h2>
            <ChatBox messages={messages} onSendMessage={handleSendMessage} />
          </div>
        </div>
      </div>
      <div className="p-4 flex space-x-2 bg-gray-200">
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
