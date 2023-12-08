import {
  Dispatch,
  ReactNode,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useReducer,
} from "react";
import { ZodSchema, z } from "zod";
import { zfd } from "zod-form-data";

type Game = {
  page: "setup" | "game" | "scores";
  scoreLimit: number;
  eliminated: string[];
  players: { id: string; name: string }[];
  score: Record<string, number>;
  rounds: {
    id: string;
    points: number;
    winner: boolean;
    pedritro: boolean;
  }[][];
};

const ACTIONS = {
  setup: zfd.formData({
    type: z.literal("setup"),
    players: z
      .string()
      .transform((names) => names.split(/\n/))
      .refine((names) => names.length > 1, {
        message: "Minimium of 2 players",
      }),
    scoreLimit: z.string().transform(Number),
  }),
  nextRound: zfd.formData({
    type: z.literal("nextRound"),
  }),
  nextGame: zfd.formData({
    type: z.literal("nextGame"),
  }),
  updateScores: z.object({
    type: z.literal("updateScores"),
    scores: z.record(
      z.string().uuid(),
      z.object({
        pedrito: z.string().transform((value) => value === "true"),
        points: z.string().transform((value) => Number(value)),
      })
    ),
  }),
  update: z.object({
    type: z.literal("update"),
  }),
} as const;

function reducer(state: Game, action: Action): Game {
  const next: Game = structuredClone(state);

  if (action.type === "setup") {
    const players = action.players.map((name) => ({
      id: crypto.randomUUID() as string,
      name,
    }));

    next.page = "game";
    next.players = players;
    next.scoreLimit = action.scoreLimit;

    return next;
  }

  if (action.type === "nextRound" && state.page === "game") {
    next.page = "scores";

    return next;
  }

  if (action.type === "updateScores" && state.page === "scores") {
    const nextRound: Game["rounds"][number] = [];
    const lastRound = next.rounds[next.rounds.length - 1];
    const stats: {
      winners: { id: string; points: number }[];
      lessPoints: number;
    } = {
      winners: [],
      lessPoints: Infinity,
    };

    for (const [id, score] of Object.entries(action.scores)) {
      if (state.eliminated.includes(id)) {
        continue;
      }

      if (score.points < stats.lessPoints) {
        stats.lessPoints = score.points;
      }
    }

    for (const [id, score] of Object.entries(action.scores)) {
      const lastPoints = lastRound?.find((r) => r.id === id)?.points ?? 0;

      const round: Game["rounds"][number][number] = {
        id,
        points: lastPoints,
        winner: false,
        pedritro: score.pedrito,
      };

      if (state.eliminated.includes(id)) {
        nextRound.push(round);
        continue;
      }

      if (score.points > stats.lessPoints) {
        round.points += score.points;

        if (score.pedrito) {
          round.points += 10;
        }
      } else {
        round.winner = true;
      }

      next.score[id] = round.points;

      if (round.points >= next.scoreLimit) {
        next.eliminated.push(id);
      }

      nextRound.push(round);
    }

    next.rounds.push(nextRound);
    next.page = "game";

    return next;
  }

  if (action.type === "nextGame" && state.page === "game") {
    next.rounds = [];
    next.eliminated = [];
    next.score = {};

    return next;
  }

  if (action.type === "update") {
    return state;
    const score: Game["score"] = {};

    for (const player of state.players) {
      const lastRound = state.rounds[state.rounds.length - 1].find(
        (round) => round.id === player.id
      );

      if (!lastRound) {
        continue;
      }

      score[player.id] = lastRound.points;
    }

    next.score = score;

    return next;
  }

  return state;
}

type Action<
  A extends Record<string | number | symbol, ZodSchema> = typeof ACTIONS,
  K extends keyof A = keyof A,
> = K extends string
  ? {
      type: K;
    } & z.infer<A[K]>
  : never;

const DEFAULT_GAME_STATE: Game = {
  page: "setup",
  scoreLimit: 0,
  eliminated: [],
  score: {},
  players: [],
  rounds: [],
};

const GameStateContext = createContext<Game>({ ...DEFAULT_GAME_STATE });
const GameActionsContext = createContext<Dispatch<Action | FormData>>(() => {});

export function useGameState() {
  return useContext(GameStateContext);
}

export function useGameActions() {
  return useContext(GameActionsContext);
}

export function GameProvider({ children }: { children: ReactNode }) {
  const [game, internalSend] = useReducer(reducer, null, () => {
    try {
      return JSON.parse(localStorage.getItem("game") || "") as Game;
    } catch (e) {
      return { ...DEFAULT_GAME_STATE };
    }
  });

  useEffect(() => {
    send({ type: "update" });
  }, []);

  const send = useCallback((action: FormData | Action) => {
    let type: string = "";
    if (action instanceof FormData) {
      type = action.get("type") as string;
    } else {
      type = action.type;
    }

    if (!type) {
      throw new Error('invalid form, missing "type"');
    }

    if (type in ACTIONS === false) {
      throw new Error(
        `invalid form, expected "type" to be one of: ${Object.keys(
          ACTIONS
        ).join(", ")}`
      );
    }

    const validator = ACTIONS[type as keyof typeof ACTIONS];

    const result = validator.safeParse(action);

    if (!result.success) {
      console.error(result.error);
      return;
    }

    internalSend(result.data);
  }, []);

  useEffect(() => {
    localStorage.setItem("game", JSON.stringify(game));
  }, [game]);

  return (
    <GameStateContext.Provider value={game}>
      <GameActionsContext.Provider value={send}>
        {children}
      </GameActionsContext.Provider>
    </GameStateContext.Provider>
  );
}
