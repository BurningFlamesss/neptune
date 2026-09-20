import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import React, { useState } from "react";
import { registerThirdPartyApp } from "#/functions/authentication.tsx";

export const Route = createFileRoute("/developer")({
	async beforeLoad({ context }) {
		if (!context.session?.user.id) {
			throw redirect({ to: "/login" })
		}
	},
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

	return (
		<main className="max-w-5xl mx-auto flex flex-col justify-center">
			<div className="grid grid-cols-2 gap-[15%] pt-18 pb-15">
				<section>
					{error && <p>Error: {error}</p>}
					<form onSubmit={handleSubmit} action="#" method="post">
						<label htmlFor="appName">App Name: </label>{" "}
						<input type="text" name="appName" id="appName" placeholder="HyperNeuron..." /> <br />
						<label htmlFor="redirectUri">Redirect URI: </label>{" "}
						<input type="url" name="redirectUri" id="redirectUri" placeholder="https://your_app.domain" /> <br />
						<button type="submit">Get Tokens</button>
					</form>
				</section>
				<div className='relative'>
					<h1 className='text-7xl'>Dev <span className='text-cyan-dark'>Portal.</span></h1>

					<div className='developer-prompts mt-8 text-[16px] leading-[1.8]'>
						<p>Fill up the necessary details</p>
					</div>

					<div className="mt-5 bg-cyan/10 w-full flex flex-row p-4 rounded-2xl">
						{credentials ? (
							<section>
								<h1>App Registered Successfully!!!</h1>
								<p>
									WARNING: Save this securely. You would not be able to see this again
								</p>

								<br />
								<p>ClientID: {credentials.clientId}</p>
								<p>ClientSecret: {credentials.clientSecret}</p>

								<br />
								<button className="app-button" type="button" onClick={() => setCredentials(null)}>
									Register Another App
								</button>
							</section>
						) : (
							<section>
								<h1>Register your application</h1>
								<p>
									WARNING: Fill up the details carefully as currently the app doesnot support editting these information
								</p>

								<br />
								<p>AppName: Defines the name of your application</p>
								<p>RedirectUri: Defines the URI to which NepTune should redirect user to, once they are logged in</p>
							</section>
						)}
					</div>

					<p className='developer-intro text-xs text-muted mt-5'>
						Want to know, how to implement? <Link to="/">See the docs &rarr;</Link>
					</p>

					<div className='developer-ring'>

					</div>
				</div>

			</div>
		</main>
	);
}
