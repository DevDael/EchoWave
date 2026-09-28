import assert from "node:assert/strict";
import test from "node:test";
import { TargetValidationError, normalizeTarget } from "../src/domain/target.js";

test("normalizes a hostname", () => {
  assert.deepEqual(normalizeTarget("  NAS-01.corp.local.  "), { original: "NAS-01.corp.local.", host: "nas-01.corp.local" });
});

test("extracts a host from a URL", () => {
  assert.deepEqual(normalizeTarget("https://Example.com:8443/status?ok=true"), { original: "https://Example.com:8443/status?ok=true", host: "example.com" });
});

test("accepts IPv4 and bracketed IPv6", () => {
  assert.equal(normalizeTarget("192.168.1.25").host, "192.168.1.25");
  assert.equal(normalizeTarget("[2001:db8::1]").host, "2001:db8::1");
  assert.equal(normalizeTarget("::1").host, "::1");
  assert.equal(normalizeTarget("::ffff:192.0.2.1").host, "::ffff:192.0.2.1");
  assert.equal(normalizeTarget("https://[2001:db8::1]:8443/status").host, "2001:db8::1");
});

test("rejects shell-shaped and malformed input", () => {
  for (const input of ["", "host & whoami", "-n 1 example.com", "999.1.1.1", "01.2.3.4", "2001:db8:::1", "fe80::1%eth0", "https://user:pass@example.com"]) {
    assert.throws(() => normalizeTarget(input), TargetValidationError);
  }
});
