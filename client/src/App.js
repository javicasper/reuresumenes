import React, { useState, useEffect } from 'react';
import api from './services/api';
import AudioUploader from './components/AudioUploader';
import AudioList from './components/AudioList';
import './App.css';

function App() {
  const [audios, setAudios] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  
  const fetchAudios = async () => {
    setIsLoading(true);
    try {
      const response = await api.getAllAudios();
      setAudios(response.data);
      setError('');
    } catch (error) {
      console.error('Error fetching audios:', error);
      setError('Error al cargar los archivos de audio. Por favor, intenta nuevamente.');
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    // Cargamos los audios solo al iniciar la aplicación
    fetchAudios();
    
    // Eliminamos el polling automático
  }, []);
  
  const handleAudioUploaded = (newAudio) => {
    setAudios([newAudio, ...audios]);
  };
  
  const handleAudioUpdated = (updatedAudio) => {
    setAudios(audios.map(audio => 
      audio.id === updatedAudio.id ? updatedAudio : audio
    ));
  };
  
  const handleAudioDeleted = (deletedAudioId) => {
    setAudios(audios.filter(audio => audio.id !== deletedAudioId));
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>ReuResumenes</h1>
      </header>
      
      <main className="app-main">
        <AudioUploader onAudioUploaded={handleAudioUploaded} />
        
        <div className="refresh-container">
          <button 
            className="refresh-button" 
            onClick={fetchAudios} 
            disabled={isLoading}
          >
            {isLoading ? 'Cargando...' : 'Actualizar audios'}
          </button>
        </div>
        
        {isLoading && <div className="loading">Cargando...</div>}
        
        {error && <div className="error-message">{error}</div>}
        
        {!isLoading && !error && (
          <AudioList 
            audios={audios} 
            onAudioUpdated={handleAudioUpdated}
            onAudioDeleted={handleAudioDeleted}
          />
        )}
      </main>
      
      <footer className="app-footer">
        <p>2025 ReuResumenes</p>
      </footer>
    </div>
  );
}

export default App;