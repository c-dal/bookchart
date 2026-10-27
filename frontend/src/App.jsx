import { useState } from 'react'
import './App.css'
import Header from './components/Header'

function App() {
  return (
    <main className="app">
      {/* La barre de navigation s'étend sur toute la largeur */}
      <Header />

      {/* Contenu principal sous la barre de navigation */}
      <section className="main-content">
        <h2>Interface de base</h2>
        <p>
          blblblblblbllbblbllblb
        </p>
      </section>

      <footer className="app-footer">
        <p>Footer</p>
      </footer>
    </main>
  )
}

export default App
