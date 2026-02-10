import { AuthContext } from './auth-context.js';

export type AuthHeaders = Record<string, string | string[] | undefined>;

export abstract class AuthProvider<T> {

    abstract provide(headers?: AuthHeaders): Promise<AuthContext<T | null>>;

}
