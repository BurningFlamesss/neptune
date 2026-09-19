import { createMiddleware, createServerFn } from "@tanstack/react-start";
import type { AppContext } from "#/types/router-context.ts";

export const sessionMiddleware = createMiddleware({ type: "request" }).server(
	async ({ next }) => {
		const { getRequestHeaders } = await import("@tanstack/react-start/server");
		const headers = getRequestHeaders();
		const { auth } = await import("#/lib/auth");

		const session = await auth.api.getSession({ headers });

		return await next({ context: { session: session } satisfies AppContext });
	},
);

export const getSessionFn = createServerFn()
	.middleware([sessionMiddleware])
	.handler(({ context }) => context.session);
