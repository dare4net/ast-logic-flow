"use client"

import type React from "react"

import { useCallback, useState, useEffect, useRef } from "react"
import ReactFlow, {
  type Node,
  type Edge,
  Background,
  type Connection,
  useNodesState,
  useEdgesState,
  ReactFlowProvider,
  useReactFlow,
} from "reactflow"
import "reactflow/dist/style.css"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Play, RotateCcw, Trophy } from "lucide-react"
import TerminalConsole from "./terminal-console"
import ChallengePanel from "./challenge-panel"
import BlockPalette from "./block-palette"
import { CustomNode } from "./custom-nodes"
import { FlowInterpreter } from "./flow-interpreter"

const nodeTypes = {
  start: CustomNode,
  end: CustomNode,
  variable: CustomNode,
  setVariable: CustomNode,
  getVariable: CustomNode,
  if: CustomNode,
  ifElse: CustomNode,
  ifElseIf: CustomNode,
  switch: CustomNode,
  while: CustomNode,
  doWhile: CustomNode,
  for: CustomNode,
  function: CustomNode,
  functionCall: CustomNode,
  action: CustomNode,
  comparison: CustomNode,
  logic: CustomNode,
  math: CustomNode,
}

interface LogicFlowBuilderProps {
  gameMode: "practice" | "challenge"
  codeMode: "logic" | "javascript" | "python"
  onBack: () => void
  onGameModeChange: (mode: "practice" | "challenge") => void
  onCodeModeChange: (mode: "logic" | "javascript" | "python") => void
}

