/**
 * The Ki Standard Library (KSL) includes utility classes and functions.
 */

/**
 * JQuery-like element search
 *
 * @param id
 */
export var $ = (id) => document.getElementById(id);
export var $class = (className) => document.getElementsByClassName(className);

export * from './KMath'
export * from './Log'
export * from './List'

export * from './Array+'
