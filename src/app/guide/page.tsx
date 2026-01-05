'use client'

import React from 'react'
import { ArrowRight, Code2, GitBranch, Save, Zap, AlertCircle } from 'lucide-react'

const steps = [
  {
    id: 1,
    title: 'Create Your Account',
    description: 'Sign up with Google or email to get started with LogicFlow AI',
    icon: <Code2 className="h-8 w-8" />,
    details: [
      'Click "Sign Up" in the top right',
      'Choose Google sign-in for instant access',
      'Or use email/password to create an account',
      'Verify your email to activate all features',
    ],
  },
  {
    id: 2,
    title: 'Create Your First Project',
    description: 'Start building your logic flowcharts with our intuitive editor',
    icon: <GitBranch className="h-8 w-8" />,
    details: [
      'Click "New Project" to create a blank canvas',
      'Give your project a meaningful name',
      'Start typing your code in the editor',
      'Watch the flowchart build in real-time',
    ],
  },
  {
    id: 3,
    title: 'Code to Flowchart',
    description: 'Let AI convert your code into visual diagrams automatically',
    icon: <Zap className="h-8 w-8" />,
    details: [
      'Write your code in the left editor',
      'The diagram updates instantly as you type',
      'Nodes represent different code constructs',
      'Connect nodes to show flow and logic',
    ],
  },
  {
    id: 4,
    title: 'Flowchart to Code',
    description: 'Edit the diagram and generate working code',
    icon: <Code2 className="h-8 w-8" />,
    details: [
      'Drag and drop nodes to arrange your flow',
      'Click nodes to edit their content',
      'The code editor updates automatically',
      'Copy the generated code when ready',
    ],
  },
  {
    id: 5,
    title: 'Save & Organize',
    description: 'Never lose your work with smart project management',
    icon: <Save className="h-8 w-8" />,
    details: [
      'Projects save automatically as you work',
      'Use the projects modal to organize your work',
      'Access any project from your dashboard',
      'Export your work anytime',
    ],
  },
  {
    id: 6,
    title: 'Analyze & Debug',
    description: 'Use AI to find bugs and optimize your logic',
    icon: <AlertCircle className="h-8 w-8" />,
    details: [
      'Click "Analyze" to check for issues',
      'AI detects deadlocks and infinite loops',
      'Get complexity estimates for your algorithms',
      'Apply suggested fixes with one click',
    ],
  },
]

const tips = [
  'Use keyboard shortcuts for faster editing',
  'Create versions before making big changes',
  'Use the tracer to step through your logic',
  'Check the history to see what changed',
  'Export your projects as backup regularly',
]

export default function GuidePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <div className="mb-12">
          <h1 className="text-5xl font-bold text-white mb-4">How to Use LogicFlow AI</h1>
          <p className="text-slate-400 text-xl">
            Your complete guide to creating code, building flowcharts, and harnessing the power of AI
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {steps.map((step) => (
            <div
              key={step.id}
              className="bg-slate-900/50 rounded-2xl p-8 backdrop-blur-sm border border-slate-800 hover:border-slate-700 transition-all"
            >
              <div className="flex items-start gap-4 mb-6">
                <div className="p-3 bg-blue-600 rounded-xl shrink-0">
                  {step.icon}
                </div>
                <div className="flex-1">
                  <div className="text-sm text-blue-400 font-mono mb-2">STEP {step.id}</div>
                  <h2 className="text-2xl font-bold text-white mb-3">{step.title}</h2>
                  <p className="text-slate-300 text-lg">{step.description}</p>
                </div>
              </div>

              <ul className="space-y-3">
                {step.details.map((detail, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <ArrowRight className="h-5 w-5 text-blue-400 mt-0.5 shrink-0" />
                    <span className="text-slate-400">{detail}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="bg-slate-900/50 rounded-2xl p-8 backdrop-blur-sm border border-slate-800 mb-12">
          <div className="flex items-center gap-3 mb-6">
            <Zap className="h-8 w-8 text-yellow-400" />
            <h2 className="text-2xl font-bold text-white">Quick Tips</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {tips.map((tip, idx) => (
              <div
                key={idx}
                className="bg-slate-800/50 rounded-lg p-4 border border-slate-700"
              >
                <p className="text-slate-300">💡 {tip}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="text-center">
          <button
            onClick={() => window.location.href = '/'}
            className="inline-flex items-center gap-2 px-8 py-3 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl transition-all"
          >
            Try It Now
            <ArrowRight className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  )
}
