export const trainingSystemIds = ["drop-set", "rest-pause", "fst-7"] as const;
export type TrainingSystem = typeof trainingSystemIds[number];

export const trainingSystems = {
  "drop-set": {
    name: "دراپ ست",
    example: "۱۲-۶",
    description: "وزنه را کم کن و بدون مکث ادامه بده. در این مثال: ۱۲ تکرار سنگین تر، بعد ۶ تکرار سبک تر.",
    hint: "در تکرار، تعداد با وزنه سنگین تر و بعد سبک تر را بنویس؛ مثلا ۱۲-۶. استراحت برای بین ست های کامل است.",
  },
  "rest-pause": {
    name: "رست پاز",
    example: "۵-۵-۵",
    description: "با همان وزنه ادامه بده و بین نوبت ها ۵ تا ۸ ثانیه مکث کن. در این مثال: سه نوبت ۵ تکراری.",
    hint: "در تکرار، تعداد هر نوبت را بنویس؛ مثلا ۵-۵-۵. استراحت برای بین ست های کامل است.",
  },
  "fst-7": {
    name: "اف اس تی ۷ (FST-7)",
    example: "۷ × ۱۰",
    description: "۷ ست با تعداد تکرار مشخص و استراحت کوتاه بین ست ها؛ در این مثال ۱۰ تکرار در هر ست و ۱۰ ثانیه استراحت. زمان برنامه در ستون استراحت آمده است.",
    hint: "مثلا ست: ۷، تکرار: ۱۰، استراحت بین ست ها: ۱۰ ثانیه.",
  },
} satisfies Record<TrainingSystem, { name: string; example: string; description: string; hint: string }>;
