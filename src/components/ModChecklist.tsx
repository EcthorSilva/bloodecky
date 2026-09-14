import { FC, useEffect, useState } from "react";
import { PanelSectionRow, ToggleField, ButtonItem, Navigation } from "@decky/ui";
import { MODS } from "../types";
import { listAvailableMods } from "../api";

interface Props {
  selected: Set<string>;
  onChange: (next: Set<string>) => void;
}

export const ModChecklist: FC<Props> = ({ selected, onChange }) => {
  const [availableOnDisk, setAvailableOnDisk] = useState<string[]>([]);

  useEffect(() => {
    listAvailableMods().then(setAvailableOnDisk);
  }, []);

  const toggle = (id: string, value: boolean) => {
    const next = new Set(selected);
    value ? next.add(id) : next.delete(id);
    onChange(next);
  };

  return (
    <>
      <PanelSectionRow>
        <span style={{ fontSize: "12px", opacity: 0.7 }}>
          Mods must be downloaded from Nexus and dropped into payloads/mods/ before installing — Bloodecky
          never bundles or downloads them for you.
        </span>
      </PanelSectionRow>

      {MODS.map((mod) => {
        const onDisk = availableOnDisk.includes(mod.id);
        const checked = mod.required || selected.has(mod.id);
        return (
          <PanelSectionRow key={mod.id}>
            <ToggleField
              label={mod.name}
              description={
                mod.required
                  ? "Required for this profile"
                  : onDisk
                  ? mod.note ?? (mod.recommended ? "Recommended" : "Optional")
                  : "Not found in payloads/mods/ — download it first"
              }
              checked={checked}
              disabled={mod.required || !onDisk}
              onChange={(v) => toggle(mod.id, v)}
            />
            {!onDisk && (
              <ButtonItem
                layout="below"
                onClick={() => Navigation.NavigateToExternalWeb(mod.nexusUrl)}
              >
                Open on Nexus
              </ButtonItem>
            )}
          </PanelSectionRow>
        );
      })}
    </>
  );
};
