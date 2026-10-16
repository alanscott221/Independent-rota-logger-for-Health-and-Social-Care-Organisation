# Security

Rota Logger is a static, offline, client-side app. By design it has:

- no server, account, login or analytics, and no network requests (enforced by a Content-Security-Policy)
- no third-party scripts, fonts, CDNs or packages
- no connection to any employer or Microsoft 365 system
- data stored only in the user's own browser (localStorage) on their own device

**The app never asks for a password, bank details or any personal information. If something claiming to be Rota Logger asks for these, it is not this app.** Only use the official link shared by the maintainer.

Do not enter names or personal details of people you support in the Notes field.

## Reporting a problem
Please report suspected vulnerabilities privately (GitHub: Security → Report a vulnerability) rather than in a public issue.

## Verifying your copy
`SHA256SUMS.txt` lists the hash of each file in the release.
