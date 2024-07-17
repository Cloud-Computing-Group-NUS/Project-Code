// import React, { useState, useEffect, useCallback } from 'react';
// import { Save, Edit } from 'lucide-react';
// import io from 'socket.io-client';
// import FileTree from './components/FileTree';
// import Editor from './components/Editor';
// import ChatBox from './components/ChatBox';
// import { transitServerApi, cloudDriveApi } from './apiClient';

// function App() {
//   const [fileSystem, setFileSystem] = useState([]); // FileSystem (object) Array
//   const [selectedFile, setSelectedFile] = useState(null); // SelectedFile (object) Array
//   const [aiModifiedContent, setAiModifiedContent] = useState(''); // AI-modified content (content) Array
//   const [messages, setMessages] = useState([]); // MessageHistory (content) Array
//   const [userId, setUserId] = useState(null); // SessionUser-ID (string) Array

//   useEffect(() => {
//     const existingUserId = sessionStorage.getItem('userId');
//     if (existingUserId) {
//       // maintain the UserID 
//       setUserId(existingUserId); // Array.append()
//     } else {
//       // generate a new UserID for this session
//       const newUserId = `user_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
//       sessionStorage.setItem('userId', newUserId);
//       setUserId(newUserId); // Array.append()
//     }

//     // get FileSystem Object from Drive initially
//     fetchInitialFileSystem(); // async opt

//     const socket = io('/ng/cloud-drive-service', {
//       path: '/socket.io'
//     }); // WebSocket -> service node (Drive Backend), path = ...
//     socket.on('fileSystemUpdate', (updatedFileSystem) => { // listen Update-Event
//       setFileSystem(updatedFileSystem); // -> UpdatedFileSystem
//       localStorage.setItem('fileSystem', JSON.stringify(updatedFileSystem)); // store in localStorage
//     });

//     return () => {
//       socket.disconnect();
//     };
//   }, []);

//   // with Drive-Backend
//   const fetchInitialFileSystem = async () => {
//     try {
//       const storedFileSystem = localStorage.getItem('fileSystem'); // get fileSystem data from the browser's localStorage
//       if (storedFileSystem) {
//         // if stored, return to FileSystem at once
//         setFileSystem(JSON.parse(storedFileSystem)); 
//       } else {
//         // else get FileSystem from Drive Backend
//         const response = await cloudDriveApi.getInitialFileSystem();
//         setFileSystem(response.data);
//         localStorage.setItem('fileSystem', JSON.stringify(response.data));
//       }
//     } catch (error) {
//       console.error('Error fetching initial file system:', error);
//     }
//   };
//   /**
//    * Tips:
//    * - Use localStorage.getItem('fileSystem') to try to get fileSystem data from the browser's localStorage. 
//    * - localStorage is a persistent storage area, and the data will be retained even after the browser is closed.
//    */

//   const handleSaveContent = useCallback(async (content) => {
//     if (!selectedFile) return;

//     try {
//       await cloudDriveApi.saveFile({
//         file: {
//           id: selectedFile.id,
//           content: content
//         }
//       });
//       console.log('File saved successfully');
//       setSelectedFile(prevFile => ({ ...prevFile, content }));
      
//       setFileSystem(prevFileSystem => {
//         const updateFileInSystem = (files) => {
//           return files.map(file => {
//             if (file.id === selectedFile.id) {
//               return { ...file, content };
//             }
//             if (file.children) {
//               return { ...file, children: updateFileInSystem(file.children) };
//             }
//             return file;
//           });
//         };
//         const updatedFileSystem = updateFileInSystem(prevFileSystem);
//         localStorage.setItem('fileSystem', JSON.stringify(updatedFileSystem));
//         return updatedFileSystem;
//       });
//     } catch (error) {
//       console.error('Error saving file:', error);
//     }
//   }, [selectedFile]);

//   const handleSelectFile = async (file) => {
//     try {
//       const response = await cloudDriveApi.getFileContent(file.id);
//       const fileWithContent = { ...file, content: response.data.content };
//       setSelectedFile(fileWithContent);
//       setAiModifiedContent('');
//     } catch (error) {
//       console.error('Error fetching file content:', error);
//     }
//   };

//   const handleSendMessage = async (message) => {
//     if (!userId) {
//       console.error('User ID is not set');
//       return;
//     }

