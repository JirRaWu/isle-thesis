export class AiClientError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AiClientError";
  }
}
