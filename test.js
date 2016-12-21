
"use strict"

                        require("./js/array");
let { $compose      } = require("./compose");
let { mbind$, mret$, mbindN$, liftMN$ } = require("./monad");


let M    = Array;
let f    = x => y => z => w => [x(y), x(z), x(w)];
let id   = x => x;
let A    = f => x => f(x);
let bind = mbind$(M);

// let bh    = m => y => w => bind(m)(x => y(w(x)));
// let brec  = n => b => n > 0 ? m => brec(n - 1)(y => b(bh(m)(y))) : b(id)(f);

let y1 = mbindN$(M)(4)(f)([x => 2 * x])([11,12])([21,22])([31,32,33]);
let y2 = liftMN$(M)(4)(f)([x => 2 * x])([11,12])([21,22])([31,32,33]);
console.log(JSON.stringify(y1));
console.log(JSON.stringify(y2));
