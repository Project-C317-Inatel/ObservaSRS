import { randomUUID } from 'node:crypto';
import { mkdir, stat, unlink, writeFile } from 'node:fs/promises';
import { basename, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { RequestHandler } from 'express';
import multer, { MulterError } from 'multer';
import { PDFDocument } from 'pdf-lib';

import { env } from '../../config/env.js';
import { AppError } from '../../shared/errors/app-error.js';

export const LIMITE_PDF_BYTES = 10 * 1024 * 1024;
const pastaArquivos = resolve(
  fileURLToPath(new URL('../../../', import.meta.url)),
  env.RELATORIOS_STORAGE_DIR,
);
const chaveValida = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}\.pdf$/;

const uploadPdf = multer({
  storage: multer.memoryStorage(),
  // O parser dispara ao atingir o limite; validarPdf aceita exatamente 10 MB.
  limits: { fileSize: LIMITE_PDF_BYTES + 1, files: 1, fields: 0, parts: 1 },
  fileFilter: (_request, file, callback) => {
    if (file.mimetype !== 'application/pdf' || !/\.pdf$/i.test(file.originalname)) {
      callback(
        new AppError(
          400,
          'invalid_pdf',
          'Envie um arquivo PDF com extensao .pdf e tipo application/pdf.',
        ),
      );
      return;
    }

    callback(null, true);
  },
});

export const receberPdf: RequestHandler = (request, response, next) => {
  uploadPdf.single('arquivo')(request, response, (error: unknown) => {
    if (error && !(error instanceof AppError) && !(error instanceof MulterError)) {
      next(
        new AppError(
          400,
          'invalid_upload',
          'Envie um formulario multipart valido com o PDF no campo arquivo.',
        ),
      );
      return;
    }

    next(error);
  });
};

function caminhoArquivo(chave: string) {
  if (!chaveValida.test(chave)) {
    throw new AppError(404, 'report_file_not_found', 'Arquivo PDF nao encontrado.');
  }

  return resolve(pastaArquivos, chave);
}

export async function validarPdf(arquivo: Express.Multer.File | undefined) {
  if (!arquivo) {
    throw new AppError(400, 'pdf_required', 'Envie o PDF no campo arquivo.');
  }

  if (arquivo.size > LIMITE_PDF_BYTES) {
    throw new AppError(413, 'pdf_too_large', 'O PDF deve ter no maximo 10 MB.');
  }

  if (
    arquivo.buffer.subarray(0, 5).toString('ascii') !== '%PDF-' ||
    !arquivo.buffer.subarray(-1024).includes(Buffer.from('%%EOF'))
  ) {
    throw new AppError(400, 'invalid_pdf', 'O arquivo enviado nao possui estrutura de PDF valida.');
  }

  try {
    const documento = await PDFDocument.load(arquivo.buffer, {
      ignoreEncryption: false,
      throwOnInvalidObject: true,
      updateMetadata: false,
    });

    if (documento.getPageCount() < 1) {
      throw new Error('PDF sem paginas.');
    }
  } catch {
    throw new AppError(
      400,
      'invalid_pdf',
      'Envie um PDF valido, com ao menos uma pagina e sem criptografia.',
    );
  }

  return arquivo;
}

export async function salvarPdf(arquivo: Express.Multer.File) {
  const chave = `${randomUUID()}.pdf`;
  await mkdir(pastaArquivos, { recursive: true });
  try {
    await writeFile(caminhoArquivo(chave), arquivo.buffer, { flag: 'wx', mode: 0o600 });
  } catch (error) {
    if (!(error instanceof Error && 'code' in error && error.code === 'EEXIST')) {
      try {
        await removerPdf(chave);
      } catch (cleanupError) {
        console.error('Nao foi possivel remover um PDF parcialmente gravado.', cleanupError);
      }
    }

    throw error;
  }

  const nome = basename(arquivo.originalname.replaceAll('\\', '/'))
    .replace(/\p{Cc}/gu, '')
    .slice(0, 255);

  return { chave, nome, tamanho: arquivo.size };
}

export async function removerPdf(chave: string) {
  try {
    await unlink(caminhoArquivo(chave));
  } catch (error) {
    if (!(error instanceof Error && 'code' in error && error.code === 'ENOENT')) {
      throw error;
    }
  }
}

export async function localizarPdf(chave: string | null) {
  if (!chave) {
    throw new AppError(404, 'report_file_not_found', 'Arquivo PDF nao encontrado.');
  }

  const caminho = caminhoArquivo(chave);
  try {
    const arquivo = await stat(caminho);
    if (!arquivo.isFile()) {
      throw new Error('Arquivo indisponivel.');
    }
  } catch (error) {
    if (error instanceof Error && 'code' in error && error.code !== 'ENOENT') {
      throw error;
    }

    throw new AppError(404, 'report_file_not_found', 'Arquivo PDF nao encontrado.');
  }

  return caminho;
}
