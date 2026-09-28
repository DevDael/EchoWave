import assert from "node:assert/strict";
import test from "node:test";
import { WindowsPingParseError, parseWindowsPing } from "../src/infrastructure/ping/windows-ping-parser.js";

const successfulPing = `
Pinging dns.google [8.8.8.8] with 32 bytes of data:
Reply from 8.8.8.8: bytes=32 time=13ms TTL=117
Reply from 8.8.8.8: bytes=32 time=14ms TTL=117
Reply from 8.8.8.8: bytes=32 time=12ms TTL=117
Reply from 8.8.8.8: bytes=32 time=15ms TTL=117

Ping statistics for 8.8.8.8:
    Packets: Sent = 4, Received = 4, Lost = 0 (0% loss),
Approximate round trip times in milli-seconds:
    Minimum = 12ms, Maximum = 15ms, Average = 13ms
`;

test("parses a successful Windows ping summary", () => {
  assert.deepEqual(parseWindowsPing(successfulPing), {
    resolvedIp: "8.8.8.8",
    sent: 4,
    received: 4,
    packetLoss: 0,
    minLatencyMs: 12,
    maxLatencyMs: 15,
    avgLatencyMs: 13,
    ttl: 117
  });
});

test("parses an unreachable target without a timing summary", () => {
  const result = parseWindowsPing(`Pinging 192.0.2.1 with 32 bytes of data:\nRequest timed out.\n\nPing statistics for 192.0.2.1:\n    Packets: Sent = 4, Received = 0, Lost = 4 (100% loss),`);
  assert.deepEqual(result, { resolvedIp: "192.0.2.1", sent: 4, received: 0, packetLoss: 100 });
});

test("rejects output without a packet summary", () => {
  assert.throws(() => parseWindowsPing("ping is unavailable"), WindowsPingParseError);
});

test("parses Spanish Windows ping output", () => {
  const result = parseWindowsPing(`
Haciendo ping a dns.google [8.8.8.8] con 32 bytes de datos:
Respuesta desde 8.8.8.8: bytes=32 tiempo=12ms TTL=117

Estadísticas de ping para 8.8.8.8:
    Paquetes: enviados = 4, recibidos = 4, perdidos = 0
    (0% perdidos),
Tiempos aproximados de ida y vuelta en milisegundos:
    Mínimo = 10ms, Máximo = 14ms, Media = 12ms
`);
  assert.deepEqual(result, {
    resolvedIp: "8.8.8.8",
    sent: 4,
    received: 4,
    packetLoss: 0,
    minLatencyMs: 10,
    maxLatencyMs: 14,
    avgLatencyMs: 12,
    ttl: 117
  });
});

test("tolerates OEM-decoded Spanish accents", () => {
  const result = parseWindowsPing(`Haciendo ping a 127.0.0.1 con 32 bytes de datos:\nRespuesta desde 127.0.0.1: bytes=32 tiempo<1m TTL=128\nPaquetes: enviados = 1, recibidos = 1, perdidos = 0\n    (0% perdidos),\nM�nimo = 0ms, M�ximo = 0ms, Media = 0ms`);
  assert.equal(result.avgLatencyMs, 0);
  assert.equal(result.ttl, 128);
});

test("parses ordered numeric summaries with unfamiliar Windows labels", () => {
  const result = parseWindowsPing(`Ping wird ausgefuehrt fuer beispiel.test [203.0.113.7] mit 32 Bytes Daten:\nAntwort von 203.0.113.7: Bytes=32 Zeit=11ms TTL=53\nPakete: Gesendet = 4, Empfangen = 3, Verloren = 1\n    (25% Verlust),\n    Minimum = 10ms, Maximum = 16ms, Mittelwert = 12ms`);
  assert.deepEqual(result, {
    resolvedIp: "203.0.113.7",
    sent: 4,
    received: 3,
    packetLoss: 25,
    minLatencyMs: 10,
    maxLatencyMs: 16,
    avgLatencyMs: 12,
    ttl: 53
  });
});
