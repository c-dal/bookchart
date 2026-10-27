import { useState } from 'react'
import './App.css'
import Header from './components/Header'
import Auth from './pages/Auth'
import Library from './pages/Library'

function App() {
  return (
    <main className="app">
      {/* La barre de navigation s'étend sur toute la largeur */}
      <Header />

      {/* Contenu principal sous la barre de navigation */}
      <Library />

      <footer className="app-footer">
      </footer>
    </main>
  )
}

export default App
