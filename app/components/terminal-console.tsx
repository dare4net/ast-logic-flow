"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Terminal, Code, Zap, Database } from "lucide-react"
import type { Node, Edge } from "reactflow"

interface TerminalConsoleProps {
  code: string
  isRunning: boolean
  isValid: boolean
  nodes: Node[]
  edges: Edge[]
  variables: Record<string, any>
  executionResults: string[]
}

export default function TerminalConsole({
  code,
  isRunning,
  isValid,
  nodes,
  edges,
  variables,
  executionResults,
}: TerminalConsoleProps) {
  const [output, setOutput] = useState<string[]>([])
  const [currentLine, setCurrentLine] = useState(0)

  useEffect(() => {
    if (isRunning && nodes.length > 0) {
      setOutput([])
      setCurrentLine(0)

      const lines = [
        "🤖 Initializing logic flow interpreter...",
        `📊 Found ${nodes.length} blocks and ${edges.length} connections`,
        "⚡ Parsing flow structure...",
        "🔍 Validating variable declarations...",
        "🚀 Starting execution...",
        ...nodes.map((node) => {
          switch (node.type) {
            case "start":
              return "🚀 Program execution started"
            case "variable":
              return `📦 Declared variable: ${node.data.variableName} = ${node.data.variableValue}`
            case "setVariable":
              return `📝 Set variable: ${node.data.variableName} = ${node.data.variableValue}`
            case "getVariable":
              return `📋 Reading variable: ${node.data.variableName}`
            case "if":
              return `❓ Evaluating condition: ${node.data.condition}`
            case "ifElse":
              return `🔀 If-Else branch: ${node.data.condition}`
            case "while":
              return `🔁 While loop: ${node.data.condition}`
            case "for":
              return `🔢 For loop: ${node.data.init}; ${node.data.condition}; ${node.data.increment}`
            case "action":
              return `⚡ Executing: ${node.data.actionType}(${node.data.actionValue})`
            case "comparison":
              return `⚖️ Comparison: ${node.data.left} ${node.data.operator} ${node.data.right}`
            case "math":
              return `🧮 Math operation: ${node.data.left} ${node.data.operator} ${node.data.right}`
            case "function":
              return `⚙️ Function: ${node.data.functionName}(${node.data.parameters?.join(", ") || ""})`
            case "end":
              return "🏁 Program execution completed"
            default:
              return `📝 Processing: ${node.data.label}`
          }
        }),
        isValid ? "✅ Flow executed successfully!" : "❌ Flow execution failed!",
        isValid ? "🎉 All operations completed!" : "⚠️ Check your flow connections...",
      ]

      const interval = setInterval(() => {
        setCurrentLine((prev) => {
          if (prev < lines.length - 1) {
            setOutput((prevOutput) => [...prevOutput, lines[prev]])
            return prev + 1
          } else {
            clearInterval(interval)
            return prev
          }
        })
      }, 200)

      return () => clearInterval(interval)
    }
  }, [isRunning, isValid, nodes, edges])

  const getFlowStats = () => {
    const stats = {
      totalBlocks: nodes.length,
      connections: edges.length,
      variables: nodes.filter((n) => n.type === "variable" || n.type === "setVariable").length,
      conditionals: nodes.filter((n) => n.type === "if" || n.type === "ifElse" || n.type === "ifElseIf").length,
      loops: nodes.filter((n) => n.type === "while" || n.type === "doWhile" || n.type === "for").length,
      actions: nodes.filter((n) => n.type === "action").length,
      functions: nodes.filter((n) => n.type === "function" || n.type === "functionCall").length,
    }
    return stats
  }

  const stats = getFlowStats()

  return (
    <Card className="h-full bg-gray-900 text-green-400 font-mono text-sm overflow-hidden flex flex-col">
      <div className="p-3 border-b border-gray-700 bg-gray-800 flex-shrink-0">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4" />
          <span className="font-semibold">Logic Terminal</span>
          <div className="flex gap-1 ml-auto">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
          </div>
        </div>
      </div>

      <div className="p-3 flex-1 overflow-y-auto">
        {/* Flow Statistics */}
        <div className="mb-4 p-2 bg-gray-800 rounded border border-gray-700">
          <div className="flex items-center gap-2 mb-2">
            <Zap className="w-4 h-4 text-blue-400" />
            <span className="text-blue-400 text-xs font-semibold">Flow Statistics:</span>
          </div>
          <div className="grid grid-cols-2 gap-1 text-xs">
            <div>Blocks: {stats.totalBlocks}</div>
            <div>Connections: {stats.connections}</div>
            <div>Variables: {stats.variables}</div>
            <div>Conditionals: {stats.conditionals}</div>
            <div>Loops: {stats.loops}</div>
            <div>Actions: {stats.actions}</div>
          </div>
        </div>

        {/* Variables Display */}
        {Object.keys(variables).length > 0 && (
          <div className="mb-4 p-2 bg-gray-800 rounded border border-gray-700">
            <div className="flex items-center gap-2 mb-2">
              <Database className="w-4 h-4 text-yellow-400" />
              <span className="text-yellow-400 text-xs font-semibold">Variables:</span>
            </div>
            <div className="space-y-1 text-xs">
              {Object.entries(variables).map(([name, value]) => (
                <div key={name} className="flex justify-between">
                  <span className="text-cyan-400">{name}:</span>
                  <span className="text-white">{JSON.stringify(value)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Code Preview */}
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-2">
            <Code className="w-4 h-4 text-blue-400" />
            <span className="text-blue-400 text-xs font-semibold">Generated Code:</span>
          </div>
          <pre className="text-xs bg-gray-800 p-2 rounded border border-gray-700 whitespace-pre-wrap overflow-x-auto max-h-32">
            {code}
          </pre>
        </div>

        {/* Error Display */}
        {executionResults.some((result) => result.startsWith("❌")) && (
          <div className="mb-4 p-2 bg-red-900/50 rounded border border-red-700">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-red-400 text-xs font-semibold">❌ Errors:</span>
            </div>
            <div className="space-y-1 text-xs max-h-24 overflow-y-auto">
              {executionResults
                .filter((result) => result.startsWith("❌"))
                .map((error, index) => (
                  <div key={index} className="text-red-300">
                    {error}
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* Execution Results */}
        {executionResults.length > 0 && (
          <div className="mb-4 p-2 bg-gray-800 rounded border border-gray-700">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="w-4 h-4 text-green-400" />
              <span className="text-green-400 text-xs font-semibold">Execution Output:</span>
            </div>
            <div className="space-y-1 text-xs max-h-32 overflow-y-auto">
              {executionResults
                .filter((result) => !result.startsWith("❌"))
                .map((result, index) => (
                  <div key={index} className="text-green-300">
                    {result}
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* Execution Output */}
        <div className="space-y-1">
          <div className="text-blue-400 mb-2 text-xs">$ execute-logic-flow</div>
          {output.map((line, index) => (
            <div key={index} className="text-xs animate-pulse">
              {line}
            </div>
          ))}
          {isRunning && (
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-xs">Processing flow...</span>
            </div>
          )}
          {!isRunning && nodes.length === 0 && (
            <div className="text-gray-500 text-xs italic">
              Drag blocks to the canvas to start building your logic flow...
            </div>
          )}
        </div>
      </div>
    </Card>
  )
}
