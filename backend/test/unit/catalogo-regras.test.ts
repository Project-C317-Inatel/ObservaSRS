import { describe, expect, it } from 'vitest';

import { listarRegistrosPublicosSchema } from '../../src/modules/consulta-publica/consulta-publica.schemas.js';
import {
  cadastroRegistroIndicadorSchema,
  edicaoRegistroIndicadorSchema,
  periodoSchema,
} from '../../src/modules/registros-indicadores/registro-indicador.schemas.js';

const dados = {
  indicadorId: '11111111-1111-4111-8111-111111111111',
  fonteId: '22222222-2222-4222-8222-222222222222',
  periodo: '2028-02-29',
};

describe('Registros de indicadores', () => {
  it('converte uma data bissexta válida em meia-noite UTC', () => {
    expect(periodoSchema.parse('2028-02-29').toISOString()).toBe('2028-02-29T00:00:00.000Z');
  });

  it('recusa datas inexistentes e o ano zero', () => {
    for (const periodo of ['2027-02-29', '2026-04-31', '0000-01-01']) {
      expect(periodoSchema.safeParse(periodo).success).toBe(false);
    }
  });

  it('preserva o decimal no limite de precisão e cria como rascunho por padrão', () => {
    expect(
      cadastroRegistroIndicadorSchema.parse({ ...dados, valor: '999999999999.99' }),
    ).toMatchObject({ valor: '999999999999.99', publicado: false });
  });

  it('recusa valores fora da precisão do banco ou com separador incorreto', () => {
    for (const valor of ['1000000000000.00', '1.123', '1,50']) {
      expect(cadastroRegistroIndicadorSchema.safeParse({ ...dados, valor }).success).toBe(false);
    }
  });

  it('permite limpar a observação com null sem preencher outros campos na edição', () => {
    expect(edicaoRegistroIndicadorSchema.parse({ observacao: null })).toEqual({ observacao: null });
  });

  it('recusa uma edição vazia ou uma tentativa de publicar pela edição', () => {
    expect(edicaoRegistroIndicadorSchema.safeParse({}).success).toBe(false);
    expect(
      edicaoRegistroIndicadorSchema.safeParse({ valor: '1.00', publicado: true }).success,
    ).toBe(false);
  });

  it('recusa consulta pública com intervalo de datas invertido', () => {
    const resultado = listarRegistrosPublicosSchema.safeParse({
      periodoInicio: '2026-06-01',
      periodoFim: '2026-05-01',
    });
    expect(resultado.error?.issues[0]?.path).toEqual(['periodoFim']);
  });
});
