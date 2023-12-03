const COS_30 = Math.cos(Math.PI / 6);
const ISOCELES_FACTOR = 2 / Math.sqrt(5);

const SCALE = 200;
const ZOOM = SCALE * 0.15;

const canvas = document.createElement('canvas');
canvas.width = 6 * SCALE * COS_30 + SCALE / 4;
canvas.height = 2.5 * SCALE;

const scaledCanvas = document.createElement('canvas');
scaledCanvas.width = canvas.width;
scaledCanvas.height = canvas.height;

async function drawKaleidocycle(c1, c2, c3, c4) {
  const ctx = canvas.getContext('2d');
  ctx.imageSmoothingEnabled = true;
  ctx.fillStyle = '#fff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  await drawRow(canvas, c1, 0, 0, false);
  await drawRow(canvas, c2, SCALE * COS_30, SCALE / 2, true);
  await drawRow(canvas, c3, 0, SCALE, false);
  await drawRow(canvas, c4, SCALE * COS_30, 3 * SCALE / 2, true);

  drawFinishingTouches(canvas);
  scaleDraw(canvas, scaledCanvas);
}

function scaleDraw(inCanvas, outCanvas) {
  const outCtx = outCanvas.getContext('2d');

  outCtx.clearRect(0, 0, outCanvas.width, outCanvas.height * ISOCELES_FACTOR);
  outCtx.drawImage(inCanvas,
    0, 0, inCanvas.width, inCanvas.height,
    0, 0, outCanvas.width, outCanvas.height * ISOCELES_FACTOR);
}


function drawFinishingTouches(canvas) {
  drawBottomLines(canvas);
  drawTab(canvas, 6 * SCALE * COS_30, SCALE / 2);
  drawTab(canvas, 6 * SCALE * COS_30, SCALE + SCALE / 2);
}

function drawDiamond(ctx, x, y) {
  ctx.strokeStyle = 'rgba(0,0,0,0.5)';
  ctx.beginPath();
  ctx.moveTo(x, SCALE / 2 + y);
  ctx.lineTo(x + SCALE * COS_30, y);
  ctx.lineTo(x + 2 * SCALE * COS_30, SCALE / 2 + y);
  ctx.lineTo(x + SCALE * COS_30, SCALE + y);
  ctx.lineTo(x, SCALE / 2 + y);
  ctx.stroke();

  ctx.save();
  ctx.clip();
}

function drawTab(canvas, x, y) {
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = 'white';

  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x + SCALE / 4, y);
  ctx.lineTo(x + SCALE / 4, y + SCALE);
  ctx.lineTo(x, y + SCALE);
  ctx.closePath();
  ctx.fill();

  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x + SCALE / 4, y + SCALE / 4);
  ctx.lineTo(x + SCALE / 4, y + 3 * SCALE / 4);
  ctx.lineTo(x, y + SCALE);
  ctx.stroke();
};

function drawBottomLines(canvas) {
  const ctx = canvas.getContext('2d');

  ctx.beginPath();
  ctx.moveTo(0, 2.5 * SCALE);
  ctx.lineTo(6 * SCALE * COS_30, 2.5 * SCALE);

  for (let i = 0; i < 4; i++) {
    ctx.moveTo((2 * i) * SCALE * COS_30, SCALE / 2);
    ctx.lineTo((2 * i) * SCALE * COS_30, 2.5 * SCALE);
    ctx.moveTo((2 * i + 1) * SCALE * COS_30, 0);
    ctx.lineTo((2 * i + 1) * SCALE * COS_30, 2.5 * SCALE);
  }
  ctx.stroke();
};

async function drawRow(dest, src, x, y, rightRow) {
  if (!src) return;
  await drawToHexCanvas(src);
  const w = src.width;
  const h = src.height;

  const destCtx = dest.getContext('2d');

  drawDiamond(destCtx, x, y);
  destCtx.translate(h / 4 + x, w / 4 + y);
  destCtx.rotate(-Math.PI / 2);
  destCtx.drawImage(src, 0, 0, SCALE, SCALE * COS_30 * 2,
    -w / 4, -h / 4, SCALE, SCALE * COS_30 * 2)
  destCtx.restore();

  drawDiamond(destCtx, x + SCALE * COS_30 * 2, y);
  destCtx.translate(x + 2 * SCALE * COS_30, SCALE / 2 + y);
  destCtx.rotate(Math.PI / 6);
  destCtx.drawImage(src, SCALE / 2, SCALE * COS_30, 1.5 * SCALE, SCALE * COS_30,
    0, -SCALE * COS_30, SCALE * COS_30 * 2 * COS_30, SCALE * COS_30);
  destCtx.restore();

  drawDiamond(destCtx, x + SCALE * COS_30 * 4, y, rightRow);
  destCtx.translate(x + 5.5 * SCALE * COS_30, SCALE / 2 - SCALE * COS_30 * COS_30 + y);
  destCtx.rotate(5 * Math.PI / 6);
  destCtx.drawImage(src, 2 * SCALE, SCALE * COS_30, -1.5 * SCALE, -SCALE * COS_30,
    0, -SCALE * COS_30, SCALE * COS_30 * 2 * COS_30, SCALE * COS_30);
  destCtx.restore();

  if (rightRow) {
    drawDiamond(destCtx, x - 2 * SCALE * COS_30, y);
    destCtx.translate(SCALE * COS_30, SCALE / 2 + y);
    destCtx.rotate(5 * Math.PI / 6);
    destCtx.drawImage(src, 2 * SCALE, SCALE * COS_30, -1.5 * SCALE, -SCALE * COS_30,
      0, 0, SCALE * COS_30 * 2 * COS_30, SCALE * COS_30);
    destCtx.restore();
  }
}

function calculateFullRatio(image) {
  const w = image.width;
  const h = image.height;

  const rw = w / SCALE;
  const rh = h / (SCALE * COS_30);

  return (rh > rw) ? [rw / rh, 1] : [1, rh / rw];
}

function drawToHexCanvas(canvas) {
  return new Promise((resolve, reject) => {
    let src = canvas.toDataURL();

    const ctx = canvas.getContext('2d');
    ctx.imageSmoothingEnabled = true;
    canvas.width = 2 * SCALE;
    canvas.height = 2 * SCALE * COS_30;

    const image = new Image();
    image.onload = () => {
      const [xx, yy] = calculateFullRatio(image);

      const sw = xx * 2 * SCALE;
      const sh = yy * 2 * SCALE * COS_30;

      const ox = (2 * SCALE - sw) / 2;
      const oy = (2 * SCALE * COS_30 - sh) / 2;
      ctx.drawImage(image, 0, 0, image.width, image.height, ox, oy, sw, sh);
      resolve();
    };
    image.src = src;
  });
}