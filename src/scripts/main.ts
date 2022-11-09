import { step, ProgramState } from './interpreter';
import { examples } from './examples';
import { start_code_info_event_listeners } from './update_code_info';
import { PathDrawer } from './gen_svg';

const play_button_label = "⏵ Start"
const pause_button_label = "⏸︎ Pause"

const program_div = document.getElementById('program') as HTMLDivElement;
const stack_div = document.getElementById('stack') as HTMLDivElement;
const input_queue_div = document.getElementById('input-queue') as HTMLDivElement;
const output_div = document.getElementById('output') as HTMLDivElement;
const cursor_postion_box = document.getElementById('cursor-postion-box') as HTMLDivElement;
const register_box = document.getElementById('register-box') as HTMLDivElement;

const code_textarea = document.getElementById('code') as HTMLTextAreaElement;
const examples_select = document.getElementById('examples') as HTMLSelectElement;

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
const path_drawer = new PathDrawer();

function load_data_from_hash() {
    if (window.location.hash) {

        let data;
        try {
            data = JSON.parse(
                atob(window.location.hash.substring(1))
            )
        } catch {
            // Fallback to old version
            data = JSON.parse(
                decodeURIComponent(window.location.hash.substring(1))
            )
        }
        input_mode = data.mode;
        code_textarea.value = data.text;
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
    program_div.replaceChildren(...text_with_cursor(o.program, o.cursor));
    stack_div.innerText = o.stacks.map(i => i.contents.map(j => '' + j).join(' ')).join('\n');

    cursor_postion_box.textContent = JSON.stringify(o.cursor);
    register_box.textContent = o.stacks.map(i => i.register).join(', ');
}

let program_state: ProgramState = {
    stacks: [{ contents: [], register: undefined }],
    program: ['a'],
    cursor: [0, 0],
    cursor_direction: [1, 0],
    string_parsing_mode: undefined,
    input: () => 0,
    output: (o: number) => undefined,
    stopped: false
}

function end_update_loop_if_active() {
    if (started_task_id != undefined) {
        clearInterval(started_task_id);
        started_task_id = undefined;
        start_button.innerText = play_button_label
    }
}

function enable_editor() {
    console.log("Editor enabled");
    program_div.style.display = 'none';
    code_textarea.style.display = 'block';
}

function reset() {
    output_div.textContent = "";

    let program = code_textarea.value.split('\n');
    program_div.style.display = 'block';
    code_textarea.style.display = 'none';
    let longest_line = program.reduce((a, b) => Math.max(a, b.length), 0);
    program = program.map(
        i => i.padEnd(longest_line)
    )

    let size = program_div.getClientRects()[0];
    let text_size = Math.max(
        Math.min(
            0.8 * size.width / longest_line,
            0.8 * size.height / program.length,
            80
        ),
        12
    );
    program_div.style.fontSize = `${text_size}px`;
    code_textarea.style.fontSize = `${text_size}px`;

    let initial_stack_values: number[];
    if (input_mode === 'chars' || initial_stack.value === "") {
        initial_stack_values = [...initial_stack.value].map(i => i.charCodeAt(0));
    } else {
        initial_stack_values = initial_stack.value.split(' ').map(i => Number.parseFloat(i));
    }

    input_queue_div.textContent = initial_input.value;

    program_state = {
        stacks: [{ contents: initial_stack_values, register: undefined }],
        program: program,
        cursor: [0, 0],
        cursor_direction: [1, 0],
        string_parsing_mode: undefined,
        input: () => {
            let val = input_queue_div.textContent ?? "";
            input_queue_div.textContent = val.substring(1);
            return val ? val.charCodeAt(0) : -1;
        },
        output: (o: number) => {
            output_div.textContent += String.fromCharCode(o);
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
        try {
            step(program_state);
            path_drawer.tile([program_state.cursor[0], program_state.cursor[1]]);

        } catch (ex) {
            let error = document.createElement('span');
            error.textContent = "Something Smells fishy: " + (ex as Error).message;
            error.style.color = "red";
            output_div.appendChild(error);
            program_state.stopped = true;
            has_started = false;
            end_update_loop_if_active()
        }
        update_ui_for_program(program_state);
    } else {
        console.log("Program ended, started_task_id = ", started_task_id);
        end_update_loop_if_active();
    }
}

start_button.addEventListener(
    'click', () => {
        if (started_task_id === undefined) {
            started_task_id = setInterval(step_and_update, 128);
            start_button.innerText = pause_button_label;
        } else {
            clearInterval(started_task_id);
            started_task_id = undefined;
            start_button.innerText = play_button_label;
        }
    }
)

reset_button.addEventListener(
    'click', () => {
        end_update_loop_if_active();
        enable_editor();
        has_started = false;
        update_ui_for_program(program_state);

        let svg = path_drawer.gen_svg(program_state.program[0].length, program_state.program.length);
        let svg_source = '<?xml version="1.0" encoding="UTF-8" standalone="no"?><svg xmlns="http://www.w3.org/2000/svg" viewBox="' + svg.getAttribute('viewBox')
            + '">' + svg.innerHTML + "</svg>";
        code_textarea.style.backgroundImage = 'url("data:image/svg+xml,' + encodeURIComponent(svg_source) + '")';
        code_textarea.style.backgroundSize = (14 / 12) * program_state.program[0].length + 'em';

        path_drawer.reset();
        document.body.appendChild(svg);
    }
)

step_button.addEventListener(
    'click', () => {
        end_update_loop_if_active();
        step_and_update();
    }
)

examples_select.addEventListener('change', () => {
    code_textarea.value = examples_select.value;
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
            "text": code_textarea.value,
            "input": initial_input.value,
            "stack": initial_stack.value,
            "mode": input_mode
        }
    );
    //window.location.hash = '#' + encodeURIComponent(hash_value).replace('(', '%28').replace(')', '%29');
    window.location.hash = '#' + btoa(hash_value);
    localStorage.setItem('last_program', hash_value);
}

code_textarea.addEventListener('change', update_url_hash);
initial_input.addEventListener('change', update_url_hash);
initial_stack.addEventListener('change', update_url_hash);

for (let example of examples) {
    let option = document.createElement('option');
    option.innerText = example.name;
    option.value = example.code;
    examples_select.appendChild(option);
}

load_data_from_hash();
start_code_info_event_listeners(code_textarea);