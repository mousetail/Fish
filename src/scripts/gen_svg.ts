
const svg_namespace = "http://www.w3.org/2000/svg";

function lerp(from_start: number, from_end: number, to_start: number, to_end: number, x: number): number {
    return (x - from_start) / (from_end - from_start) * (to_end - to_start) + to_start
}

function get_path_offset(diff: number, width: number): number {
    diff = (diff + width / 2) % width - width / 2
    return Math.sign(diff);
}

export class PathDrawer {
    maps: Map<string, number>;
    previous_cursor_positon: [[number, number], [number, number]];

    constructor() {
        this.maps = new Map<string, number>();
        this.previous_cursor_positon = [[-1, 0], [0, 0]];
    }

    tile(tile: [number, number], width: number, height: number) {
        this.edge(this.previous_cursor_positon[0], this.previous_cursor_positon[1], tile, width, height);
        this.previous_cursor_positon = [this.previous_cursor_positon[1], tile];
    }

    edge(from: [number, number], via: [number, number], to: [number, number], width: number, height: number) {
        const pos = JSON.stringify(
            [
                via[0], via[1],
                get_path_offset(from[0] - via[0], width),
                get_path_offset(from[1] - via[1], height),
                get_path_offset(to[0] - via[0], width),
                get_path_offset(to[1] - via[1], height)
            ]);
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
                        color = `rgb(${lerp(1, 10, 0, 255, width)},${lerp(1, 10, 155, 0, width)},0)`;
                    } else if (width < 25) {
                        color = `rgb(0, 155, ${lerp(10, 25, 0, 255, width)})`
                    }
                    else if (width < 100) {
                        color = `rgb(0,${lerp(25, 100, 255, 0, width)},255)`;
                    } else {
                        color = 'white';
                    }

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