import {getUserByUsername} from '../../helpers/twitter/rest-api/user'

export async function getUserIdByUsername(username: string) {
    const user = await getUserByUsername(username)
    console.log(user.id)
}

if (require.main == module) {
    const username = process.argv[2]
    if (!username) throw "Username not supplied."
    getUserIdByUsername(username)
}
