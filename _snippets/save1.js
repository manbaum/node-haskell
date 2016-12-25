
"use strict"

const truncate   = (n, onNaN = $K()) => (t => isNaN(t) ? onNaN(n) : t)(Math.trunc(n));
const error      = message => x => { throw new Error(isFunction(message) ? String(message(x)) : String(message)); };

const CheckT = class {
	constructor() {
		this._checks = [];
	}
	push(check, msg) {
		this._checks.push(x => {
			if (check(x)) {
				throw new Error(msg(x));
			} else {
				return x;
			}
		});
		return this;
	}
	test(x) {
		return this._checks.reduce((x, c) => c(x), x);
	}
};

const AmendT = class {
	constructor() {
		this._f = $I;
	}
	onYes(check, onYes = $I) {
		const f = this._f;
		this._f = x => check(x) ? onYes(f(x)) : f(x);
		return this;
	}
	onNot(check, onNot = $I) {
		const f = this._f;
		this._f = x => check(x) ? f(x) : onNot(f(x));
		return this;
	}
	check(check, { onYes = $I, onNot = $I }) {
		const f = this._f;
		this._f = x => check(x) ? onYes(f(x)) : onNot(f(x));
		return this;
	}
	onEnd(onEnd = $I) {
		const f = this._f;
		this._f = x => onEnd(f(x));
		return this;
	}
	amend(x) {
		return this._f(x);
	}
};
