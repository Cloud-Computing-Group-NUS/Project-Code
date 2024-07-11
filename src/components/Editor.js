import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { tomorrow } from 'react-syntax-highlighter/dist/cjs/styles/prism';
import '../Editor.css'; // 确保路径正确

const Editor = ({ file, onChange, onSave }) => {
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.ctrlKey && event.key === 's') {
        event.preventDefault();
        onSave();
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [onSave]);

  if (!file || !file.name) {
    return <div className="text-gray-500">未选择文件或文件名未定义</div>;
  }

  const getLanguage = (fileName) => {
    const extension = fileName.split('.').pop().toLowerCase();
    switch (extension) {
      case 'md': return 'markdown';
      case 'py': return 'python';
      case 'cpp': return 'cpp';
      default: return 'text';
    }
  };

  const language = getLanguage(file.name);

  const handleChange = (e) => {
    onChange(e.target.value);
  };

  const toggleEdit = () => {
    setIsEditing(!isEditing);
  };

  const handleSave = () => {
    onSave();
    setIsEditing(false);
  };

  return (
    <div className="w-full h-full flex flex-col overflow-hidden">
      <div className="flex-grow overflow-hidden">
        {isEditing ? (
          <textarea
            className="w-full h-full p-2 border rounded resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 overflow-auto"
            value={file.content || ''}
            onChange={handleChange}
          />
        ) : (
          <div className="w-full h-full overflow-auto">
            {language === 'markdown' ? (
              <div className="markdown-container p-2 border rounded overflow-auto markdown-body">
                <ReactMarkdown>{file.content || ''}</ReactMarkdown>
              </div>
            ) : (
              <div className="code-container">
                <SyntaxHighlighter
                  language={language}
                  style={tomorrow}
                  customStyle={{
                    margin: 0,
                    padding: '1rem',
                    height: '100%',
                  }}
                  wrapLines={true}
                  wrapLongLines={true}
                >
                  {file.content || ''}
                </SyntaxHighlighter>
              </div>
            )}
          </div>
        )}
      </div>
      <div className="flex justify-between mt-2">
        <button
          onClick={toggleEdit}
          className="p-2 bg-blue-500 text-white rounded-md transition duration-300 ease-in-out hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
        >
          {isEditing ? '阅读模式' : '编辑模式'}
        </button>
        <button
          onClick={handleSave}
          className="p-2 bg-green-500 text-white rounded-md transition duration-300 ease-in-out hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50"
        >
          保存文本
        </button>
      </div>
    </div>
  );
};

export default Editor;
