export default class GetAudioByIdUseCase {
  constructor(audioRepository) {
    this.audioRepository = audioRepository;
  }

  async execute(id) {
    return await this.audioRepository.findById(id);
  }
}