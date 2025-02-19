import { useState } from 'react'
import Component from './Component'
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
      <div>
        <Component />
      </div>
  )
}

export default App
