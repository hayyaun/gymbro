export const sheetSectionLabels = {
  calendar: "تقویم هفتگی",
  legend: "کادر راهنمای سیستم های تمرینی (Legends)",
  notes: "یادداشت مربی",
  cardio: "تمرین هوازی",
  pillars: "باکس های شعار",
  rhythm: "ردیف تمرکز تمرین",
  signal: "نوار شعار و الگو",
  heroArt: "تصویر بالای پوستر",
  footer: "پاورقی",
};

export type SheetSection = keyof typeof sheetSectionLabels;

const commonSections = ["calendar", "legend", "notes", "cardio", "footer"] as const;
export const sheetSectionOptions = {
  forge: ["pillars", "rhythm", ...commonSections],
  protocol: ["signal", ...commonSections],
  overdrive: ["heroArt", ...commonSections],
  pahlavan: ["heroArt", ...commonSections],
} satisfies Record<string, readonly SheetSection[]>;

export type SheetTemplate = keyof typeof sheetSectionOptions;
export const defaultSheetTemplate = "forge" satisfies SheetTemplate;
export type HiddenSheetSections = Partial<Record<SheetTemplate, SheetSection[]>>;
export type SheetLayoutSection = SheetSection | "workouts";
export type SheetSectionOrder = Partial<Record<SheetTemplate, SheetLayoutSection[]>>;
export const sheetTemplates = Object.keys(sheetSectionOptions) as SheetTemplate[];

const defaultOrders: Record<SheetTemplate, readonly SheetLayoutSection[]> = {
  forge: ["pillars", "workouts", "rhythm", "calendar", "cardio", "legend", "notes", "footer"],
  protocol: ["signal", "workouts", "legend", "calendar", "notes", "cardio", "footer"],
  overdrive: ["heroArt", "workouts", "legend", "calendar", "notes", "cardio", "footer"],
  pahlavan: ["heroArt", "workouts", "legend", "calendar", "notes", "cardio", "footer"],
};

export function sheetTemplate(template: string): SheetTemplate {
  return sheetTemplates.find((id) => id === template) ?? defaultSheetTemplate;
}

export function orderedSheetSections(
  { template, sectionOrder }: { template: string; sectionOrder?: SheetSectionOrder },
): SheetLayoutSection[] {
  const id = sheetTemplate(template);
  const defaults = defaultOrders[id];
  const saved = sectionOrder?.[id] ?? [];
  return [...new Set([...saved.filter((section) => defaults.includes(section)), ...defaults])];
}

export function showsSheetSection(
  { template, hiddenSections }: { template: string; hiddenSections?: HiddenSheetSections },
  section: SheetSection,
) {
  return !hiddenSections?.[sheetTemplate(template)]?.includes(section);
}
