'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Header from './components/Header'
import { Button } from './components/ui'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

// make your Button animatable
const MotionButton = motion(Button)

export default function InlyneHomepage() {
  const router = useRouter()
  const [dockey, setDockey] = useState('')
  const [showGuestInput, setShowGuestInput] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const key = dockey.trim()
    if (!key) return
    router.push(`/editor/${key}`)
  }

  // common layout transition settings
  const layoutTrans = { duration: 0.5, ease: 'easeOut' }

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <Header />

      {/* Hero Section */}
      <section className="flex-grow bg-[#f4f4f7]">
        <div className="container mx-auto px-6 py-20 text-center">
          <motion.h2
            className="text-4xl md:text-6xl font-extrabold leading-tight"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            Seamless Documentation<br /> Anywhere, Anytime
          </motion.h2>

          <motion.p
            className="mt-6 text-lg max-w-2xl mx-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            Inlyne empowers your team with organized documentation and resources to boost productivity and collaboration.
          </motion.p>

          {/* PARENT: animates on scale/opacity + reflows children smoothly */}
          <motion.div
            layout
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{
              scale: { type: 'spring', stiffness: 300, damping: 20 },
              opacity: { duration: 0.4 },
              layout: layoutTrans,
            }}
            className="mt-10 flex justify-center items-center space-x-4"
          >
            {/* LOGIN: now motion-enabled for smooth position tween */}
            <motion.div
              layout="position"
              transition={{ layout: layoutTrans }}
            >
              <Link href="/login" passHref>
                <Button size="lg">Login</Button>
              </Link>
            </motion.div>

            {/* GUEST AREA: expands into input + Go */}
            <motion.form onSubmit={handleSubmit} className="flex items-center space-x-2">
              {/* wrapper that grows/contracts */}
              <motion.div
                layout
                transition={{
                  layout: layoutTrans,
                  type: 'spring',
                  stiffness: 150,
                  damping: 20,
                }}
                className="overflow-hidden"
              >
                <AnimatePresence initial={false} mode="wait">
                  {!showGuestInput ? (
                    <MotionButton
                      key="guest-btn"
                      size="lg"
                      onClick={() => setShowGuestInput(true)}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0, transition: { duration: 0.2, ease: 'easeOut' } }}
                      transition={{ duration: 0.3, ease: 'easeOut' }}
                    >
                      Continue as Guest
                    </MotionButton>
                  ) : (
                    <motion.input
                      key="guest-input"
                      type="text"
                      value={dockey}
                      onChange={(e) => setDockey(e.target.value)}
                      placeholder="Enter Dockey or URL"
                      className="w-64 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-xl p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0, transition: { duration: 0.2, ease: 'easeOut' } }}
                      transition={{ duration: 0.3, ease: 'easeOut' }}
                    />
                  )}
                </AnimatePresence>
              </motion.div>

              {/* GO BUTTON */}
              <AnimatePresence>
                {showGuestInput && (
                  <MotionButton
                    key="go-btn"
                    type="submit"
                    size="lg"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4, duration: 0.3, ease: 'easeOut' }}
                  >
                    Go
                  </MotionButton>
                )}
              </AnimatePresence>
            </motion.form>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="shadow-[0_-2px_4px_rgba(0,0,0,0.1),0_2px_4px_rgba(0,0,0,0.1)] bg-[#f4f4f7] pt-6 pb-4 text-center text-sm text-gray-600 dark:text-gray-400">
        © {new Date().getFullYear()} Inlyne. All rights reserved.
      </footer>
    </div>
  )
}
