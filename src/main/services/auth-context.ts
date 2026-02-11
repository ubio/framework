import { AuthenticationRequiredError } from '@nodescript/errors';

export abstract class AuthContext {

    abstract isAuthenticated(): boolean;

    checkAuthenticated(): void {
        if (!this.isAuthenticated()) {
            throw new AuthenticationRequiredError();
        }
    }

}
