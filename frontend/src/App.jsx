import { useState } from 'react'
import './App.css'
import Header from './components/Header'
import Auth from './pages/Auth'

function App() {
  return (
    <main className="app">
      {/* La barre de navigation s'étend sur toute la largeur */}
      <Header />

      {/* Contenu principal sous la barre de navigation */}
      <Auth/>

      <footer className="app-footer">
        <p>Footer</p>
      </footer>
    </main>
  )
}

export default App
