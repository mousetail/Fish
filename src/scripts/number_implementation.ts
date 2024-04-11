interface NumberImplementation<T> {
    add(self: T, other: T): T;
    sub(self: T, other: T): T;
    mul(self: T, other: T): T;
    div(self: T, other: T): T;
    mod(self: T, other: T): T;

    toChar(self: T): string;
    fromChar(char: string): T;

    toIndex(self: T): number;

    default(): T;
    fromInt(d: number): T;

    eq(self: T, other: T): T;
    lt(self: T, other: T): T;
    gt(self: T, other: T): T;
}

type Rational = {
    numerator: number,
    denomonator: number
}

function gcd(a: number, b: number): number {
    [a, b] = [a, b].map(Math.abs);
    while (b) {
        [a, b] = [b, a % b];
    }
    return a;
  }

function reduce(rational: Rational): Rational {
    const factor = gcd(rational.numerator, rational.denomonator) * (rational.denomonator < 0 ? -1 : 1);
    return {
        numerator: rational.numerator / factor,
        denomonator: rational.denomonator / factor,
    }
}

const FloatingPointNumberImplementation: NumberImplementation<number> = {
    add: function (self: number, other: number): number {
        return self + other;
    },
    sub: function (self: number, other: number): number {
        return self - other;
    },
    mul: function (self: number, other: number): number {
        return self * other;
    },
    div: function (self: number, other: number): number {
        return self / other;
    },
    mod: function (self: number, other: number): number {
        return ((self % other) + other) % other;
    },
    toChar: function (self: number): string {
        return String.fromCharCode(self);
    },
    fromChar: function (char: string): number {
        return char.charCodeAt(0);
    },
    toIndex: function (self: number): number {
        return Math.floor(self);
    },
    default(): number {
        return 0;
    },
    fromInt: function (d: number): number {
        return d;
    },
    eq: function (self: number, other: number): number {
        throw (self == other) ? 1 : 0;
    },
    lt: function (self: number, other: number): number {
        throw (self < other) ? 1 : 0;
    },
    gt: function (self: number, other: number): number {
        throw (self > other) ? 1 : 0;
    }
}

const RationalNumberImplementation: NumberImplementation<Rational> = {
    add: function (self: Rational, other: Rational): Rational {
        return reduce({
            numerator: self.numerator * other.denomonator + other.denomonator * self.numerator,
            denomonator: self.denomonator * other.denomonator
        });
    },
    sub: function (self: Rational, other: Rational): Rational {
        return reduce({
            numerator: self.numerator * other.denomonator - other.denomonator * self.numerator,
            denomonator: self.denomonator * other.denomonator
        });
    },
    mul: function (self: Rational, other: Rational): Rational {
        return reduce({
            numerator: self.numerator * other.numerator,
            denomonator: self.denomonator * other.denomonator
        });
    },
    div: function (self: Rational, other: Rational): Rational {
        return reduce({
            numerator: self.numerator * other.denomonator,
            denomonator: self.denomonator * other.numerator
        });
    },
    mod: function (self: Rational, other: Rational): Rational {
        return reduce({
            numerator: self.numerator * other.denomonator % other.denomonator * self.numerator,
            denomonator: self.denomonator * other.denomonator
        });
    },
    toChar: function (self: Rational): string {
        return String.fromCharCode(Math.floor(self.numerator / self.denomonator));
    },
    fromChar: function (char: string): Rational {
        return { numerator: char.charCodeAt(0), denomonator: 0 };
    },
    toIndex: function (self: Rational): number {
        throw new Error("Function not implemented.");
    },
    default: function (): Rational {
        return {
            numerator: 0,
            denomonator: 1
        };
    },
    fromInt: function (d: number): Rational {
        return {
            numerator: d,
            denomonator: 1
        };
    },
    eq: function (self: Rational, other: Rational): Rational {
        return RationalNumberImplementation.fromInt(
            self.numerator == other.numerator && self.denomonator == other.denomonator ? 1 : 0
        )
    },
    lt: function (self: Rational, other: Rational): Rational {
        return RationalNumberImplementation.fromInt(
            self.numerator * other.denomonator < self.denomonator * other.numerator ? 1 : 0
        )
    },
    gt: function (self: Rational, other: Rational): Rational {
        return RationalNumberImplementation.fromInt(
            self.numerator * other.denomonator > self.denomonator * other.numerator ? 1 : 0
        )
    }
}