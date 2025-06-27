"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CheckCircle, Target, Lightbulb, ArrowRight, BookOpen } from "lucide-react"

interface Challenge {
  id: string
  title: string
  description: string
  requiredBlocks: string[]
  solution: string
  hint: string
}

interface ChallengePanelProps {
  challenge: Challenge
  isCompleted: boolean
  onNextChallenge: () => void
}

export default function ChallengePanel({ challenge, isCompleted, onNextChallenge }: ChallengePanelProps) {
  return (
    <Card className="m-4 p-4 bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200">
      <div className="flex items-center gap-2 mb-3">
        <Target className="w-5 h-5 text-purple-600" />
        <h3 className="font-bold text-purple-800 flex-1">{challenge.title}</h3>
        {isCompleted && <CheckCircle className="w-5 h-5 text-green-500" />}
      </div>

      <p className="text-sm text-gray-700 mb-4">{challenge.description}</p>

      <div className="space-y-3">
        <div>
          <h4 className="text-xs font-semibold text-gray-600 mb-2 flex items-center gap-1">
            <BookOpen className="w-3 h-3" />
            Required Block Types:
          </h4>
          <div className="flex flex-wrap gap-1">
            {challenge.requiredBlocks.map((block, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                {block.replace(/([A-Z])/g, " $1").trim()}
              </Badge>
            ))}
          </div>
        </div>

        <div>
          <h4 className="text-xs font-semibold text-gray-600 mb-2 flex items-center gap-1">
            <Lightbulb className="w-3 h-3" />
            Hint:
          </h4>
          <div className="text-xs bg-yellow-50 p-2 rounded-lg border border-yellow-200">{challenge.hint}</div>
        </div>

        <div>
          <h4 className="text-xs font-semibold text-gray-600 mb-2">🎯 Expected Solution:</h4>
          <div className="text-xs bg-white/50 p-2 rounded-lg border border-purple-200 font-mono">
            {challenge.solution}
          </div>
        </div>

        {isCompleted && (
          <div className="pt-2">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span className="text-sm font-semibold text-green-700">Challenge Completed!</span>
            </div>
            <Button onClick={onNextChallenge} className="w-full bg-green-500 hover:bg-green-600" size="sm">
              Next Challenge <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        )}
      </div>
    </Card>
  )
}
