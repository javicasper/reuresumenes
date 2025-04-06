import axios from 'axios';

// URL base para las peticiones API
const API_URL = '/api';

const api = {
  // Audio endpoints
  getAllAudios: () => axios.get(`${API_URL}/audios`),
  getAudioById: (id) => axios.get(`${API_URL}/audios/${id}`),
  uploadAudio: (formData, config = {}) => axios.post(`${API_URL}/audios`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    },
    ...config  // Permite pasar configuraciones adicionales como onUploadProgress
  }),
  deleteAudio: (id) => axios.delete(`${API_URL}/audios/${id}`),
  transcribeAudio: (id) => axios.post(`${API_URL}/audios/${id}/transcribe`),
  summarizeTranscription: (id) => axios.post(`${API_URL}/audios/${id}/summarize`),
  
  // Nuevo endpoint para rehacer el resumen
  redoSummary: (id) => axios.post(`${API_URL}/audios/${id}/redo-summary`),
  
  // Helpers para URLs de recursos
  getAudioFileUrl: (filename) => `http://localhost:3000/uploads/${filename}`
};

export default api;