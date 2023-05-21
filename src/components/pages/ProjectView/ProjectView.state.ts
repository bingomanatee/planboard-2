import { leafI, typedLeaf } from '@wonderlandlabs/forest/lib/types'
import { isEqual } from 'lodash'
import { Vector2 } from 'three'
import { Frame, Project, triggerFn } from '~/types'
import { isMouseResponder, toPoint } from '~/lib/utils'
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
  screenOffset: Vector2;
  screenOffsetDelta: Vector2 | null;
  settings: Map<string, any>;
  editMode: string | null;
}

const META_MOVE = 'handleMouseMove';
const META_UP = 'handleMouseUp';
const META_DOWN_LISTENERS = 'downListeners';

const MOUSE_MOVE = 'mousemove';
const MOUSE_UP = 'mouseup';

const MODE_DRAG_SCREEN = 'dragging-screen'

const ProjectViewState = (id, dataState: leafI, globalState: leafI, backRef) => {
  const initial: ProjectViewValue = {
    loadError: null,
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
        if (state.getMeta('eq') ){
          eq = state.getMeta('eq')
        } else {
          eq = new EventQueue(window);
          state.setMeta('eq', eq);
        }
        return eq;
      },
      addSub(state: leafI, sub: Subscriber<any>) {
        let subs = state.getMeta('subs')?? [];
        subs.push(sub);
        state.setMeta('subs', subs, true);
      },
      clearSubs(state: leafI) {
        let subs = state.getMeta('subs');
        console.log('clearing subs:', subs);
        subs?.forEach((sub) => sub.unsubscribe());
      },
      // NOTE: it does NOT clear mouseMode.
      clearMouseListeners(state: leafI, ...rest) {
        const mouseUpListener = state.getMeta(META_UP);
        state.setMeta(META_UP, null, true);
        const mouseMoveListener = state.getMeta(META_MOVE);
        state.setMeta(META_MOVE, null, true);
        window.removeEventListener(MOUSE_UP, mouseUpListener);
        window.removeEventListener(MOUSE_MOVE, mouseMoveListener);
        state.$.clearListeners(mouseUpListener, mouseMoveListener, ...rest)
      },
      clearListeners(state: leafI, ...rest) {
        // brute-force remove all other arguments from all possible hooks
        rest.forEach((listener) => {
          if (typeof listener === 'function') {
            window.removeEventListener(MOUSE_UP, listener);
            window.removeEventListener(MOUSE_MOVE, listener);
          }
        })
      },
    },
    meta: {
      id, // id of the current project
    },
    actions: {
      updateEndPoint(state: leafI, event: EQMouseEvent) {
        console.log('updateEndPoint:', event);
        const ep = new Vector2(event.x, event.y);
        console.log('end point is ', ep);
        state.do.set_endPoint(ep);
      },
      initEvents(state: typedLeaf<ProjectViewValue>, window: Window) {
        state.do.initAddFrame(window);
        state.do.initMoveDoc(window);
      },

      initMoveDoc(state: typedLeaf<ProjectViewValue>, window){
        const eq = state.$.eq(window);

        let onMouseMove = null;
        let onMouseUp = null;

        const fObserver = eq.keyDownAndDragObserver(' ');

        const sub = fObserver.subscribe((event) => {
          if (event) {
            if (!(onMouseMove && state.value.mouseMode)) {
              console.log('initializing drawing frame', event);
              /*
                if the mouse has not been claimed AND we don't have a mouseMove in process, point this and
                all further events to drawFrame
               */
              state.do.claimProjectMode('moving-item');
              state.do.set_startPoint(new Vector2(event.sx, event.sy));
              state.do.updateEndPoint(event);

              onMouseMove = state.do.screenMove;
              onMouseUp = state.do.completeScreenMove;

            } else {
              if (onMouseMove) {
                /*
                two things we know for a fact:
                1. we have claimed the current cycle
                2. this is a secondary cycle -- we are in the process of drawing a mouse
                 */
                console.log('moving with ', event);
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

      initMove(state: leafI, targetData: TargetData) {
        const { loadState, mouseMode, keyData } = state.value;
        if ((!['loaded', 'finished'].includes(loadState)) || (mouseMode)) {
          return;
        }
        if (state.do.claimProjectMode('moving-item') === 'moving-item') {
          state.do.set_moveItem(targetData);

          state.do.addDownListener((e) => {
            e.stopPropagation();
            if (state.value.mouseMode === 'moving-item') {
              state.do.completeMove('downListener');
            }
          });
        }

      },
      screenMove(state: leafI, event: EQMouseEvent){
        state.do.updateEndPoint(event);
        const delta = state.value.endPoint.clone().sub(state.value.startPoint);
        console.log('screen delta:', delta);
        state.do.set_screenOffsetDelta(delta);
      },
      initAddFrame(state: typedLeaf<ProjectViewValue>, window){
        const eq = state.$.eq(window);

        let onMouseMove = null;
        let onMouseUp = null;

        const fObserver = eq.keyDownAndDragObserver('f');

        const sub = fObserver.subscribe((event) => {
          if (event) {
            if (!(onMouseMove && state.value.mouseMode)) {
              console.log('initializing drawing frame', event);
              /*
                if the mouse has not been claimed AND we don't have a mouseMove in process, point this and
                all further events to drawFrame
               */
              state.do.claimProjectMode('drawing-frame');
              state.do.set_startPoint(new Vector2(event.sx, event.sy));
              state.do.updateEndPoint(event);

              onMouseMove = state.do.updateEndPoint;
              onMouseUp = state.do.finishFrame

            } else {
              if (onMouseMove) {
                /*
                two things we know for a fact:
                1. we have claimed the current cycle
                2. this is a secondary cycle -- we are in the process of drawing a mouse
                 */
                console.log('moving with ', event);
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
      finishFrame(state: typedLeaf<ProjectViewValue>) {
        const { startPoint, endPoint, screenOffset } = state.value;
        startPoint.sub(screenOffset);
        endPoint.sub(screenOffset);
        state.do.set_startPoint(null);
        state.do.set_endPoint(null);
        state.do.releaseProjectMode('drawing-frame');
        dataState.child('frames')!.do.createFrame(state.value.project?.id, startPoint, endPoint);
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
      addDownListener(state: leafI, trigger: triggerFn) {
        setTimeout(() => {
          const listeners = state.getMeta(META_DOWN_LISTENERS);
          if (!listeners) {
            state.setMeta(META_DOWN_LISTENERS, new Set([trigger]), true);
          } else { // just add to the existing one
            listeners.add(trigger);
          }
        }, 10);
      },
      completeMove(state: leafI, e) {
        state.$.clearMouseListeners();
        state.do.releaseProjectMode('moving-item');
      },
      // downListeners are any "extra hooks" that components may add to handle down conditions
      // typically to close opened dialogs

      execDownListeners(state: leafI, e: MouseEvent) {
        const listeners = state.getMeta(META_DOWN_LISTENERS);
        if (listeners) {
          listeners.forEach((fn: triggerFn) => {
            if (typeof fn === 'function') {
              fn(e);
            }
          });
        }
        state.setMeta(META_DOWN_LISTENERS, null, true);
      },
      mouseDown(state: leafI, e: MouseEvent) {
        const { loadState, mouseMode, keyData } = state.value;

        if (isMouseResponder(e.target)) {
          // another process is going to handle the mouseDown event
          return;
        }

        state.do.execDownListeners(e);

        e.stopPropagation();

        if (mouseMode === 'moving-item') {
          state.do.completeMove('projectView.mouseDown');
          return;
        }

        if ((!['loaded', 'finished'].includes(loadState)) || (mouseMode) || (!backRef.current)) {
          return;
        }

        if (keyData?.key === 'f') {
          return state.do.startDrawingFrame(e);
        }
        if (keyData?.key === ' ') {
          return state.do.startDraggingScreen(e);
        }
      },
      completeScreenMove(state: leafI) {
        state.do.set_screenOffset(
          state.value.screenOffset
            .clone()
            .add(state.value.screenOffsetDelta)
        )
        state.do.set_screenOffsetDelta(null);
      },

      startDraggingScreen(state: leafI, e: EQMouseEvent) {
        state.do.claimProjectMode(MODE_DRAG_SCREEN);
        const startPoint = toPoint(e);
        state.do.set_startPoint(startPoint);

        const mouseUpListener = () => {
          state.$.clearMouseListeners(mouseMoveListener, mouseUpListener);
          state.do.set_screenOffset(
            state.value.screenOffset
              .clone()
              .add(state.value.screenOffsetDelta)
          )
          state.do.set_screenOffsetDelta(null);
          state.do.releaseProjectMode(MODE_DRAG_SCREEN)
        }

        const mouseMoveListener = (e2) => {
          const endPoint = toPoint(e2);
          state.do.set_endPoint(endPoint);
          const delta = endPoint.clone().sub(state.value.startPoint);
          state.do.set_screenOffsetDelta(delta);
        }
        window.addEventListener(MOUSE_MOVE, mouseMoveListener);
        window.addEventListener(MOUSE_UP, mouseUpListener);
      },
      keyDown(state: leafI, e: KeyboardEvent) {
        const { key, shiftKey, altKey } = e;
        const data = { key, shiftKey, altKey };
        if (!isEqual(data, state.value.keyData)) {
          state.do.set_keyData(data);
        }
        e.stopPropagation();
      },
      keyUp(state: leafI, e: KeyboardEvent) {
        state.do.set_keyData(null);
        e.stopPropagation();
      },
      load(state: leafI) {
        state.do.set_loadState('loading');
        return state.do.doLoad();
      },
      async doLoad(state: leafI) {
        try {
          const loaded = await dataState.do.loadProject(id);
          const { project, frames, content, settings } = loaded;
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
      releaseProjectMode(state: leafI, token: ProjectMode) {
        if (state.value.mouseMode === token) {
          state.do.set_mouseMode('');
        } else {
          console.warn('releaseProjectMode:: mouseMode', state.value.mouseMode, ' !== ', token);
        }
      },
    }
  };
};

export default ProjectViewState;
