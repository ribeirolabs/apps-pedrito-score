import { useLocalStorage } from "@ribeirolabs/local-storage/react";
import { useMemo, useState } from "react";
import { Button } from "./components/Button";
import { Form } from "./components/Form";
import { useGameState } from "./core/game";
import { cn } from "./helpers";
import { useTranslation } from "./intl/Provider";
import { twMerge } from "tailwind-merge";

function App() {
  const game = useGameState();
  const { t } = useTranslation();

  if (game.page === "scores") {
    return <UpdateScores />;
  }

  if (game.page === "setup") {
    return <GameSetup />;
  }

  const isOver = game.eliminated.length === game.players.length - 1;

  function checkGameWinner(id: string): boolean {
    if (!isOver) {
      return false;
    }

    if (game.rounds.length === 0) {
      return false;
    }

    const winner = game.rounds[game.rounds.length - 1].find(
      (round) => round.id === id && round.winner
    );

    return winner != null;
  }

  const winner = game.players.find((player) => checkGameWinner(player.id));
  const most = useMemo(() => {
    const pedritoByPlayer: Record<string, number> = {};
    const errorsByPlayer: Record<string, number> = {};
    const winsByPlayer: Record<string, number> = {};

    type Most = { player: string | null; count: number };

    let most: { pedrito: Most; error: Most; wins: Most } = {
      wins: {
        player: null,
        count: 0,
      },
      pedrito: {
        player: null,
        count: 0,
      },
      error: {
        player: null,
        count: 0,
      },
    };

    if (!isOver) {
        return most
    }

    for (let i = 0; i < game.players.length; i++) {
      const player = game.players[i];
      pedritoByPlayer[player.name] = 0;
      errorsByPlayer[player.name] = 0;
      winsByPlayer[player.name] = 0;

      for (const score of game.rounds) {
        const round = score[i];

        if (round.pedritro) {
          pedritoByPlayer[player.name] += 1;
        }

        if (round.pedritro && !round.winner) {
          errorsByPlayer[player.name] += 1;
        }

        if (round.winner) {
          winsByPlayer[player.name] += 1;
        }
      }
    }

    for (const player of game.players) {
      const pedrito = pedritoByPlayer[player.name];
      const error = errorsByPlayer[player.name];
      const wins = winsByPlayer[player.name];

      if (pedrito > most.pedrito.count) {
        most.pedrito.player = player.name;
        most.pedrito.count = pedrito;
      }

      if (wins > most.wins.count) {
        most.wins.player = player.name;
        most.wins.count = wins;
      }

      if (error > most.error.count) {
        most.error.player = player.name;
        most.error.count = error;
      }
    }

    return most;
  }, [game, isOver]);

  return (
    <div className="flex flex-col gap-3 h-full max-w-lg mx-auto">
      <div className="flex-1 overflow-y-auto">
        <ul
          className="grid"
          style={{
            gridTemplateColumns: `repeat(${game.players.length}, 1fr)`,
          }}
        >
          {game.players.map((player) => {
            const wonGame = checkGameWinner(player.id);

            return (
              <li
                key={player.id}
                className={cn(
                  "text-center uppercase font-black py-2 bg-neutral-200 dark:bg-neutral-800 sticky top-0",
                  game.eliminated.includes(player.id)
                    ? "text-neutral-400 dark:text-neutral-500"
                    : wonGame
                      ? "text-green-600"
                      : "text-neutral-500 dark:text-neutral-300"
                )}
              >
                {player.name}
              </li>
            );
          })}

          {game.rounds.length === 0 && (
            <li
              className="p-2 text-center"
              style={{
                gridColumnStart: 1,
                gridColumnEnd: game.players.length + 1,
              }}
            >
              {t("no_rounds")}
            </li>
          )}

          {game.rounds.map((score, idx) =>
            score.map((round) => {
              const isEliminated = game.eliminated.includes(round.id);
              const wonGame = checkGameWinner(round.id);

              return (
                <li
                  key={`${idx}-${round.id}`}
                  className={cn("text-center text-xl py-1 border-b")}
                >
                  <span
                    className={twMerge(
                      "font-black rounded-full w-8 h-8 inline-flex items-center justify-center",
                      isEliminated
                        ? "text-neutral-400/60 dark:text-neutral-700" // "bg-neutral-300 text-neutral-400 dark:bg-neutral-700 dark:text-neutral-500"
                        : round.winner
                          ? "bg-green-300 dark:bg-green-900 text-green-800 dark:text-green-300"
                          : round.pedritro
                            ? "bg-red-300 text-red-800 dark:bg-red-800 dark:text-red-200"
                            : "",
                      isEliminated &&
                        round.winner &&
                        "bg-neutral-200 text-neutral-400/70 dark:bg-neutral-800 dark:text-neutral-600",
                      isEliminated &&
                        !round.winner &&
                        round.pedritro &&
                        "text-red-300 dark:text-red-400/50",
                      wonGame && "text-green-600"
                    )}
                  >
                    {round.points}
                  </span>
                </li>
              );
            })
          )}
        </ul>

        {isOver && (
          <div className="p-3 grid gap-3 mt-6">
            <div className="flex justify-between items-center border-b">
              <p className="font-bold text-xl text-neutral-500 leading-none">
                Vencedor
              </p>
              <p className="font-bold text-xl">{winner?.name}</p>
            </div>
            <div className="flex justify-between items-center border-b">
              <p className="font-bold text-xl text-neutral-500 leading-none">
                Mais pedritos
              </p>
              <p className="font-bold text-xl text-end leading-none">
                {most.pedrito.player}
                <br />
                {most.pedrito.count}
              </p>
            </div>
            <div className="flex justify-between items-center border-b">
              <p className="font-bold text-xl text-neutral-500 leading-none">
                Mais Vitórias
              </p>
              <p className="font-bold text-xl text-end leading-none">
                {most.wins.player}
                <br />
                {most.wins.count}
              </p>
            </div>
            <div className="flex justify-between items-center border-b">
              <p className="font-bold text-xl text-neutral-500 leading-none">
                Mais erros
              </p>
              <p className="font-bold text-xl text-end leading-none">
                {most.error.player}
                <br />
                {most.error.count}
              </p>
            </div>
          </div>
        )}
      </div>

      <Form className="p-3 flex w-full justify-between gap-3 flex-shrink-0">
        <Button
          variant="secondary"
          onClick={() => {
            localStorage.removeItem("game");
            location.reload();
          }}
        >
          {t("restart")}
        </Button>

        {isOver ? (
          <Button type="submit" name="type" value="nextGame">
            {t("next_game")}
          </Button>
        ) : (
          <Button type="submit" name="type" value="nextRound">
            {t("next_round")}
          </Button>
        )}
      </Form>
    </div>
  );
}

