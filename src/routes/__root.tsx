import {
	createRootRouteWithContext,
	HeadContent,
	Link,
	Scripts,
} from "@tanstack/react-router";
import { getSessionFn } from "#/middleware/authentication.tsx";
import type { MyRouterContext } from "#/types/router-context.ts";
import appCss from "../styles.css?url";
import Navbar from "#/components/Navbar";
import { getUserPlan } from "#/functions/payment";
import { Toaster } from "#/components/ui/sonner.tsx";

export const Route = createRootRouteWithContext<MyRouterContext>()({
	beforeLoad: async () => {
		const session = await getSessionFn();
		return { session };
	},
	head: () => ({
		meta: [
			{
				charSet: "utf-8",
			},
			{
				name: "viewport",
				content: "width=device-width, initial-scale=1",
			},
			{
				title: "NepTune",
			},
		],
		links: [
			{
				rel: "stylesheet",
				href: appCss,
			},
		],
	}),
	shellComponent: RootDocument,
	notFoundComponent: () => {
		return (
			<main>
				Sorry, but this route doesnot exist. Please go back to the <Link to="/">main page</Link>
			</main>
		)
	},
	errorComponent: () => {
		return (
			<main>
				Uh oh! Look's like something went wrong. Please try to go back to the <Link to="/">main page</Link>
			</main>
		)
	},
	async loader({ context }) {
		try {
			return {
				plan: await getUserPlan({
					data: {
						userId: context.session?.user.id
					}
				})
			}
		} catch (error) {
			return {
				plan: null
			}
		}
	},
});

function RootDocument({ children }: { children: React.ReactNode }) {

	return (
		<html lang="en">
			<head>
				<HeadContent />
			</head>
			<body>
				<Toaster />
				<Navbar />
				{children}

				<Scripts />
			</body>
		</html>
	);
}
