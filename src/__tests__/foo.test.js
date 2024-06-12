// a temp file just to trigger sonarcloud coverage scan
// to be removed later.

import foo from "../foo";

describe('foo', () => {
    it('should return bar', () => {
        const actual = foo();
        const expected = 'bar';

        expect(actual).toBe(expected);
    })
});