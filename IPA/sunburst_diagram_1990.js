async function drawSunburst1990() {
    let currentRoot1 = null;

    // 1. Access Data
    const data1 = await d3.json("energy_distribution_1990.json");


    // 2. Define Dimensions
    const width1 = 500;
    let dimensions1 = {
        width: width1,
        height: width1,
        margin: {
            top: 30,
            right: 30,
            bottom: 30,
            left: 30,
        },
    };
 
    const radius1 = Math.min(dimensions1.width, dimensions1.height) / 6;


    // 3. Create Canvas
    const wrapper1 = d3.select("#sunburst_diagram_1990")
        .append("svg")
        .attr("width", dimensions1.width)
        .attr("height", dimensions1.height);

    const bounds1 = wrapper1.append("g")
        .style("transform", `translate(${dimensions1.width / 2}px, ${dimensions1.height / 2}px)`);

    bounds1.append("g")
        .attr("clip-path", "url(#clip)");

    wrapper1.append("clipPath1")
        .attr("id", "clip")
        .append("rect")
        .attr("width", dimensions1.width)
        .attr("height", dimensions1.height);


    // 4. Create Hierarchy
    const hierarchy1 = d3.hierarchy(data1)
        .sum(d1 => d1.value)
        .sort((a1, b1) => b1.value - a1.value);

    const root1 = d3.partition()
        .size([2 * Math.PI, hierarchy1.height + 1])(hierarchy1);

    root1.each(d1 => (d1.current = d1));
    

    // 5. Define Arc Generator
    const arc1 = d3.arc()
        .startAngle(d1 => d1.x0)
        .endAngle(d1 => d1.x1)
        .padAngle(d1 => Math.min((d1.x1 - d1.x0) / 2, 0.02))
        .padRadius(radius1 * 1.5)
        .innerRadius(d1 => d1.y0 * radius1)
        .outerRadius(d1 => d1.y1 * radius1 - 4);


    // 6. Draw Data
    const colorMapping1 = {
        "Fossil Fuels": "#FF0000",
        "Coal": "#FF0000",
        "Coal 1": "#FF0000",
        "Coal 2": "#FF0000",
        "Natural Gas": "#FF0000",
        "Petroleum": "#FF0000",
        "Other Gases": "#FF0000",
        "Renewables": "#00FF00",
        "Solar": "#00FF00",
        "Wind": "#00FF00",
        "Hydroelectric": "#00FF00",
        "Biomass": "#00FF00",
        "Nuclear": "#FF6600",
        "Other": ""
    };
    const path1 = bounds1.append("g")
        .selectAll("path")
        .data(root1.descendants().slice(1))
        .join("path")
        .attr("fill", d1 => colorMapping1[d1.data.name] || "#ccc")
        .attr("fill-opacity", d1 => (arcVisible1(d1.current) ? (d1.children ? 0.8 : 0.5) : 0))
        .attr("stroke", d1 => (arcVisible1(d1.current) ? "black" : "none"))
        .attr("stroke-width", d1 => (arcVisible1(d1.current) ? "0.4px" : "0"))
        .attr("pointer-events", d1 => (arcVisible1(d1.current) ? "auto" : "none"))
        .attr("d", d1 => arc1(d1.current));

    const label1 = bounds1.append("g")
        .attr("pointer-events", "none")
        .attr("text-anchor", "middle")
        .style("user-select", "none")
        .selectAll("text")
        .data(root1.descendants().slice(1))
        .join("text")
        .attr("dy", "0.1em")
        .attr("fill-opacity", d1 => +labelVisible1(d1.current))
        .attr("transform", d1 => labelTransform1(d1.current))
        .style("font-family", "Arial")
        .style("font-size", "12px")
        .text(d1 => d1.data.name);
    
    path1.filter(d1 => d1.children)
        .style("cursor", "pointer")
        .on("click", clicked1);

    // 8. Center Text
    const centerText1 = bounds1.append("text")
        .attr("text-anchor", "middle")
        .attr("dy", "-0.5em")
        .style("font-family", "Arial")
        .style("font-size", "12px")
        .style("font-weight", "bold")
        .text("Sunburst Diagram");

    const centerValue1 = bounds1.append("text")
        .attr("text-anchor", "middle")
        .attr("dy", "0.8em")
        .style("font-family", "Arial")
        .style("font-size", "12px")
        .style("fill", "gray")
        .text("");

    centerText1.text(root1.data.name || "Sunburst Diagram");

    const initialTotalValue1 = d3.sum(root1.children, d1 => d1.value) || root1.value || 0;
    const formattedInitialValue1 = d3.format(",")(initialTotalValue1);
    centerValue1.text(`${formattedInitialValue1} MWh`);
        
    const centerCircle1 = bounds1.append("circle")
        .attr("r", radius1)
        .attr("fill", "transparent")
        .on("mouseover", function () {
            d3.select(this).style("cursor", currentRoot1.parent ? "pointer" : "default");
        })
        .on("click", function () {
            if (currentRoot1.parent) {
                clicked1(null, currentRoot1.parent);
            }
        });
        

    // 7. Interactivity
    function clicked1(event1, p1) {
        currentRoot1 = p1;
    
        const isResetToRoot1 = !p1 || p1 === root1;
    
        root1.each(d1 => {
            if (isResetToRoot1) {
                d1.target = {
                    x0: d1.x0,
                    x1: d1.x1,
                    y0: d1.y0,
                    y1: d1.y1,
                };
            } else {
                d1.target = {
                    x0: Math.max(0, Math.min(1, (d1.x0 - p1.x0) / (p1.x1 - p1.x0))) * 2 * Math.PI,
                    x1: Math.max(0, Math.min(1, (d1.x1 - p1.x0) / (p1.x1 - p1.x0))) * 2 * Math.PI,
                    y0: Math.max(0, d1.y0 - p1.depth),
                    y1: Math.max(0, d1.y1 - p1.depth),
                };
            }
        });
    
        const t1 = bounds1.transition().duration(750);
    
        path1.transition(t1)
            .tween("data", d1 => {
                const i1 = d3.interpolate(d1.current, d1.target);
                return t1 => (d1.current = i1(t1));
            })
            .filter(function (d1) {
                return +this.getAttribute("fill-opacity") || arcVisible1(d1.target);
            })
            .attr("fill", d1 => colorMapping1[d1.data.name] || "#ccc")
            .attr("fill-opacity", d1 => (arcVisible1(d1.target) ? (d1.children ? 0.8 : 0.5) : 0))
            .attr("pointer-events", d1 => (arcVisible1(d1.target) ? "auto" : "none"))
            .attr("stroke", d1 => (arcVisible1(d1.target) ? "black" : "none"))
            .attr("stroke-width", d1 => (arcVisible1(d1.target) ? "0.4px" : "0"))
            .attrTween("d", d1 => () => arc1(d1.current));
    
        label1.transition(t1)
            .attr("fill-opacity", d1 => +labelVisible1(d1.target))
            .attrTween("transform", d1 => () => labelTransform1(d1.current));

        centerCircle1.style("cursor", currentRoot1.parent ? "pointer" : "default");

        centerText1.text(currentRoot1.data.name);

        const totalValue1 = d3.sum(currentRoot1.children, d1 => d1.value);
        const formattedValue1 = d3.format(",")(totalValue1);
        centerValue1.text(`${formattedValue1} MWh`);
    }
    
    function arcVisible1(d1) {
        return d1.y1 <= 3 && d1.y0 >= 1 && d1.x1 > d1.x0;
    }

    function labelVisible1(d1) {
        return d1.y1 <= 3 && d1.y0 >= 1 && (d1.y1 - d1.y0) * (d1.x1 - d1.x0) > 0.1;
    }

    function labelTransform1(d1) {
        const x1 = ((d1.x0 + d1.x1) / 2) * (180 / Math.PI);
        const y1 = (d1.y0 + d1.y1) / 2 * radius1;
        return `rotate(${x1 - 90}) translate(${y1},0) rotate(${x1 < 180 ? 0 : 180})`;
    }

    // 8. Add Tooltip
    const tooltip1 = d3.select("#sunburst_diagram_1990")
        .append("div")
        .attr("id", "tooltip")
        .style("position", "absolute")
        .style("visibility", "hidden")
        .style("background", "white")
        .style("padding", "5px")
        .style("border-radius", "3px")
        .style("font-size", "12px")
        .style("font-family", "Arial")
        .style("pointer-events", "none");
    
    path1.on("mouseover", function (event1, d1) {
        const totalValue1 = root1.value;
        const formattedValue1 = d3.format(",")(d1.value);
        const percentage1 = ((d1.value / totalValue1) * 100).toFixed(2);
        
        tooltip1.style("visibility", "visible")
            .html(`
                <b>${d1.data.name}</b><br>
                Produced: <b>${formattedValue1}</b> MWh<br>
                Percentage of Total: <b>${percentage1}%</b>
            `);
        })
        .on("mousemove", (event1) => {
            tooltip1.style("top", `${event1.pageY + 10}px`)
                   .style("left", `${event1.pageX + 10}px`);
        })
        .on("mouseout", () => {
            tooltip1.style("visibility", "hidden");
        });
}

drawSunburst1990();
