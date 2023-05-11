import { without } from '~/lib/utils'

describe('utils', () => {

    describe('without', () => {
      it('should remove values from output', () => {
        const value = {a: 1, b: 2, c: 3, d: 4, e: 5};

        const wValue = without(value, ['b', 'c','d']);
        expect(wValue).toEqual({a: 1, e: 5});
      })
      it('should not modify original', () => {
        const value = {a: 1, b: 2, c: 3, d: 4, e: 5};

        const wValue = without(value, ['b', 'c','d']);
        expect(value).toEqual({a: 1, b: 2, c: 3, d: 4, e: 5});
      })

    })
  }
)
