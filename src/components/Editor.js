// import React, { useState } from 'react';
// import ReactMarkdown from 'react-markdown';
// import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
// import { tomorrow } from 'react-syntax-highlighter/dist/cjs/styles/prism';

// const Editor = ({ file, onChange }) => {
//   const [isEditing, setIsEditing] = useState(false);

//   if (!file || !file.name) {
//     return <div className="text-gray-500">No file selected or file name is undefined</div>;
//   }

//   const getLanguage = (fileName) => {
//     const extension = fileName.split('.').pop().toLowerCase();
//     switch (extension) {
//       case 'md':
//         return 'markdown';
//       case 'py':
//         return 'python';
//       case 'cpp':
//         return 'cpp';
//       default:
//         return 'text';
//     }
//   };

//   const language = getLanguage(file.name);

//   const handleChange = (e) => {
//     onChange(e.target.value);
//   };

//   const toggleEdit = () => {
//     setIsEditing(!isEditing);
//   };

//   return (
//     <div className="w-full h-full flex flex-col">
//       <div className="flex-grow">
//         {isEditing || language === 'markdown' ? (
//           <textarea
//             className="w-full h-full p-2 border rounded resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
//             value={file.content || ''}
//             onChange={handleChange}
//           />
//         ) : (
//           <div className="w-full h-full overflow-auto">
//             <SyntaxHighlighter
//               language={language}
//               style={tomorrow}
//               customStyle={{
//                 margin: 0,
//                 padding: '1rem',
//                 borderRadius: '0.375rem',
//               }}
//               wrapLines={true}
//               wrapLongLines={true}
//             >
//               {file.content || ''}
//             </SyntaxHighlighter>
//           </div>
//         )}
//       </div>
//       {language !== 'markdown' && (
//         <button
//           onClick={toggleEdit}
//           className="mt-2 p-2 bg-blue-500 text-white rounded-md transition duration-300 ease-in-out hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
//         >
//           {isEditing ? 'View' : 'Edit'}
//         </button>
//       )}
//       {language === 'markdown' && (
//         <div className="mt-4 p-2 border rounded overflow-y-auto markdown-body">
//           <ReactMarkdown>{file.content || ''}</ReactMarkdown>
//         </div>
//       )}
//     </div>
//   );
// };

// export default Editor;

import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { tomorrow } from 'react-syntax-highlighter/dist/cjs/styles/prism';

const Editor = ({ file, onChange }) => {
  const [isEditing, setIsEditing] = useState(false);

  if (!file || !file.name) {
    return <div className="text-gray-500">No file selected or file name is undefined</div>;
  }

  const getLanguage = (fileName) => {
    const extension = fileName.split('.').pop().toLowerCase();
    switch (extension) {
      case 'md':
        return 'markdown';
      case 'py':
        return 'python';
      case 'cpp':
        return 'cpp';
      default:
        return 'text';
    }
  };

  const language = getLanguage(file.name);

  const handleChange = (e) => {
    onChange(e.target.value);
  };

  const toggleEdit = () => {
    setIsEditing(!isEditing);
  };

  return (
    <div className="w-full h-full flex flex-col">
      <div className="flex-grow">
        {isEditing || language === 'markdown' ? (
          <textarea
            className="w-full h-full p-2 border rounded resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={file.content || ''}
            onChange={handleChange}
          />
        ) : (
          <div className="w-full h-full overflow-auto">
            <SyntaxHighlighter
              language={language}
              style={tomorrow}
              customStyle={{
                margin: 0,
                padding: '1rem',
                borderRadius: '0.375rem',
              }}
              wrapLines={true}
              wrapLongLines={true}
            >
              {file.content || ''}
            </SyntaxHighlighter>
          </div>
        )}
      </div>
      {language !== 'markdown' && (
        <button
          onClick={toggleEdit}
          className="mt-2 p-2 bg-blue-500 text-white rounded-md transition duration-300 ease-in-out hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
        >
          {isEditing ? 'View' : 'Edit'}
        </button>
      )}
      {language === 'markdown' && (
        <div className="mt-4 p-2 border rounded overflow-y-auto markdown-body">
          <ReactMarkdown>{file.content || ''}</ReactMarkdown>
        </div>
      )}
    </div>
  );
};

export default Editor;
