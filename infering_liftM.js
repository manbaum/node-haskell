
M   = Array;
b1  = f1 => m1 =>                                                   bind$(M)(m1)(x1 => f1(x1)        )
b2  = f2 => m2 => m1 =>                          bind$(M)(m2)(x2 => bind$(M)(m1)(x1 => f2(x2)(x1)    ));
b3  = f3 => m3 => m2 => m1 => bind$(M)(m3)(x3 => bind$(M)(m2)(x2 => bind$(M)(m1)(x1 => f3(x3)(x2)(x1))));

// fix :: ((t1 -> t) -> t1 -> t) -> t1 -> t
fix = y => x => y(x => fix(y)(x))(x)

br = n => f => w => n > 0 ? m => br(n - 1)(f)( wm => bind$(M)(m) ( x => w(wm(x)) ) ) : w(f);

  br(1)(x=>[x+1,x*2])(x=>x)([1])
= m1 => br(0)(x=>[x+1,x*2])( wm1 => bind$(M)(m2) )

br(2) = w2 => m2 => br(1)(wm2 => bind$(M)(m2)(x2 => w2(wm2(x2))))
      = w2 => m2 => m1 => br(0)(wm1 => bind$(M)(m1)(x1 => (wm2 => bind$(M)(m2)(x2 => w2(wm2(x2))))(wm1(x1)))
      = w2 => m2 => m1 => br(0)(wm1 => bind$(M)(m1)(x1 => bind$(M)(m2)(x2 => w2(wm1(x1)(x2))))

br = n => f => n > 0 ? m => u(bind$(M)(m))(f) : f

u = bm => f => g

// bh :: (((a -> m b) -> m b) -> t -> r) -> t -> m a -> r
bh  = u  => f  => m  => u(bind$(M)(m))(f);

br = n => f => n > 0 ? m => ur(n - 1)(bind$(M)(m))(f) : f;

// ur :: Int -> (Int -> t2 -> t) -> ((t3 -> t) -> t3 -> t2) -> (t3 - t) -> t3 -> t
ur = n => br => v => bm => f => n > 0 ? br(n - 1)(v(bm)(f)) : bm(f);

// br :: Int -> t2 -> t

// v :: (t3 -> t) -> t3 -> t2

v = bm => f => r => w => bm(x => w(f(x)));



w => m => bind$(M)(m2)(x2 => bind$(M)(m1)(x1 => f2(x2)(x1)));

ur = n => br => f => m => (w => bind$(M)(m)(x => br(n - 1)(w(f)(x))))


br3    = f3 => m3 => m2 => m1 =>    bind$(M)(m3)(x3 => bind$(M)(m2)(x2 => bind$(M)(m1)(x1 => f3(x3)(x2)(x1))));
bh(u3) = f3 => m3 => m2 => m1 => u3(bind$(M)(m3))(f3)(m2)(m1);
u3     = g3 => f3 => m2 => m1 =>    v3(g3)      (x3 => bind$(M)(m2)(x2 => bind$(M)(m1)(x1 => f3(x3)(x2)(x1))))(m2)(m1);
bh(u2) = f2 => m2 => m1 =>                          u2(bind$(M)(m2))(f2)(m1);
u2     = g2 => f2 => m1 =>          v2(g2)                         (x2 => bind$(M)(m1)(x1 => f2    (x2)(x1)))(m1);
bh(u1) = f1 => m1 =>                                                   u1(bind$(M)(m1))(f1);
u1     = g1 => f1 =>                v1(g1)                                            (x1 => f1        (x1))


bh(u1) = f1 => m1 =>                                             u1(bind$(M)(m1))(f1)
u1     = g1 => f1 =>                                          x2 => g1          (x1 => f2(x2)(x1)    )(f1);

br2 =                         bh(u2);
    = f2 => m2 =>             u2(                bind$(M)(m2)                                          )(f2);
u2  = g2 => f2 =>             g2(m1 =>                        x2 => bind$(M)(m1)(x1 => f2(x2)(x1)    ));
    =                                            g2          (bh(u1)(f1)                              );


    =                         g2(m1 => u1(g =>                      bind$(M)(m1)(g                   ))(f1));
u1  = g1 => f1 =>             g1(                                                x1 => f1    (x1)    );


br =        f1 => m2 =>       bh(u2)(f2)(m2)

u1  = 
    =                      u1(f)(g => bind$(M)(m1)(g)                                  )(m2);
    =  f => g1 => m2 => g1(                     x1 => bh(u2)(f(x1))(m2))
u1  = f1 => g1 =>             
bh(u1)(f1)(m1) = u1(f1)(g1 => bind$(M)(m1)(g1                                  ));
g1             =                           x1 => bind$(M)(m2)(x2 => f1    (x2))
f1             =                                                     f(x1)
u1             = ra2
g1  bh(u2)(f2)(m2)
= u2(f2)(g2 =>                                 bind$(M)(m2)(g2))
g2 =                                                        x2 => f2    (x2)
f2 =                                                              f1
u2 = f => r => r()



h3 = f => m1 => m2 => m3 => bind$(M)(m1)(x1 => bind$(M)(m2)(x2 => bind$(M)(m3)(x3 => ret$(M)(f(x1)(x2)(x3)))))

h2 = f => m1 => m2 => bind$(M)(m1)(x1 => bind$(M)(m2)(x2 => ret$(M)(f(x1)(x2))))

h1 = f => m1 => bind$(M)(m1)(x1 => ret$(M)(f(x1)))

h0 = f => ret$(M)(f)

h0 = ret$(M)
hr = r => f => m => bind$(M)(m)(x => r(f)(x))

h1h = f => m1 => hr($compose(h0))(f)(m1)

h2h = f => m1 => m2 => hr(hr($compose(h0))(f)(m1))(f)(m2)

m2 => bind$(M)(m1)(x1 => h1h(f(x1))(m2))
                    =  h1h(h1h(f)(m1))(m2)

h3h = f => m1 => m2 => m3 => bind$(M)(m1)(x1 => h2h(f(x1))(m2)(m3))



rRec = i => x => i >ret$(M)(f(x))
bRec = f => m => bind$(M)(m)(x => f(x));

h1 =                m1 =>       bind$(M)(m1)( x1 => ret$(M)(f(x1)) )
r1 = k1 => v1 => v1(m1 => s1 => bind$(M)(m1)( x1 => k1(s1)(x1)     ))
v1 = g1 => m1 => g1(m1)(s1)
s1 = x1 => $compose(t1)(f) (x1)
k1 = s1 => x1 => s1(x1)
t1 = ret$(M)
h1 = f => r1(s1 => x1 => s1(x1))(g1 => m1 => g1(m1)($compose(ret$(M))(f)))


h2 =          m1 => m2 => bind$(M)(m1)( x1 => bind$(M)(m2)( x2 => ret$(M)(f(x1)(x2)) ) )
r1 = v1 => v1(m1 => s1 => bind$(M)(m1)( s1                                             ))

s1 =                                    x1 => bind$(M)(m2)(x2 => ret$(M)(f(x1)(x2)))
r2 = v2 => v2(m2 => s2 =>                     bind$(M)(m2)(s2)                       )


vv = v => v(m => s => bind$(M)(m)(s))
sk = s => k => f => m => k(g => g(m)(s(f)))
h1 = f => m1 => sk(x => x1 => ret$(M)(f(x1)))(vv())(f)(m1)

h1 = f => m1 => bind$(M)(m1)( x1 => ret$(M)(f(x1)) )
h1 = f => m1 => vv()(g => g(m1)(s1))
s1 = x => x1 => ret$(M)(f(x1))
k1 = vv()
h1 = f => m1 => sk(s1)(k1)(f)(m1)

h1 = sk(s1)(k1)
h1 = f => m => k1(g => g(m)(s(f)))
k1 = vv
s1 = f => $compose(ret$(M))(f)
h1 = sk($compose(ret$(M)))(vv)

h2 = f => m1 => m2 => bind$(M)(m1)( x1 => bind$(M)(m2)( x2 => ret$(M)(f(x1)(x2)) ))
h2 = f => m1 => m2 => bind$(M)(m1)( x1 => vv(g => g(m2)( x2 => ret$(M)(f(x1)(x2)) )))
h2 = f => m1 => m2 => bind$(M)(m1)( x1 => sk( x2 => ret$(M)(f(x1)(x2)) )(vv)(f)(m2)  )
h2 = f => m1 => m2 => vv( g => g(m1)( x1 => sk( x2 => ret$(M)(f(x1)(x2)) )(vv)(f)(m2) ) )
h2 = f => m1 => m2 => sk( x1 => sk( x2 => ret$(M)(f(x1)(x2)) )(vv)(f)(m2) )(vv)(f)(m1)



                                                   
h2 = sk(s)(k)
h2 = f => k(m => g => g(m)(s(f)))

u = m => g => g(m)(s(f))
h2 = f => k(u)

k = u => m1 => u(m1) = g => g(m1)(s(f))
h2 = f => m1 => g => g(m1)(s(f))


                   = m2 => bind$(M)(m1)( x1 => bind$(M)(m2)( x2 => ret$(M)(f(x1)(x2)) ) )
h2 = f => s => m1 => 

                                    v2 = x1 => bind$(M)(m2)( x2 => ret$(M)(f(x1)(x2)) )
h2 = f => s => m1 => m2 => bind$(M)(m1)(v2)
                          v1 = 

k = 
                     hs()
(m => g => g(m)(s(f))) 

k2 = g => 

h2 = f => m1 => bind$(M)(m1)(s2(f))
h2 = hs(s2)
s2 = f => x1 => hs(f => $compose(ret$(M))(f(x1)))
h2 = f => m1 => hs(f => x1 => hs(f => $compose(ret$(M))(f(x1))))

s2 = f => m2 => x1 => bind$(M)(m2)( x2 => ret$(M)(f(x1)(x2)) )
                r1(g2 => m2 => g2(m2)(s(f)))
h2 = hs(f => m2 => x1 => r1(g2 => g2(m2)(($compose(ret$(M))((f(x1)))(f)))))




k = f => s => x => ()
s1 = f => $compose(ret$(M))(f)
sk = f => x1 => k => hs(k(f(x1)))

h1 = hs(s1)

h2 = hs()
s2 = f => r1(g => m2 => g(m2)($compose(ret$(M))(f(x1))))

h2 = f => r1(g1 => m1 => g(m1)(s2(f)))

s2 = x2 => $compose(ret$(M))(f(x1)) (x2)

r2(v2(x1)) = 
v2 = x1 => bind$(M)(m2)(x2 => ret$(M)(f(x1)(x2)))

g2 => m2 => g2(m2)($compose(ret$(M))(f)(x1)))

h2 = f => r1()

r1 = k1 => v1 => v1(m1 => s1 => bind$(M)(m1)( x1 => k1(s1)(x1)                               ))

r1 = k1 => v1 => v1(m1 => s1 => bind$(M)(m1)( x1 => k1(s1)(x1)         ))
k1(s1)(x1) =        m2 =>       bind$(M)(m2)( x2 => ret$(M)(f(x1)(x2)) )

k1(s1)(x1) = r1(k2)(v2)
k1 = s1 => x1 => s1(x1)
s1 => x1 => r1(k2(x1))(v2)
k2 = x1 => s2 => x2 => s2(f(x1)(x2))
s2 = ret$(M)
v2 = 



k1 = r1
s1 = k2
x1 = v2


v1 = g1 => m1 => g1(m1)(s1)
s1 = x1 => $compose(t1)(f) (x1)
t1 
k1 = s1 => x1 => h1(f(x1))(k2)(v2)
t1 = ret$(M)
v2 = g2 => m2 => g2(m2)(s2)
s2 = x2 => $compose(t2)(f) (x2)
k2 = s2 => x2 => 

t1 = f1 => x1 => r2(k2)(v2)
v2 = k2 => g => g(k2)(m2)(s2)
s2 = x2 => $compose(t2)(f1) (x2)
t2 = ret$(M)
f1 = f(x1)
k2 = s2 => x2 => s2(x2)

h2 = f => h1(f)m2 => )
h2 = f => m1 => r1(g => g(m1)(x1 => r1(g => g( x2 => $compose(ret$(M))(f)(x1)(x2) ))))

