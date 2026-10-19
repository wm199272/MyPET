export async function prepareGarmentPhoto(uri: string): Promise<string> {
  if (typeof document === 'undefined') return uri;
  const source = uri.startsWith('blob:') ? await blobToData(uri) : uri;
  if (!source.startsWith('data:')) return source;
  return shrink(source);
}

async function blobToData(uri: string): Promise<string> {
  const blob = await fetch(uri).then((response) => response.blob());
  return await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });
}

async function shrink(uri: string): Promise<string> {
  const image = new Image();
  image.src = uri;
  await image.decode();
  const size = 512;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const context = canvas.getContext('2d');
  if (!context) return uri;
  context.drawImage(image, 0, 0, size, size);
  return canvas.toDataURL('image/jpeg', 0.82);
}
