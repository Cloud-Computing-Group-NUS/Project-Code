const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const fs = require('fs').promises;
const path = require('path');
const cors = require('cors');

// update filesystem


const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST", "DELETE"]
  }
});

app.use(cors());
app.use(express.json());

const PV_ROOT = process.env.PV_ROOT || '/app/data';

// Helper function to get the full path
const getFullPath = (filePath) => path.join(PV_ROOT, filePath);

// Helper function to read directory recursively
async function readDirRecursive(dir) {
  const files = await fs.readdir(dir, { withFileTypes: true });
  const result = [];

  for (const file of files) {
    const fullPath = path.join(dir, file.name);
    const relativePath = path.relative(PV_ROOT, fullPath);
    if (file.isDirectory()) {
      const children = await readDirRecursive(fullPath);
      result.push({
        id: relativePath,
        name: file.name,
        type: 'folder',
        children: children
      });
    } else {
      const content = await fs.readFile(fullPath, 'utf8');
      result.push({
        id: relativePath,
        name: file.name,
        type: 'file',
        content: content
      });
    }
  }

  return result;
}

// Get initial file system
app.get('/api/initialFileSystem', async (req, res) => {
  try {
    const fileSystem = await readDirRecursive(PV_ROOT);
    console.log(PV_ROOT);
    // res.json({ fileSystem, root: PV_ROOT });
    res.json(fileSystem);
  } catch (error) {
    res.status(500).json({ error: 'Error reading file system' });
  }
});

// Save file content
app.post('/api/saveFile', async (req, res) => {
  try {
    const { file } = req.body;
    const filePath = getFullPath(file.id);
    await fs.writeFile(filePath, file.content, 'utf8');
    io.emit('fileSystemUpdate', await readDirRecursive(PV_ROOT));
    console.log(`File saved`);
    res.status(200).send('File saved successfully');
  } catch (error) {
    res.status(500).json({ error: 'Error saving file' });
  }
});

// Create new file
app.post('/api/createFile', async (req, res) => {
  try {
    const { parentId, fileName } = req.body;
    // file path
    const filePath = getFullPath(path.join(parentId, fileName));
    // create file
    await fs.writeFile(filePath, '', 'utf8');
    // Update file system
    const fileSystem = await readDirRecursive(PV_ROOT);
    // broadcast
    io.emit('fileSystemUpdate', fileSystem);
    console.log(`File created`);
    const newFile = fileSystem.find(file => file.id === path.relative(PV_ROOT, filePath));
    res.json({ file: newFile });
  } catch (error) {
    res.status(500).json({ error: 'Error creating file' });
  }
});

// Delete file
app.delete('/api/deleteFile/:fileId', async (req, res) => {
  try {
    const filePath = getFullPath(req.params.fileId);
    await fs.unlink(filePath);
    io.emit('fileSystemUpdate', await readDirRecursive(PV_ROOT));
    console.log(`File deleted`);
    res.status(200).send('File deleted successfully');
  } catch (error) {
    res.status(500).json({ error: 'Error deleting file' });
  }
});

// Socket.IO connection
io.on('connection', (socket) => {
  console.log('New client connected');
  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});