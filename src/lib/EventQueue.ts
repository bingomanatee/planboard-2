import {
  concat,
  filter,
  fromEvent,
  map, merge,
  mergeMap,
  Observable,
  of,
  race,
  switchAll,
  switchMap,
  takeUntil,
  tap
} from 'rxjs'
import { isMouseResponder } from '~/lib/utils'
import { dispatchDOMEvent } from '@testing-library/user-event/event/dispatchEvent'

type keyEventTypes = 'keyup' | 'keydown';
type KeyEventDef = { type: keyEventTypes, event: KeyboardEvent };
export type EQMouseEvent = {
  type: string,
  x: number,
  y: number,
  sx: number,
  sy: number,
  dx: number,
  dy: number,
}

class EventQueue {
  private keyUpObserver?: Observable<KeyboardEvent>
  private keyDownObserver?: Observable<KeyboardEvent>
  private keyObserver?: Observable<KeyEventDef>
  private currentKeys?: Observable<Set<string>>
  public pressedKeys = new Set();

  constructor(private window: Window) {
    this.initKeyWatching();
  }

  initKeyWatching() {
    this.keyUpObserver = fromEvent<KeyboardEvent>(this.window, 'keyup')
      .pipe(
        map((event) => ({ type: 'keyup', event }))
      ); // listen for any keyup's
    this.keyDownObserver = fromEvent<KeyboardEvent>(this.window, 'keydown')
      .pipe(
        filter((e) => !e.repeat),
        map((event) => ({ type: 'keydown', event }))
      ); // listen for any keydown's
    this.keyObserver = merge(this.keyDownObserver, this.keyUpObserver);
    this.currentKeys = this.keyObserver.pipe(
      map((() => {
        let keys = new Set();
        return (ed: KeyEventDef) => {
          if (ed.type === 'keydown') {
            keys.add(ed.event.key);
          }
          if (ed.type === 'keyup') {
            keys.delete(ed.event.key);
          }
          return keys;
        }
      })())
    );
    this.currentKeys.subscribe((keys) => this.pressedKeys = keys)
  }

  /**
   * This event returns an emitter that emits an observer for every drag sequence,
   * _IF_ a given key is down __when__ the drag starts.
   */
  keyDownAndDragObserver(key: string) {

    const mouseUpObs = fromEvent<MouseEvent>(this.window, 'mouseup');
    const mouseMoveObs = fromEvent<MouseEvent>(this.window, 'mousemove');
    const mouseDownObs = fromEvent<MouseEvent>(this.window, 'mousedown');

    // console.log('EQ got keyEvent: ', ke.key)
    return mouseDownObs.pipe( // whenever we press mouse down
      filter((event) => {
        console.log('down sensed with keys', this.pressedKeys, event);
        return this.pressedKeys.has(key) && !isMouseResponder(event.target);
      }),
      switchMap((downEvent) => {
          console.log('down sensed for ', key, downEvent);
          return concat(mouseMoveObs
              .pipe( // each time we move a cursor
                map((e) => {
                  return {
                    type: 'mousemove', x: e.pageX, y: e.pageY, sx: downEvent.pageX, sy: downEvent.pageY,
                    dx: e.pageX - downEvent.pageX,  dy: e.pageY - downEvent.pageY
                  }
                }),
                takeUntil(mouseUpObs) // but only until we release the mouse button
              ),
            of(false) // after the mouse is released, return false to let the consumer know that
            // there are no more move events pending for this cycle
          )
        } // end mouseMoveObs.pipe
      ) // end switchMap (inner)
    ) // end mouseDownObs.pipe
  }
}

export default EventQueue
