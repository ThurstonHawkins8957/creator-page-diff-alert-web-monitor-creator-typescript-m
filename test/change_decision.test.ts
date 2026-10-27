import assert from "node:assert/strict";
import { decideChange } from "../src/change_decision.ts";

const unchanged = decideChange("member updates", " member updates ", "https://creator.example/page");
assert.equal(unchanged.changed, false);

const changed = decideChange("old release", "new release", "https://creator.example/page");
assert.equal(changed.changed, true);
assert.match(changed.subject, /Creator page changed/);
assert.match(changed.body, /new release/);
console.log("change decision test passed");
