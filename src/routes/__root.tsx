import { TanStackDevtools } from "@tanstack/react-devtools";
import type { QueryClient } from "@tanstack/react-query";
import {
	createRootRouteWithContext,
	HeadContent,
	Link,
	Scripts,
} from "@tanstack/react-router";
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools";
import { getSessionFn } from "#/middleware/authentication.tsx";
import type { MyRouterContext } from "#/types/router-context.ts";
import TanStackQueryDevtools from "../integrations/tanstack-query/devtools";
import appCss from "../styles.css?url";
import Navbar from "#/components/Navbar";

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
	}
});

function RootDocument({ children }: { children: React.ReactNode }) {
	return (
		<html lang="en">
			<head>
				<HeadContent />
			</head>
			<body>
				<Navbar />
				{children}
				<TanStackDevtools
					config={{
						position: "bottom-right",
					}}
					plugins={[
						{
							name: "Tanstack Router",
							render: <TanStackRouterDevtoolsPanel />,
						},
						TanStackQueryDevtools,
					]}
				/>
				<Scripts />
			</body>
		</html>
	);
}
