import FlowAnnotation from "../src/flow_annotation.js"

describe("FlowAnnotation", function () {
  const flowAnnotation = new FlowAnnotation()

  describe("nested object patterns", function () {
    it("", function () {
      const tags = [
        {
          title: "param",
          description: null,
          type: { type: "NameExpression", name: "number" },
          name: "obj2.c",
        },
        {
          title: "param",
          description: null,
          type: { type: "NameExpression", name: "object" },
          name: "obj2.d",
        },
        {
          title: "param",
          description: null,
          type: { type: "NameExpression", name: "number" },
          name: "obj2.d.e",
        },
      ]
      const result = flowAnnotation._transformTags(tags, [], 0)
      result.type.should.be.eql("c: number, d: { e: number }")
    })
  })
})
