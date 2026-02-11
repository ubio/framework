import { AuthenticationRequiredError } from '@nodescript/errors';
import { Logger } from '@nodescript/logger';
import { Request } from '@ubio/request';
import Koa from 'koa';
import { config } from 'mesh-config';
import { dep } from 'mesh-ioc';

import { AcAuth } from '../ac-auth.js';
import { getSingleValue } from '../util.js';
import { AuthProvider } from './auth-provider.js';
import { JwtService } from './jwt.js';

export class AcAuthProvider extends AuthProvider<AcAuth> {

    clientRequest: Request;

    static middlewareCacheTtl = 60000;
    static middlewareTokensCache = new Map<string, { token: string; authorisedAt: number }>();

    @config({ default: 'x-ubio-auth' }) AC_AUTH_HEADER_NAME!: string;
    @config({ default: 'http://auth-middleware.authz.svc.cluster.local:8080/verify' })
    AC_AUTH_VERIFY_URL!: string;

    @dep() protected logger!: Logger;
    @dep() protected jwt!: JwtService;

    constructor() {
        super();
        this.clientRequest = new Request({
            retryAttempts: 3,
        });
    }

    authContextClass = AcAuth;

    async createAuthContext(ctx: Koa.Context) {
        const token = await this.getToken(ctx);
        if (token) {
            const organisationId = ctx.headers['x-ubio-organisation-id'] as string | undefined;
            return await this.createAuthFromToken(organisationId, token);
        }
        return new AcAuth(null);
    }

    protected async createAuthFromToken(organisationId: string | undefined, token: string): Promise<AcAuth> {
        try {
            const payload = await this.jwt.decodeAndVerify(token);
            const data = {
                organisation_id: organisationId,
                ...payload.context
            };
            return new AcAuth(data);
        } catch (error) {
            this.logger.warn(`Authentication from token failed`, { error });
            throw new AuthenticationRequiredError();
        }
    }

    protected async getToken(ctx: Koa.Context) {
        const authHeaderName = this.AC_AUTH_HEADER_NAME;
        const upstreamAuth = getSingleValue(ctx.headers[authHeaderName]);
        if (upstreamAuth) {
            const [prefix, token] = upstreamAuth.split(' ');
            if (prefix !== 'Bearer' || !token) {
                this.logger.warn(`Incorrect authorization header`, {
                    details: { prefix, token }
                });
                throw new AuthenticationRequiredError('Incorrect authorization header');
            }
            return token;
        }
        const authorization = getSingleValue(ctx.headers['authorization']);
        if (authorization) {
            return await this.getTokenFromAuthMiddleware(authorization);
        }
    }

    protected async getTokenFromAuthMiddleware(authorization: string): Promise<string> {
        const cached = AcAuthProvider.middlewareTokensCache.get(authorization) || { authorisedAt: 0, token: '' };
        const invalid = cached.authorisedAt + AcAuthProvider.middlewareCacheTtl < Date.now();
        if (invalid) {
            try {
                const url = this.AC_AUTH_VERIFY_URL;
                const options = {
                    headers: { authorization },
                };
                const { token } = await this.clientRequest.get(url, options);
                AcAuthProvider.middlewareTokensCache.set(authorization, {
                    token,
                    authorisedAt: Date.now(),
                });
                this.pruneCache();
                return token;
            } catch (error: any) {
                this.logger.warn('AuthMiddleware authentication failed', { ...error });
                throw new AuthenticationRequiredError();
            }
        }
        return cached.token;
    }

    pruneCache() {
        const now = Date.now();
        const entries = AcAuthProvider.middlewareTokensCache.entries();
        for (const [k, v] of entries) {
            if (v.authorisedAt + AcAuthProvider.middlewareCacheTtl < now) {
                AcAuthProvider.middlewareTokensCache.delete(k);
            }
        }
    }

}
