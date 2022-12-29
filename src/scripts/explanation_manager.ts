import { init_tabs } from "./init_tabs";
import { ExampleProgram } from "./examples";

const explanation_tabs = document.getElementById("explanation-bar") as HTMLDivElement;

const set_tab = init_tabs<"example"|"cheat-sheet">(
    [
        {
            id: 'tab-explanation-cheat-sheet',
            value: 'cheat-sheet'
        }, 
        {
            id: 'tab-explanation-example',
            value: 'example'
        }
    ],
    (value)=>{
        if (value === 'example') {
            (document.getElementById('tab-content-cheat-sheet') as HTMLDivElement).style.display = 'none';
            (document.getElementById('tab-content-example') as HTMLDivElement).style.display = 'block';
        } else if (value === 'cheat-sheet') {
            (document.getElementById('tab-content-cheat-sheet') as HTMLDivElement).style.display = 'block';
            (document.getElementById('tab-content-example') as HTMLDivElement).style.display = 'none';
        }
    },
    'cheat-sheet'
)

export function load_explanation(example: ExampleProgram) {
    if (example.explanation !== undefined) {
        explanation_tabs.style.display = 'flex';
        (document.getElementById('tab-content-example') as HTMLDivElement).innerHTML = example.explanation;
        set_tab("example");
    }
}