import { useState } from 'react'
import reactLogo from './assets/react.svg'
import './App.css'
import { Replays } from './Replays'

function App() {
  return (
    <div className="App">
      {/* <div>
        <a href="https://vitejs.dev" target="_blank">
          <img src="/vite.svg" className="logo" alt="Vite logo" />
        </a>
        <a href="https://reactjs.org" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div> */}
      <header>
        StarCraft II Tournament Replays
      </header>
      <Replays />
    </div>
  )
}

export default App
