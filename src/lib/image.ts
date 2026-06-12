/** File → 캔버스로 리사이즈 후 base64(JPEG) 추출. 토큰/전송량을 줄이기 위해 긴 변 1568px로 축소. */
export async function processImage(
  file: File
): Promise<{ dataUrl: string; base64: string; mediaType: string }> {
  const img = await loadImage(file);
  const maxEdge = 1568;
  let { width, height } = img;
  if (Math.max(width, height) > maxEdge) {
    const scale = maxEdge / Math.max(width, height);
    width = Math.round(width * scale);
    height = Math.round(height * scale);
  }
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("캔버스를 사용할 수 없습니다.");
  ctx.drawImage(img, 0, 0, width, height);
  const dataUrl = canvas.toDataURL("image/jpeg", 0.9);
  return { dataUrl, base64: dataUrl.split(",")[1], mediaType: "image/jpeg" };
}

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error("이미지를 불러올 수 없습니다."));
      img.src = reader.result as string;
    };
    reader.onerror = () => reject(new Error("파일을 읽을 수 없습니다."));
    reader.readAsDataURL(file);
  });
}
