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

  useEffect(() => {
    const existingUserId = sessionStorage.getItem('userId');
    if (!existingUserId) {
      const newUserId = `user_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
      sessionStorage.setItem('userId', newUserId);  
    }

    fetchInitialFileSystem();

    const socket = io('/ng/cloud-drive-service', {
      path: '/socket.io'
    });
    socket.on('fileSystemUpdate', (updatedFileSystem) => {
      setFileSystem(updatedFileSystem);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const fetchInitialFileSystem = async () => {
    try {
      const response = await cloudDriveApi.getInitialFileSystem();
      setFileSystem(response.data);
    } catch (error) {
      console.error('Error fetching initial file system:', error);
    }
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
      setSelectedFile(prevFile => ({ ...prevFile, content }));
      
      setFileSystem(prevFileSystem => {
        const updateFileInSystem = (files) => {
          return files.map(file => {
            if (file.id === selectedFile.id) {
              return { ...file, content };
            }
            if (file.children) {
              return { ...file, children: updateFileInSystem(file.children) };
            }
            return file;
          });
        };
        return updateFileInSystem(prevFileSystem);
      });
    } catch (error) {
      console.error('Error saving file:', error);
    }
  }, [selectedFile]);

  const handleSelectFile = (file) => {
    setSelectedFile(file);
    setAiModifiedContent('');
  };

  const handleSendMessage = async (message) => {
    const userId = sessionStorage.getItem('userId');
    const newMessage = {
      sender: userId,
      content: message,
      timestamp: new Date().toISOString(),
      file: selectedFile ? selectedFile.id : null // 只发送文件ID，而不是整个文件对象
    };
    setMessages(prevMessages => [...prevMessages, newMessage]);

    try {
      const response = await transitServerApi.getChatContent(newMessage);
      setMessages(prevMessages => [...prevMessages, { sender: 'ai', content: response.data.content }]);
    } catch (error) {
      console.error('Error sending message:', error);
      setMessages(prevMessages => [...prevMessages, { sender: 'ai', content: 'Sorry, there was an error processing your request.' }]);
    }
  };

  const handleGenerateModification = async () => {
    try {
      const userId = sessionStorage.getItem('userId');
      const response = await transitServerApi.getFileContent({
        sender: userId,
        content: "Please modify this file",
        timestamp: new Date().toISOString(),
        file: selectedFile ? selectedFile.id : null // 只发送文件ID
      });
      setAiModifiedContent(response.data.content);
    } catch (error) {
      console.error('Error generating modification:', error);
    }
  };

  const handleSubmitModification = async () => {
    if (!selectedFile) return;

    try {
      await transitServerApi.getTrainData({
        file: selectedFile.id, // 只发送文件ID
        content: aiModifiedContent
      });
      setSelectedFile(prev => ({ ...prev, content: aiModifiedContent }));
      setAiModifiedContent('');
      
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
        return updateFileInSystem(prevFileSystem);
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
        return addFileToSystem(prevFileSystem);
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
        return removeFileFromSystem(prevFileSystem);
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
