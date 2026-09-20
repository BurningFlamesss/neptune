import { createFileRoute, Link } from "@tanstack/react-router";
import { z } from "zod";
import { authClient } from "#/lib/auth-client.ts";
import { ArrowUpRight } from "lucide-react";
import { useState } from "react";

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
	const [error, setError] = useState({
		email: "",
		newPassword: "",
		confirmPassword: "",
		resetPasswordForm: "",
		requestResetPasswordForm: ""
	})

	const requestResetPassword = async (
		event: React.FormEvent<HTMLFormElement>,
	) => {
		event.preventDefault();

		const formData = new FormData(event.currentTarget);
		const requestResetPasswordData = {
			email: formData.get("email") as string,
		};

		const { success, data, error: zodError } = requestResetPasswordSchema.safeParse(
			requestResetPasswordData,
		);

		if (!success) {
			const fieldErrors = z.treeifyError(zodError)

			setError(prev => ({
				...prev,
				email: fieldErrors.properties?.email?.errors?.[0] || ""
			}))

			return;
		}

		try {
			await authClient.requestPasswordReset(
				{
					...requestResetPasswordData,
				},
				{
					onError: (context) => {
						setError(prev => ({
							...prev,
							requestResetPasswordForm: context.error.message
						}))
					},
					onSuccess: () => {
						// TODO: UI Feedback to tell user, s/he request reset password is successfully initialized and they should check their email
					},
				},
			);
		} catch (error) {
			setError(prev => ({
				...prev,
				requestResetPasswordForm: "Something went wrong"
			}))
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

		const { success, data, error: zodError } =
			resetPasswordSchema.safeParse(resetPasswordData);

		if (!success) {
			const fieldErrors = z.treeifyError(zodError)

			setError(prev => ({
				...prev,
				newPassword: fieldErrors.properties?.password?.errors?.[0] || ""
			}))

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
							setError(prev => ({
								...prev,
								resetPasswordForm: context.error.message
							}))
						},
						onSuccess: () => {
							// TODO: UI Feedback to tell user that their password has been successfully resetted
						},
					},
				);
			} catch (error) {
				setError(prev => ({
					...prev,
					resetPasswordForm: "Something went wrong"
				}))
			}
		} else {
			setError(prev => ({
				...prev,
				confirmPassword: "Both passwords should be same"
			}))
		}
	};

	return (
		<main className="reset-password-page wrap max-w-5xl mx-auto flex flex-col justify-center">
			<div className='reset-password-layout grid grid-cols-2 gap-[15%] pt-18 pb-15'>
				<div className='relative'>
					<h1 className='text-7xl'>Secure your <span className='text-cyan-dark'>2nd Brain.</span></h1>

					<div className='reset-password-prompts mt-8 text-[16px] leading-[1.8]'>
						<p className="">having,</p>
						<p>Unlimited Collections</p>
						<p>Unlimited Knowledges</p>
						<p>Unlimited Application Connections</p>
						<p>And more...</p>
					</div>

					<p className='reset-password-intro text-xs text-muted mt-5'>
						We're so excited to <br /> have you secured.
					</p>

					<div className='reset-password-ring'>

					</div>
				</div>

				<div className='reset-password-form-column pt-1.5'>
					<div className='form-topline flex items-center justify-between mb-8'>
						<span className='mono text-[12px] text-[#7d9095]'>
							Your Intelligence, Emerging Brilliance
						</span>
						<ArrowUpRight className='text-cyan-dark' size={18} strokeWidth={1} />
					</div>

					{!token ? (
						<form onSubmit={requestResetPassword} action="#" method="post">
							<label htmlFor="email">Email</label>{" "}
							<input type="email" name="email" id="email" required /> <br />
							{error.email ? (
								<>
									<p className="form-error-message">{error.email}</p>
									<br />
								</>
							) : null}
							<button type="submit" className="group mb-4">
								Request Reset Password <ArrowUpRight className="group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-transform" size={15} />
							</button>
							{error.requestResetPasswordForm ? (
								<>
									<p className="form-error-message">{error.requestResetPasswordForm}</p>
									<br />
								</>
							) : null}
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
							{error.newPassword ? (
								<>
									<p className="form-error-message">{error.newPassword}</p>
									<br />
								</>
							) : null}
							<label htmlFor="confirmPassword">Confirm Password</label>{" "}
							<input
								type="password"
								name="confirmPassword"
								id="confirmPassword"
								required
							/>{" "}
							<br />
							{error.confirmPassword ? (
								<>
									<p className="form-error-message">{error.confirmPassword}</p>
									<br />
								</>
							) : null}
							<button type="submit" className="group mb-4">
								Reset Password <ArrowUpRight className="group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-transform" size={15} />
							</button>
							{error.confirmPassword ? (
								<>
									<p className="form-error-message">{error.confirmPassword}</p>
									<br />
								</>
							) : null}
						</form>
					)}
					New to the App? <Link to="/signup">Sign Up</Link>


				</div>
			</div>
		</main>
	);
}
