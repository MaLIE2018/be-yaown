export function base64(input: string) {
  return new Buffer(input).toString("base64");
}
