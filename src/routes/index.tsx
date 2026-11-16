import { createFileRoute } from "@tanstack/react-router";
import { GameShell } from "@/components/game/GameShell";

export const Route = createFileRoute("/")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Aethelgard: Abismo de Cinzas" },
      { name: "description", content: "Plataforma de ação pixel-art 2D com 50 mundos, Submundo, heróis, forja, pets e um Mundo Aberto gigantesco com mineração e construção." },
      { property: "og:title", content: "Aethelgard: Abismo de Cinzas" },
      { property: "og:description", content: "Explore 50 mundos, o Submundo e um Mundo Aberto enorme com mineração, crafting e casas." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: GameShell,
});
