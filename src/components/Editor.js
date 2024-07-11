import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { tomorrow } from 'react-syntax-highlighter/dist/cjs/styles/prism';
import '../css_file/Editor.css'; // Make sure the path is correct

const Section = ({ title, content, language, onChange, isEditing, toggleEdit, handleSave }) => (
  <div className="section-container">
    <h3 className="section-title">{title}</h3>
    <div className="flex-grow mb-2 overflow-auto">
      {isEditing ? (
        <textarea
          className="textarea"
          value={content || ''}
          onChange={onChange}
        />
      ) : (
        <div className="w-full h-64 overflow-auto">
          {language === 'markdown' ? (
            <div className="markdown-container">
              <ReactMarkdown>{content || ''}</ReactMarkdown>
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
                {content || ''}
              </SyntaxHighlighter>
            </div>
          )}
        </div>
      )}
    </div>
    <div className="flex justify-between mt-2">
      <button
        onClick={toggleEdit}
        className="button"
      >
        {isEditing ? '查看模式' : '编辑模式'}
      </button>
      <button
        onClick={handleSave}
        className="button button-save"
      >
        保存文本
      </button>
    </div>
  </div>
);

const Editor = ({ file, onChange, onSave }) => {
  const [isEditingOriginal, setIsEditingOriginal] = useState(false);
  const [isEditingModified, setIsEditingModified] = useState(false);

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
    return <div className="text-gray-500">No file selected or file name undefined</div>;
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

  const handleChangeOriginal = (e) => {
    onChange({ ...file, originalContent: e.target.value });
  };

  const handleChangeModified = (e) => {
    onChange({ ...file, modifiedContent: e.target.value });
  };

  const toggleEditOriginal = () => {
    setIsEditingOriginal(!isEditingOriginal);
  };

  const toggleEditModified = () => {
    setIsEditingModified(!isEditingModified);
  };

  const handleSaveOriginal = () => {
    onSave({ ...file, originalContent: file.originalContent });
    setIsEditingOriginal(false);
  };

  const handleSaveModified = () => {
    onSave({ ...file, modifiedContent: file.modifiedContent });
    setIsEditingModified(false);
  };

  return (
    <div className="w-full h-full flex flex-col p-4 overflow-hidden">
      <Section
        title="Original Content"
        content={file.originalContent || ''}
        language={language}
        onChange={handleChangeOriginal}
        isEditing={isEditingOriginal}
        toggleEdit={toggleEditOriginal}
        handleSave={handleSaveOriginal}
      />
      <Section
        title="AI Modified Content"
        content={file.modifiedContent || ''}
        language={language}
        onChange={handleChangeModified}
        isEditing={isEditingModified}
        toggleEdit={toggleEditModified}
        handleSave={handleSaveModified}
      />
    </div>
  );
};

export default Editor;