r1 = f => v1 => m1 => v1(s1 => bind$(M)(m1)( x1 => s1(f(x1)) ))
h2 = r1(f)(g => g(x1 => r1(f1)(g => g($compose(ret$(M)(f1))               ))))

flipRec = M => i => f => i < m ? mx => $compose(flipRec(M)(i + 1))(f)(s => bind$(M)(mx)(x => s(f(x)))) : $compose(ret$(M)(f));


s1 = m2 => x1 => u1 => bind$(M)(m2)(x2 => ret$(M)(u1(x2)))
u1 = f

m1 => m2 => bRec(x1 => bRec(x2 => r(x1)(x2))(m2))(m1)

h = M => i => w => g => i < 3 ? m1 => h(M)(i + 1)(?)(s => bind$(M)(m1)(x1 => w(g)(s)(x1))) ? w(ret$(M))(g)


h(M)(0)(w)(x=>y=>z=>[x,y,z]) :: ([1])([2])([3])

0 < 3 ? m1 => h(M)(1)(?)(s => bind$(M)(m1)(x1 => w(s)(x1))) ? w(ret$(M))(x=>y=>z=>[x,y,z]) :: ([1])([2])([3])
m1 => h(M)(1)(?)(s => bind$(M)(m1)(x1 => w(s)(x1))) :: ([1])([2])([3])
h(M)(1)(?)(s => bind$(M)(m1)(x1 => w(s)(x1))) :: ([2])([3])

1 < 3 ? m2 => h(M)(2)(?)(s => bind$(M)(m2)(x2 => w(s)(x2))) : w(ret$(M))(s => bind$(M)(m1)(x1 => w(s)(x1))) :: ([2])([3])
m2 => h(M)(2)(?)(s => bind$(M)(m2)(x2 => w(s)(x2))) :: ([2])([3])

s => bind$(M)(m1)(x1 => w(s)(x1)               )
s => bind$(M)(m1)(x1 => bind$(M)(m2)(x2 => ...))

w = s => x => 