import { oauthProvider } from "@better-auth/oauth-provider";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { jwt } from "better-auth/plugins";
import { tanstackStartCookies } from "better-auth/tanstack-start";
import { serverEnv } from "#/env/serverEnv.ts";
import { sendEmail } from "#/helper/email.tsx";

const { prisma } = await import("../db");

export const auth = betterAuth({
	database: prismaAdapter(prisma, {
		provider: "postgresql",
	}),
	emailAndPassword: {
		enabled: true,
		requireEmailVerification: true,
		revokeSessionsOnPasswordReset: true,

		async sendResetPassword({ user, url, token }, request) {
			console.table({ user, url, token });

			await sendEmail({
				type: "reset",
				receiver: {
					name: user.name,
					email: user.email,
				},
				token: url,
				callToAction: "Reset your Password",
			});
		},

		resetPasswordTokenExpiresIn: 15 * 60 * 1000, // 15 minutes

		async onExistingUserSignUp({ user }, request) {
			if (user.emailVerified) {
				console.table({
					to: user.email,
					subject: "Sign up attempt with your email",
				});

				await sendEmail({
					type: "warning",
					receiver: {
						name: user.name,
						email: user.email,
					},
				});
			}
		},
	},

	emailVerification: {
		autoSignInAfterVerification: true,
		sendOnSignUp: true,
		async sendVerificationEmail({ user, url, token }, request) {
			console.table({ user, url, token });

			await sendEmail({
				type: "verify",
				receiver: {
					name: user.name,
					email: user.email,
				},
				token: url,
				callToAction: "Verify your Email",
			});
		},
		expiresIn: 15 * 60 * 1000, // 15 minutes
	},

	baseURL: serverEnv.SERVER_URL,
	plugins: [
		jwt(),
		oauthProvider({
			loginPage: "/login",
			consentPage: "/consent",
			scopes: [
				"openid",
				"profile",
				"email",
				"containers:read",
				"containers:write",
			],
		}),
		tanstackStartCookies(),
	],
});
