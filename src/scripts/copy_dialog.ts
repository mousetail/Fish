function createInput(value: string, dialog: HTMLDivElement): HTMLDivElement {
    let div = document.createElement('div');
    div.classList.add('button-row');
    let link_input = document.createElement('textarea');
    link_input.style.flexGrow = "1";
    link_input.style.height = '2rem';
    link_input.style.fontSize = '1rem';
    link_input.style.overflow = "hidden";
    link_input.readOnly = true;
    link_input.value = value;
    div.appendChild(link_input);

    let copy_link = document.createElement('button');
    copy_link.innerText = 'copy';
    div.appendChild(copy_link);

    copy_link.addEventListener('click', () => {
        link_input.focus();
        link_input.select();
        document.execCommand('copy');

        setTimeout(
            () => document.body.removeChild(dialog),
            10
        );
    });


    return div;
}

function createHeader(text: string): HTMLHeadingElement {
    let header = document.createElement('h2');
    header.innerText = text;
    return header;
}

function escapeHTML(text: string): string {
    let div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function format_code_text(codeText: string) {
    return [...codeText].map(i => {
        const titleElement = i != '\n' && document.querySelector(`code[data-symbol*="${i.replace('\\', '\\\\').replace('"', '\\"')}"]`);
        if (titleElement) {
            const title = (titleElement.nextSibling?.textContent?.trim() ?? '').replace(/\s+/g, ' ');
            return `<img src="https://$" alt="${escapeHTML(i)}" title="${escapeHTML(title)}">`
        } else {
            return i;
        }
    }).join('')
}

export function show_copy_dialog(code_text: string) {
    let dialog = document.createElement('div');
    dialog.classList.add('modal');

    dialog.appendChild(createHeader('Link'));
    dialog.appendChild(createInput(window.location.href, dialog));

    dialog.appendChild(createHeader('Code'));
    dialog.appendChild(createInput(code_text, dialog));

    let encoded_text = new TextEncoder().encode(code_text);

    dialog.appendChild(createHeader('CGSE Post'));
    dialog.appendChild(createInput(`# [><> (Fish)](https://esolangs.org/wiki/Fish), ${encoded_text.length} bytes

`+ "<pre>" + `
${format_code_text(code_text)}
`+ "</pre>\n<sup>Hover over any symbol to see what it does</sup>\n\n" + `

[Try it](${window.location.href})

    `.trim(), dialog));

    let close_button = document.createElement('button');
    close_button.innerText = 'close';
    close_button.addEventListener('click',
        () => {
            document.body.removeChild(dialog);
        }
    )
    dialog.appendChild(close_button);

    document.body.appendChild(dialog);
}