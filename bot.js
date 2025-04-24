const TelegramBot = require('node-telegram-bot-api');
const moment = require('moment');
require('moment/locale/pt-br');

const token = 'TOKEN';
const bot = new TelegramBot(token, {polling: true});

// Dados simulados (sem banco de dados)
const furiaData = {
  team: {
    name: "FURIA Esports",
    founded: 2017,
    players: ["KSCERATO", "YEKINDAR", "yuurih", "moloboy", "FalleN"],
    coach: "guerri"
  },
  schedule: [
    {
      id: 1,
      date: moment().add(2, 'days').format('DD/MM/YYYY'),
      time: '18:00',
      opponent: 'Team Liquid',
      tournament: 'ESL Pro League',
      link: 'https://twitch.tv/esl_csgo'
    },
    {
      id: 2,
      date: moment().add(5, 'days').format('DD/MM/YYYY'),
      time: '15:30',
      opponent: 'Natus Vincere',
      tournament: 'BLAST Premier',
      link: 'https://twitch.tv/blastpremier'
    }
  ],
  results: {
    lastMatch: {
      opponent: 'MIBR',
      score: '2-1',
      win: true,
      highlights: [
        "KSCERATO 1v3 clutch na Mirage",
        "YEKINDAR 4 kills com Deagle no pistol round",
        "yuurih 1v2 no mapa decisivo"
      ]
    },
    liveMatch: null // Pode ser preenchido durante jogos
  },
  stats: {
    KSCERATO: { 
      kd: 1.25, 
      adr: 85.4, 
      maps: ['Mirage (1.35 rating)', 'Inferno (1.28 rating)'],
      role: "Entry Fragger"
    },
    YEKINDAR: { 
      kd: 1.10, 
      adr: 78.9, 
      maps: ['Vertigo (1.22 rating)', 'Overpass (1.18 rating)'],
      role: "IGL/Entry"
    },
    yuurih: { 
      kd: 1.18, 
      adr: 82.1, 
      maps: ['Inferno (1.30 rating)', 'Nuke (1.25 rating)'],
      role: "Lurker"
    },
    moloboy: { 
      kd: 1.05, 
      adr: 75.3, 
      maps: ['Ancient (1.20 rating)', 'Mirage (1.15 rating)'],
      role: "Support"
    },
    FalleN: { 
      kd: 1.08, 
      adr: 70.2, 
      maps: ['Mirage (1.25 rating)', 'Overpass (1.20 rating)'],
      role: "AWPer"
    }
  },
  media: {
    clips: [
      {title: "Melhores momentos vs MIBR", url: "https://youtu.be/clipe1"},
      {title: "Treino secreto na gaming house", url: "https://youtu.be/clipe2"},
      {title: "Entrevista com KSCERATO", url: "https://youtu.be/clipe3"}
    ],
    phrases: [
      {text: "É a tropa da FURIA!", player: "KSCERATO", context: "Pós-vitória em torneio"},
      {text: "Tá maluco!", player: "yuurih", context: "Play inacreditável"}
    ]
  },
  quiz: [
    {
      id: 1,
      question: "Em que ano a FURIA foi fundada?",
      options: ["2016", "2017", "2018"],
      answer: 1,
      explanation: "A FURIA foi fundada em 2017 e rapidamente se tornou uma das principais equipes do cenário brasileiro."
    },
    {
      id: 2,
      question: "Quem foi o primeiro jogador a entrar para o time principal de CS?",
      options: ["KSCERATO", "ArT", "yuurih"],
      answer: 0,
      explanation: "KSCERATO foi a primeira contratação de peso da FURIA em 2018."
    },
    {
      id: 3,
      question: "Qual o maior achievement da FURIA em CS?",
      options: ["Vencer o ESL Pro League", "Chegar ao top 3 mundial", "Ganhar um Major"],
      answer: 0,
      explanation: "A FURIA venceu o ESL Pro League em 2022, seu maior título até hoje."
    }
  ],
  store: {
    url: "https://loja.furia.gg",
    promotions: [
      "🔥 CAMISA FURIA 2024 - 20% OFF (R$199 → R$159)",
      "🎧 HEADSET FURIA EDITION - Lançamento!"
    ]
  },
  history: [
    {year: 2017, event: "Fundação da organização"},
    {year: 2018, event: "Formação do time de CS:GO"},
    {year: 2019, event: "Primeira final internacional (DreamHack Open)"},
    {year: 2020, event: "Chegada ao top 5 mundial"},
    {year: 2022, event: "Título do ESL Pro League"},
    {year: 2023, event: "Contratação de FalleN e chelo"},
    {year: 2025, event: "Contratação de YEKINDAR e moloboy"}
  ]
};

