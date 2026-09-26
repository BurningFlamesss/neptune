import { createFileRoute, Link, redirect, useNavigate } from "@tanstack/react-router";
import type React from "react";
import { z } from "zod";
import { authClient } from "#/lib/auth-client.ts";
import { ArrowUpRight } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const loginSchema = z.object({
	email: z.email(),
	password: z.string().min(8).max(50),
});

export const Route = createFileRoute("/_auth/login")({
	async beforeLoad(ctx) {
		if (ctx.context.session) {
			throw redirect({ to: "/dashboard" })
		}
	},
	component: RouteComponent,
});

function RouteComponent() {
	const navigate = useNavigate()
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
			const fieldErrors = z.treeifyError(zodError)
			setError(prev => ({
				...prev,
				email: fieldErrors.properties?.email?.errors?.[0] || "",
				password: fieldErrors.properties?.password?.errors?.[0] || ""
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
						toast.success("Congratulations!!! You're logged in. Redirecting to dashboard...")
						navigate({ to: "/dashboard" })
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
						<span className='mono text-[12px] text-[#7d9095]'>
							Your Intelligence, Emerging Brilliance
						</span>
						<ArrowUpRight className='text-cyan-dark' size={18} strokeWidth={1} />
					</div>

					<form onSubmit={login} action="#" method="post">
						<label htmlFor="email">Email</label>{" "}
						<input type="email" name="email" id="email" required /> <br />
						{error.email ? (
							<>
								<p className="form-error-message">{error.email}</p>
								<br />
							</>
						) : null}
						<label htmlFor="password">Password</label>{" "}
						<input type="password" name="password" id="password" required /> <br />
						{error.password ? (
							<>
								<p className="form-error-message">{error.password}</p>
								<br />
							</>
						) : null}
						Forgot Password? <Link to="/reset-password">Reset Password</Link> <br />
						<button type="submit" className="group my-4">
							Login <ArrowUpRight className="group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-transform" size={15} />
						</button>
						{error.form ? (
							<>
								<p className="form-error-message">{error.form}</p>
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
