import { assertSupportedNodeVersion, nodeMajorVersion } from "../../src/utils/nodeVersion.mjs";

describe("Node version guard", () => {
  it("parses the major version", () => {
    expect(nodeMajorVersion("18.20.4")).toEqual(18);
    expect(nodeMajorVersion("22.18.0")).toEqual(22);
  });

  it("rejects Node 18", () => {
    expect(() => assertSupportedNodeVersion("18.20.4")).toThrow("Mastofeed requires Node.js 22+");
  });

  it("allows Node 22", () => {
    expect(() => assertSupportedNodeVersion("22.18.0")).not.toThrow();
  });
});
