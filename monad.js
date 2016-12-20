
"use strict"

const { $I, $K, $S                    } = require("./ski");
const { $apply                        } = require("./apply");
const { $compose                      } = require("./compose");
const { $flip                         } = require("./flip");
const { $curryN, $rcurryN, $uncurryN  } = require("./curry");
const { fmap$, lconst$                } = require("./functor");

// class Applicative m => Monad m where
//        mbind$ :: Monad m => m a -> (a -> m b) -> m b
const     mbind$ =  M => M.mbind;
//         mret$ :: Monad m => a -> m a
const      mret$ =  M => M.mret || M.pure;

//       dropML$ :: Monad m => m a -> m b -> m b
const    dropML$ =  M => M.dropML || dropMLDef$(M);
//    dropMLDef$ :: Monad m => m a -> m b -> m b
const dropMLDef$ =  M => m => k => mbind$(M)(m)(_ => k);

//       mbindR$ :: Monad m => (a -> m b) -> m a -> m b
const    mbindR$ =  M => f => x => mbind$(M)(x)(f);

//        mjoin$ :: Monad m => m (m a) -> m a
const     mjoin$ =  M => x => mbind$(M)($I);

//         mapM$ :: Monad m => (a -> m b) -> [a] -> m [b]
const      mapM$ =  M => f => as => {
	//    k :: m [b] -> m b -> m [b]
	const k =  mab => mb => mbind$(M)(mab)(ab => mbind$(M)(mb)(b => ab.concat(b)));
	return as.reduce(k, mret$(M)([]));
};

//       mbind2$ :: Monad m => (a -> b -> m r) -> m a -> m b -> m r
const    mbind2$ =  M => f => ma => mb => mbind$(M)(ma)(a => mbind$(M)(mb)(b => f(a)(b)));
//       mbind3$ :: Monad m => (a -> b -> c -> m r) -> m a -> m b -> m c -> m r
const    mbind3$ =  M => f => ma => mb => mc => mbind$(M)(ma)(a => mbind$(M)(mb)(b => mbind$(M)(mc)(c => f(a)(b)(c))));
//       mbind4$ :: Monad m => (a -> b -> c -> d -> m r) -> m a -> m b -> m c -> m d -> m r
const    mbind4$ =  M => f => ma => mb => mc => md => mbind$(M)(ma)(a => mbind$(M)(mb)(b => mbind$(M)(mc)(c => mbind$(M)(md)(d => f(a)(b)(c)(d)))));
//       mbind5$ :: Monad m => (a -> b -> c -> d -> e -> m r) -> m a -> m b -> m c -> m d -> m e -> m r
const    mbind5$ =  M => f => ma => mb => mc => md => me => mbind$(M)(ma)(a => mbind$(M)(mb)(b => mbind$(M)(mc)(c => mbind$(M)(md)(d => mbind$(M)(me)(e => f(a)(b)(c)(d)(e))))));

//       mbindN$ :: Monad m => n -> (x1 -> x2 -> ... -> xn -> m r) -> m x1 -> m x2 -> ... -> m xn -> m r
const    mbindN$ =  M => n => {
	const m = Math.trunc(n);
	if (isNaN(m) || m < 1) throw new Error("* mbindN$: illegal arguments");
	const raN = n => f => {
		const rec = n => args => n > 0 ? x => rec(n - 1)([x].concat(args)) : args.reduce((f, x) => f(x), f);
		return rec(n)([]);
	};
	//    bindRec :: Int -> (t -> t) -> (x1 -> x2 -> ... -> xn -> r) -> m x1 -> m x2 -> ... -> m xn -> m r
	const bindRec =  n => w => f => n > 0 ? m => bindRec(n - 1)(wm => mbind$(M)(m)(x => w(wm(x))))(f) : w(f);
	return f => bindRec(m)($I)(raN(m)(f));
};

//     liftFold$ :: Monad m => (a -> a -> ... -> r) -> [m a] -> m r
const  liftFold$ =  M => f => ms => ms.length > 0 ? mbind$(M)(ms[0])(x => liftFold$(M)(f(x))(ms.slice(1))) : mret$(M)(f);

//        liftM$ :: Monad m => (a1 -> r) -> m a1 -> m r
const     liftM$ =  M => f => m1 => mbind$(M)(m1)(x1 => mret$(M)(f(x1)))
//       liftM2$ :: Monad m => (a1 -> a2 -> r) -> m a1 -> m a2 -> m r
const    liftM2$ =  M => f => m1 => m2 => mbind$(M)(m1)(x1 => mbind$(M)(m2)(x2 => mret$(M)(f(x1)(x2))));
//       liftM3$ :: Monad m => (a1 -> a2 -> a3 -> r) -> m a1 -> m a2 -> m a3 -> m r
const    liftM3$ =  M => f => m1 => m2 => m3 => mbind$(M)(m1)(x1 => mbind$(M)(m2)(x2 => mbind$(M)(m3)(x3 => mret$(M)(f(x1)(x2)(x3)))));
//       liftM4$ :: Monad m => (a1 -> a2 -> a3 -> a4 -> r) -> m a1 -> m a2 -> m a3 -> m a4 -> m r
const    liftM4$ =  M => f => m1 => m2 => m3 => m4 => mbind$(M)(m1)(x1 => mbind$(M)(m2)(x2 => mbind$(M)(m3)(x3 => mbind$(M)(m4)(x4 => mret$(M)(f(x1)(x2)(x3)(x4))))));
//       liftM5$ :: Monad m => (a1 -> a2 -> a3 -> a4 -> a5 -> r) -> m a1 -> m a2 -> m a3 -> m a4 -> m a5 -> m r
const    liftM5$ =  M => f => m1 => m2 => m3 => m4 => m5 => mbind$(M)(m1)(x1 => mbind$(M)(m2)(x2 => mbind$(M)(m3)(x3 => mbind$(M)(m4)(x4 => mbind$(M)(m5)(x5 => mret$(M)(f(x1)(x2)(x3)(x4)(x5)))))));

//       liftMN$ :: Monad m => n => (a1 -> a2 -> ... -> an -> r) -> m a1 -> m a2 -> ... -> m an -> m r
const    liftMN$ =  M => n => {
	const m = Math.trunc(n);
	if (isNaN(m) || m < 1) throw new Error("* liftMN$: illegal arguments");
	// return f => $curryN(m)((...ms) => liftFold$(M)(f)(ms));
	const raN = n => f => {
		const rec = n => args => n > 0 ? x => rec(n - 1)([x].concat(args)) : args.reduce((f, x) => f(x), f);
		return rec(n)([]);
	};
	//    bindRec :: Int -> (t -> t) -> (x1 -> x2 -> ... -> xn -> r) -> m x1 -> m x2 -> ... -> m xn -> m r
	const bindRec =  n => w => f => n > 0 ? m => bindRec(n - 1)(wm => mbind$(M)(m)(x => w(wm(x))))(f) : w(f);
	return f => bindRec(m)(mret$(M))(raN(m)(f));
};

//           ap$ :: Monad m => m (a -> b) -> m a -> m b
const        ap$ =  M => mf => ma => mbind$(M)(mf)(f => mbind$(M)(ma)(a => mret$(M)(f(a))));

module.exports = {
	   mbind$,
	    mret$,
	  dropML$,
	  mbindR$,
	   mjoin$,
	    mapM$,
	  mbind2$,
	  mbind3$,
	  mbind4$,
	  mbind5$,
	  mbindN$,
	liftFold$,
	   liftM$,
	  liftM2$,
	  liftM3$,
	  liftM4$,
	  liftM5$,
	  liftMN$,
	      ap$
};
