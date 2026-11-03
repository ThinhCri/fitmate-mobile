export class RequestTimeoutError extends Error { constructor(){super('Request timed out');this.name='RequestTimeoutError';} }
export async function withRequestDeadline<T>(signals: (AbortSignal | null | undefined)[], work:(signal:AbortSignal)=>Promise<T>, timeoutMs=30000):Promise<T> {
 const controller=new AbortController();const sources=signals.filter(Boolean) as AbortSignal[];
 let rejectStop:(error:Error)=>void=()=>{};
 const stopped=new Promise<never>((_,reject)=>{rejectStop=reject;});
 const abort=()=>{controller.abort();const error=new Error('Request cancelled');error.name='AbortError';rejectStop(error);};
 const timer=setTimeout(()=>{controller.abort();rejectStop(new RequestTimeoutError());},timeoutMs);
 for(const source of sources) source.addEventListener('abort',abort,{once:true});
 try {if(sources.some(source=>source.aborted))abort();if(controller.signal.aborted)return await stopped;return await Promise.race([work(controller.signal),stopped]);}
 finally {clearTimeout(timer);for(const source of sources)source.removeEventListener('abort',abort);}
}
