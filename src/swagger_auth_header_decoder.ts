import { SwaggerDecoderResultPayload } from './types.js'

export class SwaggerAuthHeaderDecoder {
  private static headerPattern = /^Basic (?<token>\w+={0,2})$/gi

  decode(authHeader: string): SwaggerDecoderResultPayload {
    const matchResult = SwaggerAuthHeaderDecoder.headerPattern.exec(authHeader)
    if (!matchResult) {
      return { success: false }
    }

    const { token } = matchResult.groups as { token: string }

    const [login, password] = Buffer.from(token, 'base64').toString().split(':')

    return {
      success: !!(login && password),
      payload: { login, password },
    }
  }
}
