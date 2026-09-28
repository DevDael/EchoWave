export type DisplayMode = "visual" | "custom-icon";

export function parseDisplayMode(value: unknown): DisplayMode {
  return value === "custom-icon" ? "custom-icon" : "visual";
}