// Variáveis de estado (para quizzes)
const userQuizState = {};

// Funções auxiliares
function getRandomResponse() {
  const responses = [
    "Beleza, anota aí!",
    "Tá na mão, parceiro!",
    "É nois! Olha só:",
    "Ah, isso eu sei!",
    "Pergunta boa, vem ver:",
    "Tá ligado? Dá uma olhada:"
  ];
  return responses[Math.floor(Math.random() * responses.length)];
}

function isCommand(msg, commands) {
  if (!msg.text) return false;
  const text = msg.text.toLowerCase().replace('/', '');
  return commands.some(cmd => text === cmd.toLowerCase());
}

function sendMainMenu(chatId) {
  const menu = `
🎮 *MENU PRINCIPAL* 🎮

Escolha uma opção:

1️⃣ *Jogos* - Próximos jogos e agenda
2️⃣ *Resultados* - Últimos jogos e placares
3️⃣ *Estatísticas* - Dados dos jogadores
4️⃣ *Resumos* - Destaques pós-jogo
5️⃣ *Mídia* - Clipes e bastidores
6️⃣ *Quiz* - Teste seu conhecimento
7️⃣ *Loja* - Produtos oficiais
8️⃣ *História* - Conquistas da FURIA
9️⃣ *Promoções* - Ofertas especiais

Digite o número ou nome da opção desejada!
  `;
  
  bot.sendMessage(chatId, menu, {parse_mode: 'Markdown'});
}

function sendSchedule(chatId) {
  let response = `${getRandomResponse()}\n\n 🗓️ *Agenda da FURIA:*\n\n`;
  
  if (furiaData.schedule.length === 0) {
    response += "Nenhum jogo agendado no momento. Fique de olho nas redes sociais para atualizações!";
  } else {
    furiaData.schedule.forEach(match => {
      response += `📅 *${match.date}* às *${match.time}*\n`;
      response += `⚔️ vs *${match.opponent}*\n`;
      response += `🏆 ${match.tournament}\n`;
      response += `📺 [Assista aqui](${match.link})\n\n`;
    });
  }
  
  bot.sendMessage(chatId, response, {parse_mode: 'Markdown', disable_web_page_preview: true});
}

function sendResults(chatId) {
  let response = `${getRandomResponse()}\n\n 📊 *Resultados:*\n\n`;
  
  if (furiaData.results.liveMatch) {
    response += `🔴 *JOGO AO VIVO*\n`;
    response += `${furiaData.results.liveMatch}\n\n`;
  }
  
  if (furiaData.results.lastMatch) {
    const match = furiaData.results.lastMatch;
    response += `ÚLTIMO JOGO:\n`;
    response += `🏆 vs *${match.opponent}*: *${match.score}* ${match.win ? '✅' : '❌'}\n`;
    response += `🌟 *Destaques:*\n- ${match.highlights.join('\n- ')}\n`;
  } else {
    response += "Nenhum resultado recente disponível.";
  }
  
  bot.sendMessage(chatId, response, {parse_mode: 'Markdown'});
}

function sendPlayerStats(chatId, playerName = null) {
  if (playerName) {
    const playerKey = playerName.toUpperCase();
    if (furiaData.stats[playerKey]) {
      const stats = furiaData.stats[playerKey];
      let response = `🎮 *${playerKey}* - ${stats.role}\n\n`;
      response += `🔫 K/D Ratio: *${stats.kd}*\n`;
      response += `💥 ADR: *${stats.adr}*\n`;
      response += `🗺️ Mapas favoritos:\n- ${stats.maps.join('\n- ')}\n`;
      bot.sendMessage(chatId, response, {parse_mode: 'Markdown'});
      return;
    }
  }
  
  let response = `${getRandomResponse()}\n\n 📈 *Estatísticas da Equipe:*\n\n`;
  for (const [player, stats] of Object.entries(furiaData.stats)) {
    response += `*${player}*: K/D ${stats.kd} | ADR ${stats.adr}\n`;
  }
  response += `\nDigite o nome de um jogador para ver detalhes (ex: "KSCERATO")`;
  bot.sendMessage(chatId, response, {parse_mode: 'Markdown'});
}

