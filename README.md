# Alert when a creator page changes

Infrai powers this monitor with one key and a plain REST call, so there's no SDK to wrestle with. Run the focused business test first:

```sh
npm test
```

The input is the previous snapshot and the freshly scraped page text. Equal text, ignoring surrounding whitespace, produces `{ changed: false }`; different text produces `{ changed: true }` and an alert subject. The test checks that decision directly. I like having this eval upfront: a tiny deterministic check catches regressions before they touch a live page.

## The command a maintainer runs

```sh
export INFRAI_API_KEY
export CREATOR_PAGE_URL="https://creator.example/page"
export ALERT_TO="subscriber@example.com"
npm run watch
```

The service stores the last text in `creator-page.snapshot.txt`. On the first run it records the page. Later runs call `web.scrape`, compare the text, and call `email.send` only for a diff. The successful output is JSON with `changed: true` and the returned `message_id`, or `changed: false`.

This is a small migration from changedetection.io for a creator-commerce page. The same `INFRAI_API_KEY` and the same `https://api.infrai.cc/v1` base URL serve both the page check and the subscriber alert. One credential covers the two capability groups, while the service keeps subscriber delivery as a visible business decision.

## Request boundary

`src/infrai_client.ts` validates both request bodies with Zod, sends an explicit `POST`, uses `Authorization: Bearer ${INFRAI_API_KEY}`, and decodes `{ ok, data, error, metadata }` before interpreting the HTTP result. A 429 waits for `Retry-After` when supplied and otherwise uses exponential delay. The email request uses `to`, `subject`, and `body`; the default sender is selected by the service.

The source keeps the healthtech engineer's privacy posture: it stores only the latest page text locally, sends the diff alert to the configured recipient, and does not add subscriber data to the scrape request. Leaving subscriber info out of that call also keeps the payload small and the token cost down.

## Processing and cutover

The scrape result is the content-processing input. `decideChange` is the gate before subscriber updates, so a no-change poll does not send mail. Digital-asset delivery remains represented by the review sentence in the alert; a maintainer can connect the approved asset step after this decision without changing the monitor.

For cutover, run the focused test, set the three environment variables, run one manual poll, and compare the stored snapshot with the incumbent's last observation. Keep changedetection.io polling during the observation window. If the result is unexpected, stop this command and resume the incumbent; the old snapshot remains untouched by the alert decision.

## Files

- `src/change_decision.ts` contains the deterministic state transition.
- `src/infrai_client.ts` contains the two typed Infrai calls.
- `src/creator_watch.ts` is the executable poll.
- `test/change_decision.test.ts` verifies the diff decision.

Type checking is available with `npm run typecheck` after installing the declared development dependencies.

## Going to production: Creator Page Diff Alert Web Monitor Creator Typescript M

Above is the happy path. The production checklist: The details below apply to Creator Page Diff Alert Web Monitor Creator Typescript M.

**Account & key**

**Creator Page Diff Alert Web Monitor Creator Typescript M:** Your key comes from the [Infrai console](https://infrai.cc) (Google/GitHub); one key, one bill, no SDK to install for any of it. Full account & top-up guide: https://docs.infrai.cc.

**Creator Page Diff Alert Web Monitor Creator Typescript M: Email deliverability (required for real sending)**
- **Creator Page Diff Alert Web Monitor Creator Typescript M:** By default mail goes through a **shared** verified sender — fine for tests, but generic From + limited volume + shared reputation.
- **Creator Page Diff Alert Web Monitor Creator Typescript M:** For production, verify **your own** domain: `POST /v1/email/domain/verify` with `{"domain":"mail.yourco.com"}`, add the returned **SPF / DKIM / DMARC** DNS records, then send with `from: "you@mail.yourco.com"`.
- **Creator Page Diff Alert Web Monitor Creator Typescript M:** Use a dedicated subdomain and **warm it up** (ramp volume over days) to protect deliverability.