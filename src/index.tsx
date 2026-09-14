import { useEffect, useState } from "react";
import { definePlugin, PanelSection, PanelSectionRow, ButtonItem, staticClasses } from "@decky/ui";
import { FaSyringe  } from "react-icons/fa";

import { GamePkgStatus, InstallationStatus, PROFILES, ProfileId } from "./types";
import { applyMods, scanGamePkg, startInstall, syncMods, validateInstallation } from "./api";
import { PkgPicker } from "./components/PkgPicker";
import { ProfileSelector } from "./components/ProfileSelector";
import { ModChecklist } from "./components/ModChecklist";
import { InstallProgress } from "./components/InstallProgress";

type Step = "validating" | "pkg" | "manage" | "installing" | "done";

function Content() {
  const [step, setStep] = useState<Step>("validating");
  const [installation, setInstallation] = useState<InstallationStatus | null>(null);
  const [pkgStatus, setPkgStatus] = useState<GamePkgStatus | null>(null);
  const [profile, setProfile] = useState<ProfileId>("deckborne-30");
  const [selectedMods, setSelectedMods] = useState<Set<string>>(new Set(["vertex-explosion-fix"]));

  const pkgReady = !!pkgStatus?.basePkgFound && !!pkgStatus?.updatePkgFound;
  const requiresMods = PROFILES.find((p) => p.id === profile)?.requiresMods ?? false;

  const handleProfileSelect = (nextProfile: ProfileId) => {
    const nextRequiresMods = PROFILES.find((p) => p.id === nextProfile)?.requiresMods ?? false;
    const nextMods = new Set(selectedMods);
    if (nextRequiresMods) nextMods.add("vertex-explosion-fix");
    else nextMods.delete("vertex-explosion-fix");
    setProfile(nextProfile);
    setSelectedMods(nextMods);
    void syncMods(nextProfile, Array.from(nextMods));
  };

  const handleModsChange = (nextMods: Set<string>) => {
    setSelectedMods(nextMods);
    void syncMods(profile, Array.from(nextMods));
  };

  const handlePkgStatusChange = (nextStatus: GamePkgStatus) => {
    setPkgStatus(nextStatus);
    if (nextStatus.basePkgFound && nextStatus.updatePkgFound && requiresMods) {
      void syncMods(profile, Array.from(selectedMods));
    }
  };

  const validate = async () => {
    setStep("validating");
    const status = await validateInstallation();
    setInstallation(status);
    if (status.installed) {
      setStep("manage");
      return;
    }

    setPkgStatus(await scanGamePkg());
    setStep("pkg");
  };

  useEffect(() => {
    void validate();
  }, []);

  const handleAction = async () => {
    setStep("installing");
    const modIds = Array.from(selectedMods);
    if (step === "manage") {
      await applyMods(profile, modIds);
    } else {
      await syncMods(profile, modIds);
      await startInstall(profile, modIds);
    }
  };

  return (
    <>
      {step === "validating" && (
        <PanelSection title="Validating installation">
          <PanelSectionRow>Checking {installation?.installPath ?? "/home/deck/Games/bloodborne"}...</PanelSectionRow>
        </PanelSection>
      )}

      {step === "pkg" && (
        <PanelSection title="Game files">
          <PkgPicker status={pkgStatus} onStatusChange={handlePkgStatusChange} />
        </PanelSection>
      )}

      {(step === "manage" || pkgReady) && (
        <PanelSection title="Profile">
          <ProfileSelector selected={profile} onSelect={handleProfileSelect} />
        </PanelSection>
      )}

      {(step === "manage" || pkgReady) && requiresMods && (
        <PanelSection title="Mods">
          <ModChecklist selected={selectedMods} requiresMods={requiresMods} onChange={handleModsChange} />
        </PanelSection>
      )}

      {(step === "manage" || pkgReady) && step !== "installing" && step !== "done" && (
        <PanelSection>
          <PanelSectionRow>
            <ButtonItem
              layout="below"
              disabled={requiresMods && !selectedMods.has("vertex-explosion-fix")}
              onClick={handleAction}
            >
              {step === "manage" ? "Apply changes" : "Install"}
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
    icon: <FaSyringe  />,
  };
});
