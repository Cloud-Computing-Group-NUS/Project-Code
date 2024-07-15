// import React, { useState, useEffect } from 'react';
// import ReactMarkdown from 'react-markdown';
// import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
// import { tomorrow } from 'react-syntax-highlighter/dist/esm/styles/prism';
// import { Edit, Save, Eye } from 'lucide-react';

// const Editor = ({ file, aiModifiedContent, onSave }) => {
//   const [isEditingOriginal, setIsEditingOriginal] = useState(false);
//   const [isEditingModified, setIsEditingModified] = useState(false);
//   const [originalContent, setOriginalContent] = useState('');
//   const [modifiedContent, setModifiedContent] = useState('');

//   useEffect(() => {
//     if (file) {
//       setOriginalContent(file.content || '');
//     }
//   }, [file]);

//   useEffect(() => {
//     setModifiedContent(aiModifiedContent || '');
//   }, [aiModifiedContent]);

//   const getLanguage = (fileName) => {
//     if (!fileName) return 'text';
//     const extension = fileName.split('.').pop().toLowerCase();
//     switch (extension) {
//       case 'md': return 'markdown';
//       case 'py': return 'python';
//       case 'js': return 'javascript';
//       case 'html': return 'html';
//       case 'css': return 'css';
//       case 'json': return 'json';
//       case 'tsx': case 'ts': return 'typescript';
//       case 'yml': case 'yaml': return 'yaml';
//       case 'sh': return 'bash';
//       case 'sql': return 'sql';
//       default: return 'text';
//     }
//   };

//   const language = file ? getLanguage(file.name) : 'text';

//   const renderContent = (content, isEditing, onChange) => {
//     if (isEditing) {
//       return (
//         <textarea
//           className="w-full h-full p-2 resize-none border-none outline-none bg-gray-100 font-mono"
//           value={content}
//           onChange={(e) => onChange(e.target.value)}
//         />
//       );
//     } else if (language === 'markdown') {
//       return (
//         <div className="prose max-w-none p-4 overflow-auto">
//           <ReactMarkdown>{content}</ReactMarkdown>
//         </div>
//       );
//     } else {
//       return (
//         <SyntaxHighlighter
//           language={language}
//           style={tomorrow}
//           customStyle={{
//             margin: 0,
//             padding: '1rem',
//             height: '100%',
//             fontSize: '0.9rem',
//           }}
//           wrapLines={true}
//           wrapLongLines={true}
//         >
//           {content}
//         </SyntaxHighlighter>
//       );
//     }
//   };

//   const handleSaveOriginal = () => {
//     onSave(originalContent);
//     setIsEditingOriginal(false);
//   };

//   const handleSaveModified = () => {
//     onSave(modifiedContent);
//     setIsEditingModified(false);
//   };

//   return (
//     <div className="w-full h-full flex space-x-4">
//       <div className="w-1/2 flex flex-col">
//         <div className="flex justify-between items-center mb-2">
//           <h3 className="text-lg font-bold">Original Content</h3>
//           <div>
//             <button
//               onClick={() => setIsEditingOriginal(!isEditingOriginal)}
//               className="p-2 bg-blue-500 text-white rounded mr-2 hover:bg-blue-600 transition duration-300"
//             >
//               {isEditingOriginal ? <Eye size={16} /> : <Edit size={16} />}
//             </button>
//             <button
//               onClick={handleSaveOriginal}
//               className="p-2 bg-green-500 text-white rounded hover:bg-green-600 transition duration-300"
//             >
//               <Save size={16} />
//             </button>
//           </div>
//         </div>
//         <div className="flex-grow border rounded-lg overflow-auto">
//           {renderContent(
//             originalContent,
//             isEditingOriginal,
//             setOriginalContent
//           )}
//         </div>
//       </div>
//       <div className="w-1/2 flex flex-col">
//         <div className="flex justify-between items-center mb-2">
//           <h3 className="text-lg font-bold">AI Modified Content</h3>
//           <div>
//             <button
//               onClick={() => setIsEditingModified(!isEditingModified)}
//               className="p-2 bg-blue-500 text-white rounded mr-2 hover:bg-blue-600 transition duration-300"
//             >
//               {isEditingModified ? <Eye size={16} /> : <Edit size={16} />}
//             </button>
//             <button
//               onClick={handleSaveModified}
//               className="p-2 bg-green-500 text-white rounded hover:bg-green-600 transition duration-300"
//             >
//               <Save size={16} />
//             </button>
//           </div>
//         </div>
//         <div className="flex-grow border rounded-lg overflow-auto">
//           {renderContent(
//             modifiedContent,
//             isEditingModified,
//             setModifiedContent
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Editor;

