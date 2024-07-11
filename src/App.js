// import React, { useState, useEffect } from 'react';
// import { Save, Edit } from 'lucide-react';
// import FileTree from './components/FileTree';
// import Editor from './components/Editor';
// import ChatBox from './components/ChatBox';
// import axios from 'axios';
// import io from 'socket.io-client';

// const socket = io('http://localhost:3000');

// const initialFileSystem = [
//   { 
//     id: '1', 
//     name: 'Example Folder', 
//     type: 'folder',
//     children: [
//       { id: '2', name: 'example.md', type: 'file', content: '# Example Markdown\n\nThis is a sample markdown file.' },
//       { id: '3', name: 'example.py', type: 'file', content: 'print("Hello, World!")' },
//     ]
//   },
//   { id: '4', name: 'example.cpp', type: 'file', content: '#include <iostream>\n\nint main() {\n    std::cout << "Hello, World!" << std::endl;\n    return 0;\n}' },
// ];

// function App() {
//   const [fileSystem, setFileSystem] = useState(initialFileSystem);
//   const [selectedFile, setSelectedFile] = useState(initialFileSystem[0].children[0]);
//   const [aiModifiedContent, setAiModifiedContent] = useState('');
//   const [messages, setMessages] = useState([]);

//   useEffect(() => {
//     socket.on('fileSystemUpdate', (updatedFileSystem) => {
//       setFileSystem(updatedFileSystem);
//     });

//     const handleKeyDown = (event) => {
//       if (event.ctrlKey && event.key === 's') {
//         event.preventDefault();
//         handleSaveContent();
//       }
//     };

//     document.addEventListener('keydown', handleKeyDown);

//     return () => {
//       socket.off('fileSystemUpdate');
//       document.removeEventListener('keydown', handleKeyDown);
//     };
//   }, []);

//   const handleSelectFile = (file) => {
//     setSelectedFile(file);
//     setAiModifiedContent('');
//   };

//   const handleContentChange = (newContent) => {
//     setSelectedFile({ ...selectedFile, content: newContent });
//   };

//   const handleSaveContent = async () => {
//     try {
//       await axios.post('/api/saveFile', { file: selectedFile });
//       console.log('File saved successfully');
//     } catch (error) {
//       console.error('Error saving file:', error);
//     }
//   };

//   const handleSendMessage = async (message) => {
//     setMessages(prevMessages => [...prevMessages, { sender: 'user', content: message }]);
//     try {
//       const response = await axios.post('/api/chatbot', { message, file: selectedFile });
//       setMessages(prevMessages => [...prevMessages, { sender: 'ai', content: response.data.reply }]);
//     } catch (error) {
//       console.error('Error sending message:', error);
//       setMessages(prevMessages => [...prevMessages, { sender: 'ai', content: 'Sorry, there was an error processing your request.' }]);
//     }
//   };

//   const handleGenerateModification = async () => {
//     try {
//       const response = await axios.post('/api/generateModification', { file: selectedFile });
//       setAiModifiedContent(response.data.modifiedContent);
//     } catch (error) {
//       console.error('Error generating modification:', error);
//     }
//   };

//   const handleSubmitModification = async () => {
//     try {
//       await axios.post('/api/submitModification', { file: selectedFile, modifiedContent: aiModifiedContent });
//       setSelectedFile(prev => ({ ...prev, content: aiModifiedContent }));
//       setAiModifiedContent('');
//     } catch (error) {
//       console.error('Error submitting modification:', error);
//     }
//   };

//   const handleCreateFile = async (parentId, fileName) => {
//     try {
//       const response = await axios.post('/api/createFile', { parentId, fileName });
//       const newFile = response.data.file;
//       setFileSystem(prevFileSystem => {
//         const addFile = (items) => {
//           return items.map(item => {
//             if (item.id === parentId) {
//               return { ...item, children: [...(item.children || []), newFile] };
//             }
//             if (item.children) {
//               return { ...item, children: addFile(item.children) };
//             }
//             return item;
//           });
//         };
//         return addFile(prevFileSystem);
//       });
//     } catch (error) {
//       console.error('Error creating file:', error);
//     }
//   };

//   const handleDeleteFile = async (fileId) => {
//     try {
//       await axios.delete(`/api/deleteFile/${fileId}`);
//       setFileSystem(prevFileSystem => {
//         const deleteFile = (items) => {
//           return items.filter(item => {
//             if (item.id === fileId) {
//               return false;
//             }
//             if (item.children) {
//               item.children = deleteFile(item.children);
//             }
//             return true;
//           });
//         };
//         return deleteFile(prevFileSystem);
//       });
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
import io from 'socket.io-client';

const socket = io('http://localhost:3000');

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
  const [selectedFile, setSelectedFile] = useState(initialFileSystem[0].children[0]);
  const [aiModifiedContent, setAiModifiedContent] = useState('');
  const [messages, setMessages] = useState([]);

  const handleSaveContent = useCallback(async () => {
    try {
      await axios.post('/api/saveFile', { file: selectedFile });
      console.log('File saved successfully');
    } catch (error) {
      console.error('Error saving file:', error);
    }
  }, [selectedFile]);

  useEffect(() => {
    socket.on('fileSystemUpdate', (updatedFileSystem) => {
      setFileSystem(updatedFileSystem);
    });

    const handleKeyDown = (event) => {
      if (event.ctrlKey && event.key === 's') {
        event.preventDefault();
        handleSaveContent();
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      socket.off('fileSystemUpdate');
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
    setMessages(prevMessages => [...prevMessages, { sender: 'user', content: message }]);
    try {
      const response = await axios.post('/api/chatbot', { message, file: selectedFile });
      setMessages(prevMessages => [...prevMessages, { sender: 'ai', content: response.data.reply }]);
    } catch (error) {
      console.error('Error sending message:', error);
      setMessages(prevMessages => [...prevMessages, { sender: 'ai', content: 'Sorry, there was an error processing your request.' }]);
    }
  };

  const handleGenerateModification = async () => {
    try {
      const response = await axios.post('/api/generateModification', { file: selectedFile });
      setAiModifiedContent(response.data.modifiedContent);
    } catch (error) {
      console.error('Error generating modification:', error);
    }
  };

  const handleSubmitModification = async () => {
    try {
      await axios.post('/api/submitModification', { file: selectedFile, modifiedContent: aiModifiedContent });
      setSelectedFile(prev => ({ ...prev, content: aiModifiedContent }));
      setAiModifiedContent('');
    } catch (error) {
      console.error('Error submitting modification:', error);
    }
  };

  const handleCreateFile = async (parentId, fileName) => {
    try {
      const response = await axios.post('/api/createFile', { parentId, fileName });
      const newFile = response.data.file;
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
    } catch (error) {
      console.error('Error creating file:', error);
    }
  };

  const handleDeleteFile = async (fileId) => {
    try {
      await axios.delete(`/api/deleteFile/${fileId}`);
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