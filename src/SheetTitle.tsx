export default function SheetTitle({ title }: { title: string }) {
  if (title !== "قدرت، در هر تکرار") return title;
  return <>قدرت،<br />در هر تکرار</>;
}
