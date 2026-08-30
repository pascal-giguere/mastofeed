const MIN_NODE_MAJOR = 22;

export function nodeMajorVersion(version = process.versions.node): number {
  return Number.parseInt(version, 10);
}

export function assertSupportedNodeVersion(version = process.versions.node): void {
  const major = nodeMajorVersion(version);
  if (Number.isNaN(major) || major < MIN_NODE_MAJOR) {
    throw new Error(
      `Mastofeed requires Node.js ${MIN_NODE_MAJOR}+ (this process is v${version}). ` +
        "undici 8 cannot load on older Node runtimes.",
    );
  }
}
