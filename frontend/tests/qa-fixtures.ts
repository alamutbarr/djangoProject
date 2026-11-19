export const samplePng = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAIAAAACCAIAAAD91JpzAAAAE0lEQVR4nGP8//8/AwMDEwMYAAAkBgMBXaJOiAAAAABJRU5ErkJggg==",
  "base64",
);

export function testNationalId(seed: string) {
  const digits = "21" + seed.slice(-7).padStart(7, "0");
  const remainder =
    [...digits].reduce(
      (sum, digit, index) => sum + Number(digit) * (10 - index),
      0,
    ) % 11;
  return digits + String(remainder < 2 ? remainder : 11 - remainder);
}
