import assert from 'assert';

import * as backend from '../main/backend.js';
import * as framework from '../main/index.js';
import * as vue from '../main/vue.js';

describe('framework exports', () => {
    it('re-exports common modules', () => {
        assert.ok(framework);
        assert.ok(backend);
        assert.ok(vue);
    });
});
