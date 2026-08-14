# Cribl Identity Checker

A Cribl app that shows the signed-in user everything that defines their access in Cribl:

- **Identity** — name, username, email, and user ID (from `window.getCriblUser()`).
- **Roles** — the roles currently granting you access, enriched with each role's title, description, tags, and policy count.
- **Teams** — the teams you belong to and the roles those teams grant.
- **Policies** — your effective authorization policy: every object you can act on and which actions are allowed, with a quick filter.

## How it works

The app reads from the Cribl platform API through the app fetch proxy (auth is injected automatically):

| Data | Endpoint |
|---|---|
| Effective roles | `GET /authorize/roles` |
| Effective policy | `GET /authorize/policy` |
| Role definitions (enrichment) | `GET /system/roles` |
| Teams | `GET /system/teams` |
| Team membership | `GET /system/teams/{id}/users` |

These paths are declared in `config/policies.yml`. Every piece degrades gracefully: if an
enrichment call is not permitted, the core data still renders and a non-blocking warning is shown.

All endpoints used are available on both Cribl Cloud and on-prem deployments.

## Install in Cribl

In the Cribl UI, go to **Apps -> Install App** and use one of the following.

### Import from File

1. Open the repo's GitHub Releases and download `cc-whoami-X.Y.Z.tgz` for the version you want.
2. Choose **Import from File** and upload the `.tgz`.

### Import from Git

1. Choose **Import from Git**.
2. Set **URL** to `https://github.com/gcribl/cc-whoami.git`.
3. Set **Branch or tag** to `latest` (recommended — always the newest release) or a specific tag (e.g. `v1.0.3`). Leaving it blank causes the import to fail.

Each release tag carries the built app layout (`static/`, `default/`, `package.json`) at the repo root, so a clone at the tag is directly installable.

## Development

```bash
npm run dev      # start the dev server (platform APIs are unavailable locally)
npm run build    # type-check and build for production
npm run lint     # run oxlint
npm run package  # build and produce an installable app archive
```

> When running locally with `npm run dev`, the Cribl platform globals are not present, so the
> app shows an informational notice. Run it inside Cribl to see live data.
