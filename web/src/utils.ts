import { AxiosError } from 'axios'

import i18n from '@/plugins/i18n'

export function isAxiosError<T>(error: unknown): error is AxiosError<T> {
  return (error as AxiosError).isAxiosError !== undefined
}

export function ruleMinLength(min: number, errorMsg?: string) {
  return (value: string): true | string =>
    value.length >= min || errorMsg || i18n.tc('common.too-short')
}

export function ruleMatchString(str: string, errorMsg: string) {
  return (value: string): true | string => value === str || errorMsg
}
