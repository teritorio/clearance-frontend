export default async <T>(key: string, url: string, opts?: object): Promise<Ref<T>> => {
  const { data: cached } = useNuxtData<T>(key)

  if (!cached.value) {
    const { data, error } = await useFetch<T>(url, opts)

    if (error.value) {
      throw createError({
        ...error.value,
        message: `Could not fetch data from ${url}`,
      })
    }

    // Update the cache
    cached.value = data.value as T
  }

  return cached as Ref<T>
}
