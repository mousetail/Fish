
const svg_namespace = "http://www.w3.org/2000/svg";

export class PathDrawer {
    maps: Map<string, number>;
    previous_cursor_positon: [[number, number], [number, number]];

    constructor() {
        this.maps = new Map<string, number>();
        this.previous_cursor_positon = [[-1, 0], [0, 0]];
    }

    tile(tile: [number, number]) {
        this.edge(this.previous_cursor_positon[0], this.previous_cursor_positon[1], tile);
        this.previous_cursor_positon = [this.previous_cursor_positon[1], tile];
    }

    edge(from: [number, number], via: [number, number], to: [number, number]) {
        const pos = JSON.stringify([via[0], via[1], from[0] - via[0], from[1] - via[1], to[0] - via[0], to[1] - via[1]]);
        this.maps.set(pos, (this.maps.get(pos) ?? 0) + 1)
    }

    gen_svg(width: number, height: number): SVGElement {
        console.log(this.maps);
        let svg = document.createElementNS(svg_namespace, "svg");
        svg.setAttribute('style', `width:${20 * width}px; height:${20 * height}`);
        svg.setAttribute('viewBox', `-1 -1 ${width * 2} ${height * 2}`)

        for (let x = 0; x < width; x++) {
            for (let y = 0; y < height; y++) {
                for (let tile of this.gen_tile(x, y)) {
                    svg.appendChild(tile);
                }
            }
        }

        return svg;
    }

    gen_tile(x: number, y: number): SVGPathElement[] {


        const paths = [
            [0, 1],
            [1, 0],
            [-1, 0],
            [0, -1]
        ];

        let out: SVGPathElement[] = [];

        for (let path1 of paths) {
            for (let path2 of paths) {
                if (path1[0] != path2[0] || path1[1] != path2[1]) {
                    let width = this.maps.get(JSON.stringify([x, y, path1[0], path1[1], path2[0], path2[1]])) ?? 0;


                    if (width == 0) {
                        continue;
                    }
                    let color: string;
                    if (width === 1) {
                        color = 'red';
                    } else if (width < 10) {
                        color = `rgb(${255 * (10 - width) / 10},${255 * width / 20},0)`;
                    } else if (width < 100) {
                        color = `rgb(0,${255 * (90 - width + 10) / 90},${255 * (width - 10) / 90})`;
                    } else {
                        color = 'white';
                    }

                    console.log(`x: ${x} y: ${y} width:${width} pos: ${[x, y, path1[0], path1[1], path2[0], path2[1]]}`);

                    let path = document.createElementNS(svg_namespace, "path") as SVGPathElement;
                    path.setAttribute('stroke', color);
                    path.setAttribute('stroke-width', '0.5');
                    path.setAttribute('d', `M ${x * 2 + path1[0]} ${y * 2 + path1[1]} Q ${x * 2} ${y * 2} ${x * 2 + path2[0]} ${y * 2 + path2[1]}`)
                    out.push(path);
                }
            }
        }

        return out;
    }

    reset() {
        this.maps = new Map<string, number>();
        this.previous_cursor_positon = [[-1, 0], [0, 0]];
    }
}