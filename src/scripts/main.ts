import { step, ProgramState } from './interpreter';
import { examples } from './examples';


let program = document.getElementById('program') as HTMLDivElement;
let stack = document.getElementById('stack') as HTMLDivElement;
let input_queue = document.getElementById('input-queue') as HTMLDivElement;
let output = document.getElementById('output') as HTMLDivElement;

let code = document.getElementById('code') as HTMLTextAreaElement;
let examples_select = document.getElementById('examples') as HTMLSelectElement;

const start_button = document.getElementById('start') as HTMLButtonElement;
const step_button = document.getElementById('step') as HTMLButtonElement;
const reset_button = document.getElementById('reset') as HTMLButtonElement;

function text_with_cursor(text: string[], cursor: [number, number]): (string | Node)[] {
    let text_before = text.slice(0, cursor[1]).map(i => i + '\n').join('') + text[cursor[1]].substring(0, cursor[0]);
    let text_after = text[cursor[1]].substring(cursor[0] + 1) + '\n' + text.slice(cursor[1] + 1).map(i => i + '\n').join('');

    let span = document.createElement('span');
    span.innerText = text[cursor[1]][cursor[0]];
    span.classList.add('cursor');
    return [
        text_before,
        span,
        text_after
    ]
}

function update_ui_for_program(o: ProgramState) {
    program.replaceChildren(...text_with_cursor(o.program, o.cursor));
    stack.innerText = o.stacks.map(i => i.contents.map(j => '' + j).join(' ')).join('\n');
}

let program_state: ProgramState = {
    stacks: [{ contents: [], register: undefined }],
    program: ['"hello, world"r\\', '    ~~~   o;!?l<'],
    cursor: [0, 0],
    cursor_direction: [1, 0],
    string_parsing_mode: undefined,
    input: () => {
        let val = input_queue.textContent ?? "";
        input_queue.textContent = val.substring(1);
        return val.charCodeAt(0) ?? -1;
    },
    output: (o: number) => {
        output.textContent += String.fromCharCode(o);
    },
    stopped: false
}

function reset() {
    if (started_task_id !== undefined) {
        clearInterval(started_task_id);
    }

    output.textContent = "";

    let program = code.value.split('\n');
    let longest_line = program.reduce((a, b) => Math.max(a, b.length), 0);
    program = program.map(
        i => i.padEnd(longest_line)
    )

    program_state = {
        stacks: [{ contents: [], register: undefined }],
        program: program,
        cursor: [0, 0],
        cursor_direction: [1, 0],
        string_parsing_mode: undefined,
        input: () => {
            let val = input_queue.textContent ?? "";
            input_queue.textContent = val.substring(1);
            return val.charCodeAt(0) ?? -1;
        },
        output: (o: number) => {
            output.textContent += String.fromCharCode(o);
        },
        stopped: false
    }
}

function step_and_update() {
    if (!program_state.stopped) {
        step(program_state);
        update_ui_for_program(program_state);
    }
}

let started_task_id: number | undefined = undefined;
let has_started = false;

start_button.addEventListener(
    'click', () => {
        if (started_task_id === undefined) {
            if (!has_started || program_state.stopped) {
                reset();
                has_started = true;
            }

            started_task_id = setInterval(step_and_update, 128);
            start_button.innerText = 'Pause'
        } else {
            clearInterval(started_task_id);
            started_task_id = undefined;
            start_button.innerText = 'Start'
        }
    }
)

reset_button.addEventListener(
    'click', () => { reset(); update_ui_for_program(program_state); }
)

step_button.addEventListener(
    'click', () => {
        step_and_update();
    }
)

for (let example of examples) {
    let option = document.createElement('option');
    option.innerText = example.name;
    option.value = example.code;
    examples_select.appendChild(option);
}

examples_select.addEventListener('change', () => {
    code.value = examples_select.value;
})