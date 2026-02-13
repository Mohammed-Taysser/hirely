import CONFIG from '@/apps/config';
import { IPdfRenderer } from '@/modules/resume/application/services/pdf-renderer.service.interface';

export class GotenbergPdfRenderer implements IPdfRenderer {
  async renderPdfFromHtml(html: string): Promise<Buffer> {
    const url = `${CONFIG.GOTENBERG_URL}/forms/chromium/convert/html`;

    const form = new FormData();
    form.append('files', new Blob([html]), 'index.html');

    const response = await fetch(url, {
      method: 'POST',
      body: form,
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Gotenberg failed: ${response.status} ${text}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    return Buffer.from(arrayBuffer);
  }
}
