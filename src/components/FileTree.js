// import React, { useState } from 'react';
// import { Folder, File, PlusCircle, Trash2 } from 'lucide-react';

// const FileTree = ({ files, onSelectFile, onCreateFile, onDeleteFile, selectedFileId }) => {
//   const [newFileName, setNewFileName] = useState('');
//   const [expandedFolders, setExpandedFolders] = useState({});

//   const toggleFolder = (id) => {
//     setExpandedFolders(prev => ({ ...prev, [id]: !prev[id] }));
//   };

//   const handleCreateFile = (parentId) => {
//     if (newFileName.trim()) {
//       onCreateFile(parentId, newFileName.trim());
//       setNewFileName('');
//     }
//   };

//   const renderTree = (items) => {
//     return items.map((item) => (
//       <li key={item.id} className="py-1">
//         {item.type === 'folder' ? (
//           <div>
//             <div className="flex items-center cursor-pointer" onClick={() => toggleFolder(item.id)}>
//               <Folder size={16} className="mr-2 text-yellow-500" />
//               <span className="text-gray-800">{item.name}</span>
//             </div>
//             {expandedFolders[item.id] && (
//               <div className="ml-4 mt-2">
//                 <input
//                   type="text"
//                   value={newFileName}
//                   onChange={(e) => setNewFileName(e.target.value)}
//                   className="p-1 border rounded mr-2 text-sm"
//                   placeholder="New File Name"
//                 />
//                 <button
//                   onClick={() => handleCreateFile(item.id)}
//                   className="p-1 bg-green-500 text-white rounded hover:bg-green-600 transition duration-300"
//                 >
//                   <PlusCircle size={16} />
//                 </button>
//                 <ul className="pl-4 mt-2">
//                   {renderTree(item.children)}
//                 </ul>
//               </div>
//             )}
//           </div>
//         ) : (
//           <div className={`flex items-center ${selectedFileId === item.id ? 'bg-blue-100' : ''}`}>
//             <div 
//               className="flex items-center cursor-pointer flex-grow p-1 rounded"
//               onClick={() => onSelectFile(item)}
//             >
//               <File size={16} className="mr-2 text-blue-500" />
//               <span className="text-gray-800">{item.name}</span>
//             </div>
//             <button
//               onClick={() => onDeleteFile(item.id)}
//               className="p-1 text-red-500 rounded hover:bg-red-100 transition duration-300"
//             >
//               <Trash2 size={16} />
//             </button>
//           </div>
//         )}
//       </li>
//     ));
//   };

//   return <ul className="pl-4">{renderTree(files)}</ul>;
// };

// export default FileTree;

import React, { useState } from 'react';
import { Folder, File, PlusCircle, Trash2 } from 'lucide-react';

const FileTree = ({ files, onSelectFile, onCreateFile, onDeleteFile, selectedFileId }) => {
  const [newFileName, setNewFileName] = useState('');
  const [expandedFolders, setExpandedFolders] = useState({});

  const toggleFolder = (id) => {
    setExpandedFolders(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleCreateFile = (parentId) => {
    if (newFileName.trim()) {
      onCreateFile(parentId, newFileName.trim());
      setNewFileName('');
    }
  };

  const handleKeyPress = (e, parentId) => {
    if (e.key === 'Enter') {
      handleCreateFile(parentId);
    }
  };

  const renderTree = (items) => {
    return items.map((item) => (
      <li key={item.id} className="py-1">
        {item.type === 'folder' ? (
          <div>
            <div className="flex items-center cursor-pointer" onClick={() => toggleFolder(item.id)}>
              <Folder size={16} className="mr-2 text-yellow-500" />
              <span className="text-gray-800">{item.name}</span>
            </div>
            {expandedFolders[item.id] && (
              <div className="ml-4 mt-2">
                <input
                  type="text"
                  value={newFileName}
                  onChange={(e) => setNewFileName(e.target.value)}
                  onKeyPress={(e) => handleKeyPress(e, item.id)}  // Handle key press for Enter key
                  className="p-1 border rounded mr-2 text-sm"
                  placeholder="New File Name"
                />
                <button
                  onClick={() => handleCreateFile(item.id)}
                  className="p-1 bg-green-500 text-white rounded hover:bg-green-600 transition duration-300"
                >
                  <PlusCircle size={16} />
                </button>
                <ul className="pl-4 mt-2">
                  {renderTree(item.children)}
                </ul>
              </div>
            )}
          </div>
        ) : (
          <div className={`flex items-center ${selectedFileId === item.id ? 'bg-blue-100' : ''}`}>
            <div 
              className="flex items-center cursor-pointer flex-grow p-1 rounded"
              onClick={() => onSelectFile(item)}
            >
              <File size={16} className="mr-2 text-blue-500" />
              <span className="text-gray-800">{item.name}</span>
            </div>
            <button
              onClick={() => onDeleteFile(item.id)}
              className="p-1 text-red-500 rounded hover:bg-red-100 transition duration-300"
            >
              <Trash2 size={16} />
            </button>
          </div>
        )}
      </li>
    ));
  };

  return <ul className="pl-4 h-1/2 overflow-y-auto">{renderTree(files)}</ul>;
};

export default FileTree;
