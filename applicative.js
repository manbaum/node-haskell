
"use strict"

const { $I, $K          } = require("./ski");
const { $apply          } = require("./apply");
const { $flip           } = require("./flip");
const { fmap$, fconstL$ } = require("./functor");

// class Functor f => Applicative f where
//        pure$ :: Applicative f => a -> f a
const     pure$ =  F => F.pure;
//      fapply$ :: Applicative f => f (a -> b) -> f a -> f b
const   fapply$ =  F => F.fapply;

//       dropL$ :: Applicative f => f a -> f b -> f b
const    dropL$ =  F => F.dropL || dropLDef$(F);
//    dropLDef$ :: Applicative f => f a -> f b -> f b
const dropLDef$ =  F => fa => fb => fapply$(F)(fconstL$(F)($I)(fa))(fb);

//       dropR$ :: Applicative f => f a -> f b -> f a
const    dropR$ =  F => F.rdrop || dropRDef$(F);
//    dropRDef$ :: Applicative f => f a -> f b -> f a
const dropRDef$ =  F => liftA2$(F)($K);

//     rfapply$ :: Applicative f => f a -> f (a -> b) -> f b
const  rfapply$ =  F => liftA2$(F)($flip($apply));

//       liftA$ :: Applicative f => (a -> b) -> f a -> f b
const    liftA$ =  F => f => a => fapply$(F)(pure$(F)(f))(a);
//      liftA2$ :: Applicative f => (a -> b -> c) -> f a -> f b -> f c
const   liftA2$ =  F => f => a => b => fapply$(F)(fmap$(F)(f)(a))(b);
//      liftA3$ :: Applicative f => (a -> b -> c -> d) -> f a -> f b -> f c -> f d
const   liftA3$ =  F => f => a => b => c => fapply$(F)(fapply$(F)(fmap$(f)(a))(b))(c);

//      liftAN$ :: Applicative f => n -> (x1 -> x2 -> ... -> xn -> t) -> f x1 -> f x2 -> ... -> f xn -> f t
const   liftAN$ =  F => n => {
	const m = Math.trunc(n);
	if (isNaN(m) || m < 1) throw new Error("* liftAN$: illegal arguments");
	return f => {
		const liftRec = n => g => n > 0 ? x => liftRec(n - 1)(fapply$(F)(g(x))) : g;
		return liftRec(m)(fmap$(F)(f));
	};
};

module.exports = {
	   pure$,
	 fapply$,
	  dropL$,
	  dropR$,
	rfapply$,
	  liftA$,
	 liftA2$,
	 liftA3$,
	 liftAN$
};
