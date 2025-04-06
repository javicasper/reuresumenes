import React from 'react';
import AudioCard from './AudioCard';
import './AudioList.css';

const AudioList = ({ audios, onAudioUpdated, onAudioDeleted }) => {
  if (!audios || audios.length === 0) {
    return (
      <div className="empty-list">
        <p>No hay archivos de audio. ¡Sube uno!</p>
      </div>
    );
  }

  return (
    <div className="audio-list">
      {audios.map(audio => (
        <AudioCard 
          key={audio.id} 
          audio={audio} 
          onAudioUpdated={onAudioUpdated}
          onAudioDeleted={onAudioDeleted}
        />
      ))}
    </div>
  );
};

export default AudioList;