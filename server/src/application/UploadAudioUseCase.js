export default class UploadAudioUseCase {
  constructor(fileStorage, audioRepository) {
    this.fileStorage = fileStorage;
    this.audioRepository = audioRepository;
  }

  async execute(file) {
    // Guardar el archivo
    const savedFile = await this.fileStorage.saveFile(file);
    
    // Crear y guardar la entidad de audio
    const audio = {
      filename: savedFile.filename,
      originalName: savedFile.originalName,
      path: savedFile.path,
      mimetype: savedFile.mimetype,
      size: savedFile.size,
      uploadDate: new Date()
    };
    
    return await this.audioRepository.save(audio);
  }
}