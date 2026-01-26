import loggerService from './logger.service';

interface SendMailInput {
  to: string;
  subject: string;
  text?: string;
  html?: string;
}

class MailService {
  async send(input: SendMailInput): Promise<void> {
    loggerService.info(input);
  }
}

export const mailService = new MailService();
