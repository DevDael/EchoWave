import { isIP } from "node:net";

export interface NormalizedTarget {
  original: string;
  host: string;
}

const hostnamePattern = /^(?=.{1,253}$)(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?)(?:\.(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?))*\.?$/i;
const ipv4Shaped = /^\d+(?:\.\d+){3}$/;

export class TargetValidationError extends Error {
  public constructor(message: string) {
    super(message);
    this.name = "TargetValidationError";
  }
}

export function normalizeTarget(value: unknown): NormalizedTarget {
  if (typeof value !== "string") throw new TargetValidationError("Target is required.");
  const original = value.trim();
  if (!original) throw new TargetValidationError("Target is required.");
  if (original.length > 2_048 || /[\u0000-\u001f\u007f\s]/.test(original)) {
    throw new TargetValidationError("Target contains unsupported characters.");
  }

  const candidate = toHostCandidate(original);
  const host = candidate.replace(/^\[(.*)]$/, "$1").replace(/\.$/, "").toLowerCase();
  if (!host || host.length > 253) throw new TargetValidationError("Target host is invalid.");
  if (host.includes(":")) {
    if (host.includes("%") || isIP(host) !== 6) throw new TargetValidationError("IPv6 address is invalid.");
  } else if (ipv4Shaped.test(host)) {
    if (isIP(host) !== 4) throw new TargetValidationError("IPv4 address is invalid.");
  } else if (!hostnamePattern.test(host) || host.startsWith("-") || host.endsWith("-")) {
    throw new TargetValidationError("Enter a valid hostname, IP address, or URL.");
  }

  return { original, host };
}

function toHostCandidate(value: string): string {
  if (value.includes("://")) {
    try {
      const url = new URL(value);
      if (!url.hostname || url.username || url.password) throw new TargetValidationError("URL must not include credentials.");
      return url.hostname;
    } catch (error) {
      if (error instanceof TargetValidationError) throw error;
      throw new TargetValidationError("URL is invalid.");
    }
  }
  if (/[/?#@]/.test(value)) throw new TargetValidationError("Use a full URL when including a path, port, or query.");
  return value;
}
