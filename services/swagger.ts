/*
 * @adonisjs/auth
 *
 * (c) AdonisJS
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import app from '@adonisjs/core/services/app'
import { SwaggerService } from '../src/types.js'

let swagger: SwaggerService

/**
 * Returns a singleton instance of the Auth manager class
 */
await app.booted(async () => {
  swagger = await app.container.make('swagger.manager')
})

export { swagger as default }
