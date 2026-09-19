import type { QueryClient } from "@tanstack/react-query";
import type { auth } from "#/lib/auth.ts";

export type Session = Awaited<ReturnType<typeof auth.api.getSession>>

export type AppContext = { 
    session: Session | null
}

export interface MyRouterContext {
	session: Session | null;
	queryClient: QueryClient;
}
