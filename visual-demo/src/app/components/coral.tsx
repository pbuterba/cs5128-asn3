'use client'

import { createRef, Ref, useEffect } from "react";
import * as d3 from "d3";
import { Category, Feature } from "../types/feature";
import dayjs from "dayjs";

const rainbow = (numOfSteps: number, step: number) => {
    // This function generates vibrant, "evenly spaced" colors (i.e. no clustering). This is ideal for creating easily distinguishable vibrant markers in Google Maps and other apps.
    // Adam Cole, 2011-Sept-14
    // HSV to RBG adapted from: http://mjijackson.com/2008/02/rgb-to-hsl-and-rgb-to-hsv-color-model-conversion-algorithms-in-javascript
    let r, g, b;
    let  h = step / numOfSteps;
    let i = ~~(h * 6);
    let f = h * 6 - i;
    let q = 1 - f;
    switch(i % 6){
        case 0: r = 1; g = f; b = 0; break;
        case 1: r = q; g = 1; b = 0; break;
        case 2: r = 0; g = 1; b = f; break;
        case 3: r = 0; g = q; b = 1; break;
        case 4: r = f; g = 0; b = 1; break;
        case 5: r = 1; g = 0; b = q; break;
    }
    let c = "#" + ("00" + (~ ~(r * 255)).toString(16)).slice(-2) + ("00" + (~ ~(g * 255)).toString(16)).slice(-2) + ("00" + (~ ~(b * 255)).toString(16)).slice(-2);
    return (c);

}

const minMaxCategoriesDate = (categories: Category[]) => {
    let maxDate = dayjs.unix(0);
    let minDate = dayjs().add(100, 'years');
    categories.forEach((category: Category) => {
        const [minCategoryDate, maxCategoryDate] = minMaxFeatureDate(category.features);
        if (maxCategoryDate > maxDate) {
            maxDate = maxCategoryDate;
        }
        if (minCategoryDate < minDate) {
            minDate = minCategoryDate;
        }
    });
    return [minDate, maxDate];
}

const minMaxFeatureDate = (features: Feature[]) => {
    let maxDate = dayjs.unix(0);
    let minDate = dayjs().add(100, 'years');
    features.forEach((feature: Feature) => {
        if (feature.childFeatures.length > 0) {
            const [minChildDate, maxChildDate] = minMaxFeatureDate(feature.childFeatures);
            if (maxChildDate > maxDate) {
                maxDate = maxChildDate;
            }
            if (minChildDate < minDate) {
                minDate = minChildDate;
            }
        }
        if (feature.timestamp > maxDate) {
            maxDate = feature.timestamp;
        }
        if (feature.timestamp < minDate) {
            minDate = feature.timestamp;
        }
    });
    return [minDate, maxDate];
}

const plotPolygonPoint = (x: number, y: number, angle: number, sides: number, radius: number) => {
	const sectorAngle = 2 * Math.PI / sides;
	const sideAngle = sectorAngle * Math.round(angle / sectorAngle);	
	
	const diffAngle = angle - sideAngle;
	
	const forward = radius;
	const sideward = radius * Math.tan(diffAngle);
	
	const sideNormalX = Math.cos(sideAngle);
	const sideNormalY = Math.sin(sideAngle);

    return {
        x: (sideNormalX * forward - sideNormalY * sideward) + x,
        y: (sideNormalY * forward + sideNormalX * sideward) + y,
    }
}

class CoralBase {
    width: number;
    height: number;
    categories: Category[];
    svgRef: Ref<SVGElement>;
    maxDate: dayjs.Dayjs;
    minDate: dayjs.Dayjs;

    constructor(width: number, height: number, svgRef: Ref<SVGElement>, categories: Category[]) {
        this.width = width;
        this.height = height;
        this.svgRef = svgRef;
        this.categories = categories;
        const [a, b] = minMaxCategoriesDate(categories);
        this.minDate = a.subtract(6, 'M');
        this.maxDate = b.add(6, 'M');
    }

    draw() {
        if (!this.svgRef || !this.svgRef.current) return;
        const svg = d3.select(this.svgRef.current);
        svg.selectAll('*').remove();

        // Draw categories and features inside the group
        this.categories.forEach((category: Category, i) => {
            const angle = (((2 * Math.PI)/this.categories.length) * i) - (Math.PI / 2);
            const thickness = 5;
            const color = rainbow(this.categories.length, i);
            const length = 275;

            g.append('line')
                .attr('x1', this.width / 2)
                .attr('y1', this.height / 2)
                .attr('x2', (length * Math.cos(angle)) + (this.width / 2))
                .attr('y2', (length * Math.sin(angle)) + (this.height / 2))
                .attr('stroke', color)
                .attr('stroke-linecap', 'round')
                .attr('stroke-width', thickness);

            category.features.forEach((feature: Feature, j) => {
                let factor = 1;
                if (j % 2 === 0) factor = -1;
                this.drawBranch(this.width / 2, this.height / 2, this.width, this.height, feature, thickness * .85, rainbow(this.categories.length, i), 0, factor, angle, this.categories.length, this.minDate, this.maxDate);
            });
            
        });
    }

