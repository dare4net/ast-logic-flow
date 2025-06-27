"use client"

import type React from "react"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useState } from "react"
import { ChevronDown, ChevronRight } from "lucide-react"

const blockCategories = [
  {
    name: "Flow Control",
    icon: "🚀",
    blocks: [
      {
        type: "start",
        label: "Start",
        icon: "🚀",
        color: "from-blue-200 to-blue-300",
        border: "border-blue-400",
        description: "Program start",
      },
      {
        type: "end",
        label: "End",
        icon: "🏁",
        color: "from-blue-200 to-blue-300",
        border: "border-blue-400",
        description: "Program end",
      },
      {
        type: "action",
        label: "Action",
        icon: "⚡",
        color: "from-pink-200 to-pink-300",
        border: "border-pink-400",
        description: "Do something",
      },
    ],
  },
  {
    name: "Variables",
    icon: "📦",
    blocks: [
      {
        type: "variable",
        label: "Declare Variable",
        icon: "📦",
        color: "from-orange-200 to-orange-300",
        border: "border-orange-400",
        description: "Create variable",
      },
      {
        type: "setVariable",
        label: "Set Variable",
        icon: "📝",
        color: "from-orange-200 to-orange-300",
        border: "border-orange-400",
        description: "Assign value",
      },
      {
        type: "getVariable",
        label: "Get Variable",
        icon: "📋",
        color: "from-orange-200 to-orange-300",
        border: "border-orange-400",
        description: "Read value",
      },
    ],
  },
  {
    name: "Conditionals",
    icon: "❓",
    blocks: [
      {
        type: "if",
        label: "If",
        icon: "❓",
        color: "from-green-200 to-green-300",
        border: "border-green-400",
        description: "Simple if condition",
      },
      {
        type: "ifElse",
        label: "If-Else",
        icon: "🔀",
        color: "from-green-200 to-green-300",
        border: "border-green-400",
        description: "If-else branch",
      },
    ],
  },
  {
    name: "Loops",
    icon: "🔁",
    blocks: [
      {
        type: "while",
        label: "While Loop",
        icon: "🔁",
        color: "from-yellow-200 to-yellow-300",
        border: "border-yellow-400",
        description: "Condition first",
      },
      {
        type: "doWhile",
        label: "Do-While",
        icon: "🔄",
        color: "from-yellow-200 to-yellow-300",
        border: "border-yellow-400",
        description: "Execute first",
      },
      {
        type: "for",
        label: "For Loop",
        icon: "🔢",
        color: "from-yellow-200 to-yellow-300",
        border: "border-yellow-400",
        description: "Counter loop",
      },
    ],
  },
  {
    name: "Functions",
    icon: "⚙️",
    blocks: [
      {
        type: "function",
        label: "Function",
        icon: "⚙️",
        color: "from-indigo-200 to-indigo-300",
        border: "border-indigo-400",
        description: "Define function",
      },
      {
        type: "functionCall",
        label: "Call Function",
        icon: "📞",
        color: "from-indigo-200 to-indigo-300",
        border: "border-indigo-400",
        description: "Execute function",
      },
    ],
  },
  {
    name: "Operations",
    icon: "🧮",
    blocks: [
      {
        type: "comparison",
        label: "Compare",
        icon: "⚖️",
        color: "from-purple-200 to-purple-300",
        border: "border-purple-400",
        description: "Compare values",
      },
      {
        type: "logic",
        label: "Logic Gate",
        icon: "🔀",
        color: "from-purple-200 to-purple-300",
        border: "border-purple-400",
        description: "AND, OR, NOT",
      },
      {
        type: "math",
        label: "Math",
        icon: "🧮",
        color: "from-purple-200 to-purple-300",
        border: "border-purple-400",
        description: "Math operations",
      },
    ],
  },
]

export default function BlockPalette() {
  const [expandedCategories, setExpandedCategories] = useState<string[]>(["Flow Control", "Variables"])

  const toggleCategory = (categoryName: string) => {
    setExpandedCategories((prev) =>
      prev.includes(categoryName) ? prev.filter((name) => name !== categoryName) : [...prev, categoryName],
    )
  }

  const onDragStart = (event: React.DragEvent, nodeType: string, label: string) => {
    event.dataTransfer.setData("application/reactflow", nodeType)
    event.dataTransfer.setData("application/label", label)
    event.dataTransfer.effectAllowed = "move"
  }

  return (
    <div className="w-72 bg-white/90 backdrop-blur-sm border-r border-gray-200 p-4 overflow-y-auto">
      <div className="mb-4">
        <h3 className="text-lg font-bold text-gray-800 mb-2">🧩 Block Palette</h3>
        <p className="text-sm text-gray-600">Drag blocks to the canvas to build your logic flow</p>
      </div>

      <div className="space-y-3">
        {blockCategories.map((category) => (
          <div key={category.name}>
            <button
              onClick={() => toggleCategory(category.name)}
              className="w-full flex items-center gap-2 p-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <span className="text-lg">{category.icon}</span>
              <span className="font-semibold text-gray-800 flex-1 text-left">{category.name}</span>
              {expandedCategories.includes(category.name) ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <ChevronRight className="w-4 h-4" />
              )}
            </button>

            {expandedCategories.includes(category.name) && (
              <div className="mt-2 space-y-2 pl-2">
                {category.blocks.map((block) => (
                  <Card
                    key={block.type}
                    className={`p-3 cursor-grab active:cursor-grabbing hover:shadow-lg transition-all duration-200 bg-gradient-to-r ${block.color} border-2 ${block.border}`}
                    draggable
                    onDragStart={(event) => onDragStart(event, block.type, block.label)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="text-xl">{block.icon}</div>
                      <div className="flex-1">
                        <div className="font-bold text-sm text-gray-800">{block.label}</div>
                        <div className="text-xs text-gray-600">{block.description}</div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="mt-6 p-3 bg-gradient-to-r from-indigo-100 to-purple-100 rounded-lg border-2 border-indigo-200">
        <h4 className="font-bold text-sm text-indigo-800 mb-2">💡 How to Use:</h4>
        <ul className="text-xs text-indigo-700 space-y-1">
          <li>1. Drag blocks to canvas</li>
          <li>2. Connect blocks with lines</li>
          <li>3. Click blocks to edit them</li>
          <li>4. Start with 🚀 and end with 🏁</li>
          <li>5. Click Run to test your flow</li>
        </ul>
      </div>

      <div className="mt-4">
        <Badge variant="outline" className="text-xs">
          💾 Press Delete to remove blocks
        </Badge>
      </div>
    </div>
  )
}
