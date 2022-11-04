export interface Stack {
    contents: number[],
    register: number | undefined
}

export interface ProgramState {
    stacks: Stack[];
    program: string[];
    cursor: [number, number];
    cursor_direction: [number, number];
    input: () => number;
    output: (_: number) => void;
    string_parsing_mode: undefined | string;
    stopped: boolean;
}

function pop(o: ProgramState): number {
    const out = o.stacks[o.stacks.length - 1].contents.pop()
    if (out === undefined) {
        throw new Error("Attempt to read from empty stack");
    }
    return out;
}

function push(o: ProgramState, n: number) {
    o.stacks[o.stacks.length - 1].contents.push(n)
}

function wrap(f: (x: number, y: number) => number) {
    return (o: ProgramState) => {
        push(o, f(pop(o), pop(o)))
    }
}

const commands = {
    // Movement and Execution
    '<': (o: ProgramState) => {
        o.cursor_direction = [-1, 0];
    },
    '>': (o: ProgramState) => {
        o.cursor_direction = [1, 0];
    },
    '^': (o: ProgramState) => {
        o.cursor_direction = [0, -1];
    },
    'v': (o: ProgramState) => {
        o.cursor_direction = [0, 1];
    },
    '\\': (o: ProgramState) => {
        o.cursor_direction = [
            o.cursor_direction[1],
            o.cursor_direction[0]
        ]
    },
    '/': (o: ProgramState) => {
        o.cursor_direction = [
            -o.cursor_direction[1],
            -o.cursor_direction[0]
        ]
    },
    '|': (o: ProgramState) => {
        o.cursor_direction = [
            -o.cursor_direction[0],
            o.cursor_direction[1]
        ]
    },
    '_': (o: ProgramState) => {
        o.cursor_direction = [
            o.cursor_direction[0],
            -o.cursor_direction[1]
        ]
    },
    '#': (o: ProgramState) => {
        o.cursor_direction = [
            -o.cursor_direction[0],
            -o.cursor_direction[1]
        ]
    },
    'x': (o: ProgramState) => {
        o.cursor_direction = [
            [-1, 0],
            [0, 1],
            [1, 0],
            [0, -1]
        ][Math.floor(Math.random() * 4)] as ([number, number])
    },
    '!': (o: ProgramState) => {
        o.cursor[0] += o.cursor_direction[0];
        o.cursor[1] += o.cursor_direction[1];
    },
    '?': (o: ProgramState) => {
        if (pop(o) === 0) {
            o.cursor[0] += o.cursor_direction[0];
            o.cursor[1] += o.cursor_direction[1];
        }
    },
    '.': (o: ProgramState) => {
        let [y, x] = [pop(o), pop(o)]
        o.cursor = [
            x, y
        ]
    },

    // Literals
    '0': (o: ProgramState) => push(o, 0),
    '1': (o: ProgramState) => push(o, 1),
    '2': (o: ProgramState) => push(o, 2),
    '3': (o: ProgramState) => push(o, 3),
    '4': (o: ProgramState) => push(o, 4),
    '5': (o: ProgramState) => push(o, 5),
    '6': (o: ProgramState) => push(o, 6),
    '7': (o: ProgramState) => push(o, 7),
    '8': (o: ProgramState) => push(o, 8),
    '9': (o: ProgramState) => push(o, 9),
    'a': (o: ProgramState) => push(o, 10),
    'b': (o: ProgramState) => push(o, 11),
    'c': (o: ProgramState) => push(o, 12),
    'd': (o: ProgramState) => push(o, 13),
    'e': (o: ProgramState) => push(o, 14),
    'f': (o: ProgramState) => push(o, 15),

    // Operators
    '+': wrap((a, b) => a + b),
    '*': wrap((a, b) => a * b),
    '-': wrap((a, b) => b - a),
    ',': wrap((a, b) => b / a),
    '%': wrap((a, b) => b % a),
    '=': (o: ProgramState) => {
        push(o, Number(pop(o) == pop(o)))
    },
    ')': (o: ProgramState) => {
        push(o, Number(pop(o) > pop(o)))
    },
    '(': (o: ProgramState) => {
        push(o, Number(pop(o) < pop(o)))
    },
    '\'': (o: ProgramState) => {
        o.string_parsing_mode = '\''
    },
    '"': (o: ProgramState) => {
        o.string_parsing_mode = '"'
    },

    // Stack Manipulation
    ':': (o: ProgramState) => {
        const val = pop(o);
        push(o, val);
        push(o, val);
    },
    '~': (o: ProgramState) => pop(o),
    '$': (o: ProgramState) => {
        const [x, y] = [pop(o), pop(o)]
        push(o, x);
        push(o, y);
    },
    '@': (o: ProgramState) => {
        const [x, y, z] = [pop(o), pop(o), pop(o)];
        push(o, x); push(o, z); push(o, y);
    },
    '{': (o: ProgramState) => {
        let a = o.stacks[o.stacks.length - 1].contents.shift();
        push(o, a as number);
    },
    '}': (o: ProgramState) => {
        let a = o.stacks[o.stacks.length - 1].contents.pop();
        o.stacks[o.stacks.length - 1].contents.unshift(a as number);
    },
    'r': (o: ProgramState) => {
        o.stacks[o.stacks.length - 1].contents.reverse();
    },
    'l': (o: ProgramState) => {
        push(o, o.stacks[o.stacks.length - 1].contents.length)
    },
    '[': (o: ProgramState) => {
        let number = pop(o);

        const new_stack: number[] = [];
        for (let i = 0; i < number; i++) {
            new_stack.push(pop(o));
        }
        new_stack.reverse;
        o.stacks.push(
            {
                contents: new_stack,
                register: undefined
            }
        )
    },
    ']': (o: ProgramState) => {
        let last_stack = o.stacks.pop();
        if (last_stack !== undefined && o.stacks.length >= 1) {
            o.stacks[o.stacks.length - 1].contents = o.stacks[o.stacks.length - 1].contents.concat(last_stack.contents)
        } else {
            throw new Error("No stack to pop")
        }
    },

    // Input/Output
    'o': (o: ProgramState) => {
        o.output(pop(o))
    },
    'n': (o: ProgramState) => {
        let res: string = '' + pop(o);
        for (let i = 0; i < res.length; i++) {
            o.output(res.charCodeAt(i))
        }
    },
    'i': (o: ProgramState) => {
        push(o, o.input())
    },

    // Reflection
    '&': (o: ProgramState) => {
        let last_stack = o.stacks[o.stacks.length - 1];
        if (last_stack.register === undefined) {
            last_stack.register = pop(o)
        } else {
            push(o, last_stack.register);
            last_stack.register = undefined;
        }
    },
    'g': (o: ProgramState) => {
        let [y, x] = [pop(o), pop(o)];
        push(
            o,
            o.program[y].charCodeAt(x)
        )
    },
    'p': (o: ProgramState) => {
        let [y, x, v] = [pop(o), pop(o), pop(o)];
        o.program[y] = o.program[y].substring(0, x) + String.fromCharCode(v) + o.program[y].substring(x + 1);
    },
    ';': (o: ProgramState) => {
        o.stopped = true;
    }


}

export function step(o: ProgramState) {
    let token = o.program[o.cursor[1]][o.cursor[0]];
    if (o.string_parsing_mode !== undefined) {
        if (token === o.string_parsing_mode) {
            o.string_parsing_mode = undefined
        } else {
            push(o, token.charCodeAt(0));
        }
    }

    else if (token === ' ') {

    } else if (Object.hasOwnProperty.call(commands, token)) {
        commands[token](o);
    }
    o.cursor[0] += o.cursor_direction[0];
    o.cursor[1] += o.cursor_direction[1];

    const program_size = [
        o.program[0].length,
        o.program.length
    ]

    o.cursor[0] = (o.cursor[0] + program_size[0]) % program_size[0];
    o.cursor[1] = (o.cursor[1] + program_size[1]) % program_size[1];
}