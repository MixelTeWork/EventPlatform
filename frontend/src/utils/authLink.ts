const client_id = "51848582"
const redirect_uri = process.env.PUBLIC_URL + "/auth_vk"

export const authLink = `https://oauth.vk.com/authorize?client_id=${client_id}&redirect_uri=${redirect_uri}&display=page&response_type=code`;
