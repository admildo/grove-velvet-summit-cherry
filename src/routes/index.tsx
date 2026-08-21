import { createFileRoute } from "@tanstack/react-router";
import { GameStage } from "@/game/GameStage";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  return (
    <main className="flex min-h-dvh flex-col bg-bg text-fg">
      <section className="mx-auto flex w-full max-w-5xl flex-1 flex-col justify-center px-4 py-6 sm:px-8 sm:py-10">
        <GameStage />
        <p className="mt-4 text-center text-xs text-subtle">
          One button. Increasing speed. Distance is the score.
        </p>
      </section>
    </main>
  );
}
