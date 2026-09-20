import { createFileRoute, Link } from "@tanstack/react-router";
import type React from "react";
import { z } from "zod";
import { authClient } from "#/lib/auth-client.ts";
import { ArrowUpRight } from "lucide-react";
import { useState } from "react";

const loginSchema = z.object({
	email: z.email(),
	password: z.string().min(8).max(50),
});

export const Route = createFileRoute("/_auth/login")({
	component: RouteComponent,
});

function RouteComponent() {
	const [error, setError] = useState({
		email: "",
		password: "",
		form: ""
	})

	const login = async (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();

		const formData = new FormData(event.currentTarget);
		const loginData = {
			email: formData.get("email") as string,
			password: formData.get("password") as string,
		};

		const { success, data, error: zodError } = loginSchema.safeParse(loginData);

		if (!success) {
			setError(prev => ({
				...prev,
				email: zodError.type.email,
				password: zodError.type.password
			}))

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
							setError(prev => ({
								...prev,
								form: "Verify you email"
							}))
						} else {
							setError(prev => ({
								...prev,
								form: context.error.message
							}))
						}
					},
					onSuccess: () => {
						// TODO: UI Feedback to tell user, s/he is logged in
					},
				},
			);
		} catch (error) {
			setError(prev => ({
				...prev,
				form: "Something Went Wrong"
			}))
		}
	};

	return (
		<main className="login-page wrap max-w-5xl mx-auto flex flex-col justify-center">
			<div className='login-layout grid grid-cols-2 gap-[15%] pt-18 pb-15'>
				<div className='relative'>
					<h1 className='text-7xl'>Access your <span className='text-cyan-dark'>2nd Brain.</span></h1>

					<div className='login-prompts mt-8 text-[16px] leading-[1.8]'>
						<p className="">having,</p>
						<p>Unlimited Collections</p>
						<p>Unlimited Knowledges</p>
						<p>Unlimited Application Connections</p>
						<p>And more...</p>
					</div>

					<p className='login-intro text-xs text-muted mt-5'>
						We're so excited to <br /> have you logged in.
					</p>

					<div className='login-ring'>

					</div>
				</div>

				<div className='login-form-column pt-1.5'>
					<div className='form-topline flex items-center justify-between mb-8'>
						<span className='mono text-[8px] text-[#7d9095]'>
							Your Intelligence, Emerging Brilliance
						</span>
						<ArrowUpRight className='text-cyan-dark' size={18} strokeWidth={1} />
					</div>

					<form onSubmit={login} action="#" method="post">
						<label htmlFor="email">Email</label>{" "}
						<input type="email" name="email" id="email" required /> <br />
						{error.email ? (
							<>
								<p>{error.email}</p>
								<br />
							</>
						) : null}
						<label htmlFor="password">Password</label>{" "}
						<input type="password" name="password" id="password" required /> <br />
						{error.password ? (
							<>
								<p>{error.password}</p>
								<br />
							</>
						) : null}
						Forgot Password? <Link to="/reset-password">Reset Password</Link> <br />
						<button type="submit">Login</button>
						{error.form ? (
							<>
								<p>{error.form}</p>
								<br />
							</>
						) : null}
					</form>
					New to the App? <Link to="/signup">Sign Up</Link>
				</div>
			</div>
		</main>
	);
}
