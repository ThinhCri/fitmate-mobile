import {beforeEach,describe,expect,it,vi} from 'vitest';
const store=vi.hoisted(()=>new Map<string,string>());
vi.mock('expo-secure-store',()=>({getItemAsync:vi.fn(async(key:string)=>store.get(key)??null),setItemAsync:vi.fn(async(key:string,value:string)=>{store.set(key,value);})}));
import {getLoginEmails,rememberLoginEmail,removeLoginEmail} from '../loginEmailHistory';
beforeEach(()=>store.clear());
describe('successful login email history',()=>{
 it('deduplicates addresses and keeps only the last five',async()=>{for(let i=0;i<6;i++)await rememberLoginEmail('person'+i+'@example.test');await rememberLoginEmail('PERSON3@example.test');const emails=await getLoginEmails();expect(emails).toHaveLength(5);expect(emails[0]).toBe('PERSON3@example.test');expect(emails.filter(v=>v.toLowerCase()==='person3@example.test')).toHaveLength(1);expect(emails).not.toContain('person0@example.test');});
 it('allows forgetting one address without clearing the others',async()=>{await rememberLoginEmail('a@example.test');await rememberLoginEmail('b@example.test');await removeLoginEmail('A@example.test');expect(await getLoginEmails()).toEqual(['b@example.test']);});
 it('ignores corrupt storage and invalid input',async()=>{store.set('fitmate_login_email_history','broken');expect(await getLoginEmails()).toEqual([]);await rememberLoginEmail('invalid');expect(await getLoginEmails()).toEqual([]);});
});
