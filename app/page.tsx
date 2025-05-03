'use client'

import React from 'react';
import { motion } from 'framer-motion';
import Header from "./components/Header";
import { Button } from './components/ui';
import { Card, CardContent, CardHeader } from './components/ui';
import { Zap as Lightning, Users, Globe } from 'lucide-react';

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
            Seamless Connectivity<br /> Anywhere, Anytime
          </motion.h2>
          <motion.p
            className="mt-6 text-lg max-w-2xl mx-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            Inlyne empowers your team with real-time collaboration tools that keep you connected without limits.
          </motion.p>
          <motion.div
            className="mt-10"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <Button size="lg">Start Your Free Trial</Button>
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
              Changes propagate instantly across all devices, ensuring everyone stays on the same page.
            </CardContent>
          </Card>

          <Card className="shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="flex items-center space-x-4">
              <Users className="w-6 h-6 text-green-500" />
              <h4 className="font-medium">Team Collaboration</h4>
            </CardHeader>
            <CardContent>
              Empower your team with shared workspaces, role-based permissions, and built-in chat.
            </CardContent>
          </Card>

          <Card className="shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="flex items-center space-x-4">
              <Globe className="w-6 h-6 text-blue-500" />
              <h4 className="font-medium">Global Access</h4>
            </CardHeader>
            <CardContent>
              Connect from anywhere in the world with enterprise-grade security and uptime.
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
