import { describe, expect, it } from 'vitest';

import { adaptIndicatorRecords, adaptarRegistrosIndicadores } from './adapter';
import type { RegistroIndicador } from '../../types/api';

describe('adaptIndicatorRecords', () => {
  it('retorna array vazio quando recebe lista vazia', () => {
    expect(adaptIndicatorRecords([])).toEqual([]);
  });

  it('agrupa registros por periodo e setor preenchendo metricas principais e secundarias', () => {
    const mockRegistros: RegistroIndicador[] = [
      {
        id: '1',
        indicadorId: 'ind-1',
        indicadorNome: 'Visitantes',
        indicadorCodigo: 'visitantes',
        unidade: 'pessoas',
        setorNome: 'Hotelaria',
        periodo: '2025-01',
        valor: '1240',
      },
      {
        id: '2',
        indicadorId: 'ind-2',
        indicadorNome: 'Pernoites',
        indicadorCodigo: 'pernoites',
        unidade: 'noites',
        setorNome: 'Hotelaria',
        periodo: '2025-01',
        valor: '860',
      },
      {
        id: '3',
        indicadorId: 'ind-3',
        indicadorNome: 'Taxa de Ocupacao',
        indicadorCodigo: 'taxa_ocupacao',
        unidade: '%',
        setorNome: 'Hotelaria',
        periodo: '2025-01',
        valor: '68.5',
      },
      {
        id: '4',
        indicadorId: 'ind-4',
        indicadorNome: 'Estada Media',
        indicadorCodigo: 'estada_media',
        unidade: 'dias',
        setorNome: 'Hotelaria',
        periodo: '2025-01',
        valor: '2.4',
      },
    ];

    const result = adaptIndicatorRecords(mockRegistros);

    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({
      period: '2025-01',
      year: 2025,
      sector: 'Hotelaria',
      visitors: 1240,
      secondaryMetrics: {
        overnightStays: 860,
        occupancyRate: 68.5,
        averageStay: 2.4,
      },
    });
  });

  it('separa registros de setores ou periodos distintos', () => {
    const mockRegistros: RegistroIndicador[] = [
      {
        id: '1',
        indicadorId: 'ind-1',
        indicadorNome: 'Visitantes',
        indicadorCodigo: 'visitantes',
        unidade: 'pessoas',
        setorNome: 'Hotelaria',
        periodo: '2025-01',
        valor: '1240',
      },
      {
        id: '2',
        indicadorId: 'ind-1',
        indicadorNome: 'Visitantes',
        indicadorCodigo: 'visitantes',
        unidade: 'pessoas',
        setorNome: 'Atrativos turisticos',
        periodo: '2025-01',
        valor: '980',
      },
      {
        id: '3',
        indicadorId: 'ind-1',
        indicadorNome: 'Visitantes',
        indicadorCodigo: 'visitantes',
        unidade: 'pessoas',
        setorNome: 'Hotelaria',
        periodo: '2025-02',
        valor: '1380',
      },
    ];

    const result = adaptIndicatorRecords(mockRegistros);

    expect(result).toHaveLength(3);
    expect(result).toEqual([
      {
        period: '2025-01',
        year: 2025,
        sector: 'Hotelaria',
        visitors: 1240,
        secondaryMetrics: {
          overnightStays: null,
          occupancyRate: null,
          averageStay: null,
        },
      },
      {
        period: '2025-01',
        year: 2025,
        sector: 'Atrativos turisticos',
        visitors: 980,
        secondaryMetrics: {
          overnightStays: null,
          occupancyRate: null,
          averageStay: null,
        },
      },
      {
        period: '2025-02',
        year: 2025,
        sector: 'Hotelaria',
        visitors: 1380,
        secondaryMetrics: {
          overnightStays: null,
          occupancyRate: null,
          averageStay: null,
        },
      },
    ]);
  });

  it('lida com virgula decimal e valores invalidos', () => {
    const mockRegistros: RegistroIndicador[] = [
      {
        id: '1',
        indicadorId: 'ind-4',
        indicadorNome: 'Estada Media',
        indicadorCodigo: 'estada_media',
        unidade: 'dias',
        setorNome: 'Hotelaria',
        periodo: '2026-T1',
        valor: '2,5',
      },
      {
        id: '2',
        indicadorId: 'ind-1',
        indicadorNome: 'Visitantes',
        indicadorCodigo: 'visitantes',
        unidade: 'pessoas',
        setorNome: 'Hotelaria',
        periodo: '2026-T1',
        valor: 'invalid_number',
      },
    ];

    const result = adaptIndicatorRecords(mockRegistros);

    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({
      period: '2026-T1',
      year: 2026,
      sector: 'Hotelaria',
      visitors: 0,
      secondaryMetrics: {
        overnightStays: null,
        occupancyRate: null,
        averageStay: 2.5,
      },
    });
  });

  it('armazena metricas secundarias customizadas caso surjam codigos adicionais', () => {
    const mockRegistros: RegistroIndicador[] = [
      {
        id: '1',
        indicadorId: 'ind-custom',
        indicadorNome: 'Receita Media',
        indicadorCodigo: 'receita_media',
        unidade: 'reais',
        setorNome: 'Gastronomia',
        periodo: '2025-03',
        valor: '150.75',
      },
    ];

    const result = adaptIndicatorRecords(mockRegistros);

    expect(result[0]?.secondaryMetrics.receita_media).toBe(150.75);
  });

  it('exporta alias em portugues apontando para a mesma funcao', () => {
    expect(adaptarRegistrosIndicadores).toBe(adaptIndicatorRecords);
  });
});
