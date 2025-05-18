import { appSchema } from '@nozbe/watermelondb'
import { cavityRegister } from './cavityRegister'
import { user } from './user'
import { project } from './project'

export default appSchema({
  version: 7,
  tables: [
    cavityRegister,
    user,
    project
  ]
})