/**
 * NSIDs are an ID (key identifier) with an optional namespace. They are used for
 * tag names and attributes. Anonymous tags all use the ANONYMOUS key.
 */
import { ParseError } from './ParseError';

export class NSID {
	name = '';
	namespace = '';

	constructor(name: string, namespace: string = '') {
		if (!namespace.isEmpty() && name.isEmpty())
			throw new ParseError(`Anonymous tags cannot have a namespace (${namespace}).`);

		this.name = name;
		this.namespace = namespace;
	}

	toString = () => (this.namespace != '' ? `${this.namespace}:${this.name}` : this.name);
}
