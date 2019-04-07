import { mount } from './mount.util'

describe('withTools', () => {
  describe('unmounting a node', () => {
    const node = `<div>a simple node</div>`

    it('should remove the node from the dom tree', () => {
      const nodeMountedWithTools = mount(node)
      expect(nodeMountedWithTools).toBeRendered()
      nodeMountedWithTools.unmount()

      expect(nodeMountedWithTools).not.toBeRendered()
    })

    it('should throw an error if the node is not in the dom', () => {
      const nodeMountedWithTools = mount(node)
      nodeMountedWithTools.unmount()
      expect(nodeMountedWithTools).not.toBeRendered()
      expect(nodeMountedWithTools.unmount).toThrow('Cannot unmount a node that is not rendered')
    })
  })

  describe('when mounting', () => {
    const node = '<button disabled>a disabled button</button>'
    let nodeMountedWithTools

    beforeEach(() => {
      nodeMountedWithTools = mount(node)
    })

    afterEach(() => {
      nodeMountedWithTools.unmount()
    })

    it('should be rendered', () => {
      expect(nodeMountedWithTools).toBeRendered()
    })

    it('should log the tree of the node', () => {
      const spy = jest.spyOn(console, 'log').mockImplementationOnce(() => {})

      nodeMountedWithTools.logTree()

      expect(spy).toHaveBeenCalledTimes(1)
      const [[firstArg]] = spy.mock.calls
      expect(firstArg).toMatchInlineSnapshot(`
"[36m<div>[39m
  [36m<button[39m
    [33mdisabled[39m=[32m\\"\\"[39m
  [36m>[39m
    [0ma disabled button[0m
  [36m</button>[39m
[36m</div>[39m"
`)
    })

    it('should have text', () => {
      expect(nodeMountedWithTools).toHaveText('a disabled button')
      expect(nodeMountedWithTools).toHaveText(/A Disabled Button/i)
    })

    it('should be disabled', () => {
      expect(nodeMountedWithTools.getByText('a disabled button')).toBeDisabled()
    })
  })
})