    drawBranch(x: number, y: number, width: number, height: number, feature: Feature, thickness: number, color: string, childDepth: number, side: number, relativeAngle: number, numSides: number, minDate: dayjs.Dayjs, maxDate: dayjs.Dayjs) {
        if (!this.svgRef) return;
        const svg = d3.select(this.svgRef.current);
        const branchLength = 225;
        const maxAngleOffset = ((Math.PI * 2) / numSides) / (2 * (childDepth + 2));
        
        const timeDistance = ((feature.timestamp.unix() - minDate.unix()) / (maxDate.unix() - minDate.unix())) * Math.min((width / 2), (height / 2));
      
        const branchAngle = relativeAngle + (maxAngleOffset * side);

        const pos = plotPolygonPoint(x, y, relativeAngle, numSides, timeDistance);
        svg
          .append('line')
          .attr('x1', pos.x)
          .attr('y1', pos.y)
          .attr('x2', (branchLength * Math.cos(branchAngle)) + pos.x)
          .attr('y2', (branchLength * Math.sin(branchAngle)) + pos.y)
          .attr('stroke', color)
          .attr('stroke-linecap', 'round')
          .attr('stroke-width', thickness);
        
        svg
          .append('circle')
          .attr('cx', pos.x)
          .attr('cy', pos.y)
          .attr('fill', "white")
          .attr('r', thickness);
        feature.childFeatures.forEach((child: Feature, i) => {
          let factor = 1;
          if (i % 2 === 0) factor = -1;
          this.drawBranch(pos.x, pos.y, width, height, child, thickness * .65, color, childDepth + 1, factor, branchAngle, numSides, minDate, maxDate);
        });

      // const defs = svg.append('defs');

      // const filter = defs
      //   .append('filter')
      //   .attr('id', 'glow');

      // filter
      //   .append('feGaussianBlur')
      //   .attr('stdDeviation', '3.5')
      //   .attr('result', 'coloredBlur');

      // const feMerge = filter.append('feMerge');
      // feMerge
      //   .append('feMergeNode')
      //   .attr('in', 'coloredBlur');
      // feMerge
      //   .append('feMergeNode')
      //   .attr('in', 'SourceGraphic');
      // d3
      //   .selectAll('line')
      //   .style('filter', 'url(#glow)')

  }
}

export default function Coral({width, height}) {
  const ref = createRef<SVGElement>();
  const categories: Category[] = [
    {
        name: "Networking",
        features: [
          {
            childFeatures: [
              {
                childFeatures: [],
                descr: "",
                timestamp: dayjs().add(3, 'year').add(1, 'month'),
              },
              {
                childFeatures: [],
                descr: "",
                timestamp: dayjs().add(4, 'year').add(3, 'month'),
              },
              {
                childFeatures: [],
                descr: "",
                timestamp: dayjs().add(5, 'year').add(1, 'month'),
              }
            ],
            descr: "",
            timestamp: dayjs().add(3, 'year'),
          },
          {
            childFeatures: [
              {
                childFeatures: [],
                descr: "",
                timestamp: dayjs().add(3, 'year').add(1, 'month'),
              },
              {
                childFeatures: [],
                descr: "",
                timestamp: dayjs().add(3, 'year').add(3, 'month'),
              },
              {
                childFeatures: [],
                descr: "",
                timestamp: dayjs().add(6, 'year').add(1, 'month'),
              }
            ],
            descr: "",
            timestamp: dayjs().add(3, 'year'),
          }
        ]
    },
    {
        name: "Networking",
        features: [
          {
            childFeatures: [
            ],
            descr: "",
            timestamp: dayjs().add(3, 'year'),
          }
        ]
    },
    {
        name: "Networking",
        features: [
          {
            childFeatures: [
            ],
            descr: "",
            timestamp: dayjs().add(3, 'year'),
          }
        ]
    },
    {
        name: "Networking",
        features: [
          {
            childFeatures: [
            ],
            descr: "",
            timestamp: dayjs().add(3, 'year'),
          }
        ]
    },
    {
        name: "Networking",
        features: [
          {
            childFeatures: [
            ],
            descr: "",
            timestamp: dayjs().add(3, 'year'),
          }
        ]
    },
    {
        name: "Networking",
        features: [
          {
            childFeatures: [
            ],
            descr: "",
            timestamp: dayjs().add(3, 'year'),
          }
        ]
    },
    
  ];

    // I asked the parsing team to give us a Category[] object so we can just use it directly in the Coral component without additional transformation

    const coral = new CoralBase(width, height, ref, categories);

    useEffect(() => {
      coral.draw();
      if (!ref) return;
      const svg = d3.select(ref.current);
      // Create zoomable group
      // svg.attr('class', 'zoom-group');

      // // Attach zoom behavior
      // svg.call(
      //     d3.zoom<SVGSVGElement, unknown>()
      //         .scaleExtent([0.5, 5])
      //         .on("zoom", (event) => {
      //             svg.attr("transform", event.transform);
      //         })
      // );
      // for (let i = 0; i < 1000; i++) {
      //   const pos = plotPolygonPoint((i / 1000) * (2 * Math.PI), 3, 150);
      //   svg
      //     .append('circle')
      //     .attr('cx', (width/2) + pos.y)
      //     .attr('cy', (height/2) - pos.x)
      //     .attr('fill', 'white')
      //     .attr('r', 5);
      // }
    })
  
      
  
    return <svg width={width} height={height} ref={ref} />;
  }
  