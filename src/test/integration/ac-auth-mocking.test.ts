import assert from 'assert';
import { dep } from 'mesh-ioc';
import supertest from 'supertest';

import { AcAuth, Application, AuthProvider, Get, Router } from '../../main/index.js';

describe('Mocking AcAuth', () => {

    class MyRouter extends Router {

        @dep() protected auth!: AcAuth;

        @Get({
            path: '/foo'
        })
        foo() {
            return {
                actor: this.auth.actor,
                jwtContext: this.auth.jwtContext,
            };
        }

    }

    class App extends Application {

        override createGlobalScope() {
            const mesh = super.createGlobalScope();
            mesh.service(AuthProvider, class extends AuthProvider<AcAuth> {
                override authContextClass = AcAuth;
                async createAuthContext() {
                    return new AcAuth({
                        organisation_id: 'foo',
                        service_account_id: 'service-account-worker',
                        service_account_name: 'Bot',
                    });
                }
            });
            return mesh;
        }

        override createHttpRequestScope() {
            const mesh = super.createHttpRequestScope();
            mesh.service(MyRouter);
            return mesh;
        }

    }

    const app = new App();
    beforeEach(() => app.start());
    afterEach(() => app.stop());

    it('returns mocked data', async () => {
        const request = supertest(app.httpServer.callback());
        const res = await request.get('/foo');
        assert.deepStrictEqual(res.body, {
            actor: {
                type: 'ServiceAccount',
                id: 'service-account-worker',
                name: 'Bot',
                organisationId: 'foo',
            },
            jwtContext: {
                organisation_id: 'foo',
                service_account_id: 'service-account-worker',
                service_account_name: 'Bot',
            },
        });
    });
});
