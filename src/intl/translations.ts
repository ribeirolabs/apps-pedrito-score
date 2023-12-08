export type Tokens = {
  restart: string;
  start: string;
  players: string;
  score: string;
  points: string;
  no_rounds: string;
  next_round: string;
  next_game: string;
  score_limit: string;
  confirm: string;
};

const LANG = ["en-US", "pt-BR"] as const;

export type Lang = (typeof LANG)[number];

export const TOKENS: Record<Lang, Tokens> = {
  "en-US": {
    restart: "Restart",
    start: "Start",
    players: "Players",
    score: "Score",
    points: "Points",
    no_rounds: "No rounds played yet",
    next_round: "Next round",
    score_limit: "Score limit",
    next_game: "Next game",
    confirm: "Confirm",
  },
  "pt-BR": {
    restart: "Recomecar",
    start: "Comecar",
    players: "Jogadores",
    score: "Pontuacão",
    points: "Pontos",
    no_rounds: "Nenhuma rodada ainda",
    next_round: "Próxima rodada",
    score_limit: "Limite de pontuacão",
    next_game: "Próximo jogo",
    confirm: "Confirmar",
  },
};
