import { BadRequestException } from '@nestjs/common';
import { UrlPolicyService } from './url-policy.service';

describe('UrlPolicyService', () => {
  const service = new UrlPolicyService();

  it.each([
    'http://127.0.0.1/admin',
    'http://10.0.0.5',
    'http://169.254.169.254/latest/meta-data',
    'http://198.51.100.10',
    'http://[2001:db8::1]',
    'http://[::1]',
    'file:///etc/passwd',
    'https://user:secret@example.com',
  ])('rejects unsafe target %s', async (target) => {
    await expect(service.assertPublicHttpUrl(target)).rejects.toBeInstanceOf(
      BadRequestException,
    );
  });

  it('accepts a public literal address', async () => {
    const result = await service.assertPublicHttpUrl('https://8.8.8.8/health');
    expect(result.hostname).toBe('8.8.8.8');
  });
});
