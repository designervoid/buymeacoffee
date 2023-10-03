/* @refresh reload */
import { render } from 'solid-js/web'
import { Router, Route, Routes } from "@solidjs/router";

import './index.css'
import App from './App'
import { AnotherPage } from './pages/AnotherPage';
import { TonConnectUIProvider } from './context/TonConnectUI';
import { Buffer } from 'buffer';
window.Buffer = Buffer;

const root = document.getElementById('root')


render(() => (
  <TonConnectUIProvider manifestUrl="https://about.systemdesigndao.xyz/ton-connect.manifest.json">
    <Router>
      <Routes>
        <Route path="/" component={App} />
        <Route path="/another-page" component={AnotherPage} />
      </Routes>
    </Router>
  </TonConnectUIProvider>
), root!)
