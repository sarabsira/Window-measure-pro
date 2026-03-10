/**
 * Convert a photo to a clean 2D technical line drawing using canvas-based processing
 */
export async function processWindowPhoto(dataUrl: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      try {
        const result = applyProcessingPipeline(img);
        resolve(result);
      } catch (e) {
        reject(e);
      }
    };
    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = dataUrl;
  });
}

function applyProcessingPipeline(img: HTMLImageElement): string {
  const canvas = document.createElement('canvas');
  const MAX_SIZE = 1200;
  let w = img.naturalWidth;
  let h = img.naturalHeight;
  if (w > MAX_SIZE) {
    h = Math.round((h * MAX_SIZE) / w);
    w = MAX_SIZE;
  }
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d')!;

  // Draw original
  ctx.drawImage(img, 0, 0, w, h);
  const imageData = ctx.getImageData(0, 0, w, h);
  const data = imageData.data;

  // Step 1: Greyscale
  for (let i = 0; i < data.length; i += 4) {
    const grey = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
    data[i] = data[i + 1] = data[i + 2] = grey;
  }
  ctx.putImageData(imageData, 0, 0);

  // Step 2: Sobel edge detection
  const srcData = ctx.getImageData(0, 0, w, h);
  const edgeData = ctx.createImageData(w, h);
  sobelFilter(srcData.data, edgeData.data, w, h);
  ctx.putImageData(edgeData, 0, 0);

  // Step 3: Threshold and invert (dark edges on white background)
  const threshData = ctx.getImageData(0, 0, w, h);
  const td = threshData.data;
  for (let i = 0; i < td.length; i += 4) {
    const v = td[i] > 30 ? 0 : 255; // edges become dark, background white
    td[i] = td[i + 1] = td[i + 2] = v;
    td[i + 3] = 255;
  }
  ctx.putImageData(threshData, 0, 0);

  // Step 4: White background fill
  const tempCanvas = document.createElement('canvas');
  tempCanvas.width = w;
  tempCanvas.height = h;
  const tctx = tempCanvas.getContext('2d')!;
  tctx.fillStyle = '#ffffff';
  tctx.fillRect(0, 0, w, h);
  tctx.drawImage(canvas, 0, 0);

  // Step 5: Overlay grid
  tctx.strokeStyle = 'rgba(45, 212, 191, 0.08)';
  tctx.lineWidth = 1;
  const gridSize = 40;
  for (let x = 0; x <= w; x += gridSize) {
    tctx.beginPath();
    tctx.moveTo(x, 0);
    tctx.lineTo(x, h);
    tctx.stroke();
  }
  for (let y = 0; y <= h; y += gridSize) {
    tctx.beginPath();
    tctx.moveTo(0, y);
    tctx.lineTo(w, y);
    tctx.stroke();
  }

  return tempCanvas.toDataURL('image/png');
}

function sobelFilter(src: Uint8ClampedArray, dst: Uint8ClampedArray, w: number, h: number) {
  const kernelX = [-1, 0, 1, -2, 0, 2, -1, 0, 1];
  const kernelY = [-1, -2, -1, 0, 0, 0, 1, 2, 1];

  for (let y = 1; y < h - 1; y++) {
    for (let x = 1; x < w - 1; x++) {
      let gx = 0;
      let gy = 0;

      for (let ky = -1; ky <= 1; ky++) {
        for (let kx = -1; kx <= 1; kx++) {
          const idx = ((y + ky) * w + (x + kx)) * 4;
          const v = src[idx];
          const ki = (ky + 1) * 3 + (kx + 1);
          gx += v * kernelX[ki];
          gy += v * kernelY[ki];
        }
      }

      const magnitude = Math.min(255, Math.sqrt(gx * gx + gy * gy));
      const i = (y * w + x) * 4;
      dst[i] = dst[i + 1] = dst[i + 2] = magnitude;
      dst[i + 3] = 255;
    }
  }
}

export function drawDimensionLine(
  canvas: HTMLCanvasElement,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  label: string
) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  ctx.strokeStyle = '#2DD4BF';
  ctx.fillStyle = '#2DD4BF';
  ctx.lineWidth = 2;
  ctx.font = 'bold 13px DM Mono, monospace';

  // Main line
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();

  // Arrowheads
  const angle = Math.atan2(y2 - y1, x2 - x1);
  const arrowLen = 10;
  const arrowAngle = Math.PI / 6;

  [[x1, y1, angle + Math.PI], [x2, y2, angle]].forEach(([ax, ay, a]) => {
    ctx.beginPath();
    ctx.moveTo(ax as number, ay as number);
    ctx.lineTo(
      (ax as number) - arrowLen * Math.cos((a as number) - arrowAngle),
      (ay as number) - arrowLen * Math.sin((a as number) - arrowAngle)
    );
    ctx.moveTo(ax as number, ay as number);
    ctx.lineTo(
      (ax as number) - arrowLen * Math.cos((a as number) + arrowAngle),
      (ay as number) - arrowLen * Math.sin((a as number) + arrowAngle)
    );
    ctx.stroke();
  });

  // Label
  const mx = (x1 + x2) / 2;
  const my = (y1 + y2) / 2;
  const metrics = ctx.measureText(label);
  ctx.fillStyle = 'rgba(255,255,255,0.85)';
  ctx.fillRect(mx - metrics.width / 2 - 4, my - 10, metrics.width + 8, 18);
  ctx.fillStyle = '#0F1B2D';
  ctx.fillText(label, mx - metrics.width / 2, my + 4);
}
