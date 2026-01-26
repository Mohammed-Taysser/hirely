import CONFIG from '@/apps/config';
import errorService from '@/modules/shared/services/error.service';

export const renderPdfFromHtml = async (html: string) => {
  const url = `${CONFIG.GOTENBERG_URL}/forms/chromium/convert/html`;

  const form = new FormData();
  form.append('files', new Blob([html]), 'index.html');

  const response = await fetch(url, {
    method: 'POST',
    body: form,
  });

  if (!response.ok) {
    const text = await response.text();

    throw errorService.internal(`Gotenberg failed: ${response.status} ${text}`);
  }

  const arrayBuffer = await response.arrayBuffer();
  return Buffer.from(arrayBuffer);
};
