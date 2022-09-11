import './App.css'
import { ReplayList } from './ReplayList'

function App() {
  return (
    <div className="App">
      <header>
        StarCraft II Tournament Replays
        <span className="App__sub-heading">
          This site is built with&nbsp;
          <a href="https://reactjs.org/" target="_blank">React</a>,
          hosted on&nbsp;
          <a href="https://pages.cloudflare.com/" target="_blank">Cloudflare Pages</a>
          &nbsp;and&nbsp;
          <a href="https://github.com/ZephyrBlu/sc2.gg" target="_blank">Open Source on GitHub</a>
        </span>
      </header>
      <ReplayList />
    </div>
  )
}

export default App
