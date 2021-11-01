import {exportJWK, generateKeyPair} from 'jose'

const ktyp = 'ECDH-ES+A256KW'
const {publicKey, privateKey} = await generateKeyPair(ktyp)
const _keys = [publicKey, privateKey]
const keys = []
for (const k of _keys) {
	keys.push({
		...await exportJWK(k),
		alg: ktyp,
	})
}
console.log(JSON.stringify(keys))
