// import React, { useState, useEffect, useCallback } from 'react';
// import { Save, Edit } from 'lucide-react';
// import FileTree from './components/FileTree';
// import Editor from './components/Editor';
// import ChatBox from './components/ChatBox';
// import axios from 'axios';

// function App() {

//    // 1. 初始化状态

//   // React中，useState用于在函数组件中添加状态，这样可以在不使用类组件的情况下管理组件的状态
//   const [fileSystem, setFileSystem] = useState([]);
//   /*
//   - fileSystem：状态变量，它将存储一个数组，这个数组可能代表了文件系统中的文件和目录列表
//   - setFileSystem：更新fileSystem状态的函数。可以通过调用setFileSystem并传入一个新的数组值来更新fileSystem的状态
//   */
//   const [selectedFile, setSelectedFile] = useState(null);
//   // selectedFile：状态变量，它将存储当前被选中的文件信息。初始化为null表示没有文件被选中
//   const [aiModifiedContent, setAiModifiedContent] = useState('');
//   // aiModifiedContent：状态变量，它将存储经过AI修改后的内容（可能是文本）。初始化为空字符串''
//   const [messages, setMessages] = useState([]);
//   // messages：一个状态变量，它将存储一个消息数组。这些消息可能是用户界面中显示的信息、警告或错误消息

//   // 2. useEffect Hook执行

//   useEffect(() => {
//     const existingUserId = sessionStorage.getItem('userId');
//     if (!existingUserId) {
//       const newUserId = `user_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
//       sessionStorage.setItem('userId', newUserId);
//     }

//     // 调用fetchInitialFileSystem函数来获取初始文件系统数据
//     fetchInitialFileSystem();

//     // Cleanup function
//     // 定义清理函数，用于在组件卸载或重新渲染前发送一条消息到后端
//     return () => {
//       // 从浏览器的sessionStorage中获取存储的用户ID：sessionStorage是一种Web Storage API，它允许在用户的浏览器上存储数据，但仅限于当前会话
//       const userId = sessionStorage.getItem('userId');
      
//       // formattedMessage这里很有问题
//       const formattedMessage = {
//         sender: userId,
//       };

//       // Sending formattedMessage to the backend
//       axios.post('http://your-backend-api-url', formattedMessage)
//         .then(response => {
//           console.log('Message sent successfully:', response.data);
//         })
//         .catch(error => {
//           console.error('Error sending message:', error);
//         });
//     };
//   }, [selectedFile]);

//   // 3. 定义函数：

//   // with云盘 获取初始文件系统数据（在本代码中，Update <=> Initial） 
//   const fetchInitialFileSystem = async () => {
//     try {
//       const response = await axios.get('http://cloud-drive-service:80/api/initialFileSystem');
//       setFileSystem(response.data);
//       if (response.data.length > 0) {
//         setSelectedFile(response.data[0].content);
//       }
//     } catch (error) {
//       console.error('Error fetching initial file system:', error);
//     }
//     /*
//     - fetchInitialFileSystem函数被调用，异步地从后端获取文件系统数据，然后更新fileSystem状态
//     - 如果获取的数据中至少有一个文件，selectedFile状态将被设置为数组中的第一个文件
//     */
//   };

//   // with云盘 保存文件
//   const handleSaveContent = useCallback(async () => {
//     if (!selectedFile) return;

//     try {
//       await axios.post('http://cloud-drive-service:80/api/saveFile', { file: selectedFile });
//       /*
//         使用axios库发出一个POST请求到指定的URL（http://cloud-drive-service:80/api/saveFile），
//         并将selectedFile对象作为请求体的一部分发送。
//         这里的await关键字保证了异步请求的完成才继续执行后续代码
//       */
//       console.log('File saved successfully');
//     } catch (error) {
//       console.error('Error saving file:', error);
//     }
//   }, [selectedFile]);

