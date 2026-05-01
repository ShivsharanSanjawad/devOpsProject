import React from 'react'
import Hero from '../components/Landingpage/Hero'
import Navbar from '../components/Landingpage/Navbar'
import FeaturesGrid from '../components/Landingpage/FeaturesGrid'
import Leaderboard from '../components/Landingpage/Leaderboard'
import CTASection from '../components/Landingpage/CTASection'
import Footer from '../components/Landingpage/Footer'
import GameModes from '../components/Landingpage/GameModes'

const Landingpage = () => {
  return (
    <div>
      <Navbar />
      <Hero />
      <FeaturesGrid/>
      <GameModes />
      <Leaderboard />
      <CTASection />
      <Footer />
    </div>
  )
}

export default Landingpage