function sendQuiz(chatId, userId) {
  // Se o usuário já está em um quiz, continue
  if (userQuizState[userId] && userQuizState[userId].inQuiz) {
    const currentQuestion = furiaData.quiz.find(q => q.id === userQuizState[userId].currentQuestion);
    
    if (!currentQuestion) {
      delete userQuizState[userId];
      //return sendMainMenu(chatId);
    }
    
    let questionText = `❓ *Pergunta ${userQuizState[userId].currentQuestion}/${furiaData.quiz.length}:*\n`;
    questionText += `${currentQuestion.question}\n\n`;
    
    currentQuestion.options.forEach((option, index) => {
      questionText += `${index + 1}. ${option}\n`;
    });
    
    bot.sendMessage(chatId, questionText, {parse_mode: 'Markdown'});
    return;
  }
  
  // Iniciar novo quiz
  userQuizState[userId] = {
    inQuiz: true,
    score: 0,
    currentQuestion: 1,
    totalQuestions: furiaData.quiz.length
  };
  
  const firstQuestion = furiaData.quiz[0];
  let questionText = `🎮 *Quiz FURIA - Teste seu conhecimento!*\n\n`;
  questionText += `❓ *Pergunta 1/${furiaData.quiz.length}:*\n`;
  questionText += `${firstQuestion.question}\n\n`;
  
  firstQuestion.options.forEach((option, index) => {
    questionText += `${index + 1}. ${option}\n`;
  });
  
  bot.sendMessage(chatId, questionText, {parse_mode: 'Markdown'});
}

function handleQuizAnswer(chatId, userId, answer) {
  if (!userQuizState[userId] || !userQuizState[userId].inQuiz) return false;
  
  const currentQId = userQuizState[userId].currentQuestion;
  const question = furiaData.quiz.find(q => q.id === currentQId);
  
  if (!question) {
    delete userQuizState[userId];
    return false;
  }
  
  const selectedOption = parseInt(answer) - 1;
  
  if (isNaN(selectedOption) || selectedOption < 0 || selectedOption >= question.options.length) {
    bot.sendMessage(chatId, "Resposta inválida. Por favor, digite o número da opção correta (1, 2, 3...)");
    return true;
  }
  
  let response = "";
  
  if (selectedOption === question.answer) {
    userQuizState[userId].score++;
    response = "✅ *Correto!* ";
  } else {
    response = "❌ *Incorreto!* ";
  }
  
  response += `${question.explanation}\n\n`;
  
  // Próxima pergunta ou finalizar
  userQuizState[userId].currentQuestion++;
  
  if (userQuizState[userId].currentQuestion > furiaData.quiz.length) {
    // Quiz completo
    const score = userQuizState[userId].score;
    const total = furiaData.quiz.length;
    
    response += `🎉 *Quiz completo!*\n`;
    response += `Sua pontuação: ${score}/${total}\n\n`;
    
    if (score === total) {
      response += `🌟 *PERFEITO!* Você é um verdadeiro fã da FURIA!`;
    } else if (score >= total * 0.7) {
      response += `👍 Bom trabalho! Você conhece bem a tropa!`;
    } else {
      response += `💡 Continue acompanhando a FURIA para melhorar!`;
    }
    
    delete userQuizState[userId];
    bot.sendMessage(chatId, response, {parse_mode: 'Markdown'});
    sendMainMenu(chatId);
  } else {
    // Próxima pergunta
    response += `Próxima pergunta em 3 segundos...`;
    bot.sendMessage(chatId, response, {parse_mode: 'Markdown'});
    
    setTimeout(() => {
      sendQuiz(chatId, userId);
    }, 3000);
  }
  
  return true;
}

// Mensagem de boas-vindas
bot.onText(/^\/start$/i, (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(chatId, 
    `🖤🖤 *BEM-VINDO AO FURIA BOT!* 🖤🖤\n\n
    Eu sou o bot oficial da FURIA Esports!`, {parse_mode: 'Markdown'});
  sendMainMenu(chatId);
});

