import P from './Point';
import each from 'lodash/each';
import range from 'lodash/range';
import Vertex from './Vertex';
import Edge from './Edge';
import { applyElectrostatic, applySpring, applyCenterMovement } from './forces';
import { constructQuadTree } from './utils';

const { random } = Math;

const canvas = <HTMLCanvasElement>document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const frame = 1000 / 60;



const side = 1000;
const window = 250;


// const nodes = range(floor(random() * 15))
const nodes = range(7)
    .map(() => {
        const x = (side - window) / 2 + random() * window;
        const y = (side - window) / 2 + random() * window;
        return new Vertex(x, y);
    });

const edges = range(4)
    .map(num => {
        const aIndex = num;
        const bIndex = num + 1;
        const nodeA = nodes[aIndex];
        const nodeB = nodes[bIndex];
        return new Edge(nodeA, nodeB);
    })
    .concat([
        new Edge(nodes[1], nodes[4]),
        new Edge(nodes[6], nodes[4]),
        new Edge(nodes[6], nodes[5]),
        new Edge(nodes[1], nodes[3]),
    ]);



canvas.addEventListener("touchstart", handleStart, false);
// canvas.addEventListener("touchend", handleEnd, false);
// canvas.addEventListener("touchcancel", handleCancel, false);
// canvas.addEventListener("touchmove", handleMove, false);

function handleStart(event: TouchEvent) {
    event.preventDefault();
    console.log(event);
}



// const { width, height } = canvas;
const width = +canvas.getAttribute('width');
const height = +canvas.getAttribute('height');
// const center = { x: width / 2, y: height / 2 };
const center = new P(width / 2, height / 2);



Updater(ctx, () => {

    applyElectrostatic(nodes, new P(width, height));
    applySpring(edges);
    applyCenterMovement(nodes, center);

    each(nodes, node => {
        node.update();
        node.render(ctx);
    });

    each(edges, edge => {
        edge.render(ctx);
    });


});


// setTimeout(function () {
//     console.log(constructQuadTree(nodes, new P(0, 0), new P(width, height)));
// }, 1000);



function Updater(ctx: CanvasRenderingContext2D, func: () => void) {
    let lastUpdate = +new Date();

    function update() {
        ctx.beginPath();
        ctx.clearRect(0, 0, width, height);

        func();

        const now = +new Date();
        const msTillNextFrame = (lastUpdate + frame) - now;
        const timeTillUpdate = msTillNextFrame > 0 ? msTillNextFrame : 0;

        lastUpdate = now;
        setTimeout(update, timeTillUpdate);
    }

    update()
}