function GameSetup() {
  const { t } = useTranslation();
  const [players, setPlayers] = useLocalStorage("players", "");
  const [scoreLimit, setScoreLimit] = useLocalStorage("scoreLimit", "");

  return (
    <Form className="p-3 flex flex-col gap-3 max-w-lg mx-auto">
      <h1 className="text-3xl font-black">{t("players")}</h1>

      <input type="hidden" name="type" value="setup" />

      <textarea
        name="players"
        className="input"
        rows={5}
        placeholder={t("players")}
        value={players}
        onChange={(e) => setPlayers(e.target.value)}
      />

      <input
        type="number"
        className="input"
        name="scoreLimit"
        placeholder={t("score_limit")}
        value={scoreLimit}
        onChange={(e) => setScoreLimit(e.target.value)}
      />

      <Button type="submit">{t("start")}</Button>
    </Form>
  );
}

function UpdateScores() {
  const game = useGameState();
  const { t } = useTranslation();
  const [pedrito, setPedrito] = useState<string | undefined>();

  if (game.page !== "scores") {
    return null;
  }

  return (
    <Form className="p-3 flex flex-col gap-3">
      <h1 className="text-3xl font-black">{t("score")}</h1>

      <ul className="flex w-full flex-col rounded gap-2">
        {game.players.map((player) => {
          const isWinner = pedrito === player.id;
          const isEliminated = game.eliminated.includes(player.id);

          return (
            <li
              role="menuitem"
              key={player.id}
              className={cn(
                "flex -flex-col gap-2 flex-1 justify-between items-center p-3 border-b",
                isEliminated && "hidden"
              )}
            >
              <div
                className={cn(
                  "flex-1 flex flex-col",
                  isWinner && "text-green-600"
                )}
              >
                <span className={cn("font-black uppercase text-xl")}>
                  {player.name}
                </span>
                <span>{game.score[player.id] ?? 0}</span>
              </div>

              <input
                type={isEliminated ? "hidden" : "number"}
                name={`scores[${player.id}][points]`}
                className="w-24 p-2 bg-transparent border text-xl rounded text-center"
                defaultValue={isEliminated ? 0 : undefined}
                required={!isEliminated}
                placeholder={t("points")}
                min={1}
              />

              <input
                type="hidden"
                name={`scores[${player.id}][pedrito]`}
                value={String(isWinner)}
              />

              {isEliminated ? null : (
                <div>
                  <Button
                    variant={isWinner ? "positive" : "secondary"}
                    onClick={() => setPedrito(player.id)}
                  >
                    Pedrito
                  </Button>
                </div>
              )}
            </li>
          );
        })}
      </ul>

      <Button
        type="submit"
        name="type"
        value="updateScores"
        disabled={!pedrito}
      >
        {t("confirm")}
      </Button>
    </Form>
  );
}

export default App;
