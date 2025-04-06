export default class SummarizeTranscriptionUseCase {
  constructor(summaryService, audioRepository) {
    this.summaryService = summaryService;
    this.audioRepository = audioRepository;
  }

  async execute(audioId) {
    const audio = await this.audioRepository.findById(audioId);
    if (!audio) throw new Error('Audio not found');
    if (!audio.transcription) throw new Error('Audio has no transcription');
    
    // Si hay un resumen existente, lo eliminamos y reiniciamos el progreso
    if (audio.summary) {
      await this.audioRepository.update(audioId, {
        summary: null,
        summaryProgress: 0
      });
    }
    
    // Extraer el texto de la transcripción según su formato
    let transcriptionText;
    if (typeof audio.transcription === 'string') {
      // Si es una cadena (formato antiguo)
      transcriptionText = audio.transcription;
    } else if (audio.transcription && typeof audio.transcription === 'object' && audio.transcription.text) {
      // Si es un objeto con campo text (nuevo formato)
      transcriptionText = audio.transcription.text;
    } else {
      throw new Error('Invalid transcription format');
    }
    
    // Iniciar resumen en segundo plano y retornar de inmediato
    this.summaryService.summarizeTranscription(transcriptionText, audioId)
      .catch(error => console.error('Error en resumen en segundo plano:', error));
    
    return { message: 'Resumen iniciado' };
  }
}