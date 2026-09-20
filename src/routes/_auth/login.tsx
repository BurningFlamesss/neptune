import { createFileRoute, Link } from "@tanstack/react-router";
import type React from "react";
import { z } from "zod";
import { authClient } from "#/lib/auth-client.ts";
import { ArrowUpRight } from "lucide-react";

const loginSchema = z.object({
	email: z.email(),
	password: z.string().min(8).max(50),
});

export const Route = createFileRoute("/_auth/login")({
	component: RouteComponent,
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
		<main className="login-page wrap max-w-5xl mx-auto flex flex-col justify-center">
			<div className='login-layout grid grid-cols-2 gap-[15%] pt-18 pb-15'>
				<div className='relative'>
					<h1 className='text-7xl'>Unlock your <span className='text-cyan-dark'>2nd Brain.</span></h1>

					<div className='login-prompts mt-8 text-[16px] leading-[1.8]'>
						<p className="">having,</p>
						<p>Unlimited Collections</p>
						<p>Unlimited Knowledges</p>
						<p>Unlimited Application Connections</p>
						<p>And more...</p>
					</div>

					<p className='login-intro text-xs text-muted mt-5'>
						We're so excited to <br /> have you onboard.
					</p>

					<div className='login-ring'>

					</div>
				</div>

				<div className='login-form-column pt-1.5'>
					<div className='form-topline flex items-center justify-between mb-8'>
						<span className='mono text-[8px] text-[#7d9095]'>
							Your Intelligence, Merging Brilliant
						</span>
						<ArrowUpRight className='text-cyan-dark' size={18} strokeWidth={1} />
					</div>

					<form onSubmit={login} action="#" method="post">
						<label htmlFor="email">Email</label>{" "}
						<input type="email" name="email" id="email" required /> <br />
						<label htmlFor="password">Password</label>{" "}
						<input type="password" name="password" id="password" required /> <br />
						Forgot Password? <Link to="/reset-password">Reset Password</Link> <br />
						<button type="submit">Login</button>
					</form>
					New to the App? <Link to="/signup">Sign Up</Link>


				</div>
			</div>
		</main>
	);
}
