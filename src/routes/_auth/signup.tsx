import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { z } from "zod";
import { authClient } from "#/lib/auth-client.ts";
import { ArrowUpRight } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner"

const signupSchema = z.object({
	name: z.string().min(3),
	email: z.email(),
	password: z.string().min(8).max(50),
});

export const Route = createFileRoute("/_auth/signup")({
	async beforeLoad(ctx) {
		if (ctx.context.session) {
			throw redirect({ to: "/dashboard" })
		}
	},
	component: RouteComponent,
});

function RouteComponent() {
	const [error, setError] = useState({
		name: "",
		email: "",
		password: "",
		form: ""
	})

	const signup = async (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();

		const formData = new FormData(event.currentTarget);
		const signupData = {
			name: formData.get("name") as string,
			email: formData.get("email") as string,
			password: formData.get("password") as string,
		};

		const { success, data, error: zodError } = signupSchema.safeParse(signupData);

		if (!success) {
			const fieldErrors = z.treeifyError(zodError)

			setError(prev => ({
				...prev,
				name: fieldErrors.properties?.name?.errors?.[0] || "",
				email: fieldErrors.properties?.email?.errors?.[0] || "",
				password: fieldErrors.properties?.password?.errors?.[0] || ""
			}))

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
						setError(prev => ({
							...prev,
							form: context.error.message
						}))
					},
					onSuccess: () => {
						toast.success("Congratulations!!! You're signed up. Check your email.")
					},
				},
			);
		} catch (error) {
			setError(prev => ({
				...prev,
				form: "Something went wrong"
			}))
		}
	};

	return (
		<main className="signup-page wrap max-w-5xl mx-auto flex flex-col justify-center">
			<div className='signup-layout grid grid-cols-2 gap-[15%] pt-18 pb-15'>
				<div className='relative'>
					<h1 className='text-7xl'>Unlock your <span className='text-cyan-dark'>2nd Brain.</span></h1>

					<div className='signup-prompts mt-8 text-[16px] leading-[1.8]'>
						<p className="">having,</p>
						<p>Unlimited Collections</p>
						<p>Unlimited Knowledges</p>
						<p>Unlimited Application Connections</p>
						<p>And more...</p>
					</div>

					<p className='signup-intro text-xs text-muted mt-5'>
						We're so excited to <br /> have you onboard.
					</p>

					<div className='signup-ring'>

					</div>
				</div>

				<div className='signup-form-column pt-1.5'>
					<div className='form-topline flex items-center justify-between mb-8'>
						<span className='mono text-[12px] text-[#7d9095]'>
							Your Intelligence, Emerging Brilliance
						</span>
						<ArrowUpRight className='text-cyan-dark' size={18} strokeWidth={1} />
					</div>

					<form onSubmit={signup} action="#" method="post">
						<label htmlFor="name">Name</label>{" "}
						<input type="name" name="name" id="name" required /> <br />
						{error.name ? (
							<>
								<p className="form-error-message">{error.name}</p>
								<br />
							</>
						) : null}
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
						<button type="submit" className="group mb-4">
							Signup <ArrowUpRight className="group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-transform" size={15} />
						</button>
						{error.form ? (
							<>
								<p className="form-error-message">{error.form}</p>
								<br />
							</>
						) : null}
					</form>
					Already have an account? <Link to="/login">Login</Link>

				</div>
			</div>
		</main>
	);
}
