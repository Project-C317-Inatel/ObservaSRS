import { afterAll, describe, expect, it } from 'vitest';

import { listarRegistrosPublicos } from '../../src/modules/consulta-publica/consulta-publica.service.js';
import { cadastrarRegistroIndicador } from '../../src/modules/registros-indicadores/registro-indicador.service.js';
import { cadastrarSetor, editarSetor } from '../../src/modules/setores/setor.service.js';
import { prisma } from '../../src/shared/database/prisma.js';

afterAll(() => prisma.$disconnect());

async function criarCatalogo(nome: string) {
  const setor = await prisma.setor.create({ data: { nome } });
  const indicador = await prisma.indicador.create({
    data: { nome: 'Pernoites', unidade: 'noites', setorId: setor.id },
  });
  const fonte = await prisma.fonteDado.create({
    data: { nome: 'Pesquisa local', tipo: 'Pesquisa' },
  });
  return { setor, indicadorId: indicador.id, fonteId: fonte.id };
}

describe('Catálogo e consulta pública com PostgreSQL', () => {
  it('traduz a restrição de nome único do setor em conflito de negócio', async () => {
    const dados = { nome: 'Setor com nome único', ativo: true };
    await cadastrarSetor(dados);

    await expect(cadastrarSetor(dados)).rejects.toMatchObject({
      statusCode: 409,
      code: 'sector_name_already_registered',
    });
    expect(await prisma.setor.count({ where: { nome: dados.nome } })).toBe(1);
  });

  it('preserva nome e estado ao editar somente a descrição de um setor', async () => {
    const setor = await cadastrarSetor({
      nome: 'Setor em edição',
      descricao: 'Antes',
      ativo: false,
    });
    await editarSetor(setor.id, { descricao: 'Depois' });

    await expect(
      prisma.setor.findUniqueOrThrow({ where: { id: setor.id } }),
    ).resolves.toMatchObject({ nome: setor.nome, descricao: 'Depois', ativo: false });
  });

  it('grava apenas um registro quando duas gravações concorrentes têm a mesma chave', async () => {
    const { indicadorId, fonteId } = await criarCatalogo('Setor concorrente');
    const dados = {
      indicadorId,
      fonteId,
      periodo: new Date('2026-04-01'),
      valor: '999999999999.99',
      publicado: false,
    };
    const resultados = await Promise.allSettled([
      cadastrarRegistroIndicador(dados),
      cadastrarRegistroIndicador(dados),
    ]);
    expect(resultados.filter(({ status }) => status === 'fulfilled')).toHaveLength(1);
    expect(resultados).toContainEqual({
      status: 'rejected',
      reason: expect.objectContaining({
        statusCode: 409,
        code: 'indicator_record_already_registered',
      }),
    });

    const registros = await prisma.registroIndicador.findMany({ where: { indicadorId } });
    expect(registros).toHaveLength(1);
    expect(registros[0]?.valor.toFixed(2)).toBe(dados.valor);
  });

  it('pagina só os registros publicados de vínculos ativos e omite a observação interna', async () => {
    const { setor, indicadorId, fonteId } = await criarCatalogo('Setor para consulta pública');
    const base = { indicadorId, fonteId, valor: '12.50', observacao: 'Uso interno' };
    for (const [periodo, publicado] of [
      ['2026-01-01', true],
      ['2026-02-01', true],
      ['2026-03-01', false],
    ] as const) {
      await cadastrarRegistroIndicador({ ...base, periodo: new Date(periodo), publicado });
    }

    const filtros = { pagina: 2, limite: 1, indicadorId };
    const pagina = await listarRegistrosPublicos(filtros);
    expect(pagina.total).toBe(2);
    expect(pagina.registros).toHaveLength(1);
    expect(pagina.registros[0]).toMatchObject({ periodo: new Date('2026-01-01') });
    expect(pagina.registros[0]).not.toHaveProperty('observacao');

    await editarSetor(setor.id, { ativo: false });
    await expect(listarRegistrosPublicos({ ...filtros, pagina: 1 })).resolves.toEqual({
      registros: [],
      total: 0,
    });
  });
});
