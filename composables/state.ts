import type { Log } from '~/libs/types'

export const useLogs = () => useState<Log[]>('logs')
