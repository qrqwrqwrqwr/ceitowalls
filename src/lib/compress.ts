import { FFmpeg } from "@ffmpeg/ffmpeg";
import { toBlobURL, fetchFile } from "@ffmpeg/util";

let ffmpegInstance: FFmpeg | null = null;

async function getFFmpeg(onLog?: (msg: string) => void) {
  if (ffmpegInstance) return ffmpegInstance;
  const ffmpeg = new FFmpeg();
  const baseURL = "https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd";
  if (onLog) ffmpeg.on("log", ({ message }) => onLog(message));
  await ffmpeg.load({
    coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, "text/javascript"),
    wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, "application/wasm"),
  });
  ffmpegInstance = ffmpeg;
  return ffmpeg;
}

export async function compressImageToLimit(file: File, maxBytes: number): Promise<File> {
  const bitmap = await createImageBitmap(file);
  let width = bitmap.width;
  let height = bitmap.height;
  let quality = 0.85;

  for (let attempt = 0; attempt < 8; attempt++) {
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d")!;
    ctx.drawImage(bitmap, 0, 0, width, height);

    const blob: Blob | null = await new Promise((resolve) => canvas.toBlob(resolve, "image/jpeg", quality));
    if (blob && blob.size <= maxBytes) {
      return new File([blob], file.name.replace(/\.[^/.]+$/, ".jpg"), { type: "image/jpeg" });
    }

    if (quality > 0.5) {
      quality -= 0.15;
    } else {
      width = Math.round(width * 0.8);
      height = Math.round(height * 0.8);
    }
  }

  throw new Error("No se pudo comprimir la imagen por debajo del límite.");
}

export async function compressVideoToLimit(
  file: File,
  maxBytes: number,
  onProgress?: (message: string) => void
): Promise<File> {
  const ffmpeg = await getFFmpeg((msg) => onProgress?.(msg));

  const duration: number = await new Promise((resolve, reject) => {
    const video = document.createElement("video");
    video.preload = "metadata";
    video.onloadedmetadata = () => resolve(video.duration);
    video.onerror = () => reject(new Error("No se pudo leer el video"));
    video.src = URL.createObjectURL(file);
  });

  const inputName = "input" + (file.name.match(/\.[^/.]+$/)?.[0] || ".mp4");
  const outputName = "output.mp4";
  await ffmpeg.writeFile(inputName, await fetchFile(file));

  // trim long clips instead of downscaling resolution, so quality stays at 1080p
  const trimTo = duration >= 30 ? 20 : null;
  const effectiveDuration = trimTo ?? duration;

  // target bitrate with safety margin, leaving room for audio track
  const targetTotalBitrate = Math.floor((maxBytes * 8) / effectiveDuration);
  const audioBitrate = 96_000;
  const videoBitrate = Math.max(150_000, Math.floor(targetTotalBitrate * 0.9) - audioBitrate);

  onProgress?.(trimTo ? "Recortando y comprimiendo video…" : "Comprimiendo video…");
  await ffmpeg.exec([
    "-i",
    inputName,
    ...(trimTo ? ["-t", `${trimTo}`] : []),
    "-vf",
    "scale='min(1920,iw)':-2",
    "-c:v",
    "libx264",
    "-preset",
    "veryfast",
    "-b:v",
    `${videoBitrate}`,
    "-maxrate",
    `${videoBitrate}`,
    "-bufsize",
    `${videoBitrate * 2}`,
    "-c:a",
    "aac",
    "-b:a",
    `${audioBitrate}`,
    "-movflags",
    "+faststart",
    outputName,
  ]);

  const data = await ffmpeg.readFile(outputName);
  await ffmpeg.deleteFile(inputName);
  await ffmpeg.deleteFile(outputName);

  const blob = new Blob([data as BlobPart], { type: "video/mp4" });
  if (blob.size > maxBytes) {
    throw new Error("No se pudo comprimir el video por debajo del límite en un solo intento.");
  }
  return new File([blob], file.name.replace(/\.[^/.]+$/, ".mp4"), { type: "video/mp4" });
}
