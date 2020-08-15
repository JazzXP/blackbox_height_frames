const { createCanvas } = require("canvas");
const fs = require("fs");
const csv = require("csv-parser");

const width = 256;
const height = 64;

function round(value, precision) {
  var multiplier = Math.pow(10, precision || 0);
  return Math.round(value * multiplier) / multiplier;
}

function clearCanvas(context) {
  context.fillStyle = "#000";
  context.fillRect(0, 0, width, height);
  context.fillStyle = "#fff";
}

function main(args) {
  if (args.length < 1) {
    console.error("Please supply the input filename");
    return;
  }

  const canvas = createCanvas(width, height);
  const context = canvas.getContext("2d");

  context.font = "bold 40pt Verdana";
  context.textAlign = "right";

  clearCanvas(context);

  let text = "";
  let currentTotal = 0;
  let currentPos = 0;
  let frameNo = 0;
  fs.createReadStream(args[0])
    .pipe(csv({ skipLines: 111 }))
    .on("data", (data) => {
      currentTotal += parseInt(data.BaroAlt, 10);
      currentPos++;
      if (currentPos >= 80) {
        text = `${(round(currentTotal / currentPos, 1) / 100.0).toFixed(1)}m`;
        context.fillText(text, width, height - 8);

        const buffer = canvas.toBuffer("image/png");
        const outputFNo = `${frameNo++}`.padStart(6, "0");
        fs.writeFileSync(`./out/test${outputFNo}.png`, buffer);
        currentPos = 0;
        currentTotal = 0;
        clearCanvas(context);
      }
    });
}

main(process.argv.slice(2));
console.out("A good command to run is:-");
console.out(
  `ffmpeg -framerate 25 -pattern_type glob -i 'out/*.png' -c:v libx264 -r 25 -pix_fmt yuv420p out1.mp4`
);
