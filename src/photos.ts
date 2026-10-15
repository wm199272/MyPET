import { Directory, File, Paths } from 'expo-file-system';

export async function persistImage(uri: string, name: string): Promise<string> {
  if (!uri || uri.startsWith('file://') && uri.includes('/pet-photos/')) return uri;
  try {
    const dir = new Directory(Paths.document, 'pet-photos');
    dir.create({ intermediates: true, idempotent: true });
    const dest = new File(dir, name);
    if (dest.exists) dest.delete();
    await new File(uri).copy(dest);
    return dest.uri;
  } catch {
    return uri;
  }
}
