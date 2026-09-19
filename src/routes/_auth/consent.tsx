import type { OAuthConsent, Scope } from "@better-auth/oauth-provider";
import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { z } from "zod";
import { authClient } from "#/lib/auth-client.ts";

const consentSearchParamSchema = z.object({
	id: z.string().min(1, "Consent Id is required"),
});

export const Route = createFileRoute("/_auth/consent")({
	component: RouteComponent,
	validateSearch: consentSearchParamSchema,
});

function RouteComponent() {
	const { id } = Route.useSearch();
	const [consentData, setConsentData] = useState<OAuthConsent<Scope[]> | null>(
		null,
	);

	useEffect(() => {
		const fetchConsent = async () => {
			const { data, error } = await authClient.oauth2.getConsent({
				query: { id },
			});

			if (error) {
				// TODO: UI Feedback
				return;
			}

			setConsentData(data);
		};
		fetchConsent();
	}, [id]);

    

	if (!consentData) {
		return "Loading...";
	}

	return <div>Hello "/_auth/consent"!</div>;
}
