// Dafny program Domain.dfy compiled into JavaScript
// Copyright by the contributors to the Dafny Project
// SPDX-License-Identifier: MIT

const BigNumber = require('bignumber.js');
BigNumber.config({ MODULO_MODE: BigNumber.EUCLID })
let _dafny = (function() {
  let $module = {};
  $module.areEqual = function(a, b) {
    if (typeof a === 'string' && b instanceof _dafny.Seq) {
      // Seq.equals(string) works as expected,
      // and the catch-all else block handles that direction.
      // But the opposite direction doesn't work; handle it here.
      return b.equals(a);
    } else if (typeof a === 'number' && BigNumber.isBigNumber(b)) {
      // This conditional would be correct even without the `typeof a` part,
      // but in most cases it's probably faster to short-circuit on a `typeof`
      // than to call `isBigNumber`. (But it remains to properly test this.)
      return b.isEqualTo(a);
    } else if (typeof a !== 'object' || a === null || b === null) {
      return a === b;
    } else if (BigNumber.isBigNumber(a)) {
      return a.isEqualTo(b);
    } else if (a._tname !== undefined || (Array.isArray(a) && a.constructor.name == "Array")) {
      return a === b;  // pointer equality
    } else {
      return a.equals(b);  // value-type equality
    }
  }
  $module.toString = function(a) {
    if (a === null) {
      return "null";
    } else if (typeof a === "number") {
      return a.toFixed();
    } else if (BigNumber.isBigNumber(a)) {
      return a.toFixed();
    } else if (a._tname !== undefined) {
      return a._tname;
    } else {
      return a.toString();
    }
  }
  $module.escapeCharacter = function(cp) {
    let s = String.fromCodePoint(cp.value)
    switch (s) {
      case '\n': return "\\n";
      case '\r': return "\\r";
      case '\t': return "\\t";
      case '\0': return "\\0";
      case '\'': return "\\'";
      case '\"': return "\\\"";
      case '\\': return "\\\\";
      default: return s;
    };
  }
  $module.NewObject = function() {
    return { _tname: "object" };
  }
  $module.InstanceOfTrait = function(obj, trait) {
    return obj._parentTraits !== undefined && obj._parentTraits().includes(trait);
  }
  $module.Rtd_bool = class {
    static get Default() { return false; }
  }
  $module.Rtd_char = class {
    static get Default() { return 'D'; }  // See CharType.DefaultValue in Dafny source code
  }
  $module.Rtd_codepoint = class {
    static get Default() { return new _dafny.CodePoint('D'.codePointAt(0)); }
  }
  $module.Rtd_int = class {
    static get Default() { return BigNumber(0); }
  }
  $module.Rtd_number = class {
    static get Default() { return 0; }
  }
  $module.Rtd_ref = class {
    static get Default() { return null; }
  }
  $module.Rtd_array = class {
    static get Default() { return []; }
  }
  $module.ZERO = new BigNumber(0);
  $module.ONE = new BigNumber(1);
  $module.NUMBER_LIMIT = new BigNumber(0x20).multipliedBy(0x1000000000000);  // 2^53
  $module.Tuple = class Tuple extends Array {
    constructor(...elems) {
      super(...elems);
    }
    toString() {
      return "(" + arrayElementsToString(this) + ")";
    }
    equals(other) {
      if (this === other) {
        return true;
      }
      for (let i = 0; i < this.length; i++) {
        if (!_dafny.areEqual(this[i], other[i])) {
          return false;
        }
      }
      return true;
    }
    static Default(...values) {
      return Tuple.of(...values);
    }
    static Rtd(...rtdArgs) {
      return {
        Default: Tuple.from(rtdArgs, rtd => rtd.Default)
      };
    }
  }
  $module.Set = class Set extends Array {
    constructor() {
      super();
    }
    static get Default() {
      return Set.Empty;
    }
    toString() {
      return "{" + arrayElementsToString(this) + "}";
    }
    static get Empty() {
      if (this._empty === undefined) {
        this._empty = new Set();
      }
      return this._empty;
    }
    static fromElements(...elmts) {
      let s = new Set();
      for (let k of elmts) {
        s.add(k);
      }
      return s;
    }
    contains(k) {
      for (let i = 0; i < this.length; i++) {
        if (_dafny.areEqual(this[i], k)) {
          return true;
        }
      }
      return false;
    }
    add(k) {  // mutates the Set; use only during construction
      if (!this.contains(k)) {
        this.push(k);
      }
    }
    equals(other) {
      if (this === other) {
        return true;
      } else if (this.length !== other.length) {
        return false;
      }
      for (let e of this) {
        if (!other.contains(e)) {
          return false;
        }
      }
      return true;
    }
    get Elements() {
      return this;
    }
    Union(that) {
      if (this.length === 0) {
        return that;
      } else if (that.length === 0) {
        return this;
      } else {
        let s = Set.of(...this);
        for (let k of that) {
          s.add(k);
        }
        return s;
      }
    }
    Intersect(that) {
      if (this.length === 0) {
        return this;
      } else if (that.length === 0) {
        return that;
      } else {
        let s = new Set();
        for (let k of this) {
          if (that.contains(k)) {
            s.push(k);
          }
        }
        return s;
      }
    }
    Difference(that) {
      if (this.length == 0 || that.length == 0) {
        return this;
      } else {
        let s = new Set();
        for (let k of this) {
          if (!that.contains(k)) {
            s.push(k);
          }
        }
        return s;
      }
    }
    IsDisjointFrom(that) {
      for (let k of this) {
        if (that.contains(k)) {
          return false;
        }
      }
      return true;
    }
    IsSubsetOf(that) {
      if (that.length < this.length) {
        return false;
      }
      for (let k of this) {
        if (!that.contains(k)) {
          return false;
        }
      }
      return true;
    }
    IsProperSubsetOf(that) {
      if (that.length <= this.length) {
        return false;
      }
      for (let k of this) {
        if (!that.contains(k)) {
          return false;
        }
      }
      return true;
    }
    get AllSubsets() {
      return this.AllSubsets_();
    }
    *AllSubsets_() {
      // Start by putting all set elements into a list, but don't include null
      let elmts = Array.of(...this);
      let n = elmts.length;
      let which = new Array(n);
      which.fill(false);
      let a = [];
      while (true) {
        yield Set.of(...a);
        // "add 1" to "which", as if doing a carry chain.  For every digit changed, change the membership of the corresponding element in "a".
        let i = 0;
        for (; i < n && which[i]; i++) {
          which[i] = false;
          // remove elmts[i] from a
          for (let j = 0; j < a.length; j++) {
            if (_dafny.areEqual(a[j], elmts[i])) {
              // move the last element of a into slot j
              a[j] = a[-1];
              a.pop();
              break;
            }
          }
        }
        if (i === n) {
          // we have cycled through all the subsets
          break;
        }
        which[i] = true;
        a.push(elmts[i]);
      }
    }
  }
  $module.MultiSet = class MultiSet extends Array {
    constructor() {
      super();
    }
    static get Default() {
      return MultiSet.Empty;
    }
    toString() {
      let s = "multiset{";
      let sep = "";
      for (let e of this) {
        let [k, n] = e;
        let ks = _dafny.toString(k);
        while (!n.isZero()) {
          n = n.minus(1);
          s += sep + ks;
          sep = ", ";
        }
      }
      s += "}";
      return s;
    }
    static get Empty() {
      if (this._empty === undefined) {
        this._empty = new MultiSet();
      }
      return this._empty;
    }
    static fromElements(...elmts) {
      let s = new MultiSet();
      for (let e of elmts) {
        s.add(e, _dafny.ONE);
      }
      return s;
    }
    static FromArray(arr) {
      let s = new MultiSet();
      for (let e of arr) {
        s.add(e, _dafny.ONE);
      }
      return s;
    }
    cardinality() {
      let c = _dafny.ZERO;
      for (let e of this) {
        let [k, n] = e;
        c = c.plus(n);
      }
      return c;
    }
    clone() {
      let s = new MultiSet();
      for (let e of this) {
        let [k, n] = e;
        s.push([k, n]);  // make sure to create a new array [k, n] here
      }
      return s;
    }
    findIndex(k) {
      for (let i = 0; i < this.length; i++) {
        if (_dafny.areEqual(this[i][0], k)) {
          return i;
        }
      }
      return this.length;
    }
    get(k) {
      let i = this.findIndex(k);
      if (i === this.length) {
        return _dafny.ZERO;
      } else {
        return this[i][1];
      }
    }
    contains(k) {
      return !this.get(k).isZero();
    }
    add(k, n) {
      let i = this.findIndex(k);
      if (i === this.length) {
        this.push([k, n]);
      } else {
        let m = this[i][1];
        this[i] = [k, m.plus(n)];
      }
    }
    update(k, n) {
      let i = this.findIndex(k);
      if (i < this.length && this[i][1].isEqualTo(n)) {
        return this;
      } else if (i === this.length && n.isZero()) {
        return this;
      } else if (i === this.length) {
        let m = this.slice();
        m.push([k, n]);
        return m;
      } else {
        let m = this.slice();
        m[i] = [k, n];
        return m;
      }
    }
    equals(other) {
      if (this === other) {
        return true;
      }
      for (let e of this) {
        let [k, n] = e;
        let m = other.get(k);
        if (!n.isEqualTo(m)) {
          return false;
        }
      }
      return this.cardinality().isEqualTo(other.cardinality());
    }
    get Elements() {
      return this.Elements_();
    }
    *Elements_() {
      for (let i = 0; i < this.length; i++) {
        let [k, n] = this[i];
        while (!n.isZero()) {
          yield k;
          n = n.minus(1);
        }
      }
    }
    get UniqueElements() {
      return this.UniqueElements_();
    }
    *UniqueElements_() {
      for (let e of this) {
        let [k, n] = e;
        if (!n.isZero()) {
          yield k;
        }
      }
    }
    Union(that) {
      if (this.length === 0) {
        return that;
      } else if (that.length === 0) {
        return this;
      } else {
        let s = this.clone();
        for (let e of that) {
          let [k, n] = e;
          s.add(k, n);
        }
        return s;
      }
    }
    Intersect(that) {
      if (this.length === 0) {
        return this;
      } else if (that.length === 0) {
        return that;
      } else {
        let s = new MultiSet();
        for (let e of this) {
          let [k, n] = e;
          let m = that.get(k);
          if (!m.isZero()) {
            s.push([k, m.isLessThan(n) ? m : n]);
          }
        }
        return s;
      }
    }
    Difference(that) {
      if (this.length === 0 || that.length === 0) {
        return this;
      } else {
        let s = new MultiSet();
        for (let e of this) {
          let [k, n] = e;
          let d = n.minus(that.get(k));
          if (d.isGreaterThan(0)) {
            s.push([k, d]);
          }
        }
        return s;
      }
    }
    IsDisjointFrom(that) {
      let intersection = this.Intersect(that);
      return intersection.cardinality().isZero();
    }
    IsSubsetOf(that) {
      for (let e of this) {
        let [k, n] = e;
        let m = that.get(k);
        if (!n.isLessThanOrEqualTo(m)) {
          return false;
        }
      }
      return true;
    }
    IsProperSubsetOf(that) {
      return this.IsSubsetOf(that) && this.cardinality().isLessThan(that.cardinality());
    }
  }
  $module.CodePoint = class CodePoint {
    constructor(value) {
      this.value = value
    }
    equals(other) {
      if (this === other) {
        return true;
      }
      return this.value === other.value
    }
    isLessThan(other) {
      return this.value < other.value
    }
    isLessThanOrEqual(other) {
      return this.value <= other.value
    }
    toString() {
      return "'" + $module.escapeCharacter(this) + "'";
    }
    static isCodePoint(i) {
      return (
        (_dafny.ZERO.isLessThanOrEqualTo(i) && i.isLessThan(new BigNumber(0xD800))) ||
        (new BigNumber(0xE000).isLessThanOrEqualTo(i) && i.isLessThan(new BigNumber(0x11_0000))))
    }
  }
  $module.Seq = class Seq extends Array {
    constructor(...elems) {
      super(...elems);
    }
    static get Default() {
      return Seq.of();
    }
    static Create(n, init) {
      return Seq.from({length: n}, (_, i) => init(new BigNumber(i)));
    }
    static UnicodeFromString(s) {
      return new Seq(...([...s].map(c => new _dafny.CodePoint(c.codePointAt(0)))))
    }
    toString() {
      return "[" + arrayElementsToString(this) + "]";
    }
    toVerbatimString(asLiteral) {
      if (asLiteral) {
        return '"' + this.map(c => _dafny.escapeCharacter(c)).join("") + '"';
      } else {
        return this.map(c => String.fromCodePoint(c.value)).join("");
      }
    }
    static update(s, i, v) {
      if (typeof s === "string") {
        let p = s.slice(0, i);
        let q = s.slice(i.toNumber() + 1);
        return p.concat(v, q);
      } else {
        let t = s.slice();
        t[i] = v;
        return t;
      }
    }
    equals(other) {
      if (this === other) {
        return true;
      } else if (this.length !== other.length) {
        return false;
      }
      for (let i = 0; i < this.length; i++) {
        if (!_dafny.areEqual(this[i], other[i])) {
          return false;
        }
      }
      return true;
    }
    static contains(s, k) {
      if (typeof s === "string") {
        return s.includes(k);
      } else {
        for (let x of s) {
          if (_dafny.areEqual(x, k)) {
            return true;
          }
        }
        return false;
      }
    }
    get Elements() {
      return this;
    }
    get UniqueElements() {
      return _dafny.Set.fromElements(...this);
    }
    static Concat(a, b) {
      if (typeof a === "string" || typeof b === "string") {
        // string concatenation, so make sure both operands are strings before concatenating
        if (typeof a !== "string") {
          // a must be a Seq
          a = a.join("");
        }
        if (typeof b !== "string") {
          // b must be a Seq
          b = b.join("");
        }
        return a + b;
      } else {
        // ordinary concatenation
        let r = Seq.of(...a);
        r.push(...b);
        return r;
      }
    }
    static JoinIfPossible(x) {
      try { return x.join(""); } catch(_error) { return x; }
    }
    static IsPrefixOf(a, b) {
      if (b.length < a.length) {
        return false;
      }
      for (let i = 0; i < a.length; i++) {
        if (!_dafny.areEqual(a[i], b[i])) {
          return false;
        }
      }
      return true;
    }
    static IsProperPrefixOf(a, b) {
      if (b.length <= a.length) {
        return false;
      }
      for (let i = 0; i < a.length; i++) {
        if (!_dafny.areEqual(a[i], b[i])) {
          return false;
        }
      }
      return true;
    }
  }
  $module.Map = class Map extends Array {
    constructor() {
      super();
    }
    static get Default() {
      return Map.of();
    }
    toString() {
      return "map[" + this.map(maplet => _dafny.toString(maplet[0]) + " := " + _dafny.toString(maplet[1])).join(", ") + "]";
    }
    static get Empty() {
      if (this._empty === undefined) {
        this._empty = new Map();
      }
      return this._empty;
    }
    findIndex(k) {
      for (let i = 0; i < this.length; i++) {
        if (_dafny.areEqual(this[i][0], k)) {
          return i;
        }
      }
      return this.length;
    }
    get(k) {
      let i = this.findIndex(k);
      if (i === this.length) {
        return undefined;
      } else {
        return this[i][1];
      }
    }
    contains(k) {
      return this.findIndex(k) < this.length;
    }
    update(k, v) {
      let m = this.slice();
      m.updateUnsafe(k, v);
      return m;
    }
    // Similar to update, but make the modification in-place.
    // Meant to be used in the map constructor.
    updateUnsafe(k, v) {
      let m = this;
      let i = m.findIndex(k);
      m[i] = [k, v];
      return m;
    }
    equals(other) {
      if (this === other) {
        return true;
      } else if (this.length !== other.length) {
        return false;
      }
      for (let e of this) {
        let [k, v] = e;
        let w = other.get(k);
        if (w === undefined || !_dafny.areEqual(v, w)) {
          return false;
        }
      }
      return true;
    }
    get Keys() {
      let s = new _dafny.Set();
      for (let e of this) {
        let [k, v] = e;
        s.push(k);
      }
      return s;
    }
    get Values() {
      let s = new _dafny.Set();
      for (let e of this) {
        let [k, v] = e;
        s.add(v);
      }
      return s;
    }
    get Items() {
      let s = new _dafny.Set();
      for (let e of this) {
        let [k, v] = e;
        s.push(_dafny.Tuple.of(k, v));
      }
      return s;
    }
    Merge(that) {
      let m = that.slice();
      for (let e of this) {
        let [k, v] = e;
        let i = m.findIndex(k);
        if (i == m.length) {
          m[i] = [k, v];
        }
      }
      return m;
    }
    Subtract(keys) {
      if (this.length === 0 || keys.length === 0) {
        return this;
      }
      let m = new Map();
      for (let e of this) {
        let [k, v] = e;
        if (!keys.contains(k)) {
          m[m.length] = e;
        }
      }
      return m;
    }
  }
  $module.newArray = function(initValue, ...dims) {
    return { dims: dims, elmts: buildArray(initValue, ...dims) };
  }
  $module.BigOrdinal = class BigOrdinal {
    static get Default() {
      return _dafny.ZERO;
    }
    static IsLimit(ord) {
      return ord.isZero();
    }
    static IsSucc(ord) {
      return ord.isGreaterThan(0);
    }
    static Offset(ord) {
      return ord;
    }
    static IsNat(ord) {
      return true;  // at run time, every ORDINAL is a natural number
    }
  }
  $module.BigRational = class BigRational {
    static get ZERO() {
      if (this._zero === undefined) {
        this._zero = new BigRational(_dafny.ZERO);
      }
      return this._zero;
    }
    constructor (n, d) {
      // requires d === undefined || 1 <= d
      this.num = n;
      this.den = d === undefined ? _dafny.ONE : d;
      // invariant 1 <= den || (num == 0 && den == 0)
    }
    static get Default() {
      return _dafny.BigRational.ZERO;
    }
    // We need to deal with the special case `num == 0 && den == 0`, because
    // that's what C#'s default struct constructor will produce for BigRational. :(
    // To deal with it, we ignore `den` when `num` is 0.
    toString() {
      if (this.num.isZero() || this.den.isEqualTo(1)) {
        return this.num.toFixed() + ".0";
      }
      let answer = this.dividesAPowerOf10(this.den);
      if (answer !== undefined) {
        let n = this.num.multipliedBy(answer[0]);
        let log10 = answer[1];
        let sign, digits;
        if (this.num.isLessThan(0)) {
          sign = "-"; digits = n.negated().toFixed();
        } else {
          sign = ""; digits = n.toFixed();
        }
        if (log10 < digits.length) {
          let digitCount = digits.length - log10;
          return sign + digits.slice(0, digitCount) + "." + digits.slice(digitCount);
        } else {
          return sign + "0." + "0".repeat(log10 - digits.length) + digits;
        }
      } else {
        return "(" + this.num.toFixed() + ".0 / " + this.den.toFixed() + ".0)";
      }
    }
    isPowerOf10(x) {
      if (x.isZero()) {
        return undefined;
      }
      let log10 = 0;
      while (true) {  // invariant: x != 0 && x * 10^log10 == old(x)
        if (x.isEqualTo(1)) {
          return log10;
        } else if (x.mod(10).isZero()) {
          log10++;
          x = x.dividedToIntegerBy(10);
        } else {
          return undefined;
        }
      }
    }
    dividesAPowerOf10(i) {
      let factor = _dafny.ONE;
      let log10 = 0;
      if (i.isLessThanOrEqualTo(_dafny.ZERO)) {
        return undefined;
      }

      // invariant: 1 <= i && i * 10^log10 == factor * old(i)
      while (i.mod(10).isZero()) {
        i = i.dividedToIntegerBy(10);
       log10++;
      }

      while (i.mod(5).isZero()) {
        i = i.dividedToIntegerBy(5);
        factor = factor.multipliedBy(2);
        log10++;
      }
      while (i.mod(2).isZero()) {
        i = i.dividedToIntegerBy(2);
        factor = factor.multipliedBy(5);
        log10++;
      }

      if (i.isEqualTo(_dafny.ONE)) {
        return [factor, log10];
      } else {
        return undefined;
      }
    }
    toBigNumber() {
      if (this.num.isZero() || this.den.isEqualTo(1)) {
        return this.num;
      } else if (this.num.isGreaterThan(0)) {
        return this.num.dividedToIntegerBy(this.den);
      } else {
        return this.num.minus(this.den).plus(1).dividedToIntegerBy(this.den);
      }
    }
    isInteger() {
      return this.equals(new _dafny.BigRational(this.toBigNumber(), _dafny.ONE));
    }
    // Returns values such that aa/dd == a and bb/dd == b.
    normalize(b) {
      let a = this;
      let aa, bb, dd;
      if (a.num.isZero()) {
        aa = a.num;
        bb = b.num;
        dd = b.den;
      } else if (b.num.isZero()) {
        aa = a.num;
        dd = a.den;
        bb = b.num;
      } else {
        let gcd = BigNumberGcd(a.den, b.den);
        let xx = a.den.dividedToIntegerBy(gcd);
        let yy = b.den.dividedToIntegerBy(gcd);
        // We now have a == a.num / (xx * gcd) and b == b.num / (yy * gcd).
        aa = a.num.multipliedBy(yy);
        bb = b.num.multipliedBy(xx);
        dd = a.den.multipliedBy(yy);
      }
      return [aa, bb, dd];
    }
    compareTo(that) {
      // simple things first
      let asign = this.num.isZero() ? 0 : this.num.isLessThan(0) ? -1 : 1;
      let bsign = that.num.isZero() ? 0 : that.num.isLessThan(0) ? -1 : 1;
      if (asign < 0 && 0 <= bsign) {
        return -1;
      } else if (asign <= 0 && 0 < bsign) {
        return -1;
      } else if (bsign < 0 && 0 <= asign) {
        return 1;
      } else if (bsign <= 0 && 0 < asign) {
        return 1;
      }
      let [aa, bb, dd] = this.normalize(that);
      if (aa.isLessThan(bb)) {
        return -1;
      } else if (aa.isEqualTo(bb)){
        return 0;
      } else {
        return 1;
      }
    }
    equals(that) {
      return this.compareTo(that) === 0;
    }
    isLessThan(that) {
      return this.compareTo(that) < 0;
    }
    isAtMost(that) {
      return this.compareTo(that) <= 0;
    }
    plus(b) {
      let [aa, bb, dd] = this.normalize(b);
      return new BigRational(aa.plus(bb), dd);
    }
    minus(b) {
      let [aa, bb, dd] = this.normalize(b);
      return new BigRational(aa.minus(bb), dd);
    }
    negated() {
      return new BigRational(this.num.negated(), this.den);
    }
    multipliedBy(b) {
      return new BigRational(this.num.multipliedBy(b.num), this.den.multipliedBy(b.den));
    }
    dividedBy(b) {
      let a = this;
      // Compute the reciprocal of b
      let bReciprocal;
      if (b.num.isGreaterThan(0)) {
        bReciprocal = new BigRational(b.den, b.num);
      } else {
        // this is the case b.num < 0
        bReciprocal = new BigRational(b.den.negated(), b.num.negated());
      }
      return a.multipliedBy(bReciprocal);
    }
  }
  $module.EuclideanDivisionNumber = function(a, b) {
    if (0 <= a) {
      if (0 <= b) {
        // +a +b: a/b
        return Math.floor(a / b);
      } else {
        // +a -b: -(a/(-b))
        return -Math.floor(a / -b);
      }
    } else {
      if (0 <= b) {
        // -a +b: -((-a-1)/b) - 1
        return -Math.floor((-a-1) / b) - 1;
      } else {
        // -a -b: ((-a-1)/(-b)) + 1
        return Math.floor((-a-1) / -b) + 1;
      }
    }
  }
  $module.EuclideanDivision = function(a, b) {
    if (a.isGreaterThanOrEqualTo(0)) {
      if (b.isGreaterThanOrEqualTo(0)) {
        // +a +b: a/b
        return a.dividedToIntegerBy(b);
      } else {
        // +a -b: -(a/(-b))
        return a.dividedToIntegerBy(b.negated()).negated();
      }
    } else {
      if (b.isGreaterThanOrEqualTo(0)) {
        // -a +b: -((-a-1)/b) - 1
        return a.negated().minus(1).dividedToIntegerBy(b).negated().minus(1);
      } else {
        // -a -b: ((-a-1)/(-b)) + 1
        return a.negated().minus(1).dividedToIntegerBy(b.negated()).plus(1);
      }
    }
  }
  $module.EuclideanModuloNumber = function(a, b) {
    let bp = Math.abs(b);
    if (0 <= a) {
      // +a: a % bp
      return a % bp;
    } else {
      // c = ((-a) % bp)
      // -a: bp - c if c > 0
      // -a: 0 if c == 0
      let c = (-a) % bp;
      return c === 0 ? c : bp - c;
    }
  }
  $module.ShiftLeft = function(b, n) {
    return b.multipliedBy(new BigNumber(2).exponentiatedBy(n));
  }
  $module.ShiftRight = function(b, n) {
    return b.dividedToIntegerBy(new BigNumber(2).exponentiatedBy(n));
  }
  $module.RotateLeft = function(b, n, w) {  // truncate(b << n) | (b >> (w - n))
    let x = _dafny.ShiftLeft(b, n).mod(new BigNumber(2).exponentiatedBy(w));
    let y = _dafny.ShiftRight(b, w - n);
    return x.plus(y);
  }
  $module.RotateRight = function(b, n, w) {  // (b >> n) | truncate(b << (w - n))
    let x = _dafny.ShiftRight(b, n);
    let y = _dafny.ShiftLeft(b, w - n).mod(new BigNumber(2).exponentiatedBy(w));;
    return x.plus(y);
  }
  $module.BitwiseAnd = function(a, b) {
    let r = _dafny.ZERO;
    const m = _dafny.NUMBER_LIMIT;  // 2^53
    let h = _dafny.ONE;
    while (!a.isZero() && !b.isZero()) {
      let a0 = a.mod(m);
      let b0 = b.mod(m);
      r = r.plus(h.multipliedBy(a0 & b0));
      a = a.dividedToIntegerBy(m);
      b = b.dividedToIntegerBy(m);
      h = h.multipliedBy(m);
    }
    return r;
  }
  $module.BitwiseOr = function(a, b) {
    let r = _dafny.ZERO;
    const m = _dafny.NUMBER_LIMIT;  // 2^53
    let h = _dafny.ONE;
    while (!a.isZero() && !b.isZero()) {
      let a0 = a.mod(m);
      let b0 = b.mod(m);
      r = r.plus(h.multipliedBy(a0 | b0));
      a = a.dividedToIntegerBy(m);
      b = b.dividedToIntegerBy(m);
      h = h.multipliedBy(m);
    }
    r = r.plus(h.multipliedBy(a | b));
    return r;
  }
  $module.BitwiseXor = function(a, b) {
    let r = _dafny.ZERO;
    const m = _dafny.NUMBER_LIMIT;  // 2^53
    let h = _dafny.ONE;
    while (!a.isZero() && !b.isZero()) {
      let a0 = a.mod(m);
      let b0 = b.mod(m);
      r = r.plus(h.multipliedBy(a0 ^ b0));
      a = a.dividedToIntegerBy(m);
      b = b.dividedToIntegerBy(m);
      h = h.multipliedBy(m);
    }
    r = r.plus(h.multipliedBy(a | b));
    return r;
  }
  $module.BitwiseNot = function(a, bits) {
    let r = _dafny.ZERO;
    let h = _dafny.ONE;
    for (let i = 0; i < bits; i++) {
      let bit = a.mod(2);
      if (bit.isZero()) {
        r = r.plus(h);
      }
      a = a.dividedToIntegerBy(2);
      h = h.multipliedBy(2);
    }
    return r;
  }
  $module.Quantifier = function(vals, frall, pred) {
    for (let u of vals) {
      if (pred(u) !== frall) { return !frall; }
    }
    return frall;
  }
  $module.PlusChar = function(a, b) {
    return String.fromCharCode(a.charCodeAt(0) + b.charCodeAt(0));
  }
  $module.UnicodePlusChar = function(a, b) {
    return new _dafny.CodePoint(a.value + b.value);
  }
  $module.MinusChar = function(a, b) {
    return String.fromCharCode(a.charCodeAt(0) - b.charCodeAt(0));
  }
  $module.UnicodeMinusChar = function(a, b) {
    return new _dafny.CodePoint(a.value - b.value);
  }
  $module.AllBooleans = function*() {
    yield false;
    yield true;
  }
  $module.AllChars = function*() {
    for (let i = 0; i < 0x10000; i++) {
      yield String.fromCharCode(i);
    }
  }
  $module.AllUnicodeChars = function*() {
    for (let i = 0; i < 0xD800; i++) {
      yield new _dafny.CodePoint(i);
    }
    for (let i = 0xE0000; i < 0x110000; i++) {
      yield new _dafny.CodePoint(i);
    }
  }
  $module.AllIntegers = function*() {
    yield _dafny.ZERO;
    for (let j = _dafny.ONE;; j = j.plus(1)) {
      yield j;
      yield j.negated();
    }
  }
  $module.IntegerRange = function*(lo, hi) {
    if (lo === null) {
      while (true) {
        hi = hi.minus(1);
        yield hi;
      }
    } else if (hi === null) {
      while (true) {
        yield lo;
        lo = lo.plus(1);
      }
    } else {
      while (lo.isLessThan(hi)) {
        yield lo;
        lo = lo.plus(1);
      }
    }
  }
  $module.SingleValue = function*(v) {
    yield v;
  }
  $module.HaltException = class HaltException extends Error {
    constructor(message) {
      super(message)
    }
  }
  $module.HandleHaltExceptions = function(f) {
    try {
      f()
    } catch (e) {
      if (e instanceof _dafny.HaltException) {
        process.stdout.write("[Program halted] " + e.message + "\n")
        process.exitCode = 1
      } else {
        throw e
      }
    }
  }
  $module.FromMainArguments = function(args) {
    var a = [...args];
    a.splice(0, 2, args[0] + " " + args[1]);
    return a;
  }
  $module.UnicodeFromMainArguments = function(args) {
    return $module.FromMainArguments(args).map(_dafny.Seq.UnicodeFromString);
  }
  return $module;

  // What follows are routines private to the Dafny runtime
  function buildArray(initValue, ...dims) {
    if (dims.length === 0) {
      return initValue;
    } else {
      let a = Array(dims[0].toNumber());
      let b = Array.from(a, (x) => buildArray(initValue, ...dims.slice(1)));
      return b;
    }
  }
  function arrayElementsToString(a) {
    // like `a.join(", ")`, but calling _dafny.toString(x) on every element x instead of x.toString()
    let s = "";
    let sep = "";
    for (let x of a) {
      s += sep + _dafny.toString(x);
      sep = ", ";
    }
    return s;
  }
  function BigNumberGcd(a, b){  // gcd of two non-negative BigNumber's
    while (true) {
      if (a.isZero()) {
        return b;
      } else if (b.isZero()) {
        return a;
      }
      if (a.isLessThan(b)) {
        b = b.modulo(a);
      } else {
        a = a.modulo(b);
      }
    }
  }
})();
// Dafny program systemModulePopulator.dfy compiled into JavaScript
let _System = (function() {
  let $module = {};

  $module.nat = class nat {
    constructor () {
    }
    static get Default() {
      return _dafny.ZERO;
    }
    static _Is(__source) {
      let _0_x = (__source);
      return (_dafny.ZERO).isLessThanOrEqualTo(_0_x);
    }
  };

  return $module;
})(); // end of module _System
let SwissDomain = (function() {
  let $module = {};

  $module.__default = class __default {
    constructor () {
      this._tname = "SwissDomain._default";
    }
    _parentTraits() {
      return [];
    }
    static CurrentRound(m) {
      return (new BigNumber(((m).dtor_completedRounds).length)).plus(((((m).dtor_activeRound).is_Some) ? (_dafny.ONE) : (_dafny.ZERO)));
    };
    static ColorDiff(p) {
      return ((p).dtor_whiteCount).minus((p).dtor_blackCount);
    };
    static MustPlayBlack(p) {
      return ((SwissDomain.__default.ColorDiff(p)).isEqualTo(new BigNumber(2))) || ((((new BigNumber(2)).isLessThanOrEqualTo(new BigNumber(((p).dtor_colorHistory).length))) && (_dafny.areEqual(((p).dtor_colorHistory)[(new BigNumber(((p).dtor_colorHistory).length)).minus(_dafny.ONE)], SwissDomain.Color.create_White()))) && (_dafny.areEqual(((p).dtor_colorHistory)[(new BigNumber(((p).dtor_colorHistory).length)).minus(new BigNumber(2))], SwissDomain.Color.create_White())));
    };
    static MustPlayWhite(p) {
      return ((SwissDomain.__default.ColorDiff(p)).isEqualTo(new BigNumber(-2))) || ((((new BigNumber(2)).isLessThanOrEqualTo(new BigNumber(((p).dtor_colorHistory).length))) && (_dafny.areEqual(((p).dtor_colorHistory)[(new BigNumber(((p).dtor_colorHistory).length)).minus(_dafny.ONE)], SwissDomain.Color.create_Black()))) && (_dafny.areEqual(((p).dtor_colorHistory)[(new BigNumber(((p).dtor_colorHistory).length)).minus(new BigNumber(2))], SwissDomain.Color.create_Black())));
    };
    static PreferredColor(p) {
      if (((p).dtor_whiteCount).isLessThan((p).dtor_blackCount)) {
        return SwissDomain.Color.create_White();
      } else if (((p).dtor_blackCount).isLessThan((p).dtor_whiteCount)) {
        return SwissDomain.Color.create_Black();
      } else if ((new BigNumber(((p).dtor_colorHistory).length)).isEqualTo(_dafny.ZERO)) {
        return SwissDomain.Color.create_White();
      } else if (_dafny.areEqual(((p).dtor_colorHistory)[(new BigNumber(((p).dtor_colorHistory).length)).minus(_dafny.ONE)], SwissDomain.Color.create_White())) {
        return SwissDomain.Color.create_Black();
      } else {
        return SwissDomain.Color.create_White();
      }
    };
    static ChooseColors(p1idx, p2idx, p1, p2) {
      if ((SwissDomain.__default.MustPlayWhite(p1)) || (SwissDomain.__default.MustPlayBlack(p2))) {
        return SwissDomain.Pairing.create_Pairing(p1idx, p2idx);
      } else if ((SwissDomain.__default.MustPlayBlack(p1)) || (SwissDomain.__default.MustPlayWhite(p2))) {
        return SwissDomain.Pairing.create_Pairing(p2idx, p1idx);
      } else if (_dafny.areEqual(SwissDomain.__default.PreferredColor(p1), SwissDomain.Color.create_White())) {
        return SwissDomain.Pairing.create_Pairing(p1idx, p2idx);
      } else {
        return SwissDomain.Pairing.create_Pairing(p2idx, p1idx);
      }
    };
    static WhiteScore(r) {
      let _source0 = r;
      {
        if (_source0.is_WhiteWins) {
          return new BigNumber(2);
        }
      }
      {
        if (_source0.is_Draw) {
          return _dafny.ONE;
        }
      }
      {
        return _dafny.ZERO;
      }
    };
    static BlackScore(r) {
      let _source0 = r;
      {
        if (_source0.is_BlackWins) {
          return new BigNumber(2);
        }
      }
      {
        if (_source0.is_Draw) {
          return _dafny.ONE;
        }
      }
      {
        return _dafny.ZERO;
      }
    };
    static ValidPairingsForModel(m, pairings, bye) {
      return (((((_dafny.Quantifier((pairings).UniqueElements, true, function (_forall_var_0) {
        let _0_p = _forall_var_0;
        return !(_dafny.Seq.contains(pairings, _0_p)) || (((((_0_p).dtor_whiteIdx).isLessThan(new BigNumber(((m).dtor_participants).length))) && (((_0_p).dtor_blackIdx).isLessThan(new BigNumber(((m).dtor_participants).length)))) && (!((_0_p).dtor_whiteIdx).isEqualTo((_0_p).dtor_blackIdx)));
      })) && (_dafny.Quantifier(_dafny.IntegerRange(_dafny.ZERO, new BigNumber((pairings).length)), true, function (_forall_var_1) {
        let _1_i = _forall_var_1;
        return _dafny.Quantifier(_dafny.IntegerRange((_1_i).plus(_dafny.ONE), new BigNumber((pairings).length)), true, function (_forall_var_2) {
          let _2_j = _forall_var_2;
          return !((((_dafny.ZERO).isLessThanOrEqualTo(_1_i)) && ((_1_i).isLessThan(_2_j))) && ((_2_j).isLessThan(new BigNumber((pairings).length)))) || ((((!(((pairings)[_1_i]).dtor_whiteIdx).isEqualTo(((pairings)[_2_j]).dtor_whiteIdx)) && (!(((pairings)[_1_i]).dtor_whiteIdx).isEqualTo(((pairings)[_2_j]).dtor_blackIdx))) && (!(((pairings)[_1_i]).dtor_blackIdx).isEqualTo(((pairings)[_2_j]).dtor_whiteIdx))) && (!(((pairings)[_1_i]).dtor_blackIdx).isEqualTo(((pairings)[_2_j]).dtor_blackIdx)));
        });
      }))) && (_dafny.Quantifier((pairings).UniqueElements, true, function (_forall_var_3) {
        let _3_p = _forall_var_3;
        return !(_dafny.Seq.contains(pairings, _3_p)) || ((!(((((m).dtor_participants)[(_3_p).dtor_whiteIdx]).dtor_opponents).contains((_3_p).dtor_blackIdx))) && (!(((((m).dtor_participants)[(_3_p).dtor_blackIdx]).dtor_opponents).contains((_3_p).dtor_whiteIdx))));
      }))) && (!((bye).is_Some) || (((((bye).dtor_value).isLessThan(new BigNumber(((m).dtor_participants).length))) && (!((((m).dtor_participants)[(bye).dtor_value]).dtor_byeReceived))) && (_dafny.Quantifier((pairings).UniqueElements, true, function (_forall_var_4) {
        let _4_p = _forall_var_4;
        return !(_dafny.Seq.contains(pairings, _4_p)) || ((!((_4_p).dtor_whiteIdx).isEqualTo((bye).dtor_value)) && (!((_4_p).dtor_blackIdx).isEqualTo((bye).dtor_value)));
      }))))) && ((((new BigNumber(((m).dtor_participants).length)).mod(new BigNumber(2))).isEqualTo(_dafny.ONE)) === ((bye).is_Some))) && ((((new BigNumber(2)).multipliedBy(new BigNumber((pairings).length))).plus((((bye).is_Some) ? (_dafny.ONE) : (_dafny.ZERO)))).isEqualTo(new BigNumber(((m).dtor_participants).length)));
    };
    static AllRecorded(results) {
      return _dafny.Quantifier(_dafny.IntegerRange(_dafny.ZERO, new BigNumber((results).length)), true, function (_forall_var_0) {
        let _0_i = _forall_var_0;
        return !(((_dafny.ZERO).isLessThanOrEqualTo(_0_i)) && ((_0_i).isLessThan(new BigNumber((results).length)))) || (((results)[_0_i]).is_Some);
      });
    };
    static Init() {
      return SwissDomain.Model.create_Model(SwissDomain.Phase.create_Setup(), _dafny.Seq.of(), new BigNumber(5), _dafny.Seq.of(), SwissDomain.Option.create_None());
    };
    static Normalize(m) {
      return m;
    };
    static ExtractResults(results) {
      let _0___accumulator = _dafny.Seq.of();
      TAIL_CALL_START: while (true) {
        if ((new BigNumber((results).length)).isEqualTo(_dafny.ZERO)) {
          return _dafny.Seq.Concat(_0___accumulator, _dafny.Seq.of());
        } else {
          _0___accumulator = _dafny.Seq.Concat(_0___accumulator, _dafny.Seq.of(((results)[_dafny.ZERO]).dtor_value));
          let _in0 = (results).slice(_dafny.ONE);
          results = _in0;
          continue TAIL_CALL_START;
        }
      }
    };
    static UpdateStats(p, idx, pairings, bye, results) {
      if (((bye).is_Some) && (((bye).dtor_value).isEqualTo(idx))) {
        let _0_dt__update__tmp_h0 = p;
        let _1_dt__update_hbyeReceived_h0 = true;
        let _2_dt__update_hscore2x_h0 = ((p).dtor_score2x).plus(new BigNumber(2));
        return SwissDomain.Participant.create_Participant((_0_dt__update__tmp_h0).dtor_name, _2_dt__update_hscore2x_h0, (_0_dt__update__tmp_h0).dtor_whiteCount, (_0_dt__update__tmp_h0).dtor_blackCount, (_0_dt__update__tmp_h0).dtor_colorHistory, _1_dt__update_hbyeReceived_h0, (_0_dt__update__tmp_h0).dtor_opponents);
      } else {
        return SwissDomain.__default.UpdateStatsFromPairings(p, idx, pairings, results, _dafny.ZERO);
      }
    };
    static UpdateStatsFromPairings(p, idx, pairings, results, i) {
      TAIL_CALL_START: while (true) {
        if ((new BigNumber((pairings).length)).isLessThanOrEqualTo(i)) {
          return p;
        } else if ((((pairings)[i]).dtor_whiteIdx).isEqualTo(idx)) {
          let _0_dt__update__tmp_h0 = p;
          let _1_dt__update_hcolorHistory_h0 = _dafny.Seq.Concat((p).dtor_colorHistory, _dafny.Seq.of(SwissDomain.Color.create_White()));
          let _2_dt__update_hwhiteCount_h0 = ((p).dtor_whiteCount).plus(_dafny.ONE);
          let _3_dt__update_hscore2x_h0 = ((p).dtor_score2x).plus(SwissDomain.__default.WhiteScore((results)[i]));
          return SwissDomain.Participant.create_Participant((_0_dt__update__tmp_h0).dtor_name, _3_dt__update_hscore2x_h0, _2_dt__update_hwhiteCount_h0, (_0_dt__update__tmp_h0).dtor_blackCount, _1_dt__update_hcolorHistory_h0, (_0_dt__update__tmp_h0).dtor_byeReceived, (_0_dt__update__tmp_h0).dtor_opponents);
        } else if ((((pairings)[i]).dtor_blackIdx).isEqualTo(idx)) {
          let _4_dt__update__tmp_h1 = p;
          let _5_dt__update_hcolorHistory_h1 = _dafny.Seq.Concat((p).dtor_colorHistory, _dafny.Seq.of(SwissDomain.Color.create_Black()));
          let _6_dt__update_hblackCount_h0 = ((p).dtor_blackCount).plus(_dafny.ONE);
          let _7_dt__update_hscore2x_h1 = ((p).dtor_score2x).plus(SwissDomain.__default.BlackScore((results)[i]));
          return SwissDomain.Participant.create_Participant((_4_dt__update__tmp_h1).dtor_name, _7_dt__update_hscore2x_h1, (_4_dt__update__tmp_h1).dtor_whiteCount, _6_dt__update_hblackCount_h0, _5_dt__update_hcolorHistory_h1, (_4_dt__update__tmp_h1).dtor_byeReceived, (_4_dt__update__tmp_h1).dtor_opponents);
        } else {
          let _in0 = p;
          let _in1 = idx;
          let _in2 = pairings;
          let _in3 = results;
          let _in4 = (i).plus(_dafny.ONE);
          p = _in0;
          idx = _in1;
          pairings = _in2;
          results = _in3;
          i = _in4;
          continue TAIL_CALL_START;
        }
      }
    };
    static AddPairingOpponents(participants, w, b) {
      let _pat_let_tv0 = participants;
      let _pat_let_tv1 = w;
      let _pat_let_tv2 = b;
      let _pat_let_tv3 = participants;
      let _pat_let_tv4 = b;
      let _pat_let_tv5 = w;
      let _0_pw = function (_pat_let0_0) {
        return function (_1_dt__update__tmp_h0) {
          return function (_pat_let1_0) {
            return function (_2_dt__update_hopponents_h0) {
              return SwissDomain.Participant.create_Participant((_1_dt__update__tmp_h0).dtor_name, (_1_dt__update__tmp_h0).dtor_score2x, (_1_dt__update__tmp_h0).dtor_whiteCount, (_1_dt__update__tmp_h0).dtor_blackCount, (_1_dt__update__tmp_h0).dtor_colorHistory, (_1_dt__update__tmp_h0).dtor_byeReceived, _2_dt__update_hopponents_h0);
            }(_pat_let1_0);
          }((((_pat_let_tv0)[_pat_let_tv1]).dtor_opponents).Union(_dafny.Set.fromElements(_pat_let_tv2)));
        }(_pat_let0_0);
      }((participants)[w]);
      let _3_pb = function (_pat_let2_0) {
        return function (_4_dt__update__tmp_h1) {
          return function (_pat_let3_0) {
            return function (_5_dt__update_hopponents_h1) {
              return SwissDomain.Participant.create_Participant((_4_dt__update__tmp_h1).dtor_name, (_4_dt__update__tmp_h1).dtor_score2x, (_4_dt__update__tmp_h1).dtor_whiteCount, (_4_dt__update__tmp_h1).dtor_blackCount, (_4_dt__update__tmp_h1).dtor_colorHistory, (_4_dt__update__tmp_h1).dtor_byeReceived, _5_dt__update_hopponents_h1);
            }(_pat_let3_0);
          }((((_pat_let_tv3)[_pat_let_tv4]).dtor_opponents).Union(_dafny.Set.fromElements(_pat_let_tv5)));
        }(_pat_let2_0);
      }((participants)[b]);
      return _dafny.Seq.update(_dafny.Seq.update(participants, w, _0_pw), b, _3_pb);
    };
    static AddAllOpponents(participants, pairings, i) {
      TAIL_CALL_START: while (true) {
        if ((new BigNumber((pairings).length)).isLessThanOrEqualTo(i)) {
          return participants;
        } else {
          let _0_w = ((pairings)[i]).dtor_whiteIdx;
          let _1_b = ((pairings)[i]).dtor_blackIdx;
          let _2_ps = SwissDomain.__default.AddPairingOpponents(participants, _0_w, _1_b);
          let _in0 = _2_ps;
          let _in1 = pairings;
          let _in2 = (i).plus(_dafny.ONE);
          participants = _in0;
          pairings = _in1;
          i = _in2;
          continue TAIL_CALL_START;
        }
      }
    };
    static UpdateAllParticipants(participants, pairings, bye, results) {
      let _0_withStats = _dafny.Seq.Create(new BigNumber((participants).length), ((_1_participants, _2_pairings, _3_bye, _4_results) => function (_5_i) {
        return SwissDomain.__default.UpdateStats((_1_participants)[_5_i], _5_i, _2_pairings, _3_bye, _4_results);
      })(participants, pairings, bye, results));
      return SwissDomain.__default.AddAllOpponents(_0_withStats, pairings, _dafny.ZERO);
    };
    static Apply(m, a) {
      let _source0 = a;
      {
        if (_source0.is_AddParticipant) {
          let _0_name = (_source0).name;
          if ((!_dafny.areEqual((m).dtor_phase, SwissDomain.Phase.create_Setup())) || ((new BigNumber(19)).isLessThanOrEqualTo(new BigNumber(((m).dtor_participants).length)))) {
            return m;
          } else {
            let _1_p = SwissDomain.Participant.create_Participant(_0_name, _dafny.ZERO, _dafny.ZERO, _dafny.ZERO, _dafny.Seq.of(), false, _dafny.Set.fromElements());
            let _2_dt__update__tmp_h0 = m;
            let _3_dt__update_hparticipants_h0 = _dafny.Seq.Concat((m).dtor_participants, _dafny.Seq.of(_1_p));
            return SwissDomain.Model.create_Model((_2_dt__update__tmp_h0).dtor_phase, _3_dt__update_hparticipants_h0, (_2_dt__update__tmp_h0).dtor_totalRounds, (_2_dt__update__tmp_h0).dtor_completedRounds, (_2_dt__update__tmp_h0).dtor_activeRound);
          }
        }
      }
      {
        if (_source0.is_RemoveLastParticipant) {
          if ((!_dafny.areEqual((m).dtor_phase, SwissDomain.Phase.create_Setup())) || ((new BigNumber(((m).dtor_participants).length)).isEqualTo(_dafny.ZERO))) {
            return m;
          } else {
            let _4_dt__update__tmp_h1 = m;
            let _5_dt__update_hparticipants_h1 = ((m).dtor_participants).slice(0, (new BigNumber(((m).dtor_participants).length)).minus(_dafny.ONE));
            return SwissDomain.Model.create_Model((_4_dt__update__tmp_h1).dtor_phase, _5_dt__update_hparticipants_h1, (_4_dt__update__tmp_h1).dtor_totalRounds, (_4_dt__update__tmp_h1).dtor_completedRounds, (_4_dt__update__tmp_h1).dtor_activeRound);
          }
        }
      }
      {
        if (_source0.is_SetRounds) {
          let _6_n = (_source0).n;
          if ((!_dafny.areEqual((m).dtor_phase, SwissDomain.Phase.create_Setup())) || ((_6_n).isLessThan(_dafny.ONE))) {
            return m;
          } else {
            let _7_dt__update__tmp_h2 = m;
            let _8_dt__update_htotalRounds_h0 = _6_n;
            return SwissDomain.Model.create_Model((_7_dt__update__tmp_h2).dtor_phase, (_7_dt__update__tmp_h2).dtor_participants, _8_dt__update_htotalRounds_h0, (_7_dt__update__tmp_h2).dtor_completedRounds, (_7_dt__update__tmp_h2).dtor_activeRound);
          }
        }
      }
      {
        if (_source0.is_StartTournament) {
          if ((((!_dafny.areEqual((m).dtor_phase, SwissDomain.Phase.create_Setup())) || ((new BigNumber(((m).dtor_participants).length)).isLessThan(new BigNumber(2)))) || ((new BigNumber(19)).isLessThan(new BigNumber(((m).dtor_participants).length)))) || (((m).dtor_totalRounds).isLessThan(_dafny.ONE))) {
            return m;
          } else {
            let _9_dt__update__tmp_h3 = m;
            let _10_dt__update_hactiveRound_h0 = SwissDomain.Option.create_Some(SwissDomain.ActiveRound.create_ActiveRound(_dafny.Seq.of(), SwissDomain.Option.create_None(), _dafny.Seq.of()));
            let _11_dt__update_hphase_h0 = SwissDomain.Phase.create_Playing();
            return SwissDomain.Model.create_Model(_11_dt__update_hphase_h0, (_9_dt__update__tmp_h3).dtor_participants, (_9_dt__update__tmp_h3).dtor_totalRounds, (_9_dt__update__tmp_h3).dtor_completedRounds, _10_dt__update_hactiveRound_h0);
          }
        }
      }
      {
        if (_source0.is_SubmitPairings) {
          let _12_pairings = (_source0).pairings;
          let _13_bye = (_source0).bye;
          if (!_dafny.areEqual((m).dtor_phase, SwissDomain.Phase.create_Playing())) {
            return m;
          } else {
            let _source1 = (m).dtor_activeRound;
            {
              if (_source1.is_None) {
                return m;
              }
            }
            {
              let _14_r = (_source1).value;
              if ((_dafny.ZERO).isLessThan(new BigNumber(((_14_r).dtor_pairings).length))) {
                return m;
              } else if (!(SwissDomain.__default.ValidPairingsForModel(m, _12_pairings, _13_bye))) {
                return m;
              } else {
                let _15_dt__update__tmp_h4 = m;
                let _16_dt__update_hactiveRound_h1 = SwissDomain.Option.create_Some(SwissDomain.ActiveRound.create_ActiveRound(_12_pairings, _13_bye, _dafny.Seq.Create(new BigNumber((_12_pairings).length), function (_17___v0) {
  return SwissDomain.Option.create_None();
})));
                return SwissDomain.Model.create_Model((_15_dt__update__tmp_h4).dtor_phase, (_15_dt__update__tmp_h4).dtor_participants, (_15_dt__update__tmp_h4).dtor_totalRounds, (_15_dt__update__tmp_h4).dtor_completedRounds, _16_dt__update_hactiveRound_h1);
              }
            }
          }
        }
      }
      {
        if (_source0.is_RecordResult) {
          let _18_pairingIdx = (_source0).pairingIdx;
          let _19_result = (_source0).result;
          if (!_dafny.areEqual((m).dtor_phase, SwissDomain.Phase.create_Playing())) {
            return m;
          } else {
            let _source2 = (m).dtor_activeRound;
            {
              if (_source2.is_None) {
                return m;
              }
            }
            {
              let _20_r = (_source2).value;
              if (((new BigNumber(((_20_r).dtor_pairings).length)).isLessThanOrEqualTo(_18_pairingIdx)) || ((((_20_r).dtor_results)[_18_pairingIdx]).is_Some)) {
                return m;
              } else {
                let _21_dt__update__tmp_h5 = m;
                let _22_dt__update_hactiveRound_h2 = SwissDomain.Option.create_Some(function (_pat_let4_0) {
  return function (_23_dt__update__tmp_h6) {
    return function (_pat_let5_0) {
      return function (_24_dt__update_hresults_h0) {
        return SwissDomain.ActiveRound.create_ActiveRound((_23_dt__update__tmp_h6).dtor_pairings, (_23_dt__update__tmp_h6).dtor_bye, _24_dt__update_hresults_h0);
      }(_pat_let5_0);
    }(_dafny.Seq.update((_20_r).dtor_results, _18_pairingIdx, SwissDomain.Option.create_Some(_19_result)));
  }(_pat_let4_0);
}(_20_r));
                return SwissDomain.Model.create_Model((_21_dt__update__tmp_h5).dtor_phase, (_21_dt__update__tmp_h5).dtor_participants, (_21_dt__update__tmp_h5).dtor_totalRounds, (_21_dt__update__tmp_h5).dtor_completedRounds, _22_dt__update_hactiveRound_h2);
              }
            }
          }
        }
      }
      {
        if (!_dafny.areEqual((m).dtor_phase, SwissDomain.Phase.create_Playing())) {
          return m;
        } else {
          let _source3 = (m).dtor_activeRound;
          {
            if (_source3.is_None) {
              return m;
            }
          }
          {
            let _25_r = (_source3).value;
            if (((new BigNumber(((_25_r).dtor_pairings).length)).isEqualTo(_dafny.ZERO)) || (!(SwissDomain.__default.AllRecorded((_25_r).dtor_results)))) {
              return m;
            } else {
              let _26_results = SwissDomain.__default.ExtractResults((_25_r).dtor_results);
              let _27_completed = SwissDomain.CompletedRound.create_CompletedRound((_25_r).dtor_pairings, (_25_r).dtor_bye, _26_results);
              let _28_newPs = SwissDomain.__default.UpdateAllParticipants((m).dtor_participants, (_25_r).dtor_pairings, (_25_r).dtor_bye, _26_results);
              let _29_newCompleted = _dafny.Seq.Concat((m).dtor_completedRounds, _dafny.Seq.of(_27_completed));
              if ((new BigNumber((_29_newCompleted).length)).isEqualTo((m).dtor_totalRounds)) {
                let _30_dt__update__tmp_h7 = m;
                let _31_dt__update_hactiveRound_h3 = SwissDomain.Option.create_None();
                let _32_dt__update_hcompletedRounds_h0 = _29_newCompleted;
                let _33_dt__update_hparticipants_h2 = _28_newPs;
                let _34_dt__update_hphase_h1 = SwissDomain.Phase.create_Finished();
                return SwissDomain.Model.create_Model(_34_dt__update_hphase_h1, _33_dt__update_hparticipants_h2, (_30_dt__update__tmp_h7).dtor_totalRounds, _32_dt__update_hcompletedRounds_h0, _31_dt__update_hactiveRound_h3);
              } else {
                let _35_dt__update__tmp_h8 = m;
                let _36_dt__update_hactiveRound_h4 = SwissDomain.Option.create_Some(SwissDomain.ActiveRound.create_ActiveRound(_dafny.Seq.of(), SwissDomain.Option.create_None(), _dafny.Seq.of()));
                let _37_dt__update_hcompletedRounds_h1 = _29_newCompleted;
                let _38_dt__update_hparticipants_h3 = _28_newPs;
                return SwissDomain.Model.create_Model((_35_dt__update__tmp_h8).dtor_phase, _38_dt__update_hparticipants_h3, (_35_dt__update__tmp_h8).dtor_totalRounds, _37_dt__update_hcompletedRounds_h1, _36_dt__update_hactiveRound_h4);
              }
            }
          }
        }
      }
    };
  };

  $module.Option = class Option {
    constructor(tag) {
      this.$tag = tag;
    }
    static create_None() {
      let $dt = new Option(0);
      return $dt;
    }
    static create_Some(value) {
      let $dt = new Option(1);
      $dt.value = value;
      return $dt;
    }
    get is_None() { return this.$tag === 0; }
    get is_Some() { return this.$tag === 1; }
    get dtor_value() { return this.value; }
    toString() {
      if (this.$tag === 0) {
        return "SwissDomain.Option.None";
      } else if (this.$tag === 1) {
        return "SwissDomain.Option.Some" + "(" + _dafny.toString(this.value) + ")";
      } else  {
        return "<unexpected>";
      }
    }
    equals(other) {
      if (this === other) {
        return true;
      } else if (this.$tag === 0) {
        return other.$tag === 0;
      } else if (this.$tag === 1) {
        return other.$tag === 1 && _dafny.areEqual(this.value, other.value);
      } else  {
        return false; // unexpected
      }
    }
    static Default() {
      return SwissDomain.Option.create_None();
    }
    static Rtd() {
      return class {
        static get Default() {
          return Option.Default();
        }
      };
    }
  }

  $module.Color = class Color {
    constructor(tag) {
      this.$tag = tag;
    }
    static create_White() {
      let $dt = new Color(0);
      return $dt;
    }
    static create_Black() {
      let $dt = new Color(1);
      return $dt;
    }
    get is_White() { return this.$tag === 0; }
    get is_Black() { return this.$tag === 1; }
    static get AllSingletonConstructors() {
      return this.AllSingletonConstructors_();
    }
    static *AllSingletonConstructors_() {
      yield Color.create_White();
      yield Color.create_Black();
    }
    toString() {
      if (this.$tag === 0) {
        return "SwissDomain.Color.White";
      } else if (this.$tag === 1) {
        return "SwissDomain.Color.Black";
      } else  {
        return "<unexpected>";
      }
    }
    equals(other) {
      if (this === other) {
        return true;
      } else if (this.$tag === 0) {
        return other.$tag === 0;
      } else if (this.$tag === 1) {
        return other.$tag === 1;
      } else  {
        return false; // unexpected
      }
    }
    static Default() {
      return SwissDomain.Color.create_White();
    }
    static Rtd() {
      return class {
        static get Default() {
          return Color.Default();
        }
      };
    }
  }

  $module.Phase = class Phase {
    constructor(tag) {
      this.$tag = tag;
    }
    static create_Setup() {
      let $dt = new Phase(0);
      return $dt;
    }
    static create_Playing() {
      let $dt = new Phase(1);
      return $dt;
    }
    static create_Finished() {
      let $dt = new Phase(2);
      return $dt;
    }
    get is_Setup() { return this.$tag === 0; }
    get is_Playing() { return this.$tag === 1; }
    get is_Finished() { return this.$tag === 2; }
    static get AllSingletonConstructors() {
      return this.AllSingletonConstructors_();
    }
    static *AllSingletonConstructors_() {
      yield Phase.create_Setup();
      yield Phase.create_Playing();
      yield Phase.create_Finished();
    }
    toString() {
      if (this.$tag === 0) {
        return "SwissDomain.Phase.Setup";
      } else if (this.$tag === 1) {
        return "SwissDomain.Phase.Playing";
      } else if (this.$tag === 2) {
        return "SwissDomain.Phase.Finished";
      } else  {
        return "<unexpected>";
      }
    }
    equals(other) {
      if (this === other) {
        return true;
      } else if (this.$tag === 0) {
        return other.$tag === 0;
      } else if (this.$tag === 1) {
        return other.$tag === 1;
      } else if (this.$tag === 2) {
        return other.$tag === 2;
      } else  {
        return false; // unexpected
      }
    }
    static Default() {
      return SwissDomain.Phase.create_Setup();
    }
    static Rtd() {
      return class {
        static get Default() {
          return Phase.Default();
        }
      };
    }
  }

  $module.GameResult = class GameResult {
    constructor(tag) {
      this.$tag = tag;
    }
    static create_WhiteWins() {
      let $dt = new GameResult(0);
      return $dt;
    }
    static create_BlackWins() {
      let $dt = new GameResult(1);
      return $dt;
    }
    static create_Draw() {
      let $dt = new GameResult(2);
      return $dt;
    }
    get is_WhiteWins() { return this.$tag === 0; }
    get is_BlackWins() { return this.$tag === 1; }
    get is_Draw() { return this.$tag === 2; }
    static get AllSingletonConstructors() {
      return this.AllSingletonConstructors_();
    }
    static *AllSingletonConstructors_() {
      yield GameResult.create_WhiteWins();
      yield GameResult.create_BlackWins();
      yield GameResult.create_Draw();
    }
    toString() {
      if (this.$tag === 0) {
        return "SwissDomain.GameResult.WhiteWins";
      } else if (this.$tag === 1) {
        return "SwissDomain.GameResult.BlackWins";
      } else if (this.$tag === 2) {
        return "SwissDomain.GameResult.Draw";
      } else  {
        return "<unexpected>";
      }
    }
    equals(other) {
      if (this === other) {
        return true;
      } else if (this.$tag === 0) {
        return other.$tag === 0;
      } else if (this.$tag === 1) {
        return other.$tag === 1;
      } else if (this.$tag === 2) {
        return other.$tag === 2;
      } else  {
        return false; // unexpected
      }
    }
    static Default() {
      return SwissDomain.GameResult.create_WhiteWins();
    }
    static Rtd() {
      return class {
        static get Default() {
          return GameResult.Default();
        }
      };
    }
  }

  $module.Pairing = class Pairing {
    constructor(tag) {
      this.$tag = tag;
    }
    static create_Pairing(whiteIdx, blackIdx) {
      let $dt = new Pairing(0);
      $dt.whiteIdx = whiteIdx;
      $dt.blackIdx = blackIdx;
      return $dt;
    }
    get is_Pairing() { return this.$tag === 0; }
    get dtor_whiteIdx() { return this.whiteIdx; }
    get dtor_blackIdx() { return this.blackIdx; }
    toString() {
      if (this.$tag === 0) {
        return "SwissDomain.Pairing.Pairing" + "(" + _dafny.toString(this.whiteIdx) + ", " + _dafny.toString(this.blackIdx) + ")";
      } else  {
        return "<unexpected>";
      }
    }
    equals(other) {
      if (this === other) {
        return true;
      } else if (this.$tag === 0) {
        return other.$tag === 0 && _dafny.areEqual(this.whiteIdx, other.whiteIdx) && _dafny.areEqual(this.blackIdx, other.blackIdx);
      } else  {
        return false; // unexpected
      }
    }
    static Default() {
      return SwissDomain.Pairing.create_Pairing(_dafny.ZERO, _dafny.ZERO);
    }
    static Rtd() {
      return class {
        static get Default() {
          return Pairing.Default();
        }
      };
    }
  }

  $module.CompletedRound = class CompletedRound {
    constructor(tag) {
      this.$tag = tag;
    }
    static create_CompletedRound(pairings, bye, results) {
      let $dt = new CompletedRound(0);
      $dt.pairings = pairings;
      $dt.bye = bye;
      $dt.results = results;
      return $dt;
    }
    get is_CompletedRound() { return this.$tag === 0; }
    get dtor_pairings() { return this.pairings; }
    get dtor_bye() { return this.bye; }
    get dtor_results() { return this.results; }
    toString() {
      if (this.$tag === 0) {
        return "SwissDomain.CompletedRound.CompletedRound" + "(" + _dafny.toString(this.pairings) + ", " + _dafny.toString(this.bye) + ", " + _dafny.toString(this.results) + ")";
      } else  {
        return "<unexpected>";
      }
    }
    equals(other) {
      if (this === other) {
        return true;
      } else if (this.$tag === 0) {
        return other.$tag === 0 && _dafny.areEqual(this.pairings, other.pairings) && _dafny.areEqual(this.bye, other.bye) && _dafny.areEqual(this.results, other.results);
      } else  {
        return false; // unexpected
      }
    }
    static Default() {
      return SwissDomain.CompletedRound.create_CompletedRound(_dafny.Seq.of(), SwissDomain.Option.Default(), _dafny.Seq.of());
    }
    static Rtd() {
      return class {
        static get Default() {
          return CompletedRound.Default();
        }
      };
    }
  }

  $module.ActiveRound = class ActiveRound {
    constructor(tag) {
      this.$tag = tag;
    }
    static create_ActiveRound(pairings, bye, results) {
      let $dt = new ActiveRound(0);
      $dt.pairings = pairings;
      $dt.bye = bye;
      $dt.results = results;
      return $dt;
    }
    get is_ActiveRound() { return this.$tag === 0; }
    get dtor_pairings() { return this.pairings; }
    get dtor_bye() { return this.bye; }
    get dtor_results() { return this.results; }
    toString() {
      if (this.$tag === 0) {
        return "SwissDomain.ActiveRound.ActiveRound" + "(" + _dafny.toString(this.pairings) + ", " + _dafny.toString(this.bye) + ", " + _dafny.toString(this.results) + ")";
      } else  {
        return "<unexpected>";
      }
    }
    equals(other) {
      if (this === other) {
        return true;
      } else if (this.$tag === 0) {
        return other.$tag === 0 && _dafny.areEqual(this.pairings, other.pairings) && _dafny.areEqual(this.bye, other.bye) && _dafny.areEqual(this.results, other.results);
      } else  {
        return false; // unexpected
      }
    }
    static Default() {
      return SwissDomain.ActiveRound.create_ActiveRound(_dafny.Seq.of(), SwissDomain.Option.Default(), _dafny.Seq.of());
    }
    static Rtd() {
      return class {
        static get Default() {
          return ActiveRound.Default();
        }
      };
    }
  }

  $module.Participant = class Participant {
    constructor(tag) {
      this.$tag = tag;
    }
    static create_Participant(name, score2x, whiteCount, blackCount, colorHistory, byeReceived, opponents) {
      let $dt = new Participant(0);
      $dt.name = name;
      $dt.score2x = score2x;
      $dt.whiteCount = whiteCount;
      $dt.blackCount = blackCount;
      $dt.colorHistory = colorHistory;
      $dt.byeReceived = byeReceived;
      $dt.opponents = opponents;
      return $dt;
    }
    get is_Participant() { return this.$tag === 0; }
    get dtor_name() { return this.name; }
    get dtor_score2x() { return this.score2x; }
    get dtor_whiteCount() { return this.whiteCount; }
    get dtor_blackCount() { return this.blackCount; }
    get dtor_colorHistory() { return this.colorHistory; }
    get dtor_byeReceived() { return this.byeReceived; }
    get dtor_opponents() { return this.opponents; }
    toString() {
      if (this.$tag === 0) {
        return "SwissDomain.Participant.Participant" + "(" + this.name.toVerbatimString(true) + ", " + _dafny.toString(this.score2x) + ", " + _dafny.toString(this.whiteCount) + ", " + _dafny.toString(this.blackCount) + ", " + _dafny.toString(this.colorHistory) + ", " + _dafny.toString(this.byeReceived) + ", " + _dafny.toString(this.opponents) + ")";
      } else  {
        return "<unexpected>";
      }
    }
    equals(other) {
      if (this === other) {
        return true;
      } else if (this.$tag === 0) {
        return other.$tag === 0 && _dafny.areEqual(this.name, other.name) && _dafny.areEqual(this.score2x, other.score2x) && _dafny.areEqual(this.whiteCount, other.whiteCount) && _dafny.areEqual(this.blackCount, other.blackCount) && _dafny.areEqual(this.colorHistory, other.colorHistory) && this.byeReceived === other.byeReceived && _dafny.areEqual(this.opponents, other.opponents);
      } else  {
        return false; // unexpected
      }
    }
    static Default() {
      return SwissDomain.Participant.create_Participant(_dafny.Seq.UnicodeFromString(""), _dafny.ZERO, _dafny.ZERO, _dafny.ZERO, _dafny.Seq.of(), false, _dafny.Set.Empty);
    }
    static Rtd() {
      return class {
        static get Default() {
          return Participant.Default();
        }
      };
    }
  }

  $module.Model = class Model {
    constructor(tag) {
      this.$tag = tag;
    }
    static create_Model(phase, participants, totalRounds, completedRounds, activeRound) {
      let $dt = new Model(0);
      $dt.phase = phase;
      $dt.participants = participants;
      $dt.totalRounds = totalRounds;
      $dt.completedRounds = completedRounds;
      $dt.activeRound = activeRound;
      return $dt;
    }
    get is_Model() { return this.$tag === 0; }
    get dtor_phase() { return this.phase; }
    get dtor_participants() { return this.participants; }
    get dtor_totalRounds() { return this.totalRounds; }
    get dtor_completedRounds() { return this.completedRounds; }
    get dtor_activeRound() { return this.activeRound; }
    toString() {
      if (this.$tag === 0) {
        return "SwissDomain.Model.Model" + "(" + _dafny.toString(this.phase) + ", " + _dafny.toString(this.participants) + ", " + _dafny.toString(this.totalRounds) + ", " + _dafny.toString(this.completedRounds) + ", " + _dafny.toString(this.activeRound) + ")";
      } else  {
        return "<unexpected>";
      }
    }
    equals(other) {
      if (this === other) {
        return true;
      } else if (this.$tag === 0) {
        return other.$tag === 0 && _dafny.areEqual(this.phase, other.phase) && _dafny.areEqual(this.participants, other.participants) && _dafny.areEqual(this.totalRounds, other.totalRounds) && _dafny.areEqual(this.completedRounds, other.completedRounds) && _dafny.areEqual(this.activeRound, other.activeRound);
      } else  {
        return false; // unexpected
      }
    }
    static Default() {
      return SwissDomain.Model.create_Model(SwissDomain.Phase.Default(), _dafny.Seq.of(), _dafny.ZERO, _dafny.Seq.of(), SwissDomain.Option.Default());
    }
    static Rtd() {
      return class {
        static get Default() {
          return Model.Default();
        }
      };
    }
  }

  $module.Action = class Action {
    constructor(tag) {
      this.$tag = tag;
    }
    static create_AddParticipant(name) {
      let $dt = new Action(0);
      $dt.name = name;
      return $dt;
    }
    static create_RemoveLastParticipant() {
      let $dt = new Action(1);
      return $dt;
    }
    static create_SetRounds(n) {
      let $dt = new Action(2);
      $dt.n = n;
      return $dt;
    }
    static create_StartTournament() {
      let $dt = new Action(3);
      return $dt;
    }
    static create_SubmitPairings(pairings, bye) {
      let $dt = new Action(4);
      $dt.pairings = pairings;
      $dt.bye = bye;
      return $dt;
    }
    static create_RecordResult(pairingIdx, result) {
      let $dt = new Action(5);
      $dt.pairingIdx = pairingIdx;
      $dt.result = result;
      return $dt;
    }
    static create_FinalizeRound() {
      let $dt = new Action(6);
      return $dt;
    }
    get is_AddParticipant() { return this.$tag === 0; }
    get is_RemoveLastParticipant() { return this.$tag === 1; }
    get is_SetRounds() { return this.$tag === 2; }
    get is_StartTournament() { return this.$tag === 3; }
    get is_SubmitPairings() { return this.$tag === 4; }
    get is_RecordResult() { return this.$tag === 5; }
    get is_FinalizeRound() { return this.$tag === 6; }
    get dtor_name() { return this.name; }
    get dtor_n() { return this.n; }
    get dtor_pairings() { return this.pairings; }
    get dtor_bye() { return this.bye; }
    get dtor_pairingIdx() { return this.pairingIdx; }
    get dtor_result() { return this.result; }
    toString() {
      if (this.$tag === 0) {
        return "SwissDomain.Action.AddParticipant" + "(" + this.name.toVerbatimString(true) + ")";
      } else if (this.$tag === 1) {
        return "SwissDomain.Action.RemoveLastParticipant";
      } else if (this.$tag === 2) {
        return "SwissDomain.Action.SetRounds" + "(" + _dafny.toString(this.n) + ")";
      } else if (this.$tag === 3) {
        return "SwissDomain.Action.StartTournament";
      } else if (this.$tag === 4) {
        return "SwissDomain.Action.SubmitPairings" + "(" + _dafny.toString(this.pairings) + ", " + _dafny.toString(this.bye) + ")";
      } else if (this.$tag === 5) {
        return "SwissDomain.Action.RecordResult" + "(" + _dafny.toString(this.pairingIdx) + ", " + _dafny.toString(this.result) + ")";
      } else if (this.$tag === 6) {
        return "SwissDomain.Action.FinalizeRound";
      } else  {
        return "<unexpected>";
      }
    }
    equals(other) {
      if (this === other) {
        return true;
      } else if (this.$tag === 0) {
        return other.$tag === 0 && _dafny.areEqual(this.name, other.name);
      } else if (this.$tag === 1) {
        return other.$tag === 1;
      } else if (this.$tag === 2) {
        return other.$tag === 2 && _dafny.areEqual(this.n, other.n);
      } else if (this.$tag === 3) {
        return other.$tag === 3;
      } else if (this.$tag === 4) {
        return other.$tag === 4 && _dafny.areEqual(this.pairings, other.pairings) && _dafny.areEqual(this.bye, other.bye);
      } else if (this.$tag === 5) {
        return other.$tag === 5 && _dafny.areEqual(this.pairingIdx, other.pairingIdx) && _dafny.areEqual(this.result, other.result);
      } else if (this.$tag === 6) {
        return other.$tag === 6;
      } else  {
        return false; // unexpected
      }
    }
    static Default() {
      return SwissDomain.Action.create_AddParticipant(_dafny.Seq.UnicodeFromString(""));
    }
    static Rtd() {
      return class {
        static get Default() {
          return Action.Default();
        }
      };
    }
  }
  return $module;
})(); // end of module SwissDomain
let SwissKernel = (function() {
  let $module = {};

  $module.__default = class __default {
    constructor () {
      this._tname = "SwissKernel._default";
    }
    _parentTraits() {
      return [];
    }
    static Step(m, a) {
      return SwissDomain.__default.Normalize(SwissDomain.__default.Apply(m, a));
    };
    static InitHistory() {
      return SwissKernel.History.create_History(_dafny.Seq.of(), SwissDomain.__default.Init(), _dafny.Seq.of());
    };
    static Do(h, a) {
      return SwissKernel.History.create_History(_dafny.Seq.Concat((h).dtor_past, _dafny.Seq.of((h).dtor_present)), SwissKernel.__default.Step((h).dtor_present, a), _dafny.Seq.of());
    };
    static Preview(h, a) {
      return SwissKernel.History.create_History((h).dtor_past, SwissKernel.__default.Step((h).dtor_present, a), (h).dtor_future);
    };
    static CommitFrom(h, baseline) {
      return SwissKernel.History.create_History(_dafny.Seq.Concat((h).dtor_past, _dafny.Seq.of(baseline)), (h).dtor_present, _dafny.Seq.of());
    };
    static Undo(h) {
      if ((new BigNumber(((h).dtor_past).length)).isEqualTo(_dafny.ZERO)) {
        return h;
      } else {
        let _0_i = (new BigNumber(((h).dtor_past).length)).minus(_dafny.ONE);
        return SwissKernel.History.create_History(((h).dtor_past).slice(0, _0_i), ((h).dtor_past)[_0_i], _dafny.Seq.Concat(_dafny.Seq.of((h).dtor_present), (h).dtor_future));
      }
    };
    static Redo(h) {
      if ((new BigNumber(((h).dtor_future).length)).isEqualTo(_dafny.ZERO)) {
        return h;
      } else {
        return SwissKernel.History.create_History(_dafny.Seq.Concat((h).dtor_past, _dafny.Seq.of((h).dtor_present)), ((h).dtor_future)[_dafny.ZERO], ((h).dtor_future).slice(_dafny.ONE));
      }
    };
  };

  $module.History = class History {
    constructor(tag) {
      this.$tag = tag;
    }
    static create_History(past, present, future) {
      let $dt = new History(0);
      $dt.past = past;
      $dt.present = present;
      $dt.future = future;
      return $dt;
    }
    get is_History() { return this.$tag === 0; }
    get dtor_past() { return this.past; }
    get dtor_present() { return this.present; }
    get dtor_future() { return this.future; }
    toString() {
      if (this.$tag === 0) {
        return "SwissKernel.History.History" + "(" + _dafny.toString(this.past) + ", " + _dafny.toString(this.present) + ", " + _dafny.toString(this.future) + ")";
      } else  {
        return "<unexpected>";
      }
    }
    equals(other) {
      if (this === other) {
        return true;
      } else if (this.$tag === 0) {
        return other.$tag === 0 && _dafny.areEqual(this.past, other.past) && _dafny.areEqual(this.present, other.present) && _dafny.areEqual(this.future, other.future);
      } else  {
        return false; // unexpected
      }
    }
    static Default() {
      return SwissKernel.History.create_History(_dafny.Seq.of(), SwissDomain.Model.Default(), _dafny.Seq.of());
    }
    static Rtd() {
      return class {
        static get Default() {
          return History.Default();
        }
      };
    }
  }
  return $module;
})(); // end of module SwissKernel
let AppCore = (function() {
  let $module = {};

  $module.__default = class __default {
    constructor () {
      this._tname = "AppCore._default";
    }
    _parentTraits() {
      return [];
    }
    static Init() {
      return SwissKernel.__default.InitHistory();
    };
    static Dispatch(h, a) {
      return SwissKernel.__default.Do(h, a);
    };
    static Undo(h) {
      return SwissKernel.__default.Undo(h);
    };
    static Redo(h) {
      return SwissKernel.__default.Redo(h);
    };
    static Present(h) {
      return (h).dtor_present;
    };
    static CanUndo(h) {
      return (_dafny.ZERO).isLessThan(new BigNumber(((h).dtor_past).length));
    };
    static CanRedo(h) {
      return (_dafny.ZERO).isLessThan(new BigNumber(((h).dtor_future).length));
    };
    static AddParticipant(name) {
      return SwissDomain.Action.create_AddParticipant(name);
    };
    static RemoveLastParticipant() {
      return SwissDomain.Action.create_RemoveLastParticipant();
    };
    static SetRounds(n) {
      return SwissDomain.Action.create_SetRounds(n);
    };
    static StartTournament() {
      return SwissDomain.Action.create_StartTournament();
    };
    static SubmitPairings(pairings, bye) {
      return SwissDomain.Action.create_SubmitPairings(pairings, bye);
    };
    static RecordResult(pairingIdx, result) {
      return SwissDomain.Action.create_RecordResult(pairingIdx, result);
    };
    static FinalizeRound() {
      return SwissDomain.Action.create_FinalizeRound();
    };
    static ValidPairings(model, pairings, bye) {
      return SwissDomain.__default.ValidPairingsForModel(model, pairings, bye);
    };
    static ChooseColors(p1idx, p2idx, p1, p2) {
      return SwissDomain.__default.ChooseColors(p1idx, p2idx, p1, p2);
    };
    static CanStart(model) {
      return ((_dafny.areEqual((model).dtor_phase, SwissDomain.Phase.create_Setup())) && (((new BigNumber(2)).isLessThanOrEqualTo(new BigNumber(((model).dtor_participants).length))) && ((new BigNumber(((model).dtor_participants).length)).isLessThanOrEqualTo(new BigNumber(19))))) && ((_dafny.ONE).isLessThanOrEqualTo((model).dtor_totalRounds));
    };
    static CanSubmitPairings(model) {
      return ((_dafny.areEqual((model).dtor_phase, SwissDomain.Phase.create_Playing())) && (((model).dtor_activeRound).is_Some)) && ((new BigNumber(((((model).dtor_activeRound).dtor_value).dtor_pairings).length)).isEqualTo(_dafny.ZERO));
    };
    static CanFinalize(model) {
      return (((_dafny.areEqual((model).dtor_phase, SwissDomain.Phase.create_Playing())) && (((model).dtor_activeRound).is_Some)) && ((_dafny.ZERO).isLessThan(new BigNumber(((((model).dtor_activeRound).dtor_value).dtor_pairings).length)))) && (SwissDomain.__default.AllRecorded((((model).dtor_activeRound).dtor_value).dtor_results));
    };
    static CurrentRound(model) {
      return SwissDomain.__default.CurrentRound(model);
    };
  };
  return $module;
})(); // end of module AppCore
let _module = (function() {
  let $module = {};

  return $module;
})(); // end of module _module
