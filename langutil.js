
"use strict"

const PropDefT = class {
	constructor() {
		this._props = {};
	}
	makeGetter(name, getter) {
		this._props[name] = { get: getter };
		return this;
	}
	makeSetter(name, setter) {
		this._props[name] = { set: setter };
		return this;
	}
	makeValue(name, value) {
		this._props[name] = { value };
		return this;
	}
	makeCopy(name, value) {
		this._props[name] = { get: _ => value };
		return this;
	}
	defines(target) {
		return Object.defineProperties(target, this._props);
	}
};

module.exports = {
	PropDefT
};
