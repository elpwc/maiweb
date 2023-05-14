import { useEffect, useState, useRef } from "react";
import { Observable, fromEvent, map, tap, finalize, takeLast, exhaustMap, takeUntil } from "rxjs";

export const SliderMax = 10000;

export function Silder(props: { value: number, onChange: (newValue: number) => void, style?: React.CSSProperties }): JSX.Element {
  let [value, setValue] = useState(0);
  let [dragging, setDragging] = useState(false);
  useEffect(() => {
    if (!dragging) {
      setValue(props.value);
    }
  }, [props.value, dragging]);
  let cursorRef = useRef<HTMLDivElement|null>(null);
  useEffect(() => {
    let cursor = cursorRef.current!;
    let pd = (events: Observable<Event>): Observable<Event> => {
      // to prevent selection during dragging
      return events.pipe(tap(ev => ev.preventDefault()));
    }
    let ob = 
      pd(fromEvent(cursor, 'mousedown'))
        .pipe(exhaustMap(eventStart => {
          eventStart.preventDefault();
          let l = (cursor.parentElement!.offsetWidth - cursor.offsetWidth);
          let a = cursor.offsetLeft / l;
          setDragging(true);
          return (
            pd(fromEvent(window, 'mousemove'))
              .pipe(takeUntil(pd(fromEvent(window, 'mouseup'))))
              .pipe(map(eventMove => {
                let b = ((eventMove as MouseEvent).clientX - (eventStart as MouseEvent).clientX) / l;
                let newRatio = (a + b);
                if (newRatio < 0) newRatio = 0;
                if (newRatio > 1) newRatio = 1;
                let newValue = (newRatio * SliderMax);
                setValue(newValue);
                return newValue;
              }))
              .pipe(takeLast(1))
              .pipe(tap(newValue => {
                props.onChange(newValue);
              }))
              .pipe(finalize(() => {
                setDragging(false);
              }))
          );
        }));
    let sub = ob.subscribe();
    return () => {
      sub.unsubscribe();
    };
  }, []);
  return <div style={{ ...(props.style ?? {}), minHeight: '20px', position: 'relative' }}>
    <div style={{ height: '2px', width: '100%', backgroundColor: 'black', position: 'absolute', left: '0px', top: 'calc(50% - 1px)' }}></div>
    <div ref={cursorRef} style={{ height: '70%', width: '24px', position: 'absolute', top: '15%', left: `calc(${value/SliderMax} * (100% - 24px))`, backgroundColor: '#51BCF3' }}></div>
  </div>
}


