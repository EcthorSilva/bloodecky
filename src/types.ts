// Mirrors config/deckborne.env and config/mods.catalog on the backend.
// Keep in sync with those two files when profiles or mods change.

export type ProfileId = "vanilla" | "deckborne-30" | "deckborne-60-800p" | "deckborne-60-1080p";

export interface ProfileOption {
  id: ProfileId;
  label: string;
  fps: string;
  resolution: string;
  requiresMods: boolean;
  description: string;
}

export const PROFILES: ProfileOption[] = [
  {
    id: "vanilla",
    label: "Vanilla",
    fps: "30 FPS",
    resolution: "800p",
    requiresMods: false,
    description: "As close to the original as possible. No mods, no visual changes.",
  },
  {
    id: "deckborne-30",
    label: "DeckBorne",
    fps: "30 FPS",
    resolution: "800p",
    requiresMods: true,
    description: "QOL patches, community mods, tuned input response.",
  },
  {
    id: "deckborne-60-800p",
    label: "DeckBorne (beta)",
    fps: "60 FPS",
    resolution: "800p",
    requiresMods: true,
    description: "Same as DeckBorne, aiming for 60 FPS. The Deck may not hold it steady.",
  },
  {
    id: "deckborne-60-1080p",
    label: "DeckBorne",
    fps: "60 FPS",
    resolution: "1080p",
    requiresMods: true,
    description: "Desktop-oriented. Optimal 1080p + highest model detail.",
  },
];

export interface ModEntry {
  id: string;
  name: string;
  nexusUrl: string;
  required: boolean;
  recommended: boolean;
  note?: string;
}

// Sourced from the README's mod tables. The catalog itself only ever holds
// URLs, never files — same rule applies here.
export const MODS: ModEntry[] = [
  {
    id: "vertex-explosion-fix",
    name: "Vertex Explosion Fix",
    nexusUrl: "https://nexusmods.com/bloodborne/mods/109",
    required: true,
    recommended: true,
    note: "Required for any DeckBorne profile. Without it, 30/60 FPS++ makes faces explode.",
  },
  { id: "deck-1610-ui-fix", name: "Deck 16:10 UI Fix", nexusUrl: "https://nexusmods.com/bloodborne/mods/207", required: false, recommended: true },
  { id: "fps-boost", name: "FPS Boost 1.0", nexusUrl: "https://nexusmods.com/bloodborne/mods/27", required: false, recommended: true },
  { id: "reshaded", name: "Bloodborne Reshaded", nexusUrl: "https://nexusmods.com/bloodborne/mods/27", required: false, recommended: true },
  {
    id: "pointlight-removal",
    name: "Pointlight Removal",
    nexusUrl: "https://nexusmods.com/bloodborne/mods/27",
    required: false,
    recommended: true,
    note: "Fixes brightness. May be too dark on a non-OLED Deck.",
  },
  { id: "half-cloth-physics", name: "Half Cloth Physics w/ Blood", nexusUrl: "https://nexusmods.com/bloodborne/mods/114", required: false, recommended: true },
  { id: "xbox-prompts", name: "Elden Ring Style Modern Xbox Prompts", nexusUrl: "https://nexusmods.com/bloodborne/mods/30", required: false, recommended: true },
  { id: "more-lamp-options", name: "More Options At Lamps", nexusUrl: "https://nexusmods.com/bloodborne/mods/107", required: false, recommended: false },
  { id: "60fps-cutscene-fix", name: "60 FPS Cutscene Fix", nexusUrl: "https://nexusmods.com/bloodborne/mods/70", required: false, recommended: false },
  { id: "bb-60fps-patch", name: "BB 60 FPS Patch", nexusUrl: "https://nexusmods.com/bloodborne/mods/252", required: false, recommended: false },
];

export type InstallStage =
  | "idle"
  | "preflight"
  | "install_emulator"
  | "install_game"
  | "apply_config"
  | "apply_patches"
  | "apply_mods"
  | "steam_shortcut"
  | "done"
  | "error";

export interface InstallProgressEvent {
  stage: InstallStage;
  percent: number; // 0-100
  message: string;
}

export interface GamePkgStatus {
  basePkgFound: boolean;
  basePkgPath?: string;
  updatePkgFound: boolean;
  updatePkgPath?: string;
}

export interface InstallationStatus {
  installed: boolean;
  installPath: string;
}
