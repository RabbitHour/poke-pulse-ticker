import {useEffect} from 'react';
import {useLocation} from 'react-router-dom';
/** Router transitions mount asynchronously; wait for the requested section before scrolling. */
export default function RouteScroll(){
 const {pathname,hash}=useLocation();
 useEffect(()=>{
  if(!hash){window.scrollTo({top:0,behavior:'instant'});return;}
  let id:string;try{id=decodeURIComponent(hash.slice(1));}catch{return;}
  let done=false;
  const scroll=()=>{
   if(done)return;
   const target=document.getElementById(id)??(id==='main-content'?document.querySelector('main'):null);
   if(target){target.scrollIntoView({block:'start',behavior:'instant'});done=true;observer.disconnect();}
  };
  const observer=new MutationObserver(scroll);
  observer.observe(document.body,{childList:true,subtree:true});
  const frame=requestAnimationFrame(scroll);
  const timeout=window.setTimeout(()=>observer.disconnect(),5000);
  return()=>{done=true;cancelAnimationFrame(frame);clearTimeout(timeout);observer.disconnect();};
 },[pathname,hash]);
 return null;
}
