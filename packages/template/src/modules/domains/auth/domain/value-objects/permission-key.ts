export class PermissionKey {
  private constructor(private readonly value: string) {}

  static create(raw: string): PermissionKey {
    const normalized = raw.trim().toLowerCase();

    if (!normalized) {
      throw new Error('Permission key is required');
    }

    if (!/^[a-z][a-z0-9._-]*$/.test(normalized)) {
      throw new Error('Permission key is invalid');
    }

    return new PermissionKey(normalized);
  }

  toString(): string {
    return this.value;
  }

  equals(other: PermissionKey): boolean {
    return this.value === other.value;
  }
}
