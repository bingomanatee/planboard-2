import storeFactory from '~/lib/store/data/store.factory'
import { IDBFactory, IDBKeyRange } from "fake-indexeddb";
import indexedEngine from '~/lib/store/data/engines/indexedEngine'
import { v4 } from 'uuid'

describe('storeFactory', () => {

  describe('basic i/o', () => {

    describe('addition', () => {
      describe('projects', () => {
        describe('add, save', () => {
          it('should let you add new projects', () => {
            const store = storeFactory(indexedEngine());
            const projects = store.child('projects')!;

            const id = projects.do.add({ name: "test-project" });
            const { content, saved } = projects.value.get(id)
            expect(content.name).toBe('test-project');
            expect(saved).toBeFalsy();
          });

          it('throw on bad new projects', async () => {
            const store = storeFactory(indexedEngine());
            const projects = store.child('projects')!;
            let error = null;
            try {
              await projects.do.add({ name: [1234] });
            } catch (err) {
              error = err;
            }
            expect(error?.message).toMatch('must be string');
            expect(projects.$.size()).toBe(0);
          });

          it('should let you add existing projects', () => {
            const store = storeFactory(indexedEngine(1, { indexedDB: new IDBFactory(), IDBKeyRange }));
            const projects = store.child('projects')!;
            const id = v4();

            const addId = projects.do.add({ name: "existing-test-project" }, id);
            expect(addId).toBe(id);

            const { content, saved } = projects.value.get(id)
            expect(content.name).toBe('existing-test-project');
            expect(saved).toBeTruthy();
          });

          it('should let you save new projects', async () => {
            const store = storeFactory(indexedEngine(1, { indexedDB: new IDBFactory(), IDBKeyRange }));
            const projects = store.child('projects')!;

            const id = projects.do.add({ name: "test-project" });
            await projects.do.save(id);
            const { content, saved } = projects.value.get(id)
            expect(content.name).toBe('test-project');
            expect(saved).toBeTruthy();
          });

          it('should let you save (over) existing projects', async () => {
            const engine = indexedEngine(1, { indexedDB: new IDBFactory(), IDBKeyRange });
            const store = storeFactory(engine);
            const projects = store.child('projects')!;
            const id = v4();

            const previous = { id, name: "existing-test-project-old" };
            await engine.save('projects', previous, id);

            projects.do.add({ id, name: "updated-test-project" }, id);
            await projects.do.save(id);
            const { content, saved } = projects.value.get(id)
            expect(content.name).toBe('updated-test-project');
            expect(saved).toBeTruthy();
          });
        });
        describe('fetch', () => {
          it('should fetch existing projects', async () => {
            const engine = indexedEngine(1, { indexedDB: new IDBFactory(), IDBKeyRange });
            const store = storeFactory(engine);
            const projects = store.child('projects')!;
            const id = v4();

            const previous = { id, name: "existing-test-project" };
            await engine.save('projects', previous, id);

            const { content } = await projects.do.fetch(id);
            expect(content.name).toBe("existing-test-project");
          });
        });
      });

      describe('frames', () => {
        describe('add, save', () => {
          it('should let you add new frames', () => {
            const store = storeFactory(indexedEngine());
            const frames = store.child('frames')!;

            const id = frames.do.add({
              name: "test-frame",
              left: 100,
              top: 150,
              width: 200,
              height: 300
            });
            const { content, saved } = frames.value.get(id)
            expect(content.name).toBe('test-frame');
            expect(content.left).toBe(100);
            expect(content.top).toBe(150);
            expect(content.width).toBe(200);
            expect(content.height).toBe(300);
            expect(saved).toBeFalsy();
          });

          it('throw on bad new frames', async () => {
            const store = storeFactory(indexedEngine());
            const projects = store.child('frames')!;
            let error = null;
            try {
              await projects.do.add({ top: 100, left: '1000px' });
            } catch (err) {
              error = err;
            }
            expect(error?.message).toMatch(/left .* must be number for frames/);
            expect(projects.$.size()).toBe(0);
          });

          it('should let you add existing frames', () => {
            const store = storeFactory(indexedEngine(1, { indexedDB: new IDBFactory(), IDBKeyRange }));
            const frames = store.child('frames')!;
            const id = v4();

            const addId = frames.do.add({
              name: "existing-test-frame",
              left: 100,
              top: 150,
              width: 200,
              height: 300,
            }, id);
            expect(addId).toBe(id);

            const { content, saved } = frames.value.get(id)
            expect(content.name).toBe('existing-test-frame');
            expect(content.left).toBe(100);
            expect(content.top).toBe(150);
            expect(content.width).toBe(200);
            expect(content.height).toBe(300);
            expect(saved).toBeTruthy();
          });

          it('should let you save new frames', async () => {
            const store = storeFactory(indexedEngine(1, { indexedDB: new IDBFactory(), IDBKeyRange }));
            const frames = store.child('frames')!;

            const id = frames.do.add({
              name: "test-frame",
              left: 100,
              top: 150,
              width: 200,
              height: 300,
            });
            await frames.do.save(id);
            const { content, saved } = frames.value.get(id)
            expect(content.name).toBe('test-frame');
            expect(content.left).toBe(100);
            expect(content.top).toBe(150);
            expect(content.width).toBe(200);
            expect(content.height).toBe(300);

            expect(saved).toBeTruthy();
          });

          it('should let you save (over) existing frames', async () => {
            const engine = indexedEngine(1, {
              indexedDB: new IDBFactory(),
              IDBKeyRange
            });
            const store = storeFactory(engine);
            const frames = store.child('frames')!;
            const id = v4();

            const previous = {
              id, name: "existing-test-project-old", left: 100,
              top: 150,
              width: 200,
              height: 300,
            };
            await engine.save('frames', previous, id);

            frames.do.add({
              id, name: "updated-test-frame",
              left: 105,
              top: 155,
              width: 205,
              height: 305,
            }, id);
            await frames.do.save(id);
            const { content, saved } = frames.value.get(id)
            expect(content.name).toBe('updated-test-frame');
            expect(content.left).toBe(105);
            expect(content.top).toBe(155);
            expect(content.width).toBe(205);
            expect(content.height).toBe(305);
            expect(saved).toBeTruthy();
          });
        });
        describe('fetch', () => {
          it('should fetch existing frames', async () => {
            const engine = indexedEngine(1, { indexedDB: new IDBFactory(), IDBKeyRange });
            const store = storeFactory(engine);
            const frames = store.child('frames')!;
            const id = v4();

            const previous = {
              id, name: "existing-test-frame", left: 100,
              top: 150,
              width: 200,
              height: 300,
            };
            await engine.save('frames', previous, id);

            const { content } = await frames.do.fetch(id);
            expect(content.name).toBe("existing-test-frame");
            expect(content.left).toBe(100);
            expect(content.top).toBe(150);
            expect(content.width).toBe(200);
            expect(content.height).toBe(300);
          });
        });
      });
    });
  });
});
