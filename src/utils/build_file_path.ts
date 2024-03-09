import { join } from 'node:path'

export function buildFilePath(appRootPathname: string, specFilePath: string) {
  const filePath = join(appRootPathname, specFilePath)

  const windowsBugRegex = /^([A-Z]:\\)[A-Z]:\\/
  if (windowsBugRegex.test(filePath)) {
    return filePath.replace(windowsBugRegex, '$1')
  }
  return filePath
}
