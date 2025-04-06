import OpenAI from 'openai';
import FormData from 'form-data';
import { createReadStream, statSync } from 'fs';
import axios from 'axios';
import path from 'path';
import TranscriptionServicePort from '../../../ports/TranscriptionServicePort.js';
import AudioSplitter from './AudioSplitter.js';

export default class OpenAITranscriptionService extends TranscriptionServicePort {
  constructor(apiKey, audioRepository) {
    super();
    this.openai = new OpenAI({
      apiKey: apiKey
    });
    this.audioRepository = audioRepository;
    this.audioSplitter = new AudioSplitter();
    this.MAX_FILE_SIZE_MB = 24; // Límite de Whisper es 25MB, usamos 24MB para estar seguros
  }

  async transcribeAudio(audioPath, audioId) {
    try {
      // Verificar tamaño del archivo
      const stats = statSync(audioPath);
      const fileSizeMB = stats.size / (1024 * 1024);
      
      // Actualizar progreso al 5%
      await this.audioRepository.updateTranscriptionProgress(audioId, 5);
      
      let transcription = '';
      
      if (fileSizeMB > this.MAX_FILE_SIZE_MB) {
        // Si el archivo es grande, dividirlo en fragmentos
        console.log(`Archivo de audio ${path.basename(audioPath)} es de ${fileSizeMB.toFixed(2)}MB. Dividiendo en fragmentos...`);
        
        // Actualizar progreso al 10%
        await this.audioRepository.updateTranscriptionProgress(audioId, 10);
        
        // Dividir el archivo en fragmentos de 20MB
        const tempDir = path.join(path.dirname(audioPath), 'temp_chunks');
        const chunkPaths = await this.audioSplitter.splitAudio(audioPath, 20, tempDir);
        
        console.log(`Archivo dividido en ${chunkPaths.length} fragmentos`);
        
        // Transcribir cada fragmento
        const totalChunks = chunkPaths.length;
        const progressPerChunk = 70 / totalChunks; // Reservamos 70% del progreso para la transcripción de fragmentos
        
        // Variable para almacenar las transcripciones ordenadas
        const transcriptionParts = new Array(totalChunks);
        
        // Procesar cada fragmento secuencialmente
        for (let i = 0; i < totalChunks; i++) {
          const chunkPath = chunkPaths[i];
          console.log(`Transcribiendo fragmento ${i+1}/${totalChunks}: ${path.basename(chunkPath)}`);
          
          const form = new FormData();
          form.append('file', createReadStream(chunkPath));
          form.append('model', 'whisper-1');
          
          const response = await axios.post(
            'https://api.openai.com/v1/audio/transcriptions',
            form,
            {
              headers: {
                Authorization: `Bearer ${this.openai.apiKey}`,
                ...form.getHeaders()
              }
            }
          );
          
          // Guardar la transcripción de este fragmento en el array
          transcriptionParts[i] = response.data.text;
          
          // Actualizar el progreso
          const currentProgress = 10 + ((i + 1) * progressPerChunk);
          await this.audioRepository.updateTranscriptionProgress(audioId, Math.round(currentProgress));
        }
        
        // Unir todas las transcripciones en orden
        transcription = transcriptionParts.join(' ');
        
        // Limpiar los archivos temporales
        await this.audioSplitter.cleanupChunks(chunkPaths);
      } else {
        // Si el archivo no es demasiado grande, transcribirlo directamente
        console.log(`Transcribiendo archivo de ${fileSizeMB.toFixed(2)}MB directamente`);
        
        // Actualizar progreso al 30%
        await this.audioRepository.updateTranscriptionProgress(audioId, 30);
        
        const form = new FormData();
        form.append('file', createReadStream(audioPath));
        form.append('model', 'whisper-1');
        
        const response = await axios.post(
          'https://api.openai.com/v1/audio/transcriptions',
          form,
          {
            headers: {
              Authorization: `Bearer ${this.openai.apiKey}`,
              ...form.getHeaders()
            }
          }
        );
        
        transcription = response.data.text;
        
        // Actualizar progreso al 80%
        await this.audioRepository.updateTranscriptionProgress(audioId, 80);
      }
      
      // Guardar la transcripción completa
      console.log(`Transcripción completada. Guardando resultados...`);
      
      const updatedAudio = await this.audioRepository.update(audioId, {
        transcription: {
          text: transcription
        },
        transcriptionProgress: 100
      });
      
      return updatedAudio;
    } catch (error) {
      console.error('Error transcribing audio:', error);
      // En caso de error, actualizar el progreso a 0
      await this.audioRepository.updateTranscriptionProgress(audioId, 0);
      throw error;
    }
  }
}