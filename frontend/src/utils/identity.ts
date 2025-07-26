/**
 * Safely extracts student ID from identity object
 * @param identity - The identity object from useIdentity hook
 * @returns The student ID or undefined if not available
 */
export const extractStudentId = (identity: unknown): string | undefined => {
  if (identity && typeof identity === 'object' && identity !== null && 'id' in identity) {
    const id = (identity as { id: unknown }).id;
    return typeof id === 'string' ? id : undefined;
  }
  return undefined;
};