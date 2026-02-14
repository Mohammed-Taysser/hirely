const mockSendMail = jest.fn();
const mockCreateTransport = jest.fn((_arg?: unknown) => ({
  sendMail: (...args: unknown[]) => mockSendMail(...args),
}));

jest.mock('nodemailer', () => ({
  __esModule: true,
  default: {
    createTransport: (arg: unknown) => mockCreateTransport(arg),
  },
}));

import { ExportEmailService } from '@dist/modules/resume/infrastructure/services/export-email.service';

describe('ExportEmailService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockSendMail.mockResolvedValue(undefined);
  });

  it('uses json transport fallback when smtp is not configured in non-production', async () => {
    const service = new ExportEmailService({
      NODE_ENV: 'development',
      MAIL_FROM: 'no-reply@hirely.app',
      SMTP_HOST: undefined,
      SMTP_PORT: undefined,
      SMTP_USER: undefined,
      SMTP_PASS: undefined,
    });

    await service.sendEmail({
      to: 'hr@example.com',
      subject: 'Subject',
      body: 'Body',
      downloadUrl: 'https://cdn.example.com/file.pdf',
    });

    expect(mockCreateTransport).toHaveBeenCalledWith({ jsonTransport: true });
    expect(mockSendMail).toHaveBeenCalledWith(
      expect.objectContaining({
        from: 'no-reply@hirely.app',
        to: 'hr@example.com',
        attachments: undefined,
      })
    );
  });

  it('uses smtp transport when smtp settings are provided', async () => {
    const service = new ExportEmailService({
      NODE_ENV: 'production',
      MAIL_FROM: 'noreply@example.com',
      SMTP_HOST: 'smtp.example.com',
      SMTP_PORT: 587,
      SMTP_USER: 'smtp-user',
      SMTP_PASS: 'smtp-pass',
    });

    await service.sendEmail({
      to: 'hr@example.com',
      subject: 'Subject',
      body: 'Body',
      downloadUrl: 'https://cdn.example.com/file.pdf',
    });

    expect(mockCreateTransport).toHaveBeenCalledWith(
      expect.objectContaining({
        host: 'smtp.example.com',
        port: 587,
        secure: false,
        auth: {
          user: 'smtp-user',
          pass: 'smtp-pass',
        },
      })
    );
  });

  it('throws in production when smtp config is missing', () => {
    expect(
      () =>
        new ExportEmailService({
          NODE_ENV: 'production',
          MAIL_FROM: 'noreply@example.com',
          SMTP_HOST: undefined,
          SMTP_PORT: undefined,
          SMTP_USER: undefined,
          SMTP_PASS: undefined,
        })
    ).toThrow('SMTP configuration is required in production');
  });

  it('attaches file for local file download url', async () => {
    const service = new ExportEmailService({
      NODE_ENV: 'development',
      MAIL_FROM: 'no-reply@hirely.app',
      SMTP_HOST: undefined,
      SMTP_PORT: undefined,
      SMTP_USER: undefined,
      SMTP_PASS: undefined,
    });

    await service.sendEmail({
      to: 'hr@example.com',
      subject: 'Subject',
      body: 'Body',
      downloadUrl: 'file:///tmp/export.pdf',
    });

    expect(mockSendMail).toHaveBeenCalledWith(
      expect.objectContaining({
        attachments: [{ path: '/tmp/export.pdf' }],
      })
    );
  });
});
