import React, { useState, useEffect, useCallback } from 'react';
import { Save, Edit } from 'lucide-react';
import io from 'socket.io-client';
import FileTree from './components/FileTree';
import Editor from './components/Editor';
import ChatBox from './components/ChatBox';
import { transitServerApi, cloudDriveApi } from './apiClient';

function App() {
  const [fileSystem, setFileSystem] = useState([]); // FileSystem "Object"
  const [selectedFile, setSelectedFile] = useState(null); // SelectedFile "Object"
  const [aiModifiedContent, setAiModifiedContent] = useState(''); // AI-modified "Content"
  const [messages, setMessages] = useState([]); // Conversation "Messages History"

  useEffect(() => {
    const existingUserId = sessionStorage.getItem('userId');
    if (!existingUserId) { // 如果不存在userId，则创建一个新的userId并将其存储在sessionStorage中
      const newUserId = `user_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
      sessionStorage.setItem('userId', newUserId);  
    }

    fetchInitialFileSystem();

    const socket = io('/ng/cloud-drive-service', {
      path: '/socket.io'
    }); // 创建一个到服务器的WebSocket连接
    socket.on('fileSystemUpdate', (updatedFileSystem) => {
      setFileSystem(updatedFileSystem);
    }); // 监听fileSystemUpdate事件，当服务器发送更新后的文件系统数据时，setFileSystem(updatedFileSystem)将被调用来更新组件状态

    return () => {
      socket.disconnect();
    };
  }, []);

  // with Drive-Backend
  const fetchInitialFileSystem = async () => {
    try {
      const response = await cloudDriveApi.getInitialFileSystem(); // Web <-> Drive -> initialFileSystem
      setFileSystem(response.data);
    } catch (error) {
      console.error('Error fetching initial file system:', error);
    }
  };

  // with Drive-Backend
  const handleSaveContent = useCallback(async (content) => {
    // 接收一个参数content，即要保存的文件内容
    if (!selectedFile) return;

    try {
      await cloudDriveApi.saveFile({
        file: {
          id: selectedFile.id,
          content: content
        }
      });
      console.log('File saved successfully');
      setSelectedFile(prevFile => ({ ...prevFile, content })); // 更新本地状态selectedFile，将最新的文件内容content赋值给selectedFile的content属性
      
      setFileSystem(prevFileSystem => { // 更新应用程序的文件系统状态，确保文件系统中包含最新的文件内容
        const updateFileInSystem = (files) => { // 用于递归遍历文件系统树，查找与selectedFile.id匹配的文件，并更新其内容
          return files.map(file => {
            if (file.id === selectedFile.id) { // 文件的id与selectedFile.id相同，返回一个新对象，其内容更新为content
              return { ...file, content };
            }
            if (file.children) { // 文件有子文件，递归调用updateFileInSystem函数来更新子文件的内容
              return { ...file, children: updateFileInSystem(file.children) };
            }
            return file; // 文件的id不匹配且没有子文件，直接返回原文件对象
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

  // with AI-Backend
  const handleSendMessage = async (message) => {
    const userId = sessionStorage.getItem('userId'); // 标识消息的发送者
    const newMessage = {
      sender: userId,
      content: message,
      timestamp: new Date().toISOString(),
      file: selectedFile ? selectedFile.id : null // 如果selectedFile存在，则为它的ID，否则为null。表示如果用户发送消息时关联了一个文件，仅发送文件的ID，而不是整个文件对象
    };
    setMessages(prevMessages => [...prevMessages, newMessage]); // setMessages函数更新本地状态，将新消息添加 (append) 到现有的消息列表

    try {
      const response = await transitServerApi.getChatContent(newMessage);
      setMessages(prevMessages => [...prevMessages, { sender: 'ai', content: response.data.content }]); // AI-Res append
    } catch (error) {
      console.error('Error sending message:', error);
      setMessages(prevMessages => [...prevMessages, { sender: 'ai', content: 'Sorry, there was an error processing your request.' }]); // Error append
    }
  };

  const handleGenerateModification = async () => {
    if (!selectedFile) return;

    try {
      const userId = sessionStorage.getItem('userId');
      const genModifyMessage = {
        sender: userId,
        content: "Please modify this file",
        timestamp: new Date().toISOString(),
        prevFile: selectedFile ? selectedFile.id : null, // 只发送文件ID
        aiModifiedContent: aiModifiedContent // 发送AI修改后的内容
      };

      const response = await transitServerApi.getFileContent(genModifyMessage); // 发送请求，建立连接，传递 genModifyMessage 对象，等待响应
      setAiModifiedContent(response.data.content); // 从响应中提取修改后的内容，并调用 setAiModifiedContent 将其设置为AI修改后的内容
    } catch (error) {
      console.error('Error generating modification:', error);
    }
  };

  const handleSubmitModification = async () => {
    if (!selectedFile) return;

    try {
      const userId = sessionStorage.getItem('userId');

      const sendModifyMessage = {
        sender: userId,
        content: "submit modified file",
        timestamp: new Date().toISOString(),
        prevFile: selectedFile ? selectedFile.id : null, // 只发送文件ID
        aiModifiedContent: aiModifiedContent // 发送AI修改后的内容
      };

      await transitServerApi.getTrainData(sendModifyMessage);

      setSelectedFile(prev => ({ ...prev, content: aiModifiedContent })); 
      // setSelectedFile 更新选中文件的内容，将其设置为AI修改后的内容。
      // 箭头函数=> ，保留文件的其他属性，仅更新 content 属性
      setAiModifiedContent(''); // 将 aiModifiedContent 清空，重置为初始状态
      
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
      /**
       * 用 setFileSystem 更新文件系统的状态。
       * 定义一个名为 updateFileInSystem 的函数，该函数递归地遍历文件系统中的所有文件，并更新与选中文件ID匹配的文件内容。
       * 如果文件有子文件夹，则递归更新子文件夹中的文件。最终返回更新后的文件系统
       */
    } catch (error) {
      console.error('Error submitting modification:', error);
    }
  };

  // with Drive-Backend
  const handleCreateFile = async (parentId, fileName, isFolder = false) => {
    // parentId（父文件夹的ID）
    // fileName（要创建的文件或文件夹的名称）
    // 可选的布尔值isFolder，默认为false，表示是否创建的是文件夹
    try {
      const response = await cloudDriveApi.createFile({ parentId, name: fileName, type: isFolder ? 'folder' : 'file' });
      const newFile = response.data.file;
      
      setFileSystem(prevFileSystem => { // 更新应用程序的文件系统状态
        const addFileToSystem = (files) => { // 递归地遍历文件系统树，并在适当的位置添加新创建的文件或文件夹
          if (parentId === 'root') {
            // parentId是'root'，则直接在文件列表末尾添加newFile
            return [...files, newFile]; 
          }
          return files.map(file => {
            // files.map()函数遍历当前文件系统中的所有文件和文件夹，目的是：找到正确的父节点并把新创建的文件或文件夹添加到其子节点列表中
            if (file.id === parentId) { 
              // 每一个file，代码检查其id是否与parentId相匹配。parentId是新创建的文件或文件夹应该被添加到的父文件夹的ID
              return {
                ...file,
                children: [...(file.children || []), newFile]
              };
            // 如果file.id与parentId匹配，那么file会被替换成一个新的对象，其children属性包含了原有的所有子文件/文件夹和新创建的newFile
            }
            // 对于每个file，如果它有子节点（即file.children存在），那么需要递归地处理这些子节点
            if (file.children) { 
              return { ...file, children: addFileToSystem(file.children) }; // 在文件系统树中正确地向下传递新创建的文件或文件夹
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

  // with Drive-Backend
  const handleDeleteFile = async (fileId) => {
    // fileId，这是要删除的文件的ID
    try {
      await cloudDriveApi.deleteFile({ fileId });
      if (selectedFile && selectedFile.id === fileId) {
        setSelectedFile(null); // 如果删除的文件是当前选中的文件，则将selectedFile状态设置为null，以取消选中该文件
      }
      
      setFileSystem(prevFileSystem => {
        const removeFileFromSystem = (files) => { 
          // 递归地遍历文件系统树，并删除指定的文件
          return files.filter(file => {
            if (file.id === fileId) {
              return false; // 如果当前文件的 id 等于要删除的 fileId，则返回 false，从而在过滤中移除该文件
            }
            if (file.children) {
              file.children = removeFileFromSystem(file.children);
              // 如果当前文件有子文件 (file.children)，则递归调用 removeFileFromSystem 处理子文件，确保子文件中也能删除指定的文件
            }
            return true; // 如果当前文件不是要删除的文件，则返回 true，从而保留该文件
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
