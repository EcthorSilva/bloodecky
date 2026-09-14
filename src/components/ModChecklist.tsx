import { FC, useEffect, useState } from "react";
import { PanelSectionRow, ToggleField, ButtonItem, Navigation } from "@decky/ui";
import { MODS } from "../types";
import { listAvailableMods } from "../api";

interface Props {
  selected: Set<string>;
  requiresMods: boolean;
  onChange: (next: Set<string>) => void;
}

export const ModChecklist: FC<Props> = ({ selected, requiresMods, onChange }) => {
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
          Vertex Explosion Fix, Deck 16:10 UI Fix, and FPS Boost are included with Bloodecky. Other mods
          must be downloaded from Nexus and added to payloads/mods/.
        </span>
      </PanelSectionRow>

      {MODS.map((mod) => {
        const available = mod.source === "bundled" || availableOnDisk.includes(mod.id);
        const checked = (mod.required && requiresMods) || selected.has(mod.id);
        return (
          <PanelSectionRow key={mod.id}>
            <ToggleField
              label={mod.name}
              description={
                mod.source === "bundled"
                  ? mod.required && requiresMods
                    ? "Included and required for this profile"
                    : mod.note ?? (mod.recommended ? "Included and recommended" : "Included")
                  : mod.required && requiresMods
                  ? "Required for this profile"
                  : available
                  ? mod.note ?? (mod.recommended ? "Recommended" : "Optional")
                  : "Not found in payloads/mods/ — download it first"
              }
              checked={checked}
              disabled={(mod.required && requiresMods) || !available}
              onChange={(v) => toggle(mod.id, v)}
            />
            {!available && mod.source === "external" && (
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
