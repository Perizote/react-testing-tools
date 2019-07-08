import { withSemantic, SemanticNode } from '../src/withSemantic'
import { DOMNode } from '../src/utils/DOMNode'

const mountedComponents: Set<DOMNode> = new Set()

function mount(node: string): SemanticNode {
  const rootNode = document.body.appendChild(document.createElement('div')) as DOMNode
  mountedComponents.add(rootNode)

  rootNode.innerHTML = node

  return withSemantic(rootNode)
}

function unmount(): void {
  mountedComponents.forEach(component => {
    if (document.body.contains(component)) {
      document.body.removeChild(component)
    }

    mountedComponents.delete(component)
  })
}

export { mount, unmount }
