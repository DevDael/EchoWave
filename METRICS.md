# Understanding EchoWave results

The **Echo target** action sends four ICMP echo requests **from the computer running Stream Deck**. It does not probe from a remote server, verify a website's HTTP response, or measure bandwidth. Use the separate **Check web service** action to inspect an HTTP/HTTPS response.

| Field | Meaning |
| --- | --- |
| Original target | The address or URL entered by the user. It is stored so the configuration remains recognizable. |
| Host | The hostname or IP actually passed to Windows `ping.exe`. For a URL, the scheme, port, path, and query are removed. |
| Resolved IP | The IP shown by Windows after resolving a hostname, if present. It may change between checks or be absent when resolution fails. |
| Sent / received | Number of echo requests issued and echo replies counted by Windows. `4 / 4` means all four replied; it does not prove that an application service is working. |
| Packet loss | Percentage of sent requests without a reply. `0%` means no loss in this brief four-packet sample; `100%` means no replies. |
| Min / avg / max latency | Shortest, arithmetic average, and longest round-trip time among replies, in milliseconds (`ms`). Lower usually means a faster response, but four packets are too few to characterize long-term performance. These fields may be unavailable without replies. |
| TTL | The Time To Live value reported in the last reply, when Windows supplies it. It is a remaining hop budget, **not** a reliable hop count or distance measurement. |
| Timestamp | When EchoWave completed the check, stored as an ISO 8601 UTC timestamp. |
| Status | A summary of this one local ICMP check; see below. |

`Reachable` means at least one reply, no packet loss, and average latency below 150 ms. `Degraded` means at least one reply but some loss or average latency of 150 ms or more. `Unreachable` means no echo replies. `Error` means input validation, process execution, or output parsing failed; packet counts and loss shown with an error must not be interpreted as a completed network measurement. `Ready` and `Pinging` are UI states, not outcomes.

ICMP can be blocked or deprioritized by firewalls and hosts. A red result does not by itself prove the machine is powered off; a green result does not prove internet access, DNS health, or that a web service is available.

## Web-service result

The web action sends one GET to the complete configured URL. Its `HTTP 200`-style code is the server's actual response status: 2xx indicates the request succeeded, 3xx indicates a redirect (not followed), and 4xx/5xx indicates an application/server HTTP response that should be investigated. A 503 still proves an HTTP server responded; it does **not** mean the host is unreachable. The displayed `ms` is elapsed time until response headers arrive, **not** ICMP round-trip time, full-page load time, or bandwidth. `TIMEOUT`, DNS, TLS, and connection errors mean no usable HTTP response was obtained. The saved time records completion of that one check. This action does not inspect the page content, follow redirects, or guarantee that every function of a website works.
