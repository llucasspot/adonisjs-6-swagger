import mime from 'mime'
import swaggerJSDoc from 'swagger-jsdoc'
import * as fs from 'node:fs'
import { promises as fsp, ReadStream } from 'node:fs'
import { join } from 'node:path'
import { ApplicationService } from '@adonisjs/core/types'
import { HttpContext } from '@adonisjs/core/http'
import { buildJsDocConfig } from './utils/build_js_doc_config.js'
import * as swaggerUiDist from 'swagger-ui-dist'
import { SwaggerConfig } from './types.js'
import { buildFilePath } from './utils/build_file_path.js'

export class SwaggerController {
  static DEFAULT_UI_URL: SwaggerConfig['uiUrl'] = '/docs'
  static DEFAULT_SWAGGER_MODE: SwaggerConfig['mode'] = 'RUNTIME'
  static DEFAULT_OPTIONS: SwaggerConfig['options'] = {}
  static DEFAULT_SPEC_FILE_PATH: SwaggerConfig['specFilePath'] = 'docs/swagger.json'
  static DEFAULT_UI_ENABLED: SwaggerConfig['uiEnabled'] = true
  static DEFAULT_MIDDLEWARE: SwaggerConfig['middleware'] = []
  static DEFAULT_SPEC_ENABLED: SwaggerConfig['specEnabled'] = true

  constructor(
    private app: ApplicationService,
    private config: SwaggerConfig
  ) {}

  async swaggerUI({ params, response }: HttpContext) {
    const swaggerUiAssetPath = this.config.swaggerUiDistPath || swaggerUiDist.getAbsoluteFSPath()
    if (!params.fileName) {
      const baseUrl = (this.config.uiUrl ?? SwaggerController.DEFAULT_UI_URL).replace('/', '')
      return response.redirect(`/${baseUrl}/index.html`)
    }

    const fileName = params.fileName ? params.fileName : 'index.html'
    const path = join(swaggerUiAssetPath, fileName)
    const contentType = mime.getType(path)

    if (fileName.includes('initializer')) {
      const initializer = await fsp.readFile(path, 'utf-8')
      return response
        .header('Content-Type', contentType ?? '')
        .send(
          initializer.replace('https://petstore.swagger.io/v2/swagger.json', this.config.specUrl)
        )
    }
    return response.header('Content-Type', contentType ?? '').stream(fs.createReadStream(path))
  }

  async swaggerFile({ response }: HttpContext): Promise<void> {
    const mode = this.config.mode ?? SwaggerController.DEFAULT_SWAGGER_MODE
    if (mode === 'RUNTIME') {
      return response.send(
        swaggerJSDoc(buildJsDocConfig(this.config.options ?? SwaggerController.DEFAULT_OPTIONS))
      )
    }
    return response
      .safeHeader('Content-type', 'application/json')
      .stream(this.getSwaggerSpecFileContent(), () => {
        return ['Unable to find file', 404]
      })
  }

  protected getSwaggerSpecFileContent(): ReadStream {
    // @ts-ignore dont understand wht it still can be undefined
    const specFilePath: string =
      this.config.specFilePath ?? SwaggerController.DEFAULT_SPEC_FILE_PATH
    const filePath = buildFilePath(this.app.appRoot.pathname, specFilePath)
    return fs.createReadStream(filePath)
  }
}
