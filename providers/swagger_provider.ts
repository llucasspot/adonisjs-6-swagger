import { RuntimeException } from '@poppinss/utils'
import type { ApplicationService } from '@adonisjs/core/types'

import type { SwaggerConfig, SwaggerService } from '../src/types.js'
import { SwaggerController } from '../src/swagger_controller.js'
import { SwaggerAuthMiddleware } from '../src/swagger_auth_middleware.js'
import { SwaggerAuthHeaderDecoder } from '../src/swagger_auth_header_decoder.js'
// @ts-ignore
import { OneOrMore } from '@adonisjs/http-server/build/src/types/base.js'
import {
  MiddlewareFn,
  ParsedNamedMiddleware,
  // @ts-ignore
} from '@adonisjs/http-server/build/src/types/middleware.js'
import { SwaggerManager } from '../src/swagger_manager.js'
import swaggerJSDoc from 'swagger-jsdoc'
import { buildJsDocConfig } from '../src/utils/build_js_doc_config.js'
import { join } from 'node:path'
import { promises as fs } from 'node:fs'

declare module '@adonisjs/core/types' {
  export interface ContainerBindings {
    'swagger.manager': SwaggerService
    'swagger.swagger_auth_middleware': SwaggerAuthMiddleware | null
  }
}

export default class SwaggerProvider {
  constructor(protected app: ApplicationService) {}

  private getSwaggerConfig(): SwaggerConfig {
    return this.app.config.get('swagger')
  }

  async register(): Promise<void> {
    this.registerSwaggerManager()
    this.registerSwaggerAuthMiddleware()
  }

  async boot(): Promise<void> {
    const config: SwaggerConfig = this.getSwaggerConfig()
    await this.generateSwagger(config)
    const router = await this.app.container.make('router')

    const controller = new SwaggerController(this.app, config)
    if (config.uiUrl ?? SwaggerController.DEFAULT_UI_ENABLED) {
      router
        .get(
          `${config.uiUrl ?? SwaggerController.DEFAULT_UI_ENABLED}/:fileName?`,
          controller.swaggerUI.bind(controller)
        )
        .middleware(config.middleware ?? SwaggerController.DEFAULT_MIDDLEWARE)
    }

    if (config.specEnabled ?? SwaggerController.DEFAULT_SPEC_ENABLED) {
      const middleware = await this.mergeAuthMiddleware(
        config.middleware ?? SwaggerController.DEFAULT_MIDDLEWARE
      )
      router.get(config.specUrl, controller.swaggerFile.bind(controller)).middleware(middleware)
    }
  }

  private registerSwaggerManager() {
    this.app.container.singleton('swagger.manager', async () => {
      const config: SwaggerConfig = this.getSwaggerConfig()
      if (!config) {
        throw new RuntimeException('Invalid config exported from "config/swagger.ts" file.')
      }
      return new SwaggerManager(config)
    })
  }

  private registerSwaggerAuthMiddleware() {
    this.app.container.singleton('swagger.swagger_auth_middleware', async () => {
      const config: SwaggerConfig = this.getSwaggerConfig()
      if (!config) {
        throw new RuntimeException('Invalid config exported from "config/swagger.ts" file.')
      }
      if (!config.swaggerAuth) {
        return null
      }
      return new SwaggerAuthMiddleware(config.swaggerAuth, new SwaggerAuthHeaderDecoder())
    })
  }

  private async mergeAuthMiddleware(
    middlewares: string[]
  ): Promise<OneOrMore<MiddlewareFn | ParsedNamedMiddleware>> {
    const config: SwaggerConfig = this.getSwaggerConfig()
    return config.swaggerAuth?.authMiddleware
      ? middlewares.concat(config.swaggerAuth?.authMiddleware)
      : middlewares
  }

  private async generateSwagger(_config?: SwaggerConfig): Promise<void> {
    const config = _config ?? this.getSwaggerConfig()

    const swaggerFileContent = swaggerJSDoc(
      buildJsDocConfig(config.options ?? SwaggerController.DEFAULT_OPTIONS)
    )

    if (!config.specFilePath) {
      throw new Error(
        "Config option 'swagger.specFilePath' should be specified for using this command"
      )
    }

    const filePath = join(this.app.appRoot.pathname, config.specFilePath)
    await fs.writeFile(filePath, JSON.stringify(swaggerFileContent))
  }
}