//     const newMessage = {
//       user: userId,
//       content: message,
//       timestamp: new Date().toISOString(),
//       file: selectedFile ? selectedFile.id : null
//     };
//     setMessages(prevMessages => [...prevMessages, newMessage]);

//     try {
//       const response = await transitServerApi.getChatContent({
//         user: userId,
//         message: newMessage
//       });
//       setMessages(prevMessages => [...prevMessages, { user: 'ai', content: response.data.content }]);
//     } catch (error) {
//       console.error('Error sending message:', error);
//       setMessages(prevMessages => [...prevMessages, { user: 'ai', content: 'Sorry, there was an error processing your request.' }]);
//     }
//   };

//   const handleGenerateModification = async () => {
//     if (!selectedFile || !userId) return;

//     try {
//       const genModifyMessage = {
//         user: userId,
//         content: "Please modify this file",
//         timestamp: new Date().toISOString(),
//         prevFile: selectedFile.id,
//         aiModifiedContent: aiModifiedContent
//       };

//       const response = await transitServerApi.getFileContent(genModifyMessage);
//       setAiModifiedContent(response.data.content);
//     } catch (error) {
//       console.error('Error generating modification:', error);
//     }
//   };

//   const handleSubmitModification = async () => {
//     if (!selectedFile || !userId) return;

//     try {
//       const sendModifyMessage = {
//         user: userId,
//         content: "submit modified file",
//         timestamp: new Date().toISOString(),
//         prevFile: selectedFile.id,
//         aiModifiedContent: aiModifiedContent
//       };

//       await transitServerApi.getTrainData(sendModifyMessage);

//       setSelectedFile(prev => ({ ...prev, content: aiModifiedContent }));
//       setAiModifiedContent('');
      
//       setFileSystem(prevFileSystem => {
//         const updateFileInSystem = (files) => {
//           return files.map(file => {
//             if (file.id === selectedFile.id) {
//               return { ...file, content: aiModifiedContent };
//             }
//             if (file.children) {
//               return { ...file, children: updateFileInSystem(file.children) };
//             }
//             return file;
//           });
//         };
//         const updatedFileSystem = updateFileInSystem(prevFileSystem);
//         localStorage.setItem('fileSystem', JSON.stringify(updatedFileSystem));
//         return updatedFileSystem;
//       });
//     } catch (error) {
//       console.error('Error submitting modification:', error);
//     }
//   };

//   const handleCreateFile = async (parentId, fileName, isFolder = false) => {
//     try {
//       const response = await cloudDriveApi.createFile({ parentId, name: fileName, type: isFolder ? 'folder' : 'file' });
//       const newFile = response.data.file;
      
//       setFileSystem(prevFileSystem => {
//         const addFileToSystem = (files) => {
//           if (parentId === 'root') {
//             return [...files, newFile];
//           }
//           return files.map(file => {
//             if (file.id === parentId) {
//               return {
//                 ...file,
//                 children: [...(file.children || []), newFile]
//               };
//             }
//             if (file.children) {
//               return { ...file, children: addFileToSystem(file.children) };
//             }
//             return file;
//           });
//         };
//         const updatedFileSystem = addFileToSystem(prevFileSystem);
//         localStorage.setItem('fileSystem', JSON.stringify(updatedFileSystem));
//         return updatedFileSystem;
//       });
//     } catch (error) {
//       console.error(`Error creating ${isFolder ? 'folder' : 'file'}:`, error);
//     }
//   };

//   const handleDeleteFile = async (fileId) => {
//     try {
//       await cloudDriveApi.deleteFile({ fileId });
//       if (selectedFile && selectedFile.id === fileId) {
//         setSelectedFile(null);
//       }
      
//       setFileSystem(prevFileSystem => {
//         const removeFileFromSystem = (files) => {
//           return files.filter(file => {
//             if (file.id === fileId) {
//               return false;
//             }
//             if (file.children) {
//               file.children = removeFileFromSystem(file.children);
//             }
//             return true;
//           });
//         };
//         const updatedFileSystem = removeFileFromSystem(prevFileSystem);
//         localStorage.setItem('fileSystem', JSON.stringify(updatedFileSystem));
//         return updatedFileSystem;
//       });
      
//       console.log('File deleted successfully');
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
//             <Editor
//               file={selectedFile}
//               aiModifiedContent={aiModifiedContent}
//               onSave={handleSaveContent}
//             />
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
import io from 'socket.io-client';
import FileTree from './components/FileTree';
import Editor from './components/Editor';
import ChatBox from './components/ChatBox';
import { transitServerApi, cloudDriveApi } from './apiClient';

