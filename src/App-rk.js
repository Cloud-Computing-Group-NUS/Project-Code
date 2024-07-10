import React, { useState } from 'react';
import { Folder, File, Send, Save, Edit } from 'lucide-react';
import FileTree from './components/FileTree';
import Editor from './components/Editor';
import ChatBox from './components/ChatBox';

// 模拟文件系统数据
const initialFileSystem = [
  { id: 1, name: 'Documents', type: 'folder', children: [
    { id: 2, name: 'report.md', type: 'file', content: '# Report\n\nThis is a sample report.' },
    { id: 3, name: 'notes.md', type: 'file', content: '# Notes\n\n- Item 1\n- Item 2' },
  ]},
  { id: 4, name: 'Images', type: 'folder', children: [
    { id: 5, name: 'picture.jpg', type: 'file', content: 'Image content' },
  ]},
  { id: 6, name: 'README.md', type: 'file', content: '# README\n\nWelcome to the project.' },
];

function App() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [aiModifiedContent, setAiModifiedContent] = useState('');
  const [messages, setMessages] = useState([]);

  const handleSelectFile = (file) => {
    setSelectedFile(file);
    setAiModifiedContent('');
  };

  const handleContentChange = (newContent) => {
    setSelectedFile({ ...selectedFile, content: newContent });
  };

  const handleSendMessage = (message) => {
    setMessages([...messages, { sender: 'user', content: message }]);
    // Here you would typically send the message to your AI backend
    // and then add the AI's response to the messages
  };

  const handleGenerateModification = () => {
    // This would typically involve sending the content to your AI backend
    // and receiving the modified content
    setAiModifiedContent('AI modified content would appear here');
  };

  const handleSubmitModification = () => {
    // Here you would typically send the modified content to your backend
    // to update the file in the cloud drive
    console.log('Submitting modification:', aiModifiedContent);
  };

  return (
    <div className="h-screen flex flex-col">
      <div className="flex-grow flex">
        <div className="w-1/4 border-r p-4 overflow-y-auto">
          <h2 className="text-xl font-bold mb-4">Files</h2>
          <FileTree files={initialFileSystem} onSelectFile={handleSelectFile} />
        </div>
        <div className="w-3/4 flex flex-col">
          <div className="flex-grow flex">
            <div className="w-1/2 p-4">
              <h2 className="text-xl font-bold mb-4">Original Content</h2>
              <Editor 
                content={selectedFile ? selectedFile.content : ''}
                onChange={handleContentChange}
              />
            </div>
            <div className="w-1/2 p-4">
              <h2 className="text-xl font-bold mb-4">AI Modified Content</h2>
              <Editor 
                content={aiModifiedContent}
                onChange={setAiModifiedContent}
              />
            </div>
          </div>
          <div className="h-1/2 p-4 border-t">
            <h2 className="text-xl font-bold mb-4">Chat</h2>
            <ChatBox messages={messages} onSendMessage={handleSendMessage} />
          </div>
        </div>
      </div>
      <div className="flex justify-end p-4 border-t">
        <button onClick={handleGenerateModification} className="mr-2 p-2 bg-green-500 text-white rounded flex items-center">
          <Edit size={20} className="mr-1" />
          Generate Modification
        </button>
        <button onClick={handleSubmitModification} className="p-2 bg-blue-500 text-white rounded flex items-center">
          <Save size={20} className="mr-1" />
          Submit Modification
        </button>
      </div>
    </div>
  );
}

export default App;

// import logo from './logo.svg';
// import './App.css';

// function App() {
//   return (
//     <div className="App">
//       <header className="App-header">
//         <img src={logo} className="App-logo" alt="logo" />
//         <p>
//           Edit <code>src/App.js</code> and save to reload.
//         </p>
//         <a
//           className="App-link"
//           href="https://reactjs.org"
//           target="_blank"
//           rel="noopener noreferrer"
//         >
//           Learn React
//         </a>
//       </header>
//     </div>
//   );
// }

// export default App;