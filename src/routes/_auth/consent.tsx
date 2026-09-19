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
	const [clientName, setClientName] = useState<string>("an application");
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		const fetchConsentAndClientDetails = async () => {
			const { data: consent, error: consentError } =
				await authClient.oauth2.getConsent({
					query: { id },
				});

			if (!consent || consentError) {
				// TODO: UI Feedback
				setIsLoading(false);
				return;
			}

			setConsentData(consent);

			const { data: client, error: clientError } =
				await authClient.oauth2.publicClient({
					query: {
						client_id: consent.clientId,
					},
				});

			if (!clientError && client?.client_name) {
				setClientName(client.client_name);
			}

			setIsLoading(false);
		};
		fetchConsentAndClientDetails();
	}, [id]);

	const handleAccept = () => {};
	const handleReject = () => {};

	if (isLoading || !consentData) {
		return "Loading...";
	}

	return (
		<main>
			<h2>{clientName}</h2>

			<p>This app would like to access:</p>
			<ul>
				{consentData.scopes.map((scope) => (
					<li key={scope}>{scope}</li>
				))}
			</ul>

			<div>
				<form onSubmit={handleAccept} action="#" method="post">
					<button type="submit">Allow Access</button>
				</form>
				<form onSubmit={handleReject} action="#" method="post">
					<button type="submit">Deny</button>
				</form>
			</div>
		</main>
	);
}
