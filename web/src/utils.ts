import { AxiosError } from 'axios'

import i18n from '@/plugins/i18n'

export function isAxiosError(error: unknown): error is AxiosError {
  return (error as AxiosError).isAxiosError !== undefined
}

export function ruleMinLength(min: number) {
  return (value: string): true | string =>
    value.length >= min || i18n.tc('common.too-short')
}

export function ruleMatchString(str: string) {
  return (value: string): true | string =>
    value === str || i18n.tc('register.confirm-password-mismatch')
}
