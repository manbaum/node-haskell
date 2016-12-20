
"use strict"

// data TimeSpanT a = TimeSpan {getDelta :: a}
const TimeSpanT = class {
	constructor(delta) {
		this._delta = Math.trunc(delta);
	}
	toJSON() {
		return { "TimeSpan": this._delta };
	}
	toString() {
		return `TimeSpan(${this._delta >= 0 ? "+" : ""}${this._delta})`;
	}
	atBeginOf(endDate) {
		let d = new Date();
		d.setTime(endDate.getTime() - this._delta);
		return d;
	}
	atEndOf(beginDate) {
		let d = new Date();
		d.setTime(beginDate.getTime() + this._delta);
		return d;
	}
	static from(beginDate, endDate) {
		return new TimeSpanT(endDate.getTime() - beginDate.getTime());
	}
};
// TimeSpan :: a -> TimeSpanT a
const TimeSpan = x => new TimeSpanT(x);
// getDelta :: TimeSpanT a -> a
const getDelta = t => t._delta;
// getAbsDelta :: TimeSpanT a -> a
const getAbsDelta = t => Math.abs(t._delta);
// isStayStill :: TimeSpanT a -> Boolean
const isStayStill = t => t._delta == 0;
// isForward :: TimeSpanT a -> Boolean
const isForward = t => t._delta > 0;
// isBackword :: TimeSpanT a -> Boolean
const isBackward = t => t._delta < 0;
// combineSpan :: TimeSpanT a -> TimeSpanT a -> TimeSpanT a
const combineSpan = ta => tb => TimeSpan(ta._delta + tb._delta);

module.exports = { TimeSpanT, TimeSpan, getDelta, getAbsDelta, isStayStill, isForward, isBackword, combineSpan };
