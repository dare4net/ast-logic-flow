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
      const errMsg = error instanceof Error ? error.message : String(error)
      this.errors.push(`❌ Runtime error: ${errMsg}`)
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

    // Custom print function to capture output
    const print = (...args: any[]) => {
      output.push(args.map(String).join(" "))
    }

    // Redirect console.log to print
    const originalConsoleLog = console.log
    console.log = print

    try {
      // eslint-disable-next-line no-new-func
      const func = new Function("print", code)
      func(print)
    } catch (error) {
      const errMsg = error instanceof Error ? error.message : String(error)
      errors.push(`❌ JS Runtime error: ${errMsg}`)
    } finally {
      console.log = originalConsoleLog
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
      case "declareVariable": {
        const varName = node.data.variableName
        if (varName && varName.trim() !== "") {
          // Use variableValue if present, fallback to initialValue for legacy
          const value = node.data.variableValue !== undefined ? node.data.variableValue : node.data.initialValue
          this.variables[varName] = this.parseValue(value)
          this.output.push(`📦 Declared ${node.data.variableType} ${varName} = ${this.variables[varName]}`)
        } else {
          this.output.push("⚠️ Variable declaration missing name")
        }
        break
      }
      case "assignment": {
        const varName = node.data.variableName
        if (varName && varName.trim() !== "") {
          this.variables[varName] = this.parseValue(node.data.value)
          this.output.push(`📝 Set ${varName} = ${this.variables[varName]}`)
        } else {
          this.output.push("⚠️ Assignment missing variable name")
        }
        break
      }
      case "number":
      case "string":
      case "boolean":
      case "array":
      case "object":
        // These are literal value nodes, just store in a temp variable
        this.variables[`_literal_${node.id}`] = node.data.value
        break
      case "conditional": {
        // Evaluate the condition using left, operator, right
        const left = this.parseValue(node.data.left)
        const right = this.parseValue(node.data.right)
        const op = node.data.operator
        let result = false
        switch (op) {
          case "==": result = left == right; break
          case "!=": result = left != right; break
          case ">": result = left > right; break
          case "<": result = left < right; break
          case ">=": result = left >= right; break
          case "<=": result = left <= right; break
          default: result = false
        }
        this.output.push(`❓ Condition: ${left} ${op} ${right} = ${result}`)
        const branch = result ? "true" : "false"
        const branchEdge = this.edges.find((e) => e.source === nodeId && e.sourceHandle === branch)
        if (branchEdge) this.executeNode(branchEdge.target, new Set(visited))
        break
      }
      case "switchCase": {
        const value = this.variables[node.data.variable]
        let matched = false
        for (const c of node.data.cases || []) {
          if (value == c.value) {
            this.output.push(`🔀 Switch matched: ${c.value}`)
            const caseEdge = this.edges.find((e) => e.source === nodeId && e.sourceHandle === c.value)
            if (caseEdge) this.executeNode(caseEdge.target, new Set(visited))
            matched = true
            break
          }
        }
        if (!matched && node.data.default) {
          this.output.push(`🔀 Switch default case`)
          const defaultEdge = this.edges.find((e) => e.source === nodeId && e.sourceHandle === "default")
          if (defaultEdge) this.executeNode(defaultEdge.target, new Set(visited))
        }
        break
      }
      case "forLoop": {
        // Simple for loop: init, condition, increment
        // Evaluate init
        try { eval(`var ${node.data.init}`) } catch {}
        let iterations = 0
        while (this.evaluateCondition(node.data.condition, this.variables) && iterations < 100) {
          const loopEdge = this.edges.find((e) => e.source === nodeId && e.sourceHandle === "loop")
          if (loopEdge) this.executeNode(loopEdge.target, new Set(visited))
          try { eval(node.data.increment) } catch {}
          iterations++
        }
        if (iterations >= 100) this.output.push("⚠️ For loop terminated after 100 iterations (safety limit)")
        break
      }
      case "forEach": {
        const arr = this.variables[node.data.array] || []
        for (const item of arr) {
          this.variables[node.data.item] = item
          const loopEdge = this.edges.find((e) => e.source === nodeId && e.sourceHandle === "loop")
          if (loopEdge) this.executeNode(loopEdge.target, new Set(visited))
        }
        break
      }
      case "whileLoop":
      case "doWhileLoop": {
        let condition = this.evaluateCondition(node.data.condition, this.variables)
        let iterations = 0
        do {
          const loopEdge = this.edges.find((e) => e.source === nodeId && e.sourceHandle === "loop")
          if (loopEdge) this.executeNode(loopEdge.target, new Set(visited))
          condition = this.evaluateCondition(node.data.condition, this.variables)
          iterations++
        } while (condition && iterations < 100)
        if (iterations >= 100) this.output.push("⚠️ Loop terminated after 100 iterations (safety limit)")
        break
      }
      case "functionDeclaration":
        // For now, just log function declaration
        this.output.push(`⚙️ Declared function ${node.data.functionName}`)
        break
      case "functionCall":
        this.output.push(`📞 Called function ${node.data.functionName}`)
        break
      case "arithmeticOperator": {
        const result = this.evaluateMath(node.data.left, node.data.operator, node.data.right)
        this.output.push(`➗ ${node.data.left} ${node.data.operator} ${node.data.right} = ${result}`)
        this.variables[`_arith_${node.id}`] = result
        break
      }
      case "comparisonOperator": {
        const result = this.evaluateComparison(node.data.left, node.data.operator, node.data.right)
        this.output.push(`⚖️ ${node.data.left} ${node.data.operator} ${node.data.right} = ${result}`)
        this.variables[`_comp_${node.id}`] = result
        break
      }
      case "logicalOperator": {
        const result = this.evaluateLogic(node.data.left, node.data.operator, node.data.right)
        this.output.push(`🔀 ${node.data.left} ${node.data.operator} ${node.data.right} = ${result}`)
        this.variables[`_logic_${node.id}`] = result
        break
      }
      case "arrayPush": {
        if (!Array.isArray(this.variables[node.data.array])) this.variables[node.data.array] = []
        this.variables[node.data.array].push(this.parseValue(node.data.value))
        this.output.push(`📥 Pushed ${node.data.value} to ${node.data.array}`)
        break
      }
      case "arrayPop": {
        if (Array.isArray(this.variables[node.data.array])) {
          const val = this.variables[node.data.array].pop()
          this.output.push(`📤 Popped ${val} from ${node.data.array}`)
        }
        break
      }
      case "arrayMap": {
        // Not actually executing callback, just log
        this.output.push(`🗺️ Mapped ${node.data.array}`)
        break
      }
      case "arrayFilter": {
        this.output.push(`🔍 Filtered ${node.data.array}`)
        break
      }
      case "arrayReduce": {
        this.output.push(`➖ Reduced ${node.data.array}`)
        break
      }
      case "print":
        this.output.push(`🖨️ ${this.parseValue(node.data.value)}`)
        break
      case "input":
        this.variables[node.data.variableName] = "user input"
        this.output.push(`⌨️ Input for ${node.data.variableName}`)
        break
      case "try":
        this.output.push("🛡️ Try block")
        break
      case "catch":
        this.output.push(`🪤 Catch block (${node.data.errorVar})`)
        break
      case "throw":
        this.output.push(`🚨 Throw: ${node.data.error}`)
        break
      case "return":
        this.output.push("↩️ Return")
        return
      case "break":
        this.output.push("⏹️ Break")
        return
      case "continue":
        this.output.push("⏭️ Continue")
        return
      default:
        this.output.push(`⚡ Unknown node type: ${node.type}`)
    }

    // Continue to next node
    const nextEdge = this.edges.find((e) => e.source === nodeId && e.sourceHandle === "out")
    if (nextEdge) {
      this.executeNode(nextEdge.target, new Set(visited))
    }
  }

  // Enhanced parseValue to support simple arithmetic expressions (e.g., x + 1, y - 2)
  private parseValue(value: string): any {
    if (!value) return 0
    if (value.startsWith('"') && value.endsWith('"')) return value.slice(1, -1)
    if (!isNaN(Number(value))) return Number(value)
    if (value === "true") return true
    if (value === "false") return false
    // If value is a variable name
    if (this.variables[value] !== undefined) return this.variables[value]

    // Try to evaluate simple arithmetic expressions (e.g., x + 1)
    try {
      // Replace variable names in the expression with their values
      let expr = value.replace(/([a-zA-Z_]\w*)/g, (match) => {
        if (this.variables[match] !== undefined) {
          return this.variables[match]
        }
        return match
      })
      // Only allow safe characters (numbers, operators, spaces, dots)
      if (/^[0-9+\-*/%().\s]+$/.test(expr)) {
        // eslint-disable-next-line no-eval
        return eval(expr)
      }
    } catch {}
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

  private evaluateLogic(left: any, operator: string, right: any): boolean {
    const leftVal = this.parseValue(left)
    const rightVal = this.parseValue(right)

    switch (operator) {
      case "&&":
        return leftVal && rightVal
      case "||":
        return leftVal || rightVal
      default:
        return false
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

    // Declare variables (from declareVariable blocks)
    const declareNodes = this.nodes.filter((n) => n.type === "declareVariable")
    declareNodes.forEach((node) => {
      const value = node.data.variableValue !== undefined ? node.data.variableValue : node.data.initialValue
      let jsValue
      if (node.data.variableType === "string") {
        jsValue = typeof value === "string" ? `\"${value.replace(/\\/g, "\\\\").replace(/\"/g, '\\"')}\"` : `\"\"`
      } else if (node.data.variableType === "boolean") {
        jsValue = value === true || value === "true" ? "true" : "false"
      } else if (node.data.variableType === "number") {
        jsValue = isNaN(Number(value)) ? "0" : value
      } else if (node.data.variableType === "array") {
        // If value is a string, try to parse as array, else output as []
        if (Array.isArray(value)) {
          jsValue = JSON.stringify(value)
        } else if (typeof value === "string") {
          try {
            const arr = JSON.parse(value)
            jsValue = Array.isArray(arr) ? JSON.stringify(arr) : "[]"
          } catch {
            jsValue = "[]"
          }
        } else {
          jsValue = "[]"
        }
      } else if (node.data.variableType === "object") {
        // If value is an object, output as JS object literal
        if (typeof value === "object" && value !== null) {
          jsValue = JSON.stringify(value)
        } else if (typeof value === "string") {
          try {
            const obj = JSON.parse(value)
            jsValue = typeof obj === "object" && obj !== null ? JSON.stringify(obj) : "{}"
          } catch {
            jsValue = "{}"
          }
        } else {
          jsValue = "{}"
        }
      } else {
        jsValue = value
      }
      code += `  let ${node.data.variableName} = ${jsValue};\n`
    })
    if (declareNodes.length > 0) code += "\n"

    const startNode = this.nodes.find((n) => n.type === "start")
    if (startNode) {
      code += this.generateJSNodeCodeFull(startNode.id, 1, new Set())
    }

    code += "}\n\n"
    code += "// Call the function\nexecuteFlow();"
    return code
  }

  // Enhanced code generation for all supported block types
  private generateJSNodeCodeFull(nodeId: string, depth: number, visited: Set<string>): string {
    if (visited.has(nodeId)) return "" // Prevent infinite loops
    visited.add(nodeId)
    const node = this.nodes.find((n) => n.id === nodeId)
    if (!node) return ""
    const indent = "  ".repeat(depth)
    let result = ""
    switch (node.type) {
      case "start":
        result += `${indent}console.log(\"🚀 Program started\");\n`
        break
      case "end":
        result += `${indent}console.log(\"🏁 Program ended\");\n`
        return result
      case "declareVariable":
        // Already declared at top, skip
        break
      case "assignment": {
        let value = node.data.value
        if (node.data.valueType === "string") {
          value = `\"${node.data.value}\"`
        } else if (node.data.valueType === "boolean") {
          value = node.data.value === true || node.data.value === "true" ? "true" : "false"
        }
        result += `${indent}${node.data.variableName} = ${value};\n`
        break
      }
      case "conditional": {
        const left = node.data.left
        const right = node.data.right
        const op = node.data.operator
        result += `${indent}if (${left} ${op} ${right}) {\n`
        const trueEdge = this.edges.find((e) => e.source === nodeId && e.sourceHandle === "true")
        if (trueEdge) {
          result += this.generateJSNodeCodeFull(trueEdge.target, depth + 1, new Set(visited))
        }
        result += `${indent}}`
        const falseEdge = this.edges.find((e) => e.source === nodeId && e.sourceHandle === "false")
        if (falseEdge) {
          result += ` else {\n`
          result += this.generateJSNodeCodeFull(falseEdge.target, depth + 1, new Set(visited))
          result += `${indent}}\n`
        } else {
          result += `\n`
        }
        break
      }
      case "forLoop": {
        // for (let i = 0; i < n; i++)
        const init = node.data.init || "let i = 0"
        const condition = node.data.condition || "i < 10"
        const increment = node.data.increment || "i++"
        result += `${indent}for (${init}; ${condition}; ${increment}) {\n`
        const loopEdge = this.edges.find((e) => e.source === nodeId && e.sourceHandle === "loop")
        if (loopEdge) {
          result += this.generateJSNodeCodeFull(loopEdge.target, depth + 1, new Set(visited))
        }
        result += `${indent}}\n`
        break
      }
      case "whileLoop": {
        const condition = node.data.condition || "true"
        result += `${indent}let whileCount = 0;\n`
        result += `${indent}while (${condition} && whileCount < 100) {\n`
        const loopEdge = this.edges.find((e) => e.source === nodeId && e.sourceHandle === "loop")
        if (loopEdge) {
          result += this.generateJSNodeCodeFull(loopEdge.target, depth + 1, new Set(visited))
        }
        result += `${indent}  whileCount++;\n`
        result += `${indent}}\n`
        break
      }
      case "doWhileLoop": {
        const condition = node.data.condition || "true"
        result += `${indent}let doWhileCount = 0;\n`
        result += `${indent}do {\n`
        const loopEdge = this.edges.find((e) => e.source === nodeId && e.sourceHandle === "loop")
        if (loopEdge) {
          result += this.generateJSNodeCodeFull(loopEdge.target, depth + 1, new Set(visited))
        }
        result += `${indent}  doWhileCount++;\n`
        result += `${indent}} while (${condition} && doWhileCount < 100);\n`
        break
      }
      case "print": {
        let value = node.data.value
        if (typeof value === "string" && !/^\w+$/.test(value)) {
          value = `\"${value}\"`
        }
        result += `${indent}console.log(${value});\n`
        break
      }
      case "input": {
        // Simulate input as prompt (or placeholder)
        result += `${indent}// Input for ${node.data.variableName} (user input not supported in codegen)\n`
        break
      }
      case "arithmeticOperator": {
        const left = node.data.left
        const op = node.data.operator
        const right = node.data.right
        result += `${indent}const ${node.data.resultVar || "result"} = ${left} ${op} ${right};\n`
        break
      }
      case "comparisonOperator": {
        const left = node.data.left
        const op = node.data.operator
        const right = node.data.right
        result += `${indent}const ${node.data.resultVar || "result"} = ${left} ${op} ${right};\n`
        break
      }
      case "logicalOperator": {
        const left = node.data.left
        const op = node.data.operator
        const right = node.data.right
        result += `${indent}const ${node.data.resultVar || "result"} = ${left} ${op} ${right};\n`
        break
      }
      case "arrayPush": {
        result += `${indent}${node.data.array}.push(${node.data.value});\n`
        break
      }
      case "arrayPop": {
        result += `${indent}${node.data.array}.pop();\n`
        break
      }
      case "functionDeclaration": {
        result += `${indent}function ${node.data.functionName}(${(node.data.parameters || []).join(", ")}) {\n`
        const bodyEdge = this.edges.find((e) => e.source === nodeId && e.sourceHandle === "body")
        if (bodyEdge) {
          result += this.generateJSNodeCodeFull(bodyEdge.target, depth + 1, new Set(visited))
        }
        result += `${indent}}\n`
        break
      }
      case "functionCall": {
        result += `${indent}${node.data.functionName}(${(node.data.arguments || []).join(", ")});\n`
        break
      }
      case "return": {
        result += `${indent}return;\n`
        break
      }
      case "break": {
        result += `${indent}break;\n`
        break
      }
      case "continue": {
        result += `${indent}continue;\n`
        break
      }
      // Add more block types as needed
      default:
        result += `${indent}// Unknown or unhandled node type: ${node.type}\n`
    }
    // Continue to next node (except for control flow nodes that branch)
    if (!["conditional", "forLoop", "whileLoop", "doWhileLoop", "functionDeclaration"].includes(node.type)) {
      const nextEdge = this.edges.find((e) => e.source === nodeId && e.sourceHandle === "out")
      if (nextEdge) {
        result += this.generateJSNodeCodeFull(nextEdge.target, depth, new Set(visited))
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
