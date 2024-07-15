import React, { useState } from 'react';
import { Folder, File, PlusCircle, Trash2, FolderPlus } from 'lucide-react';

const FileTree = ({ files, onSelectFile, onCreateFile, onDeleteFile, selectedFileId }) => {
  const [newItemName, setNewItemName] = useState(''); // 存储新创建的文件或文件夹的名称
  const [expandedFolders, setExpandedFolders] = useState({ root: true }); // 存储已展开的文件夹的状态，默认情况下根文件夹是展开的
  const [showNewItemInput, setShowNewItemInput] = useState({ root: true }); // 默认显示根节点的新建输入框

  const toggleFolder = (id) => { // 切换文件夹的展开/折叠状态
    setExpandedFolders(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleCreateItem = (parentId, isFolder = false) => {
    // 处理新文件或文件夹的创建: 它接收父节点的 parentId 和一个布尔值 isFolder 表示是否创建文件夹
    if (newItemName.trim()) {
      onCreateFile(parentId, newItemName.trim(), isFolder);
      setNewItemName('');
      setShowNewItemInput(prev => ({ ...prev, [parentId]: false }));
    }
  };

  const handleKeyPress = (e, parentId, isFolder = false) => {
    // 处理输入框的键盘事件。当用户按下 Enter 键时，调用 handleCreateItem 函数创建新项目
    if (e.key === 'Enter') {
      handleCreateItem(parentId, isFolder);
    }
  };

  const renderNewItemInput = (parentId) => (
    // 渲染新建项目的输入框
    // 输入框允许用户输入新项目的名称，并提供两个按钮：创建file / 创建folder
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

  const renderTree = (items = [], parentId = 'root') => {
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
