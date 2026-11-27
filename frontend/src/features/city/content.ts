export interface CityMilestone {
  ano: string;
  texto: string;
}

export interface CccfInitiative {
  nome: string;
  descricao: string;
}

export const CITY_TEXT: readonly string[] = [
  'Santa Rita do Sapucaí, com aproximadamente 43.000 habitantes, está localizada no sul de Minas Gerais e se destaca não apenas por sua deslumbrante paisagem montanhosa, mas também por sua localização estratégica, próxima aos principais centros urbanos do Sudeste brasileiro: Belo Horizonte, São Paulo e Rio de Janeiro.',
  'Um dos maiores reconhecimentos de Santa Rita do Sapucaí é pelo desenvolvimento tecnológico iniciado em 1959, com a construção da 1ª Escola Técnica de Eletrônica da América Latina, a renomada ETE “Francisco Moreira da Costa”. A cidade continuou sua trajetória de inovação com a criação do INATEL - Instituto Nacional de Telecomunicações (1965) - a 1ª faculdade de Telecomunicações do Brasil, do Centro de Ensino Superior em Gestão, Tecnologia e Educação – FAI (1971) - a 1ª Instituição a oferecer curso de Administração e Processamento de Dados no Sul de Minas, e, sobretudo, com a criação e disseminação da marca ‘Vale da Eletrônica’ nos anos 80, o que materializou o ecossistema de empreendedorismo e inovação e desenvolveu significativamente a economia e a cultura local. Desde então, a cidade vem se destacando no cenário tecnológico nacional contando com mais de 170 startups e empresas de base tecnológica. Agora, reconhecido pelo Governo do Estado de Minas Gerais, o Parque Tecnológico Aberto fortalece ainda mais todo esse ambiente favorável à inovação.',
  'Nosso “cantinho feliz”, como escrito em nossa bandeira, fica ainda mais interessante quando falamos de criatividade. Em 2013, o Movimento Cidade Criativa, Cidade Feliz foi lançado, impulsionando o Turismo e a Economia Criativa na região, tornando Santa Rita um palco de diversos eventos, como o Hacktown, um dos maiores festivais de tecnologia, criatividade e inovação da América Latina.',
  'Em um movimento de resgate das nossas origens, produtores e produtoras rurais santa-ritenses uniram o conhecimento ancestral do cuidado com a terra a novos conhecimentos e passaram a cultivar os tão desejados cafés especiais, comercializando além dos grãos, experiências turísticas sensoriais. Esse esforço conjunto potencializou o turismo local, levando a cidade a integrar a Rota do Café de Minas Gerais pelo MTur em 2020. Em 2023, Santa Rita do Sapucaí passou a fazer parte da Rota do Café Nacional, reconhecida como monumento nacional pela Lei nº 14.718, valorizando ainda mais a história e a cultura local.',
  'Somos uma comunidade acolhedora e a criatividade está em nosso DNA. Aqui tudo se mistura, o verde das montanhas, paisagens rurais, nossa arte, religiosidade, gastronomia e a nossa capacidade única de unir a cultura à tecnologia para gerar inovação.',
];

export const CITY_CLOSING =
  'Somos mineiros de um jeito que só nós sabemos ser. Venha nos conhecer!';

/** Marcos tirados dos próprios textos acima, para a linha do tempo. */
export const CITY_MILESTONES: readonly CityMilestone[] = [
  { ano: '1959', texto: 'ETE FMC, a 1ª Escola Técnica de Eletrônica da América Latina' },
  { ano: '1965', texto: 'Inatel, a 1ª faculdade de Telecomunicações do Brasil' },
  { ano: '1971', texto: 'FAI, pioneira em Administração e Processamento de Dados no Sul de Minas' },
  { ano: 'Anos 80', texto: 'Nasce a marca Vale da Eletrônica' },
  { ano: '2013', texto: 'Lançamento do Movimento Cidade Criativa, Cidade Feliz' },
  { ano: '2020', texto: 'A cidade entra na Rota do Café de Minas Gerais' },
  { ano: '2023', texto: 'Santa Rita passa a integrar a Rota do Café Nacional' },
  { ano: '2024', texto: 'O CCCF recebe o Prêmio Brasil Criativo' },
];

export const CCCF_SUBTITLE =
  'Movimento colaborativo pela transformação criativa de Santa Rita do Sapucaí, MG.';

export const CCCF_TEXT: readonly string[] = [
  'Santa Rita do Sapucaí é conhecida pelo Vale da Eletrônica. Mas há algo que vai além da tecnologia: uma forma própria de pensar a cidade, reunir pessoas e transformar criatividade em desenvolvimento. Esse algo tem nome: Movimento Cidade Criativa, Cidade Feliz (CCCF).',
  'Nascido em 2013 da mobilização de moradores, artistas, empreendedores e instituições de ensino, o CCCF partiu de uma pergunta simples e profunda: qual é o verdadeiro propósito de uma cidade? A resposta de Santa Rita foi a felicidade — entendida como bem-estar coletivo, pertencimento e oportunidade para todos.',
  'O CCCF não é um evento — é o ecossistema que promove os eventos. Reconhecido como Patrimônio Imaterial Municipal, o movimento é a raiz de iniciativas que transformaram a cidade:',
];

export const CCCF_INITIATIVES: readonly CccfInitiative[] = [
  {
    nome: 'HackTown',
    descricao: 'Maior festival de inovação e criatividade da América Latina.',
  },
  {
    nome: 'NEEC',
    descricao:
      'Núcleo de Empreendimentos de Economia Criativa, que acelera negócios e transforma talentos em renda.',
  },
  {
    nome: 'Editais de fomento cultural',
    descricao: 'Democratizam recursos públicos por meio do Sistema Integrado de Projetos (SIP).',
  },
  {
    nome: 'Rota da Inovação',
    descricao:
      'Produto turístico que convida visitantes a vivenciar Santa Rita do Sapucaí por inteiro.',
  },
];

export const CCCF_RECOGNITION =
  'Em 2024 o movimento recebeu o Prêmio Brasil Criativo do Ministério da Cultura e foi citado em publicação da Universidade Tsinghua (China) como modelo internacional de cidade criativa.';

export const CCCF_CLOSING =
  'O resultado é uma cidade onde tecnologia e criatividade não são mundos separados — são a mesma coisa.';
