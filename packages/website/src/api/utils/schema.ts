
// import type {SomeJTDSchemaType} from '~/alias/jtd'
// FIXME: SomeJTDSchemaType will report type error
export interface SchemaDefinition {
	body?: unknown;
	querystring?: unknown;
	params?: unknown;
	headers?: unknown;
	response?: unknown;
}

export function toFastifySchema(sch: SchemaDefinition) {
	return {
		body: sch.body,
		querystring: sch.querystring,
		params: sch.params,
		headers: sch.headers,
		...(!sch.response ? {} : {
			200: sch.response,
		}),
	}
}
