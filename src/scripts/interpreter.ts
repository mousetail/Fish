import { NumberImplementation, Rational } from "./number_implementation";

export interface Stack<T> {
    contents: T[],
    register: T | undefined
}

export interface ProgramState<T> {
    stacks: Stack<T>[];
    program: T[][];
    cursor: [number, number];
    cursor_direction: [number, number];
    input: () => T;
    output: (_: T) => void;
    string_parsing_mode: undefined | T;
    stopped: boolean;
    number_implementation: NumberImplementation<T>

}

function pop<T>(o: ProgramState<T>): T {
    const out = o.stacks[o.stacks.length - 1].contents.pop()
    if (out === undefined) {
        throw new Error("Attempt to read from empty stack");
    }
    return out;
}

function push<T>(o: ProgramState<T>, n: T) {
    o.stacks[o.stacks.length - 1].contents.push(n)
}

function wrap<T>(f: (x: T, y: T, z: NumberImplementation<T>) => T) {
    return (o: ProgramState<T>) => {
        let [x, y] = [pop(o), pop(o)];
        push(o, f(y, x, o.number_implementation))
    }
}

const commands: {[k: string]: <T>(o: ProgramState<T>) => void} = {
    // Movement and Execution
    '<': (o) => {
        o.cursor_direction = [-1, 0];
    },
    '>': (o) => {
        o.cursor_direction = [1, 0];
    },
    '^': (o) => {
        o.cursor_direction = [0, -1];
    },
    'v': (o) => {
        o.cursor_direction = [0, 1];
    },
    '\\': (o) => {
        o.cursor_direction = [
            o.cursor_direction[1],
            o.cursor_direction[0]
        ]
    },
    '/': (o) => {
        o.cursor_direction = [
            -o.cursor_direction[1],
            -o.cursor_direction[0]
        ]
    },
    '|': (o) => {
        o.cursor_direction = [
            -o.cursor_direction[0],
            o.cursor_direction[1]
        ]
    },
    '_': (o) => {
        o.cursor_direction = [
            o.cursor_direction[0],
            -o.cursor_direction[1]
        ]
    },
    '#': (o) => {
        o.cursor_direction = [
            -o.cursor_direction[0],
            -o.cursor_direction[1]
        ]
    },
    'x': (o) => {
        o.cursor_direction = [
            [-1, 0],
            [0, 1],
            [1, 0],
            [0, -1]
        ][Math.floor(Math.random() * 4)] as ([number, number])
    },
    '!': (o) => {
        o.cursor[0] += o.cursor_direction[0];
        o.cursor[1] += o.cursor_direction[1];
    },
    '?': (o) => {
        if (!o.number_implementation.isTruthy(pop(o))) {
            o.cursor[0] += o.cursor_direction[0];
            o.cursor[1] += o.cursor_direction[1];
        }
    },
    '.': (o) => {
        let [y, x] = [pop(o), pop(o)]
        o.cursor = [
            o.number_implementation.toIndex(x), o.number_implementation.toIndex(y)
        ]
    },

    // Literals
    '0': (o) => push(o, o.number_implementation.fromInt(0)),
    '1': (o) => push(o, o.number_implementation.fromInt(1)),
    '2': (o) => push(o, o.number_implementation.fromInt(2)),
    '3': (o) => push(o, o.number_implementation.fromInt(3)),
    '4': (o) => push(o, o.number_implementation.fromInt(4)),
    '5': (o) => push(o, o.number_implementation.fromInt(5)),
    '6': (o) => push(o, o.number_implementation.fromInt(6)),
    '7': (o) => push(o, o.number_implementation.fromInt(7)),
    '8': (o) => push(o, o.number_implementation.fromInt(8)),
    '9': (o) => push(o, o.number_implementation.fromInt(9)),
    'a': (o) => push(o, o.number_implementation.fromInt(10)),
    'b': (o) => push(o, o.number_implementation.fromInt(11)),
    'c': (o) => push(o, o.number_implementation.fromInt(12)),
    'd': (o) => push(o, o.number_implementation.fromInt(13)),
    'e': (o) => push(o, o.number_implementation.fromInt(14)),
    'f': (o) => push(o, o.number_implementation.fromInt(15)),

    // Operators
    '+': wrap((a, b, number_implementation) => number_implementation.add(a, b)),
    '*': wrap((a, b, number_implementation) => number_implementation.mul(a, b)),
    '-': wrap((a, b, number_implementation) => number_implementation.sub(a, b)),
    ',': wrap((a, b, number_implementation) => number_implementation.div(a, b)),
    '%': wrap((a, b, number_implementation) => number_implementation.mod(a, b)),
    '=': wrap((a, b, number_implementation) => number_implementation.eq(a, b)),
    ')': wrap((a, b, number_implementation) => number_implementation.gt(a, b)),
    '(': wrap((a, b, number_implementation) => number_implementation.lt(a, b)),
    '\'': (o) => {
        o.string_parsing_mode = o.number_implementation.fromChar('\'');
    },
    '"': (o) => {
        o.string_parsing_mode = o.number_implementation.fromChar('"');
    },

    // Stack Manipulation
    ':': (o) => {
        const val = pop(o);
        push(o, val);
        push(o, val);
    },
    '~': (o) => pop(o),
    '$': (o) => {
        const [x, y] = [pop(o), pop(o)]
        push(o, x);
        push(o, y);
    },
    '@': (o) => {
        const [x, y, z] = [pop(o), pop(o), pop(o)];
        push(o, x); push(o, z); push(o, y);
    },
    '{': <T>(o: ProgramState<T>) => {
        if (o.stacks[o.stacks.length -1].contents.length > 0) {
            let a = o.stacks[o.stacks.length - 1].contents.shift() as T;
            push(o, a);
        }
    },
    '}': <T>(o: ProgramState<T>) => {
        if (o.stacks[o.stacks.length -1].contents.length > 0) {
            let a = o.stacks[o.stacks.length - 1].contents.pop() as T;
            o.stacks[o.stacks.length - 1].contents.unshift(a);
        }
    },
    'r': (o) => {
        o.stacks[o.stacks.length - 1].contents.reverse();
    },
    'l': (o) => {
        push(o, o.number_implementation.fromInt(o.stacks[o.stacks.length - 1].contents.length))
    },
    '[': <T>(o: ProgramState<T>) => {
        let number = o.number_implementation.toIndex(pop(o));

        const new_stack: T[] = [];
        for (let i = 0; i < number; i++) {
            new_stack.push(pop(o));
        }
        new_stack.reverse();
        o.stacks.push(
            {
                contents: new_stack,
                register: undefined
            }
        )
    },
    ']': (o) => {
        let last_stack = o.stacks.pop();
        if (last_stack !== undefined && o.stacks.length >= 1) {
            o.stacks[o.stacks.length - 1].contents = o.stacks[o.stacks.length - 1].contents.concat(last_stack.contents)
        } else {
            o.stacks = [{ contents: [], register: undefined }];
        }
    },

    // Input/Output
    'o': (o) => {
        o.output(pop(o))
    },
    'n': (o) => {
        let res: string = o.number_implementation.toString(pop(o));
        for (let i = 0; i < res.length; i++) {
            o.output(o.number_implementation.fromInt(res.charCodeAt(i)))
        }
    },
    'i': (o) => {
        push(o, o.input())
    },

    // Reflection
    '&': (o) => {
        let last_stack = o.stacks[o.stacks.length - 1];
        if (last_stack.register === undefined) {
            last_stack.register = pop(o)
        } else {
            push(o, last_stack.register);
            last_stack.register = undefined;
        }
    },
    'g': (o) => {
        let [y, x] = [o.number_implementation.toIndex(pop(o)), o.number_implementation.toIndex(pop(o))];
        
        if (o.program[y] !== undefined && o.program[y][x] !== undefined) {
            push(
                o,
                o.program[y][x]
            )
        }
        else {
            push(
                o,
                o.number_implementation.default()
            )
        }
    },
    'p': (o) => {
        let [y, x, v] = [o.number_implementation.toIndex(pop(o)), o.number_implementation.toIndex(pop(o)), pop(o)];
        while (o.program.length <= y) {
            o.program.push([]);
        }
        while (y > 0 && o.program[y].length < x) {
            o.program[y].push(o.number_implementation.default());
        }
        if (o.program[y] === undefined) {
            o.program[y] = [];
        }
        o.program[y][x] = v;
    },
    ';': (o) => {
        o.stopped = true;
    }
}

