import { randomUUID } from 'expo-crypto';

/** A new random identifier (UUID v4). */
export function createId(): string {
  return randomUUID();
}
