export interface User {
  osm_uid: number
  osm_name: string
  osm_image_url: string
  projects: string[]
}

export function userLogout(apiEndpoint: string): Promise<void> {
  return fetch(`${apiEndpoint}/../../../users`, {
    method: 'DELETE',
  }).then((data) => {
    if (!data.ok) {
      return Promise.reject(
        new Error([data.url, data.status, data.statusText].join(' ')),
      )
    }
  })
}
