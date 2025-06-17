
import { Outlet } from "react-router-dom"
import { Nav } from "../componentes/Nav/Nav"
import './index.css'

export function Index() {
  return (
    <>
      <Nav />
      <Outlet />
    </>
  )
}