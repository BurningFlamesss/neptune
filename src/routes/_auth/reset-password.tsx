import { createFileRoute, Link } from "@tanstack/react-router";
import { z } from "zod";
import { authClient } from "#/lib/auth-client.ts";

export const Route = createFileRoute("/_auth/reset-password")({
	component: RouteComponent,
});

const requestResetPasswordSchema = z.object({
	email: z.email(),
});

function RouteComponent() {
	const requestResetPassword = async (
		event: React.FormEvent<HTMLFormElement>,
	) => {
		event.preventDefault();

		const formData = new FormData(event.currentTarget);
		const requestResetPasswordData = {
			email: formData.get("email") as string,
		};

		const { success, data, error } = requestResetPasswordSchema.safeParse(
			requestResetPasswordData,
		);

		if (!success) {
			// TODO: UI Feedback

			return;
		}

		try {
			await authClient.requestPasswordReset(
				{
					...requestResetPasswordData,
				},
				{
					onError: (context) => {
						// TODO: UI Feedback to show context.error.message
					},
					onSuccess: () => {
						// TODO: UI Feedback to tell user, s/he request reset password is successfully initialized and they should check their email
					},
				},
			);
		} catch (error) {
			// TODO: UI Feedback to show user Something Went Wrong
		}
	};

	return (
		<main>
			<form onSubmit={requestResetPassword} action="#" method="post">
				<label htmlFor="email">Email</label>{" "}
				<input type="email" name="email" id="email" required /> <br />
				<button type="submit">Request Reset Password</button>
			</form>
			New to the App? <Link to="/signup">Sign Up</Link>
		</main>
	);
}
