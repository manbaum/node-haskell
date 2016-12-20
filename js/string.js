
"use strict"

const { makeGet, makeValue, defineProps } = require("../langutil");
const { fmap$ } = require("../functor");

// instance Functor String where
// fmap :: (Char -> a) -> String -> [a]
const fmap = f => fa => {
	let array = [];
	for (let ch of fa) {
		array.push(f(ch));
	}
	return array;
};

// instance Applicative String where
// pure   :: a -> String
const pure   = a => String(a);
// fapply :: [Char -> a] -> String -> [a]
const fapply = ff => fa => Array.prototype.concat.apply([], ff.map(f => fmap$(String)(f)(fa)));

// instance Monoid String where
// mempty  :: String
const mempty  = () => "";
// mappend :: String -> String -> String
const mappend = x => y => String(x) + String(y);

let props = {};
makeValue(props)("fmap"   )(fmap);
makeValue(props)("pure"   )(pure);
makeValue(props)("fapply" )(fapply);
makeGet  (props)("mempty" )(mempty);
makeValue(props)("mappend")(mappend);
defineProps(String)(props);


