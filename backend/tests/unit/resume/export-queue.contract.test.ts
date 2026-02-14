import {
  parseBulkApplyEmailQueuePayload,
  parseExportEmailQueuePayload,
  parseFreeTierExportEmailQueuePayload,
  parsePdfExportQueuePayload,
} from '@dist/modules/resume/application/contracts/export-queue.contract';

describe('export queue payload contract', () => {
  it('parses pdf payload and trims string fields', () => {
    const payload = parsePdfExportQueuePayload({
      exportId: ' export-1 ',
      snapshotId: ' snapshot-1 ',
      userId: ' user-1 ',
    });

    expect(payload).toEqual({
      exportId: 'export-1',
      snapshotId: 'snapshot-1',
      userId: 'user-1',
    });
  });

  it('rejects invalid pdf payload', () => {
    expect(() =>
      parsePdfExportQueuePayload({
        exportId: 'export-1',
        userId: 'user-1',
      })
    ).toThrow();
  });

  it('parses free-tier email payload', () => {
    const payload = parseFreeTierExportEmailQueuePayload({
      exportId: 'export-1',
      userId: 'user-1',
      to: 'person@example.com',
      reason: 'free-tier-export',
      recipient: {
        name: 'Hiring Manager',
      },
    });

    expect(payload.reason).toBe('free-tier-export');
    expect(payload.to).toBe('person@example.com');
  });

  it('parses bulk-apply email payload', () => {
    const payload = parseBulkApplyEmailQueuePayload({
      exportId: 'export-1',
      userId: 'user-1',
      to: 'person@example.com',
      reason: 'bulk-apply',
      recipient: {
        email: 'person@example.com',
        name: 'Hiring Manager',
        company: 'Acme',
      },
    });

    expect(payload.reason).toBe('bulk-apply');
    expect(payload.recipient.email).toBe('person@example.com');
  });

  it('rejects bulk-apply payload when recipient.email is missing', () => {
    expect(() =>
      parseExportEmailQueuePayload({
        exportId: 'export-1',
        userId: 'user-1',
        to: 'person@example.com',
        reason: 'bulk-apply',
        recipient: {
          name: 'Hiring Manager',
        },
      })
    ).toThrow();
  });
});
