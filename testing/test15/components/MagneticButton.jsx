'use client'
import {useRef} from 'react'

// Adapted from Taste Blocks registry component magnetic-button.
export default function MagneticButton({href,children}){
  const ref=useRef(null)
  function move(e){const r=ref.current.getBoundingClientRect();ref.current.style.transform=`translate(${(e.clientX-r.left-r.width/2)*.14}px,${(e.clientY-r.top-r.height/2)*.14}px)`}
  function reset(){ref.current.style.transform='translate(0,0)'}
  return <a ref={ref} className="magnetic" href={href} onPointerMove={move} onPointerLeave={reset}>{children}<span aria-hidden="true">↘</span></a>
}
