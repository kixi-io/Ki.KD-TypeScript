/**
 * JQuery-like element search
 *
 * @param id
 */
export const $ = (id: string) => document.getElementById(id);
export const $class = (className: string) => document.getElementsByClassName(className);

export * from './lib//KDInterp';
export * from './lib//KMath';
export * from './lib//List';
export * from './lib//Log';
export * from './lib//Tag';
export * from './lib/KD';
