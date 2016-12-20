
"use strict"

// data MaybeT a = Just a | Nothing
const MaybeT = class {
	constructor(value) {
		this._flag = arguments.length > 0;
		this._value = value;
	}
	toJSON() {
		return this._flag ? { "Just": this._value } : { "Nothing": 0 };
	}
	toString() {
		return this._flag ? `Just(${String(this._value)})` : "Nothing";
	}
	dispatch(f, g) {
		return this._flag ? f(this._value) : g();
	}
};
// Nothing :: MaybeT a
const Nothing = new MaybeT;
// Just :: a -> MaybeT a
const Just = x => new MaybeT(x);

// instance Functor MaybeT
// $fmap :: (a -> b) -> MaybeT a -> MaybeT b
MaybeT.$fmap = f => fa => fa._flag ? Just(f(fa._value)) : Nothing;

// instance Applicative MaybeT
// $pure :: a -> MaybeT a
MaybeT.$pure = Just;
// $fapply :: MaybeT (a -> b) -> MaybeT a -> MaybeT b
MaybeT.$fapply = ff => fa => ff._flag && fa._flag ? Just(ff._value(fa._value)) : Nothing;

MaybeT.$with = T => {
	// instance Monoid t => Monoid (Maybe t)
	// $mempty :: MaybeT t
	$mempty: Just(T.$mempty),
	// $mappend :: MaybeT t -> Maybe t -> Maybe t
	$mappend: x => y => x._flag && y._flag ? Just(T.$mappend(x._value)(y._value)) : Nothing
};

// instance Monad Maybe
// $bind :: MaybeT a -> (a -> MaybeT b) -> MaybeT b
MaybeT.$bind = fa => ff => fa._flag ? ff(fa._value) : fa;

module.exports = { MaybeT, Just, Nothing };
