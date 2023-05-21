import {
  BehaviorSubject,
  concat,
  filter,
  fromEvent,
  map, merge,
  Observable,
  of,
  switchMap,
  takeUntil, tap,
} from 'rxjs'
import { isMouseResponder } from '~/lib/utils'

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
  private keyEventObservable?: Observable<KeyEventDef>
  public pressedKeys = new Set();
  private mouseUpObs?: Observable<MouseEvent>
  private mouseMoveObs?: Observable<MouseEvent>
  private mouseDownObs?: Observable<MouseEvent>
  public keysObs: BehaviorSubject<Set<string>>
  constructor(private window: Window) {
    this.keysObs = new BehaviorSubject(this.pressedKeys);
    this.initKeyWatching();
  }

  initKeyWatching() {
    const keyUpObserver = fromEvent<KeyboardEvent>(this.window, 'keyup')
      .pipe(
        map((event) => ({ type: 'keyup', event }))
      ); // listen for any keyup's
    const keyDownObserver = fromEvent<KeyboardEvent>(this.window, 'keydown')
      .pipe(
        filter((e) => !e.repeat),
        map((event) => ({ type: 'keydown', event }))
      ); // listen for any keydown's
    this.keyEventObservable = merge(keyDownObserver, keyUpObserver);
    this.keyEventObservable.subscribe((ed) => {
      if (ed.type === 'keydown') {
        this.pressedKeys.add(ed.event.key);
        this.keysObs.next(this.pressedKeys);
      } else if (ed.type === 'keyup') {
        this.pressedKeys.delete(ed.event.key);
        this.keysObs.next(this.pressedKeys);
      }
    });
  }

  /**
   * This event returns an emitter that emits an observer for every drag sequence,
   * _IF_ a given key is down __when__ the drag starts.
   */
  keyDownAndDragObserver(key: string) {
    this.mouseUpObs ??= fromEvent<MouseEvent>(this.window, 'mouseup');
    this.mouseMoveObs ??= fromEvent<MouseEvent>(this.window, 'mousemove');
    this.mouseDownObs ??= fromEvent<MouseEvent>(this.window, 'mousedown');

    // console.log('EQ got keyEvent: ', ke.key)
    return this.mouseDownObs.pipe( // whenever we press mouse down
      filter((event) => {
        console.log('mousedown with keys:', this.pressedKeys);
        return this.pressedKeys.has(key) && this.pressedKeys.size == 1 && !isMouseResponder(event.target);
      }),
      switchMap((downEvent) => {
          return concat(this.mouseMoveObs!.pipe( // each time we move a cursor
                map((e) => {
                  return {
                    type: 'mousemove', x: e.pageX, y: e.pageY, sx: downEvent.pageX, sy: downEvent.pageY,
                    dx: e.pageX - downEvent.pageX, dy: e.pageY - downEvent.pageY
                  }
                }),
                takeUntil(this.mouseUpObs) // but only until we release the mouse button
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
