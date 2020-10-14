const fs = require('fs');
const path = require('path');
const { generateKeyPair } = require('jose/util/generate_key_pair')
const { fromKeyLike } = require('jose/jwk/from_key_like')

const JWK = generateKeyPair('EdDSA', { crv: 'Ed25519' })
JWK.then(async ({publicKey, privateKey}) => {
	return [await fromKeyLike(publicKey), await fromKeyLike(privateKey)]
}).then(d => {
	d[1].use = 'sig'
	fs.writeFileSync(path.resolve('./jwks.json'), JSON.stringify(d));
})
