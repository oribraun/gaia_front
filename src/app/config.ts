export class Config {
  private _staticServerPath = '';

  get staticServerPath(): string {
    return this._staticServerPath;
  }

  set staticServerPath(value: string) {
    this._staticServerPath = value;
  }
}
