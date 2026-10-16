import {createContext,useContext,useEffect,useState,type ReactNode} from 'react';
const C=createContext<{favorites:string[];toggle:(id:string)=>void}|null>(null);
export function FavoritesProvider({children}:{children:ReactNode}){const [favorites,setFavorites]=useState<string[]>(()=>{try{return JSON.parse(localStorage.getItem('marevia-favorites')||'[]')}catch{return []}});useEffect(()=>localStorage.setItem('marevia-favorites',JSON.stringify(favorites)),[favorites]);const toggle=(id:string)=>setFavorites(v=>v.includes(id)?v.filter(x=>x!==id):[...v,id]);return <C.Provider value={{favorites,toggle}}>{children}</C.Provider>}
export function useFavorites(){const v=useContext(C);if(!v)throw new Error('useFavorites precisa estar dentro de FavoritesProvider');return v}
