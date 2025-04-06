import React, { useState } from 'react';
import api from '../services/api';
import './AudioCard.css';

const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleString();
};

const formatSize = (bytes) => {
  if (bytes < 1024) return bytes + ' B';
  else if (bytes < 1048576) return (bytes / 1024).toFixed(2) + ' KB';
  else return (bytes / 1048576).toFixed(2) + ' MB';
};

const formatDuration = (seconds) => {
  if (!seconds) return 'Desconocida';
  
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
};

const AudioCard = ({ audio, onAudioUpdated, onAudioDeleted }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  // Usar la nueva URL de streaming
  const [audioElement] = useState(new Audio(api.getAudioFileUrl(audio.id)));
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isRedoingSummary, setIsRedoingSummary] = useState(false);

  const togglePlay = () => {
    if (isPlaying) {
      audioElement.pause();
    } else {
      audioElement.play();
    }
    setIsPlaying(!isPlaying);
  };

  audioElement.onended = () => {
    setIsPlaying(false);
  };

  const handleTranscribe = async () => {
    setIsTranscribing(true);
    try {
      console.log(audio);
      await api.transcribeAudio(audio.id);
      // Aquí solo se inicia la transcripción, que es un proceso asíncrono
      // El polling en App.js actualizará el estado
    } catch (error) {
      console.error('Error al transcribir:', error);
    } finally {
      setIsTranscribing(false);
    }
  };

  const handleSummarize = async () => {
    setIsSummarizing(true);
    try {
      await api.summarizeTranscription(audio.id);
      // El polling en App.js actualizará el estado
    } catch (error) {
      console.error('Error al resumir:', error);
    } finally {
      setIsSummarizing(false);
    }
  };

  // Nuevo método para rehacer el resumen
  const handleRedoSummary = async () => {
    if (!window.confirm('¿Está seguro de que desea rehacer el resumen? El resumen actual será eliminado.')) {
      return;
    }
    
    setIsRedoingSummary(true);
    try {
      await api.redoSummary(audio.id);
      // La actualización manual (botón Actualizar) mostrará el resultado
    } catch (error) {
      console.error('Error al rehacer el resumen:', error);
    } finally {
      setIsRedoingSummary(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('¿Está seguro de que desea eliminar este audio?')) {
      return;
    }
    
    setIsDeleting(true);
    try {
      await api.deleteAudio(audio.id);
      onAudioDeleted(audio.id);
    } catch (error) {
      console.error('Error al eliminar:', error);
      setIsDeleting(false);
    }
  };

  // Usar las nuevas URLs para descargas
  const handleDownloadAudio = () => {
    window.location.href = api.getAudioDownloadUrl(audio.id);
  };

  const handleDownloadTranscription = () => {
    if (audio.transcription && audio.transcription.text) {
      window.location.href = api.getTranscriptionDownloadUrl(audio.id);
    }
  };

  const handleDownloadSummary = () => {
    if (audio.summary && audio.summary.text) {
      window.location.href = api.getSummaryDownloadUrl(audio.id);
    }
  };

  return (
    <div className="audio-card">
      <div className="audio-card-header">
        <h3>{audio.originalFilename || audio.filename}</h3>
        <div className="audio-card-actions">
          <button 
            onClick={togglePlay} 
            className="play-button"
            title={isPlaying ? 'Pausar' : 'Reproducir'}
          >
            {isPlaying ? '⏸️' : '▶️'}
          </button>
          <button 
            onClick={handleDelete} 
            className="delete-button"
            disabled={isDeleting}
            title="Eliminar"
          >
            🗑️
          </button>
          <button 
            onClick={handleDownloadAudio} 
            className="download-button"
            title="Descargar Audio"
          >
            📥
          </button>
        </div>
      </div>
      
      <div className="audio-card-info">
        <p><strong>Duración:</strong> {formatDuration(audio.duration)}</p>
        <p><strong>Tamaño:</strong> {formatSize(audio.size)}</p>
        <p><strong>Subido:</strong> {formatDate(audio.uploadDate)}</p>
      </div>
      
      <div className="audio-card-content">
        {audio.transcriptionProgress > 0 && audio.transcriptionProgress < 100 ? (
          <div className="progress-section">
            <h4>Transcripción en progreso</h4>
            <div className="progress-bar">
              <div 
                className="progress-bar-inner" 
                style={{ width: `${audio.transcriptionProgress}%` }}
              ></div>
            </div>
            <p>{audio.transcriptionProgress}%</p>
          </div>
        ) : (audio.transcription?.text || audio.transcription) ? (
          <div className="transcription-section">
            <div className="section-header">
              <h4>Transcripción</h4>
              <button 
                onClick={handleDownloadTranscription} 
                className="download-button"
                title="Descargar Transcripción"
              >
                📥
              </button>
            </div>
            <div className="scrollable-text">
              {audio.transcription?.text || audio.transcription}
            </div>
          </div>
        ) : (
          <div className="action-section">
            <button 
              onClick={handleTranscribe} 
              className="action-button"
              disabled={isTranscribing}
            >
              {isTranscribing ? 'Transcribiendo...' : 'Transcribir Audio'}
            </button>
          </div>
        )}
        
        {audio.summaryProgress > 0 && audio.summaryProgress < 100 ? (
          <div className="progress-section">
            <h4>Resumen en progreso</h4>
            <div className="progress-bar">
              <div 
                className="progress-bar-inner" 
                style={{ width: `${audio.summaryProgress}%` }}
              ></div>
            </div>
            <p>{audio.summaryProgress}%</p>
          </div>
        ) : audio.summary ? (
          <div className="summary-section">
            <div className="section-header">
              <h4>Resumen</h4>
              <div className="header-actions">
                <button 
                  onClick={handleDownloadSummary} 
                  className="download-button"
                  title="Descargar Resumen"
                >
                  📥
                </button>
                <button 
                  onClick={handleRedoSummary} 
                  className="redo-button"
                  title="Rehacer Resumen"
                  disabled={isRedoingSummary}
                >
                  🔄
                </button>
              </div>
            </div>
            <div className="scrollable-text">
              {audio.summary.text}
            </div>
          </div>
        ) : (audio.transcription?.text || audio.transcription) ? (
          <div className="action-section">
            <button 
              onClick={handleSummarize} 
              className="action-button"
              disabled={isSummarizing}
            >
              {isSummarizing ? 'Generando resumen...' : 'Generar Resumen'}
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default AudioCard;