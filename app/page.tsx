'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import Header from "./components/Header"
import { Button } from './components/ui'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function InlyneHomepage() {
  const router = useRouter()
  const [dockey, setDockey] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const key = dockey.trim()
    if (!key) return

    // if you want to force external URLs, uncomment:
    // window.location.href = target.startsWith('http') ? target : `https://${target}`
    router.push(`editor/${key}`)
  }

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
          <motion.div
            className="mt-10 flex flex-col items-center space-y-4"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <Link href="/login" passHref>
              <Button size="lg" className="cursor-pointer">Login</Button>
            </Link>

            <form onSubmit={handleSubmit} className="flex space-x-2">
              <input
                type="text"
                id="dockey"
                value={dockey}
                onChange={x => setDockey(x.target.value)}
                className="w-80 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                placeholder="Input Dockey or URL"
              />
              <Button type="submit" className="cursor-pointer" size="lg">Go</Button>
            </form>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="shadow-[0_-2px_4px_rgba(0,0,0,0.1),0_2px_4px_rgba(0,0,0,0.1)] pt-6 pb-4 text-center text-sm text-gray-600 dark:text-gray-400">
        © {new Date().getFullYear()} Inlyne. All rights reserved.
      </footer>
    </div>
  )
}
