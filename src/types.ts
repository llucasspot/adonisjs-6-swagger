// @ts-ignore
import { OneOrMore } from '@adonisjs/http-server/build/src/types/base.js'
import {
  MiddlewareFn,
  ParsedNamedMiddleware,
  // @ts-ignore
} from '@adonisjs/http-server/build/src/types/middleware.js'
import swaggerJSDoc from 'swagger-jsdoc'

/**
 * Swagger service is a singleton instance of the SwaggerManager
 * configured using the config stored within the user
 * app.
 */
export interface SwaggerService {}

export type SwaggerAuthCredentials = {
  login: string
  password: string
}

export type SwaggerCredentialsCheckFunction = (
  login: string,
  password: string
) => Promise<boolean> | boolean

export type SwaggerAuthConfig = {
  authMiddleware: string

  authCheck?: SwaggerCredentialsCheckFunction

  authCredentials?: SwaggerAuthCredentials
}

export type SwaggerDecoderResultPayload = {
  success: boolean
  payload?: SwaggerAuthCredentials
}

type SwaggerMode = 'PRODUCTION' | 'RUNTIME'

export interface SwaggerConfig {
  uiEnabled: boolean
  uiUrl: string
  specEnabled: boolean
  specUrl: string
  middleware: OneOrMore<MiddlewareFn | ParsedNamedMiddleware>
  options: swaggerJSDoc.Options
  specFilePath?: string
  mode?: SwaggerMode
  swaggerUiDistPath?: string
  swaggerAuth?: SwaggerAuthConfig
}
