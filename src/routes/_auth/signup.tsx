import { createFileRoute, Link } from "@tanstack/react-router";
import { z } from "zod";
import { authClient } from "#/lib/auth-client.ts";

const signupSchema = z.object({
	name: z.string().min(3),
	email: z.email(),
	password: z.string().min(8).max(50),
});

export const Route = createFileRoute("/_auth/signup")({
	component: RouteComponent,
});

function RouteComponent() {
	const signup = async (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();

		const formData = new FormData(event.currentTarget);
		const signupData = {
			name: formData.get("name") as string,
			email: formData.get("email") as string,
			password: formData.get("password") as string,
		};

		const { success, data, error } = signupSchema.safeParse(signupData);

		if (!success) {
			// TODO: UI Feedback

			return;
		}

		try {
			await authClient.signUp.email(
				{
					...signupData,
					callbackURL: "/dashboard",
				},
				{
					onError: (context) => {
						// TODO: UI Feedback to show context.error.message
					},
					onSuccess: () => {
						// TODO: UI Feedback to tell user, s/he is signed up and check the email
					},
				},
			);
		} catch (error) {
			// TODO: UI Feedback to show user Something Went Wrong
		}
	};

	return (
		<main>
			<form onSubmit={signup} action="#" method="post">
				<label htmlFor="name">Name</label>{" "}
				<input type="name" name="name" id="name" required /> <br />
				<label htmlFor="email">Email</label>{" "}
				<input type="email" name="email" id="email" required /> <br />
				<label htmlFor="password">Password</label>{" "}
				<input type="password" name="password" id="password" /> <br />
				<button type="submit">Signup</button>
			</form>
			Already have an account? <Link to="/login">Login</Link>
		</main>
	);
}
