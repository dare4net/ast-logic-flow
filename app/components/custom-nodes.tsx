"use client"

import { Handle, Position, type NodeProps } from "reactflow"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Edit2, Check, X } from "lucide-react"

export function CustomNode({ data, selected, id }: NodeProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editData, setEditData] = useState(data)

  const getNodeConfig = (blockType: string) => {
    switch (blockType) {
      case "start":
        return {
          icon: "🚀",
          color: "from-blue-200 to-blue-300",
          border: "border-blue-400",
          textColor: "text-blue-800",
          hasInput: false,
          hasOutput: true,
          handles: [{ type: "source", position: Position.Bottom, id: "out" }],
        }
      case "end":
        return {
          icon: "🏁",
          color: "from-blue-200 to-blue-300",
          border: "border-blue-400",
          textColor: "text-blue-800",
          hasInput: true,
          hasOutput: false,
          handles: [{ type: "target", position: Position.Top, id: "in" }],
        }
      case "variable":
        return {
          icon: "📦",
          color: "from-orange-200 to-orange-300",
          border: "border-orange-400",
          textColor: "text-orange-800",
          hasInput: true,
          hasOutput: true,
          handles: [
            { type: "target", position: Position.Top, id: "in" },
            { type: "source", position: Position.Bottom, id: "out" },
          ],
        }
      case "setVariable":
        return {
          icon: "📝",
          color: "from-orange-200 to-orange-300",
          border: "border-orange-400",
          textColor: "text-orange-800",
          hasInput: true,
          hasOutput: true,
          handles: [
            { type: "target", position: Position.Top, id: "in" },
            { type: "source", position: Position.Bottom, id: "out" },
          ],
        }
      case "getVariable":
        return {
          icon: "📋",
          color: "from-orange-200 to-orange-300",
          border: "border-orange-400",
          textColor: "text-orange-800",
          hasInput: true,
          hasOutput: true,
          handles: [
            { type: "target", position: Position.Top, id: "in" },
            { type: "source", position: Position.Bottom, id: "out" },
          ],
        }
      case "if":
        return {
          icon: "❓",
          color: "from-green-200 to-green-300",
          border: "border-green-400",
          textColor: "text-green-800",
          hasInput: true,
          hasOutput: true,
          handles: [
            { type: "target", position: Position.Top, id: "in" },
            { type: "source", position: Position.Right, id: "true", style: { background: "#10b981" } },
            { type: "source", position: Position.Bottom, id: "out" },
          ],
        }
      case "ifElse":
        return {
          icon: "🔀",
          color: "from-green-200 to-green-300",
          border: "border-green-400",
          textColor: "text-green-800",
          hasInput: true,
          hasOutput: true,
          handles: [
            { type: "target", position: Position.Top, id: "in" },
            { type: "source", position: Position.Right, id: "true", style: { background: "#10b981" } },
            { type: "source", position: Position.Left, id: "false", style: { background: "#ef4444" } },
            { type: "source", position: Position.Bottom, id: "out" },
          ],
        }
      case "while":
        return {
          icon: "🔁",
          color: "from-yellow-200 to-yellow-300",
          border: "border-yellow-400",
          textColor: "text-yellow-800",
          hasInput: true,
          hasOutput: true,
          handles: [
            { type: "target", position: Position.Top, id: "in" },
            { type: "source", position: Position.Right, id: "loop", style: { background: "#10b981" } },
            { type: "source", position: Position.Bottom, id: "out" },
          ],
        }
      case "for":
        return {
          icon: "🔢",
          color: "from-yellow-200 to-yellow-300",
          border: "border-yellow-400",
          textColor: "text-yellow-800",
          hasInput: true,
          hasOutput: true,
          handles: [
            { type: "target", position: Position.Top, id: "in" },
            { type: "source", position: Position.Right, id: "loop", style: { background: "#10b981" } },
            { type: "source", position: Position.Bottom, id: "out" },
          ],
        }
      case "function":
        return {
          icon: "⚙️",
          color: "from-indigo-200 to-indigo-300",
          border: "border-indigo-400",
          textColor: "text-indigo-800",
          hasInput: true,
          hasOutput: true,
          handles: [
            { type: "target", position: Position.Top, id: "in" },
            { type: "source", position: Position.Bottom, id: "out" },
          ],
        }
      case "comparison":
        return {
          icon: "⚖️",
          color: "from-purple-200 to-purple-300",
          border: "border-purple-400",
          textColor: "text-purple-800",
          hasInput: true,
          hasOutput: true,
          handles: [
            { type: "target", position: Position.Top, id: "in" },
            { type: "source", position: Position.Bottom, id: "out" },
          ],
        }
      case "math":
        return {
          icon: "🧮",
          color: "from-purple-200 to-purple-300",
          border: "border-purple-400",
          textColor: "text-purple-800",
          hasInput: true,
          hasOutput: true,
          handles: [
            { type: "target", position: Position.Top, id: "in" },
            { type: "source", position: Position.Bottom, id: "out" },
          ],
        }
      default:
        return {
          icon: "⚡",
          color: "from-pink-200 to-pink-300",
          border: "border-pink-400",
          textColor: "text-pink-800",
          hasInput: true,
          hasOutput: true,
          handles: [
            { type: "target", position: Position.Top, id: "in" },
            { type: "source", position: Position.Bottom, id: "out" },
          ],
        }
    }
  }

  const config = getNodeConfig(data.blockType)

  const handleSave = () => {
    Object.assign(data, editData)
    setIsEditing(false)
  }

  const handleCancel = () => {
    setEditData({ ...data })
    setIsEditing(false)
  }

  const renderEditForm = () => {
    switch (data.blockType) {
      case "variable":
        return (
          <div className="space-y-2 w-48">
            <Input
              placeholder="Variable name"
              value={editData.variableName || ""}
              onChange={(e) => setEditData({ ...editData, variableName: e.target.value })}
              className="text-xs h-6"
            />
            <Input
              placeholder="Initial value"
              value={editData.variableValue || ""}
              onChange={(e) => setEditData({ ...editData, variableValue: e.target.value })}
              className="text-xs h-6"
            />
          </div>
        )

      case "setVariable":
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

      case "getVariable":
        return (
          <Input
            placeholder="Variable name"
            value={editData.variableName || ""}
            onChange={(e) => setEditData({ ...editData, variableName: e.target.value })}
            className="text-xs h-6 w-48"
          />
        )

      case "if":
      case "ifElse":
        return (
          <Input
            placeholder="Condition (e.g., x > 0)"
            value={editData.condition || ""}
            onChange={(e) => setEditData({ ...editData, condition: e.target.value })}
            className="text-xs h-6 w-48"
          />
        )

      case "while":
        return (
          <Input
            placeholder="Loop condition (e.g., i < 10)"
            value={editData.condition || ""}
            onChange={(e) => setEditData({ ...editData, condition: e.target.value })}
            className="text-xs h-6 w-48"
          />
        )

      case "for":
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

      case "function":
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

      case "comparison":
        return (
          <div className="space-y-2 w-48">
            <Select
              value={editData.operator || "=="}
              onValueChange={(value) => setEditData({ ...editData, operator: value })}
            >
              <SelectTrigger className="text-xs h-6">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="==">Equal (==)</SelectItem>
                <SelectItem value="!=">Not Equal (!=)</SelectItem>
                <SelectItem value=">">Greater Than (&gt;)</SelectItem>
                <SelectItem value="<">Less Than (&lt;)</SelectItem>
                <SelectItem value=">=">Greater Equal (&gt;=)</SelectItem>
                <SelectItem value="<=">Less Equal (&lt;=)</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex gap-1">
              <Input
                placeholder="Left value"
                value={editData.left || ""}
                onChange={(e) => setEditData({ ...editData, left: e.target.value })}
                className="text-xs h-6 flex-1"
              />
              <Input
                placeholder="Right value"
                value={editData.right || ""}
                onChange={(e) => setEditData({ ...editData, right: e.target.value })}
                className="text-xs h-6 flex-1"
              />
            </div>
          </div>
        )

      case "math":
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
                <SelectItem value="+">Add (+)</SelectItem>
                <SelectItem value="-">Subtract (-)</SelectItem>
                <SelectItem value="*">Multiply (*)</SelectItem>
                <SelectItem value="/">Divide (/)</SelectItem>
                <SelectItem value="%">Modulo (%)</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex gap-1">
              <Input
                placeholder="Left value"
                value={editData.left || ""}
                onChange={(e) => setEditData({ ...editData, left: e.target.value })}
                className="text-xs h-6 flex-1"
              />
              <Input
                placeholder="Right value"
                value={editData.right || ""}
                onChange={(e) => setEditData({ ...editData, right: e.target.value })}
                className="text-xs h-6 flex-1"
              />
            </div>
          </div>
        )

      case "action":
        return (
          <div className="space-y-2 w-48">
            <Select
              value={editData.actionType || "print"}
              onValueChange={(value) => setEditData({ ...editData, actionType: value })}
            >
              <SelectTrigger className="text-xs h-6">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="print">Print</SelectItem>
                <SelectItem value="alert">Alert</SelectItem>
                <SelectItem value="log">Log</SelectItem>
                <SelectItem value="custom">Custom</SelectItem>
              </SelectContent>
            </Select>
            <Input
              placeholder='Use quotes for strings: "Hello" or variable name'
              value={editData.actionValue || ""}
              onChange={(e) => setEditData({ ...editData, actionValue: e.target.value })}
              className="text-xs h-6"
            />
          </div>
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
      case "variable":
        return `${data.variableName || "var"} = ${data.variableValue || "0"}`
      case "setVariable":
        return `${data.variableName || "var"} = ${data.variableValue || "value"}`
      case "getVariable":
        return data.variableName || "var"
      case "if":
      case "ifElse":
      case "while":
        return data.condition || "condition"
      case "for":
        return `for(${data.init || "i=0"}; ${data.condition || "i<10"}; ${data.increment || "i++"})`
      case "function":
        return `${data.functionName || "func"}(${data.parameters?.join(", ") || ""})`
      case "comparison":
        return `${data.left || "a"} ${data.operator || "=="} ${data.right || "b"}`
      case "math":
        return `${data.left || "a"} ${data.operator || "+"} ${data.right || "b"}`
      case "action":
        return `${data.actionType || "print"}(${data.actionValue || "value"})`
      default:
        return data.label
    }
  }

  return (
    <div
      className={`
        px-4 py-3 shadow-lg rounded-3xl bg-gradient-to-r ${config.color} 
        border-2 ${config.border} min-w-[160px] text-center relative
        ${selected ? "ring-2 ring-purple-500 ring-offset-2" : ""}
        transition-all duration-200 hover:shadow-xl
      `}
    >
      {/* Handles */}
      {config.handles.map((handle, index) => (
        <Handle
          key={index}
          type={handle.type}
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
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setIsEditing(true)}
                className="h-4 w-4 p-0 opacity-70 hover:opacity-100"
              >
                <Edit2 className="w-3 h-3" />
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
