export const protocolPalettes = {
  orange: { name: "نارنجی", color: "#ff6b35", pattern: "contour" },
  red: { name: "قرمز", color: "#f64b3c", pattern: "checker" },
  purple: { name: "بنفش", color: "#b38ce9", pattern: "scratch" },
  cyan: { name: "فیروزه ای", color: "#49c9df", pattern: "rays" },
  green: { name: "سبز", color: "#88c477", pattern: "maze" },
} as const;

export type ProtocolAccent = keyof typeof protocolPalettes;
export type ProtocolMode = "paper" | "dark";

export const getProtocolPalette = (accent?: ProtocolAccent) =>
  protocolPalettes[accent ?? "orange"] ?? protocolPalettes.orange;

export function protocolVariables(accent?: ProtocolAccent) {
  return { "--accent": getProtocolPalette(accent).color };
}
