import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("configured legacy analytics cannot identify, track or clear a profile", async () => {
	const calls = [];
	globalThis.window = { op: (...args) => calls.push(args) };
	try {
		const analytics = await import(
			process.env.CAP_ANALYTICS_MODULE ||
				new URL("./analytics.ts", import.meta.url)
		);
		analytics.identifyUser({
			id: "PRIVATE_ID",
			email: "private@example.invalid",
			name: "PRIVATE_NAME",
			lastName: "PRIVATE_LAST_NAME",
		});
		analytics.trackEvent("private-event", { secret: "PRIVATE_VALUE" });
		analytics.resetUser();
		assert.deepEqual(calls, []);
	} finally {
		delete globalThis.window;
	}
});

test("web shells do not bootstrap OpenPanel or send signup identity actions", async () => {
	const layout = await readFile(
		new URL("../layout.tsx", import.meta.url),
		"utf8",
	);
	const identify = await readFile(
		new URL("../Layout/AnalyticsIdentify.tsx", import.meta.url),
		"utf8",
	);
	assert.doesNotMatch(
		layout,
		/OpenPanelComponent|NEXT_PUBLIC_OPENPANEL_CLIENT_ID/,
	);
	assert.doesNotMatch(
		identify,
		/identifyUser|checkAndMarkUserSignedUpTracked|useEffect/,
	);
	assert.match(layout, /data-product="cap"/);
	assert.match(layout, /data-privacy="strict"/);
});
