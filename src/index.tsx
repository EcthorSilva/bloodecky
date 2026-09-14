import { useState } from "react";
import { definePlugin, PanelSection, PanelSectionRow, ButtonItem, staticClasses } from "@decky/ui";
import { FaSkull } from "react-icons/fa";

import { GamePkgStatus, PROFILES, ProfileId } from "./types";
import { startInstall } from "./api";
import { PkgPicker } from "./components/PkgPicker";
import { ProfileSelector } from "./components/ProfileSelector";
import { ModChecklist } from "./components/ModChecklist";
import { InstallProgress } from "./components/InstallProgress";

type Step = "pkg" | "profile" | "mods" | "installing" | "done";

function Content() {
  const [step, setStep] = useState<Step>("pkg");
  const [pkgStatus, setPkgStatus] = useState<GamePkgStatus | null>(null);
  const [profile, setProfile] = useState<ProfileId>("deckborne-30");
  const [selectedMods, setSelectedMods] = useState<Set<string>>(new Set(["vertex-explosion-fix"]));

  const pkgReady = !!pkgStatus?.basePkgFound && !!pkgStatus?.updatePkgFound;
  const requiresMods = PROFILES.find((p) => p.id === profile)?.requiresMods ?? false;

  const handleInstall = async () => {
    setStep("installing");
    await startInstall(profile, Array.from(selectedMods));
  };

  return (
    <>
      <PanelSection title="1. Game files">
        <PkgPicker status={pkgStatus} onStatusChange={setPkgStatus} />
      </PanelSection>

      {pkgReady && (
        <PanelSection title="2. Profile">
          <ProfileSelector selected={profile} onSelect={setProfile} />
        </PanelSection>
      )}

      {pkgReady && requiresMods && (
        <PanelSection title="3. Mods">
          <ModChecklist selected={selectedMods} onChange={setSelectedMods} />
        </PanelSection>
      )}

      {pkgReady && step !== "installing" && step !== "done" && (
        <PanelSection>
          <PanelSectionRow>
            <ButtonItem
              layout="below"
              disabled={requiresMods && !selectedMods.has("vertex-explosion-fix")}
              onClick={handleInstall}
            >
              Install
            </ButtonItem>
          </PanelSectionRow>
        </PanelSection>
      )}

      {step === "installing" && (
        <PanelSection title="Installing">
          <InstallProgress onFinished={(success) => setStep(success ? "done" : "pkg")} />
        </PanelSection>
      )}

      {step === "done" && (
        <PanelSection title="Done">
          <PanelSectionRow>
            <span style={{ fontSize: "13px" }}>
              Bloodborne is on your Steam tiles. Back out to Library and launch it.
            </span>
          </PanelSectionRow>
        </PanelSection>
      )}
    </>
  );
}

export default definePlugin(() => {
  return {
    name: "Bloodecky",
    titleView: <div className={staticClasses.Title}>Bloodecky</div>,
    content: <Content />,
    icon: <FaSkull />,
  };
});
