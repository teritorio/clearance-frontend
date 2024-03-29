export type User = {
  osm_uid: number
  osm_name: string
  osm_image_url: string
  projects: string[]
}

export function getUser(apiEndpoint: string): Promise<User | null> {
  return fetch(`${apiEndpoint}/users/me`, {
    credentials: 'include',
  }).then((data) => {
    if (data.ok) {
      return data.json() as unknown as User
    } else if (data.status === 404) {
      return null
    } else {
      return Promise.reject(
        new Error([data.url, data.status, data.statusText].join(' '))
      )
    }
  })
}

export function userLogout(apiEndpoint: string): Promise<void> {
  return fetch(`${apiEndpoint}/../../../users`, {
    method: 'DELETE',
  }).then((data) => {
    if (!data.ok) {
      return Promise.reject(
        new Error([data.url, data.status, data.statusText].join(' '))
      )
    }
  })
}
