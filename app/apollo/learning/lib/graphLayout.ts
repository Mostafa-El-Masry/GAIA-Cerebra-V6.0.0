import type { Node, Edge } from "reactflow"

// dagre is CommonJS; Next.js interop exposes default as the module object
import dagreLib from "dagre"

interface DagreGraph {
  setGraph: (opts: Record<string, unknown>) => void
  setDefaultEdgeLabel: (fn: () => object) => void
  setNode: (id: string, value: { width: number; height: number }) => void
  setEdge: (source: string, target: string) => void
  node: (id: string) => { x: number; y: number } | undefined
}

/** Approximate node dimensions for layout (dagre uses these to avoid overlap). */
const NODE_WIDTH = 200
const NODE_HEIGHT = 72

export type LayoutDirection = "LR" | "TB" | "RL" | "BT"

const DEFAULT_OPTIONS = {
  rankdir: "LR" as LayoutDirection,
  nodesep: 80,
  ranksep: 140,
  marginx: 24,
  marginy: 24
}

/**
 * Runs dagre hierarchical layout on the given nodes and edges.
 * Returns new nodes with updated positions (React Flow uses top-left; dagre uses center).
 */
export function getLayoutedElements(
  nodes: Node[],
  edges: Edge[],
  options: Partial<typeof DEFAULT_OPTIONS> = {}
): Node[] {
  const { rankdir, nodesep, ranksep, marginx, marginy } = {
    ...DEFAULT_OPTIONS,
    ...options
  }

  const g = new (dagreLib as { graphlib: { Graph: new () => DagreGraph } }).graphlib.Graph()
  g.setGraph({
    rankdir,
    nodesep,
    ranksep,
    marginx,
    marginy
  })
  g.setDefaultEdgeLabel(() => ({}))

  nodes.forEach((node) => {
    g.setNode(node.id, { width: NODE_WIDTH, height: NODE_HEIGHT })
  })

  edges.forEach((edge) => {
    g.setEdge(edge.source, edge.target)
  })

  ;(dagreLib as { layout: (g: DagreGraph) => void }).layout(g)

  return nodes.map((node) => {
    const nodeWithPosition = g.node(node.id) as { x: number; y: number } | undefined
    if (!nodeWithPosition) return node

    // dagre uses center; React Flow uses top-left
    const x = nodeWithPosition.x - NODE_WIDTH / 2
    const y = nodeWithPosition.y - NODE_HEIGHT / 2

    return {
      ...node,
      position: { x, y }
    }
  })
}
