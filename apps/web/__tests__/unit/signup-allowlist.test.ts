import { isEmailAllowedForSignup } from "@cap/database/auth/domain-utils";
import { describe, expect, it, vi } from "vitest";

vi.mock("@cap/env", () => ({ serverEnv: () => ({}) }));

describe("signup allowlist", () => {
	it("allows explicitly listed email addresses without allowing their whole domain", () => {
		const allowed = "ideaflow.io, TMad4000@Gmail.com";
		expect(isEmailAllowedForSignup("tmad4000@gmail.com", allowed)).toBe(true);
		expect(isEmailAllowedForSignup("other@gmail.com", allowed)).toBe(false);
		expect(isEmailAllowedForSignup("jacob@ideaflow.io", allowed)).toBe(true);
		expect(isEmailAllowedForSignup("jacob@sub.ideaflow.io", allowed)).toBe(
			false,
		);
	});
	it("does not accept malformed emails or malformed entries as a match", () => {
		expect(isEmailAllowedForSignup("not-an-email", "not-an-email")).toBe(false);
		expect(isEmailAllowedForSignup("other@gmail.com", "@gmail.com")).toBe(
			false,
		);
	});
	it("preserves unrestricted signups when the setting is empty", () => {
		expect(isEmailAllowedForSignup("other@gmail.com", "")).toBe(true);
	});
});
