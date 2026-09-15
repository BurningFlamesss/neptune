import { createAuthClient } from 'better-auth/react'
import { clientEnv } from '#/env/clientEnv.ts';

export const authClient = createAuthClient({
    baseURL: clientEnv.CLIENT_URL
})
