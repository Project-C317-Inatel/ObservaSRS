import { describe, expect, it } from 'vitest';

import { LIMITE_PDF_BYTES, validarPdf } from '../../src/modules/relatorios/relatorio.arquivo.js';
import { arquivoPdf, criarPdf } from '../fixtures/pdf.js';

describe('Validação de PDF', () => {
  it('aceita um PDF válido com uma página', async () => {
    const arquivo = arquivoPdf(await criarPdf());
    await expect(validarPdf(arquivo)).resolves.toBe(arquivo);
  });

  it('recusa conteúdo de texto disfarçado de PDF', async () => {
    const arquivo = arquivoPdf(Buffer.from('Não é um PDF.'));
    await expect(validarPdf(arquivo)).rejects.toMatchObject({
      statusCode: 400,
      code: 'invalid_pdf',
    });
  });

  it('recusa arquivo acima de 10 MiB', async () => {
    const arquivo = arquivoPdf(Buffer.alloc(LIMITE_PDF_BYTES + 1));
    await expect(validarPdf(arquivo)).rejects.toMatchObject({
      statusCode: 413,
      code: 'pdf_too_large',
    });
  });
});
