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
      console.log('--------- engine schemas', inspect(engine.schemas, true, 5));
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
                { name: 'name', type: 'string' },
                { name: 'id', primary: true, type: 'string' },
                { name: 'lastName', type: 'string', version: 2 },
              ]
            ],
            [3,
              [
                { name: 'name', type: 'string' },
                { name: 'id', primary: true, type: 'string' },
                { name: 'lastName', type: 'string', version: 2 },
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
                  { name: 'id', type: 'string', primary: true, version: 2 },
                  { name: 'email', type: 'string', version: 2 },
                  { name: 'username', type: 'string', version: 2 },
                  { name: 'password', type: 'string', version: 2 },
                  { name: 'notes', type: 'string', version: 3 },
                ]
              ]
            ])
        }
      );
    });

    it('should handle image def ', () => {

      const engine = indexedEngine({});

      const schema = [
        { name: 'id', type: 'string', primary: true },
        { name: 'name', type: 'string', optional: true },
        { name: 'filename', type: 'string', optional: true, version: 3 },
        { name: 'crop', type: 'string', optional: true },
        { name: 'scale', type: 'number', optional: true },
        { name: 'syncSize', type: 'boolean', optional: true },
        { name: 'content_id', type: 'string' },
        { name: 'project_id', type: 'string' }
      ];

      //@ts-ignore
      const [_v, fields] = engine.distribute(schema);

      console.log('fields:', fields);

      engine.addStore('images', schema);
      console.log('image tables: ', inspect(engine.tables()));
      expect(engine.tables()).toEqual(new Map([
        [
          1,
          { images: 'id,name,crop,scale,syncSize,content_id,project_id' },
        ],
        [
          2,
          { images: 'id,name,crop,scale,syncSize,content_id,project_id' }
        ],
        [
          3,
          { images: 'id,name,crop,scale,syncSize,content_id,project_id,filename' }
        ]
      ]))

      engine.initialize();

    });
  });
});