//   useEffect(() => {
//     /*
//       定义一个副作用，即在组件挂载后执行一些操作，并在特定条件下（依赖数组改变时）重新执行这些操作。
//       这里的依赖数组只包含handleSaveContent，意味着每当handleSaveContent函数引用改变时，副作用将重新执行
//     */
//     const handleKeyDown = (event) => { 
//       if (event.ctrlKey && event.key === 's') {
//         // 检测用户是否按下了Ctrl + S组合键
//         event.preventDefault(); // 避免浏览器的默认保存功能被执行
//         handleSaveContent();
//       }
//     };

//     document.addEventListener('keydown', handleKeyDown); // 将handleKeyDown函数注册为keydown事件的监听器。这意味着，只要文档上的任何地方发生keydown事件，handleKeyDown就会被调用

//     return () => {
//       document.removeEventListener('keydown', handleKeyDown);
//       // 清理函数，它会在组件卸载或重新渲染之前执行。用于移除之前添加的事件监听器，防止内存泄漏
//     };
//   }, [handleSaveContent]);

//   const handleSelectFile = (file) => {
//     setSelectedFile(file);
//     // 将当前选中的文件设置为参数file。这通常发生在：用户从文件树中选择了一个文件之后，以确保UI的其他部分（如编辑器）能够显示和编辑正确的文件内容
//     setAiModifiedContent(''); // 每当用户选择一个新文件时，任何先前的AI修改内容（对于上一个文本）都应该被清除，以便用户能够看到新文件的原始内容，而不是之前的修改结果
//   };

//   const handleContentChange = (newContent) => {
//     setSelectedFile({ ...selectedFile, content: newContent });
//     /*
//     - 接收一个参数newContent，表示文件的新内容，通常来自于用户在编辑器中的输入
//     - 使用扩展运算符...来复制当前的selectedFile对象，并将content属性更新为newContent。然后，使用setSelectedFile函数更新状态，确保selectedFile对象中的内容反映用户最新的编辑
//     */
//   };

//   // with AI后端
//   const handleSendMessage = async (message) => {
//     // 处理用户发送消息的逻辑，包括消息格式化、发送到AI代理服务、更新本地消息状态

//     const userId = sessionStorage.getItem('userId'); // 从sessionStorage中获取用户ID

//     const formattedMessage = { // 给后端-1（数据处理端）发送文件的格式
//       sender: userId,
//       content: message,
//       timestamp: new Date().toISOString(),
//       file: selectedFile
//     }; 

//     // 用户发送消息时，将消息添加到消息列表中，并发送到AI代理服务
//     setMessages(prevMessages => [...prevMessages, formattedMessage]); // 更新messages状态，传递 & 维护 formattedMessage

//     try {
//       const response = await axios.post('http://ai-agent:5000/ai_agent', formattedMessage); // 正确地发送异步请求到AI代理服务的URL，等待响应：请求体是formattedMessage
//       setMessages(prevMessages => [...prevMessages, { sender: 'ai', content: response.data.content }]);
//       // 如果AI代理服务成功响应，这行代码将把AI的响应添加到消息列表中。sender被设置为'ai'，表示这是AI发出的消息，而content字段则是AI响应的实际内容。这使得用户能够在界面上看到AI的回复
//     } catch (error) {
//       console.error('Error sending message:', error);
//       setMessages(prevMessages => [...prevMessages, { sender: 'ai', content: 'Sorry, there was an error processing your request.' }]);
//     }
//   };

//   // with AI后端
//   const handleGenerateModification = async () => {
//     try {
//       // 发送POST请求到AI代理服务器的 /ai_agent 端点
//       const userId = sessionStorage.getItem('userId');
      
//       const formattedMessage = { // 给后端-1（数据处理端）发送请求修改文件的信息格式
//         sender: userId,
//         timestamp: new Date().toISOString(),
//         file: selectedFile
//       }; 

//       const response = await axios.post('http://ai-agent:5000/ai_agent', {
//         message: formattedMessage,
//         file: selectedFile
//       });
//       setAiModifiedContent(response.data.content); // 将AI生成的修改内容更新到组件状态中
//     } catch (error) {
//       console.error('Error generating modification:', error);
//     }
//   };

