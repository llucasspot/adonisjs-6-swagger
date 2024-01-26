import type Configure from '@adonisjs/core/commands/configure'
import { swaggerPreset } from './src/swagger_preset.js'

/**
 * Configures the auth package
 */
export async function configure(command: Configure) {
  const codemods = await command.createCodemods()

  await swaggerPreset(codemods, command.app, {})
}
