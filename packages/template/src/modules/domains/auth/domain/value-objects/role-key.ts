export class RoleKey {
  private constructor(private readonly value: string) {}

  static create(raw: string): RoleKey {
    const normalized = raw.trim().toLowerCase();

    if (!normalized) {
      throw new Error('Role key is required');
    }

    if (!/^[a-z][a-z0-9._-]*$/.test(normalized)) {
      throw new Error('Role key is invalid');
    }

    return new RoleKey(normalized);
  }

  toString(): string {
    return this.value;
  }

  equals(other: RoleKey): boolean {
    return this.value === other.value;
  }
}
