import { FC, useState } from "react";
import { PanelSectionRow, Focusable, Marquee } from "@decky/ui";
import { PROFILES, ProfileId } from "../types";

interface Props {
  selected: ProfileId;
  onSelect: (id: ProfileId) => void;
}

export const ProfileSelector: FC<Props> = ({ selected, onSelect }) => {
  const [focusedId, setFocusedId] = useState<ProfileId | null>(null);

  return (
    <>
      {PROFILES.map((profile) => {
        const isSelected = profile.id === selected;
        const isFocused = profile.id === focusedId;

        return (
          <PanelSectionRow key={profile.id}>
            <Focusable
              onActivate={() => onSelect(profile.id)}
              onFocus={() => setFocusedId(profile.id)}
              onBlur={() => setFocusedId(null)}
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "2px",
                padding: "10px 12px",
                borderRadius: "4px",
                border: isSelected ? "2px solid #1a9fff" : "2px solid transparent",
                background: isFocused
                  ? "rgba(255, 255, 255, 0.1)"
                  : isSelected
                  ? "rgba(26, 159, 255, 0.08)"
                  : "rgba(255, 255, 255, 0.03)",
                transition: "background 0.15s ease, border-color 0.15s ease",
                cursor: "pointer",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                <Marquee style={{ fontWeight: 600 }}>{profile.label}</Marquee>
                <span style={{ fontSize: "12px", opacity: 0.75 }}>
                  {profile.fps} · {profile.resolution}
                </span>
              </div>
              <span style={{ fontSize: "12px", opacity: 0.65 }}>{profile.description}</span>
              {profile.requiresMods && (
                <span style={{ fontSize: "11px", color: "#e8b339" }}>Requires the Vertex Explosion Fix mod</span>
              )}
            </Focusable>
          </PanelSectionRow>
        );
      })}
    </>
  );
};