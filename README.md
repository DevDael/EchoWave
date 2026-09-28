# EchoWave

EchoWave is a free Stream Deck plugin for on-demand ICMP and HTTP/HTTPS checks. This public repository contains the original source code, tests, and a clean Git history. The free Marketplace plugin also includes the Hexaza visual background by Piotezaza with permission and attribution; the original PNG is not redistributed as a standalone file in this repository.

![Status: V0.9.4](https://img.shields.io/badge/status-V0.9.4-38bdf8)
![Platform: Windows](https://img.shields.io/badge/platform-Windows%2010%2B-0078d4)

Two focused Stream Deck actions: **Echo target** sends a four-packet ICMP ping; **Check web service** sends one HTTP/HTTPS GET and reports its actual status code. Configure one destination per key, tap to check, or hold briefly and release to review the saved result.

> Both checks run from the computer running Stream Deck, not from a remote server. A successful ICMP echo does not establish that a website works; the web action checks HTTP separately.

## Portfolio highlights

- Purposefully small interaction: one target, one key, immediate visual outcome.
- Clean separation between Stream Deck integration, ping application logic, Windows execution/parsing, and SVG presentation themes.
- Safe execution model: validated host input, `spawn`, no shell, and no command-string interpolation.
- Durable per-key result persistence with a deliberately bounded data model.
- English and Spanish Stream Deck metadata, Property Inspector copy, key states, and metric labels.

## What V0.9.4 supports

Both actions now offer **Button display → Custom icon + live text**. Choose an icon using Stream Deck's Icon Library, enable this mode on the action, and leave Stream Deck's own Title field empty. EchoWave updates the native title above the icon with status, result, destination, and the hold/release metric pages. During a check, a small text pulse (`○ ◎ ◉ ◎`) animates in place of the SVG waves. Metric pages use a compact label above a value (for example `LOSS` over `0%`), without squeezing a host onto the same page. New keys default to a centered, regular 10 px title; existing keys may retain their own title-format settings, which can be changed with Stream Deck's **T** control. Long destinations move through the title during the check and briefly after the result; metric pages prioritize the value, then the destination returns. The icon remains user-controlled and is not imported into the plugin. To return to **Animated theme** mode, remove the user-selected icon in Stream Deck; otherwise it continues to hide the SVG waves.

The existing ICMP action retains its 18 themes and behavior. The web action takes a complete `http://` or `https://` URL (including path and query), offers Echo Wave, Terminal, Neon Pulse, Hexaza, Sonar, and Blueprint Light themes, and uses the same per-key English/Spanish language control. A short press sends a GET, measures time to response headers, and shows `HTTP 200`, `HTTP 302`, `HTTP 503`, or a network failure such as `TIMEOUT`. Redirects are reported but never followed. Hold and release to cycle through code/error, response time, protocol, and check time. The last web result is saved per key. Hexaza credits Piotezaza when selected in either action.

The web check has an eight-second timeout and deliberately does not download the whole response body. It is an on-demand check, not continuous monitoring or a browser-equivalent test. Avoid secrets in URLs: complete URLs, including queries, are stored in local Stream Deck settings and may be included in exported profiles.

The web action's Property Inspector includes a collapsible English/Spanish guide to HTTP status groups and common codes. It distinguishes a server response such as `HTTP 404` or `HTTP 503` from transport failures such as `TIMEOUT`, `DNS ERROR`, or `TLS ERROR`.

### Echo target (ICMP)

| Interaction | Result |
| --- | --- |
| Configure | IPv4, IPv6, hostname, or URL; a URL is normalized to its hostname. |
| Tap | Animates continuously for the full ping and stores sent/received/loss, latency, TTL where available, resolved IP where available, timestamp, and status. Long normalized hosts scroll during the check and for six seconds after its result. |
| Hold and release (650 ms) | Shows average latency, loss, received/sent packets, min/max latency, and TTL automatically at 1.65-second intervals; long saved hosts scroll throughout the review. |
| Themes | Eighteen themes. Dark/signature: `Echo Wave`, `Minimal`, `Packet`, `Sonar`, `Terminal`, `Hexaza`, `Orbit`, `Network Mesh`, `Water Drop`, `Seismic`, `Particle Burst`, `Prism`, `Aurora Dark`, `Glass Dark`, a high-glow `Neon Pulse`, and retro `Synthwave`. Light: `Blueprint Light` and `Solar Light`. |
| Language | English and Spanish metadata, configuration copy, validation feedback, key states, and metrics. Each key can follow Stream Deck automatically or manually select English or Spanish. |

`Reachable` is a clean response. `Degraded` means packet loss or average latency of at least 150 ms. `Unreachable` means no reply. `Error` represents invalid input or a local execution/parser failure.

For the meaning and limitations of every metric, read [METRICS.md](METRICS.md).

## Development

Prerequisites: Windows 10+, Node.js 24+, Stream Deck 7.1+ and a Stream Deck device or the Stream Deck app in developer mode.

```powershell
npm install
npm run validate
npm run link
npm run dev
```

`npm run validate` works from a clean clone. Without the separately supplied original Hexaza PNG, local development uses a neutral gradient behind the Hexaza corner and pulse code. The official free Marketplace package retains Piotezaza's approved background; this source repository intentionally does not publish that PNG on its own. `npm run package:public` refuses to create a release installer until the exact approved artwork is present at `com.devdael.echowave.sdPlugin/imgs/themes/hexaza/background.png`. Do not substitute another artwork or claim it is covered by the code license. Packaging does not install its output.

The current build bounds each Windows ping to 15 seconds and 64 KiB of combined process output. A genuine execution/parse failure shows Stream Deck's alert overlay; an ordinary unanswered ICMP check remains `Unreachable`. Changes to theme or language made while a check is running are retained, and a result for an old target is never attached to a newly entered target. The distributed plugin declares its CommonJS module boundary explicitly; the build/package scripts include a startup smoke test so a development link cannot silently turn the bundled entry point into an ES module.

If a packaged installer does not open after a Stream Deck update, close and reopen Stream Deck, run `npm run link` for the local development copy, and verify it with `streamdeck list`. The official development link is a directory junction, so subsequent builds are immediately available to Stream Deck without reinstalling the package.

## Project layout

```text
src/actions/                 Stream Deck key interaction
src/application/             orchestration and status rules
src/domain/                  target/result contracts
src/infrastructure/ping/     platform executors and parsers
src/presentation/themes/     self-contained SVG renderers
src/settings/                persisted action settings
com.devdael.echowave.sdPlugin/    public manifest, icons, and property inspectors
test/                        parser, normalizer, and application tests
```

## Verification boundaries

The automated suite verifies normalization, English/Spanish Windows-output parsing, status rules, theme rendering, localization, and HTTP responses using a local test server. The project owner separately accepted the release behavior on a physical Stream Deck. Automated checks alone cannot prove device legibility or network conditions for every user.

## Security and scope

Read [SECURITY.md](SECURITY.md) before distribution. The V0.9.4 behavior and intentional exclusions are recorded in [SPECIFICATION.md](SPECIFICATION.md).

## Support

For usage questions and reproducible bugs, open a [GitHub issue](https://github.com/DevDael/EchoWave/issues). Do not put secrets, private URLs, or vulnerability details in public issues.

## License

The original EchoWave code and documentation are under the [MIT License](LICENSE). The Hexaza name and visuals belong to Piotezaza and are **not** licensed under MIT by this repository. See [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md).
