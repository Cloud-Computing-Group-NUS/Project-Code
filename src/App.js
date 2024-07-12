import React, { useState, useEffect, useCallback } from 'react';
import { Save, Edit } from 'lucide-react';
import FileTree from './components/FileTree';
import Editor from './components/Editor';
import ChatBox from './components/ChatBox';
import axios from 'axios';

function App() {

  // State Variables && Initialization Func
  const [fileSystem, setFileSystem] = useState([]); // "file system data"
  const [selectedFile, setSelectedFile] = useState(null); // "currently selected file"
  const [aiModifiedContent, setAiModifiedContent] = useState(''); // "AI-modified content"
  const [messages, setMessages] = useState([]); // "chat messages"

  // Generate a userID and store
  useEffect(() => {
    const existingUserId = sessionStorage.getItem('userId'); // Check if userId exists in sessionStorage
    if (!existingUserId) {
      // If not, generate a new userId and store it in sessionStorage
      const newUserId = `user_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
      sessionStorage.setItem('userId', newUserId);  
    }

    // Initialization (equals to UpdateFunc)
    fetchInitialFileSystem();

    // Interact with AI-backend
    // Cleanup function to disconnect WebSocket when component unmounts
    // return () => { 
    //   // When the component unmounts, send a "disconnect" message to the AI-backend
    //   const userId = sessionStorage.getItem('userId');
    //   const formattedMessage = { sender: userId };
      
    //   axios.post('http://transit-server:80/cancel', formattedMessage)
    //     .then(response => console.log('Message sent successfully:', response.data))
    //     .catch(error => console.error('Error sending message:', error));
    // };
  }, []);
  
  const findFirstFileInHomeDirectory = (fileSystem) => {
    // Find the first file in the `~` drt
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

  // Interact with Drive-Backend
  const fetchInitialFileSystem = async () => {
    // Get Initial/Updated FileSystem data from the backend
    try {
      const response = await axios.get('http://cloud-drive-service:80/api/initialFileSystem');
      setFileSystem(response.data); // Whole FileSystem Object

      // Get the first file under /~ in this FileSystem
      const firstFileInHomeDirectory = findFirstFileInHomeDirectory(response.data);
      if (firstFileInHomeDirectory) {
        setSelectedFile(firstFileInHomeDirectory);
      }
    } catch (error) {
      console.error('Error fetching initial file system:', error);
    }
  };
  
  // Interact with Drive-Backend
  const handleSaveContent = useCallback(async (content) => {
    // Save the modified content to the backend
    if (!selectedFile) return;

    try {
      const SaveMessage = {
        filePath: selectedFile.id,  // filePath is the relative path (id) of the file in the cloud drive
        content: content            // content is the people-modified text to be saved
      };

      await axios.post('http://cloud-drive-service:80/api/saveFile', SaveMessage); // send to Drive-Backend

      console.log('File saved successfully');
    } catch (error) {
      console.error('Error saving file:', error);
    }
  }, [selectedFile]);

  const handleSelectFile = (file) => { // @click this file
    setSelectedFile(file); // this file is in spot
    setAiModifiedContent(''); // clear AI-modified content
  };

  // Interact with AI-Backend
  const handleSendMessage = async (message) => {
    const userId = sessionStorage.getItem('userId');
    const SendMessage = {
      sender: userId,
      content: message,
      timestamp: new Date().toISOString(),
      file: selectedFile
    }; 
    setMessages(prevMessages => [...prevMessages, SendMessage]);

    try {
      const response = await axios.post("http://transit-server:80/get_chat_content", SendMessage); // send to AI-Backend
      // add AI-modified content to the chat-message-record
      setMessages(prevMessages => [...prevMessages, { sender: 'ai', content: response.data.content }]);
    } catch (error) {
      console.error('Error sending message:', error);
      // add Error to the chat-message-record
      setMessages(prevMessages => [...prevMessages, { sender: 'ai', content: 'Sorry, there was an error processing your request.' }]);
    }
  };

  // Interact with AI-Backend
  const handleGenerateModification = async (message) => {
    try {
      const userId = sessionStorage.getItem('userId');
      const GenModifyMessage = {
        sender: userId,
        content: message,
        timestamp: new Date().toISOString(),
        file: selectedFile
      }; 

      // send to AI-Backend
      const response = await axios.post('http://transit-server:80/get_file_content', GenModifyMessage);
      setAiModifiedContent(response.data.content);
    } catch (error) {
      console.error('Error generating modification:', error);
    }
  };

  const handleSubmitModification = async () => { // wait to be conformed
    if (!selectedFile) return;

    try {
      const SubmitModifyMessage = {
        file: selectedFile, 
        content: aiModifiedContent
      };

      await axios.post('http://transit-server:80/get_train_data', SubmitModifyMessage); // send to AI-Backend
      setSelectedFile(prev => ({ ...prev, content: aiModifiedContent }));
      setAiModifiedContent('');
      fetchInitialFileSystem();
    } catch (error) {
      console.error('Error submitting modification:', error);
    }
  };

  // Interact with Drive-Backend
  const handleCreateFile = async (parentId, fileName) => {
    // Create a new file in the backend
    // - FileName
    // - ParentId (where to create, FolderName)
    // We won't process PeopleInput here, instead, we will process it in handleSaveContent(content)
    try {
      // Problem: We still need to get parentId when Client chooses a folder to create!!!
      const CreateMessage = {
        filePath: `${parentId}/${fileName}`,    // relative path of the new file in the cloud drive
        name: fileName,                         // name of the new file
        content: "Initializing new file...\n"   // Initialize new file with empty content
      };

      await axios.post('http://cloud-drive-service:80/api/createFile', CreateMessage);
      fetchInitialFileSystem(); // Refresh the file system after creating the file
    } catch (error) {
      console.error('Error creating file:', error);
    }
  };

  // Interact with Drive-Backend
  const handleDeleteFile = async (fileId, fileName) => {
    // Create a new file in the backend
    // - FileName
    // - ParentId (where to create, FolderName)
    try {
      const DeleteMessage = {
        filePath: fileId,  // filePath is the relative path (id) of the file in the cloud drive
        fileName: fileName // name of the file to be deleted
      };

      await axios.delete('http://cloud-drive-service:80/api/deleteFile', DeleteMessage);
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