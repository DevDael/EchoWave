import { isIP } from "node:net";
import type { PingMeasurements } from "../../domain/ping-result.js";

export class WindowsPingParseError extends Error {
  public constructor(message: string) {
    super(message);
    this.name = "WindowsPingParseError";
  }
}

/** Reads English/Spanish labels first, then Windows' ordered numeric summaries for other locales. */
export function parseWindowsPing(output: string): PingMeasurements {
  const header = output.split(/\r?\n/).find((line) => line.trim()) ?? "";
  const knownIp = output.match(/(?:Pinging|Haciendo ping a)\s+.+?\s+\[([^\]]+)]/i)?.[1]
    ?? output.match(/(?:Pinging|Haciendo ping a)\s+([^\s:]+)(?:\s+(?:with|con)|:)/i)?.[1];
  const headerIp = header.match(/\[([^\]]+)]/)?.[1] ?? header.match(/(?:\d{1,3}\.){3}\d{1,3}/)?.[0];
  const ipCandidate = knownIp ?? headerIp;
  const resolvedIp = ipCandidate && isIP(ipCandidate) ? ipCandidate : undefined;
  const packetSummary = output.match(/(?:Packets|Paquetes):\s*(?:Sent|enviados)\s*=\s*(\d+),\s*(?:Received|recibidos)\s*=\s*(\d+),\s*(?:Lost|perdidos)\s*=\s*(\d+)\s*\r?\n?\s*\((\d+)%\s*(?:loss|perdidos)\)/i)
    ?? output.match(/^\s*[^\r\n=]+?=\s*(\d+)\s*,\s*[^\r\n=]+?=\s*(\d+)\s*,\s*[^\r\n=]+?=\s*(\d+)\s*\r?\n?\s*\((\d+)\s*%[^\r\n)]*\)/im);
  if (!packetSummary) throw new WindowsPingParseError("Windows ping did not return a packet summary.");

  const sent = Number(packetSummary[1]);
  const received = Number(packetSummary[2]);
  const loss = Number(packetSummary[4]);
  // OEM code pages may decode accented Spanish labels as replacement characters.
  const timing = output.match(/(?:Minimum|M.nimo)\s*=\s*(\d+)ms,\s*(?:Maximum|M.ximo)\s*=\s*(\d+)ms,\s*(?:Average|Media|Promedio)\s*=\s*(\d+)ms/i)
    ?? output.match(/^\s*[^\r\n=]+?=\s*(\d+)\s*ms\s*,\s*[^\r\n=]+?=\s*(\d+)\s*ms\s*,\s*[^\r\n=]+?=\s*(\d+)\s*ms/im);
  const ttlMatches = [...output.matchAll(/TTL[=<>](\d+)/gi)].map((match) => Number(match[1]));

  return {
    ...(resolvedIp ? { resolvedIp } : {}),
    sent,
    received,
    packetLoss: loss,
    ...(timing ? { minLatencyMs: Number(timing[1]), maxLatencyMs: Number(timing[2]), avgLatencyMs: Number(timing[3]) } : {}),
    ...(ttlMatches.length ? { ttl: ttlMatches[ttlMatches.length - 1] } : {})
  };
}
