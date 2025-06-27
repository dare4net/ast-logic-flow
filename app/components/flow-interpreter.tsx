import type { Node, Edge } from "./types" // Assuming Node and Edge are imported from a types file

export class FlowInterpreter {
  private nodes: Node[]
  private edges: Edge[]
  private variables: Record<string, any> = {}
  private executionLog: string[] = []
  private output: string[] = []
  private errors: string[] = []

  constructor(nodes: Node[], edges: Edge[]) {
    this.nodes = nodes
    this.edges = edges
  }

  execute(): { variables: Record<string, any>; log: string[]; output: string[]; errors: string[] } {
    this.variables = {}
    this.executionLog = []
    this.output = []
    this.errors = []

    // Validate flow first
    const validationErrors = this.validateFlow()
    if (validationErrors.length > 0) {
      this.errors = validationErrors
      return { variables: this.variables, log: this.executionLog, output: this.output, errors: this.errors }
    }

    const startNode = this.nodes.find((node) => node.type === "start")
    if (!startNode) {
      this.errors.push("❌ No start node found")
      return { variables: this.variables, log: this.executionLog, output: this.output, errors: this.errors }
    }

    try {
      this.executeNode(startNode.id)
    } catch (error) {
      this.errors.push(`❌ Runtime error: ${error.message}`)
    }

    return { variables: this.variables, log: this.executionLog, output: this.output, errors: this.errors }
  }

  private validateFlow(): string[] {
    const errors: string[] = []

    // Check for start and end nodes
    const startNodes = this.nodes.filter((n) => n.type === "start")
    const endNodes = this.nodes.filter((n) => n.type === "end")

    if (startNodes.length === 0) errors.push("❌ Missing start node")
    if (startNodes.length > 1) errors.push("❌ Multiple start nodes found")
    if (endNodes.length === 0) errors.push("❌ Missing end node")

    // Check for disconnected nodes
    this.nodes.forEach((node) => {
      if (node.type === "start") {
        const hasOutput = this.edges.some((e) => e.source === node.id)
        if (!hasOutput) errors.push(`❌ Start node is not connected to anything`)
      } else if (node.type === "end") {
        const hasInput = this.edges.some((e) => e.target === node.id)
        if (!hasInput) errors.push(`❌ End node has no incoming connections`)
      } else {
        const hasInput = this.edges.some((e) => e.target === node.id)
        if (!hasInput) errors.push(`❌ Node "${node.data.label}" has no incoming connections`)
      }
    })

    // Validate variable references
    this.nodes.forEach((node) => {
      if (node.type === "setVariable" || node.type === "getVariable") {
        if (!node.data.variableName || node.data.variableName.trim() === "") {
          errors.push(`❌ Variable node missing variable name`)
        }
      }
      if (node.type === "if" || node.type === "while") {
        if (!node.data.condition || node.data.condition.trim() === "") {
          errors.push(`❌ Condition node missing condition`)
        }
      }
    })

    return errors
  }

  private parseActionValue(value: string): { result: any; error?: string } {
    if (!value) return { result: "", error: "Empty value" }

    // Check if it's a quoted string
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      return { result: value.slice(1, -1) }
    }

    // Check if it's a number
    if (!isNaN(Number(value))) {
      return { result: Number(value) }
    }

    // Check if it's a boolean
    if (value === "true") return { result: true }
    if (value === "false") return { result: false }

    // Treat as variable reference
    if (this.variables[value] !== undefined) {
      return { result: this.variables[value] }
    }

