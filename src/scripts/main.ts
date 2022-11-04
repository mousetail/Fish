import { step, ProgramState } from './interpreter';
import { examples } from './examples';


let program = document.getElementById('program') as HTMLDivElement;
let stack = document.getElementById('stack') as HTMLDivElement;
let input_queue = document.getElementById('input-queue') as HTMLDivElement;
let output = document.getElementById('output') as HTMLDivElement;
const cursor_postion_box = document.getElementById('cursor-postion-box') as HTMLDivElement;
const register_box = document.getElementById('register-box') as HTMLDivElement;

let code = document.getElementById('code') as HTMLTextAreaElement;
let examples_select = document.getElementById('examples') as HTMLSelectElement;

const start_button = document.getElementById('start') as HTMLButtonElement;
const step_button = document.getElementById('step') as HTMLButtonElement;
const reset_button = document.getElementById('reset') as HTMLButtonElement;

const chars_button = document.getElementById('chars') as HTMLButtonElement;
const numbers_button = document.getElementById('numbers') as HTMLButtonElement;

const initial_stack = document.getElementById('initial-stack') as HTMLInputElement;
const initial_input = document.getElementById('initial-input') as HTMLInputElement;

let input_mode: 'numbers' | 'chars' = 'numbers';
let started_task_id: number | undefined = undefined;
let has_started = false;

function load_data_from_hash() {
    if (window.location.hash) {
        console.log(decodeURIComponent(window.location.hash))
        let data = JSON.parse(
            decodeURIComponent(window.location.hash.substring(1))
        )
        input_mode = data.mode;
        code.value = data.text;
        initial_input.value = data.input;
        initial_stack.value = data.stack;
    }
}

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

    cursor_postion_box.textContent = JSON.stringify(o.cursor);
    register_box.textContent = o.stacks.map(i => i.register).join(', ');
}

let program_state: ProgramState = {
    stacks: [{ contents: [], register: undefined }],
    program: ['"hello, world"r\\', '    ~~~   o;!?l<'],
    cursor: [0, 0],
    cursor_direction: [1, 0],
    string_parsing_mode: undefined,
    input: () => 0,
    output: (o: number) => undefined,
    stopped: false
}

function reset() {
    output.textContent = "";

    let program = code.value.split('\n');
    let longest_line = program.reduce((a, b) => Math.max(a, b.length), 0);
    program = program.map(
        i => i.padEnd(longest_line)
    )

    let initial_stack_values: number[];
    if (input_mode === 'chars' || initial_stack.value === "") {
        initial_stack_values = [...initial_stack.value].map(i => i.charCodeAt(0));
    } else {
        initial_stack_values = initial_stack.value.split(' ').map(i => Number.parseFloat(i));
    }

    input_queue.textContent = initial_input.value;

    program_state = {
        stacks: [{ contents: initial_stack_values, register: undefined }],
        program: program,
        cursor: [0, 0],
        cursor_direction: [1, 0],
        string_parsing_mode: undefined,
        input: () => {
            let val = input_queue.textContent ?? "";
            input_queue.textContent = val.substring(1);
            return val ? val.charCodeAt(0) : -1;
        },
        output: (o: number) => {
            output.textContent += String.fromCharCode(o);
        },
        stopped: false
    }

    has_started = true;
}

function step_and_update() {
    if (!has_started) {
        console.log("Program has not yet started, resetting");
        reset();
        has_started = true;
    }

    if (!program_state.stopped) {
        step(program_state);
        update_ui_for_program(program_state);
    } else {
        console.log("Program ended");
        if (started_task_id != undefined) {
            clearInterval(started_task_id);
            started_task_id = undefined;
            start_button.innerText = 'Start'
            has_started = false;
        }
    }
}

start_button.addEventListener(
    'click', () => {
        if (started_task_id === undefined) {
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
    'click', () => {
        if (started_task_id !== undefined) {
            clearInterval(started_task_id);
        }; reset(); update_ui_for_program(program_state);
    }
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

chars_button.addEventListener('click', () => {
    input_mode = 'chars';
    chars_button.disabled = true;
    numbers_button.disabled = false;

    update_url_hash();
})

numbers_button.addEventListener('click', () => {
    input_mode = 'numbers';
    chars_button.disabled = false;
    numbers_button.disabled = true;

    update_url_hash();
})

numbers_button.click();

function update_url_hash() {
    let hash_value = JSON.stringify(
        {
            "text": code.value,
            "input": initial_input.value,
            "stack": initial_stack.value,
            "mode": input_mode
        }
    );
    window.location.hash = '#' + encodeURIComponent(hash_value);
    localStorage.setItem('last_program', hash_value);
}

code.addEventListener('change', update_url_hash);
initial_input.addEventListener('change', update_url_hash);
initial_stack.addEventListener('change', update_url_hash);

load_data_from_hash();