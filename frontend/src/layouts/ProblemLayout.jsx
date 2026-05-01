import React from 'react'
import { Outlet } from 'react-router-dom'; 

import Navbar from "../components/Homepage/Navbar";

const ProblemLayout = () => {
  return (
    <div >
        <Navbar />
      <Outlet />
    </div>
  )
}

export default ProblemLayout