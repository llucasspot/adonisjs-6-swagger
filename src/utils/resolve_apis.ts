import { join } from 'node:path'

export function resolveApiPaths(paths: readonly string[]) {
  const isBuildDir: boolean = process.cwd().includes('build')

  return paths.map((path) => {
    return isBuildDir ? join('..', path) : path
  })
}
