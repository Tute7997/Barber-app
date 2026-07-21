import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Scissors } from 'lucide-react'

function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-surface text-accent">
      <Scissors className="w-12 h-12 text-primary mb-4" />
      <h1 className="text-3xl font-bold text-primary">LuxeSalon</h1>
      <p className="mt-2 text-accent/70">Barber Shop App — proyecto inicializado correctamente.</p>
    </div>
  )
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
