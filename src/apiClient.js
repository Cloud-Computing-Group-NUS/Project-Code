import axios from 'axios';

const apiClient = axios.create({
  baseURL: '/ng',
});

export const transitServerApi = {
  getChatContent: (data) => apiClient.post('/transit-server/get_chat_content', data),
  getFileContent: (data) => apiClient.post('/transit-server/get_file_content', data),
  getTrainData: (data) => apiClient.post('/transit-server/get_train_data', data),
  cancel: (data) => apiClient.post('/transit-server/cancel', data),
};

export const cloudDriveApi = {
  getInitialFileSystem: () => apiClient.get('/cloud-drive-service/api/initialFileSystem'),
  saveFile: (data) => apiClient.post('/cloud-drive-service/api/saveFile', data),
  createFile: (data) => apiClient.post('/cloud-drive-service/api/createFile', data),
  deleteFile: (data) => apiClient.post('/cloud-drive-service/api/deleteFile', data),
  getFileContent: (fileId) => apiClient.get(`/cloud-drive-service/api/getFileContent?fileId=${fileId}`),
};
