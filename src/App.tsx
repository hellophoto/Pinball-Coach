import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <div>
        <a href="https://vite.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Vite + React</h1>
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <p>
          Edit <code>src/App.tsx</code> and save to test HMR
        </p>
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
      <div className="mt-8">
        <h2 className="text-2xl font-bold mb-4">Pinball Coach</h2>
        <div className="flex justify-center items-center gap-4">
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-2">Original Logo</p>
            <img 
              src="/pinball-coach-logo.svg" 
              alt="Pinball Coach Logo" 
              className="h-[100px] w-auto"
            />
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-2">PNG Version</p>
            <img 
              src="/pinball-coach-logo.png" 
              alt="Pinball Coach Logo PNG" 
              className="h-[100px] w-auto"
            />
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-2">Smaller Size</p>
            <img 
              src="/pinball-coach-logo.svg" 
              alt="Pinball Coach Logo Small" 
              className="h-[60px] w-auto"
            />
          </div>
        </div>
      </div>
    </>
  )
}

export default App
