'use client'

import { createRef, Ref, RefObject, useEffect, useRef } from "react";
import * as d3 from "d3";
import { Category, Feature } from "../types/feature";
import dayjs from "dayjs";
import { rainbow } from './colors';

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
        const timestamp = dayjs(feature.timestamp);
        if (timestamp > maxDate) {
            maxDate = timestamp;
        }
        if (timestamp < minDate) {
            minDate = timestamp;
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
    onFeatureHoverRef: RefObject<((feature: Feature | null, x: number | undefined, y: number | undefined) => void) | undefined>;

    constructor(width: number, height: number, svgRef: Ref<SVGElement>, categories: Category[], onFeatureHoverRef: RefObject<((feature: Feature | null) => void) | undefined>) {
        this.width = width;
        this.height = height;
        this.svgRef = svgRef;
        this.categories = categories;
        const [a, b] = minMaxCategoriesDate(categories);
        this.minDate = a.subtract(6, 'M');
        this.maxDate = b.add(6, 'M');
        this.onFeatureHoverRef = onFeatureHoverRef;
    }

    draw() {
        if (!this.svgRef || !this.svgRef.current) return;
        const svg = d3.select(this.svgRef.current);
        svg.selectAll('*').remove();

        // Create and append a group element to allow zoom/pan
        const container = svg.append('g').attr('class', 'zoom-container');

        this.categories.forEach((category: Category, i) => {
            if (!category.visible) return;
            const angle = (((2 * Math.PI)/this.categories.length) * i) - (Math.PI / 2);
            const thickness = 5;
            const color = rainbow(this.categories.length, i);
            const length = 275;

            container.append('line')
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
                this.drawBranch(container, this.width / 2, this.height / 2, this.width, this.height, feature, thickness * .85, rainbow(this.categories.length, i), 0, factor, angle, this.categories.length, this.minDate, this.maxDate);
            });
        });

        const legendPadding = 10;
        const legendItemHeight = 20;
        const legendHeight = this.categories.length * legendItemHeight;
        const maxTextWidth = this.categories.reduce((maxWidth, category) => {
            const textWidth = category.name.length * 7; // rough estimate for each character's width (may need to change with font choice/size)
            return Math.max(maxWidth, textWidth);
        }, 0);
        const legendWidth = maxTextWidth + 16; // 16 for the size of the rectangle

        const legend = svg.append("g")
            .attr("class", "legend")
            .attr(
                "transform",
                `translate(${20}, ${this.height - 20 - legendHeight})`
            );

        // add background rectangle first so it is behind the entries
        legend.append("rect")
            .attr("x", -legendPadding)
            .attr("y", -legendPadding)
            .attr("width", legendWidth + legendPadding * 2)
            .attr("height", legendHeight + legendPadding * 2)
            .attr("fill", "#111")
            .attr("stroke", "#444")
            .attr("stroke-width", 1)
            .attr("rx", 8)
            .attr("ry", 8)
            .attr("opacity", 0.8);

        this.categories.forEach((category, i) => {
            const color = rainbow(this.categories.length, i);

            const group = legend.append("g")
                .attr("transform", `translate(0, ${i * legendItemHeight})`);

            // will probably need to change this along with the item heigh to match the UI scale better when integrated
            group.append("rect")
                .attr("x", 0)
                .attr("y", 0)
                .attr("width", 16)
                .attr("height", 16)
                .attr("fill", color);

            group.append("text")
                .attr("x", 24)
                .attr("y", 13)
                .attr("fill", "white")
                .attr("font-size", "12px") // will probably need to change to match the UI stuff
                .text(category.name);
        });
    }

    drawBranch(container: d3.Selection<SVGGElement, unknown, null, undefined>, x: number, y: number, width: number, height: number, feature: Feature, thickness: number, color: string, childDepth: number, side: number, relativeAngle: number, numSides: number, minDate: dayjs.Dayjs, maxDate: dayjs.Dayjs) {
        if (!feature.visible) return;
        const maxAngleOffset = ((Math.PI * 2) / numSides) / (2 * (childDepth + 2));
        
        const timestamp = dayjs(feature.timestamp);
        const timeDistance = ((timestamp.unix() - minDate.unix()) / (maxDate.unix() - minDate.unix())) * Math.min((width / 2), (height / 2));

        const [_, maxBranchTime] = minMaxFeatureDate([feature]);
        const branchLength = (((maxBranchTime.add(1, 'year').unix() - timestamp.unix())) / (maxDate.unix() - minDate.unix())) * Math.min((width / 2), (height / 2))
      
        const branchAngle = relativeAngle + (maxAngleOffset * side);
        const pos = plotPolygonPoint(x, y, relativeAngle, numSides, timeDistance);

        container
          .append('line')
          .attr('x1', pos.x)
          .attr('y1', pos.y)
          .attr('x2', (branchLength * Math.cos(branchAngle)) + pos.x)
          .attr('y2', (branchLength * Math.sin(branchAngle)) + pos.y)
          .attr('stroke', color)
          .attr('stroke-linecap', 'round')
          .attr('stroke-width', thickness)
          .on("mouseover", (event: MouseEvent) => {
            // container.selectAll('line').attr('opacity', 0.65);
            const targetLine: SVGLineElement = event.target as SVGLineElement;
            targetLine.setAttribute('opacity', '1');
            this.onFeatureHoverRef.current?.(feature, event.clientX, event.clientY);
          })
          .on("mouseout", () => {
            container.selectAll('line').attr('opacity', 1);
            this.onFeatureHoverRef.current?.(null, undefined, undefined);
          });
        
        container
          .append('circle')
          .attr('cx', pos.x)
          .attr('cy', pos.y)
          .attr('fill', "white")
          .attr('r', thickness)
          .on("mouseover", (event) => {
            this.onFeatureHoverRef.current?.(feature, event.clientX, event.clientY);
          })
          .on("mouseout", () => {
            this.onFeatureHoverRef.current?.(null, undefined, undefined);
          });

        feature.childFeatures.forEach((child: Feature) => {
            this.drawBranch(container, pos.x, pos.y, width, height, child, thickness * .5, color, childDepth + 1, side, branchAngle, numSides, minDate, maxDate);
        });
    }
}

