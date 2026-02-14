import { buildExportEmailContent } from '@dist/modules/resume/application/services/export-email-content';

describe('buildExportEmailContent', () => {
  it('builds bulk-apply message with recipient metadata and link', () => {
    const result = buildExportEmailContent({
      senderEmail: 'owner@example.com',
      reason: 'bulk-apply',
      isAttachment: false,
      downloadUrl: 'https://cdn.example.com/export.pdf',
      recipient: {
        email: 'hr@example.com',
        name: 'Mina',
        company: 'ACME',
        message: 'Thanks for your time',
      },
    });

    expect(result.subject).toBe('Resume Application');
    expect(result.body).toContain('Hi Mina,');
    expect(result.body).toContain('Role at ACME');
    expect(result.body).toContain('https://cdn.example.com/export.pdf');
    expect(result.body).toContain('Thanks for your time');
  });

  it('builds fallback message when recipient and link are absent', () => {
    const result = buildExportEmailContent({
      senderEmail: 'owner@example.com',
      reason: 'free-tier-export',
      isAttachment: true,
      downloadUrl: null,
    });

    expect(result.subject).toBe('Your resume export');
    expect(result.body).toContain('Hello,');
    expect(result.body).not.toContain('Role at');
    expect(result.body).not.toContain('http');
  });
});
