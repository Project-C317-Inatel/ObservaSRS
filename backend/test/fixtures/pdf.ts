import { Readable } from 'node:stream';
import { PDFDocument } from 'pdf-lib';

export async function criarPdf(paginas = 1) {
  const documento = await PDFDocument.create();
  for (let i = 0; i < paginas; i++) documento.addPage();
  return Buffer.from(await documento.save());
}

export function arquivoPdf(buffer: Buffer, originalname = 'relatorio.pdf'): Express.Multer.File {
  return {
    fieldname: 'arquivo',
    originalname,
    mimetype: 'application/pdf',
    encoding: '7bit',
    size: buffer.length,
    buffer,
    stream: Readable.from([buffer]),
    destination: '',
    filename: '',
    path: '',
  };
}
