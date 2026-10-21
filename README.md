# 🩹 DriftPatch: Dependabot for API breaking changes

An MVP of YC's Fall 2026 Request for Startups, **Self-Maintaining APIs** (https://www.ycombinator.com/rfs). When a provider ships a breaking change, DriftPatch finds the affected lines in your code and proposes the fix as a unified diff, a `.patch` file or a pull request.

It is a fully static site, ready for GitHub Pages: no server, no keys.

## Use it
- **Paste code:** flagged lines, source links, a diff and a downloadable `.patch`.
- **Public repo:** enter `owner/repo`, or open `index.html?repo=owner/repo`. The browser lists the files with the unauthenticated GitHub API (2 requests) and fetches them from raw.githubusercontent.com.
- **GitHub Action:** `.github/workflows/driftpatch.yml` runs `scripts/driftpatch.js` on this repo or on any `target_repo` and opens a PR with `peter-evans/create-pull-request`. A target repo other than this one needs a `DRIFTPATCH_TOKEN` secret with write access.
- **CLI:** `node scripts/driftpatch.js <dir> [--write]`

## Rule packs (all real, all sourced)
| Pack | Source |
|---|---|
| OpenAI Python SDK v0 → v1 | https://github.com/openai/openai-python/discussions/742 |
| Pydantic v1 → v2 | https://docs.pydantic.dev/latest/migration/ |
| pandas 2.0 removals | https://pandas.pydata.org/docs/whatsnew/v2.0.0.html |
| Stripe API versions 2019-02-19, 2020-08-27, 2022-08-01, 2022-11-15 | https://docs.stripe.com/changelog |

Rules live in `rules.js`. The browser and Node both load this one file. Each rule has a regex, an optional mechanical replacement and a source URL. Rules without a safe mechanical fix are flagged only and point to the guide.

## Limitations
These are regex rules, not AST analysis, so expect some false positives and misses (aliased imports, for example). Multi-line semantic migrations, such as dict access to attribute access or Stripe's line_items, are flagged but not rewritten. Repo scans are capped at 150 files and limited to GitHub's 60 requests/hour. Only the default branch is scanned.

## Deploy
Push to GitHub, then go to Settings → Pages → deploy from branch `main`, folder `/`. The `.nojekyll` file is included.

---
Built by Satoshi Drops 🪂 [@SatoshiDropsHQ](https://x.com/SatoshiDropsHQ)
