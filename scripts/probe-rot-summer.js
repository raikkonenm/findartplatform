const sharp = require("sharp");
const dir = "public/exhibitions/ROT SUMMER";
(async () => {
  for (let i = 1; i <= 16; i++) {
    const m = await sharp(`${dir}/${i}.webp`).metadata();
    const orient = m.width >= m.height ? "horizontal" : "vertical";
    console.log(`${i}.webp  ${m.width}x${m.height}  ${orient}`);
  }
})();
