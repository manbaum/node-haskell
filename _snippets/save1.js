
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

	p(nOffset, nLength) {
		const    realStart = this._start - (this._reversed ? this._length : 0           ),
			       realEnd = this._start + (this._reversed ? 0            : this._length),
			    rangeLimit = limit(0, this._length);

		const     tmpStart = nOffset,// < 0 ? nOffset + this._length : nOffset,
			        tmpEnd = tmpStart + nLength,
			   adjustStart = rangeLimit(tmpStart),
			     adjustEnd = rangeLimit(tmpEnd);

		const    wantStart = this._reversed ? realEnd - adjustStart : realStart + adjustStart,
			       wantEnd = this._reversed ? realEnd - adjustEnd   : realStart + adjustEnd,
			    wantLength = Math.abs(wantEnd - wantStart),
			       wantRev = (nLength < 0) != this._reversed;

		return {
			___realStart: realStart,
			_____realEnd: realEnd,
			____tmpStart: tmpStart,
			______tmpEnd: tmpEnd,
			_adjustStart: adjustStart,
			___adjustEnd: adjustEnd,
			___wantStart: wantStart,
			_____wantEnd: wantEnd,
			__wantLength: wantLength,
			_____wantRev: wantRev
		};
	}
