
"use strict"

const { makeGet, makeValue, defineProps } = require("../langutil");

// instance Functor Date where
// fmap :: (Int -> a) -> Date -> Date
const fmap = f => fa => {
	let d = new Date();
	d.setTime(f(fa.getTime()));
	return d;
};

let props = {};
makeValue(props)("fmap")(fmap);
defineProps(Date)(props);
