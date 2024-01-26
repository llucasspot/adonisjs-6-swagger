import { HttpContext } from '@adonisjs/core/http'
import { SwaggerAuthConfig, SwaggerAuthCredentials } from './types.js'
import { SwaggerAuthHeaderDecoder } from './swagger_auth_header_decoder.js'

export class SwaggerAuthMiddleware {
  constructor(
    protected readonly config: SwaggerAuthConfig,
    protected readonly tokenDecoder: SwaggerAuthHeaderDecoder
  ) {}

  async handle({ request, response }: HttpContext, next: () => Promise<void>) {
    const authHeader = request.headers().authorization || ''
    const decodeResult = this.tokenDecoder.decode(authHeader)

    if (!decodeResult.success || !(await this.verifyCredentials(decodeResult.payload))) {
      return response.status(401).header('WWW-Authenticate', `Basic realm="Swagger docs"`).send({})
    }

    await next()
  }

  protected async verifyCredentials(
    userCredentials: SwaggerAuthCredentials | undefined
  ): Promise<boolean> {
    if (!userCredentials) {
      return false
    }
    const { login, password } = userCredentials

    if (typeof this.config.authCheck === 'function') {
      return this.config.authCheck(login, password)
    }

    return (
      this.config?.authCredentials?.login === login &&
      this.config?.authCredentials?.password === password
    )
  }
}