import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { tomorrow } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Edit, Save, Eye } from 'lucide-react';

const Editor = ({ file, aiModifiedContent, onSave }) => {
  const [isEditingOriginal, setIsEditingOriginal] = useState(false);
  const [isEditingModified, setIsEditingModified] = useState(false);
  const [originalContent, setOriginalContent] = useState('');
  const [modifiedContent, setModifiedContent] = useState('');

  useEffect(() => {
    if (file) {
      setOriginalContent(file.content || '');
    }
  }, [file]);

  useEffect(() => {
    setModifiedContent(aiModifiedContent || '');
  }, [aiModifiedContent]);

  const getLanguage = (fileName) => {
    if (!fileName) return 'text';
    const extension = fileName.split('.').pop().toLowerCase();
    switch (extension) {
      case 'md': return 'markdown';
      case 'py': return 'python';
      case 'js': return 'javascript';
      case 'html': return 'html';
      case 'css': return 'css';
      case 'json': return 'json';
      case 'tsx': case 'ts': return 'typescript';
      case 'yml': case 'yaml': return 'yaml';
      case 'sh': return 'bash';
      case 'sql': return 'sql';
      default: return 'text';
    }
  };

  const language = file ? getLanguage(file.name) : 'text';

  const renderContent = (content, isEditing, onChange) => {
    if (isEditing) {
      return (
        <textarea
          className="w-full h-full p-2 resize-none border-none outline-none bg-gray-100 font-mono"
          value={content}
          onChange={(e) => onChange(e.target.value)}
        />
      );
    } else if (language === 'markdown') {
      return (
        <div className="prose max-w-none p-4 overflow-auto">
          <ReactMarkdown>{content}</ReactMarkdown>
        </div>
      );
    } else {
      return (
        <SyntaxHighlighter
          language={language}
          style={tomorrow}
          customStyle={{
            margin: 0,
            padding: '1rem',
            height: '100%',
            fontSize: '0.9rem',
          }}
          wrapLines={true}
          wrapLongLines={true}
        >
          {content}
        </SyntaxHighlighter>
      );
    }
  };

  const handleSaveOriginal = () => {
    onSave(originalContent);
    setIsEditingOriginal(false);
  };

  const handleSaveModified = () => {
    onSave(modifiedContent);
    setIsEditingModified(false);
  };

  return (
    <div className="w-full h-full flex space-x-4">
      <div className="w-1/2 flex flex-col">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-lg font-bold">Original Content</h3>
          <div>
            <button
              onClick={() => setIsEditingOriginal(!isEditingOriginal)}
              className="p-2 bg-blue-500 text-white rounded mr-2 hover:bg-blue-600 transition duration-300"
            >
              {isEditingOriginal ? <Eye size={16} /> : <Edit size={16} />}
            </button>
            <button
              onClick={handleSaveOriginal}
              className="p-2 bg-green-500 text-white rounded hover:bg-green-600 transition duration-300"
            >
              <Save size={16} />
            </button>
          </div>
        </div>
        <div className="flex-grow border rounded-lg overflow-auto">
          {renderContent(
            originalContent,
            isEditingOriginal,
            setOriginalContent
          )}
        </div>
      </div>
      <div className="w-1/2 flex flex-col">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-lg font-bold">AI Modified Content</h3>
          <div>
            <button
              onClick={() => setIsEditingModified(!isEditingModified)}
              className="p-2 bg-blue-500 text-white rounded mr-2 hover:bg-blue-600 transition duration-300"
            >
              {isEditingModified ? <Eye size={16} /> : <Edit size={16} />}
            </button>
            <button
              onClick={handleSaveModified}
              className="p-2 bg-green-500 text-white rounded hover:bg-green-600 transition duration-300"
            >
              <Save size={16} />
            </button>
          </div>
        </div>
        <div className="flex-grow border rounded-lg overflow-auto">
          {renderContent(
            modifiedContent,
            isEditingModified,
            setModifiedContent
          )}
        </div>
      </div>
    </div>
  );
};

export default Editor;