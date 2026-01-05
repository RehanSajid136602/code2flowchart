'use client'

import React from 'react'
import { Github, Twitter, Linkedin, Mail, Zap, Code2, Shield, Users, Rocket, Star, ArrowLeft } from 'lucide-react'

const features = [
  {
    icon: <Zap className="h-6 w-6" />,
    title: 'AI-Powered Analysis',
    description: 'Advanced AI models detect bugs, estimate complexity, and optimize your code automatically',
  },
  {
    icon: <Code2 className="h-6 w-6" />,
    title: 'Bidirectional Sync',
    description: 'Write code and watch your flowchart update, or edit diagrams and see code change',
  },
  {
    icon: <Shield className="h-6 w-6" />,
    title: 'Secure & Reliable',
    description: 'Built with Firebase for secure authentication and reliable project storage',
  },
  {
    icon: <Rocket className="h-6 w-6" />,
    title: 'Fast & Responsive',
    description: 'Lightning-fast performance with a modern, mobile-friendly interface',
  },
]

const techStack = [
  {
    name: 'Next.js 16',
    description: 'React framework with App Router for optimal performance',
  },
  {
    name: 'React 19',
    description: 'Latest React with advanced hooks and concurrent features',
  },
  {
    name: 'TypeScript',
    description: 'Type-safe development with strict mode enabled',
  },
  {
    name: 'React Flow',
    description: 'Professional node-based flowchart library',
  },
  {
    name: 'Firebase',
    description: 'Authentication, real-time database, and hosting',
  },
  {
    name: 'Gemini & Groq AI',
    description: 'State-of-the-art AI models for intelligent code analysis',
  },
]

const team = [
  {
    name: 'LogicFlow AI Team',
    role: 'Development Team',
    description: 'Passionate developers building the future of code visualization',
  },
]

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-5xl font-bold text-white mb-2">About LogicFlow AI</h1>
            </div>
            <button
              onClick={() => window.location.href = '/'}
              className="flex items-center gap-2 px-6 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-medium rounded-lg transition-all"
            >
              <ArrowLeft className="h-5 w-5" />
              Back to Website
            </button>
          </div>
          <p className="text-slate-400 text-xl max-w-3xl mx-auto mb-8">
            Transforming how developers visualize, understand, and optimize their code with the power of artificial intelligence
          </p>
        </div>

        <div className="bg-slate-900/50 rounded-2xl p-12 backdrop-blur-sm border border-slate-800 mb-12">
          <h2 className="text-3xl font-bold text-white mb-8 flex items-center gap-3">
            <Star className="h-8 w-8 text-yellow-400" />
            Key Features
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {features.map((feature, idx) => (
              <div
                key={idx}
                className="bg-slate-800/50 rounded-xl p-6 border border-slate-700 hover:border-slate-600 transition-all"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-blue-600/20 rounded-lg">{feature.icon}</div>
                  <h3 className="text-xl font-semibold text-white">{feature.title}</h3>
                </div>
                <p className="text-slate-300 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-slate-900/50 rounded-2xl p-12 backdrop-blur-sm border border-slate-800 mb-12">
          <h2 className="text-3xl font-bold text-white mb-8 flex items-center gap-3">
            <Code2 className="h-8 w-8 text-green-400" />
            Technology Stack
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {techStack.map((tech, idx) => (
              <div
                key={idx}
                className="bg-slate-800/50 rounded-xl p-6 border border-slate-700"
              >
                <h3 className="text-lg font-bold text-white mb-2">{tech.name}</h3>
                <p className="text-slate-400 text-sm">{tech.description}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-slate-900/50 rounded-2xl p-12 backdrop-blur-sm border border-slate-800 mb-12">
          <h2 className="text-3xl font-bold text-white mb-8 flex items-center gap-3">
            <Users className="h-8 w-8 text-blue-400" />
            Our Mission
          </h2>
          <div className="space-y-6 text-lg text-slate-300 leading-relaxed">
            <p>
              At LogicFlow AI, we believe that great software should be intuitive, powerful, and accessible. Our mission is to bridge the gap between code and visual understanding, making it easier for developers of all skill levels to create, understand, and optimize complex logic.
            </p>
            <p>
              We leverage cutting-edge AI technology to provide real-time analysis, bug detection, and smart suggestions, helping you write better code faster. Whether you're building algorithms, designing workflows, or documenting logic, LogicFlow AI is your intelligent companion.
            </p>
          </div>
        </div>

        <div className="bg-slate-900/50 rounded-2xl p-12 backdrop-blur-sm border border-slate-800 mb-12">
          <h2 className="text-3xl font-bold text-white mb-8 flex items-center gap-3">
            <Zap className="h-8 w-8 text-blue-400" />
            Connect With Us
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <a
              href="https://github.com/RehanSajid136602/code2flowchart"
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center gap-3 p-6 bg-slate-800 hover:bg-slate-700 rounded-xl transition-all border border-slate-700 group"
            >
              <Github className="h-8 w-8 text-slate-400 group-hover:text-white transition-colors" />
              <span className="text-white font-medium">GitHub</span>
            </a>
            <a
              href="https://twitter.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center gap-3 p-6 bg-slate-800 hover:bg-slate-700 rounded-xl transition-all border border-slate-700 group"
            >
              <Twitter className="h-8 w-8 text-slate-400 group-hover:text-white transition-colors" />
              <span className="text-white font-medium">Twitter</span>
            </a>
            <a
              href="https://linkedin.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center gap-3 p-6 bg-slate-800 hover:bg-slate-700 rounded-xl transition-all border border-slate-700 group"
            >
              <Linkedin className="h-8 w-8 text-slate-400 group-hover:text-white transition-colors" />
              <span className="text-white font-medium">LinkedIn</span>
            </a>
          </div>
          <div className="mt-8 pt-8 border-t border-slate-700">
            <a
              href="mailto:contact@logicflowai.com"
              className="flex items-center justify-center gap-3 text-slate-300 hover:text-white transition-colors"
            >
              <Mail className="h-6 w-6" />
              <span>contact@logicflowai.com</span>
            </a>
          </div>
        </div>

        <div className="bg-slate-900/50 rounded-2xl p-12 backdrop-blur-sm border border-slate-800 mb-12">
          <h2 className="text-3xl font-bold text-white mb-6">Our Team</h2>
          <div className="space-y-6">
            {team.map((member, idx) => (
              <div
                key={idx}
                className="bg-slate-800/50 rounded-xl p-6 border border-slate-700"
              >
                <h3 className="text-xl font-bold text-white mb-2">{member.name}</h3>
                <p className="text-slate-400 mb-3">{member.role}</p>
                <p className="text-slate-300 leading-relaxed">{member.description}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="text-center mt-16 space-y-4">
          <button
            onClick={() => window.location.href = '/'}
            className="inline-flex items-center gap-2 px-8 py-3 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl transition-all"
          >
            Start Building Today
            <Rocket className="h-5 w-5" />
          </button>
          <button
            onClick={() => window.location.href = '/guide'}
            className="inline-flex items-center gap-2 px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white font-medium rounded-xl transition-all border border-slate-700"
          >
            View Guide
            <Code2 className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  )
}
