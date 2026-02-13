export interface IPdfRenderer {
  renderPdfFromHtml(html: string): Promise<Buffer>;
}
