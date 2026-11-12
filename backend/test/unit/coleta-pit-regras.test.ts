import { describe, expect, it } from 'vitest';

import {
  cnpjCadasturSchema,
  envioColetaSchema,
  mesReferenciaSchema,
} from '../../src/modules/coletas/coleta.schemas.js';
import { cadastroItemPitSchema } from '../../src/modules/inventario-pit/item-pit.schemas.js';

describe('Coletas e inventário PIT', () => {
  it('normaliza a máscara e a caixa do identificador do estabelecimento', () => {
    expect(cnpjCadasturSchema.parse(' 12.abc/34-5 ')).toBe('12ABC345');
  });

  it('recusa mês inexistente e aceita o último mês do ano', () => {
    expect(mesReferenciaSchema.safeParse('2026-13').success).toBe(false);
    expect(mesReferenciaSchema.parse('2026-12')).toBe('2026-12');
  });

  it('recusa leitos negativos ou fracionários e aceita zero', () => {
    const dados = {
      nomeEstabelecimento: 'Pousada Teste',
      cnpjCadastur: 'TESTE123',
      periodoReferencia: '2026-10',
    };
    expect(envioColetaSchema.safeParse({ ...dados, leitosOcupados: -1 }).success).toBe(false);
    expect(envioColetaSchema.safeParse({ ...dados, leitosOcupados: 2.5 }).success).toBe(false);
    expect(envioColetaSchema.parse({ ...dados, leitosOcupados: 0 }).leitosOcupados).toBe(0);
  });

  it('recusa protocolo de imagem diferente de HTTP ou HTTPS no PIT', () => {
    const dados = { nome: 'Atrativo Teste', categoria: 'Cultura', localizacao: 'Centro' };
    expect(
      cadastroItemPitSchema.safeParse({ ...dados, imagemUrl: 'file:///foto.png' }).success,
    ).toBe(false);
    expect(
      cadastroItemPitSchema.parse({ ...dados, imagemUrl: 'https://teste.local/foto.png' })
        .imagemUrl,
    ).toBe('https://teste.local/foto.png');
  });
});
