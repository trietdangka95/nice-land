const DEFAULT_MAX_DIMENSION = 1920;
const DEFAULT_QUALITY = 0.82;

type DecodedImage = CanvasImageSource & {
  width: number;
  height: number;
  close?: () => void;
};

type OptimizationOptions = {
  maxDimension?: number;
  quality?: number;
  decodeImage?: (file: File) => Promise<DecodedImage>;
  createCanvas?: (width: number, height: number) => HTMLCanvasElement;
};

export function calculateOptimizedDimensions(
  width: number,
  height: number,
  maxDimension = DEFAULT_MAX_DIMENSION,
) {
  const longestEdge = Math.max(width, height);
  if (longestEdge <= maxDimension) {
    return { width, height };
  }

  const ratio = maxDimension / longestEdge;
  return {
    width: Math.round(width * ratio),
    height: Math.round(height * ratio),
  };
}

export function createOptimizedFileName(fileName: string) {
  const extensionIndex = fileName.lastIndexOf(".");
  const baseName =
    extensionIndex > 0 ? fileName.slice(0, extensionIndex) : fileName;
  return `${baseName}.webp`;
}

function canvasToBlob(
  canvas: HTMLCanvasElement,
  quality: number,
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error("Browser could not encode this image."));
        }
      },
      "image/webp",
      quality,
    );
  });
}

export async function optimizeImageForUpload(
  file: File,
  options: OptimizationOptions = {},
) {
  try {
    const decodeImage =
      options.decodeImage ??
      ((source: File) => createImageBitmap(source) as Promise<DecodedImage>);
    const createCanvas =
      options.createCanvas ??
      ((width: number, height: number) => {
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        return canvas;
      });

    const image = await decodeImage(file);
    const dimensions = calculateOptimizedDimensions(
      image.width,
      image.height,
      options.maxDimension,
    );
    const canvas = createCanvas(dimensions.width, dimensions.height);
    const context = canvas.getContext("2d");
    if (!context) {
      image.close?.();
      return file;
    }

    context.drawImage(
      image,
      0,
      0,
      dimensions.width,
      dimensions.height,
    );
    image.close?.();

    const blob = await canvasToBlob(
      canvas,
      options.quality ?? DEFAULT_QUALITY,
    );
    if (blob.type !== "image/webp") {
      return file;
    }
    return new File([blob], createOptimizedFileName(file.name), {
      type: "image/webp",
      lastModified: file.lastModified,
    });
  } catch {
    return file;
  }
}
