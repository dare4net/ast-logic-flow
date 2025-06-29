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
				type: "return",
				label: "Return",
				icon: "↩️",
				color: "from-blue-200 to-blue-300",
				border: "border-blue-400",
				description: "Return from function",
			},
			{
				type: "break",
				label: "Break",
				icon: "⏹️",
				color: "from-blue-200 to-blue-300",
				border: "border-blue-400",
				description: "Break loop",
			},
			{
				type: "continue",
				label: "Continue",
				icon: "⏭️",
				color: "from-blue-200 to-blue-300",
				border: "border-blue-400",
				description: "Continue loop",
			},
		],
	},
	{
		name: "Variables",
		icon: "📦",
		blocks: [
			{
				type: "declareVariable",
				label: "Declare Variable",
				icon: "📦",
				color: "from-orange-200 to-orange-300",
				border: "border-orange-400",
				description: "Create variable with type",
			},
			{
				type: "assignment",
				label: "Assignment",
				icon: "📝",
				color: "from-orange-200 to-orange-300",
				border: "border-orange-400",
				description: "Assign value to variable",
			},
		],
	},
	{
		name: "Conditionals",
		icon: "❓",
		blocks: [
			{
				type: "conditional",
				label: "If / Else If / Else",
				icon: "❓",
				color: "from-green-200 to-green-300",
				border: "border-green-400",
				description: "Configurable conditional",
			},
			{
				type: "switchCase",
				label: "Switch / Case",
				icon: "🔀",
				color: "from-green-200 to-green-300",
				border: "border-green-400",
				description: "Switch/case structure",
			},
		],
	},
	{
		name: "Loops",
		icon: "🔁",
		blocks: [
			{
				type: "forLoop",
				label: "For Loop",
				icon: "🔢",
				color: "from-yellow-200 to-yellow-300",
				border: "border-yellow-400",
				description: "Traditional for loop",
			},
			{
				type: "forEach",
				label: "For Each",
				icon: "📖",
				color: "from-yellow-200 to-yellow-300",
				border: "border-yellow-400",
				description: "Array iteration",
			},
			{
				type: "whileLoop",
				label: "While Loop",
				icon: "🔁",
				color: "from-yellow-200 to-yellow-300",
				border: "border-yellow-400",
				description: "While loop",
			},
			{
				type: "doWhileLoop",
				label: "Do-While Loop",
				icon: "🔄",
				color: "from-yellow-200 to-yellow-300",
				border: "border-yellow-400",
				description: "Do-while loop",
			},
		],
	},
	{
		name: "Functions",
		icon: "⚙️",
		blocks: [
			{
				type: "functionDeclaration",
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
		name: "Operators",
		icon: "🧮",
		blocks: [
			{
				type: "arithmeticOperator",
				label: "Arithmetic",
				icon: "➗",
				color: "from-purple-200 to-purple-300",
				border: "border-purple-400",
				description: "+, -, *, /, %, **",
			},
			{
				type: "comparisonOperator",
				label: "Comparison",
				icon: "⚖️",
				color: "from-purple-200 to-purple-300",
				border: "border-purple-400",
				description: "==, !=, <, >, etc.",
			},
			{
				type: "logicalOperator",
				label: "Logical",
				icon: "🔀",
				color: "from-purple-200 to-purple-300",
				border: "border-purple-400",
				description: "&&, ||, !",
			},
		],
	},
	{
		name: "Array Operations",
		icon: "📚",
		blocks: [
			{
				type: "arrayPush",
				label: "Array Push",
				icon: "📥",
				color: "from-pink-200 to-pink-300",
				border: "border-pink-400",
				description: "Push to array",
			},
			{
				type: "arrayPop",
				label: "Array Pop",
				icon: "📤",
				color: "from-pink-200 to-pink-300",
				border: "border-pink-400",
				description: "Pop from array",
			},
			{
				type: "arrayMap",
				label: "Array Map",
				icon: "🗺️",
				color: "from-pink-200 to-pink-300",
				border: "border-pink-400",
				description: "Map array",
			},
			{
				type: "arrayFilter",
				label: "Array Filter",
				icon: "🔍",
				color: "from-pink-200 to-pink-300",
				border: "border-pink-400",
				description: "Filter array",
			},
			{
				type: "arrayReduce",
				label: "Array Reduce",
				icon: "➖",
			 color: "from-pink-200 to-pink-300",
				border: "border-pink-400",
				description: "Reduce array",
			},
		],
	},
	{
		name: "Input/Output",
		icon: "💬",
		blocks: [
			{
				type: "print",
				label: "Print",
				icon: "🖨️",
				color: "from-gray-200 to-gray-300",
				border: "border-gray-400",
				description: "Output value",
			},
			{
				type: "input",
				label: "Input",
				icon: "⌨️",
				color: "from-gray-200 to-gray-300",
				border: "border-gray-400",
				description: "Input value",
			},
		],
	},
	{
		name: "Error Handling",
		icon: "⚠️",
		blocks: [
			{
				type: "try",
				label: "Try",
				icon: "🛡️",
				color: "from-red-200 to-red-300",
				border: "border-red-400",
				description: "Try block",
			},
			{
				type: "catch",
				label: "Catch",
				icon: "🪤",
				color: "from-red-200 to-red-300",
				border: "border-red-400",
				description: "Catch block",
			},
			{
				type: "throw",
				label: "Throw",
				icon: "🚨",
				color: "from-red-200 to-red-300",
				border: "border-red-400",
				description: "Throw error",
			},
		],
	},
]

interface BlockPaletteProps {
	onBlockClick?: (type: string, label: string) => void
	enableDrag?: boolean
}

export default function BlockPalette({ onBlockClick, enableDrag = true }: BlockPaletteProps) {
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
		<div className="w-72 bg-white/90 backdrop-blur-sm border-r border-gray-200 p-4 overflow-y-auto max-h-[90vh]">
			<div className="mb-4">
				<h3 className="text-lg font-bold text-gray-800 mb-2">🧩 Block Palette</h3>
				<p className="text-sm text-gray-600">
					{enableDrag
						? "Drag blocks to the canvas to build your logic flow"
						: "Tap blocks to add to canvas"}
				</p>
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
										className={`p-3 cursor-pointer hover:shadow-lg transition-all duration-200 bg-gradient-to-r ${block.color} border-2 ${block.border}`}
										draggable={enableDrag}
										onDragStart={enableDrag ? (event) => onDragStart(event, block.type, block.label) : undefined}
										onClick={onBlockClick ? () => onBlockClick(block.type, block.label) : undefined}
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
					<li>1. {enableDrag ? "Drag blocks to canvas" : "Tap blocks to add"}</li>
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
