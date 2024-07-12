import React, { useState, useEffect, useCallback } from 'react';
import { Save, Edit } from 'lucide-react';
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

    // return () => {
    //   const userId = sessionStorage.getItem('userId');
    //   const formattedMessage = { user: userId };
      
    //   transitServerApi.cancel(formattedMessage)
    //     .then(response => console.log('Message sent successfully:', response.data))
    //     .catch(error => console.error('Error sending message:', error));
    // };
  }, []);
  
  const findFirstFileInHomeDirectory = (fileSystem) => {
    for (const item of fileSystem) {
      if (item.name === '~' && item.type === 'directory') {
        return item.children && item.children.length > 0 ? item.children[0] : null;
      } 
      else if (item.children) {
        const result = findFirstFileInHomeDirectory(item.children);
        if (result) return result;
      }
    }
    return null;
  };

  const fetchInitialFileSystem = async () => {
    try {
      const response = await cloudDriveApi.getInitialFileSystem();
      setFileSystem(response.data);

      const firstFileInHomeDirectory = findFirstFileInHomeDirectory(response.data);
      if (firstFileInHomeDirectory) {
        setSelectedFile(firstFileInHomeDirectory);
      }
    } catch (error) {
      console.error('Error fetching initial file system:', error);
    }
  };
  
  const handleSaveContent = useCallback(async (content) => {
    if (!selectedFile) return;

    try {
      const SaveMessage = {
        filePath: selectedFile.id,
        content: content
      };

      await cloudDriveApi.saveFile(SaveMessage);
      console.log('File saved successfully');
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
    const SendMessage = {
      user: userId,
      content: message,
      timestamp: new Date().toISOString(),
      file: selectedFile
    }; 
    setMessages(prevMessages => [...prevMessages, SendMessage]);

    try {
      const response = await transitServerApi.getChatContent(SendMessage);
      setMessages(prevMessages => [...prevMessages, { user: 'ai', content: response.data.content }]);
    } catch (error) {
      console.error('Error sending message:', error);
      setMessages(prevMessages => [...prevMessages, { user: 'ai', content: 'Sorry, there was an error processing your request.' }]);
    }
  };

  const handleGenerateModification = async (message) => {
    try {
      const userId = sessionStorage.getItem('userId');
      const GenModifyMessage = {
        user: userId,
        content: message,
        timestamp: new Date().toISOString(),
        file: selectedFile
      }; 

      const response = await transitServerApi.getFileContent(GenModifyMessage);
      setAiModifiedContent(response.data.content);
    } catch (error) {
      console.error('Error generating modification:', error);
    }
  };

  const handleSubmitModification = async () => {
    if (!selectedFile) return;

    try {
      const SubmitModifyMessage = {
        file: selectedFile, 
        content: aiModifiedContent
      };

      await transitServerApi.getTrainData(SubmitModifyMessage);
      setSelectedFile(prev => ({ ...prev, content: aiModifiedContent }));
      setAiModifiedContent('');
      fetchInitialFileSystem();
    } catch (error) {
      console.error('Error submitting modification:', error);
    }
  };

  const handleCreateFile = async (parentId, fileName) => {
    try {
      const CreateMessage = {
        filePath: `${parentId}/${fileName}`,
        name: fileName,
        content: "Initializing new file...\n"
      };

      await cloudDriveApi.createFile(CreateMessage);
      fetchInitialFileSystem();
    } catch (error) {
      console.error('Error creating file:', error);
    }
  };

  const handleCreateFolder = async (parentId, folderName) => {
    try {
      const CreateFolderMessage = {
        filePath: `${parentId}/${folderName}`,
        name: folderName,
        type: 'directory'
      };

      await cloudDriveApi.createFolder(CreateFolderMessage);
      fetchInitialFileSystem();
    } catch (error) {
      console.error('Error creating folder:', error);
    }
  };

  const handleDeleteFile = async (fileId, fileName) => {
    try {
      const DeleteMessage = {
        filePath: fileId,
        fileName: fileName
      };

      await cloudDriveApi.deleteFile(DeleteMessage);
      fetchInitialFileSystem();
      if (selectedFile && selectedFile.name === fileName) {
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
              onCreateFolder={handleCreateFolder}
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
