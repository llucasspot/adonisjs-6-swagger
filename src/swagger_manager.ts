import { SwaggerConfig } from './types.js'

export class SwaggerManager {
  constructor(public config: SwaggerConfig) {
    this.config = config
  }
}
