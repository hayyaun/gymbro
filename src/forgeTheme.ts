export const forgePalettes = {
  purple: { name: "بنفش", color: "#a967ed", light: "#7534b5", ink: "#1b0b2c" },
  orange: { name: "نارنجی", color: "#ff9a42", light: "#a94807", ink: "#211207" },
  lime: { name: "سبز فسفری", color: "#c3f54b", light: "#516d09", ink: "#172005" },
  yellow: { name: "زرد", color: "#f9d84a", light: "#806500", ink: "#252005" },
} as const;

export type ForgeAccent = keyof typeof forgePalettes;
export type ForgeMode = "dark" | "light";

// Optional plan fields keep existing saved programs and their accent colors intact.
export const getForgePalette = (accent?: ForgeAccent) =>
  forgePalettes[accent ?? "purple"] ?? forgePalettes.purple;

export function forgeVariables(accent?: ForgeAccent, mode: ForgeMode = "dark") {
  const palette = getForgePalette(accent);
  return {
    "--accent": mode === "light" ? palette.light : palette.color,
    "--forge-fill": palette.color,
    "--forge-on-fill": palette.ink,
  };
}
