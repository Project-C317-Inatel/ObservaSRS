import { readFile } from 'node:fs/promises';
import { afterAll, describe, expect, it } from 'vitest';

import {
  alterarPublicacaoColeta,
  avaliarColeta,
  enviarColeta,
  resumirColetas,
} from '../../src/modules/coletas/coleta.service.js';
import { editarEstabelecimento } from '../../src/modules/coletas/estabelecimento.service.js';
import {
  apresentarItemPit,
  buscarItemPit,
  cadastrarItemPit,
  revisarItemPit,
} from '../../src/modules/inventario-pit/item-pit.service.js';
import {
  baixarPdfAdministrativo,
  cadastrarRelatorio,
  enviarPdfRelatorio,
} from '../../src/modules/relatorios/relatorio.service.js';
import { prisma } from '../../src/shared/database/prisma.js';
import { arquivoPdf, criarPdf } from '../fixtures/pdf.js';
import { criarContaAprovada } from '../fixtures/usuario.js';

afterAll(() => prisma.$disconnect());

const dadosColeta = {
  nomeEstabelecimento: 'Hospedagem de teste',
  cnpjCadastur: 'INTEGRACAO01',
  periodoReferencia: '2026-06',
  leitosOcupados: 12,
  origemVisitantes: 'Minas Gerais',
};

describe('Coletas, PIT e armazenamento com PostgreSQL', () => {
  it('cria o estabelecimento e a coleta em uma transação e recusa duplicidade mensal', async () => {
    const coleta = await enviarColeta(dadosColeta);
    await expect(enviarColeta({ ...dadosColeta, leitosOcupados: 20 })).rejects.toMatchObject({
      statusCode: 409,
      code: 'collection_already_submitted',
    });
    const local = await prisma.estabelecimento.findUniqueOrThrow({
      where: { cnpjCadastur: dadosColeta.cnpjCadastur },
      include: { coletas: true },
    });

    expect(local.coletas).toHaveLength(1);
    expect(local.coletas[0]).toMatchObject({
      id: coleta.id,
      estabelecimentoId: local.id,
      periodo: new Date('2026-06-01'),
      leitosOcupados: 12,
      status: 'PENDENTE',
      publicado: false,
    });
  });

  it('retira do agregado público uma coleta publicada de estabelecimento desativado', async () => {
    const periodoReferencia = '2026-07';
    const admin = await criarContaAprovada();
    const coleta = await enviarColeta({
      ...dadosColeta,
      periodoReferencia,
      cnpjCadastur: 'INTEGRACAO02',
    });
    const aprovada = await avaliarColeta(coleta.id, admin.id, 'APROVADO');
    await alterarPublicacaoColeta(coleta.id, true);

    await expect(resumirColetas(periodoReferencia)).resolves.toMatchObject({
      estabelecimentos: 1,
      leitosOcupados: dadosColeta.leitosOcupados,
    });
    await editarEstabelecimento(aprovada.estabelecimento.id, { ativo: false });
    await expect(resumirColetas(periodoReferencia)).resolves.toMatchObject({
      estabelecimentos: 0,
      leitosOcupados: 0,
    });
    await expect(
      prisma.submissaoColeta.findUniqueOrThrow({ where: { id: coleta.id } }),
    ).resolves.toMatchObject({ publicado: true });
  });

  it('registra uma revisão do PIT e retira a pendência no cadastro persistido', async () => {
    const item = await cadastrarItemPit({
      nome: 'Atrativo para revisão',
      categoria: 'Cultura',
      localizacao: 'Centro',
      ativo: true,
    });
    // Reproduz um item existente que chegou à data de revisão.
    await prisma.itemPit.update({
      where: { id: item.id },
      data: { revisaoPrevistaEm: new Date('2000-01-01'), revisadoEm: new Date('1999-01-01') },
    });
    expect(apresentarItemPit(await buscarItemPit(item.id)).revisaoPendente).toBe(true);

    await revisarItemPit(item.id);
    const atualizado = apresentarItemPit(await buscarItemPit(item.id));
    expect(atualizado.revisaoPendente).toBe(false);
    expect(atualizado.revisadoEm.getTime()).toBeGreaterThan(new Date('1999-01-01').getTime());
    expect(atualizado.ativo).toBe(true);
  });

  it('grava os metadados do PDF novo e remove o arquivo anterior após substituir', async () => {
    const admin = await criarContaAprovada();
    const relatorio = await cadastrarRelatorio(
      {
        titulo: 'Relatório de integração',
        tipo: 'ANUAL',
        periodoReferencia: '2026',
      },
      admin.id,
    );
    await enviarPdfRelatorio(relatorio.id, arquivoPdf(await criarPdf(), 'primeiro.pdf'));
    const caminhoAnterior = await baixarPdfAdministrativo(relatorio.id);

    const novoPdf = await criarPdf(2);
    await enviarPdfRelatorio(relatorio.id, arquivoPdf(novoPdf, 'segundo.pdf'));
    await expect(
      prisma.relatorio.findUniqueOrThrow({ where: { id: relatorio.id } }),
    ).resolves.toMatchObject({ arquivoNome: 'segundo.pdf', arquivoTamanho: novoPdf.length });
    await expect(readFile(await baixarPdfAdministrativo(relatorio.id))).resolves.toEqual(novoPdf);
    await expect(readFile(caminhoAnterior)).rejects.toMatchObject({ code: 'ENOENT' });
  });
});
