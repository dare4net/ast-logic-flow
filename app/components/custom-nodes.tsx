"use client"

import { Handle, Position, type NodeProps, useReactFlow } from "reactflow"
import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Edit2, Check, X } from "lucide-react"

export function CustomNode({ data, selected, id }: NodeProps) {
  const { getEdges, setEdges, setNodes } = useReactFlow();
  const [isEditing, setIsEditing] = useState(false)
  const [editData, setEditData] = useState(data)
  const isConnectSelected = data.selectedForConnect === id;

  // Mobile drag/tap-to-connect logic
  const [dragging, setDragging] = useState(false);
  const longPressTimeout = useRef<NodeJS.Timeout | null>(null);
  const touchStartPos = useRef<{x: number, y: number} | null>(null);

  // Only enable this on mobile (window.ontouchstart exists)
  const isMobile = typeof window !== 'undefined' && 'ontouchstart' in window;

  // --- Improved long-press-to-drag for React Flow ---
  const nodeRef = useRef<HTMLDivElement>(null);
  const dragStarted = useRef(false);

  // Long-press to drag, tap to connect
  const handleTouchStart = (e: React.TouchEvent) => {
    if (!isMobile) return;
    if (e.touches.length > 1) return;
    touchStartPos.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    dragStarted.current = false;
    longPressTimeout.current = setTimeout(() => {
      // Programmatically trigger pointerdown for React Flow
      if (nodeRef.current) {
        const rect = nodeRef.current.getBoundingClientRect();
        const x = e.touches[0].clientX - rect.left;
        const y = e.touches[0].clientY - rect.top;
        const pointerDownEvent = new PointerEvent('pointerdown', {
          bubbles: true,
          clientX: e.touches[0].clientX,
          clientY: e.touches[0].clientY,
          pointerType: 'touch',
        });
        nodeRef.current.dispatchEvent(pointerDownEvent);
        setDragging(true);
        dragStarted.current = true;
      }
    }, 250);
  };
  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isMobile) return;
    if (!dragStarted.current && touchStartPos.current) {
      // If user moves finger more than 10px, cancel long-press
      const dx = e.touches[0].clientX - touchStartPos.current.x;
      const dy = e.touches[0].clientY - touchStartPos.current.y;
      if (Math.abs(dx) > 10 || Math.abs(dy) > 10) {
        if (longPressTimeout.current) clearTimeout(longPressTimeout.current);
      }
    }
  };
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!isMobile) return;
    if (longPressTimeout.current) clearTimeout(longPressTimeout.current);
    if (dragStarted.current) {
      setDragging(false);
      dragStarted.current = false;
      return;
    }
    // If not dragging, treat as tap (connect)
    if (typeof data.onNodeTap === 'function') {
      data.onNodeTap(id);
    }
  };

  const getNodeConfig = (blockType: string) => {
    switch (blockType) {
      case "start":
        return { icon: "🚀", color: "from-blue-200 to-blue-300", border: "border-blue-400", textColor: "text-blue-800", hasInput: false, hasOutput: true, handles: [{ type: "source", position: Position.Bottom, id: "out" }] }
      case "end":
        return { icon: "🏁", color: "from-blue-200 to-blue-300", border: "border-blue-400", textColor: "text-blue-800", hasInput: true, hasOutput: false, handles: [{ type: "target", position: Position.Top, id: "in" }] }
      case "return":
        return { icon: "↩️", color: "from-blue-200 to-blue-300", border: "border-blue-400", textColor: "text-blue-800", hasInput: true, hasOutput: false, handles: [{ type: "target", position: Position.Top, id: "in" }] }
      case "break":
        return { icon: "⏹️", color: "from-blue-200 to-blue-300", border: "border-blue-400", textColor: "text-blue-800", hasInput: true, hasOutput: false, handles: [{ type: "target", position: Position.Top, id: "in" }] }
      case "continue":
        return { icon: "⏭️", color: "from-blue-200 to-blue-300", border: "border-blue-400", textColor: "text-blue-800", hasInput: true, hasOutput: false, handles: [{ type: "target", position: Position.Top, id: "in" }] }
      case "declareVariable":
        return { icon: "📦", color: "from-orange-200 to-orange-300", border: "border-orange-400", textColor: "text-orange-800", hasInput: true, hasOutput: true, handles: [{ type: "target", position: Position.Top, id: "in" }, { type: "source", position: Position.Bottom, id: "out" }] }
      case "assignment":
        return { icon: "📝", color: "from-orange-200 to-orange-300", border: "border-orange-400", textColor: "text-orange-800", hasInput: true, hasOutput: true, handles: [{ type: "target", position: Position.Top, id: "in" }, { type: "source", position: Position.Bottom, id: "out" }] }
      case "number":
        return { icon: "🔢", color: "from-yellow-200 to-yellow-300", border: "border-yellow-400", textColor: "text-yellow-800", hasInput: true, hasOutput: true, handles: [{ type: "target", position: Position.Top, id: "in" }, { type: "source", position: Position.Bottom, id: "out" }] }
      case "string":
        return { icon: "🔤", color: "from-yellow-200 to-yellow-300", border: "border-yellow-400", textColor: "text-yellow-800", hasInput: true, hasOutput: true, handles: [{ type: "target", position: Position.Top, id: "in" }, { type: "source", position: Position.Bottom, id: "out" }] }
      case "boolean":
        return { icon: "🔘", color: "from-yellow-200 to-yellow-300", border: "border-yellow-400", textColor: "text-yellow-800", hasInput: true, hasOutput: true, handles: [{ type: "target", position: Position.Top, id: "in" }, { type: "source", position: Position.Bottom, id: "out" }] }
      case "array":
        return { icon: "📚", color: "from-yellow-200 to-yellow-300", border: "border-yellow-400", textColor: "text-yellow-800", hasInput: true, hasOutput: true, handles: [{ type: "target", position: Position.Top, id: "in" }, { type: "source", position: Position.Bottom, id: "out" }] }
      case "object":
        return { icon: "🗂️", color: "from-yellow-200 to-yellow-300", border: "border-yellow-400", textColor: "text-yellow-800", hasInput: true, hasOutput: true, handles: [{ type: "target", position: Position.Top, id: "in" }, { type: "source", position: Position.Bottom, id: "out" }] }
      case "conditional":
        return { icon: "❓", color: "from-green-200 to-green-300", border: "border-green-400", textColor: "text-green-800", hasInput: true, hasOutput: true, handles: [{ type: "target", position: Position.Top, id: "in" }, { type: "source", position: Position.Right, id: "true", style: { background: "#10b981" } }, { type: "source", position: Position.Left, id: "false", style: { background: "#ef4444" } }] }
      case "switchCase":
        return { icon: "🔀", color: "from-green-200 to-green-300", border: "border-green-400", textColor: "text-green-800", hasInput: true, hasOutput: true, handles: [{ type: "target", position: Position.Top, id: "in" }, { type: "source", position: Position.Bottom, id: "out" }] }
      case "forLoop":
        return { icon: "🔢", color: "from-yellow-200 to-yellow-300", border: "border-yellow-400", textColor: "text-yellow-800", hasInput: true, hasOutput: true, handles: [{ type: "target", position: Position.Top, id: "in" }, { type: "source", position: Position.Right, id: "loop", style: { background: "#10b981" } }, { type: "source", position: Position.Bottom, id: "out" }] }
      case "forEach":
        return { icon: "📖", color: "from-yellow-200 to-yellow-300", border: "border-yellow-400", textColor: "text-yellow-800", hasInput: true, hasOutput: true, handles: [{ type: "target", position: Position.Top, id: "in" }, { type: "source", position: Position.Right, id: "loop", style: { background: "#10b981" } }, { type: "source", position: Position.Bottom, id: "out" }] }
      case "whileLoop":
        return { icon: "🔁", color: "from-yellow-200 to-yellow-300", border: "border-yellow-400", textColor: "text-yellow-800", hasInput: true, hasOutput: true, handles: [{ type: "target", position: Position.Top, id: "in" }, { type: "source", position: Position.Right, id: "loop", style: { background: "#10b981" } }, { type: "source", position: Position.Bottom, id: "out" }] }
      case "doWhileLoop":
        return { icon: "🔄", color: "from-yellow-200 to-yellow-300", border: "border-yellow-400", textColor: "text-yellow-800", hasInput: true, hasOutput: true, handles: [{ type: "target", position: Position.Top, id: "in" }, { type: "source", position: Position.Right, id: "loop", style: { background: "#10b981" } }, { type: "source", position: Position.Bottom, id: "out" }] }
      case "functionDeclaration":
        return { icon: "⚙️", color: "from-indigo-200 to-indigo-300", border: "border-indigo-400", textColor: "text-indigo-800", hasInput: true, hasOutput: true, handles: [{ type: "target", position: Position.Top, id: "in" }, { type: "source", position: Position.Bottom, id: "out" }] }
      case "functionCall":
        return { icon: "📞", color: "from-indigo-200 to-indigo-300", border: "border-indigo-400", textColor: "text-indigo-800", hasInput: true, hasOutput: true, handles: [{ type: "target", position: Position.Top, id: "in" }, { type: "source", position: Position.Bottom, id: "out" }] }
      case "arithmeticOperator":
        return { icon: "➗", color: "from-purple-200 to-purple-300", border: "border-purple-400", textColor: "text-purple-800", hasInput: true, hasOutput: true, handles: [{ type: "target", position: Position.Top, id: "in" }, { type: "source", position: Position.Bottom, id: "out" }] }
      case "comparisonOperator":
        return { icon: "⚖️", color: "from-purple-200 to-purple-300", border: "border-purple-400", textColor: "text-purple-800", hasInput: true, hasOutput: true, handles: [{ type: "target", position: Position.Top, id: "in" }, { type: "source", position: Position.Bottom, id: "out" }] }
      case "logicalOperator":
        return { icon: "🔀", color: "from-purple-200 to-purple-300", border: "border-purple-400", textColor: "text-purple-800", hasInput: true, hasOutput: true, handles: [{ type: "target", position: Position.Top, id: "in" }, { type: "source", position: Position.Bottom, id: "out" }] }
      case "arrayPush":
        return { icon: "📥", color: "from-pink-200 to-pink-300", border: "border-pink-400", textColor: "text-pink-800", hasInput: true, hasOutput: true, handles: [{ type: "target", position: Position.Top, id: "in" }, { type: "source", position: Position.Bottom, id: "out" }] }
      case "arrayPop":
        return { icon: "📤", color: "from-pink-200 to-pink-300", border: "border-pink-400", textColor: "text-pink-800", hasInput: true, hasOutput: true, handles: [{ type: "target", position: Position.Top, id: "in" }, { type: "source", position: Position.Bottom, id: "out" }] }
      case "arrayMap":
        return { icon: "🗺️", color: "from-pink-200 to-pink-300", border: "border-pink-400", textColor: "text-pink-800", hasInput: true, hasOutput: true, handles: [{ type: "target", position: Position.Top, id: "in" }, { type: "source", position: Position.Bottom, id: "out" }] }
      case "arrayFilter":
        return { icon: "🔍", color: "from-pink-200 to-pink-300", border: "border-pink-400", textColor: "text-pink-800", hasInput: true, hasOutput: true, handles: [{ type: "target", position: Position.Top, id: "in" }, { type: "source", position: Position.Bottom, id: "out" }] }
      case "arrayReduce":
        return { icon: "➖", color: "from-pink-200 to-pink-300", border: "border-pink-400", textColor: "text-pink-800", hasInput: true, hasOutput: true, handles: [{ type: "target", position: Position.Top, id: "in" }, { type: "source", position: Position.Bottom, id: "out" }] }
      case "print":
        return { icon: "🖨️", color: "from-gray-200 to-gray-300", border: "border-gray-400", textColor: "text-gray-800", hasInput: true, hasOutput: true, handles: [{ type: "target", position: Position.Top, id: "in" }, { type: "source", position: Position.Bottom, id: "out" }] }
      case "input":
        return { icon: "⌨️", color: "from-gray-200 to-gray-300", border: "border-gray-400", textColor: "text-gray-800", hasInput: true, hasOutput: true, handles: [{ type: "target", position: Position.Top, id: "in" }, { type: "source", position: Position.Bottom, id: "out" }] }
      case "try":
        return { icon: "🛡️", color: "from-red-200 to-red-300", border: "border-red-400", textColor: "text-red-800", hasInput: true, hasOutput: true, handles: [{ type: "target", position: Position.Top, id: "in" }, { type: "source", position: Position.Bottom, id: "out" }] }
      case "catch":
        return { icon: "🪤", color: "from-red-200 to-red-300", border: "border-red-400", textColor: "text-red-800", hasInput: true, hasOutput: true, handles: [{ type: "target", position: Position.Top, id: "in" }, { type: "source", position: Position.Bottom, id: "out" }] }
      case "throw":
        return { icon: "🚨", color: "from-red-200 to-red-300", border: "border-red-400", textColor: "text-red-800", hasInput: true, hasOutput: false, handles: [{ type: "target", position: Position.Top, id: "in" }] }
      default:
        return { icon: "⚡", color: "from-pink-200 to-pink-300", border: "border-pink-400", textColor: "text-pink-800", hasInput: true, hasOutput: true, handles: [{ type: "target", position: Position.Top, id: "in" }, { type: "source", position: Position.Bottom, id: "out" }] }
    }
  }

  const config = getNodeConfig(data.blockType)

  const handleSave = () => {
    if (typeof data.updateNodeData === 'function') {
      data.updateNodeData(id, editData)
    }
    setIsEditing(false)
  }

  const handleCancel = () => {
    setEditData({ ...data })
    setIsEditing(false)
  }

  // Delete handler with flow preservation
  const handleDelete = () => {
    // Get all edges
    const allEdges = getEdges();
    // Find incoming and outgoing edges
    const incoming = allEdges.filter(e => e.target === id);
    const outgoing = allEdges.filter(e => e.source === id);
    // Create new edges connecting incoming sources to outgoing targets
    const newEdges: typeof allEdges = [];
    for (const inEdge of incoming) {
      for (const outEdge of outgoing) {
        if (inEdge.source !== outEdge.target && outEdge.target !== id && inEdge.source !== id) {
          newEdges.push({
            ...outEdge,
            id: `${inEdge.source}-${outEdge.target}-${Date.now()}`,
            source: inEdge.source,
            target: outEdge.target,
          });
        }
      }
    }
    // Remove all edges connected to this node, add new ones
    setEdges((eds) => [
      ...eds.filter(e => e.source !== id && e.target !== id),
      ...newEdges
    ]);
    // Remove the node
    setNodes((nds) => nds.filter(n => n.id !== id));
  };

  const renderEditForm = () => {
    switch (data.blockType) {
      case "declareVariable":
        return (
          <div className="space-y-2 w-48">
            <Input
              placeholder="Variable name"
              value={editData.variableName || ""}
              onChange={(e) => setEditData({ ...editData, variableName: e.target.value })}
              className="text-xs h-6"
            />
            <Select
              value={editData.variableType || "number"}
              onValueChange={(value) => setEditData({ ...editData, variableType: value })}
            >
              <SelectTrigger className="text-xs h-6"><SelectValue placeholder="Type" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="number">Number</SelectItem>
                <SelectItem value="string">String</SelectItem>
                <SelectItem value="boolean">Boolean</SelectItem>
                <SelectItem value="array">Array</SelectItem>
                <SelectItem value="object">Object</SelectItem>
              </SelectContent>
            </Select>
            <Input
              placeholder="Initial value"
              value={editData.variableValue || ""}
              onChange={(e) => setEditData({ ...editData, variableValue: e.target.value })}
              className="text-xs h-6"
            />
          </div>
        )

      case "assignment":
        return (
          <div className="space-y-2 w-48">
            <Input
              placeholder="Variable name"
              value={editData.variableName || ""}
              onChange={(e) => setEditData({ ...editData, variableName: e.target.value })}
              className="text-xs h-6"
            />
            <Input
              placeholder="New value"
              value={editData.variableValue || ""}
              onChange={(e) => setEditData({ ...editData, variableValue: e.target.value })}
              className="text-xs h-6"
            />
          </div>
        )

      case "number":
        return (
          <Input
            placeholder="Enter number"
            value={editData.value || ""}
            onChange={(e) => setEditData({ ...editData, value: e.target.value })}
            className="text-xs h-6 w-48"
          />
        )

      case "string":
        return (
          <Input
            placeholder="Enter string"
            value={editData.value || ""}
            onChange={(e) => setEditData({ ...editData, value: e.target.value })}
            className="text-xs h-6 w-48"
          />
        )

      case "boolean":
        return (
          <Select
            value={editData.value ? "true" : "false"}
            onValueChange={(value) => setEditData({ ...editData, value: value === "true" })}
            className="text-xs h-6 w-48"
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="true">True</SelectItem>
              <SelectItem value="false">False</SelectItem>
            </SelectContent>
          </Select>
        )

      case "array":
      case "object":
        return (
          <Textarea
            placeholder="Enter JSON (array or object)"
            value={editData.value || ""}
            onChange={(e) => setEditData({ ...editData, value: e.target.value })}
            className="text-xs h-16 resize-none w-48"
          />
        )

      case "conditional":
        return (
          <div className="space-y-2 w-48">
            <Input placeholder="Left" value={editData.left || ""} onChange={(e) => setEditData({ ...editData, left: e.target.value })} className="text-xs h-6" />
            <Select value={editData.operator || "=="} onValueChange={(value) => setEditData({ ...editData, operator: value })}>
              <SelectTrigger className="text-xs h-6"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="==">==</SelectItem>
                <SelectItem value="!=">!=</SelectItem>
                <SelectItem value=">">&gt;</SelectItem>
                <SelectItem value="<">&lt;</SelectItem>
                <SelectItem value=">=">&gt;=</SelectItem>
                <SelectItem value="<=">&lt;=</SelectItem>
              </SelectContent>
            </Select>
            <Input placeholder="Right" value={editData.right || ""} onChange={(e) => setEditData({ ...editData, right: e.target.value })} className="text-xs h-6" />
          </div>
        )

      case "switchCase":
        return (
          <div className="space-y-2 w-48">
            <Input
              placeholder="Expression (e.g., fruit)"
              value={editData.expression || ""}
              onChange={(e) => setEditData({ ...editData, expression: e.target.value })}
              className="text-xs h-6"
            />
            <div className="flex flex-col gap-1">
              {editData.cases?.map((caseItem: any, index: number) => (
                <div key={index} className="flex gap-1">
                  <Input
                    placeholder="Case value"
                    value={caseItem.value || ""}
                    onChange={(e) => {
                      const newCases = [...(editData.cases || [])]
                      newCases[index] = { ...newCases[index], value: e.target.value }
                      setEditData({ ...editData, cases: newCases })
                    }}
                    className="text-xs h-6 flex-1"
                  />
                  <Input
                    placeholder="Result"
                    value={caseItem.result || ""}
                    onChange={(e) => {
                      const newCases = [...(editData.cases || [])]
                      newCases[index] = { ...newCases[index], result: e.target.value }
                      setEditData({ ...editData, cases: newCases })
                    }}
                    className="text-xs h-6 flex-1"
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      const newCases = [...(editData.cases || [])]
                      newCases.splice(index, 1)
                      setEditData({ ...editData, cases: newCases })
                    }}
                    className="h-6 w-6 p-0"
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              ))}
            </div>
            <Button
              size="sm"
              onClick={() => {
                const newCases = [...(editData.cases || []), { value: "", result: "" }]
                setEditData({ ...editData, cases: newCases })
              }}
              className="h-6 w-full"
            >
              Add Case
            </Button>
          </div>
        )

      case "forLoop":
      case "forEach":
        return (
          <div className="space-y-2 w-48">
            <Input
              placeholder="Init (e.g., i = 0)"
              value={editData.init || ""}
              onChange={(e) => setEditData({ ...editData, init: e.target.value })}
              className="text-xs h-6"
            />
            <Input
              placeholder="Condition (e.g., i < 10)"
              value={editData.condition || ""}
              onChange={(e) => setEditData({ ...editData, condition: e.target.value })}
              className="text-xs h-6"
            />
            <Input
              placeholder="Increment (e.g., i++)"
              value={editData.increment || ""}
              onChange={(e) => setEditData({ ...editData, increment: e.target.value })}
              className="text-xs h-6"
            />
          </div>
        )

      case "whileLoop":
      case "doWhileLoop":
        return (
          <Input
            placeholder="Loop condition (e.g., i < 10)"
            value={editData.condition || ""}
            onChange={(e) => setEditData({ ...editData, condition: e.target.value })}
            className="text-xs h-6 w-48"
          />
        )

      case "functionDeclaration":
        return (
          <div className="space-y-2 w-48">
            <Input
              placeholder="Function name"
              value={editData.functionName || ""}
              onChange={(e) => setEditData({ ...editData, functionName: e.target.value })}
              className="text-xs h-6"
            />
            <Textarea
              placeholder="Parameters (one per line)"
              value={editData.parameters?.join("\n") || ""}
              onChange={(e) => setEditData({ ...editData, parameters: e.target.value.split("\n") })}
              className="text-xs h-16 resize-none"
            />
          </div>
        )

      case "functionCall":
        return (
          <div className="space-y-2 w-48">
            <Select
              value={editData.functionName || ""}
              onValueChange={(value) => setEditData({ ...editData, functionName: value })}
            >
              <SelectTrigger className="text-xs h-6">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {/* Options will be populated dynamically based on available functions */}
                <SelectItem value="func1">func1</SelectItem>
                <SelectItem value="func2">func2</SelectItem>
                <SelectItem value="func3">func3</SelectItem>
              </SelectContent>
            </Select>
            <Textarea
              placeholder="Arguments (one per line)"
              value={editData.arguments?.join("\n") || ""}
              onChange={(e) => setEditData({ ...editData, arguments: e.target.value.split("\n") })}
              className="text-xs h-16 resize-none"
            />
          </div>
        )

      case "arithmeticOperator":
      case "comparisonOperator":
      case "logicalOperator":
        return (
          <div className="space-y-2 w-48">
            <Select
              value={editData.operator || "+"}
              onValueChange={(value) => setEditData({ ...editData, operator: value })}
            >
              <SelectTrigger className="text-xs h-6">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {data.blockType === "arithmeticOperator" && (
                  <>
                    <SelectItem value="+">Add (+)</SelectItem>
                    <SelectItem value="-">Subtract (-)</SelectItem>
                    <SelectItem value="*">Multiply (*)</SelectItem>
                    <SelectItem value="/">Divide (/)</SelectItem>
                    <SelectItem value="%">Modulo (%)</SelectItem>
                  </>
                )}
                {data.blockType === "comparisonOperator" && (
                  <>
                    <SelectItem value="==">Equal (==)</SelectItem>
                    <SelectItem value="!=">Not Equal (!=)</SelectItem>
                    <SelectItem value=">">Greater Than (&gt;)</SelectItem>
                    <SelectItem value="<">Less Than (&lt;)</SelectItem>
                    <SelectItem value=">=">Greater Equal (&gt;=)</SelectItem>
                    <SelectItem value="<=">Less Equal (&lt;=)</SelectItem>
                  </>
                )}
                {data.blockType === "logicalOperator" && (
                  <>
                    <SelectItem value="&&">And (&&)</SelectItem>
                    <SelectItem value="||">Or (||)</SelectItem>
                    <SelectItem value="!">Not (!)</SelectItem>
                  </>
                )}
              </SelectContent>
            </Select>
            <div className="flex gap-1">
              <Input
                placeholder="Left operand"
                value={editData.left || ""}
                onChange={(e) => setEditData({ ...editData, left: e.target.value })}
                className="text-xs h-6 flex-1"
              />
              <Input
                placeholder="Right operand"
                value={editData.right || ""}
                onChange={(e) => setEditData({ ...editData, right: e.target.value })}
                className="text-xs h-6 flex-1"
              />
            </div>
          </div>
        )

      case "arrayPush":
      case "arrayPop":
      case "arrayMap":
      case "arrayFilter":
      case "arrayReduce":
        return (
          <div className="space-y-2 w-48">
            <Select
              value={editData.method || "push"}
              onValueChange={(value) => setEditData({ ...editData, method: value })}
            >
              <SelectTrigger className="text-xs h-6">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {data.blockType === "arrayPush" && <SelectItem value="push">Push</SelectItem>}
                {data.blockType === "arrayPop" && <SelectItem value="pop">Pop</SelectItem>}
                {data.blockType === "arrayMap" && <SelectItem value="map">Map</SelectItem>}
                {data.blockType === "arrayFilter" && <SelectItem value="filter">Filter</SelectItem>}
                {data.blockType === "arrayReduce" && <SelectItem value="reduce">Reduce</SelectItem>}
              </SelectContent>
            </Select>
            <Input
              placeholder="Target array"
              value={editData.targetArray || ""}
              onChange={(e) => setEditData({ ...editData, targetArray: e.target.value })}
              className="text-xs h-6"
            />
          </div>
        )

      case "print":
        return (
          <Input
            placeholder='Use quotes for strings: "Hello" or variable name'
            value={editData.value || ""}
            onChange={(e) => setEditData({ ...editData, value: e.target.value })}
            className="text-xs h-6"
          />
        )

      default:
        return (
          <Input
            value={editData.label || ""}
            onChange={(e) => setEditData({ ...editData, label: e.target.value })}
            className="text-xs h-6 w-48"
          />
        )
    }
  }

  const getDisplayText = () => {
    switch (data.blockType) {
      case "declareVariable":
        return `${data.variableType || "type"} ${data.variableName || "var"} = ${data.variableValue || "0"}`
      case "assignment":
        return `${data.variableName || "var"} = ${data.variableValue || "value"}`
      case "return":
        return `return ${data.value || ""}`
      case "break":
        return "break"
      case "continue":
        return "continue"
      case "number":
        return data.value || "0"
      case "string":
        return `"${data.value || ""}"`
      case "boolean":
        return data.value ? "true" : "false"
      case "array":
      case "object":
        return `${data.value ? "..." : ""}`
      case "conditional":
        return `${data.left || "left"} ${data.operator || "=="} ${data.right || "right"}`
      case "switchCase":
        return `switch(${data.expression || "expr"}) { ... }`
      case "forLoop":
        return `for(${data.init || "i=0"}; ${data.condition || "i<10"}; ${data.increment || "i++"})`
      case "whileLoop":
      case "doWhileLoop":
        return `while(${data.condition || "condition"})`
      case "functionDeclaration":
        return `${data.functionName || "func"}(${data.parameters?.join(", ") || ""})`
      case "functionCall":
        return `${data.functionName || "func"}(${data.arguments?.join(", ") || ""})`
      case "arithmeticOperator":
        return `${data.left || "a"} ${data.operator || "+"} ${data.right || "b"}`
      case "comparisonOperator":
        return `${data.left || "a"} ${data.operator || "=="} ${data.right || "b"}`
      case "logicalOperator":
        return `${data.left || "a"} ${data.operator || "&&"} ${data.right || "b"}`
      case "arrayPush":
        return `array.push(${data.value || "value"})`
      case "arrayPop":
        return `array.pop()`
      case "arrayMap":
        return `array.map(...)`
      case "arrayFilter":
        return `array.filter(...)`
      case "arrayReduce":
        return `array.reduce(...)`
      case "print":
        return `print(${data.value || "value"})`
      default:
        return data.label
    }
  }

  return (
    <div
      ref={nodeRef}
      className={`rounded-xl shadow-md border-2 p-3 bg-gradient-to-br ${config.color} ${config.border} ${config.textColor} transition-all duration-150 ${selected ? "ring-2 ring-purple-500" : ""} ${isConnectSelected ? "ring-4 ring-green-500 border-green-500" : ""} ${dragging ? "scale-105 ring-2 ring-blue-400" : ""}`}
      style={{ minWidth: 120, minHeight: 60, position: "relative", zIndex: selected ? 10 : 1 }}
      onClick={isMobile ? (e => { e.stopPropagation(); if (typeof data.onNodeTap === 'function') data.onNodeTap(id); }) : undefined}
      onTouchStart={isMobile ? handleTouchStart : undefined}
      onTouchMove={isMobile ? handleTouchMove : undefined}
      onTouchEnd={isMobile ? handleTouchEnd : undefined}
    >
      {/* Handles */}
      {config.handles.map((handle, index) => (
        <Handle
          key={index}
          type={handle.type as any}
          position={handle.position}
          id={handle.id}
          className="w-3 h-3 bg-white border-2 border-gray-400"
          style={handle.style}
        />
      ))}

      {/* Node Content */}
      <div className="flex flex-col items-center gap-1">
        <div className="text-2xl">{config.icon}</div>
        {isEditing ? (
          <div className="flex flex-col gap-2 w-full items-center">
            {renderEditForm()}
            <div className="flex gap-1 justify-center">
              <Button size="sm" onClick={handleSave} className="h-6 w-6 p-0">
                <Check className="w-3 h-3" />
              </Button>
              <Button size="sm" variant="outline" onClick={handleCancel} className="h-6 w-6 p-0 bg-transparent">
                <X className="w-3 h-3" />
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-1">
            <div className={`font-bold text-xs ${config.textColor} max-w-[140px] break-words`}>{getDisplayText()}</div>
            {selected && (
              <>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setIsEditing(true)}
                  className="h-4 w-4 p-0 opacity-70 hover:opacity-100"
                >
                  <Edit2 className="w-3 h-3" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleDelete}
                  className="h-4 w-4 p-0 opacity-70 hover:opacity-100 text-red-500"
                  title="Delete block"
                >
                  <X className="w-3 h-3" />
                </Button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