function FlowBuilder({ gameMode, codeMode, onBack, onGameModeChange, onCodeModeChange }: LogicFlowBuilderProps) {
  const reactFlowWrapper = useRef<HTMLDivElement>(null)
  const [currentChallenge, setCurrentChallenge] = useState(0)
  const [isFlowValid, setIsFlowValid] = useState(false)
  const [isRunning, setIsRunning] = useState(false)
  const [badges, setBadges] = useState<string[]>([])
  const [nodeId, setNodeId] = useState(1)
  const [variables, setVariables] = useState<Record<string, any>>({})
  const { screenToFlowPosition } = useReactFlow()
  const [executionResults, setExecutionResults] = useState<string[]>([])

  const challenges = [
    {
      id: "counter-program",
      title: "Build a Counter",
      description: "Create a program that counts from 1 to 5 using a variable and a loop.",
      requiredBlocks: ["start", "variable", "setVariable", "while", "math", "end"],
      solution: "counter = 1; while (counter <= 5) { print(counter); counter = counter + 1; }",
      hint: "Start → Declare counter → Set counter to 1 → While loop (counter <= 5) → Print counter → Add 1 to counter → End",
    },
    {
      id: "grade-checker",
      title: "Grade Checker",
      description: "Create a program that checks if a grade is A, B, C, D, or F using if-else statements.",
      requiredBlocks: ["start", "variable", "ifElseIf", "comparison", "action", "end"],
      solution:
        "if (grade >= 90) A; else if (grade >= 80) B; else if (grade >= 70) C; else if (grade >= 60) D; else F;",
      hint: "Start → Get grade → If-else-if chain → Compare grades → Assign letter → End",
    },
  ]

  const [nodes, setNodes, onNodesChange] = useNodesState([])
  const [edges, setEdges, onEdgesChange] = useEdgesState([])

  const onConnect = useCallback(
    (params: Edge | Connection) => {
      setEdges((eds) => {
        // Remove any existing edge that connects to the same target handle
        const filteredEdges = eds.filter(
          (edge) => !(edge.target === params.target && edge.targetHandle === params.targetHandle),
        )

        const newEdge = {
          ...params,
          animated: true,
          style: { stroke: "#8b5cf6", strokeWidth: 3 },
          markerEnd: { type: "arrowclosed", color: "#8b5cf6" },
        }

        return [...filteredEdges, newEdge]
      })
    },
    [setEdges],
  )

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault()
    event.dataTransfer.dropEffect = "move"
  }, [])

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault()

      const type = event.dataTransfer.getData("application/reactflow")
      const label = event.dataTransfer.getData("application/label")

      if (typeof type === "undefined" || !type) {
        return
      }

      if (reactFlowWrapper.current) {
        const position = screenToFlowPosition({
          x: event.clientX,
          y: event.clientY,
        })

        const newNode: Node = {
          id: `${type}-${nodeId}`,
          type,
          position,
          data: {
            label,
            blockType: type,
            // Type-specific default data
            ...(type === "variable" && { variableName: "myVar", variableValue: "0" }),
            ...(type === "setVariable" && { variableName: "myVar", variableValue: "0" }),
            ...(type === "getVariable" && { variableName: "myVar" }),
            ...(type === "if" && { condition: "x > 0" }),
            ...(type === "ifElse" && { condition: "x > 0" }),
            ...(type === "ifElseIf" && { conditions: ["x > 90", "x > 80", "x > 70"] }),
            ...(type === "switch" && { variable: "x", cases: ["case1", "case2", "default"] }),
            ...(type === "while" && { condition: "i < 10" }),
            ...(type === "doWhile" && { condition: "i < 10" }),
            ...(type === "for" && { init: "i = 0", condition: "i < 10", increment: "i++" }),
            ...(type === "function" && { functionName: "myFunction", parameters: ["param1"] }),
            ...(type === "functionCall" && { functionName: "myFunction", arguments: ["arg1"] }),
            ...(type === "comparison" && { operator: "==", left: "a", right: "b" }),
            ...(type === "logic" && { operator: "AND", inputs: ["condition1", "condition2"] }),
            ...(type === "math" && { operator: "+", left: "a", right: "b" }),
            ...(type === "action" && { actionType: "print", actionValue: '"Hello World"' }),
          },
        }

        setNodes((nds) => nds.concat(newNode))
        setNodeId((id) => id + 1)
      }
    },
    [screenToFlowPosition, nodeId, setNodes],
  )

  const validateFlow = useCallback(() => {
    const hasStart = nodes.some((node) => node.type === "start")
    const hasEnd = nodes.some((node) => node.type === "end")
    const hasConnections = edges.length > 0

    // Check if start node is connected to something
    const startNode = nodes.find((node) => node.type === "start")
    const startConnected = startNode ? edges.some((edge) => edge.source === startNode.id) : false

    // Check if end node has incoming connection
    const endNode = nodes.find((node) => node.type === "end")
    const endConnected = endNode ? edges.some((edge) => edge.target === endNode.id) : false

    setIsFlowValid(hasStart && hasEnd && hasConnections && startConnected && endConnected)
  }, [nodes, edges])

  useEffect(() => {
    validateFlow()
  }, [validateFlow])

  const runFlow = () => {
    if (!isFlowValid) return

    setIsRunning(true)
    setVariables({})
    setExecutionResults([])

    // Animate the flow
    setEdges((eds) =>
      eds.map((edge) => ({
        ...edge,
        animated: true,
        style: { ...edge.style, stroke: "#10b981", strokeWidth: 4 },
      })),
    )

    // Interpret and execute the flow
    const interpreter = new FlowInterpreter(nodes, edges)
    const result = interpreter.execute()

    // Update variables and results from execution
    setVariables(result.variables)
    setExecutionResults([...result.output, ...result.errors])

    // If we have JavaScript code, simulate it
    if (codeMode === "javascript") {
      const jsCode = interpreter.generateCode("javascript")
      const jsResult = interpreter.simulateJavaScript(jsCode)
      setExecutionResults((prev) => [...prev, "--- JavaScript Simulation ---", ...jsResult.output, ...jsResult.errors])
      setVariables((prev) => ({ ...prev, ...jsResult.variables }))
    }

    // Simulate flow execution
    setTimeout(() => {
      setIsRunning(false)
      setEdges((eds) =>
        eds.map((edge) => ({
          ...edge,
          style: { ...edge.style, stroke: "#8b5cf6", strokeWidth: 3 },
        })),
      )

      if (gameMode === "challenge") {
        setBadges((prev) => {
          const challengeTitle = challenges[currentChallenge].title
          if (!prev.includes(challengeTitle)) {
            return [...prev, challengeTitle]
          }
          return prev
        })
      }
    }, 3000)
  }

  const resetFlow = () => {
    setNodes([])
    setEdges([])
    setIsRunning(false)
    setVariables({})
  }

  const generateCode = () => {
    if (nodes.length === 0) {
      return "// Drag blocks from the palette to start building your logic flow!"
    }

    const interpreter = new FlowInterpreter(nodes, edges)
    return interpreter.generateCode(codeMode)
  }

  const updateNodeData = (nodeId: string, newData: any) => {
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === nodeId) {
          return { ...node, data: { ...node.data, ...newData } }
        }
        return node
      }),
    )
  }

  return (
    <div className="h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex flex-col">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200 p-4">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={onBack} className="rounded-full">
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-2xl font-bold text-gray-800">Logic Flow Builder</h1>
            {gameMode === "challenge" && (
              <Badge variant="secondary" className="text-sm">
                Challenge: {challenges[currentChallenge].title}
              </Badge>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant={gameMode === "practice" ? "default" : "outline"}
              onClick={() => onGameModeChange("practice")}
              size="sm"
            >
              Practice
            </Button>
            <Button
              variant={gameMode === "challenge" ? "default" : "outline"}
              onClick={() => onGameModeChange("challenge")}
              size="sm"
            >
              Challenge
            </Button>
          </div>
        </div>
      </div>

      <div className="flex-1 flex">
        {/* Block Palette */}
        <BlockPalette />

        {/* Main Flow Area */}
        <div className="flex-1 relative" ref={reactFlowWrapper}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onDrop={onDrop}
            onDragOver={onDragOver}
            nodeTypes={nodeTypes}
            fitView
            snapToGrid
            snapGrid={[20, 20]}
            className="bg-white/50"
            deleteKeyCode={["Backspace", "Delete"]}
          >
            <Background variant="dots" gap={20} size={1} color="#e5e7eb" />
          </ReactFlow>

          {/* Flow Controls */}
          <div className="absolute top-4 right-4 flex gap-2">
            <Button
              onClick={runFlow}
              disabled={!isFlowValid || isRunning}
              className="rounded-full bg-green-500 hover:bg-green-600 text-white shadow-lg"
            >
              <Play className="w-4 h-4" />
              {isRunning ? "Running..." : "Run"}
            </Button>
            <Button onClick={resetFlow} variant="outline" className="rounded-full bg-white/80 shadow-lg">
              <RotateCcw className="w-4 h-4" />
              Reset
            </Button>
          </div>

          {/* Flow Status */}
          <div className="absolute bottom-4 left-4 flex gap-2">
            <Badge variant={isFlowValid ? "default" : "destructive"} className="text-sm shadow-lg">
              {isFlowValid ? "✅ Flow Valid" : "⚠️ Flow Incomplete"}
            </Badge>
            {Object.keys(variables).length > 0 && (
              <Badge variant="secondary" className="text-sm shadow-lg">
                📊 Variables: {Object.keys(variables).length}
              </Badge>
            )}
          </div>

          {/* Instructions */}
          {nodes.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-8 text-center shadow-lg border-2 border-dashed border-purple-300">
                <div className="text-4xl mb-4">🎯</div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">Start Building!</h3>
                <p className="text-gray-600">Drag blocks from the left palette to this canvas</p>
                <p className="text-sm text-gray-500 mt-2">Connect blocks by dragging from one handle to another</p>
              </div>
            </div>
          )}
        </div>

        {/* Side Panel */}
        <div className="w-80 bg-white/80 backdrop-blur-sm border-l border-gray-200 flex flex-col">
          {/* Code Mode Toggle */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex gap-1">
              <Button
                variant={codeMode === "logic" ? "default" : "outline"}
                onClick={() => onCodeModeChange("logic")}
                size="sm"
                className="flex-1"
              >
                Logic
              </Button>
              <Button
                variant={codeMode === "javascript" ? "default" : "outline"}
                onClick={() => onCodeModeChange("javascript")}
                size="sm"
                className="flex-1"
              >
                JS
              </Button>
              <Button
                variant={codeMode === "python" ? "default" : "outline"}
                onClick={() => onCodeModeChange("python")}
                size="sm"
                className="flex-1"
              >
                Python
              </Button>
            </div>
          </div>

          {/* Challenge Panel */}
          {gameMode === "challenge" && (
            <ChallengePanel
              challenge={challenges[currentChallenge]}
              isCompleted={badges.includes(challenges[currentChallenge].title)}
              onNextChallenge={() => setCurrentChallenge((prev) => (prev + 1) % challenges.length)}
            />
          )}

          {/* Terminal Console */}
          <div className="flex-1">
            <TerminalConsole
              code={generateCode()}
              isRunning={isRunning}
              isValid={isFlowValid}
              nodes={nodes}
              edges={edges}
              variables={variables}
              executionResults={executionResults}
            />
          </div>

          {/* Badges */}
          {badges.length > 0 && (
            <div className="p-4 border-t border-gray-200">
              <h3 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-1">
                <Trophy className="w-4 h-4" />
                Badges Earned
              </h3>
              <div className="flex flex-wrap gap-1">
                {badges.map((badge, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    🏆 {badge}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function LogicFlowBuilder(props: LogicFlowBuilderProps) {
  return (
    <ReactFlowProvider>
      <FlowBuilder {...props} />
    </ReactFlowProvider>
  )
}
