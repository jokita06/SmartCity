
import { Outlet } from "react-router-dom"
import { Nav } from "../componentes/Nav/Nav"
import { Footer } from "../componentes/footer/Footer"
import './index.css'

export function Index() {
  return (
    <>
      <Nav />
      <Outlet />
      <Footer />
    </>
  )
}