export default function Coral({width, height, categories, onFeatureHover}) {
    const ref = createRef<SVGElement>();
    const onFeatureHoverRef = useRef<typeof onFeatureHover>(null);
    onFeatureHoverRef.current = onFeatureHover; 
    
    useEffect(() => {
        const coral = new CoralBase(width, height, ref, categories, onFeatureHoverRef);
        coral.draw();

        if (!ref.current) return;

        const svg = d3.select(ref.current);
        const container = svg.select<SVGGElement>('.zoom-container');

        const zoom = d3.zoom<SVGSVGElement, unknown>()
            .scaleExtent([0.1, 10]) // adjust min/max zoom as needed
            .on("zoom", (event) => {
                container.attr("transform", event.transform);
                const scale = event.transform.k;
                const lines = svg.selectAll('line');
                const circles = svg.selectAll('circle');

                lines.attr('stroke-width', Math.min(5, 5 / scale));
                circles.attr('r', Math.min(5, 5/scale));
            });

        svg.call(zoom);

        // for (let i = 0; i < 1000; i++) {
        //   const pos = plotPolygonPoint((i / 1000) * (2 * Math.PI), 3, 150);
        //   svg
        //     .append('circle')
        //     .attr('cx', (width/2) + pos.y)
        //     .attr('cy', (height/2) - pos.x)
        //     .attr('fill', 'white')
        //     .attr('r', 5);
        // }
    }, [categories, width, height]);

    return <svg width={width} height={height} ref={ref} />;
}
