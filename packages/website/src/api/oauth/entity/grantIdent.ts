import type {JTDDataType} from '~/alias/jtd'

export const grantIdentDefinition = {
	enum: ['authorization_code', 'client_credentials', 'refresh_token', 'password', 'implicit'],
} as const
export type grantIdentType = JTDDataType<typeof grantIdentDefinition>
