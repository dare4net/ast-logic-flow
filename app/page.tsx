"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import LogicFlowBuilder from "./components/logic-flow-builder"
import { Play, BookOpen, Trophy } from "lucide-react"

export default function HomePage() {
  const [gameMode, setGameMode] = useState<"practice" | "challenge">("practice")
  const [codeMode, setCodeMode] = useState<"logic" | "javascript" | "python">("logic")
  const [showGame, setShowGame] = useState(false)

  if (showGame) {
    return (
      <LogicFlowBuilder
        gameMode={gameMode}
        codeMode={codeMode}
        onBack={() => setShowGame(false)}
        onGameModeChange={setGameMode}
        onCodeModeChange={setCodeMode}
      />
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-800 mb-4">🧩 Logic Flow Builder</h1>
          <p className="text-lg md:text-xl text-gray-600 mb-2">Drag-to-Connect Logic Game</p>
          <p className="text-gray-500">Learn programming concepts through visual flow blocks!</p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <Card className="p-6 bg-white/80 backdrop-blur-sm border-2 border-blue-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">🎯</div>
              <h3 className="text-xl font-bold text-gray-800">Core Concepts</h3>
            </div>
            <ul className="space-y-2 text-gray-600">
              <li>• Variables & Data Storage</li>
              <li>• Conditionals (if, else, switch)</li>
              <li>• Loops (while, do-while, for)</li>
              <li>• Functions & Procedures</li>
              <li>• Boolean Logic & Comparisons</li>
            </ul>
          </Card>

          <Card className="p-6 bg-white/80 backdrop-blur-sm border-2 border-green-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">🎮</div>
              <h3 className="text-xl font-bold text-gray-800">Challenge Modes</h3>
            </div>
            <ul className="space-y-2 text-gray-600">
              <li>• Variable Management</li>
              <li>• Counter Programs</li>
              <li>• Decision Trees</li>
              <li>• Loop Challenges</li>
              <li>• Function Building</li>
            </ul>
          </Card>
        </div>

        {/* Mode Selection */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 mb-8 border-2 border-purple-200">
          <h3 className="text-xl font-bold text-gray-800 mb-4 text-center">Choose Your Mode</h3>

          <div className="grid md:grid-cols-2 gap-4 mb-6">
            <Button
              variant={gameMode === "practice" ? "default" : "outline"}
              onClick={() => setGameMode("practice")}
              className="h-16 text-lg rounded-2xl"
            >
              <BookOpen className="w-6 h-6 mr-2" />
              Practice Mode
            </Button>
            <Button
              variant={gameMode === "challenge" ? "default" : "outline"}
              onClick={() => setGameMode("challenge")}
              className="h-16 text-lg rounded-2xl"
            >
              <Trophy className="w-6 h-6 mr-2" />
              Challenge Mode
            </Button>
          </div>

          <div className="flex flex-wrap gap-2 justify-center mb-6">
            <Badge
              variant={codeMode === "logic" ? "default" : "outline"}
              className="cursor-pointer px-4 py-2 text-sm"
              onClick={() => setCodeMode("logic")}
            >
              Logic Only
            </Badge>
            <Badge
              variant={codeMode === "javascript" ? "default" : "outline"}
              className="cursor-pointer px-4 py-2 text-sm"
              onClick={() => setCodeMode("javascript")}
            >
              JS Preview
            </Badge>
            <Badge
              variant={codeMode === "python" ? "default" : "outline"}
              className="cursor-pointer px-4 py-2 text-sm"
              onClick={() => setCodeMode("python")}
            >
              Python Preview
            </Badge>
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center">
          <Button
            onClick={() => setShowGame(true)}
            size="lg"
            className="h-16 px-8 text-xl rounded-2xl bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
          >
            <Play className="w-6 h-6 mr-2" />
            Try Logic Flow Builder
          </Button>
        </div>

        {/* Target Audience */}
        <div className="text-center mt-8 text-gray-500">
          <p>👶 Perfect for kids aged 7+ • Early-stage coders • After-school.tech Level 1-2</p>
        </div>
      </div>
    </div>
  )
}
