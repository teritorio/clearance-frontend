import { AsyncData, AsyncDataOptions } from 'nuxt/app'
import { _Transform, KeysOf } from 'nuxt/dist/app/composables/asyncData'
import { NuxtApp } from 'nuxt/dist/app/nuxt'

import { useAsyncData } from '#imports'

export function getAsyncDataOrThrows<
  DataT,
  DataE = Error,
  Transform extends _Transform<DataT> = _Transform<DataT, DataT>,
  PickKeys extends KeysOf<Transform> = KeysOf<Transform>
>(
  key: string,
  handler: (ctx?: NuxtApp) => Promise<DataT>,
  options?: AsyncDataOptions<DataT, Transform, PickKeys>
): AsyncData<DataT, DataE> {
  return useAsyncData(key, handler, options).then((asyncData) => {
    if (asyncData.error != null && asyncData.error.value) {
      throw asyncData.error
    } else {
      return asyncData
    }
  }) as AsyncData<DataT, DataE>
}

export function getAsyncDataOrNull<
  DataT,
  DataE = Error,
  Transform extends _Transform<DataT> = _Transform<DataT, DataT>,
  PickKeys extends KeysOf<Transform> = KeysOf<Transform>
>(
  key: string,
  handler: (ctx?: NuxtApp) => Promise<DataT>,
  options?: AsyncDataOptions<DataT, Transform, PickKeys>
): AsyncData<DataT, DataE> {
  return useAsyncData(key, handler, options).then((asyncData) => {
    if (asyncData.error != null && asyncData.error.value) {
      return undefined
    } else {
      return asyncData
    }
  }) as AsyncData<DataT, DataE>
}
