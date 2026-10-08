export const FileSystemUploadType = { MULTIPART: 1 };
export const cacheDirectory = 'file:///test-cache/';

export async function uploadAsync(): Promise<never> {
  throw new Error('Native file upload is unavailable in unit tests.');
}

export async function copyAsync(): Promise<never> {
  throw new Error('Native file copy is unavailable in unit tests.');
}

export async function deleteAsync(): Promise<void> {
  return undefined;
}
