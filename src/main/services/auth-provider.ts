import Koa from 'koa';
import { Constructor, Mesh } from 'mesh-ioc';

import { AuthContext } from './auth-context.js';

export abstract class AuthProvider<T extends AuthContext> {

    abstract authContextClass: Constructor<T>;

    abstract createAuthContext(ctx: Koa.Context): Promise<AuthContext>;

    async provide(ctx: Koa.Context, scope: Mesh) {
        const authContext = await this.createAuthContext(ctx);
        scope.constant(this.authContextClass, authContext);
        scope.alias(AuthContext, this.authContextClass);
    }

}
