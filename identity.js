
"use strict"

// data IdentityT a = Identity {runIdentity :: a}
const IdentityT = class {
	constructor(value) {
		this._value = value;
	}
	toJSON() {
		return { "Identity": this._value };
	}
	toString() {
		return `Identity(${String(this._value)})`;
	}
};
// Identity :: a -> IdentityT a
const Identity = x => new IdentityT(x);
// runIdentity :: IdentityT a -> a
const runIdentity = id => id._value;

module.exports = { IdentityT, Identity, runIdentity };
