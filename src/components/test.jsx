import React, { useEffect, useState } from 'react'

function Test() {
    const [rand, setRand] = useState(null)
    useEffect(()=> {
        setRand(Math.random())
    }, [])
  return (
    <div>
        <p style={{ color: 'red' }}>Test: {rand}</p>
    </div>
  )
} 

export default Test