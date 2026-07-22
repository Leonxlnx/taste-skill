'use client'
import {useState} from 'react'

// Adapted from @taste/animata-disclose-image: caller-sized image with paired disclosure panels.
export default function DiscloseImage({src,alt}){
  const [loaded,setLoaded]=useState(false)
  return <figure className={'disclose '+(loaded?'is-loaded':'')}>
    <img src={src} alt={alt} onLoad={()=>setLoaded(true)}/>
    <i className="panel panel-a" aria-hidden="true"/><i className="panel panel-b" aria-hidden="true"/>
  </figure>
}
