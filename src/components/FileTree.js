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

//   const handleKeyPress = (e, parentId) => {
//     if (e.key === 'Enter') {
//       handleCreateFile(parentId);
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
//                   onKeyPress={(e) => handleKeyPress(e, item.id)}
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

//   return <ul className="pl-4 h-1/2 overflow-y-auto">{renderTree(files)}</ul>;
// };

// export default FileTree;

import React, { useState } from 'react';
import { Folder, File, PlusCircle, Trash2, FolderPlus } from 'lucide-react';

const FileTree = ({ files, onSelectFile, onCreateFile, onDeleteFile, onCreateFolder, selectedFileId }) => {
  const [newItemName, setNewItemName] = useState('');
  const [expandedFolders, setExpandedFolders] = useState({});
  const [showNewItemInput, setShowNewItemInput] = useState({});

  const toggleFolder = (id) => {
    setExpandedFolders(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleCreateItem = (parentId, isFolder = false) => {
    if (newItemName.trim()) {
      if (isFolder) {
        onCreateFolder(parentId, newItemName.trim());
      } else {
        onCreateFile(parentId, newItemName.trim());
      }
      setNewItemName('');
      setShowNewItemInput(prev => ({ ...prev, [parentId]: false }));
    }
  };

  const handleKeyPress = (e, parentId, isFolder = false) => {
    if (e.key === 'Enter') {
      handleCreateItem(parentId, isFolder);
    }
  };

  const renderTree = (items, parentId = null) => {
    return items.map((item) => (
      <li key={item.id} className="py-1">
        {item.type === 'folder' ? (
          <div>
            <div className="flex items-center">
              <div className="flex items-center cursor-pointer flex-grow" onClick={() => toggleFolder(item.id)}>
                <Folder size={16} className="mr-2 text-yellow-500" />
                <span className="text-gray-800">{item.name}</span>
              </div>
              <button
                onClick={() => setShowNewItemInput(prev => ({ ...prev, [item.id]: !prev[item.id] }))}
                className="p-1 text-green-500 rounded hover:bg-green-100 transition duration-300 mr-1"
              >
                <PlusCircle size={16} />
              </button>
              {parentId && (
                <button
                  onClick={() => onDeleteFile(item.id)}
                  className="p-1 text-red-500 rounded hover:bg-red-100 transition duration-300"
                >
                  <Trash2 size={16} />
                </button>
              )}
            </div>
            {expandedFolders[item.id] && (
              <div className="ml-4 mt-2">
                {showNewItemInput[item.id] && (
                  <div className="flex items-center mb-2">
                    <input
                      type="text"
                      value={newItemName}
                      onChange={(e) => setNewItemName(e.target.value)}
                      onKeyPress={(e) => handleKeyPress(e, item.id)}
                      className="p-1 border rounded mr-2 text-sm flex-grow"
                      placeholder="New item name"
                    />
                    <button
                      onClick={() => handleCreateItem(item.id)}
                      className="p-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition duration-300 mr-1"
                    >
                      <File size={16} />
                    </button>
                    <button
                      onClick={() => handleCreateItem(item.id, true)}
                      className="p-1 bg-yellow-500 text-white rounded hover:bg-yellow-600 transition duration-300"
                    >
                      <FolderPlus size={16} />
                    </button>
                  </div>
                )}
                <ul className="pl-4">
                  {renderTree(item.children, item.id)}
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

  return <ul className="pl-4">{renderTree(files)}</ul>;
};

export default FileTree;