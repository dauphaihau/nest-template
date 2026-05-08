export class PasswordHash {
  private constructor(private readonly value: string) {}

  static fromPersisted(raw: string): PasswordHash {
    if (!raw) {
      throw new Error('Password hash is required');
    }

    if (!raw.startsWith('$2')) {
      throw new Error('Unsupported password hash format');
    }

    return new PasswordHash(raw);
  }

  toString(): string {
    return this.value;
  }
}
