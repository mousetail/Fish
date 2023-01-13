import { step, ProgramState, padProgram } from './interpreter';
import { examples } from './examples';
import { start_code_info_event_listeners } from './update_code_info';
import { PathDrawer } from './gen_svg';
import { show_copy_dialog } from './copy_dialog';
import { init_tabs } from './init_tabs';
import { load_explanation } from './explanation_manager';

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

const initial_stack = document.getElementById('initial-stack') as HTMLInputElement;
const initial_input = document.getElementById('initial-input') as HTMLInputElement;
const fast_forward_checkbox = document.getElementById('fast-forward') as HTMLInputElement;

let stack_format: 'numbers' | 'chars' = 'numbers';
let input_format: 'numbers' | 'chars' = 'chars';
let started_task_id: number | undefined = undefined;
let has_started = false;
const path_drawer = new PathDrawer();
let previous_blob: string | undefined = undefined;
let url_data_loaded = false;

const set_stack_format = init_tabs<'chars' | 'numbers'>(
    [
        {
            id: 'stack-tab-chars',
            value: 'chars'
        },
        {
            id: 'stack-tab-numbers',
            value: 'numbers'
        }
    ],
    (value) => { stack_format = value; update_url_hash() },
    'numbers'
)

const set_input_format = init_tabs<'chars' | 'numbers'>(
    [
        {
            id: 'input-tab-chars',
            value: 'chars'
        },
        {
            id: 'input-tab-numbers',
            value: 'numbers'
        }
    ],
    (value) => { input_format = value; update_url_hash() },
    'chars'
)


function load_data_from_hash() {
    url_data_loaded = true;
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

        console.log("loading data from url", data);
        code_textarea.value = data.text;
        initial_input.value = data.input;
        initial_stack.value = data.stack;
        set_stack_format(data.stack_format ?? data.mode ?? 'numbers');
        set_input_format(data.input_format ?? data.mode ?? 'chars');
    }
}

function format_char(char: number) {
    if (char === 0 || char === 32) {
        return ' '
    } else if (char >= 33 && char % 1 == 0) {
        return String.fromCodePoint(char)
    } else {
        return '�'
    }
}

function text_with_cursor(program: number[][], cursor: [number, number]): (string | Node)[] {
    let text = program.map(line => line.map(format_char).join(''))

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
    program: [[32]],
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
    program_div.style.display = 'none';
    code_textarea.style.display = 'block';
}

function reset() {
    output_div.textContent = "";

    let program: number[][] = code_textarea.value.split('\n').map(i => [...i].map(j => j.codePointAt(0) as number));
    program_div.style.display = 'block';
    code_textarea.style.display = 'none';
    let longest_line = program.reduce((a, b) => Math.max(a, b.length), 0);

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
    if (stack_format === 'chars' || initial_stack.value === "") {
        initial_stack_values = [...initial_stack.value].map(i => i.charCodeAt(0));
    } else {
        initial_stack_values = initial_stack.value.split(' ').map(i => i.trim().replace(/,+$/, "")).filter(i => i).map(i => Number.parseFloat(i));
    }

    const input_queue = input_format === 'chars' ? [...initial_input.value].map(i => i.charCodeAt(0)) : initial_input.value.split(' ').map(i => Number.parseFloat(i));
    input_queue_div.textContent = input_queue.join(' ');

    padProgram(program);

    program_state = {
        stacks: [{ contents: initial_stack_values, register: undefined }],
        program: program,
        cursor: [0, 0],
        cursor_direction: [1, 0],
        string_parsing_mode: undefined,
        input: () => {
            input_queue.reverse();
            let val = input_queue.pop() ?? -1;
            input_queue.reverse();
            input_queue_div.textContent = input_queue.join(' ');
            return val;
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
            path_drawer.tile([program_state.cursor[0], program_state.cursor[1]], program_state.program[0].length,
                program_state.program.length);

        } catch (ex) {
            let error = document.createElement('span');
            error.textContent = "Something Smells fishy: " + (ex as Error).message;
            error.style.color = "red";
            output_div.appendChild(error);
            program_state.stopped = true;
            has_started = false;
            generateBackgroundImage();
            end_update_loop_if_active()
        }
        update_ui_for_program(program_state);
    } else {
        console.log("Program ended, started_task_id = ", started_task_id);
        generateBackgroundImage();
        end_update_loop_if_active();
        enable_editor();
        path_drawer.reset();
    }
}

start_button.addEventListener(
    'click', () => {
        if (started_task_id === undefined) {
            if (!has_started) {
                reset();
                has_started = true;
            }

            started_task_id = setInterval(() => {
                let iteration = fast_forward_checkbox.checked ? 5 : 1;
                for (let i = 0; i < iteration; i++) {
                    step_and_update();
                    if (program_state.stopped) {
                        break;
                    }
                }
            }, 128);
            start_button.innerText = pause_button_label;
        } else {
            clearInterval(started_task_id);
            started_task_id = undefined;
            start_button.innerText = play_button_label;
        }
    }
)

function generateBackgroundImage() {
    let svg = path_drawer.gen_svg(program_state.program[0].length, program_state.program.length);
    let svg_source = '<?xml version="1.0" encoding="UTF-8" standalone="no"?><svg xmlns="http://www.w3.org/2000/svg" viewBox="' + svg.getAttribute('viewBox')
        + '">' + svg.innerHTML + "</svg>";

    const blob = URL.createObjectURL(new Blob([svg_source], { type: "image/svg+xml" }));
    code_textarea.style.backgroundImage = 'url("' + blob + '")';
    code_textarea.style.backgroundSize = (12 / 12) * program_state.program[0].length + 'em';
    program_div.style.backgroundImage = 'url("' + blob + '")';
    program_div.style.backgroundSize = (12 / 12) * program_state.program[0].length + 'em';

    if (previous_blob !== undefined) {
        URL.revokeObjectURL(previous_blob);
    }
    previous_blob = blob;
}

reset_button.addEventListener(
    'click', () => {
        end_update_loop_if_active();
        enable_editor();
        has_started = false;
        update_ui_for_program(program_state);

        generateBackgroundImage();
        path_drawer.reset();
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
    load_explanation(examples.find(i => i.code === examples_select.value)!);
})

document.getElementById('copy')?.addEventListener('click',
    () => {
        show_copy_dialog(code_textarea.value);
    })

function update_url_hash() {
    if (!url_data_loaded) {
        return;
    }
    let hash_value = JSON.stringify(
        {
            "text": code_textarea.value,
            "input": initial_input.value,
            "stack": initial_stack.value,
            "stack_format": stack_format,
            "input_format": input_format
        }
    );

    console.log("saved data in URL", hash_value);

    window.location.hash = '#' + btoa(hash_value);
    localStorage.setItem('last_program', hash_value);
}

for (let example of examples) {
    let option = document.createElement('option');
    option.innerText = example.name;
    option.value = example.code;
    examples_select.appendChild(option);
}

load_data_from_hash();
start_code_info_event_listeners(code_textarea);

code_textarea.addEventListener('change', update_url_hash);
initial_input.addEventListener('change', update_url_hash);
initial_stack.addEventListener('change', update_url_hash);
