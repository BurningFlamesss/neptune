import { createFileRoute, Link } from "@tanstack/react-router";
import type React from "react";
import { z } from "zod";
import { authClient } from "#/lib/auth-client.ts";

export const Route = createFileRoute("/_auth/login")({
	component: RouteComponent,
});

const loginSchema = z.object({
	email: z.email(),
	password: z.string().min(8).max(50),
});

function RouteComponent() {
	const login = async (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();

		const formData = new FormData(event.currentTarget);
		const loginData = {
			email: formData.get("email") as string,
			password: formData.get("password") as string,
		};

		const { success, data, error } = loginSchema.safeParse(loginData);

		if (!success) {
			// TODO: UI Feedback

			return;
		}

		try {
			await authClient.signIn.email(
				{
					...loginData,
					callbackURL: "/dashboard",
				},
				{
					onError: (context) => {
						if (context.error.status === 403) {
							// TODO: UI Feedback to tell user to verify their email
						} else {
							// TODO: UI Feedback to show context.error.message
						}
					},
					onSuccess: () => {
						// TODO: UI Feedback to tell user, s/he is logged in
					},
				},
			);
		} catch (error) {
			// TODO: UI Feedback to show user Something Went Wrong
		}
	};

	return (
		<main>
			<form onSubmit={login} action="#" method="post">
				<label htmlFor="email">Email</label>{" "}
				<input type="email" name="email" id="email" required /> <br />
				<label htmlFor="password">Password</label>{" "}
				<input type="password" name="password" id="password" /> <br />
				<button type="submit">Login</button>
			</form>
			Forgot Password? <Link to="/reset-password">Reset Password</Link>
			New to the App? <Link to="/signup">Sign Up</Link>
		</main>
	);
}
