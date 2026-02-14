import {
  canDirectDownload,
  getExportExpiryDays,
} from '@dist/modules/resume/application/policies/export.policy';

describe('export.policy', () => {
  it('allows direct download only for paid plans', () => {
    expect(canDirectDownload('PRO')).toBe(true);
    expect(canDirectDownload('PLUS')).toBe(true);
    expect(canDirectDownload('FREE')).toBe(false);
  });

  it('returns expiry days based on plan code', () => {
    expect(getExportExpiryDays('FREE')).toBe(30);
    expect(getExportExpiryDays('PRO')).toBe(90);
    expect(getExportExpiryDays('PLUS')).toBe(90);
    expect(getExportExpiryDays('UNKNOWN')).toBe(90);
  });
});
