import { describe, expect, it } from "vitest";
import { authPageHref, getSafeNextPath } from "@/app/(org)/safe-next";

const ORIGIN = "https://cap.so";

describe("getSafeNextPath", () => {
	it("returns the default for missing values", () => {
		expect(getSafeNextPath(undefined, ORIGIN)).toBe("/dashboard");
		expect(getSafeNextPath(null, ORIGIN)).toBe("/dashboard");
		expect(getSafeNextPath("", ORIGIN)).toBe("/dashboard");
	});

	it("keeps same-origin paths with query and hash", () => {
		expect(getSafeNextPath("/dashboard/caps?foo=1#bar", ORIGIN)).toBe(
			"/dashboard/caps?foo=1#bar",
		);
		expect(getSafeNextPath("https://cap.so/settings", ORIGIN)).toBe(
			"/settings",
		);
	});

	it("uses the first value when next is repeated", () => {
		expect(getSafeNextPath(["/a", "/b"], ORIGIN)).toBe("/a");
	});

	it("rejects cross-origin and protocol-relative URLs", () => {
		expect(getSafeNextPath("https://evil.com/x", ORIGIN)).toBe("/dashboard");
		expect(getSafeNextPath("//evil.com/x", ORIGIN)).toBe("/dashboard");
		expect(getSafeNextPath("javascript:alert(1)", ORIGIN)).toBe("/dashboard");
	});

	it("rejects paths that normalize to protocol-relative URLs", () => {
		expect(getSafeNextPath("/.//evil.com", ORIGIN)).toBe("/dashboard");
		expect(getSafeNextPath("/..//evil.com", ORIGIN)).toBe("/dashboard");
		expect(getSafeNextPath("/%2e//evil.com", ORIGIN)).toBe("/dashboard");
		expect(getSafeNextPath("/./%2e//evil.com/path?x=1", ORIGIN)).toBe(
			"/dashboard",
		);
		expect(getSafeNextPath("https://cap.so//evil.com", ORIGIN)).toBe(
			"/dashboard",
		);
		expect(getSafeNextPath("/\\evil.com", ORIGIN)).toBe("/dashboard");
	});
});

describe("auth page continuation", () => {
	it("preserves a desktop sign-in request when switching pages", () => {
		const next =
			"https://cap.so/api/desktop/session/request?type=api_key&port=9123&platform=desktop";
		for (const page of ["login", "signup"] as const) {
			const link = new URL(authPageHref(page, next), ORIGIN);
			expect(link.pathname).toBe(`/${page}`);
			expect(getSafeNextPath(link.searchParams.get("next"), ORIGIN)).toBe(
				"/api/desktop/session/request?type=api_key&port=9123&platform=desktop",
			);
		}
	});
	it("keeps external continuation URLs rejected on the destination page", () => {
		const link = new URL(
			authPageHref("signup", "https://evil.example/path"),
			ORIGIN,
		);
		expect(getSafeNextPath(link.searchParams.get("next"), ORIGIN)).toBe(
			"/dashboard",
		);
	});
});
