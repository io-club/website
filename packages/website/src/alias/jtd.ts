export * from 'ajv/dist/jtd.js'
export {default} from 'ajv/dist/jtd.js'
export {default as format} from 'ajv-formats'

import def from 'ajv/dist/vocabularies/format/format.js'
export const formatKeyword = (def as any).default
