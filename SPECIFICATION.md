# EchoWave — V0.9.4 specification

## Purpose

EchoWave provides two distinct on-demand Stream Deck checks: an ICMP echo for reachability and an HTTP/HTTPS GET for a web endpoint's response. It is Windows-first; the ping executor and HTTP executor are separate application boundaries.

## Current behavior

| Area | Included behavior |
| --- | --- |
| Configuration | Each action has one required destination, visual theme selector, button display mode (`Animated theme` or `Custom icon + live text`), and per-key language preference (`Automatic`, `English`, or `Spanish`). Older keys default to animated theme. |
| Targets | IPv4, IPv6, DNS hostname, or a URL; URLs are reduced to their host. |
| Short press | Runs four Windows ICMP echo requests with a 1-second per-reply timeout; the subprocess is bounded to 15 seconds and 64 KiB of output. |
| Long press | At 650 ms it enters metrics mode; after release it shows average, loss, packets, min/max, and TTL at 1.65-second intervals without launching a check. Long hosts scroll during the review. |
| Persistence | The last result is stored in that action's Stream Deck settings. A completed check preserves newer theme/language choices and is discarded if the target changed while it ran. |
| States | `Ready`, `Pinging`, `Reachable`, `Degraded`, `Unreachable`, and `Error`. |
| Themes | Echo Wave, Minimal, Packet, Sonar, Terminal, Hexaza, Orbit, Network Mesh, Water Drop, Seismic, Particle Burst, Prism, Aurora Dark, Blueprint Light, Solar Light, Glass Dark, Neon Pulse, and Synthwave. The official free release uses Piotezaza's approved Hexaza background with credit; this source checkout uses a neutral fallback when that separately supplied PNG is absent. |
| Language | English and Spanish manifest metadata plus a per-key manual override for Property Inspector copy, validation, key states, and metric labels. `Automatic` follows the Stream Deck app language; English is the fallback. |
| Metrics | Original target, normalized host, resolved IP when supplied by Windows, sent/received/loss, min/avg/max milliseconds, TTL when available, timestamp, and status. |
| Web check | Separate `Check web service` action accepts a full HTTP/HTTPS URL. It sends GET with an eight-second timeout, does not follow redirects, and stops reading at response headers. |
| Web result | A status code and time to response headers in milliseconds; 2xx is OK, 3xx is redirect, 4xx/5xx is an HTTP error, and timeout/DNS/TLS/connection failures are distinct network errors. The URL, protocol, timestamp, and latest result are saved per key. |
| Web interaction | Short press checks once; long press/release cycles code or error, response time, protocol, and check time. Echo Wave, Terminal, Neon Pulse, Hexaza, Sonar, and Blueprint Light themes are available. The web Property Inspector includes a collapsible, bilingual guide to HTTP response codes and non-HTTP network errors. |
| Custom icons | Native Stream Deck title text overlays a user-selected icon. Text pulses during a check; saved metric pages put a short label above a value and temporarily omit the destination. Long targets move during checks and briefly after the result, then return as a shortened destination line. New keys default to centered, regular 10 px titles; user title-format settings can override those defaults. SVG waves and other theme imagery cannot overlay a custom icon. A user-defined title takes priority over the plugin title. |

## ICMP status rules

`Reachable` means at least one reply, zero packet loss, and average latency below 150 ms. `Degraded` means packet loss or an average latency of 150 ms or more. `Unreachable` means no replies. `Error` is reserved for validation, launch, or parser failures.

## Boundaries

EchoWave deliberately excludes remote execution, server-side agents, separate TCP and DNS diagnostic actions, history, charts, continuous monitoring, proactive alerts, and multi-target actions. The ping parser supports tested English and Spanish Windows `ping.exe` output and has a numeric-summary fallback for some other localizations; untested locale formats are not guaranteed. The error overlay is feedback for a failed on-demand action, not a monitoring alert.

## Architecture

```text
Stream Deck action
  -> PingService -> PingExecutor (Windows now; macOS/Linux later)
  -> parsed PingResult -> persisted action settings -> SVG theme renderer or native key title

Stream Deck web action
  -> HttpService -> HttpExecutor (Node fetch)
  -> HttpResult -> persisted action settings -> dedicated SVG renderer or native key title
```

Each action owns its press timing, Property Inspector validation, language preference, and persistence. Its application service owns result classification; the ping executor owns process invocation and parsing, while the web executor owns the HTTP request. Renderers consume typed results, not process output. Animated themes repeat during checks, and long targets scroll during checks and saved-result review. Theme or language changes re-render the saved result rather than replacing it with `Ready`. Themes are code-native SVG; the official Hexaza renderer additionally embeds Piotezaza's separately supplied raster background in both actions.
