import P, { random, floor, addVec, multiplyVec } from "./Point";
import VertexCreator from "./VertexCreator";
import {
  damping,
  vertexMass,
  vertexRadius,
  vertexCharge,
  nodeBodyColour,
  edgeColour,
  borderWidth
} from "./config";
import { uuid } from "./helpers";

class Vertex {
  id: string;
  position: P;
  velocity: P;
  stress: number;
  mass: number;
  charge: number;
  dragging: boolean;
  text: string;
  newlyCreatedBy: VertexCreator | null;

  constructor(x: number, y: number);
  constructor(point: P);
  constructor();
  constructor(xOrPoint?: P | number, yCoord?: number) {
    this.id = uuid();

    this.position =
      xOrPoint !== undefined
        ? yCoord !== undefined
          ? new P(<number>xOrPoint, yCoord)
          : new P(<P>xOrPoint)
        : new P();

    this.velocity = new P();
    this.stress = 0;

    this.mass = vertexMass;
    this.charge = vertexCharge;

    this.dragging = false;
  }

  getMomentum() {
    return this.velocity.multiply(this.mass);
  }

  isOnEdge(point: P) {
    const inCircle = this.position.isWithinRadius(
      point,
      vertexRadius + borderWidth / 2
    );
    const notInside = !this.position.isWithinRadius(
      point,
      vertexRadius - borderWidth / 2
    );

    return inCircle && notInside;
  }

  update() {
    if (!this.dragging) {
      // actual movement happens here
      // The rest is commentary
      this.velocity = this.velocity.multiply(1 - damping);
      this.position = this.position.add(this.velocity);
    }
  }

  applyForce(vector: P) {
    this.stress += vector.length();
    if (!this.dragging) {
      const momentum = vector.divide(this.mass);
      this.velocity = this.velocity.add(momentum);
    }
  }

  // applies movement directly without applying force - used mainly for centering
  applyMovement(vector: P) {
    if (!this.dragging) {
      this.position = this.position.add(vector);
    }
  }

  drag(position: P) {
    this.position = position;
  }

  destress() {
    this.stress = 0;
  }

  setText(text: string) {
    this.text = text;
  }

  render(ctx: CanvasRenderingContext2D) {
    // draws directly onto canvas
    const { x, y } = this.position;

    ctx.beginPath();
    ctx.arc(x, y, vertexRadius, 0, 2 * Math.PI);
    ctx.fillStyle = nodeBodyColour;
    ctx.fill();

    // ctx.lineWidth = 3 + .1 * this.stress;
    ctx.lineWidth = borderWidth;
    ctx.strokeStyle = edgeColour;
    ctx.stroke();

    if (this.text) {
      ctx.textBaseline = "middle";
      ctx.fillStyle = edgeColour;
      ctx.fillText(this.text, x + 10 + vertexRadius, y);
    }

    this.destress();
  }
}

export default Vertex;