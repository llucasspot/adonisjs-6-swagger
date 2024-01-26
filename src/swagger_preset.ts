import type { Application } from '@adonisjs/core/app'
import type { Codemods } from '@adonisjs/core/ace/codemods'
import { joinToURL } from '@poppinss/utils'

const STUBS_ROOT = joinToURL(import.meta.url, './stubs')

// @ts-ignore
export async function swaggerPreset(codemods: Codemods, app: Application<any>, options: {}) {
  const configStub = 'config/config.stub'

  /**
   * Publish config file
   */
  await codemods.makeUsingStub(STUBS_ROOT.toString(), configStub, {})

  /**
   * Register provider to the rcfile
   */
  await codemods.updateRcFile((rcFile) => {
    rcFile.addProvider('adonisjs-6-swagger/swagger_provider')
  })
}
