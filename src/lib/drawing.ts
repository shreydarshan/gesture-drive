import type { NormalizedLandmark } from '@mediapipe/tasks-vision';

export const HAND_CONNECTIONS: [number, number][] = [
  // Thumb
  [0, 1],
  [1, 2],
  [2, 3],
  [3, 4],
  // Index finger
  [0, 5],
  [5, 6],
  [6, 7],
  [7, 8],
  // Middle finger
  [5, 9],
  [9, 10],
  [10, 11],
  [11, 12],
  // Ring finger
  [9, 13],
  [13, 14],
  [14, 15],
  [15, 16],
  // Pinky finger
  [13, 17],
  [17, 18],
  [18, 19],
  [19, 20],
  // Palm base
  [0, 17],
];

const FINGERTIP_INDICES = [4, 8, 12, 16, 20];

interface HandTheme {
  primary: string;
  glow: string;
  tipColor: string;
}

const HAND_THEMES: HandTheme[] = [
  {
    primary: '#06b6d4', // Cyan
    glow: 'rgba(6, 182, 212, 0.6)',
    tipColor: '#22d3ee',
  },
  {
    primary: '#a855f7', // Purple
    glow: 'rgba(168, 85, 247, 0.6)',
    tipColor: '#c084fc',
  },
];

export function drawHandLandmarks(
  ctx: CanvasRenderingContext2D,
  landmarksList: NormalizedLandmark[][],
  handednessList?: { displayName?: string; categoryName?: string }[][]
): void {
  const width = ctx.canvas.width;
  const height = ctx.canvas.height;

  ctx.clearRect(0, 0, width, height);

  landmarksList.forEach((landmarks, handIndex) => {
    if (!landmarks || landmarks.length === 0) return;

    const theme = HAND_THEMES[handIndex % HAND_THEMES.length];

    // Draw connections
    ctx.save();
    ctx.strokeStyle = theme.primary;
    ctx.lineWidth = 3;
    ctx.shadowColor = theme.glow;
    ctx.shadowBlur = 8;
    ctx.lineCap = 'round';

    for (const [startIdx, endIdx] of HAND_CONNECTIONS) {
      const p1 = landmarks[startIdx];
      const p2 = landmarks[endIdx];

      if (p1 && p2) {
        ctx.beginPath();
        ctx.moveTo(p1.x * width, p1.y * height);
        ctx.lineTo(p2.x * width, p2.y * height);
        ctx.stroke();
      }
    }
    ctx.restore();

    // Draw landmarks
    landmarks.forEach((lm, idx) => {
      const x = lm.x * width;
      const y = lm.y * height;

      const isTip = FINGERTIP_INDICES.includes(idx);
      const radius = isTip ? 6 : 4;

      ctx.save();
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, 2 * Math.PI);

      if (isTip) {
        ctx.fillStyle = theme.tipColor;
        ctx.shadowColor = theme.tipColor;
        ctx.shadowBlur = 12;
      } else {
        ctx.fillStyle = '#ffffff';
        ctx.shadowColor = theme.glow;
        ctx.shadowBlur = 6;
      }

      ctx.fill();

      // Outer ring for landmarks
      ctx.lineWidth = 1.5;
      ctx.strokeStyle = theme.primary;
      ctx.stroke();
      ctx.restore();
    });

    // Draw Hand label near wrist (landmark 0)
    const wrist = landmarks[0];
    if (wrist) {
      const x = wrist.x * width;
      const y = wrist.y * height;

      const label = handednessList?.[handIndex]?.[0]?.categoryName || `Hand ${handIndex + 1}`;

      ctx.save();
      ctx.font = '600 12px Inter, sans-serif';
      ctx.fillStyle = theme.primary;
      ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
      ctx.shadowBlur = 4;
      ctx.fillText(label, x - 15, y + 20);
      ctx.restore();
    }
  });
}
