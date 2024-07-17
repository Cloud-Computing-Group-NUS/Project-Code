// test
// add "+"" at first
import React, { useState } from 'react';
import { Folder, File, PlusCircle, Trash2, FolderPlus } from 'lucide-react';

const FileTree = ({ files, onSelectFile, onCreateFile, onDeleteFile, selectedFileId }) => {
  const [newItemName, setNewItemName] = useState('');
  const [expandedFolders, setExpandedFolders] = useState(() => {
    // 从 localStorage 初始化 expandedFolders，如果没有则默认为 { root: true }
    const stored = localStorage.getItem('expandedFolders');
    return stored ? JSON.parse(stored) : { root: true };
  });
  const [showNewItemInput, setShowNewItemInput] = useState({ root: true });

  const toggleFolder = (id) => {
    setExpandedFolders(prev => {
      const updated = { ...prev, [id]: !prev[id] };
      // 将更新后的展开状态保存到 localStorage
      localStorage.setItem('expandedFolders', JSON.stringify(updated));
      return updated;
    });
  };

  const handleCreateItem = (parentId, isFolder = false) => {
    if (newItemName.trim()) {
      onCreateFile(parentId, newItemName.trim(), isFolder);
      setNewItemName('');
      setShowNewItemInput(prev => ({ ...prev, [parentId]: false }));
    }
  };

  const handleKeyPress = (e, parentId, isFolder = false) => {
    if (e.key === 'Enter') {
      handleCreateItem(parentId, isFolder);
    }
  };

  const renderNewItemInput = (parentId) => (
    <div className="flex items-center mb-2">
      <input
        type="text"
        value={newItemName}
        onChange={(e) => setNewItemName(e.target.value)}
        onKeyPress={(e) => handleKeyPress(e, parentId)}
        className="p-1 border rounded mr-2 text-sm flex-grow"
        placeholder="New item name"
      />
      <button
        onClick={() => handleCreateItem(parentId)}
        className="p-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition duration-300 mr-1"
      >
        <File size={16} />
      </button>
      <button
        onClick={() => handleCreateItem(parentId, true)}
        className="p-1 bg-yellow-500 text-white rounded hover:bg-yellow-600 transition duration-300"
      >
        <FolderPlus size={16} />
      </button>
    </div>
  );

  const renderTree = (items, parentId = 'root') => {
    if (items.length === 0 && parentId === 'root') {
      return (
        <li key="new-item-input" className="py-1">
          {renderNewItemInput('root')}
        </li>
      );
    }

    return items.map((item) => (
      <li key={item.id} className="py-1">
        {item.type === 'folder' ? (
          <div>
            <div className="flex items-center">
              <div 
                className="flex items-center cursor-pointer flex-grow" 
                onClick={() => toggleFolder(item.id)}
              >
                <Folder size={16} className="mr-2 text-yellow-500" />
                <span className="text-gray-800">{item.name}</span>
              </div>
              <button
                onClick={() => setShowNewItemInput(prev => ({ ...prev, [item.id]: !prev[item.id] }))}
                className="p-1 text-green-500 rounded hover:bg-green-100 transition duration-300 mr-1"
              >
                <PlusCircle size={16} />
              </button>
              {parentId !== 'root' && (
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
                {showNewItemInput[item.id] && renderNewItemInput(item.id)}
                <ul className="pl-4">
                  {item.children && item.children.length > 0 
                    ? renderTree(item.children, item.id)
                    : <li className="text-gray-500 italic">Empty folder</li>
                  }
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

  return (
    <div className="file-tree">
      <ul className="pl-4">
        {renderTree(files)}
      </ul>
    </div>
  );
};

export default FileTree;
