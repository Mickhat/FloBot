import { Client } from 'discord.js'
import { AsyncDatabase } from '../sqlite/sqlite'

export default (client: Client, db: AsyncDatabase): void => {
  client.on('roleDelete', async (role) => {
    const dbEntry = await db.getAsync(`SELECT * FROM button_roles WHERE role_id = ?`, [role.id])
    if (!dbEntry) return
    await db.runAsync(`DELETE FROM button_roles WHERE role_id = ?`, [role.id])
  })
}
