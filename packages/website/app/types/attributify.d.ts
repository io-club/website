import type { UtilityNames, VariantNames } from 'windicss/types/jsx'

export declare type ExtendedUtilityNames = UtilityNames | 'caret'
export declare type ExtendedVariantNames = VariantNames

export declare type AttributifyNames<Prefix extends string = ''> = `${Prefix}${ExtendedUtilityNames}` | `${Prefix}${ExtendedVariantNames}` | `${Prefix}${ExtendedVariantNames}:${ExtendedVariantNames}`
