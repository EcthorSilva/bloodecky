import { FC, useState } from "react";
import { PanelSectionRow, ButtonItem, Field, Spinner } from "@decky/ui";
import { toaster } from "@decky/api";
import { GamePkgStatus } from "../types";
import { pickGamePkgFiles } from "../api";

interface Props {
  status: GamePkgStatus | null;
  onStatusChange: (status: GamePkgStatus) => void;
}

export const PkgPicker: FC<Props> = ({ status, onStatusChange }) => {
  const [scanning, setScanning] = useState(false);

  const pickFiles = async () => {
    setScanning(true);
    try {
      const selected = await pickGamePkgFiles();
      if (selected) onStatusChange(selected);
    } catch (error) {
      console.error("Failed to import game packages", error);
      toaster.toast({
        title: "Bloodecky",
        body: "Could not move the selected PKG files. Restart the plugin and try again.",
        duration: 5000,
      });
    } finally {
      setScanning(false);
    }
  };

  return (
    <>
      <PanelSectionRow>
        <Field label="Base game" bottomSeparator="none">
          {scanning ? <Spinner /> : status?.basePkgFound ? "✅ Found" : "❌ Not found"}
        </Field>
      </PanelSectionRow>
      <PanelSectionRow>
        <Field label="v1.09 + Old Hunters update" bottomSeparator="none">
          {scanning ? <Spinner /> : status?.updatePkgFound ? "✅ Found" : "❌ Not found"}
        </Field>
      </PanelSectionRow>
      <PanelSectionRow>
        <ButtonItem layout="below" onClick={pickFiles}>
          Choose base game and v1.09 update…
        </ButtonItem>
      </PanelSectionRow>
      {!scanning && (!status?.basePkgFound || !status?.updatePkgFound) && (
        <PanelSectionRow>
          <span style={{ fontSize: "12px", color: "#e8b339" }}>
            Select your own Bloodborne .pkg + v1.09 update. They will be moved into the installation folder — Bloodecky never provides game files.
          </span>
        </PanelSectionRow>
      )}
    </>
  );
};
