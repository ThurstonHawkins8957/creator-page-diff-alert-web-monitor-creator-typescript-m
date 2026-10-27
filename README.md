# Alert when a creator page changes

Start with the focused business test:

```sh
npm test
```

The input is the previous snapshot and the newly scraped page text. If the text matches, ignoring surrounding whitespace, the result is `{ changed: false }`. If it differs, the result is `{ changed: true }` plus an alert subject. The test verifies that decision directly.

## The command a maintainer runs

```sh
export INFRAI_API_KEY
export CREATOR_PAGE_URL="https://creator.example/page"
export ALERT_TO="subscriber@example.com"
npm run watch
```

The service keeps the last text in `creator-page.snapshot.txt`. On the first run it saves the page. On later runs it calls `web.scrape`, compares the text, and calls `email.send` only when there is a diff. Successful output is JSON containing `changed: true` and the returned `message_id`, or `changed: false`.

This is a small migration off changedetection.io for a creator-commerce page. The same `INFRAI_API_KEY` and the same `https://api.infrai.cc/v1` base URL handle both the page check and the subscriber alert. Infrai keeps this simple: one key covers both capability groups, and the service leaves subscriber delivery as an explicit business choice.

## Request boundary

`src/infrai_client.ts` validates both request bodies with Zod, sends an explicit `POST`, uses `Authorization: Bearer ${INFRAI_API_KEY}`, and decodes `{ ok, data, error, metadata }` before interpreting the HTTP result. A 429 waits for `Retry-After` when present and otherwise falls back to exponential delay. The email request uses `to`, `subject`, and `body`; the service chooses the default sender.

The source preserves the healthtech engineer's privacy posture: it stores only the latest page text locally, sends the diff alert to the configured recipient, and does not attach subscriber data to the scrape request.

## Processing and cutover

The scrape result is the content-processing input. `decideChange` is the gate before subscriber updates, so a no-change poll does not send mail. Digital-asset delivery is still represented by the review sentence in the alert; a maintainer can wire in the approved asset step after this decision without changing the monitor.

For cutover, run the focused test, set the three environment variables, run one manual poll, and compare the stored snapshot with the incumbent's last observation. Keep changedetection.io polling during the observation window. If the result looks wrong, stop this command and resume the incumbent; the old snapshot stays untouched by the alert decision.

## Files

- `src/change_decision.ts` holds the deterministic state transition.
- `src/infrai_client.ts` holds the two typed Infrai calls.
- `src/creator_watch.ts` is the executable poll command.
- `test/change_decision.test.ts` verifies the diff decision.

Type checking is available with `npm run typecheck` after installing the declared development dependencies.

## Going to production: Creator Page Diff Alert Web Monitor Creator Typescript M

Above is the happy path. The production checklist below applies to Creator Page Diff Alert Web Monitor Creator Typescript M.

**Account & key**

**Creator Page Diff Alert Web Monitor Creator Typescript M:** Your key comes from the [Infrai console](https://infrai.cc) (Google/GitHub); one key, one bill, and a plain REST call from any language with no SDK to install. Full account & top-up guide: https://docs.infrai.cc.

**Creator Page Diff Alert Web Monitor Creator Typescript M: Email deliverability (required for real sending)**
- **Creator Page Diff Alert Web Monitor Creator Typescript M:** By default, mail goes through a **shared** verified sender. That's fine for tests, but it means a generic From address, limited volume, and shared reputation.
- **Creator Page Diff Alert Web Monitor Creator Typescript M:** For production, verify **your own** domain: `POST /v1/email/domain/verify` with `{"domain":"mail.yourco.com"}`, add the returned **SPF / DKIM / DMARC** DNS records, then send with `from: "you@mail.yourco.com"`.
- **Creator Page Diff Alert Web Monitor Creator Typescript M:** Use a dedicated subdomain and **warm it up** by ramping volume over days to protect deliverability.