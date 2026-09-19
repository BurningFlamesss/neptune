import { createFileRoute } from "@tanstack/react-router";
import React, { useState } from "react";
import { registerThirdPartyApp } from "#/functions/authentication.tsx";

export const Route = createFileRoute("/developer")({
	component: RouteComponent,
});

function RouteComponent() {
	const [credentials, setCredentials] = useState<{
		clientId: string;
		clientSecret: string | undefined;
	} | null>(null);

	const [error, setError] = useState<string | null>(null);

	const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		setError(null);

		const formData = new FormData(event.currentTarget);
		const appName = formData.get("appName") as string;
		const redirectUri = formData.get("redirectUri") as string;

		try {
			const result = await registerThirdPartyApp({
				data: {
					appName,
					redirectUri,
				},
			});

			setCredentials(result);
		} catch (err) {
			setError(err.message || "Failed to register the app");
		}
	};

	if (credentials) {
		return (
			<main>
				<h1>App Registered Successfully!!!</h1>
				<p>
					WARNING: Save this securely. You would not be able to see this again
				</p>

				<br />
				<p>ClientID: {credentials.clientId}</p>
				<p>ClientSecret: {credentials.clientSecret}</p>

				<br />
				<button type="button" onClick={() => setCredentials(null)}>
					Register Another App
				</button>
			</main>
		);
	}

	return (
		<main>
			{error && <p>Error: {error}</p>}
			<form onSubmit={handleSubmit} action="#" method="post">
				<label htmlFor="appName">App Name: </label>{" "}
				<input type="text" name="appName" id="appName" /> <br />
				<label htmlFor="redirectUri">Redirect URI: </label>{" "}
				<input type="url" name="redirectUri" id="redirectUri" /> <br />
				<button type="submit">Get Tokens</button>
			</form>
		</main>
	);
}