// Handler principal
bot.on('message', (msg) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id;
  const text = msg.text ? msg.text : '';
  
  if (text.toLowerCase() === '/start') return;

  // Verificar se é resposta de quiz primeiro
  if (userQuizState[userId] && userQuizState[userId].inQuiz) {
    if (handleQuizAnswer(chatId, userId, text)) return;
  }
  
  //Menu principal
  if (isCommand(msg, ['menu', 'inicio', 'ajuda', 'help'])) {
    sendMainMenu(chatId);
  }
  
  // Agenda de jogos
  else if (isCommand(msg, ['jogos', 'agenda', 'calendario', 'proximos']) || text === '1') {
    sendSchedule(chatId);
  }
  
  // Resultados
  else if (isCommand(msg, ['resultados', 'placar', 'live', 'ao vivo']) || text === '2') {
    sendResults(chatId);
  }
  
  // Estatísticas
  else if (isCommand(msg, ['stats', 'estatisticas', 'kd', 'adr']) || text === '3') {
    // Verificar se mencionou um jogador específico
    const mentionedPlayer = furiaData.team.players.find(player => 
      text.includes(player.toLowerCase())
    );
    sendPlayerStats(chatId, mentionedPlayer);
  }
  
  // Resumos pós-jogo
  else if (isCommand(msg, ['resumo', 'destaques', 'melhores momentos']) || text === '4') {
    const match = furiaData.results.lastMatch;
    let response = `${getRandomResponse()}\n\n 🎥 *Resumo do último jogo:*\n\n`;
    response += `⚔️ *FURIA vs ${match.opponent} ${match.score}*\n\n`;
    response += `🌟 *Destaques:*\n- ${match.highlights.join('\n- ')}\n\n`;
    response += `🔥 *Análise rápida:* A tropa mostrou um ${match.win ? 'excelente' : 'bom'} desempenho ${match.win ? 'e garantiu a vitória' : 'mas não foi suficiente'}!`;
    bot.sendMessage(chatId, response, {parse_mode: 'Markdown'});
  }
  
  // Mídia
  else if (isCommand(msg, ['midia', 'clipes', 'bastidores', 'vlogs']) || text === '5') {
    let response = `${getRandomResponse()}\n\n 🎬 *Conteúdos exclusivos:*\n\n`;
    furiaData.media.clips.forEach(clip => {
      response += `📹 *${clip.title}*: [Assista aqui](${clip.url})\n`;
    });
    response += `\n🎙️ *Frases marcantes:*\n`;
    furiaData.media.phrases.forEach(phrase => {
      response += `"${phrase.text}" - *${phrase.player}* (${phrase.context})\n`;
    });
    bot.sendMessage(chatId, response, {parse_mode: 'Markdown', disable_web_page_preview: true});
  }
  
  // Quiz
  else if (isCommand(msg, ['quiz', 'teste', 'desafio']) || text === '6') {
    sendQuiz(chatId, userId);
  }
  
  // Loja
  else if (isCommand(msg, ['loja', 'produtos', 'camisa', 'mousepad']) || text === '7') {
    let response = `${getRandomResponse()}\n\n 🛒 *Loja Oficial FURIA*\n\n`;
    response += `Confira nossos produtos exclusivos:\n`;
    response += `🛍️ [Visite a loja](${furiaData.store.url})\n\n`;
    response += `🖤🖤 Mostre seu apoio com os produtos da tropa!`;
    bot.sendMessage(chatId, response, {parse_mode: 'Markdown', disable_web_page_preview: true});
  }
  
  // História
  else if (isCommand(msg, ['historia', 'linha do tempo', 'conquistas']) || text === '8') {
    let response = `${getRandomResponse()}\n\n 📜 *História da FURIA:*\n\n`;
    furiaData.history.forEach(event => {
      response += `⏳ *${event.year}*: ${event.event}\n`;
    });
    response += `\nE a história continua sendo escrita! 🖤🖤`;
    bot.sendMessage(chatId, response, {parse_mode: 'Markdown'});
  }
  
  // Promoções
  else if (isCommand(msg, ['promo', 'promocao', 'desconto', 'oferta']) || text === '9') {
    let response = `${getRandomResponse()}\n\n 🔥 *Promoções exclusivas:*\n\n`;
    furiaData.store.promotions.forEach(promo => {
      response += `- ${promo}\n`;
    });
    response += `\n🛒 [Aproveite na loja](${furiaData.store.url})`;
    bot.sendMessage(chatId, response, {parse_mode: 'Markdown', disable_web_page_preview: true});
  }
  
  // Comando não reconhecido
  else {
    const randomResponses = [
      "Fala aí, tropa! Não entendi... Que tal tentar 'jogos', 'resultados' ou 'stats'?",
      "Hmm, não peguei o que você disse. Digite 'menu' para ver todas as opções!",
      "É a tropa! Mas não entendi. Me chama com 'agenda', 'placar' ou 'quiz' que eu te ajudo!",
      "Vem tranquilo! Não consegui entender. Tenta algo como 'próximos jogos' ou 'estatísticas'!"
    ];
    const response = randomResponses[Math.floor(Math.random() * randomResponses.length)];
    bot.sendMessage(chatId, response);
  }
});

console.log('Bot online');