import React from 'react';
import {createRequire} from 'node:module';
import {describe,it,expect,vi} from 'vitest';
const state=vi.hoisted(()=>({keyboard:true}));
const {renderToStaticMarkup}=createRequire(import.meta.url)('react-dom/server') as {renderToStaticMarkup:(element:React.ReactNode)=>string};
vi.mock('react-native',async()=>{const {createElement:h}=await import('react');const box=({children}:{children?:React.ReactNode})=>h('div',null,children);return {Modal:box,View:box,Text:box,TouchableOpacity:box,TouchableWithoutFeedback:box,Platform:{OS:'android'},StyleSheet:{create:(s:unknown)=>s},Keyboard:{isVisible:()=>state.keyboard,addListener:()=>({remove:()=>{}})},KeyboardAvoidingView:({children,behavior}:{children:React.ReactNode;behavior:string})=>h('main',{'data-behavior':behavior},children)};});
vi.mock('react-native-safe-area-context',async()=>{const {createElement:h}=await import('react');return {SafeAreaProvider:({children}:{children:React.ReactNode})=>h('aside',null,children),SafeAreaView:({children,edges}:{children:React.ReactNode;edges:string[]})=>h('section',{'data-edges':edges.join(',')},children)};});
vi.mock('lucide-react-native',()=>({X:()=>null}));
import {ModalShell} from '@/components/design-system/ModalShell';
describe('modal keyboard docking',()=>{
 it('keeps the complete bottom sheet within Android keyboard avoidance without a double bottom inset',()=>{state.keyboard=true;const html=renderToStaticMarkup(<ModalShell visible onClose={()=>{}} title="Tên cuộc trò chuyện"><span>Ô nhập</span></ModalShell>);expect(html).toMatch(/<main data-behavior="height">.*<section data-edges="left,right">.*Ô nhập.*<\/section>.*<\/main>/s);});
 it('restores bottom safe area when keyboard is hidden',()=>{state.keyboard=false;expect(renderToStaticMarkup(<ModalShell visible onClose={()=>{}}><span>Ô nhập</span></ModalShell>)).toContain('data-edges="bottom,left,right"');});
});
