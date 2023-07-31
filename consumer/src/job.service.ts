class JobService {
  async doHardWork(message: string) {
    return message.toUpperCase();
  }
}

export default new JobService();
