import { useState } from 'react'
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom'
import { Menu, X } from 'lucide-react'
import CoachingPlaybook from './pages/CoachingPlaybook'
import StrategyBuilder from './pages/StrategyBuilder'
import TournamentPrep from './pages/TournamentPrep'
import PracticeLog from './pages/PracticeLog'
import Home from './pages/Home'

function App() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
        {/* Navigation */}
        <nav className="bg-black/30 backdrop-blur-sm border-b border-purple-500/30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              {/* Logo */}
              <Link to="/" className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-xl">PC</span>
                </div>
                <span className="text-white font-bold text-xl hidden sm:block">Pinball Coach</span>
              </Link>

              {/* Desktop Navigation */}
              <div className="hidden md:flex space-x-8">
                <Link to="/" className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors">
                  Home
                </Link>
                <Link to="/playbook" className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors">
                  Coaching Playbook
                </Link>
                <Link to="/strategy" className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors">
                  Strategy Builder
                </Link>
                <Link to="/tournament" className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors">
                  Tournament Prep
                </Link>
                <Link to="/practice" className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors">
                  Practice Log
                </Link>
              </div>

              {/* Mobile menu button */}
              <button
                onClick={toggleMenu}
                className="md:hidden text-gray-300 hover:text-white p-2"
              >
                {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {isMenuOpen && (
            <div className="md:hidden bg-black/50 backdrop-blur-sm">
              <div className="px-2 pt-2 pb-3 space-y-1">
                <Link
                  to="/"
                  className="text-gray-300 hover:text-white block px-3 py-2 rounded-md text-base font-medium"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Home
                </Link>
                <Link
                  to="/playbook"
                  className="text-gray-300 hover:text-white block px-3 py-2 rounded-md text-base font-medium"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Coaching Playbook
                </Link>
                <Link
                  to="/strategy"
                  className="text-gray-300 hover:text-white block px-3 py-2 rounded-md text-base font-medium"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Strategy Builder
                </Link>
                <Link
                  to="/tournament"
                  className="text-gray-300 hover:text-white block px-3 py-2 rounded-md text-base font-medium"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Tournament Prep
                </Link>
                <Link
                  to="/practice"
                  className="text-gray-300 hover:text-white block px-3 py-2 rounded-md text-base font-medium"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Practice Log
                </Link>
              </div>
            </div>
          )}
        </nav>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/playbook" element={<CoachingPlaybook />} />
            <Route path="/strategy" element={<StrategyBuilder />} />
            <Route path="/tournament" element={<TournamentPrep />} />
            <Route path="/practice" element={<PracticeLog />} />
          </Routes>
        </main>

        {/* Footer */}
        <footer className="bg-black/30 backdrop-blur-sm border-t border-purple-500/30 mt-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="text-center">
              <img src="/pinball-coach-logo.jpg" alt="Pinball Coach" className="h-[60px]" />
              <p className="text-gray-400 text-sm">
                © 2024 Pinball Coach. All rights reserved.
              </p>
            </div>
          </div>
        </footer>
      </div>
    </Router>
  )
}

export default App