import swaggerJSDoc from 'swagger-jsdoc'
import { resolveApiPaths } from './resolve_apis.js'

const DEFAULT_APIS: readonly string[] = []

export function buildJsDocConfig({
  apis,
  ...restOptions
}: swaggerJSDoc.Options): swaggerJSDoc.Options {
  return {
    ...restOptions,
    apis: resolveApiPaths(apis ?? DEFAULT_APIS),
  }
}
