import { FC, useState } from "react";
import { PanelSectionRow, ButtonItem, Field, Spinner } from "@decky/ui";
import { GamePkgStatus } from "../types";
import { pickGamePkgFolder, scanGamePkg } from "../api";

interface Props {
  status: GamePkgStatus | null;
  onStatusChange: (status: GamePkgStatus) => void;
}

export const PkgPicker: FC<Props> = ({ status, onStatusChange }) => {
  const [scanning, setScanning] = useState(false);

  const rescan = async () => {
    setScanning(true);
    try {
      onStatusChange(await scanGamePkg());
    } finally {
      setScanning(false);
    }
  };

  const pickFolder = async () => {
    const folder = await pickGamePkgFolder();
    if (folder) await rescan();
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
        <ButtonItem layout="below" onClick={pickFolder}>
          Choose game-pkg folder…
        </ButtonItem>
      </PanelSectionRow>
      {!scanning && (!status?.basePkgFound || !status?.updatePkgFound) && (
        <PanelSectionRow>
          <span style={{ fontSize: "12px", color: "#e8b339" }}>
            Drop your own Bloodborne .pkg + v1.09 update into that folder — Bloodecky never provides game files.
          </span>
        </PanelSectionRow>
      )}
    </>
  );
};
