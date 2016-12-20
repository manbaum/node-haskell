
"use strict"

const { $K    } = require("./ski");
const { $flip } = require("./flip");

// class Functor f where
//          fmap$ :: Functor f => (a -> b) -> f a -> f b
const       fmap$ =  F => F.fmap;

//       fconstL$ :: Functor f => a -> f b -> f a
const    fconstL$ =  F => F.fconstL || fconstLDef$(F);
//    fconstLDef$ :: Functor f => a -> f b -> f a
const fconstLDef$ =  F => a => fb => fmap$(F)($K(a))(fb);

//       fconstR$ :: Functor f => f a -> b -> f b
const    fconstR$ =  F => F.fconstR || fconstRDef$(F);
//    fconstRDef$ :: Functor f => f a -> b -> f b
const fconstRDef$ =  F => $flip(fconstLDef$(F));

module.exports = {
	   fmap$,
	fconstL$,
	fconstR$
};
