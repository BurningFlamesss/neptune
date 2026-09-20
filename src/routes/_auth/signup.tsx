import { createFileRoute, Link } from "@tanstack/react-router";
import { z } from "zod";
import { authClient } from "#/lib/auth-client.ts";
import { ArrowUpRight } from "lucide-react";

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
						<span className='mono text-[8px] text-[#7d9095]'>
							Your Intelligence, Merging Brilliant
						</span>
						<ArrowUpRight className='text-cyan-dark' size={18} strokeWidth={1} />
					</div>

					<form onSubmit={signup} action="#" method="post">
						<label htmlFor="name">Name</label>{" "}
						<input type="name" name="name" id="name" required /> <br />
						<label htmlFor="email">Email</label>{" "}
						<input type="email" name="email" id="email" required /> <br />
						<label htmlFor="password">Password</label>{" "}
						<input type="password" name="password" id="password" required /> <br />
						<button type="submit">Signup</button>
					</form>
					Already have an account? <Link to="/login">Login</Link>


				</div>
			</div>
		</main>
	);
}
