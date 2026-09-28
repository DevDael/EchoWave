import { normalizeTarget, TargetValidationError } from "./target.js";

export interface HttpTarget {
  original: string;
  url: string;
  displayTarget: string;
  host: string;
  protocol: "http" | "https";
}

/** A web check needs the complete URL; unlike ICMP, its path and query are sent. */
export function normalizeHttpTarget(value: unknown): HttpTarget {
  if (typeof value !== "string") throw new TargetValidationError("A complete HTTP or HTTPS URL is required.");
  const original = value.trim();
  if (!original || original.length > 2_048 || /[\u0000-\u001f\u007f\s\\]/.test(original)) {
    throw new TargetValidationError("A complete HTTP or HTTPS URL is required.");
  }
  if (!/^https?:\/\//i.test(original)) throw new TargetValidationError("Use a URL beginning with http:// or https://.");

  let parsed: URL;
  try {
    parsed = new URL(original);
  } catch {
    throw new TargetValidationError("HTTP or HTTPS URL is invalid.");
  }
  if ((parsed.protocol !== "http:" && parsed.protocol !== "https:") || !parsed.hostname || parsed.username || parsed.password || parsed.hash || parsed.port === "0") {
    throw new TargetValidationError("URL must not contain credentials, a fragment, or an invalid port.");
  }
  const host = normalizeTarget(parsed.hostname).host;
  const path = parsed.pathname === "/" && !parsed.search ? "" : `${parsed.pathname}${parsed.search}`;
  return {
    original,
    url: parsed.toString(),
    displayTarget: `${parsed.host}${path}`,
    host,
    protocol: parsed.protocol === "https:" ? "https" : "http"
  };
}
