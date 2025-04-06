import OpenAI from 'openai';
import SummaryServicePort from '../../../ports/SummaryServicePort.js';

export default class OpenAISummaryService extends SummaryServicePort {
  constructor(apiKey, audioRepository) {
    super();
    this.openai = new OpenAI({
      apiKey: apiKey
    });
    this.audioRepository = audioRepository;
  }

  async summarizeTranscription(transcriptionText, audioId) {
    try {
      // Actualizar progreso al 10%
      await this.audioRepository.updateSummaryProgress(audioId, 10);

      const completion = await this.openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: 'Eres un asistente que resume audios en puntos clave importantes. Además da un resumen muy breve sobre el tema o temas principales de la conversación/charla a modo de editorial.'
          },
          {
            role: 'user',
            content: `Resume esto en lo más importante posible:\n\n${transcriptionText}`
          }
        ],
        max_tokens: 2000,
        temperature: 0.5
      });

      // Actualizar progreso al 80%
      await this.audioRepository.updateSummaryProgress(audioId, 80);

      // Extraer el resumen
      const summaryText = completion.choices[0].message.content;

      // Guardar el resumen como un objeto con un campo text
      const updatedAudio = await this.audioRepository.update(audioId, {
        summary: { text: summaryText },
        summaryProgress: 100
      });

      return updatedAudio;
    } catch (error) {
      console.error('Error summarizing transcription:', error);
      // En caso de error, actualizar el progreso a 0
      await this.audioRepository.updateSummaryProgress(audioId, 0);
      throw error;
    }
  }
}