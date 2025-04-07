'use client'

import { createRef, Ref, useEffect } from "react";
import * as d3 from "d3";

const rainbow = (numOfSteps: number, step: number) => {
    // This function generates vibrant, "evenly spaced" colours (i.e. no clustering). This is ideal for creating easily distinguishable vibrant markers in Google Maps and other apps.
    // Adam Cole, 2011-Sept-14
    // HSV to RBG adapted from: http://mjijackson.com/2008/02/rgb-to-hsl-and-rgb-to-hsv-color-model-conversion-algorithms-in-javascript
    const r, g, b;
    const  h = step / numOfSteps;
    const i = ~~(h * 6);
    const f = h * 6 - i;
    const q = 1 - f;
    switch(i % 6){
        case 0: r = 1; g = f; b = 0; break;
        case 1: r = q; g = 1; b = 0; break;
        case 2: r = 0; g = 1; b = f; break;
        case 3: r = 0; g = q; b = 1; break;
        case 4: r = f; g = 0; b = 1; break;
        case 5: r = 1; g = 0; b = q; break;
    }
    const c = "#" + ("00" + (~ ~(r * 255)).toString(16)).slice(-2) + ("00" + (~ ~(g * 255)).toString(16)).slice(-2) + ("00" + (~ ~(b * 255)).toString(16)).slice(-2);
    return (c);

}

class CoralBase {
    x: number;
    y: number;
    width: number;
    height: number;
    children: CoralBranch[];
    svgRef: Ref<SVGElement>;

    constructor(x: number, y: number, width: number, height: number, svgRef: Ref<SVGElement>) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.children = [new CoralBranch(), new CoralBranch(), new CoralBranch()];
        this.svgRef = svgRef;
    }

    draw() {
        if (!this.svgRef) return;
        const svg = d3.select(this.svgRef.current);
        svg.selectAll('*').remove();
        this.children.forEach((child: CoralBranch, i) => {
            const angle = (((2 * Math.PI)/this.children.length) * i) - (Math.PI / 2);
            const branchAngle = ((2 * Math.PI)/this.children.length) / 4;
            child.draw(this.width / 2, this.height / 2, angle, branchAngle, this.svgRef, rainbow(this.children.length, i), 200, 5);
        });
    }
}

class CoralBranch {
    children: [number, CoralBranch][];
    thickness: number;
    constructor() {
        this.children = [];
    }

    draw(x: number, y: number, relativeAngle: number, branchAngle: number, svgRef: Ref<SVGElement>, color: string, length: number, thickness: number) {
        if (!svgRef) return;
        const svg = d3.select(svgRef.current);
        
        const position = (x: number, y: number, angle: number, percent: number) => {
            return [((length * percent) * Math.cos(angle)) + x, ((length * percent) * Math.sin(relativeAngle)) + y]
        }

        svg
            .append('line')
            .attr('x1', x)
            .attr('y1', y)
            .attr('x2', (length * Math.cos(relativeAngle)) + x)
            .attr('y2', (length * Math.sin(relativeAngle)) + y)
            .attr('stroke', color)
            .attr('stroke-linecap', 'round')
            .attr('stroke-width', thickness);
        
        this.children.forEach((child: [number, CoralBranch], i) => {
            const pos = position(x, y, relativeAngle, child[0]);
            const branchSide = [-1,1][i % 2]
            child[1].draw(pos[0], pos[1], relativeAngle + (branchAngle * branchSide), branchAngle / 2, svgRef, color, length * 0.65, thickness * 0.85);
            
            svg
                .append('circle')
                .attr('cx', pos[0])
                .attr('cy', pos[1])
                .attr('fill', "white")
                .attr('r', thickness);
            });
    }
}

export default function Coral({width, height}) {
  const ref = createRef<SVGElement>();
  const coral = new CoralBase(width / 2, height / 2, width, height, ref);

  coral.children[0].children.push([0.25, new CoralBranch()]);
  coral.children[0].children.push([0.4, new CoralBranch()]);

  coral.children[0].children[0][1].children.push([0.5, new CoralBranch()]);

  coral.children[1].children.push([0.25, new CoralBranch()]);

  coral.children[1].children[0][1].children.push([0.5, new CoralBranch()]);

  useEffect(() => {
    coral.draw();
  })
    
  coral.draw();
  return <svg width={width} height={height} ref={ref} />;
}
