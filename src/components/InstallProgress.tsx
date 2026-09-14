import { FC, useEffect, useState } from "react";
import { PanelSectionRow, ButtonItem, ProgressBarItem } from "@decky/ui";
import { InstallProgressEvent, InstallStage } from "../types";
import { onInstallProgress, cancelInstall } from "../api";

const STAGE_LABELS: Record<InstallStage, string> = {
  idle: "Idle",
  preflight: "Checking environment",
  install_emulator: "Installing emulator",
  install_game: "Installing game files",
  apply_config: "Applying emulator settings",
  apply_patches: "Applying game patches",
  apply_mods: "Merging mods",
  steam_shortcut: "Registering Steam tile",
  done: "Completed",
  error: "Failed",
};

interface Props {
  onFinished: (success: boolean) => void;
}

export const InstallProgress: FC<Props> = ({ onFinished }) => {
  const [event, setEvent] = useState<InstallProgressEvent>({ stage: "idle", percent: 0, message: "Starting…" });

  useEffect(() => {
    const unsubscribe = onInstallProgress((evt) => {
      setEvent(evt);
      if (evt.stage === "done") onFinished(true);
      if (evt.stage === "error") onFinished(false);
    });
    return unsubscribe;
  }, [onFinished]);

  return (
    <>
      <PanelSectionRow>
        <ProgressBarItem
          label={STAGE_LABELS[event.stage]}
          description={event.message}
          nProgress={event.percent}
          indeterminate={event.percent === 0}
        />
      </PanelSectionRow>
      {event.stage !== "done" && event.stage !== "error" && (
        <PanelSectionRow>
          <ButtonItem
            layout="below"
            onClick={async () => {
              await cancelInstall();
              onFinished(false);
            }}
          >
            Cancel
          </ButtonItem>
        </PanelSectionRow>
      )}
    </>
  );
};
