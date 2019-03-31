import { unmountComponentAtNode } from 'react-dom'
import prettyFormat from 'pretty-format'

import { observeChanges, observeNewRenders, observeDisappearances } from './mutationObserver'
import { getDispatchableEvents } from './getDispatchableEvents'
import { setAsLastQuery, lastQuery } from './lastQuery'

function withTools(node) {
  return {
    unmount() {
      unmountComponentAtNode(node)
      document.body.removeChild(node)
    },
    getRawNode() {
      return node
    },
    ...getQueries(node),
    getText() {
      return node.textContent
    },
    getValue() {
      return node.value
    },
    logTree(options) {
      const { DOMElement, DOMCollection } = prettyFormat.plugins
      const tree = prettyFormat(node, {
        plugins: [ DOMElement, DOMCollection ],
        printFunctionName: false,
        highlight: true,
        ...options,
      })

      console.log(tree)
    },
    isRendered() {
      return document.body.contains(node)
    },
    hasText(text) {
      const regex = new RegExp(text)
      return regex.test(node.textContent)
    },
    ...getDispatchableEvents(node),
    async willChange() {
      const onChange = () => {
        const { unmount, willChange, willRender, ...restOfTools } = withTools(node)
        return restOfTools
      }

      return observeChanges(onChange, node)
    },
    async willRender() {
      const onRender = () => {
        const renderedNode = lastQuery().getRawNode()

        if (!renderedNode) { return }

        const { unmount, willChange, willRender, ...restOfTools } = withTools(renderedNode)
        return restOfTools
      }

      return observeNewRenders(onRender)
    },
    async willDisappear() {
      const onDisappear = mutations => {
        const hasBeenDisappeared = mutations
          .filter(({ removedNodes }) => removedNodes.length > 0)
          .map(({ removedNodes }) => removedNodes)
          .flat()
          .some(removedNode => removedNode.isSameNode(node))

        if (!hasBeenDisappeared) { return }

        const { unmount, willChange, willRender, ...restOfTools } = withTools(node)
        return restOfTools
      }

      return observeDisappearances(onDisappear, node)
    }
  }
}

function getQueries(node) {
  const getQueryTools = query => {
    const { unmount, ...restOfTools } = query()
    return restOfTools
  }

  const getQueryToolsFromList = query => {
    return query().map(({ unmount, ...restOfTools }) => restOfTools)
  }

  const getTextComparator = text => node => {
    const regex = new RegExp(text)
    return regex.test(node.textContent)
  }

  return {
    getByDataTest(dataTest) {
      const query = () => withTools(node.querySelector(`[data-test="${ dataTest }"]`))
      setAsLastQuery(query)
      return getQueryTools(query)
    },
    getAllByDataTest(dataTest) {
      const query = () => [ ...node.querySelectorAll(`[data-test="${ dataTest }"]`) ].map(withTools)
      setAsLastQuery(query)
      return getQueryToolsFromList(query)
    },
    getByText(text) {
      const query = () => withTools([ ...node.querySelectorAll('*') ].find(getTextComparator(text)))
      setAsLastQuery(query)
      return getQueryTools(query)
    },
    getAllByText(text) {
      const query = () => [ ...node.querySelectorAll('*') ].filter(getTextComparator(text)).map(withTools)
      setAsLastQuery(query)
      return getQueryToolsFromList(query)
    },
    getByLabelText(labelText) {
      const query = () => {
        const { control: input } = [ ...node.querySelectorAll('label') ].find(getTextComparator(labelText)) || {}
        return withTools(input)
      }
      setAsLastQuery(query)
      return getQueryTools(query)
    },
    getByAriaLabel(ariaLabel) {
      const query = () => withTools(node.querySelector(`[aria-label="${ ariaLabel }"]`))
      setAsLastQuery(query)
      return getQueryTools(query)
    },
    getAllByAriaLabel(ariaLabel) {
      const query = () => [ ...node.querySelectorAll(`[aria-label="${ ariaLabel }"]`) ].map(withTools)
      setAsLastQuery(query)
      return getQueryToolsFromList(query)
    },
    getByAltText(altText) {
      const query = () => withTools(node.querySelector(`[alt="${ altText }"]`))
      setAsLastQuery(query)
      return getQueryTools(query)
    },
    getAllByAltText(altText) {
      const query = () => [ ...node.querySelectorAll(`[alt="${ altText }"]`) ].map(withTools)
      setAsLastQuery(query)
      return getQueryToolsFromList(query)
    },
    getByRole(role) {
      const query = () => withTools(node.querySelector(`[role="${ role }"]`))
      setAsLastQuery(query)
      return getQueryTools(query)
    },
    getByValue(value) {
      const query = () => withTools(node.querySelector(`[value="${ value }"]`))
      setAsLastQuery(query)
      return getQueryTools(query)
    }
  }
}

export { withTools }