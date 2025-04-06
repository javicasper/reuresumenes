export default class GetAudiosUseCase {
  constructor(audioRepository) {
    this.audioRepository = audioRepository;
  }

  async execute() {
    return await this.audioRepository.findAll();
  }
}