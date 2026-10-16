import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { Product } from '../data/products';
export type CartItem = { productId: string; slug: string; name: string; image: string; price: number; size: string; color: string; variantId: string; quantity: number };
type CartContextType = { items: CartItem[]; count: number; subtotal: number; addItem: (product: Product, size: string, color: string, quantity?: number) => void; removeItem: (key: string) => void; setQuantity: (key: string, quantity: number) => void; clear: () => void };
const CartContext = createContext<CartContextType | null>(null);
const keyOf = (i: CartItem) => `${i.productId}:${i.variantId}`;
export function CartProvider({children}:{children:ReactNode}) {
 const [items,setItems] = useState<CartItem[]>(()=>{try{return JSON.parse(localStorage.getItem('marevia-cart')||'[]') as CartItem[]}catch{return []}});
 useEffect(()=>{localStorage.setItem('marevia-cart',JSON.stringify(items))},[items]);
 const addItem = (p:Product,size:string,color:string,quantity=1) => { const v=p.variants.find(x=>x.size===size&&x.color===color); if(!v||v.stock<1)return; setItems(old=>{const found=old.find(i=>keyOf(i)===`${p.id}:${v.id}`); if(found)return old.map(i=>keyOf(i)===keyOf(found)?{...i,quantity:Math.min(v.stock,i.quantity+quantity)}:i); return [...old,{productId:p.id,slug:p.slug,name:p.name,image:p.image,price:p.price,size,color,variantId:v.id,quantity:Math.min(v.stock,quantity)}]}) };
 const removeItem=(key:string)=>setItems(old=>old.filter(i=>keyOf(i)!==key));
 const setQuantity=(key:string,quantity:number)=>setItems(old=>old.map(i=>keyOf(i)===key?{...i,quantity:Math.max(1,Math.min(10,Math.floor(quantity)||1))}:i));
 const value=useMemo(()=>({items,count:items.reduce((s,i)=>s+i.quantity,0),subtotal:items.reduce((s,i)=>s+i.price*i.quantity,0),addItem,removeItem,setQuantity,clear:()=>setItems([])}),[items]);
 return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}
export function useCart(){const c=useContext(CartContext);if(!c)throw new Error('useCart precisa estar dentro de CartProvider');return c}
export { keyOf };