function App() {
  const [fileSystem, setFileSystem] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [aiModifiedContent, setAiModifiedContent] = useState('');
  const [messages, setMessages] = useState([]);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const existingUserId = sessionStorage.getItem('userId');
    if (existingUserId) {
      setUserId(existingUserId);
    } else {
      const newUserId = `user_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
      sessionStorage.setItem('userId', newUserId);
      setUserId(newUserId);
    }

    fetchInitialFileSystem();

    const socket = io('/ng/cloud-drive-service', {
      path: '/socket.io'
    });
    socket.on('fileSystemUpdate', (updatedFileSystem) => {
      setFileSystem(updatedFileSystem);
      localStorage.setItem('fileSystem', JSON.stringify(updatedFileSystem));
    });

    window.addEventListener('beforeunload', handleBeforeUnload); // listener: "close this session"

    /**
     * Tips:
     * - "beforeunload" event is triggered when window/document and its resources are about to be unloaded.
     * - This event can be used to perform custom actions before the user leaves the page, such as sending a request to the server.
     */

    return () => {
      socket.disconnect(); // turn off WebSocket
      window.removeEventListener('beforeunload', handleBeforeUnload); // correspondingly, remove the event listener
    };

    /**
     * Tips:
     * This cleanup function is executed when the component is unmounted 
     * or the dependencies of the useEffect hook change.
     */
  }, []);

  const fetchInitialFileSystem = async () => {
    try {
      const storedFileSystem = localStorage.getItem('fileSystem');
      if (storedFileSystem) {
        setFileSystem(JSON.parse(storedFileSystem));
      } else {
        const response = await cloudDriveApi.getInitialFileSystem();
        setFileSystem(response.data);
        localStorage.setItem('fileSystem', JSON.stringify(response.data));
      }
    } catch (error) {
      console.error('Error fetching initial file system:', error);
    }
  };

  const handleBeforeUnload = (event) => {
    if (userId) {
      transitServerApi.cancel({ user: userId });
    } else {
      transitServerApi.cancel({ user: 'User ID is not available'});
    }
    event.preventDefault();
    event.returnValue = '';
  };
  /**
   * Prevent the default browser behavior:
   * - For the "beforeunload" event, the default behavior is to pop up a confirmation dialog box asking 
   * - whether the user wanna leave the page
   */

  const handleSaveContent = useCallback(async (content) => {
    // Save the file content edited by user to Cloud-Drive and update the local status and local storage
    if (!selectedFile) return;

    try {
      await cloudDriveApi.saveFile({
        file: {
          id: selectedFile.id,
          content: content
        }
      }); // Tips: 2-level Mapping
      console.log('File saved successfully');

      setSelectedFile(prevFile => ({ ...prevFile, content }));
      // Replace the content in the original selectedFile with the new content (instead of appending)
      
      setFileSystem(prevFileSystem => {
        const updateFileInSystem = (files) => {
          return files.map(file => {
            if (file.id === selectedFile.id) {
              // Equal: file that needs to be updated is found
              return { ...file, content }; // overwrite "content"
            }
            if (file.children) {
              // Not Found, but it has "Child", then continue to search in "Child"
              return { ...file, children: updateFileInSystem(file.children) };
            }
            return file;
          });
        };
        const updatedFileSystem = updateFileInSystem(prevFileSystem);
        localStorage.setItem('fileSystem', JSON.stringify(updatedFileSystem));
        return updatedFileSystem;
      });
    } catch (error) {
      console.error('Error saving file:', error);
    }
  }, [selectedFile]);

  /**
   * Tips:
   * Recursively traverse the file system, 
   * find the file object with the same id as the selected file selectedFile.id, and update its content content. 
   * The updated file system is stored in localStorage, and the state of the React component is updated through setFileSystem
   */

  const handleSelectFile = async (file) => {
    try {
      // when I click this fileObject, I wanna fetch its content in Cloud-Drive
      const response = await cloudDriveApi.getFileContent(file.id);
      const fileWithContent = { ...file, content: response.data.content }; // overwrite "content" and return a new FileObject
      setSelectedFile(fileWithContent); // update FileObject
      setAiModifiedContent(''); // clear AI-modified content (right-side branch)
    } catch (error) {
      console.error('Error fetching file content:', error);
    }
  };

  const handleSendMessage = async (message) => {
    // arg: message is the content sent by user
    if (!userId) {
      console.error('User ID is not set');
      return;
    }

    const newMessage = {
      user: userId,
      content: message,
      timestamp: new Date().toISOString(),
      file: selectedFile ? selectedFile.id : null
    };
    setMessages(prevMessages => [...prevMessages, newMessage]); // append newMessage to previous msg array(prevMessages)

    try {
      const response = await transitServerApi.getChatContent(newMessage); // session with AI-Backend
      setMessages(prevMessages => [...prevMessages, { user: 'ai', content: response.data.content }]);
    } catch (error) {
      console.error('Error sending message:', error);
      setMessages(prevMessages => [...prevMessages, { user: 'ai', content: 'Sorry, there was an error processing your request.' }]);
    }
  };

  const handleGenerateModification = async () => {
    if (!selectedFile || !userId) return;

    try {
      const genModifyMessage = {
        user: userId,
        timestamp: new Date().toISOString(),
        file: selectedFile.id,
        content: aiModifiedContent
      };

      const response = await transitServerApi.getFileContent(genModifyMessage); // session with AI-Backend
      setAiModifiedContent(response.data.content);
    } catch (error) {
      console.error('Error generating modification:', error);
    }
  };

  const handleSubmitModification = async () => {
    if (!selectedFile || !userId) return;

    try {
      const sendModifyMessage = {
        user: userId,
        content: "submit modified file",
        timestamp: new Date().toISOString(),
        prevFile: selectedFile.id,
        aiModifiedContent: aiModifiedContent
      };
      // maybe "content: message,"

      await transitServerApi.getTrainData(sendModifyMessage);

      setSelectedFile(prev => ({ ...prev, content: aiModifiedContent })); // overwrite "content"
      setAiModifiedContent(''); // clear AI-modified content (right-side branch)
      
      setFileSystem(prevFileSystem => {
        const updateFileInSystem = (files) => {
          return files.map(file => {
            if (file.id === selectedFile.id) {
              return { ...file, content: aiModifiedContent };
            }
            if (file.children) {
              return { ...file, children: updateFileInSystem(file.children) };
            }
            return file;
          });
        };
        const updatedFileSystem = updateFileInSystem(prevFileSystem);
        localStorage.setItem('fileSystem', JSON.stringify(updatedFileSystem));
        return updatedFileSystem;
      }); // just like row-102
    } catch (error) {
      console.error('Error submitting modification:', error);
    }
  };

  const handleCreateFile = async (parentId, fileName, isFolder = false) => {
    try {
      const response = await cloudDriveApi.createFile({ parentId, name: fileName, type: isFolder ? 'folder' : 'file' });
      const newFile = response.data.file;
      
      setFileSystem(prevFileSystem => {
        const addFileToSystem = (files) => {
          if (parentId === 'root') {
            return [...files, newFile];
          }
          return files.map(file => {
            if (file.id === parentId) {
              return {
                ...file,
                children: [...(file.children || []), newFile]
              };
            }
            if (file.children) {
              return { ...file, children: addFileToSystem(file.children) };
            }
            return file;
          });
        };
        const updatedFileSystem = addFileToSystem(prevFileSystem);
        localStorage.setItem('fileSystem', JSON.stringify(updatedFileSystem));
        return updatedFileSystem;
      });
    } catch (error) {
      console.error(`Error creating ${isFolder ? 'folder' : 'file'}:`, error);
    }
  };

  const handleDeleteFile = async (fileId) => {
    try {
      await cloudDriveApi.deleteFile({ fileId });
      if (selectedFile && selectedFile.id === fileId) {
        setSelectedFile(null);
      }
      
      setFileSystem(prevFileSystem => {
        const removeFileFromSystem = (files) => {
          return files.filter(file => {
            if (file.id === fileId) {
              return false;
            }
            if (file.children) {
              file.children = removeFileFromSystem(file.children);
            }
            return true;
          });
        };
        const updatedFileSystem = removeFileFromSystem(prevFileSystem);
        localStorage.setItem('fileSystem', JSON.stringify(updatedFileSystem));
        return updatedFileSystem;
      });
      
      console.log('File deleted successfully');
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
            <Editor
              file={selectedFile}
              aiModifiedContent={aiModifiedContent}
              onSave={handleSaveContent}
            />
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