# Security model

## Input and process execution

The configured target is normalized and validated before process creation. The Windows executor invokes `ping.exe` with `spawn`, `shell: false`, and a fixed argument array:

```text
ping.exe -n 4 -w 1000 <validated-host>
```

There is no shell command construction, no `exec`, and no concatenation of user input into a command line. Targets containing whitespace, control characters, shell-shaped syntax, invalid addresses, credentials, or unsupported URL forms are rejected. IPv4/IPv6 validity is checked with Node's IP parser. Each subprocess is capped at 15 seconds and 64 KiB of combined output; failures are surfaced as `Error` rather than leaving the key animating indefinitely.

## Data handling

Only each action's target/URL, theme, language preference, and most recent result are saved in Stream Deck action settings. These settings are local to the user profile but are plain text and can be included in profile exports. The web URL may contain a path or query; do not use tokens, passwords, or other secrets there. V0.8 has no telemetry and does not support URL credentials. A check cannot overwrite a newly edited target or revert mid-check theme/language changes.

## HTTP/HTTPS checks

The separate web action requires an explicit `http://` or `https://` URL and validates it before sending a request. It rejects whitespace, control characters, backslashes, credentials, fragments, and invalid hosts. Node's `fetch` sends GET directly with an eight-second timeout, no shell, no cookies, no redirect following, and no full-body download. It reports 3xx status codes instead of following `Location`, including cross-origin redirects. The user intentionally controls the destination, including local/private addresses; a check can therefore contact internal services from the local PC. It sends no HTTP authentication or custom headers. A GET can still have side effects on badly designed services, so enter only endpoints you intend to request.

The official free EchoWave installer includes the approved Hexaza background at `imgs/themes/hexaza/background.png`; the ping and web renderers read it locally and never modify or transmit it. Piotezaza permitted its use while EchoWave remains free and credits the creator. This source repository excludes the original PNG; local builds use a neutral fallback, and the release packaging command requires the approved artwork. The permission evidence is held privately; see [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md) for the credit and scope.

## Trust boundary

The plugin tests reachability from the computer that runs Stream Deck. It does not test connectivity from a server, a router, or another machine. A successful result is not proof that any other network path is healthy.

## Reporting a vulnerability

Do not publish exploitable details, tokens, or private targets in a public issue. Use GitHub's private vulnerability reporting when available; otherwise open a minimal issue asking the maintainer for a private contact method, without including the sensitive details.