//   // with AI后端
//   const handleSubmitModification = async () => {
//     if (!selectedFile) return;
//     try {
//       await axios.post('http://cloud-drive-service:80/api/saveFile', {
//         file: { ...selectedFile, content: aiModifiedContent }
//       });
//       // 发送的数据是一个对象，其中包含 file 属性。file 的值是通过扩展运算符 (...) 将 selectedFile 对象的属性复制，并添加或更新 content 属性为 aiModifiedContent 来创建的
//       // 意味着修改后的文件内容将被发送到服务器进行保存
//       setSelectedFile(prev => ({ ...prev, content: aiModifiedContent }));

//       // 归零现有界面
//       setAiModifiedContent('');
//       fetchInitialFileSystem(); // Refresh the file system
//     } catch (error) {
//       console.error('Error submitting modification:', error);
//     }
//   };

//   const handleCreateFile = async (parentId, fileName) => {
//     try {
//       await axios.post('http://cloud-drive-service:80/api/createFile', { parentId, fileName });
//       // parentId 表示新文件将要被创建在的目录的 ID
//       // fileName 表示新文件的名称，这个名称将用于新创建的文件
//       fetchInitialFileSystem(); // Refresh the file system
//     } catch (error) {
//       console.error('Error creating file:', error);
//     }
//   };

//   const handleDeleteFile = async (fileId) => {
//     try {
//       await axios.delete(`http://cloud-drive-service:80/api/deleteFile/${fileId}`);
//       //  axios.delete 方法发送一个 DELETE 请求到指定的 URL 'http://cloud-drive-service:80/api/deleteFile/${fileId}'。
//       // fileId 是文件的唯一标识符，它被嵌入到 URL 中，用于告诉后端需要删除哪个文件

//       fetchInitialFileSystem(); // Refresh the file system
//       if (selectedFile && selectedFile.name === fileId) {
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
//               selectedFileId={selectedFile ? selectedFile.name : null}
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

    return () => {
      const userId = sessionStorage.getItem('userId');
      const formattedMessage = { sender: userId };
      axios.post('http://your-backend-api-url', formattedMessage)
        .then(response => console.log('Message sent successfully:', response.data))
        .catch(error => console.error('Error sending message:', error));
    };
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

  const handleSaveContent = useCallback(async (content) => {
    if (!selectedFile) return;
    try {
      await axios.post('http://cloud-drive-service:80/api/saveFile', { 
        file: { ...selectedFile, content } 
      });
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
    const formattedMessage = {
      sender: userId,
      content: message,
      timestamp: new Date().toISOString(),
      file: selectedFile
    };
    setMessages(prevMessages => [...prevMessages, formattedMessage]);

    try {
      const response = await axios.post('http://ai-agent:5000/ai_agent', formattedMessage);
      setMessages(prevMessages => [...prevMessages, { sender: 'ai', content: response.data.content }]);
    } catch (error) {
      console.error('Error sending message:', error);
      setMessages(prevMessages => [...prevMessages, { sender: 'ai', content: 'Sorry, there was an error processing your request.' }]);
    }
  };

  const handleGenerateModification = async () => {
    try {
      const userId = sessionStorage.getItem('userId');
      const formattedMessage = {
        sender: userId,
        timestamp: new Date().toISOString(),
        file: selectedFile
      };
      const response = await axios.post('http://ai-agent:5000/ai_agent', {
        message: formattedMessage,
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
      fetchInitialFileSystem();
    } catch (error) {
      console.error('Error submitting modification:', error);
    }
  };

  const handleCreateFile = async (parentId, fileName) => {
    try {
      await axios.post('http://cloud-drive-service:80/api/createFile', { parentId, fileName });
      fetchInitialFileSystem();
    } catch (error) {
      console.error('Error creating file:', error);
    }
  };

  const handleDeleteFile = async (fileId) => {
    try {
      await axios.delete(`http://cloud-drive-service:80/api/deleteFile/${fileId}`);
      fetchInitialFileSystem();
      if (selectedFile && selectedFile.name === fileId) {
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