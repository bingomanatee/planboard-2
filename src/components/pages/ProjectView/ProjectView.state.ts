import { leafI, typedLeaf } from '@wonderlandlabs/forest/lib/types'
import { Vector2 } from 'three'
import { Frame, Project } from '~/types'
import { eventFrame } from '~/lib/utils'
import EventQueue, { EQMouseEvent } from '~/lib/EventQueue'
import { Subscriber } from 'rxjs'

type KeyData = {
  key: string,
  shiftKey: boolean,
  altKey: boolean
}

type LoadState = '' | 'loading' | 'error' | 'finished';
type ProjectMode = '' | 'drawing-frame' | 'moving-item';
export type TargetData = { type: string, id: string };

export type ProjectViewValue = {
  loadError: any,
  project: Project | null,
  projectId: string,
  frames: Frame[] | null,
  keyData: KeyData | null,
  loadState: LoadState,
  mouseMode: ProjectMode,
  startPoint: Vector2 | null,
  endPoint: Vector2 | null,
  editItem: TargetData | null;
  moveItem: TargetData | null;
  linkStartId: string | null;
  linkEndId: string | null;
  screenOffset: Vector2;
  screenOffsetDelta: Vector2 | null;
  settings: Map<string, any>;
  editMode: string | null;
}

export const MODE_DRAG_SCREEN = 'dragging-screen';

export const MODE_ADD_FRAME = 'drawing-frame';

export const MODE_ADD_LINK = 'drawing-link';

export const MODE_NO_ACTION = 'no-action'

