/**
 * Utility for extracting the dominant color from images or video frames.
 * This powers the 'Media Resonance' feature of the Resonant UI.
 */

/**
 * Extracts a dominant hex color from an image URL.
 * Under the hood, this uses an off-screen canvas to sample the center pixels.
 */
export async function extractDominantColorFromImage(imageUrl: string): Promise<string | null> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "Anonymous";
    img.onload = () => {
      try {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          resolve(null);
          return;
        }

        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0, img.width, img.height);

        // Sample a central region to avoid borders
        const sampleSize = 50;
        const startX = Math.max(0, Math.floor(img.width / 2 - sampleSize / 2));
        const startY = Math.max(0, Math.floor(img.height / 2 - sampleSize / 2));
        
        const imageData = ctx.getImageData(startX, startY, sampleSize, sampleSize);
        const data = imageData.data;

        let r = 0, g = 0, b = 0;
        const pixelCount = data.length / 4;

        for (let i = 0; i < data.length; i += 4) {
          r += data[i];
          g += data[i + 1];
          b += data[i + 2];
        }

        r = Math.floor(r / pixelCount);
        g = Math.floor(g / pixelCount);
        b = Math.floor(b / pixelCount);

        // Boost saturation slightly for UI aesthetic purposes
        const hex = rgbToHex(r, g, b);
        resolve(hex);
      } catch (err) {
        console.error("Failed to extract color:", err);
        resolve(null);
      }
    };
    
    img.onerror = () => resolve(null);
    img.src = imageUrl;
  });
}

function rgbToHex(r: number, g: number, b: number): string {
  return "#" + [r, g, b].map(x => {
    const hex = x.toString(16);
    return hex.length === 1 ? "0" + hex : hex;
  }).join("");
}
