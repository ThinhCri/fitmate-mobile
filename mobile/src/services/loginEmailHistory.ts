import * as SecureStore from 'expo-secure-store';
const KEY='fitmate_login_email_history';
let queue:Promise<unknown>=Promise.resolve();
const valid=(value:unknown):value is string=>typeof value==='string' && value.length<=254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
export async function getLoginEmails():Promise<string[]> {try{const data:unknown=JSON.parse(await SecureStore.getItemAsync(KEY) || '[]');return Array.isArray(data)?data.filter(valid).slice(0,5):[];}catch{return [];}}
function update(change:(emails:string[])=>string[]) {const next=queue.then(async()=>{await SecureStore.setItemAsync(KEY,JSON.stringify(change(await getLoginEmails())));});queue=next.catch(()=>{});return next;}
export function rememberLoginEmail(email:string) {const value=email.trim();if(!valid(value))return Promise.resolve();return update(emails=>[value,...emails.filter(item=>item.toLowerCase()!==value.toLowerCase())].slice(0,5));}
export function removeLoginEmail(email:string) {return update(emails=>emails.filter(item=>item.toLowerCase()!==email.toLowerCase()));}
