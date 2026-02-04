import { LearningNode } from "../models/LearningNode"

export type AlignmentSignal = {
  id: string
  message: string
}

export function generateAlignmentSignals(
  nodes: LearningNode[],
  folders: string[]
): AlignmentSignal[] {
  const signals: AlignmentSignal[] = []

  nodes.forEach(node => {
    if (!node.track) {
      signals.push({
        id: `${node.id}-track`,
        message: `${node.title} has no track`
      })
    }

    if (!node.category) {
      signals.push({
        id: `${node.id}-category`,
        message: `${node.title} has no category`
      })
    }

    if (node.order == null) {
      signals.push({
        id: `${node.id}-order`,
        message: `${node.title} has no order`
      })
    }

    if (node.status === "completed" && !node.projectPath) {
      signals.push({
        id: `${node.id}-path`,
        message: `${node.title} is completed but has no projectPath`
      })
    }
  })

  const orders = nodes
    .filter(n => n.order != null)
    .map(n => n.order as number)
    .sort((a, b) => a - b)

  for (let i = 1; i < orders.length; i++) {
    if (orders[i] !== orders[i - 1] + 1) {
      signals.push({
        id: `gap-${orders[i - 1]}-${orders[i]}`,
        message: `Order gap between ${orders[i - 1]} and ${orders[i]}`
      })
    }
  }

  folders.forEach(folder => {
    const linked = nodes.some(
      n => n.projectPath === `/projects/${folder}`
    )
    if (!linked) {
      signals.push({
        id: `unlinked-${folder}`,
        message: `Project folder "${folder}" has no linked node`
      })
    }
  })

  return signals
}
