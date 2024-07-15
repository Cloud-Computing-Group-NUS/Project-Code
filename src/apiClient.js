import axios from 'axios';

const apiClient = axios.create({
  baseURL: '/ng',
});

// Add request interceptor
apiClient.interceptors.request.use(function (config) {
  // Do something before request is sent
  console.log('Sending request:', config.method.toUpperCase(), config.url);
  return config;
}, function (error) {
  // Do something with request error
  console.error('Request error:', error);
  return Promise.reject(error);
});

// Add response interceptor
apiClient.interceptors.response.use(function (response) {
  // Do something with response data
  console.log('Received response:', response.status, response.config.url);
  return response;
}, function (error) {
  // Do something with response error
  console.error('API error:', error.response ? error.response.status : 'Network Error', error.config.url);
  return Promise.reject(error);
});

// Unified error handling function
const handleApiError = (error) => {
  if (error.response) {
    // The request was made and the server responded with a status code
    // that falls out of the range of 2xx
    console.error('API Error:', error.response.status, error.response.data);
    throw new Error(error.response.data.message || 'An error occurred');
  } else if (error.request) {
    // The request was made but no response was received
    console.error('API Error: No response received');
    throw new Error('No response received from server');
  } else {
    // Something happened in setting up the request that triggered an Error
    console.error('API Error:', error.message);
    throw new Error('Error sending request');
  }
};

// Helper function to wrap API calls with error handling
const withErrorHandling = (apiCall) => {
  return async (...args) => {
    try {
      const response = await apiCall(...args);
      return response.data;
    } catch (error) {
      handleApiError(error);
    }
  };
};

export const transitServerApi = {
  getChatContent: withErrorHandling((data) => apiClient.post('/transit-server/get_chat_content', data)),
  getFileContent: withErrorHandling((data) => apiClient.post('/transit-server/get_file_content', data)),
  getTrainData: withErrorHandling((data) => apiClient.post('/transit-server/get_train_data', data)),
  cancel: withErrorHandling((data) => apiClient.post('/transit-server/cancel', data)),
};

export const cloudDriveApi = {
  getInitialFileSystem: withErrorHandling(() => 
    apiClient.get('/cloud-drive-service/api/initialFileSystem')),

  saveFile: withErrorHandling((data) => 
    apiClient.post('/cloud-drive-service/api/saveFile', data)),

  createFile: withErrorHandling((data) => 
    apiClient.post('/cloud-drive-service/api/createFile', data)),

  deleteFile: withErrorHandling((fileId) => 
    apiClient.post('/cloud-drive-service/api/deleteFile', { fileId })),

  getFileContent: withErrorHandling((fileId) => 
    apiClient.get(`/cloud-drive-service/api/getFileContent?fileId=${fileId}`)),
};

export { handleApiError };

// Usage example:
// try {
//   const result = await cloudDriveApi.deleteFile(fileId);
//   // Handle successful response
// } catch (error) {
//   // Error is already logged and handled by withErrorHandling
//   // You can add additional error handling here if needed
// }