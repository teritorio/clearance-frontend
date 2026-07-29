import type { AsyncData, AsyncDataOptions } from 'nuxt/app'
import type {
  _AsyncData,
  _Transform,
  KeysOf,
} from '#app/composables/asyncData'
import type { NuxtApp } from '#app/nuxt'

import { showError, useAsyncData } from '#imports'

const HTTP_ERROR_RE = /\b[45]\d{2}\b/

// Temporary helper pending refactor to idiomatic Nuxt 3 useAsyncData+createError
// (see issue #459). Do NOT add showError in callers — it is handled here.
export function getAsyncDataOrThrows<
  DataT,
  DataE = Error,
  Transform extends _Transform<DataT> = _Transform<DataT, DataT>,
  PickKeys extends KeysOf<Transform> = KeysOf<Transform>,
>(
  key: string,
  handler: (ctx?: NuxtApp) => Promise<DataT>,
  options?: AsyncDataOptions<DataT, Transform, PickKeys>,
): AsyncData<DataT, DataE> {
  return useAsyncData(key, handler, options).then((asyncData) => {
    if (asyncData.error.value) {
      const err = asyncData.error.value as Error
      // Only show the error page for deterministic HTTP errors (4xx/5xx).
      // Transient network failures (e.g. "Failed to fetch") are re-thrown without
      // showing the error page. showError renders Nuxt's error page; throw stops
      // the .then() chain.
      if (HTTP_ERROR_RE.test(err?.message ?? '')) {
        showError(err)
      }
      throw asyncData.error
    }
    else {
      return asyncData
    }
  }) as AsyncData<DataT, DataE>
}

export function getAsyncDataOrNull<
  DataT,
  DataE = Error,
  Transform extends _Transform<DataT> = _Transform<DataT, DataT>,
  PickKeys extends KeysOf<Transform> = KeysOf<Transform>,
>(
  key: string,
  handler: (ctx?: NuxtApp) => Promise<DataT>,
  options?: AsyncDataOptions<DataT, Transform, PickKeys>,
): AsyncData<DataT, DataE> {
  return useAsyncData(key, handler, options).then((asyncData) => {
    if (asyncData.error.value) {
      return undefined
    }
    else {
      return asyncData
    }
  }) as AsyncData<DataT, DataE>
}

export function setAsyncRef<Type>(ref: Ref<Type | undefined>) {
  return (data: _AsyncData<Type | null, Error>) => {
    if (data?.data.value) {
      ref.value = data?.data.value
    }
  }
}
