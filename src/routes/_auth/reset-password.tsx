import { createFileRoute, Link } from "@tanstack/react-router";
import { z } from "zod";
import { authClient } from "#/lib/auth-client.ts";

const resetPasswordSearchParamSchema = z.object({
	token: z.string().optional().default(""),
});

const requestResetPasswordSchema = z.object({
	email: z.email(),
});

const resetPasswordSchema = z.object({
	password: z.string().min(8).max(50),
});

export const Route = createFileRoute("/_auth/reset-password")({
	component: RouteComponent,
	validateSearch: resetPasswordSearchParamSchema,
});

function RouteComponent() {
	const { token } = Route.useSearch();

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

	const resetPassword = async (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();

		const formData = new FormData(event.currentTarget);
		const newPassword = formData.get("newPassword") as string;
		const confirmPassword = formData.get("confirmPassword") as string;

		const resetPasswordData = {
			newPassword,
		};

		const { success, data, error } =
			resetPasswordSchema.safeParse(resetPasswordData);

		if (!success) {
			// TODO: UI Feedback

			return;
		}

		if (newPassword === confirmPassword) {
			try {
				await authClient.resetPassword(
					{
						...resetPasswordData,
						token,
					},
					{
						onError: (context) => {
							// TODO: UI Feedback to show context.error.message
						},
						onSuccess: () => {
							// TODO: UI Feedback to tell user that their password has been successfully resetted
						},
					},
				);
			} catch (error) {
				// TODO: UI Feedback to show user Something Went Wrong
			}
		} else {
			// TODO: UI Feedback to tell user that both of the passwords should be same
		}
	};

	return (
		<main>
			{!token ? (
				<form onSubmit={requestResetPassword} action="#" method="post">
					<label htmlFor="email">Email</label>{" "}
					<input type="email" name="email" id="email" required /> <br />
					<button type="submit">Request Reset Password</button>
				</form>
			) : (
				<form onSubmit={resetPassword} action="#" method="post">
					<label htmlFor="newPassword">New Password</label>{" "}
					<input
						type="password"
						name="newPassword"
						id="newPassword"
						required
					/>{" "}
					<br />
					<label htmlFor="confirmPassword">Confirm Password</label>{" "}
					<input
						type="password"
						name="confirmPassword"
						id="confirmPassword"
						required
					/>{" "}
					<br />
					<button type="submit">Reset Password</button>
				</form>
			)}
			New to the App? <Link to="/signup">Sign Up</Link>
		</main>
	);
}
