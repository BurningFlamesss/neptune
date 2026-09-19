import { oauthProviderClient } from "@better-auth/oauth-provider/client";
import { jwtClient } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";
import { clientEnv } from "#/env/clientEnv.ts";

export const authClient = createAuthClient({
	baseURL: clientEnv.CLIENT_URL,
	plugins: [jwtClient(), oauthProviderClient()],
});
