function createInput(value: string): HTMLDivElement {
    let div = document.createElement('div');
    let link_input = document.createElement('input');
    link_input.readOnly = true;
    link_input.value = value;
    div.appendChild(link_input);

    let copy_link = document.createElement('button');
    copy_link.innerText = 'copy';
    div.appendChild(copy_link);

    copy_link.addEventListener('click', () => {
        link_input.focus();
        link_input.select();
        console.log("Copying is ", document.execCommand('copy'));
    });


    return div;
}

export function show_copy_dialog(code_text: string) {
    let dialog = document.createElement('div');
    dialog.classList.add('modal');

    dialog.appendChild(createInput(window.location.href));

    dialog.appendChild(createInput(code_text));

    dialog.appendChild(createInput("alpha beta"));

    document.body.appendChild(dialog);
}