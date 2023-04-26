import { AsyncDataOptions } from 'nuxt/app'
import {
  _Transform,
  KeyOfRes,
  PickFrom,
} from 'nuxt/dist/app/composables/asyncData'
import { NuxtApp } from 'nuxt/dist/app/nuxt'
import { Ref, ref } from 'vue'

import { useAsyncData } from '#imports'

export function getAsyncDataOrThrows<
  DataT,
  DataE = Error,
  Transform extends _Transform<DataT> = _Transform<DataT, DataT>,
  PickKeys extends KeyOfRes<Transform> = KeyOfRes<Transform>
>(
  key: string,
  handler: (ctx?: NuxtApp) => Promise<DataT>,
  options?: AsyncDataOptions<DataT, Transform, PickKeys>
): Promise<Ref<PickFrom<ReturnType<Transform>, PickKeys>>> {
  return useAsyncData(key, handler, options).then(({ data, error }) => {
    if (error != null && error.value) {
      throw error
    } else {
      return data as Ref<PickFrom<ReturnType<Transform>, PickKeys>>
    }
  })
}

export function getAsyncDataOrNull<
  DataT,
  DataE = Error,
  Transform extends _Transform<DataT> = _Transform<DataT, DataT>,
  PickKeys extends KeyOfRes<Transform> = KeyOfRes<Transform>
>(
  key: string,
  handler: (ctx?: NuxtApp) => Promise<DataT>,
  options?: AsyncDataOptions<DataT, Transform, PickKeys>
): Promise<Ref<PickFrom<ReturnType<Transform>, PickKeys> | null>> {
  return useAsyncData(key, handler, options).then(({ data, error }) => {
    if (error != null && error.value) {
      return ref(null)
    } else {
      return data as Ref<PickFrom<ReturnType<Transform>, PickKeys>>
    }
  })
}
