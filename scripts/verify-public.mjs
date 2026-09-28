import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
import { join, relative, sep } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../", import.meta.url));
const publicDir = join(root, "com.devdael.echowave.sdPlugin");
const released = JSON.parse(await readFile(join(publicDir, "manifest.json"), "utf8"));

assert.equal(released.UUID, "com.devdael.echowave");
assert.equal(released.Name, "EchoWave");
assert.equal(released.Author, "DevDael");
assert.equal(released.Version, "0.9.4.0");
assert.deepEqual(released.Actions.map((action) => action.UUID), [
  "com.devdael.echowave.ping",
  "com.devdael.echowave.http"
]);

const publicFiles = await listFiles(publicDir);
for (const file of publicFiles) {
  const name = relative(publicDir, file).split(sep).join("/");
  assert.doesNotMatch(name, /\.map$/, `Source map should not ship publicly: ${name}`);
  if (!/\.(?:js|json|html|css|svg)$/.test(name)) continue;
  const body = await readFile(file, "utf8");
  assert.ok(!/com\.ingeniero\.ping-stream-deck/i.test(body), `Legacy UUID in ${name}`);
  assert.ok(!/EchoWaveLegacy/i.test(body), `Legacy name in ${name}`);
}

const bundle = await readFile(join(publicDir, "bin/plugin.js"), "utf8");
assert.ok(bundle.includes('pluginUuid = "com.devdael.echowave"'), "Public runtime UUID is missing.");
assert.ok(bundle.includes('pluginUuid}.ping'), "Public ping action is missing.");
assert.ok(bundle.includes('pluginUuid}.http'), "Public HTTP action is missing.");
const publicInspector = await readFile(join(publicDir, "ui/ping.html"), "utf8");
assert.equal((publicInspector.match(/<option value="/g) ?? []).length, 18);
assert.match(publicInspector, /<option value="hexaza">Hexaza<\/option>/);
assert.match(publicInspector, /https:\/\/x\.com\/Piotezaza/);
assert.match(bundle, /imgs["', +]+themes["', +]+hexaza/);
const publicWebInspector = await readFile(join(publicDir, "ui/http.html"), "utf8");
assert.equal((publicWebInspector.match(/<option value="(?:echo-wave|terminal|neon|hexaza|sonar|blueprint-light)"/g) ?? []).length, 6);
assert.match(publicWebInspector, /https:\/\/x\.com\/Piotezaza/);
assert.match(publicWebInspector, /<details id="http-guide"/);
assert.match(publicWebInspector, /id="http-code-200"/);
assert.match(publicWebInspector, /id="http-code-503"/);
const publicWebInspectorScript = await readFile(join(publicDir, "ui/http.js"), "utf8");
assert.match(publicWebInspectorScript, /¿Qué significan HTTP 200, 404 y 503\?/);
console.log("Public identity, actions, six web themes, attribution, and HTTP guide verified.");

async function listFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = await Promise.all(entries.map((entry) => {
    const path = join(directory, entry.name);
    return entry.isDirectory() ? listFiles(path) : [path];
  }));
  return files.flat();
}
