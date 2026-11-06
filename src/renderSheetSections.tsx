import { Fragment } from "react";
import type { ReactNode } from "react";
import type { Plan } from "./model";
import { orderedSheetSections, showsSheetSection } from "./sheetSections";
import type { SheetLayoutSection } from "./sheetSections";

type SectionGroup = {
  members: SheetLayoutSection[];
  wrap: (children: ReactNode[], order: SheetLayoutSection[]) => ReactNode;
  groups?: SectionGroup[];
};

// Adjacent cards can share a row. When separated, each keeps its template styling.
export function renderSheetSections(
  plan: Plan,
  sections: Partial<Record<SheetLayoutSection, ReactNode>>,
  groups: SectionGroup[] = [],
) {
  const hasLegend = showsSheetSection(plan, "legend")
    && plan.days.some((day) => day.exercises.some((exercise) => exercise.trainingSystem));
  const order = orderedSheetSections(plan).filter((id) => sections[id] && (id !== "legend" || hasLegend));
  return renderRows(order, sections, groups);
}

function renderRows(
  order: SheetLayoutSection[],
  sections: Partial<Record<SheetLayoutSection, ReactNode>>,
  groups: SectionGroup[],
) {
  const rows: ReactNode[] = [];
  for (let index = 0; index < order.length;) {
    const id = order[index++];
    const group = groups.find(({ members }) => members.includes(id));
    if (!group) {
      rows.push(<Fragment key={id}>{sections[id]}</Fragment>);
      continue;
    }
    const members = [id];
    while (index < order.length && group.members.includes(order[index])) {
      members.push(order[index++]);
    }
    const children = renderRows(members, sections, group.groups ?? []);
    rows.push(<Fragment key={id}>{group.wrap(children, members)}</Fragment>);
  }
  return rows;
}
