import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { tomorrow } from 'react-syntax-highlighter/dist/cjs/styles/prism';
import '../css_file/Editor.css';

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
      case 'cpp': return 'cpp';
      default: return 'text';
    }
  };

  const language = getLanguage(file?.name);

  const renderContent = (content, isEditing, onChange) => {
    if (isEditing) {
      return (
        <textarea
          className="w-full h-full p-2 resize-none border-none outline-none"
          value={content}
          onChange={(e) => onChange(e.target.value)}
        />
      );
    } else if (language === 'markdown') {
      return <ReactMarkdown>{content}</ReactMarkdown>;
    } else {
      return (
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
        <h3 className="text-lg font-bold mb-2">Original Content</h3>
        <div className="flex-grow border rounded-lg overflow-auto p-2">
          {renderContent(
            originalContent,
            isEditingOriginal,
            setOriginalContent
          )}
        </div>
        <div className="flex justify-between mt-2">
          <button
            onClick={() => setIsEditingOriginal(!isEditingOriginal)}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition duration-300"
          >
            {isEditingOriginal ? '查看模式' : '编辑模式'}
          </button>
          <button
            onClick={handleSaveOriginal}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition duration-300"
          >
            保存文本
          </button>
        </div>
      </div>
      <div className="w-1/2 flex flex-col">
        <h3 className="text-lg font-bold mb-2">AI Modified Content</h3>
        <div className="flex-grow border rounded-lg overflow-auto p-2">
          {renderContent(
            modifiedContent,
            isEditingModified,
            setModifiedContent
          )}
        </div>
        <div className="flex justify-between mt-2">
          <button
            onClick={() => setIsEditingModified(!isEditingModified)}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition duration-300"
          >
            {isEditingModified ? '查看模式' : '编辑模式'}
          </button>
          <button
            onClick={handleSaveModified}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition duration-300"
          >
            保存文本
          </button>
        </div>
      </div>
    </div>
  );
};

export default Editor;