export type AnyTypeProgramState = {kind: 'float'} & ProgramState<number> | {kind: 'rational'} & ProgramState<Rational>;

function _step<T>(o: ProgramState<T>) {
    let token_code: T = o.cursor[0] < o.program[o.cursor[1]].length ? o.program[o.cursor[1]][o.cursor[0]] ?? o.number_implementation.default() : o.number_implementation.default();

    let token: string;
    try {
        token = o.number_implementation.toChar(token_code)
    } catch {
        token = '�'
    }
    if (o.string_parsing_mode !== undefined) {
        if (o.number_implementation.isTruthy(o.number_implementation.eq(token_code, o.string_parsing_mode))) {
            o.string_parsing_mode = undefined
        } else {
            push(o, token_code);
        }
    }

    else if (token === ' ' || token === '\x00') {

    } else if (Object.hasOwnProperty.call(commands, token)) {
        commands[token](o);
    } else {
        throw new Error("Unexpected token: " + token + " Note: all symbols must be lower case");
    }

    if (o.cursor_direction[0] != 0) {
        o.cursor[0] += o.cursor_direction[0];

        const row_length = o.program[o.cursor[1]].length;
        if (row_length != 0) {
            o.cursor[0] = (o.cursor[0] + row_length) % row_length;
        }
    }

    if (o.cursor_direction[1] != 0) {
        o.cursor[1] += o.cursor_direction[1];
        o.cursor[1] = (o.cursor[1] + o.program.length) % o.program.length;
    }
}

export function step(o: AnyTypeProgramState) {
    if (o.kind == 'float') {
        _step<number>(o)
    } else {
        _step<Rational>(o)
    }
}
