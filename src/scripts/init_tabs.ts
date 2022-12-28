interface Tab<T> {
    id: string,
    value: T
}

export function init_tabs<T>(tabs: Tab<T>[], onChange: (a: T) => void, initial_value: T): (a: T) => void {
    let new_tabs = tabs.map((i) => ({
        elem: document.getElementById(i.id) as HTMLButtonElement,
        value: i.value
    }))

    function updateChange(newValue: T) {
        new_tabs.forEach(
            tab => tab.elem.disabled = newValue === tab.value
        );
        onChange(newValue);
    }

    tabs.forEach((tab) => {
        let tab_element = document.getElementById(tab.id) as HTMLButtonElement;

        tab_element.addEventListener('click', () => {
            updateChange(tab.value);
        })
    })

    updateChange(initial_value);

    return updateChange;
}