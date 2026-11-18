export type AnalyticsUser = {
	id: string;
	email?: string | null;
	name?: string | null;
	lastName?: string | null;
};

export function identifyUser(
	_user: AnalyticsUser,
	_properties?: Record<string, unknown>,
) {}

export function resetUser() {}

export function trackEvent(
	_eventName: string,
	_properties?: Record<string, unknown>,
) {}
