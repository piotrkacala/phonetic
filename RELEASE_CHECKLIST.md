# Release Checklist

## Pre-release

1. Confirm branch is up to date and CI passes.
2. Run local validation:
   - `npm run lint`
   - `npm test`
   - `npm run build`
3. Review `README.md` and `CHANGELOG.md` for accuracy.
4. Verify `package.json` version is correct.

## Publish

1. Commit release changes.
2. Tag release:
   - `git tag v1.0.0`
3. Push branch and tag:
   - `git push`
   - `git push --tags`
4. Deploy:
   - `npm run deploy`

## Post-release

1. Open deployed app URL and smoke test:
   - setup flow
   - quiz start/finish
   - summary/high score
2. Create GitHub release notes from `CHANGELOG.md`.

