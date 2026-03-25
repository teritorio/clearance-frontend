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
