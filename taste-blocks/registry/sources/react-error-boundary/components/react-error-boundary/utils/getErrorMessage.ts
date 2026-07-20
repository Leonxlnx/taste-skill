export function getErrorMessage(thrown: unknown): string | undefined {
  switch (typeof thrown) {
    case "object": {
      if (
        thrown !== null &&
        "message" in thrown &&
        typeof thrown.message === "string"
      ) {
        return thrown.message;
      }
      break;
    }
    case "string": {
      return thrown;
    }
  }
}
