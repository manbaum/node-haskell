
"use strict"

const { PropDefT } = require("../langutil");

// instance Functor [a] where
//       fmap :: (a -> b) -> [a] -> [b]
const    fmap =  f  => fa => Array.from(fa).map(f);

// instance Applicative [a] where
//       pure :: a -> [a]
const    pure =  a        => [a];
//     fapply :: [a -> b] -> [a] -> [b]
const  fapply =  ff => fa => {
	const af = Array.from(ff),
		  aa = Array.from(fa);
	return mconcat(af.map(f => aa.map(f)));
};

// instance Monoid [a] where
//     mempty :: [a]
const  mempty =              [];
//    mappend :: [a] -> [a] -> [a]
const mappend =  x  => y  => Array.from(x).concat(Array.from(y));
//    mconcat :: [[a]] -> [a]
const mconcat =  xs       => Array.prototype.concat.apply([], Array.from(xs));

// instance Monad [a] where
//      mbind :: [a] -> (a -> [b]) -> [b]
const   mbind =  as => f  => mconcat(Array.from(as).map(f));

new PropDefT()
	.makeValue("fmap",    fmap)
	.makeValue("pure",    pure)
	.makeValue("fapply",  fapply)
	.makeCopy ("mempty",  mempty)
	.makeValue("mappend", mappend)
	.makeValue("mconcat", mconcat)
	.makeValue("mbind",   mbind)
	.defines(Array);