const ProjectViewState = (id, dataState: leafI, globalState: leafI, backRef) => {
  const initial: ProjectViewValue = {
    loadError: null,
    linkStartId: null,
    linkEndId: null,
    project: null,
    projectId: id,
    frames: null,
    loadState: 'start',
    keyData: null,
    mouseMode: '',
    startPoint: null,
    endPoint: null,
    editType: null,
    moveItem: null,
    screenOffset: new Vector2(0, 0),
    screenOffsetDelta: null,
    settings: new Map(),
    editMode: null
  };

  return {
    $value: initial,
    selectors: {
      eq(state: leafI, window: Window) {
        let eq;
        if (state.getMeta('eq')) {
          eq = state.getMeta('eq')
        } else {
          eq = new EventQueue(window);
          state.setMeta('eq', eq);
        }
        return eq;
      },
      addSub(state: leafI, sub: Subscriber<any>) {
        let subs = state.getMeta('subs') ?? [];
        subs.push(sub);
        state.setMeta('subs', subs, true);
      },
      clearSubs(state: leafI) {
        let subs = state.getMeta('subs');
        subs?.forEach((sub) => sub.unsubscribe());
      },
    },
    meta: {
      id, // id of the current project
    },
    actions: {
      updateEndPoint(state: leafI, event: EQMouseEvent) {
        const ep = new Vector2(event.x, event.y);
        state.do.set_endPoint(ep);
      },
      updateLink(state: leafI, event: EQMouseEvent) {
        const targetId = eventFrame(event.moveEvent?.target);
        state.do.set_linkEndId(targetId || null);
        state.do.updateEndPoint(event);
      },
      initEvents(state: typedLeaf<ProjectViewValue>, window: Window) {
        state.do.initAddFrame(window);
        state.do.initDragScreen(window);
        state.do.initAddLink(window);
      },

      initDragScreen(state: typedLeaf<ProjectViewValue>, window) {
        const eq = state.$.eq(window);

        let onMouseMove = null;
        let onMouseUp = null;

        const fObserver = eq.keyDownAndDragObserver(' ');

        const sub = fObserver.subscribe((event) => {
          if (event) {
            if (!(onMouseMove && state.value.mouseMode)) {
              /*
                if the mouse has not been claimed AND we don't have a mouseMove in process, point this and
                all further events to drawFrame
               */
              state.do.claimProjectMode(MODE_DRAG_SCREEN);
              state.do.set_startPoint(new Vector2(event.sx, event.sy));
              state.do.updateEndPoint(event);

              onMouseMove = state.do.dragScreen;
              onMouseUp = state.do.completeDragScreen;

            } else {
              if (onMouseMove) {
                /*
                two things we know for a fact:
                1. we have claimed the current cycle
                2. this is a secondary cycle -- we are in the process of drawing a mouse
                 */
                onMouseMove(event);
              }
            }
          } else { // we are at the end of a cycle
            if (onMouseUp) {
              onMouseUp(event);
            }
            onMouseUp = null;
            onMouseMove = null;
          }
        });

        state.$.addSub(sub);
      },

      dragScreen(state: leafI, event: EQMouseEvent) {
        state.do.updateEndPoint(event);
        const delta = state.value.endPoint.clone().sub(state.value.startPoint);
        state.do.set_screenOffsetDelta(delta);
      },
      completeDragScreen(state: leafI) {
        state.do.set_screenOffset(
          state.value.screenOffset
            .clone()
            .add(state.value.screenOffsetDelta)
        )
        state.do.set_screenOffsetDelta(null);
        state.do.releaseProjectMode()
      },
      initAddLink(state: typedLeaf<ProjectViewValue>, window) {
        const eq = state.$.eq(window);

        let onMouseMove = null;
        let onMouseUp = null;

        const fObserver = eq.keyDownAndDragObserver('c');

        const sub = fObserver.subscribe((event) => {
          if (event) {
            if (!(onMouseMove && state.value.mouseMode)) {
              const targetId = eventFrame(event.downEvent.target);
              if (!targetId) {
                console.log('skipping link - no target id');
                state.do.claimProjectMode(MODE_NO_ACTION);
              } else {
                console.log('starting link from ', targetId);
                /*
  if the mouse has not been claimed AND we don't have a mouseMove in process, point this and
  all further events to drawFrame
 */
                state.do.set_linkStartId(targetId);
                state.do.claimProjectMode(MODE_ADD_LINK);
                state.do.set_startPoint(new Vector2(event.sx, event.sy));
              }
              state.do.updateLink(event);

              onMouseMove = state.do.updateLink;
              onMouseUp = state.do.completeLink;

            } else {
              if (onMouseMove) {
                /*
                two things we know for a fact:
                1. we have claimed the current cycle
                2. this is a secondary cycle -- we are in the process of drawing a mouse
                 */
                onMouseMove(event);
              }
            }
          } else { // we are at the end of a cycle
            if (onMouseUp) {
              onMouseUp(event);
            }
            onMouseUp = null;
            onMouseMove = null;
          }
        });

        state.$.addSub(sub);
      },
      initAddFrame(state: typedLeaf<ProjectViewValue>, window) {
        const eq = state.$.eq(window);

        let onMouseMove = null;
        let onMouseUp = null;

        const fObserver = eq.keyDownAndDragObserver('f');

        const sub = fObserver.subscribe((event) => {
          if (event) {
            if (!(onMouseMove && state.value.mouseMode)) {
              /*
                if the mouse has not been claimed AND we don't have a mouseMove in process, point this and
                all further events to drawFrame
               */
              state.do.claimProjectMode(MODE_ADD_FRAME);
              state.do.set_startPoint(new Vector2(event.sx, event.sy));
              state.do.updateEndPoint(event);

              onMouseMove = state.do.updateEndPoint;
              onMouseUp = state.do.completeAddFrame

            } else {
              if (onMouseMove) {
                /*
                two things we know for a fact:
                1. we have claimed the current cycle
                2. this is a secondary cycle -- we are in the process of drawing a mouse
                 */
                onMouseMove(event);
              }
            }
          } else { // we are at the end of a cycle
            if (onMouseUp) {
              onMouseUp(event);
            }
            onMouseUp = null;
            onMouseMove = null;
          }
        });

        state.$.addSub(sub);
      },
      completeAddFrame(state: typedLeaf<ProjectViewValue>) {
        const { startPoint, endPoint, screenOffset } = state.value;
        startPoint.sub(screenOffset);
        endPoint.sub(screenOffset);
        state.do.set_startPoint(null);
        state.do.set_endPoint(null);
        state.do.releaseProjectMode();
        dataState.child('frames')!.do.createFrame(state.value.project?.id, startPoint, endPoint);
      },
      completeLink(state: typedLeaf<ProjectViewValue>) {
        const { startPoint, endPoint, screenOffset, mouseMode, linkStartId, linkEndId } = state.value;
        // the point coordinates are not really used here - its boilerplate from a cut and paste
        if (mouseMode && linkStartId) {
          if (screenOffset) {
            startPoint.sub(screenOffset);
            endPoint.sub(screenOffset);
          }
          console.log('--- completeLink: linking ', linkStartId, 'and', linkEndId, 'mouse mode = ', mouseMode);
        }
        state.do.set_startPoint(null);
        state.do.set_endPoint(null);
        state.do.set_linkStartId(null);
        state.do.releaseProjectMode();
        // dataState.child('frames')!.do.createFrame(state.value.project?.id, startPoint, endPoint);
      },
      initMove(state: leafI, targetData: TargetData) {
        const { loadState, mouseMode } = state.value;
        if ((!['loaded', 'finished'].includes(loadState)) || (mouseMode)) {
          return;
        }
        if (state.do.claimProjectMode('moving-item') === 'moving-item') {
          state.do.set_moveItem(targetData);
        }
      },
      completeMove(state: leafI) {
        state.do.releaseProjectMode('moving-item');
      },
      editGrid(state: typedLeaf<ProjectViewValue>) {
        state.do.set_editMode('grid');
      },
      initNavMenu(state: typedLeaf<ProjectViewValue>) {
        globalState.do.clearMenuItems();
        const items = [
          {
            type: 'button', label: 'grid', props: {
              onClick: state.do.editGrid,
              plain: true
            }
          }
        ]
        globalState.do.addMenuItems(items);
      },
      editItem(state: typedLeaf<ProjectViewValue>, editType) {
        state.do.set_editType(editType || null);
      },
      closeEdit(state: typedLeaf<ProjectViewValue>) {
        state.do.set_editType(null);
        state.do.set_editMode(null);
      },
      load(state: leafI) {
        state.do.set_loadState('loading');
        return state.do.doLoad();
      },
      async doLoad(state: leafI) {
        try {
          const loaded = await dataState.do.loadProject(id);
          const { project, frames, settings } = loaded;
          state.do.set_project(project);
          await state.do.set_frames(frames);
          state.do.set_settings(settings);
          state.do.set_loadState('loaded');
        } catch (err) {
          console.warn('load error:', err);
          state.do.set_loadError(err.message);
          state.do.set_loadState('error');
        }
      },
      claimProjectMode(state: leafI, token) {
        if (state.value.mouseMode || !token) {
          return false;
        }
        state.do.set_mouseMode(token);
        return token;
      },
      releaseProjectMode(state: leafI) {
        state.do.set_mouseMode('');
      }
    }
  };
}

export default ProjectViewState;
