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
  MarkerType,
  BackgroundVariant,
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
import { useMobile } from "../../hooks/use-mobile"
import { Joystick } from "@/components/ui/joystick"

const nodeTypes = {
  // Control Flow
  start: CustomNode,
  end: CustomNode,
  return: CustomNode,
  break: CustomNode,
  continue: CustomNode,

  // Variables
  declareVariable: CustomNode, // includes type and mutability
  assignment: CustomNode,      // for variable assignments

  // Conditionals
  conditional: CustomNode,     // configurable if/else/else if
  switchCase: CustomNode,      // with proper case structure

  // Loops
  forLoop: CustomNode,         // traditional for loop
  forEach: CustomNode,         // array iteration
  whileLoop: CustomNode,       // while loop
  doWhileLoop: CustomNode,     // do-while loop

  // Functions
  functionDeclaration: CustomNode, // with types and async support
  functionCall: CustomNode,        // with parameter validation

  // Operators
  arithmeticOperator: CustomNode,  // +, -, *, /, %, **
  comparisonOperator: CustomNode,  // ==, ===, !=, !==, <, >, <=, >=
  logicalOperator: CustomNode,     // &&, ||, !
  
  // Array Operations
  arrayPush: CustomNode,
  arrayPop: CustomNode,
  arrayMap: CustomNode,
  arrayFilter: CustomNode,
  arrayReduce: CustomNode,

  // Input/Output
  print: CustomNode,           // for output
  input: CustomNode,           // for input
  
  // Error Handling
  try: CustomNode,
  catch: CustomNode,
  throw: CustomNode,
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
  const { isMobile } = useMobile();
  const [selectedForConnect, setSelectedForConnect] = useState<string | null>(null);
  // Mobile UI state
  const [showPalette, setShowPalette] = useState(!isMobile ? true : false);
  const [showSidePanel, setShowSidePanel] = useState(!isMobile ? true : false);
  // Mobile FAB menu state
  const [showFabMenu, setShowFabMenu] = useState(false);

  useEffect(() => {
    if (isMobile) {
      setShowPalette(false);
      setShowSidePanel(false);
    } else {
      setShowPalette(true);
      setShowSidePanel(true);
    }
  }, [isMobile])

  // Kid-friendly challenges (simpler, more fun)
  // Some challenges now include a 'defectiveFlow' property for auto-population
  const challenges = [
    {
      id: "say-hello",
      title: "Say Hello!",
      description: "Make the computer say 'Hello, World!' in the terminal.",
      requiredBlocks: ["start", "print", "end"],
      solution: "print('Hello, World!');",
      hint: "Use the print block to show a message.",
    },
    {
      id: "count-to-three",
      title: "Count to 3",
      description: "Make the computer count from 1 to 3, showing each number.",
      requiredBlocks: ["start", "declareVariable", "assignment", "whileLoop", "comparisonOperator", "arithmeticOperator", "print", "end"],
      solution: "declareVariable n = 1; whileLoop (n <= 3) { print(n); assignment n = n + 1; }",
      hint: "Start at 1, print, then add 1 until you reach 3.",
    },
    {
      id: "add-two-numbers",
      title: "Add Two Numbers",
      description: "Add 2 and 3 together and show the answer.",
      requiredBlocks: ["start", "arithmeticOperator", "print", "end"],
      solution: "arithmeticOperator 2 + 3; print(result);",
      hint: "Use the + block and print the answer.",
    },
    {
      id: "favorite-color",
      title: "Favorite Color",
      description: "Ask for your favorite color and show it back!",
      requiredBlocks: ["start", "input", "print", "end"],
      solution: "input('What is your favorite color?'); print(color);",
      hint: "Use input to ask, then print to show.",
    },
    {
      id: "bigger-number",
      title: "Which is Bigger?",
      description: "Show which number is bigger: 7 or 4.",
      requiredBlocks: ["start", "comparisonOperator", "conditional", "print", "end"],
      solution: "comparisonOperator 7 > 4; conditional (7 > 4) → print('7 is bigger!'); else → print('4 is bigger!');",
      hint: "Compare and use if-else to print the answer.",
    },
    {
      id: "repeat-word",
      title: "Repeat a Word",
      description: "Show the word 'Yay!' three times.",
      requiredBlocks: ["start", "declareVariable", "whileLoop", "assignment", "arithmeticOperator", "print", "end"],
      solution: "declareVariable i = 1; whileLoop (i <= 3) { print('Yay!'); assignment i = i + 1; }",
      hint: "Use a loop to print 'Yay!' three times.",
    },
    {
      id: "show-even-number",
      title: "Show an Even Number",
      description: "Show the number 8 if it is even.",
      requiredBlocks: ["start", "arithmeticOperator", "comparisonOperator", "conditional", "print", "end"],
      solution: "arithmeticOperator 8 % 2; comparisonOperator (8 % 2) == 0; conditional (8 % 2 == 0) → print('8 is even!'); else → print('8 is not even!');",
      hint: "Check if 8 divided by 2 has no remainder.",
    },
    {
      id: "greet-user",
      title: "Greet the User",
      description: "Ask for your name and say hello to you!",
      requiredBlocks: ["start", "input", "print", "end"],
      solution: "input('What is your name?'); print('Hello, ' + name + '!');",
      hint: "Use input for the name, then print a greeting.",
    },
    {
      id: "double-a-number",
      title: "Double a Number",
      description: "Show what you get if you double the number 5.",
      requiredBlocks: ["start", "arithmeticOperator", "print", "end"],
      solution: "arithmeticOperator 5 * 2; print(result);",
      hint: "Multiply 5 by 2 and print it.",
    },
    {
      id: "goodbye-message",
      title: "Say Goodbye!",
      description: "Make the computer say 'Goodbye!' in the terminal.",
      requiredBlocks: ["start", "print", "end"],
      solution: "print('Goodbye!');",
      hint: "Use the print block to show a message.",
    },
    // --- New Defective Flow Challenges ---
    {
      id: "fix-hello-missing-connection",
      title: "Fix: Hello Block Not Connected!",
      description: "The 'print' block is not connected to the start or end. Connect the blocks so it says 'Hello, World!' correctly.",
      requiredBlocks: ["start", "print", "end"],
      solution: "start → print → end",
      hint: "Drag a connection from start to print, then print to end.",
      defectiveFlow: {
        nodes: [
          { id: "start-1", type: "start", position: { x: 100, y: 100 }, data: { label: "Start" } },
          { id: "print-1", type: "print", position: { x: 300, y: 100 }, data: { label: "Print", value: '"Hello, World!"' } },
          { id: "end-1", type: "end", position: { x: 500, y: 100 }, data: { label: "End" } },
        ],
        edges: [] // No connections
      }
    },
    {
      id: "fix-loop-missing-edge",
      title: "Fix: Loop Not Connected!",
      description: "A while loop and print block are present, but not connected. Connect them so the loop works.",
      requiredBlocks: ["start", "whileLoop", "print", "end"],
      solution: "start → whileLoop → print → end",
      hint: "Connect start to whileLoop, whileLoop to print, print to end.",
      defectiveFlow: {
        nodes: [
          { id: "start-2", type: "start", position: { x: 100, y: 100 }, data: { label: "Start" } },
          { id: "while-2", type: "whileLoop", position: { x: 300, y: 100 }, data: { label: "While", condition: "i < 3" } },
          { id: "print-2", type: "print", position: { x: 500, y: 100 }, data: { label: "Print", value: 'i' } },
          { id: "end-2", type: "end", position: { x: 700, y: 100 }, data: { label: "End" } },
        ],
        edges: []
      }
    },
    {
      id: "fix-conditional-wrong-connection",
      title: "Fix: Wrong If-Else Connection!",
      description: "The conditional block is connected directly to end, skipping the print. Fix the flow so the message is printed if the condition is true.",
      requiredBlocks: ["start", "conditional", "print", "end"],
      solution: "start → conditional → print → end",
      hint: "Connect conditional to print, then print to end.",
      defectiveFlow: {
        nodes: [
          { id: "start-3", type: "start", position: { x: 100, y: 100 }, data: { label: "Start" } },
          { id: "cond-3", type: "conditional", position: { x: 300, y: 100 }, data: { label: "If", conditions: [{ condition: "x > 0", branch: "if" }], elseBranch: true } },
          { id: "print-3", type: "print", position: { x: 500, y: 100 }, data: { label: "Print", value: '"Yes!"' } },
          { id: "end-3", type: "end", position: { x: 700, y: 100 }, data: { label: "End" } },
        ],
        edges: [
          { id: "e1", source: "start-3", target: "cond-3" },
          { id: "e2", source: "cond-3", target: "end-3" }, // skips print
        ]
      }
    },
    {
      id: "fix-missing-block",
      title: "Fix: Missing Print Block!",
      description: "The flow is missing a print block. Add it and connect so the answer is shown.",
      requiredBlocks: ["start", "arithmeticOperator", "print", "end"],
      solution: "start → arithmeticOperator → print → end",
      hint: "Add a print block after the arithmetic operator.",
      defectiveFlow: {
        nodes: [
          { id: "start-4", type: "start", position: { x: 100, y: 100 }, data: { label: "Start" } },
          { id: "arith-4", type: "arithmeticOperator", position: { x: 300, y: 100 }, data: { label: "Add", operator: "+", left: 2, right: 3 } },
          { id: "end-4", type: "end", position: { x: 500, y: 100 }, data: { label: "End" } },
        ],
        edges: [
          { id: "e1", source: "start-4", target: "arith-4" },
          { id: "e2", source: "arith-4", target: "end-4" },
        ]
      }
    },
    {
      id: "fix-variable-unconnected",
      title: "Fix: Variable Not Used!",
      description: "A variable is declared but not used. Connect it to a print block to show its value.",
      requiredBlocks: ["start", "declareVariable", "print", "end"],
      solution: "start → declareVariable → print → end",
      hint: "Connect declareVariable to print, then print to end.",
      defectiveFlow: {
        nodes: [
          { id: "start-5", type: "start", position: { x: 100, y: 100 }, data: { label: "Start" } },
          { id: "var-5", type: "declareVariable", position: { x: 300, y: 100 }, data: { label: "Declare", variableName: "num", variableType: "number", variableValue: 7 } },
          { id: "print-5", type: "print", position: { x: 500, y: 100 }, data: { label: "Print", value: 'num' } },
          { id: "end-5", type: "end", position: { x: 700, y: 100 }, data: { label: "End" } },
        ],
        edges: [
          { id: "e1", source: "start-5", target: "var-5" },
          // print and end are not connected
        ]
      }
    },
  ]

  // Tab state for right panel
  const [rightTab, setRightTab] = useState<'challenges' | 'terminal'>('challenges');
  // Selected challenge index
  const [selectedChallenge, setSelectedChallenge] = useState(0);
  // Track which challenge is being worked on (current)
  const [currentChallengeIdx, setCurrentChallengeIdx] = useState<number | null>(null);
  const [nodes, setNodes, onNodesChange] = useNodesState([])
  const [edges, setEdges, onEdgesChange] = useEdgesState([])

  const onConnect = useCallback(
    (params: Edge | Connection) => {
      setEdges((eds) => {
        // Remove any existing edge that connects to the same target node (regardless of handle)
        const filteredEdges = eds.filter(
          (edge) => edge.target !== params.target
        );
        const newEdge = {
          ...params,
          animated: true,
          style: { stroke: "#8b5cf6", strokeWidth: 3 },
          markerEnd: { type: MarkerType.ArrowClosed, color: "#8b5cf6" },
        };
        return [...filteredEdges, newEdge] as Edge[];
      });
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
            updateNodeData, // Pass updateNodeData to each node
            // Type-specific default data for new block types
            ...(type === "declareVariable" && { variableName: label || "myVar", variableType: "number", variableValue: 0 }),
            ...(type === "assignment" && { variableName: label || "myVar", value: "" }),
            ...(type === "conditional" && { conditions: [{ condition: "x > 0", branch: "if" }], elseBranch: true }),
            ...(type === "switchCase" && { variable: "x", cases: [{ value: 1, label: "Case 1" }, { value: 2, label: "Case 2" }], default: true }),
            ...(type === "forLoop" && { init: "i = 0", condition: "i < 10", increment: "i++" }),
            ...(type === "forEach" && { array: "myArray", item: "item" }),
            ...(type === "whileLoop" && { condition: "i < 10" }),
            ...(type === "doWhileLoop" && { condition: "i < 10" }),
            ...(type === "functionDeclaration" && { functionName: "myFunction", parameters: ["param1"], returnType: "void", async: false }),
            ...(type === "functionCall" && { functionName: "myFunction", arguments: ["arg1"] }),
            ...(type === "arithmeticOperator" && { operator: "+", left: 1, right: 2 }),
            ...(type === "comparisonOperator" && { operator: "==", left: "a", right: "b" }),
            ...(type === "logicalOperator" && { operator: "&&", left: true, right: false }),
            ...(type === "arrayPush" && { array: "myArray", value: 1 }),
            ...(type === "arrayPop" && { array: "myArray" }),
            ...(type === "arrayMap" && { array: "myArray", callback: "item => item * 2" }),
            ...(type === "arrayFilter" && { array: "myArray", callback: "item => item > 0" }),
            ...(type === "arrayReduce" && { array: "myArray", callback: "(acc, item) => acc + item", initialValue: 0 }),
            ...(type === "print" && { value: '"Hello World"' }),
            ...(type === "input" && { prompt: '"Enter value:"', variableName: "inputVar" }),
            ...(type === "try" && {}),
            ...(type === "catch" && { errorVar: "err" }),
            ...(type === "throw" && { error: '"Error!"' }),
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

    // Prepare nodes and edges for FlowInterpreter
    const filteredNodes = nodes.filter((n) => typeof n.type === "string")
    const localNodes = filteredNodes.map((n) => ({
      id: n.id,
      type: n.type as string,
      position: n.position,
      data: n.data,
    }))
    const localEdges = edges.map((e) => ({
      id: e.id,
      source: e.source,
      target: e.target,
      sourceHandle: e.sourceHandle ?? null,
      targetHandle: e.targetHandle ?? null,
      animated: e.animated,
      style: e.style && typeof e.style.stroke === 'string' && typeof e.style.strokeWidth === 'number'
        ? { stroke: e.style.stroke, strokeWidth: e.style.strokeWidth }
        : undefined,
      markerEnd:
        e.markerEnd && typeof e.markerEnd === 'object' && 'type' in e.markerEnd && 'color' in e.markerEnd
          ? { type: String(e.markerEnd.type), color: String(e.markerEnd.color) }
          : undefined,
    }))
    const interpreter = new FlowInterpreter(localNodes, localEdges)
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
    // Prepare nodes and edges for FlowInterpreter
    const filteredNodes = nodes.filter((n) => typeof n.type === "string")
    const localNodes = filteredNodes.map((n) => ({
      id: n.id,
      type: n.type as string,
      position: n.position,
      data: n.data,
    }))
    const localEdges = edges.map((e) => ({
      id: e.id,
      source: e.source,
      target: e.target,
      sourceHandle: e.sourceHandle ?? null,
      targetHandle: e.targetHandle ?? null,
      animated: e.animated,
      style: e.style && typeof e.style.stroke === 'string' && typeof e.style.strokeWidth === 'number'
        ? { stroke: e.style.stroke, strokeWidth: e.style.strokeWidth }
        : undefined,
      markerEnd:
        e.markerEnd && typeof e.markerEnd === 'object' && 'type' in e.markerEnd && 'color' in e.markerEnd
          ? { type: String(e.markerEnd.type), color: String(e.markerEnd.color) }
          : undefined,
    }))
    const interpreter = new FlowInterpreter(localNodes, localEdges)
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

  // Import/Export handlers
  const handleExport = () => {
    const data = JSON.stringify({ nodes, edges }, null, 2)
    const blob = new Blob([data], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "logic-flow.json"
    a.click()
    URL.revokeObjectURL(url)
  }

  // Add a ref for the file input
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleImportButtonClick = () => {
    fileInputRef.current?.click()
  }

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (event) => {
      try {
        const { nodes: importedNodes, edges: importedEdges } = JSON.parse(event.target?.result as string)
        setNodes(importedNodes || [])
        setEdges(importedEdges || [])
        setNodeId((importedNodes?.length || 0) + 1)
      } catch (err) {
        alert("Invalid flow file.")
      }
    }
    reader.readAsText(file)
    // Reset the input so the same file can be imported again if needed
    e.target.value = ""
  }

  // Mobile tap-to-connect logic
  // Instead of onNodeClick, pass a handler to CustomNode for tap-to-connect
  const handleNodeTap = (nodeId: string) => {
    if (selectedForConnect && selectedForConnect !== nodeId) {
      setEdges((eds) => {
        // Remove any existing edge that connects to the same target node (regardless of handle)
        const filteredEdges = eds.filter(
          (edge) => edge.target !== nodeId
        );
        return [
          ...filteredEdges,
          {
            id: `e${selectedForConnect}-${nodeId}`,
            source: selectedForConnect,
            target: nodeId,
            animated: true,
            style: { stroke: "#8b5cf6", strokeWidth: 3 },
            markerEnd: { type: MarkerType.ArrowClosed, color: "#8b5cf6" },
          },
        ];
      });
      setSelectedForConnect(null);
    } else {
      setSelectedForConnect(nodeId);
    }
  };

  // Add selectedForConnect and onNodeTap to each node's data for mobile highlight and tap-to-connect
  const nodesWithConnect = nodes.map(node => ({
    ...node,
    data: { ...node.data, selectedForConnect, onNodeTap: isMobile ? handleNodeTap : undefined }
  }));

  const fabHidden = isMobile && showSidePanel;

  // Only show one right-side FAB at a time on mobile
  const showTerminalFab = isMobile && !showSidePanel && !showFabMenu;
  const showMainFab = isMobile && !showSidePanel && !showFabMenu;
  const showFabMenuPanel = isMobile && !showSidePanel && showFabMenu;

  // Helper: add block to center (for mobile palette click)
  const addBlockToCenter = (type: string, label: string) => {
    if (!reactFlowWrapper.current) return;
    const bounds = reactFlowWrapper.current.getBoundingClientRect();
    const position = screenToFlowPosition({
      x: bounds.left + bounds.width / 2,
      y: bounds.top + bounds.height / 2,
    });
    const newNode: Node = {
      id: `${type}-${nodeId}`,
      type,
      position,
      data: {
        label,
        blockType: type,
        updateNodeData,
        ...(type === "declareVariable" && { variableName: label || "myVar", variableType: "number", variableValue: 0 }),
        ...(type === "assignment" && { variableName: label || "myVar", value: "" }),
        ...(type === "conditional" && { conditions: [{ condition: "x > 0", branch: "if" }], elseBranch: true }),
        ...(type === "switchCase" && { variable: "x", cases: [{ value: 1, label: "Case 1" }, { value: 2, label: "Case 2" }], default: true }),
        ...(type === "forLoop" && { init: "i = 0", condition: "i < 10", increment: "i++" }),
        ...(type === "forEach" && { array: "myArray", item: "item" }),
        ...(type === "whileLoop" && { condition: "i < 10" }),
        ...(type === "doWhileLoop" && { condition: "i < 10" }),
        ...(type === "functionDeclaration" && { functionName: "myFunction", parameters: ["param1"], returnType: "void", async: false }),
        ...(type === "functionCall" && { functionName: "myFunction", arguments: ["arg1"] }),
        ...(type === "arithmeticOperator" && { operator: "+", left: 1, right: 2 }),
        ...(type === "comparisonOperator" && { operator: "==", left: "a", right: "b" }),
        ...(type === "logicalOperator" && { operator: "&&", left: true, right: false }),
        ...(type === "arrayPush" && { array: "myArray", value: 1 }),
        ...(type === "arrayPop" && { array: "myArray" }),
        ...(type === "arrayMap" && { array: "myArray", callback: "item => item * 2" }),
        ...(type === "arrayFilter" && { array: "myArray", callback: "item => item > 0" }),
        ...(type === "arrayReduce" && { array: "myArray", callback: "(acc, item) => acc + item", initialValue: 0 }),
        ...(type === "print" && { value: '"Hello World"' }),
        ...(type === "input" && { prompt: '"Enter value:"', variableName: "inputVar" }),
        ...(type === "try" && {}),
        ...(type === "catch" && { errorVar: "err" }),
        ...(type === "throw" && { error: '"Error!"' }),
      },
    };
    setNodes((nds) => nds.concat(newNode));
    setNodeId((id) => id + 1);
  };

  const reactFlowInstance = useReactFlow();

  // Mobile zoom controls
  const handleZoomIn = () => {
    reactFlowInstance.zoomIn();
  };
  const handleZoomOut = () => {
    reactFlowInstance.zoomOut();
  };

  // Joystick panning state
  const [joystickActive, setJoystickActive] = useState(false);
  // Joystick pan interval ref
  const panInterval = useRef<NodeJS.Timeout | null>(null);
  // Last pan direction
  const panDir = useRef<{dx: number, dy: number}>({ dx: 0, dy: 0 });

  // Joystick move handler
  const handleJoystickMove = (dx: number, dy: number) => {
    panDir.current = { dx, dy };
    if (!panInterval.current && (dx !== 0 || dy !== 0)) {
      panInterval.current = setInterval(() => {
        // Pan speed factor (adjust for feel)
        const speed = 6; // reduced from 20 to 6 for smoother, slower panning
        // Use getViewport and setViewport for React Flow v11+
        const viewport = reactFlowInstance.getViewport?.();
        if (viewport && typeof reactFlowInstance.setViewport === 'function') {
          reactFlowInstance.setViewport({
            x: viewport.x - panDir.current.dx * speed,
            y: viewport.y - panDir.current.dy * speed,
            zoom: viewport.zoom,
          });
        }
      }, 16); // ~60fps
    }
  };
  // Joystick end handler
  const handleJoystickEnd = () => {
    panDir.current = { dx: 0, dy: 0 };
    if (panInterval.current) {
      clearInterval(panInterval.current);
      panInterval.current = null;
    }
  };
  // Clean up interval on unmount
  useEffect(() => {
    return () => {
      if (panInterval.current) clearInterval(panInterval.current);
    };
  }, []);

  // Challenge validation logic
  const validateChallenge = (challengeIdx: number) => {
    const challenge = challenges[challengeIdx];
    // Check if all required blocks are present in the flow
    const nodeTypesInFlow = nodes.map(n => n.type);
    const allBlocksPresent = challenge.requiredBlocks.every(block => nodeTypesInFlow.includes(block));
    // Optionally, you could check for connections, but for kids, just block presence is enough
    if (allBlocksPresent) {
      setBadges(prev => {
        if (!prev.includes(challenge.title)) {
          return [...prev, challenge.title];
        }
        return prev;
      });
      return true;
    }
    return false;
  };

  // When a challenge with defectiveFlow is selected, auto-load its nodes/edges (normalize nodes)
  useEffect(() => {
    const challenge = challenges[selectedChallenge];
    if (challenge && challenge.defectiveFlow) {
      // Helper to normalize a node to match drag/drop creation
      const normalizeNode = (node: any) => {
        const type = node.type;
        // Never set onNodeTap or selectedForConnect here; always set in nodesWithConnect
        const { onNodeTap, selectedForConnect, ...restData } = node.data || {};
        return {
          ...node,
          data: {
            ...restData,
            blockType: type,
            updateNodeData,
            ...(type === "declareVariable" && { variableName: restData?.variableName || "myVar", variableType: restData?.variableType || "number", variableValue: restData?.variableValue ?? 0 }),
            ...(type === "assignment" && { variableName: restData?.variableName || "myVar", value: restData?.value ?? "" }),
            ...(type === "conditional" && { conditions: restData?.conditions || [{ condition: "x > 0", branch: "if" }], elseBranch: restData?.elseBranch ?? true }),
            ...(type === "switchCase" && { variable: restData?.variable || "x", cases: restData?.cases || [{ value: 1, label: "Case 1" }, { value: 2, label: "Case 2" }], default: restData?.default ?? true }),
            ...(type === "forLoop" && { init: restData?.init || "i = 0", condition: restData?.condition || "i < 10", increment: restData?.increment || "i++" }),
            ...(type === "forEach" && { array: restData?.array || "myArray", item: restData?.item || "item" }),
            ...(type === "whileLoop" && { condition: restData?.condition || "i < 10" }),
            ...(type === "doWhileLoop" && { condition: restData?.condition || "i < 10" }),
            ...(type === "functionDeclaration" && { functionName: restData?.functionName || "myFunction", parameters: restData?.parameters || ["param1"], returnType: restData?.returnType || "void", async: restData?.async ?? false }),
            ...(type === "functionCall" && { functionName: restData?.functionName || "myFunction", arguments: restData?.arguments || ["arg1"] }),
            ...(type === "arithmeticOperator" && { operator: restData?.operator || "+", left: restData?.left ?? 1, right: restData?.right ?? 2 }),
            ...(type === "comparisonOperator" && { operator: restData?.operator || "==", left: restData?.left || "a", right: restData?.right || "b" }),
            ...(type === "logicalOperator" && { operator: restData?.operator || "&&", left: restData?.left ?? true, right: restData?.right ?? false }),
            ...(type === "arrayPush" && { array: restData?.array || "myArray", value: restData?.value ?? 1 }),
            ...(type === "arrayPop" && { array: restData?.array || "myArray" }),
            ...(type === "arrayMap" && { array: restData?.array || "myArray", callback: restData?.callback || "item => item * 2" }),
            ...(type === "arrayFilter" && { array: restData?.array || "myArray", callback: restData?.callback || "item => item > 0" }),
            ...(type === "arrayReduce" && { array: restData?.array || "myArray", callback: restData?.callback || "(acc, item) => acc + item", initialValue: restData?.initialValue ?? 0 }),
            ...(type === "print" && { value: restData?.value || '"Hello World"' }),
            ...(type === "input" && { prompt: restData?.prompt || '"Enter value:"', variableName: restData?.variableName || "inputVar" }),
            ...(type === "try" && {}),
            ...(type === "catch" && { errorVar: restData?.errorVar || "err" }),
            ...(type === "throw" && { error: restData?.error || '"Error!"' }),
          },
        };
      };
      setNodes((challenge.defectiveFlow.nodes || []).map(normalizeNode));
      setEdges(challenge.defectiveFlow.edges || []);
      setNodeId((challenge.defectiveFlow.nodes?.length || 0) + 1);
    }
  }, [selectedChallenge]);

  return (
    <div className="h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex flex-col">
      {/* Header */}
      <div className={`bg-white/80 backdrop-blur-sm border-b border-gray-200 p-2 sm:p-4 ${isMobile ? 'min-h-0 h-12' : ''}`}>
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-2 sm:gap-4">
            <Button variant="ghost" onClick={onBack} className="rounded-full p-2">
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-lg sm:text-2xl font-bold text-gray-800">Logic Flow Builder</h1>
            {gameMode === "challenge" && !isMobile && (
              <Badge variant="secondary" className="text-sm">
                Challenge: {challenges[currentChallenge].title}
              </Badge>
            )}
          </div>

          {!isMobile && (
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
          )}
        </div>
      </div>

      <div className="flex-1 flex relative">
        {/* Block Palette */}
        {(!isMobile || showPalette) && (
          <div className={`z-20 ${isMobile ? 'absolute left-0 top-0 h-full w-64 bg-white/95 shadow-lg border-r border-gray-200' : ''}`}>
            <BlockPalette
              {...(isMobile && {
                onBlockClick: (type: string, label: string) => {
                  addBlockToCenter(type, label);
                  setShowPalette(false);
                },
                enableDrag: false,
              })}
            />
          </div>
        )}
        {/* FAB for palette on mobile */}
        {isMobile && !showPalette && !fabHidden && (
          <button
            className="fixed left-4 bottom-32 z-30 bg-purple-600 text-white rounded-full shadow-lg w-14 h-14 flex items-center justify-center text-2xl"
            onClick={() => setShowPalette(true)}
            aria-label="Show Block Palette"
          >
            ＋
          </button>
        )}
        {/* Hide palette button on mobile */}
        {isMobile && showPalette && (
          <button
            className="fixed left-4 bottom-32 z-30 bg-gray-200 text-gray-700 rounded-full shadow-lg w-12 h-12 flex items-center justify-center text-xl"
            onClick={() => setShowPalette(false)}
            aria-label="Hide Block Palette"
          >
            ×
          </button>
        )}

        {/* Main Flow Area */}
        <div className="flex-1 relative" ref={reactFlowWrapper}>
          <ReactFlow
            nodes={nodesWithConnect}
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
            panOnDrag={!isMobile} // Enable normal panning on desktop, disable on mobile
            nodesDraggable={true} // Always allow node drag (long-press on mobile)
            panOnScroll={isMobile} // Allow pan with two-finger scroll on mobile
            zoomOnPinch={isMobile}
            zoomOnScroll={true} // Always allow mouse wheel zoom on desktop, and pinch/scroll on mobile
            // Remove onNodeClick for mobile, handled in CustomNode
          >
            <Background variant={BackgroundVariant.Dots} gap={20} size={1} color="#e5e7eb" />
          </ReactFlow>

          {/* Joystick for mobile panning */}
          {isMobile && !showSidePanel && !showFabMenu && (
            <div className="fixed left-4 bottom-4 z-50">
              <Joystick
                onMove={handleJoystickMove}
                onEnd={handleJoystickEnd}
                size={90}
                thumbSize={40}
              />
            </div>
          )}

          {/* Flow Controls */}
          {!isMobile && (
            <div className="absolute top-4 right-4 flex gap-2 items-center">
              <Badge variant={isFlowValid ? "default" : "destructive"} className="text-sm shadow-lg">
                {isFlowValid ? "✅ Flow Valid" : "⚠️ Flow Incomplete"}
              </Badge>
              <Button
                onClick={handleZoomIn}
                className="rounded-full bg-purple-500 hover:bg-purple-600 text-white shadow-lg w-10 h-10 flex items-center justify-center"
                style={{ minWidth: 40, minHeight: 40 }}
                aria-label="Zoom In"
              >
                <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>
              </Button>
              <Button
                onClick={handleZoomOut}
                className="rounded-full bg-purple-500 hover:bg-purple-600 text-white shadow-lg w-10 h-10 flex items-center justify-center"
                style={{ minWidth: 40, minHeight: 40 }}
                aria-label="Zoom Out"
              >
                <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="8" y1="12" x2="16" y2="12"/></svg>
              </Button>
              <Button
                onClick={handleExport}
                variant="outline"
                size="icon"
                title="Export Flow"
                className="rounded-full bg-white/80 shadow-lg"
              >
                <span className="sr-only">Export</span>
                <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 4v12m0 0l-4-4m4 4l4-4"/><rect x="4" y="16" width="16" height="4" rx="2"/></svg>
              </Button>
              <Button
                onClick={handleImportButtonClick}
                variant="outline"
                size="icon"
                title="Import Flow"
                className="rounded-full bg-white/80 shadow-lg"
              >
                <span className="sr-only">Import</span>
                <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 20V8m0 0l4 4m-4-4l-4 4"/><rect x="4" y="4" width="16" height="4" rx="2"/></svg>
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept="application/json"
                onChange={handleImport}
                style={{ display: 'none' }}
              />
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
          )}
          {/* Mobile FAB for flow controls (only one right-side FAB at a time) */}
          {showMainFab && (
            <button
              className="fixed bottom-4 right-4 z-40 bg-green-500 hover:bg-green-600 text-white rounded-full shadow-lg w-14 h-14 flex items-center justify-center text-3xl"
              style={{ minWidth: 56, minHeight: 56 }}
              onClick={() => setShowFabMenu(true)}
              aria-label="Show Actions"
            >
              <Play className="w-8 h-8" />
            </button>
          )}
          {/* Expandable menu */}
          {showFabMenuPanel && (
            <div className="fixed bottom-4 right-4 z-40 flex flex-col gap-3 items-end animate-fade-in">
              <Button
                onClick={() => {
                  runFlow();
                  setShowSidePanel(true);
                  setShowFabMenu(false);
                }}
                disabled={!isFlowValid || isRunning}
                className="rounded-full bg-green-500 hover:bg-green-600 text-white shadow-lg w-14 h-14 flex items-center justify-center"
                style={{ minWidth: 56, minHeight: 56 }}
              >
                <Play className="w-8 h-8" />
              </Button>
              <Button
                onClick={resetFlow}
                variant="outline"
                className="rounded-full bg-white/80 shadow-lg w-14 h-14 flex items-center justify-center"
                style={{ minWidth: 56, minHeight: 56 }}
              >
                <RotateCcw className="w-7 h-7" />
              </Button>
              <Button
                onClick={handleExport}
                variant="outline"
                className="rounded-full bg-white/80 shadow-lg w-14 h-14 flex items-center justify-center"
                title="Export Flow"
                style={{ minWidth: 56, minHeight: 56 }}
              >
                <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 4v12m0 0l-4-4m4 4l4-4"/><rect x="4" y="16" width="16" height="4" rx="2"/></svg>
              </Button>
              <Button
                onClick={handleImportButtonClick}
                variant="outline"
                className="rounded-full bg-white/80 shadow-lg w-14 h-14 flex items-center justify-center"
                title="Import Flow"
                type="button"
                style={{ minWidth: 56, minHeight: 56 }}
              >
                <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 20V8m0 0l4 4m-4-4l-4 4"/><rect x="4" y="4" width="16" height="4" rx="2"/></svg>
              </Button>
              <button
                className="rounded-full bg-gray-200 text-gray-700 shadow-lg w-14 h-14 flex items-center justify-center text-2xl mt-2"
                style={{ minWidth: 56, minHeight: 56, position: 'absolute', right: 0, bottom: 0 }}
                onClick={() => setShowFabMenu(false)}
                aria-label="Close Actions"
              >
                ×
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="application/json"
                onChange={handleImport}
                style={{ display: 'none' }}
              />
            </div>
          )}
          {/* FAB for side panel (terminal) on mobile, only if menu is not open */}
          {showTerminalFab && (
            <button
              className="fixed right-4 bottom-20 z-30 bg-gray-900 text-white rounded-full shadow-lg w-14 h-14 flex items-center justify-center text-2xl border-4 border-white"
              style={{ minWidth: 56, minHeight: 56 }}
              onClick={() => setShowSidePanel(true)}
              aria-label="Show Terminal"
            >
              <Trophy className="w-7 h-7" />
            </button>
          )}
          {/* Hide side panel button on mobile */}
          {isMobile && showSidePanel && (
            <button
              className="fixed right-4 bottom-24 z-30 bg-gray-200 text-gray-700 rounded-full shadow-lg w-12 h-12 flex items-center justify-center text-xl"
              onClick={() => setShowSidePanel(false)}
              aria-label="Hide Side Panel"
            >
              ×
            </button>
          )}

          {/* Instructions */}
          {nodes.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-4 sm:p-8 text-center shadow-lg border-2 border-dashed border-purple-300">
                <div className="text-3xl sm:text-4xl mb-2 sm:mb-4">🎯</div>
                <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-1 sm:mb-2">Start Building!</h3>
                <p className="text-gray-600">Drag blocks from the left palette to this canvas</p>
                <p className="text-xs sm:text-sm text-gray-500 mt-1 sm:mt-2">Connect blocks by dragging from one handle to another</p>
              </div>
            </div>
          )}
        </div>

        {/* Side Panel with Tabs */}
        {(!isMobile || showSidePanel) && (
          <div className={`w-80 bg-white/80 backdrop-blur-sm border-l border-gray-200 flex flex-col z-20 ${isMobile ? 'fixed right-0 top-0 h-full shadow-lg' : ''}`}>
            {/* Code Mode Toggle */}
            <div className="p-2 sm:p-4 border-b border-gray-200 flex gap-1">
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
            {/* Tabs */}
            <div className="p-2 sm:p-4 border-b border-gray-200 flex gap-2">
              <Button
                variant={rightTab === 'challenges' ? 'default' : 'outline'}
                size="sm"
                className="flex-1"
                onClick={() => setRightTab('challenges')}
              >
                Challenges
              </Button>
              <Button
                variant={rightTab === 'terminal' ? 'default' : 'outline'}
                size="sm"
                className="flex-1"
                onClick={() => setRightTab('terminal')}
              >
                Terminal
              </Button>
            </div>
            {/* Tab Content */}
            <div className="flex-1 overflow-y-auto">
              {rightTab === 'challenges' ? (
                <div className="flex flex-col h-full">
                  {/* Challenge List */}
                  <div className="border-b border-gray-200 p-2">
                    <div className="text-xs font-semibold text-gray-600 mb-1">Select a Challenge</div>
                    <div className="flex flex-col gap-2 max-h-40 overflow-y-auto">
                      {challenges.map((ch, idx) => (
                        <Button
                          key={ch.id}
                          variant={selectedChallenge === idx ? 'default' : 'outline'}
                          size="lg"
                          className={`justify-start w-full text-left !py-4 !text-base ${currentChallengeIdx === idx ? 'ring-2 ring-purple-400' : ''}`}
                          onClick={() => {
                            setSelectedChallenge(idx);
                            setCurrentChallengeIdx(idx);
                          }}
                        >
                          {ch.title}
                          {badges.includes(ch.title) && <span className="ml-2 text-green-600">✓</span>}
                          {currentChallengeIdx === idx && <span className="ml-2 text-purple-500">(Current)</span>}
                        </Button>
                      ))}
                    </div>
                  </div>
                  {/* Challenge Details */}
                  <div className="flex-1 p-2 sm:p-4 flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                      <div className="text-base font-bold text-purple-700">{challenges[selectedChallenge].title}</div>
                      {currentChallengeIdx === selectedChallenge && <Badge variant="default" className="text-xs bg-purple-200 text-purple-700">Current</Badge>}
                      {badges.includes(challenges[selectedChallenge].title) && <Badge variant="default" className="text-xs bg-green-200 text-green-700">Completed</Badge>}
                    </div>
                    <div className="text-sm text-gray-700 mb-2">{challenges[selectedChallenge].description}</div>
                    <div className="text-xs text-gray-500 mb-1">Required Blocks:</div>
                    <div className="flex flex-wrap gap-1 mb-2">
                      {challenges[selectedChallenge].requiredBlocks.map((block, i) => (
                        <Badge key={i} variant="secondary" className="text-xs">{block}</Badge>
                      ))}
                    </div>
                    <div className="text-xs text-gray-500 mb-1">Hint:</div>
                    <div className="text-xs text-gray-600 mb-2">{challenges[selectedChallenge].hint}</div>
                    {/* Validate Button and Status */}
                    {currentChallengeIdx === selectedChallenge && !badges.includes(challenges[selectedChallenge].title) && (
                      <Button
                        onClick={() => {
                          const success = validateChallenge(selectedChallenge);
                        }}
                        className="w-fit bg-purple-500 hover:bg-purple-600 text-white text-xs px-4 py-2 rounded-full"
                      >
                        Validate
                      </Button>
                    )}
                    {currentChallengeIdx === selectedChallenge && badges.includes(challenges[selectedChallenge].title) && (
                      <div className="text-green-600 text-xs font-bold mt-1">Challenge Completed! 🎉</div>
                    )}
                    {currentChallengeIdx === selectedChallenge && !badges.includes(challenges[selectedChallenge].title) && (
                      <div className="text-red-500 text-xs font-bold mt-1">Not completed yet. Try adding all required blocks!</div>
                    )}
                  </div>
                </div>
              ) : (
                <TerminalConsole
                  code={generateCode()}
                  isRunning={isRunning}
                  isValid={isFlowValid}
                  nodes={nodes}
                  edges={edges}
                  variables={variables}
                  executionResults={executionResults}
                />
              )}
            </div>
            {/* Badges (always at bottom) */}
            {badges.length > 0 && (
              <div className="p-2 sm:p-4 border-t border-gray-200">
                <h3 className="text-xs sm:text-sm font-semibold text-gray-700 mb-1 sm:mb-2 flex items-center gap-1">
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
        )}
      </div>

      {/* Mobile Zoom FABs (always visible on mobile, above main FABs) */}
      {isMobile && !showSidePanel && !showFabMenu && (
        <div className="fixed right-4 bottom-40 z-40 flex flex-col gap-2 items-end">
          <Button
            onClick={handleZoomIn}
            className="rounded-full bg-purple-500 hover:bg-purple-600 text-white shadow-lg w-12 h-12 flex items-center justify-center"
            style={{ minWidth: 48, minHeight: 48 }}
            aria-label="Zoom In"
          >
            <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>
          </Button>
          <Button
            onClick={handleZoomOut}
            className="rounded-full bg-purple-500 hover:bg-purple-600 text-white shadow-lg w-12 h-12 flex items-center justify-center"
            style={{ minWidth: 48, minHeight: 48 }}
            aria-label="Zoom Out"
          >
            <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="8" y1="12" x2="16" y2="12"/></svg>
          </Button>
        </div>
      )}
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
