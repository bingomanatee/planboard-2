import indexedEngine from '~/lib/store/data/engines/indexedEngine'
import { inspect } from 'util';

describe('indexedEngine', () => {
  describe('versioning', () => {
    it('should distribute fields across versions', () => {
      const engine = indexedEngine({});


      engine.addStore('foo', [{ name: 'name', type: 'string' },
        { name: 'id', primary: true, type: 'string' }, { name: 'lastName', type: 'string', version: 2 }]);

      engine.addStore('bar', [
        { name: 'id', type: 'string', primary: true },
        { name: 'notes', type: 'string' },
        { name: 'created', type: 'date' }
      ]);

      engine.addStore('users', [
        { name: 'id', type: 'string', primary: true, version: 2 },
        { name: 'email', type: 'string', version: 2 },
        { name: 'username', type: 'string', version: 2 },
        { name: 'password', type: 'string', version: 2 },
        { name: 'notes', type: 'string', version: 3 },
      ])
      // console.log('engine tables: ', engine.tables());

      engine.initialize();
     // console.log('engine tables', inspect(engine.tables(), true, 5));
      expect(engine.schemas).toEqual(
        {
          foo: new Map([[
            1,
            [
              { name: 'name', type: 'string' },
              { name: 'id', primary: true, type: 'string' },
            ]
          ],
            [2,
              [
                { name: 'lastName', type: 'string', version: 2 },
                { name: 'name', type: 'string' },
                { name: 'id', primary: true, type: 'string' }
              ]
            ],
            [3,
              [
                { name: 'lastName', type: 'string', version: 2 },
                { name: 'name', type: 'string' },
                { name: 'id', primary: true, type: 'string' },
              ]
            ]
          ]),
          bar: new Map(
            [
              [1,
                [
                  { name: 'id', type: 'string', primary: true },
                  { name: 'notes', type: 'string' },
                  { name: 'created', type: 'date' },
                ]
              ],
              [2,
                [
                  { name: 'id', type: 'string', primary: true },
                  { name: 'notes', type: 'string' },
                  { name: 'created', type: 'date' },
                ]
              ],
              [3,
                [
                  { name: 'id', type: 'string', primary: true },
                  { name: 'notes', type: 'string' },
                  { name: 'created', type: 'date' },
                ]
              ]
            ]
          ),

          users: new Map(
            [
              [2,
                [
                  { name: 'id', type: 'string', primary: true, version: 2 },
                  { name: 'email', type: 'string', version: 2 },
                  { name: 'username', type: 'string', version: 2 },
                  { name: 'password', type: 'string', version: 2 },
                ]
              ],
              [3,
                [
                  { name: 'notes', type: 'string', version: 3 },
                  { name: 'id', type: 'string', primary: true, version: 2 },
                  { name: 'email', type: 'string', version: 2 },
                  { name: 'username', type: 'string', version: 2 },
                  { name: 'password', type: 'string', version: 2 },
                ]
              ]
            ])
        }
      );
    });
  });
});
