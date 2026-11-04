import type { Plan } from "./model";
import type { WorkoutBlock } from "./library";

const builtins = [
  "بارفیکس", "بارفیکس دستگاه", "زیربغل قایقی", "زیربغل سیم کش تک دست", "زیربغل دمبل خم", "لت دست جمع", "لت دست باز", "لت تک دست",
  "پرس سینه هالتر", "پرس سینه دمبل", "پرس سینه اسمیت", "پرس سینه دستگاه", "پرس بالا سینه دمبل", "قفسه سینه دمبل", "کراس اور", "شنا سوئدی",
  "اسکوات هالتر", "اسکوات جام", "اسکوات بلغاری", "هاک اسکوات", "پرس پا", "لانج راه رفتنی", "لانج معکوس", "جلو پا دستگاه", "پشت پا دستگاه", "پشت پا خوابیده",
  "ددلیفت", "ددلیفت رومانیایی", "هیپ تراست", "ساق پا ایستاده", "ساق پا نشسته", "پرس سرشانه دمبل", "پرس سرشانه هالتر", "نشر جانب دمبل", "نشر جانب سیم کش", "نشر خم دمبل", "فیس پول",
  "جلو بازو دمبل", "جلو بازو هالتر", "جلو بازو سیم کش", "جلو بازو چکشی", "پشت بازو طناب", "پشت بازو سیم کش", "پشت بازو دمبل", "دیپ", "کرانچ", "کرانچ سیم کش", "پلانک", "بالا آوردن پا آویزان", "گرم کردن عمومی", "راه رفتن روی تردمیل", "دوچرخه ثابت",
];
export const exerciseSearchKey = (value: string) => value.trim().replace(/[يى]/g, "ی").replace(/ك/g, "ک").replace(/[\s\u200c]+/g, " ").toLocaleLowerCase();
export function exerciseCatalog(plans: Plan[], blocks: WorkoutBlock[]) {
  const names = [...plans.flatMap((plan) => plan.days.flatMap((day) => day.exercises.map((item) => item.name))), ...blocks.flatMap((block) => block.exercises.map((item) => item.name)), ...builtins];
  return [...new Map(names.filter((name) => name.trim()).map((name) => [exerciseSearchKey(name), name.trim()])).values()];
}
