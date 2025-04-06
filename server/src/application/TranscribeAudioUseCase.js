export default class TranscribeAudioUseCase {
  constructor(transcriptionService, audioRepository) {
    this.transcriptionService = transcriptionService;
    this.audioRepository = audioRepository;
  }

  async execute(audioId) {
    const audio = await this.audioRepository.findById(audioId);
    if (!audio) throw new Error('Audio not found');
    
    // Iniciar transcripción en segundo plano y retornar de inmediato
    this.transcriptionService.transcribeAudio(audio.path, audioId)
      .catch(error => console.error('Error en transcripción en segundo plano:', error));
    
    return { message: 'Transcripción iniciada' };
  }
}