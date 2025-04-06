export default class DeleteAudioUseCase {
  constructor(audioRepository, fileStorage) {
    this.audioRepository = audioRepository;
    this.fileStorage = fileStorage;
  }

  async execute(id) {
    const audio = await this.audioRepository.findById(id);
    if (!audio) return false;
    
    // Eliminar el archivo físico
    await this.fileStorage.deleteFile(audio.filename);
    
    // Eliminar el registro de la base de datos
    await this.audioRepository.delete(id);
    
    return true;
  }
}