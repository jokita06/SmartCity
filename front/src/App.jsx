import React from "react"
import { BrowserRouter } from "react-router-dom"
import { RotasPublicas } from "./rotas/Rotas"

function App() {

  return (
    <BrowserRouter>
      <RotasPublicas />
    </BrowserRouter>
  )
}

export default App