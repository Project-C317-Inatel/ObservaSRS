import { describe, expect, it } from 'vitest';
import { adaptIndicatorRecords, adaptarRegistrosIndicadores } from './adapter';
import { registroPublico } from '../../test/fixtures';

describe('adaptIndicatorRecords com contrato do Swagger', () => {
  it('retorna lista vazia', () => expect(adaptIndicatorRecords([])).toEqual([]));
  it('le indicador e setor relacionados sem depender de codigo inexistente', () => {
    const dados = [
      registroPublico('Visitantes', '1240'),
      registroPublico('Pernoites', '860'),
      registroPublico('Taxa de ocupação', '68.50'),
      registroPublico('Estada média', '2.40'),
    ];
    expect(adaptIndicatorRecords(dados)).toEqual([
      {
        period: '2026-01-01',
        year: 2026,
        sector: 'Hotelaria',
        visitors: 1240,
        secondaryMetrics: { overnightStays: 860, occupancyRate: 68.5, averageStay: 2.4 },
      },
    ]);
  });
  it('preserva periodos distintos', () => {
    expect(
      adaptIndicatorRecords([
        registroPublico(),
        registroPublico('Visitantes', '3', { periodo: '2026-02-01' }),
      ]),
    ).toHaveLength(2);
  });
  it('nao soma fontes concorrentes nem sobrescreve valores', () => {
    expect(() =>
      adaptIndicatorRecords([
        registroPublico(),
        registroPublico('Visitantes', '3', { fonteId: 'outra-fonte' }),
      ]),
    ).toThrow(/fontes/);
  });
  it('preserva metricas adicionais pelo nome normalizado', () => {
    expect(
      adaptIndicatorRecords([registroPublico('Receita média', '150.75')])[0]?.secondaryMetrics
        .receita_media,
    ).toBe(150.75);
  });
  it('exporta alias em portugues', () =>
    expect(adaptarRegistrosIndicadores).toBe(adaptIndicatorRecords));
});
