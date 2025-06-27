import type { XYPosition } from "reactflow"

export type Node = {
  id: string
  type: string
  position: XYPosition
  data: any
}

export type Edge = {
  id: string
  source: string
  target: string
  sourceHandle: string | null
  targetHandle: string | null
  animated?: boolean
  style?: {
    stroke: string
    strokeWidth: number
  }
  markerEnd?: {
    type: string
    color: string
  }
}
