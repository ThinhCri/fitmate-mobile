export async function fetch(): Promise<never> {
  throw new Error('Native fetch is unavailable in unit tests.');
}
