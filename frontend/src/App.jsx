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
        <h2>Teste ton nouveau style</h2>
        <p>
          Si ton index.css est bien chargé, les couleurs, les polices,
          les espacements et les styles globaux devraient apparaître ici.
        </p>
      </section>

      <footer className="app-footer">
        <p>BookChart · Ton aventure littéraire commence ici.</p>
      </footer>
    </main>
  )
}

export default App
