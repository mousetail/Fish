const code_info = document.getElementById('code-info') as HTMLDivElement;

export function start_code_info_event_listeners(code: HTMLTextAreaElement) {
    const on_input = () => {
        let length = code.value.length;
        let cursor_position = code.selectionStart;
        let area_before = code.value.substring(0, cursor_position).split("\n");

        code_info.innerText = `Cursor at [${area_before[area_before.length - 1].length},${area_before.length - 1}], ${length} chars.`
    }
    //code.addEventListener('input', on_input);
    document.addEventListener('selectionchange', on_input);

    on_input();

}