    // Variable not found
    return { result: value, error: `Variable '${value}' not found. Use quotes for strings: "${value}"` }
  }

  simulateJavaScript(code: string): { output: string[]; variables: Record<string, any>; errors: string[] } {
    const output: string[] = []
    const variables: Record<string, any> = {}
    const errors: string[] = []

    try {
      // Simulate JavaScript execution by parsing the generated code
      const lines = code.split("\n").filter((line) => line.trim() && !line.trim().startsWith("//"))

      for (const line of lines) {
        const trimmedLine = line.trim()

        // Simulate variable declarations
        if (trimmedLine.startsWith("let ")) {
          const match = trimmedLine.match(/let\s+(\w+)\s*=\s*(.+);/)
          if (match) {
            const [, varName, value] = match
            variables[varName] = this.parseValue(value)
            output.push(`📦 Declared ${varName} = ${variables[varName]}`)
          }
        }

        // Simulate variable assignments
        else if (trimmedLine.includes(" = ") && !trimmedLine.startsWith("let")) {
          const match = trimmedLine.match(/(\w+)\s*=\s*(.+);/)
          if (match) {
            const [, varName, value] = match
            variables[varName] = this.parseValue(value)
            output.push(`📝 Set ${varName} = ${variables[varName]}`)
          }
        }

        // Simulate console.log
        else if (trimmedLine.includes("console.log")) {
          const match = trimmedLine.match(/console\.log$$(.+)$$;/)
          if (match) {
            const content = match[1]
            if (content.startsWith('"') && content.endsWith('"')) {
              output.push(`📝 ${content.slice(1, -1)}`)
            } else {
              output.push(`📝 ${content}`)
            }
          }
        }

        // Simulate alert
        else if (trimmedLine.includes("alert")) {
          const match = trimmedLine.match(/alert$$(.+)$$;/)
          if (match) {
            const content = match[1]
            output.push(`🚨 ALERT: ${content}`)
          }
        }

        // Simulate conditions
        else if (trimmedLine.startsWith("if (")) {
          const match = trimmedLine.match(/if\s*$$(.+)$$\s*{/)
          if (match) {
            const condition = match[1]
            const result = this.evaluateCondition(condition, variables)
            output.push(`❓ Condition: ${condition} = ${result}`)
          }
        }

        // Simulate loops
        else if (trimmedLine.startsWith("while (")) {
          const match = trimmedLine.match(/while\s*$$(.+)$$\s*{/)
          if (match) {
            const condition = match[1]
            output.push(`🔁 While loop: ${condition}`)
          }
        }
      }

      output.push("✅ Simulation completed successfully!")
    } catch (error) {
      errors.push(`❌ Simulation error: ${error.message}`)
    }

    return { output, variables, errors }
  }

  private executeNode(nodeId: string, visited: Set<string> = new Set()): void {
    if (visited.has(nodeId)) {
      this.errors.push(`❌ Infinite loop detected at node ${nodeId}`)
      return
    }
    visited.add(nodeId)

    const node = this.nodes.find((n) => n.id === nodeId)
    if (!node) return

    this.executionLog.push(`🔄 Executing: ${node.data.label || node.type}`)

    switch (node.type) {
      case "start":
        this.output.push("🚀 Program started")
        break

      case "end":
        this.output.push("🏁 Program ended")
        return

      case "variable":
        this.variables[node.data.variableName] = this.parseValue(node.data.variableValue)
        this.output.push(`📦 Declared ${node.data.variableName} = ${this.variables[node.data.variableName]}`)
        break

      case "setVariable":
        this.variables[node.data.variableName] = this.parseValue(node.data.variableValue)
        this.output.push(`📝 Set ${node.data.variableName} = ${this.variables[node.data.variableName]}`)
        break

      case "getVariable":
        const value = this.variables[node.data.variableName]
        this.output.push(`📋 Got ${node.data.variableName} = ${value}`)
        break

      case "if":
        const condition = this.evaluateCondition(node.data.condition, this.variables)
        this.output.push(`❓ If condition: ${node.data.condition} = ${condition}`)

        if (condition) {
          // Execute true branch
          const trueEdge = this.edges.find((e) => e.source === nodeId && e.sourceHandle === "true")
          if (trueEdge) {
            this.executeNode(trueEdge.target, new Set(visited))
          }
        }
        // Always continue to next node after if block
        break

      case "while":
        let whileCondition = this.evaluateCondition(node.data.condition, this.variables)
        this.output.push(`🔁 While loop: ${node.data.condition}`)
        let iterations = 0

        while (whileCondition && iterations < 100) {
          const loopEdge = this.edges.find((e) => e.source === nodeId && e.sourceHandle === "loop")
          if (loopEdge) {
            this.executeNode(loopEdge.target, new Set(visited))
          }
          whileCondition = this.evaluateCondition(node.data.condition, this.variables)
          iterations++
        }

        if (iterations >= 100) {
          this.output.push("⚠️ Loop terminated after 100 iterations (safety limit)")
        }
        break

      case "action":
        const actionResult = this.parseActionValue(node.data.actionValue)
        if (actionResult.error) {
          this.errors.push(`❌ ${actionResult.error}`)
          return // Terminate flow execution
        }

        switch (node.data.actionType) {
          case "print":
            this.output.push(`📝 ${actionResult.result}`)
            break
          case "alert":
            this.output.push(`🚨 ALERT: ${actionResult.result}`)
            break
          case "write":
            this.output.push(`✍️ WRITE: ${actionResult.result}`)
            break
          default:
            this.output.push(`⚡ ${node.data.actionType}: ${actionResult.result}`)
        }
        break

      case "math":
        const mathResult = this.evaluateMath(node.data.left, node.data.operator, node.data.right)
        this.output.push(`🧮 ${node.data.left} ${node.data.operator} ${node.data.right} = ${mathResult}`)
        // Store result in a temporary variable
        this.variables["_mathResult"] = mathResult
        break
    }

    // Continue to next node
    const nextEdge = this.edges.find((e) => e.source === nodeId && e.sourceHandle === "out")
    if (nextEdge) {
      this.executeNode(nextEdge.target, new Set(visited))
    }
  }

  private parseValue(value: string): any {
    if (!value) return 0
    if (value.startsWith('"') && value.endsWith('"')) return value.slice(1, -1)
    if (!isNaN(Number(value))) return Number(value)
    if (value === "true") return true
    if (value === "false") return false
    if (this.variables[value] !== undefined) return this.variables[value]
    return value
  }

  private evaluateCondition(condition: string, variables: Record<string, any>): boolean {
    if (!condition) return false
    try {
      // Replace variable names with their values
      let evaluatedCondition = condition
      Object.keys(variables).forEach((varName) => {
        const regex = new RegExp(`\\b${varName}\\b`, "g")
        evaluatedCondition = evaluatedCondition.replace(regex, String(variables[varName]))
      })

      // Simple condition evaluation
      const parts = evaluatedCondition.split(/([<>=!]+)/)
      if (parts.length === 3) {
        const left = this.parseValue(parts[0].trim())
        const operator = parts[1].trim()
        const right = this.parseValue(parts[2].trim())
        return this.evaluateComparison(left, operator, right)
      }
      return Boolean(this.parseValue(evaluatedCondition))
    } catch {
      return false
    }
  }

  private evaluateComparison(left: any, operator: string, right: any): boolean {
    switch (operator) {
      case "==":
        return left == right
      case "!=":
        return left != right
      case ">":
        return left > right
      case "<":
        return left < right
      case ">=":
        return left >= right
      case "<=":
        return left <= right
      default:
        return false
    }
  }

  private evaluateMath(left: any, operator: string, right: any): number {
    const leftVal = Number(this.parseValue(left))
    const rightVal = Number(this.parseValue(right))

    switch (operator) {
      case "+":
        return leftVal + rightVal
      case "-":
        return leftVal - rightVal
      case "*":
        return leftVal * rightVal
      case "/":
        return rightVal !== 0 ? leftVal / rightVal : 0
      case "%":
        return rightVal !== 0 ? leftVal % rightVal : 0
      default:
        return 0
    }
  }

  // ... rest of the code generation methods remain the same
  generateCode(mode: "logic" | "javascript" | "python"): string {
    if (this.nodes.length === 0) {
      return "// No blocks to generate code from"
    }

    if (mode === "logic") {
      return this.generateLogicFlow()
    } else if (mode === "javascript") {
      return this.generateJavaScript()
    } else {
      return this.generatePython()
    }
  }

  private generateLogicFlow(): string {
    const startNode = this.nodes.find((n) => n.type === "start")
    if (!startNode) return "No start node found"

    let flow = "Logic Flow:\n"
    flow += this.generateNodeFlow(startNode.id, 0)
    return flow
  }

  private generateNodeFlow(nodeId: string, depth: number): string {
    const node = this.nodes.find((n) => n.id === nodeId)
    if (!node) return ""

    const indent = "  ".repeat(depth)
    let result = ""

    switch (node.type) {
      case "start":
        result += `${indent}🚀 START\n`
        break
      case "end":
        result += `${indent}🏁 END\n`
        return result
      case "variable":
        result += `${indent}📦 DECLARE ${node.data.variableName} = ${node.data.variableValue}\n`
        break
      case "setVariable":
        result += `${indent}📝 SET ${node.data.variableName} = ${node.data.variableValue}\n`
        break
      case "if":
        result += `${indent}❓ IF (${node.data.condition})\n`
        const trueEdge = this.edges.find((e) => e.source === nodeId && e.sourceHandle === "true")
        if (trueEdge) {
          result += `${indent}  TRUE:\n`
          result += this.generateNodeFlow(trueEdge.target, depth + 2)
        }
        break
      case "while":
        result += `${indent}🔁 WHILE (${node.data.condition})\n`
        const whileLoopEdge = this.edges.find((e) => e.source === nodeId && e.sourceHandle === "loop")
        if (whileLoopEdge) {
          result += this.generateNodeFlow(whileLoopEdge.target, depth + 1)
        }
        break
      case "action":
        result += `${indent}⚡ ${node.data.actionType.toUpperCase()}(${node.data.actionValue})\n`
        break
    }

    // Continue to next node
    const nextEdge = this.edges.find((e) => e.source === nodeId && e.sourceHandle === "out")
    if (nextEdge) {
      result += this.generateNodeFlow(nextEdge.target, depth)
    }

    return result
  }

  private generateJavaScript(): string {
    let code = "// Generated JavaScript Code\n\n"
    code += "function executeFlow() {\n"

    // Declare variables
    const variableNodes = this.nodes.filter((n) => n.type === "variable")
    variableNodes.forEach((node) => {
      const value = isNaN(Number(node.data.variableValue)) ? `"${node.data.variableValue}"` : node.data.variableValue
      code += `  let ${node.data.variableName} = ${value};\n`
    })

    if (variableNodes.length > 0) code += "\n"

    const startNode = this.nodes.find((n) => n.type === "start")
    if (startNode) {
      code += this.generateJSNodeCode(startNode.id, 1)
    }

    code += "}\n\n"
    code += "// Call the function\nexecuteFlow();"

    return code
  }

  private generateJSNodeCode(nodeId: string, depth: number): string {
    const node = this.nodes.find((n) => n.id === nodeId)
    if (!node) return ""

    const indent = "  ".repeat(depth)
    let result = ""

    switch (node.type) {
      case "start":
        result += `${indent}console.log("🚀 Program started");\n`
        break
      case "end":
        result += `${indent}console.log("🏁 Program ended");\n`
        return result
      case "setVariable":
        const setValue = isNaN(Number(node.data.variableValue))
          ? `"${node.data.variableValue}"`
          : node.data.variableValue
        result += `${indent}${node.data.variableName} = ${setValue};\n`
        break
      case "if":
        result += `${indent}if (${node.data.condition}) {\n`
        const trueEdge = this.edges.find((e) => e.source === nodeId && e.sourceHandle === "true")
        if (trueEdge) {
          result += this.generateJSNodeCode(trueEdge.target, depth + 1)
        }
        result += `${indent}}\n`
        break
      case "while":
        result += `${indent}let whileCount = 0;\n`
        result += `${indent}while (${node.data.condition} && whileCount < 100) {\n`
        const whileLoopEdge = this.edges.find((e) => e.source === nodeId && e.sourceHandle === "loop")
        if (whileLoopEdge) {
          result += this.generateJSNodeCode(whileLoopEdge.target, depth + 1)
        }
        result += `${indent}  whileCount++;\n`
        result += `${indent}}\n`
        break
      case "action":
        if (node.data.actionType === "print") {
          const printValue = isNaN(Number(node.data.actionValue)) ? `"${node.data.actionValue}"` : node.data.actionValue
          result += `${indent}console.log(${printValue});\n`
        } else if (node.data.actionType === "alert") {
          result += `${indent}alert("${node.data.actionValue}");\n`
        } else {
          result += `${indent}// ${node.data.actionType}: ${node.data.actionValue}\n`
        }
        break
    }

    // Continue to next node (except for control flow nodes)
    if (!["if", "while"].includes(node.type)) {
      const nextEdge = this.edges.find((e) => e.source === nodeId && e.sourceHandle === "out")
      if (nextEdge) {
        result += this.generateJSNodeCode(nextEdge.target, depth)
      }
    }

    return result
  }

  private generatePython(): string {
    let code = "# Generated Python Code\n\n"
    code += "def execute_flow():\n"

    // Declare variables
    const variableNodes = this.nodes.filter((n) => n.type === "variable")
    variableNodes.forEach((node) => {
      code += `    ${node.data.variableName} = ${node.data.variableValue}\n`
    })

    if (variableNodes.length > 0) code += "\n"

    const startNode = this.nodes.find((n) => n.type === "start")
    if (startNode) {
      code += this.generatePythonNodeCode(startNode.id, 1)
    }

    code += "\n# Call the function\nexecute_flow()"

    return code
  }

  private generatePythonNodeCode(nodeId: string, depth: number): string {
    const node = this.nodes.find((n) => n.id === nodeId)
    if (!node) return ""

    const indent = "    ".repeat(depth)
    let result = ""

    switch (node.type) {
      case "start":
        result += `${indent}print("🚀 Program started")\n`
        break
      case "end":
        result += `${indent}print("🏁 Program ended")\n`
        return result
      case "setVariable":
        result += `${indent}${node.data.variableName} = ${node.data.variableValue}\n`
        break
      case "if":
        result += `${indent}if ${node.data.condition}:\n`
        const trueEdge = this.edges.find((e) => e.source === nodeId && e.sourceHandle === "true")
        if (trueEdge) {
          result += this.generatePythonNodeCode(trueEdge.target, depth + 1)
        }
        break
      case "while":
        result += `${indent}while_count = 0\n`
        result += `${indent}while ${node.data.condition} and while_count < 100:\n`
        const whileLoopEdge = this.edges.find((e) => e.source === nodeId && e.sourceHandle === "loop")
        if (whileLoopEdge) {
          result += this.generatePythonNodeCode(whileLoopEdge.target, depth + 1)
        }
        result += `${indent}    while_count += 1\n`
        break
      case "action":
        if (node.data.actionType === "print") {
          result += `${indent}print(${node.data.actionValue})\n`
        } else {
          result += `${indent}print("${node.data.actionType}: ${node.data.actionValue}")\n`
        }
        break
    }

    // Continue to next node
    if (!["if", "while"].includes(node.type)) {
      const nextEdge = this.edges.find((e) => e.source === nodeId && e.sourceHandle === "out")
      if (nextEdge) {
        result += this.generatePythonNodeCode(nextEdge.target, depth)
      }
    }

    return result
  }
}
