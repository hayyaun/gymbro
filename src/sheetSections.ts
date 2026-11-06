export const sheetSectionLabels = {
  calendar: "تقویم هفتگی",
  legend: "کادر راهنمای سیستم های تمرینی (Legends)",
  notes: "یادداشت مربی",
  cardio: "تمرین هوازی",
  pillars: "باکس های شعار",
  rhythm: "ردیف تمرکز تمرین",
  signal: "نوار شعار و الگو",
  heroArt: "تصویر بالای پوستر",
};

export type SheetSection = keyof typeof sheetSectionLabels;

const commonSections = ["calendar", "legend", "notes", "cardio"] as const;
export const sheetSectionOptions = {
  studio: commonSections,
  forge: ["pillars", "rhythm", ...commonSections],
  protocol: ["signal", ...commonSections],
  overdrive: ["heroArt", ...commonSections],
  pahlavan: ["heroArt", ...commonSections],
} satisfies Record<string, readonly SheetSection[]>;

export type SheetTemplate = keyof typeof sheetSectionOptions;
export type HiddenSheetSections = Partial<Record<SheetTemplate, SheetSection[]>>;
export const sheetTemplates = Object.keys(sheetSectionOptions) as SheetTemplate[];

export function sheetTemplate(template: string): SheetTemplate {
  return sheetTemplates.find((id) => id === template) ?? "studio";
}

export function showsSheetSection(
  { template, hiddenSections }: { template: string; hiddenSections?: HiddenSheetSections },
  section: SheetSection,
) {
  return !hiddenSections?.[sheetTemplate(template)]?.includes(section);
}
