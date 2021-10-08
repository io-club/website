import type {JwtInterface} from '@jmondi/oauth2-server'
import type {DecodeOptions, JwtPayload, Secret, SignOptions, VerifyOptions} from 'jsonwebtoken'

import jwt from 'jsonwebtoken'

export class JwtService implements JwtInterface {
	#key: Secret

	constructor(key: Secret) {
		this.#key = key
	}

	verify(token: string, options: VerifyOptions = {}) {
		return new Promise<JwtPayload>((resolve, reject) => {
			jwt.verify(token, this.#key, options, (err, decoded) => {
				if (decoded) resolve(decoded)
				else reject(err)
			})
		})
	}

	decode(encryptedData: string, opts: DecodeOptions = {}) {
		return jwt.decode(encryptedData, opts)
	}

	sign(payload: string | Buffer | Record<string, unknown>, options: SignOptions = {}) {
		return new Promise<string>((resolve, reject) => {
			jwt.sign(payload, this.#key, options, (err, encoded) => {
				if (encoded) resolve(encoded)
				else reject(err)
			})
		})
	}
}
