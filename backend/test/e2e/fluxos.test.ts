import request from 'supertest';
import { afterAll, describe, expect, it } from 'vitest';

import { app } from '../../src/app.js';
import { prisma } from '../../src/shared/database/prisma.js';
import { criarPdf } from '../fixtures/pdf.js';
import { criarContaAprovada, senhaTeste } from '../fixtures/usuario.js';

afterAll(() => prisma.$disconnect());

async function entrarComo(papel: 'ADMIN' | 'SUPER_ADMIN') {
  const conta = await criarContaAprovada(papel);
  const sessao = request.agent(app);
  await sessao.post('/auth/login').send({ email: conta.email, senha: senhaTeste }).expect(200);
  return { sessao, conta };
}

describe('Fluxos HTTP completos do backend', () => {
  it('solicita acesso, aprova a conta e invalida a sessão antiga após desativar e reativar', async () => {
    const candidato = request.agent(app);
    const credenciais = { email: 'candidato.e2e@teste.local', senha: senhaTeste };
    const cadastro = await candidato
      .post('/auth/registro')
      .send({ ...credenciais, nome: 'Candidato a administrador' })
      .expect(201);
    const { id } = cadastro.body.solicitacao;
    expect(cadastro.body.solicitacao).toMatchObject({ status: 'PENDENTE', papel: 'ADMIN' });
    expect(cadastro.body.solicitacao).not.toHaveProperty('senhaHash');

    const bloqueado = await candidato.post('/auth/login').send(credenciais).expect(403);
    expect(bloqueado.body.error).toBe('account_pending');

    const { sessao: superAdmin, conta } = await entrarComo('SUPER_ADMIN');
    const pendentes = await superAdmin.get('/admin/solicitacoes?status=PENDENTE').expect(200);
    expect(pendentes.body.solicitacoes).toContainEqual(expect.objectContaining({ id }));
    const aprovada = await superAdmin.patch(`/admin/solicitacoes/${id}/aprovar`).expect(200);
    expect(aprovada.body.solicitacao).toMatchObject({
      status: 'APROVADO',
      ativo: true,
      avaliadoPorId: conta.id,
    });

    await candidato.post('/auth/login').send(credenciais).expect(200);
    const sessaoAtiva = await candidato.get('/auth/me').expect(200);
    expect(sessaoAtiva.body.usuario.id).toBe(id);
    await superAdmin.patch(`/admin/contas/${id}/desativar`).send({}).expect(200);
    await candidato.get('/auth/me').expect(401);
    await superAdmin.patch(`/admin/contas/${id}/reativar`).send({}).expect(200);
    const antiga = await candidato.get('/auth/me').expect(401);
    expect(antiga.body.error).toBe('invalid_session');

    await candidato.post('/auth/login').send(credenciais).expect(200);
    await candidato.get('/auth/me').expect(200);
    await candidato.post('/auth/logout').expect(204);
    await candidato.get('/auth/me').expect(401);
  });

  it('cadastra setor, indicador, fonte e registro e alterna a consulta pública', async () => {
    const { sessao } = await entrarComo('ADMIN');
    const setor = await sessao.post('/admin/setores').send({ nome: 'Hotelaria E2E' }).expect(201);
    const indicador = await sessao
      .post('/admin/indicadores')
      .send({
        nome: 'Pernoites',
        unidade: 'noites',
        setorId: setor.body.setor.id,
      })
      .expect(201);
    const fonte = await sessao
      .post('/admin/fontes-dados')
      .send({
        nome: 'Pesquisa E2E',
        tipo: 'Pesquisa',
      })
      .expect(201);
    const cadastro = await sessao
      .post('/admin/registros-indicadores')
      .send({
        indicadorId: indicador.body.indicador.id,
        fonteId: fonte.body.fonte.id,
        periodo: '2026-10-01',
        valor: '2130.75',
        observacao: 'Nota interna',
      })
      .expect(201);
    const { id } = cadastro.body.registro;
    const rotaPublica = `/registros-indicadores/${id}`;
    const publicacao = `/admin/registros-indicadores/${id}/publicacao`;
    const publico = request(app);

    await publico.get(rotaPublica).expect(404);
    await sessao.patch(publicacao).send({ publicado: true }).expect(200);
    const visivel = await publico.get(rotaPublica).expect(200);
    expect(visivel.body.registro).toMatchObject({
      id,
      valor: '2130.75',
      indicador: { nome: 'Pernoites', setor: { nome: 'Hotelaria E2E' } },
      fonte: { nome: 'Pesquisa E2E' },
    });
    expect(visivel.body.registro).not.toHaveProperty('observacao');
    await sessao.patch(publicacao).send({ publicado: false }).expect(200);
    await publico.get(rotaPublica).expect(404);
  });

  it('exige PDF para publicar, entrega o arquivo original e bloqueia o download ao despublicar', async () => {
    const { sessao } = await entrarComo('ADMIN');
    const criado = await sessao
      .post('/admin/relatorios')
      .send({
        titulo: 'Relatório E2E',
        tipo: 'ANUAL',
        periodoReferencia: '2026',
      })
      .expect(201);
    const { id } = criado.body.relatorio;
    const relatorio = `/admin/relatorios/${id}`;
    const rotaPublica = `/relatorios/${id}/arquivo`;
    const publico = request(app);

    const semArquivo = await sessao
      .patch(`${relatorio}/publicacao`)
      .send({ publicado: true })
      .expect(409);
    expect(semArquivo.body.error).toBe('report_pdf_required');
    const pdf = await criarPdf();
    await sessao
      .post(`${relatorio}/arquivo`)
      .attach('arquivo', pdf, {
        filename: 'relatorio-e2e.pdf',
        contentType: 'application/pdf',
      })
      .expect(200);
    await publico.get(rotaPublica).expect(404);

    await sessao.patch(`${relatorio}/publicacao`).send({ publicado: true }).expect(200);
    const download = await publico
      .get(rotaPublica)
      .expect('Content-Type', /application\/pdf/)
      .expect(200);
    expect(download.body).toEqual(pdf);
    await sessao.patch(`${relatorio}/publicacao`).send({ publicado: false }).expect(200);
    await publico.get(rotaPublica).expect(404);
  });

  it('cadastra um item PIT inativo, edita, ativa, revisa e oculta novamente', async () => {
    const { sessao } = await entrarComo('ADMIN');
    const criado = await sessao
      .post('/admin/itens-pit')
      .send({
        nome: 'Museu E2E',
        categoria: 'Cultura',
        localizacao: 'Centro',
        ativo: false,
      })
      .expect(201);
    const { id } = criado.body.item;
    const rota = `/admin/itens-pit/${id}`;
    const rotaPublica = `/itens-pit/${id}`;
    const publico = request(app);

    await publico.get(rotaPublica).expect(404);
    await sessao.patch(rota).send({ ativo: true, descricao: 'Acervo local' }).expect(200);
    const visivel = await publico.get(rotaPublica).expect(200);
    expect(visivel.body.item).toMatchObject({
      nome: 'Museu E2E',
      localizacao: 'Centro',
      descricao: 'Acervo local',
    });
    expect(visivel.body.item).not.toHaveProperty('revisadoEm');
    const revisado = await sessao.patch(`${rota}/revisao`).send({}).expect(200);
    expect(revisado.body.item).toMatchObject({ revisaoPendente: false, ativo: true });
    await sessao.patch(rota).send({ ativo: false }).expect(200);
    await publico.get(rotaPublica).expect(404);
  });

  it('recebe a coleta, exige aprovação e publica somente o resumo agregado', async () => {
    const { sessao } = await entrarComo('ADMIN');
    const publico = request(app);
    const periodoReferencia = '2026-11';
    const criado = await publico
      .post('/api/coletas')
      .send({
        nomeEstabelecimento: 'Pousada E2E',
        cnpjCadastur: 'E2E12345',
        periodoReferencia,
        leitosOcupados: 24,
        origemVisitantes: 'Minas Gerais',
      })
      .expect(201);
    const { id } = criado.body.coleta;
    const rota = `/admin/coletas/${id}`;
    const resumo = `/coletas/resumo?periodoReferencia=${periodoReferencia}`;
    const vazio = { resumo: { periodoReferencia, estabelecimentos: 0, leitosOcupados: 0 } };

    const pendente = await sessao.patch(`${rota}/publicacao`).send({ publicado: true }).expect(409);
    expect(pendente.body.error).toBe('collection_not_publishable');
    const aprovada = await sessao.patch(`${rota}/aprovar`).send({}).expect(200);
    expect(aprovada.body.coleta).toMatchObject({ status: 'APROVADO', publicado: false });
    await publico.get(resumo).expect(200, vazio);

    await sessao.patch(`${rota}/publicacao`).send({ publicado: true }).expect(200);
    await publico.get(resumo).expect(200, {
      resumo: { periodoReferencia, estabelecimentos: 1, leitosOcupados: 24 },
    });
    await sessao.patch(`${rota}/publicacao`).send({ publicado: false }).expect(200);
    await publico.get(resumo).expect(200, vazio);
  });
});
