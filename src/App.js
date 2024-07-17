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
  const [socket, setSocket] = useState(null);

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

    const newSocket = io('/ng/cloud-drive-service', {
      path: '/socket.io'
    });
    setSocket(newSocket);

    newSocket.on('fileSystemUpdate', (updatedFileSystem) => {
      setFileSystem(updatedFileSystem);
      localStorage.setItem('fileSystem', JSON.stringify(updatedFileSystem));
    });

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      newSocket.disconnect();
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  const fetchInitialFileSystem = async () => {
    try {
      const response = await cloudDriveApi.getInitialFileSystem();
      setFileSystem(response.data);
      localStorage.setItem('fileSystem', JSON.stringify(response.data));
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

  const handleSaveContent = useCallback(async (content) => {
    if (!selectedFile) return;

    try {
      await cloudDriveApi.saveFile({
        file: {
          id: selectedFile.id,
          content: content
        }
      });
      console.log('File saved successfully');

      const updatedFile = { ...selectedFile, content };
      setSelectedFile(updatedFile);
      
      setFileSystem(prevFileSystem => {
        const updateFileInSystem = (files) => {
          return files.map(file => {
            if (file.id === selectedFile.id) {
              return updatedFile;
            }
            if (file.children) {
              return { ...file, children: updateFileInSystem(file.children) };
            }
            return file;
          });
        };
        const updatedFileSystem = updateFileInSystem(prevFileSystem);
        localStorage.setItem('fileSystem', JSON.stringify(updatedFileSystem));
        socket.emit('fileSystemUpdate', updatedFileSystem);
        return updatedFileSystem;
      });
    } catch (error) {
      console.error('Error saving file:', error);
    }
  }, [selectedFile, socket]);

  const handleSelectFile = async (file) => {
    try {
      const response = await cloudDriveApi.getFileContent(file.id);
      const fileWithContent = { ...file, content: response.data.content };
      setSelectedFile(fileWithContent);
      setAiModifiedContent('');
    } catch (error) {
      console.error('Error fetching file content:', error);
    }
  };

  const handleSendMessage = async (message) => {
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
    setMessages(prevMessages => [...prevMessages, newMessage]);

    try {
      const response = await transitServerApi.getChatContent(newMessage);
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

      const response = await transitServerApi.getFileContent(genModifyMessage);
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

      await transitServerApi.getTrainData(sendModifyMessage);

      const updatedFile = { ...selectedFile, content: aiModifiedContent };
      setSelectedFile(updatedFile);
      setAiModifiedContent('');
      
      setFileSystem(prevFileSystem => {
        const updateFileInSystem = (files) => {
          return files.map(file => {
            if (file.id === selectedFile.id) {
              return updatedFile;
            }
            if (file.children) {
              return { ...file, children: updateFileInSystem(file.children) };
            }
            return file;
          });
        };
        const updatedFileSystem = updateFileInSystem(prevFileSystem);
        localStorage.setItem('fileSystem', JSON.stringify(updatedFileSystem));
        socket.emit('fileSystemUpdate', updatedFileSystem);
        return updatedFileSystem;
      });
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
        socket.emit('fileSystemUpdate', updatedFileSystem);
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
        socket.emit('fileSystemUpdate', updatedFileSystem);
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
