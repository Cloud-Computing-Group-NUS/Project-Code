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
    fetchInitialFileSystem();
  }, []);

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
    setMessages(prevMessages => [...prevMessages, { sender: 'user', content: message }]);
    try {
      const response = await axios.post('http://ai-agent:5000/ai_agent', { message, file: selectedFile });
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
