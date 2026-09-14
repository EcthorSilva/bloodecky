import { call, addEventListener, removeEventListener, openFilePicker, FileSelectionType } from "@decky/api";
import { GamePkgStatus, InstallationStatus, InstallProgressEvent, ProfileId } from "./types";

// Every function here maps 1:1 to a method the Python backend will expose
// via `Plugin.<name>` in backend/main.py (stages 00-90 from install.sh).
// Until that backend method exists, each call falls back to a mock so the
// frontend can be built and clicked through on its own.

const USE_MOCKS = true; // flip to false once backend/main.py implements these
let mockInstallationInstalled = false;

export async function validateInstallation(): Promise<InstallationStatus> {
  if (USE_MOCKS) {
    await sleep(250);
    return { installed: mockInstallationInstalled, installPath: "/home/deck/Games/bloodborne" };
  }
  return call<[], InstallationStatus>("validate_installation");
}

export async function scanGamePkg(): Promise<GamePkgStatus> {
  return call<[], GamePkgStatus>("scan_game_pkg");
}

export async function pickGamePkgFiles(): Promise<GamePkgStatus | null> {
  const firstPackage = await openFilePicker(
    FileSelectionType.FILE,
    "/home/deck/Downloads",
    true,
    false,
    undefined,
    ["pkg"],
  );
  if (!firstPackage.path) return null;

  const secondPackage = await openFilePicker(
    FileSelectionType.FILE,
    "/home/deck/Downloads",
    true,
    false,
    undefined,
    ["pkg"],
  );
  if (!secondPackage.path) return null;

  return call<[string, string], GamePkgStatus>(
    "import_game_pkgs",
    firstPackage.realpath || firstPackage.path,
    secondPackage.realpath || secondPackage.path,
  );
}

export async function listAvailableMods(): Promise<string[]> {
  // Mods physically present in payloads/mods/, matched against MODS in types.ts
  if (USE_MOCKS) {
    await sleep(300);
    return ["vertex-explosion-fix", "deck-1610-ui-fix", "fps-boost"];
  }
  return call<[], string[]>("list_available_mods");
}

export async function startInstall(profile: ProfileId, selectedModIds: string[]): Promise<void> {
  if (USE_MOCKS) {
    mockInstallationInstalled = true;
    return;
  }
  await call<[ProfileId, string[]], void>("start_install", profile, selectedModIds);
}

export async function applyMods(profile: ProfileId, selectedModIds: string[]): Promise<void> {
  if (USE_MOCKS) return;
  await call<[ProfileId, string[]], void>("apply_mods", profile, selectedModIds);
}

export async function cancelInstall(): Promise<void> {
  if (USE_MOCKS) return;
  await call<[], void>("cancel_install");
}

// Backend pushes progress via Decky's event bus as each scripts/NN_*.sh stage
// completes; the frontend just subscribes.
export function onInstallProgress(cb: (evt: InstallProgressEvent) => void): () => void {
  if (USE_MOCKS) {
    return mockProgressFeed(cb);
  }
  const handler = (evt: InstallProgressEvent) => cb(evt);
  addEventListener<[InstallProgressEvent]>("install_progress", handler);
  return () => removeEventListener<[InstallProgressEvent]>("install_progress", handler);
}

function sleep(ms: number) {
  return new Promise((res) => setTimeout(res, ms));
}

// Simulates the 00_preflight -> 90_collect_logs pipeline so the progress UI
// is testable before the real backend fires events.
function mockProgressFeed(cb: (evt: InstallProgressEvent) => void): () => void {
  const steps: InstallProgressEvent[] = [
    { stage: "preflight", percent: 5, message: "Checking free space and dependencies…" },
    { stage: "install_emulator", percent: 25, message: "Extracting shadPS4…" },
    { stage: "install_game", percent: 45, message: "Installing base game + v1.09 update…" },
    { stage: "apply_config", percent: 60, message: "Writing emulator settings…" },
    { stage: "apply_patches", percent: 75, message: "Applying game patches…" },
    { stage: "apply_mods", percent: 88, message: "Merging mod overlays…" },
    { stage: "steam_shortcut", percent: 97, message: "Registering Steam tile…" },
    { stage: "done", percent: 100, message: "Completed." },
  ];
  let cancelled = false;
  (async () => {
    for (const step of steps) {
      if (cancelled) return;
      await sleep(700);
      cb(step);
    }
  })();
  return () => {
    cancelled = true;
  };
}
