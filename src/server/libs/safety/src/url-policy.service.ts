import { BadRequestException, Injectable } from '@nestjs/common';
import { isIP } from 'node:net';
import { lookup } from 'node:dns/promises';

const BLOCKED_HOST_SUFFIXES = ['.local', '.internal', '.localhost'];

@Injectable()
export class UrlPolicyService {
  async assertPublicHttpUrl(rawUrl: string): Promise<URL> {
    let url: URL;
    try {
      url = new URL(rawUrl);
    } catch {
      throw new BadRequestException('targetUrl must be a valid absolute URL');
    }

    if (!['http:', 'https:'].includes(url.protocol)) {
      throw new BadRequestException('Only HTTP and HTTPS targets are allowed');
    }
    if (url.username || url.password) {
      throw new BadRequestException('Credentials are not allowed in target URLs');
    }
    if (!url.hostname || this.isBlockedHostname(url.hostname)) {
      throw new BadRequestException('The target hostname is not allowed');
    }

    const addresses = isIP(url.hostname)
      ? [{ address: url.hostname, family: isIP(url.hostname) }]
      : await this.resolve(url.hostname);

    if (addresses.some(({ address }) => !this.isPublicAddress(address))) {
      throw new BadRequestException(
        'Targets resolving to private, loopback, link-local, or reserved addresses are not allowed',
      );
    }

    return url;
  }

  private async resolve(hostname: string) {
    try {
      const addresses = await lookup(hostname, { all: true, verbatim: true });
      if (addresses.length === 0) {
        throw new Error('No addresses returned');
      }
      return addresses;
    } catch {
      throw new BadRequestException('The target hostname could not be resolved');
    }
  }

  private isBlockedHostname(hostname: string): boolean {
    const normalized = hostname.toLowerCase().replace(/\.$/, '');
    return (
      normalized === 'localhost' ||
      normalized === 'metadata.google.internal' ||
      BLOCKED_HOST_SUFFIXES.some((suffix) => normalized.endsWith(suffix))
    );
  }

  private isPublicAddress(address: string): boolean {
    if (address.toLowerCase().startsWith('::ffff:')) {
      return this.isPublicAddress(address.slice(7));
    }
    if (isIP(address) === 4) {
      return this.isPublicIpv4(address);
    }
    if (isIP(address) === 6) {
      const value = address.toLowerCase();
      return (
        /^[23]/.test(value) &&
        !value.startsWith('2001:2:') &&
        !value.startsWith('2001:10:') &&
        !value.startsWith('2001:db8:')
      );
    }
    return false;
  }

  private isPublicIpv4(address: string): boolean {
    const [a, b] = address.split('.').map(Number);
    return !(
      a === 0 ||
      a === 10 ||
      a === 127 ||
      (a === 100 && b >= 64 && b <= 127) ||
      (a === 169 && b === 254) ||
      (a === 172 && b >= 16 && b <= 31) ||
      (a === 192 && b === 0) ||
      (a === 192 && b === 168) ||
      (a === 198 && (b === 18 || b === 19)) ||
      (a === 198 && b === 51) ||
      (a === 203 && b === 0) ||
      a >= 224
    );
  }
}
