import {useEffect,useRef,useState} from 'react';
/** Change discovery selection, never quote timestamps. Avoid moving focused/hovered cards. */
export function useSelectionRotation(onRotate:()=>void, interval=120000) {
 const [paused,setPaused]=useState(false);
 const [hovered,setHovered]=useState(false);
 const [focused,setFocused]=useState(false);
 const engaged=hovered||focused;
 const callback=useRef(onRotate);callback.current=onRotate;
 useEffect(()=>{if(paused||engaged)return;const timer=setInterval(()=>{if(document.visibilityState==='visible')callback.current();},interval);return()=>clearInterval(timer);},[paused,engaged,interval]);
 return {paused,setPaused,bindings:{onMouseEnter:()=>setHovered(true),onMouseLeave:()=>setHovered(false),onFocusCapture:()=>setFocused(true),onBlurCapture:(e:React.FocusEvent<HTMLElement>)=>{if(!e.currentTarget.contains(e.relatedTarget as Node))setFocused(false);}}};
}
