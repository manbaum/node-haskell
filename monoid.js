
"use strict"

// class Monoid m where
//         mempty$ :: Monoid m => m
const      mempty$ =  M => M.mempty;
//        mappend$ :: Monoid m => m -> m -> m
const     mappend$ =  M => M.mappend;
//        mconcat$ :: Monoid m => [m] -> m
const     mconcat$ =  M => M.mconcat || mconcatDef$(M);
//     mconcatDef$ :: Monoid m => [m] -> m
const  mconcatDef$ =  M => ms => ms.reduce((a, m) => mappend$(M)(a)(m), mempty$(M));

// instance (Functor f, Monoid m) => Monoid (f m) where
//        fmempty$ :: (Functor f, Monoid m) => f m
const     fmempty$ =  F => M => F.fmempty(M);
//       fmappend$ :: (Functor f, Monoid m) => f m -> f m -> f m
const    fmappend$ =  F => M => F.fmappend(M);
//       fmconcat$ :: (Functor f, Monoid m) => [f m] -> f m
const    fmconcat$ =  F => M => (F.fmconcat || fmconcatDef$(F))(M);
//    fmconcatDef$ :: (Functor f, Monoid m) => [f m] -> f m
const fmconcatDef$ =  F => M => ms => ms.reduce((a, m) => fmappend$(F)(M)(a)(m), fmempty$(F)(M));

module.exports = {
	  mempty$,  
	 mappend$,
	 mconcat$,
	 fmempty$,
	fmappend$,
	fmconcat$
};
