import React, { useState } from 'react';
import api from '../services/api';
import './AudioUploader.css';

const AudioUploader = ({ onAudioUploaded }) => {
  const [file, setFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');
  const [progress, setProgress] = useState(0);

  // Función para normalizar el nombre del archivo (eliminar caracteres especiales)
  const normalizeFileName = (fileName) => {
    return fileName
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Eliminar acentos
      .replace(/[^a-zA-Z0-9.]/g, '') // Eliminar caracteres especiales
      .replace(/\s+/g, ''); // Eliminar espacios
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;
    
    // Verificar si es un archivo de audio
    if (!selectedFile.type.startsWith('audio/')) {
      setError('Por favor seleccione un archivo de audio válido');
      return;
    }
    
    setFile(selectedFile);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!file) {
      setError('Por favor seleccione un archivo de audio');
      return;
    }
    
    setIsUploading(true);
    setError('');
    setProgress(0);
    
    try {
      // Crear un nuevo archivo con nombre normalizado
      const normalizedName = normalizeFileName(file.name);
      const normalizedFile = new File([file], normalizedName, { type: file.type });
      
      const formData = new FormData();
      formData.append('audio', normalizedFile);
      
      // Usar axios con soporte para seguimiento de progreso
      const response = await api.uploadAudio(formData, {
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setProgress(percentCompleted);
        }
      });
      
      setFile(null);
      setProgress(0);
      onAudioUploaded(response.data);
    } catch (error) {
      console.error('Error al subir el audio:', error);
      setError('Error al subir el archivo. Por favor intente de nuevo.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="audio-uploader">
      <h2>Subir Nuevo Audio</h2>
      <form onSubmit={handleSubmit}>
        <div className="file-input-container">
          <input 
            type="file" 
            onChange={handleFileChange} 
            accept="audio/*"
            id="audio-file"
            disabled={isUploading}
          />
          <label htmlFor="audio-file">
            {file ? file.name : 'Seleccionar archivo de audio'}
          </label>
        </div>
        
        {error && <p className="error-message">{error}</p>}
        
        {isUploading && (
          <div className="progress-container">
            <div className="progress-bar">
              <div 
                className="progress-bar-inner" 
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <span>{progress}%</span>
          </div>
        )}
        
        <button 
          type="submit" 
          disabled={!file || isUploading}
          className="upload-button"
        >
          {isUploading ? 'Subiendo...' : 'Subir Audio'}
        </button>
      </form>
    </div>
  );
};

export default AudioUploader;