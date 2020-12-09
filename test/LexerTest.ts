import {QA} from './QA'
import {KD, KDInterp, listOf, log} from "../src";
import {Quantity} from "../src/Quantity";
import {KDate} from "../src/KDate";
import {KDLexer} from "../src/KDLexer";

let qa = new QA("KD")

let lexer = new KDLexer("foo 2010")
qa.equals(["foo", "2010"], lexer.tokens.map(token => token.text))

lexer = new KDLexer("foo http://cnn.com")
qa.equals(["foo", "http://cnn.com"], lexer.tokens.map(token => token.text))

lexer = new KDLexer("2006/5/23")
qa.equals(["2006/5/23"], lexer.tokens.map(token => token.text))

lexer = new KDLexer("2006/5/23 foo")
qa.equals(["2006/5/23", "foo"], lexer.tokens.map(token => token.text))

lexer = new KDLexer("foo 2018/5/23")
qa.equals(["foo", "2018/5/23"], lexer.tokens.map(token => token.text))

qa.summarize()