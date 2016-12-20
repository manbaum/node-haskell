
"use strict"

const defineGet = target => name => get => Object.defineProperty(target, name, { get });
const defineSet = target => name => set => Object.defineProperty(target, name, { set });
const defineValue = target => name => value => Object.defineProperty(target, name, { value });

const makeGet = props => name => get => props[name] = { get };
const makeSet = props => name => set => props[name] = { set };
const makeValue = props => name => value => props[name] = { value };
const defineProps = target => props => Object.defineProperties(target, props);

module.exports = {
	defineGet, defineSet, defineValue,
	  makeGet,   makeSet,   makeValue, defineProps
};
