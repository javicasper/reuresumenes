export default class AudioController {
  constructor({
    uploadAudioUseCase,
    getAudiosUseCase,
    getAudioByIdUseCase,
    deleteAudioUseCase,
    transcribeAudioUseCase,
    summarizeTranscriptionUseCase
  }) {
    this.uploadAudioUseCase = uploadAudioUseCase;
    this.getAudiosUseCase = getAudiosUseCase;
    this.getAudioByIdUseCase = getAudioByIdUseCase;
    this.deleteAudioUseCase = deleteAudioUseCase;
    this.transcribeAudioUseCase = transcribeAudioUseCase;
    this.summarizeTranscriptionUseCase = summarizeTranscriptionUseCase;
  }

  async uploadAudio(req, res) {
    try {
      // Ahora usamos req.audioFile que viene preparado por el middleware de la ruta
      if (!req.audioFile) {
        return res.status(400).json({ error: 'No se ha subido ningún archivo de audio' });
      }
      
      console.log('Archivo recibido:', req.audioFile.name, 'tamaño:', req.audioFile.size);
      
      const audio = await this.uploadAudioUseCase.execute(req.audioFile);
      res.status(201).json(audio);
    } catch (error) {
      console.error('Error uploading audio:', error);
      res.status(500).json({ error: error.message || 'Error uploading audio' });
    }
  }

  async getAllAudios(req, res) {
    try {
      const audios = await this.getAudiosUseCase.execute();
      res.json(audios);
    } catch (error) {
      console.error('Error getting audios:', error);
      res.status(500).json({ error: 'Error getting audios' });
    }
  }

  async getAudioById(req, res) {
    try {
      const audio = await this.getAudioByIdUseCase.execute(req.params.id);
      if (!audio) {
        return res.status(404).json({ error: 'Audio not found' });
      }
      res.json(audio);
    } catch (error) {
      console.error('Error getting audio:', error);
      res.status(500).json({ error: 'Error getting audio' });
    }
  }

  async deleteAudio(req, res) {
    try {
      const result = await this.deleteAudioUseCase.execute(req.params.id);
      if (!result) {
        return res.status(404).json({ error: 'Audio not found' });
      }
      res.json({ message: 'Audio deleted successfully' });
    } catch (error) {
      console.error('Error deleting audio:', error);
      res.status(500).json({ error: 'Error deleting audio' });
    }
  }

  async transcribeAudio(req, res) {
    try {
      const result = await this.transcribeAudioUseCase.execute(req.params.id);
      res.json(result);
    } catch (error) {
      console.error('Error transcribing audio:', error);
      res.status(500).json({ error: error.message || 'Error transcribing audio' });
    }
  }

  async summarizeTranscription(req, res) {
    try {
      const result = await this.summarizeTranscriptionUseCase.execute(req.params.id);
      res.json(result);
    } catch (error) {
      console.error('Error summarizing transcription:', error);
      res.status(500).json({ error: error.message || 'Error summarizing transcription' });
    }
  }
}