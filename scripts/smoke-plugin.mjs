import { spawnSync } from "node:child_process";
import { mkdtempSync, realpathSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../", import.meta.url));
const plugin = join(root, "com.devdael.echowave.sdPlugin", "bin/plugin.js");
// The SDK logs missing registration arguments itself; this checks module loading.
const temporaryDirectory = mkdtempSync(join(tmpdir(), "echowave-smoke-"));
let result;
try {
  result = spawnSync(process.execPath, [plugin], {
    cwd: temporaryDirectory,
    encoding: "utf8",
    timeout: 5_000,
    windowsHide: true
  });
} finally {
  const resolvedDirectory = realpathSync(temporaryDirectory);
  const expectedPrefix = join(realpathSync(tmpdir()), "echowave-smoke-");
  if (!resolvedDirectory.startsWith(expectedPrefix)) throw new Error("Unexpected smoke-test directory; refusing cleanup.");
  rmSync(resolvedDirectory, { recursive: true, force: true });
}
if (result.error || result.status !== 0 || result.stderr.trim()) {
  throw new Error(`EchoWave failed to load: ${result.error?.message || result.stderr.trim() || `exit ${result.status}`}`);
}
console.log("EchoWave entry point loads under Node.js.");
