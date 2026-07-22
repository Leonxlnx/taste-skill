'use client'
import {useState} from 'react'

// Taste Blocks: animata-disclose-image. Behavior preserved; styling adapted to CSS modules-free Next.
export default function DiscloseImage({className='',doorClassName='',onLoad,vertical=false,...props}){
  const [loaded,setLoaded]=useState(false)
  return <div className="disclose">
    <img {...props} className={className} onLoad={e=>{setLoaded(true);onLoad?.(e)}}/>
    <span aria-hidden="true" className={`door door-a ${vertical?'vertical':''} ${loaded?'open':''} ${doorClassName}`}/>
    <span aria-hidden="true" className={`door door-b ${vertical?'vertical':''} ${loaded?'open':''} ${doorClassName}`}/>
  </div>
}
