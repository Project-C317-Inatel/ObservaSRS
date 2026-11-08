# Gestao de acesso das contas aprovadas

## Preparacao

Com o PostgreSQL configurado, execute na pasta `backend/`:

```powershell
npm run db:deploy
npm run db:generate
npm run dev
```

A migration adiciona `versao_sessao` a `user_admin`, com valor inicial zero, sem apagar
contas ou alterar senhas. Nao e necessario executar o seed novamente.

Depois da migration, reinicie todas as instancias do backend com o codigo atualizado.
Versoes anteriores nao verificam o contador de sessao e nao devem continuar atendendo
requisicoes junto desta versao para que a revogacao seja aplicada de forma consistente.

Abra `http://localhost:3333/docs` e entre por `POST /auth/login` com um SUPER_ADMIN aprovado
e ativo. As novas acoes estao no grupo **Super administrador** e nao alteram o frontend.

## Localizar as contas

Execute `GET /admin/solicitacoes` com `status=APROVADO`.

O filtro opcional `ativo` permite separar as contas:

```http
GET /admin/solicitacoes?status=APROVADO&ativo=true
GET /admin/solicitacoes?status=APROVADO&ativo=false
```

Sem `ativo`, sao retornadas contas ativas e inativas do status selecionado. Sem `status`,
o padrao continua sendo `PENDENTE`. A resposta permanece `{ "solicitacoes": [...] }`,
sem campos de senha ou controle de sessao. Contas SUPER_ADMIN nao aparecem nessa listagem.

Guarde o `id` de uma conta ADMIN ou EDITOR aprovada. Uma conta desativada continua com
`status=APROVADO` e `ativo=false`; ela nao volta a ser pendente nem passa a ser rejeitada.

## Desativar

Execute `PATCH /admin/contas/{id}/desativar`, preenchendo apenas o ID.
Nao envie corpo, motivo ou justificativa. Um objeto vazio e aceito, mas campos adicionais
sao rejeitados com `400`.

O retorno esperado e `200`, com `message` e `conta`. O campo `ativo` passa a `false`.
Senha, papel, status, avaliacao original e dados cadastrados pelo usuario sao preservados.
Relatorios e registros publicados por essa pessoa nao sao despublicados automaticamente.

Depois da desativacao:

- Novo login com a senha correta recebe `403`, com codigo `account_inactive`.
- Um cookie emitido antes da mudanca recebe `401` nas rotas protegidas, inclusive em `GET /auth/me`.
- Consultas publicas continuam acessiveis, como para qualquer visitante sem login.

O bloqueio ocorre na verificacao de acesso das requisicoes seguintes. Ele nao cancela uma
operacao ou download que ja tenha sido autorizado e esteja em andamento.

## Reativar

Execute `PATCH /admin/contas/{id}/reativar`, tambem sem corpo.

O retorno esperado e `200`, com `conta.ativo=true`. A conta continua aprovada e conserva
sua senha e seu papel. Reativar um EDITOR nao o transforma em ADMIN.

Os cookies anteriores nao voltam a funcionar. O usuario precisa executar `POST /auth/login`
novamente com suas credenciais existentes para obter uma nova sessao.

Repetir a desativacao de uma conta ja inativa ou a reativacao de uma conta ja ativa retorna
`200` sem nova mudanca, sem incrementar o controle de sessao e sem invalidar a sessao atual
de uma conta que ja estava ativa.

## Protecoes

- Somente SUPER_ADMIN aprovado e ativo pode chamar as duas acoes.
- ADMIN e EDITOR autenticados recebem `403`; sem sessao valida, a resposta e `401`.
- A propria conta do solicitante e todas as contas SUPER_ADMIN sao protegidas com `403`.
- Contas PENDENTE ou REJEITADO recebem `409`; essas acoes nao substituem a aprovacao inicial.
- IDs inexistentes recebem `404`, e UUIDs invalidos recebem `400`.
- As atualizacoes verificam status, papel e estado atual tambem no banco, evitando sobrescrever
  alteracoes concorrentes com dados lidos anteriormente.
- Uma aprovacao ou rejeicao somente e gravada enquanto a solicitacao continua PENDENTE.
  Uma aprovacao antiga nao pode reativar uma conta que ja foi avaliada e depois desativada.

## Testar com duas sessoes

Use uma janela normal com o SUPER_ADMIN e uma janela anonima com uma conta ADMIN aprovada.
Abas da mesma janela compartilham cookies e nao representam sessoes independentes.

1. Na janela anonima, faca login como ADMIN e confira `GET /auth/me` retornando `200`.
2. Na janela normal, entre como SUPER_ADMIN e localize o ID da conta em `status=APROVADO`.
3. Desative a conta por `PATCH /admin/contas/{id}/desativar`: retorno `200`.
4. Na janela anonima, repita `GET /auth/me`: deve retornar `401`.
5. Tente fazer login novamente como ADMIN enquanto desativado: deve retornar `403`.
6. Na janela normal, reative a conta por `PATCH /admin/contas/{id}/reativar`: retorno `200`.
7. Na janela anonima, o cookie antigo continua recebendo `401` em `GET /auth/me`.
8. Faca novo login como ADMIN: retorno `200`, seguido de `GET /auth/me` tambem com `200`.

## Controle de sessao

Cada mudanca efetiva de acesso incrementa o campo interno `versao_sessao` da conta.
O JWT recebe a versao vigente no login; o middleware compara essa versao com a do banco
em toda requisicao protegida. Assim, reativar uma conta nao restaura tokens antigos.

Tokens validos emitidos antes desta migration sao tratados como versao zero, preservando
as sessoes existentes das contas que ainda nao passaram por uma mudanca de acesso.
O controle nao e exposto nas respostas de conta ou de login. Nao altere `ativo`, status
ou `versao_sessao` manualmente pelo banco para simular essas acoes: use os endpoints.

## Conferir no pgAdmin

No Query Tool do banco do backend:

```sql
SELECT id, nome, email, papel, status, ativo, atualizado_em
FROM public.user_admin
WHERE papel <> 'SUPER_ADMIN'
ORDER BY nome;
```

A consulta e apenas para visualizacao. Nao e necessario copiar senha, hash ou cookie
para executar o fluxo no Swagger.
