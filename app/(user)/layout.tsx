import Footer from '@/components/Footer'
import Navbar from '@/components/Navbar'
import React from 'react'

export default function layout({children}:React.PropsWithChildren) {
  return (
    <div>
        <Navbar/>
        {children}
        <Footer/>
    </div>
  )
}
