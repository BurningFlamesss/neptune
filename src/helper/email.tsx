import nodemailer from "nodemailer";
import { serverEnv } from "#/env/serverEnv.ts";

interface EmailRequest {
	type: "verify" | "resend" | "warning" | "reset";
	receiver: {
		name: string;
		email: string;
	};
	token?: string;
	callToAction?: string;
}

export async function sendEmail(emailRequest: EmailRequest) {
	try {
		const user = serverEnv.APP_USER;
		const pass = serverEnv.APP_PASSWORD;

		if (!pass) {
			return {
				success: false,
				message: "Password not configured",
			};
		}

		const transporter = nodemailer.createTransport({
			service: "gmail",
			host: "smtp.gmail.com",
			port: 587,
			secure: false,
			auth: {
				user,
				pass,
			},
		});

		await transporter.verify();

		let html = "";
		let subject = "";

		switch (emailRequest.type) {
			case "verify":
				subject = "Verify your email";
				html = `
                <body>
                    <h2>Hello, ${emailRequest.receiver.name}</h2>

                    <div>
                        <h3>Verify your email by clicking below</h3>
                        <a href="${emailRequest.token}">${emailRequest.callToAction ?? "Verify"}</a>
                    </div>

                    <p>Note: If you didn't request this email, please ignore it.</p>
                    <p>Best Regards, <br />The NepTune Team</p>
                </body>
                `;
				break;

			case "resend":
				subject = "Verification email";
				html = `
                <body>
                    <h2>Hello, ${emailRequest.receiver.name}</h2>

                    <div>
                        <h3>Verify your email by clicking below</h3>
                        <a href="${emailRequest.token}">${emailRequest.callToAction ?? "Verify"}</a>
                    </div>

                    <p>Note: If you didn't request this email, please ignore it.</p>
                    <p>Best Regards, <br />The NepTune Team</p>
                </body>
                `;
				break;

			case "reset":
				subject = "Reset your password";
				html = `
                <body>
                    <h2>Hello, ${emailRequest.receiver.name}</h2>

                    <div>
                        <h3>Reset your password by clicking below</h3>
                        <a href="${emailRequest.token}">${emailRequest.callToAction ?? "Reset Password"}</a>
                    </div>

                    <p>Note: If you didn't request this email, please ignore it.</p>
                    <p>Best Regards, <br />The NepTune Team</p>
                </body>
                `;
				break;

			case "warning":
				subject = "Sign-Up attempt with your email";
				html = `
                <body>
                    <h2>Hello, ${emailRequest.receiver.name}</h2>

                    <div>
                        <h3>Someone tried to create an account using your email address. If this was you, try signing in instead</h3>
                    </div>

                    <p>Note: If not, you can safely ignore this email.</p>
                    <p>Best Regards, <br />The NepTune Team</p>
                </body>
                `;
				break;

			default:
				break;
		}

		await transporter.sendMail({
			from: `NepTune - ${user}`,
			to: emailRequest.receiver.email,
			subject,
			html,
		});

		return {
			success: true,
			message: "Successfully sent email",
			details: {
				subject,
			},
		};
	} catch (error) {
		console.error("Email service error: ", error);

		return {
			success: false,
			message: "Failed to send email",
			details: {
				error: error instanceof Error ? error.message : String(error),
			},
		};
	}
}
