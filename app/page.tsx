'use client'

import React from 'react';
import { motion } from 'framer-motion';
import Header from "./components/Header";
import { Button } from './components/ui';
import { Card, CardContent, CardHeader } from './components/ui';
import { Zap as Lightning, Users, Globe } from 'lucide-react';
import Link from 'next/link';

export default function InlyneHomepage() {
  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      < Header/>

      {/* Hero Section */}
      <section className="flex-grow bg-gradient-to-r from-indigo-500 to-blue-500">
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
            className="mt-10"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.5 }}
          > <Link href="/home" passHref>
            <Button size="lg">Go to Home</Button>
          </Link>
          </motion.div>
    
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="container mx-auto px-6 py-16">
        <h3 className="text-3xl font-semibold text-center mb-12">Key Features</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card className="shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="flex items-center space-x-4">
              <Lightning className="w-6 h-6 text-indigo-500" />
              <h4 className="font-medium">Real-time Sync</h4>
            </CardHeader>
            <CardContent>
              Changes propagate instantly across all platforms, ensuring everthing is up-to-date.
            </CardContent>
          </Card>

          <Card className="shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="flex items-center space-x-4">
              <Users className="w-6 h-6 text-green-500" />
              <h4 className="font-medium">Boost Productivity</h4>
            </CardHeader>
            <CardContent>
              Allows your team to access the documentation and resources they need, when they need them.
            </CardContent>
          </Card>

          <Card className="shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="flex items-center space-x-4">
              <Globe className="w-6 h-6 text-blue-500" />
              <h4 className="font-medium">Accessibility</h4>
            </CardHeader>
            <CardContent>
              Connect from any device at any time.
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t pt-6 pb-4 text-center text-sm text-gray-600 dark:text-gray-400">
        © {new Date().getFullYear()} Inlyne. All rights reserved.
      </footer>
    </div>
  );
}
