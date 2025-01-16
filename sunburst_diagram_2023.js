async function drawSunburst2023() {
    let currentRoot = null;

    // 1. Access Data
    const data = await d3.json("energy_distribution_2023.json");


    // 2. Define Dimensions
    const width = 500;
    let dimensions = {
        width: width,
        height: width,
        margin: {
            top: 30,
            right: 30,
            bottom: 30,
            left: 30,
        },
    };
 
    const radius = Math.min(dimensions.width, dimensions.height) / 6;


    // 3. Create Canvas
    const wrapper = d3.select("#sunburst_diagram_2023")
        .append("svg")
        .attr("width", dimensions.width)
        .attr("height", dimensions.height);

    // Define the bounds group
    const bounds = wrapper.append("g")
        .style("transform", `translate(${dimensions.width / 2}px, ${dimensions.height / 2}px)`);

    bounds.append("g")
        .attr("clip-path", "url(#clip)"); // Clips content to the SVG area
    
    wrapper.append("clipPath")
        .attr("id", "clip")
        .append("rect")
        .attr("width", dimensions.width)
        .attr("height", dimensions.height);
        

    // 4. Create Hierarchy
    const hierarchy = d3.hierarchy(data)
        .sum(d => d.value)
        .sort((a, b) => b.value - a.value);

    const root = d3.partition()
        .size([2 * Math.PI, hierarchy.height + 1])(hierarchy);

    root.each(d => (d.current = d));
    

    // 5. Define Arc Generator
    const arc = d3.arc()
        .startAngle(d => d.x0)
        .endAngle(d => d.x1)
        .padAngle(d => Math.min((d.x1 - d.x0) / 2, 0.02))
        .padRadius(radius * 1.5)
        .innerRadius(d => d.y0 * radius)
        .outerRadius(d => d.y1 * radius - 4);


    // 6. Draw Data
    const colorMapping = {
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
    const path = bounds.append("g")
        .selectAll("path")
        .data(root.descendants().slice(1))
        .join("path")
        .attr("fill", d => colorMapping[d.data.name] || "#ccc")
        .attr("fill-opacity", d => (arcVisible(d.current) ? (d.children ? 0.8 : 0.5) : 0))
        .attr("stroke", d => (arcVisible(d.current) ? "black" : "none"))
        .attr("stroke-width", d => (arcVisible(d.current) ? "0.4px" : "0"))
        .attr("pointer-events", d => (arcVisible(d.current) ? "auto" : "none"))
        .attr("d", d => arc(d.current));

    const label = bounds.append("g")
        .attr("pointer-events", "none")
        .attr("text-anchor", "middle")
        .style("user-select", "none")
        .selectAll("text")
        .data(root.descendants().slice(1))
        .join("text")
        .attr("dy", "0.1em")
        .attr("fill-opacity", d => +labelVisible(d.current))
        .attr("transform", d => labelTransform(d.current))
        .style("font-family", "Arial")
        .style("font-size", "12px")
        .text(d => d.data.name);
    
    path.filter(d => d.children)
        .style("cursor", "pointer")
        .on("click", clicked);

    // 8. Center Text
    const centerText = bounds.append("text")
        .attr("text-anchor", "middle")
        .attr("dy", "-0.5em")
        .style("font-family", "Arial")
        .style("font-size", "12px")
        .style("font-weight", "bold")
        .text("Sunburst Diagram");

    const centerValue = bounds.append("text")
        .attr("text-anchor", "middle")
        .attr("dy", "0.8em")
        .style("font-family", "Arial")
        .style("font-size", "12px")
        .style("fill", "gray")
        .text("");

    centerText.text(root.data.name || "Sunburst Diagram");

    const initialTotalValue = d3.sum(root.children, d => d.value) || root.value || 0;
    const formattedInitialValue = d3.format(",")(initialTotalValue);
    centerValue.text(`${formattedInitialValue} MWh`);
        
    const centerCircle = bounds.append("circle")
        .attr("r", radius)
        .attr("fill", "transparent")
        .on("mouseover", function () {
            // Set the cursor to pointer if there is a parent, otherwise default
            d3.select(this).style("cursor", currentRoot.parent ? "pointer" : "default");
        })
        .on("click", function () {
            // Only allow clicking if there's a parent to zoom out to
            if (currentRoot.parent) {
                clicked(null, currentRoot.parent);
            }
        });
        

    // 7. Interactivity
    function clicked(event, p) {
        currentRoot = p;
    
        const isResetToRoot = !p || p === root;
    
        root.each(d => {
            if (isResetToRoot) {
                d.target = {
                    x0: d.x0,
                    x1: d.x1,
                    y0: d.y0,
                    y1: d.y1,
                };
            } else {
                d.target = {
                    x0: Math.max(0, Math.min(1, (d.x0 - p.x0) / (p.x1 - p.x0))) * 2 * Math.PI,
                    x1: Math.max(0, Math.min(1, (d.x1 - p.x0) / (p.x1 - p.x0))) * 2 * Math.PI,
                    y0: Math.max(0, d.y0 - p.depth),
                    y1: Math.max(0, d.y1 - p.depth),
                };
            }
        });
    
        const t = bounds.transition().duration(750);
    
        path.transition(t)
            .tween("data", d => {
                const i = d3.interpolate(d.current, d.target);
                return t => (d.current = i(t));
            })
            .filter(function (d) {
                return +this.getAttribute("fill-opacity") || arcVisible(d.target);
            })
            .attr("fill", d => colorMapping[d.data.name] || "#ccc")
            .attr("fill-opacity", d => (arcVisible(d.target) ? (d.children ? 0.8 : 0.5) : 0))
            .attr("pointer-events", d => (arcVisible(d.target) ? "auto" : "none"))
            .attr("stroke", d => (arcVisible(d.target) ? "black" : "none"))
            .attr("stroke-width", d => (arcVisible(d.target) ? "0.4px" : "0"))
            .attrTween("d", d => () => arc(d.current));
    
        label.transition(t)
            .attr("fill-opacity", d => +labelVisible(d.target))
            .attrTween("transform", d => () => labelTransform(d.current));

        centerCircle.style("cursor", currentRoot.parent ? "pointer" : "default");

        centerText.text(currentRoot.data.name);

        const totalValue = d3.sum(currentRoot.children, d => d.value);
        const formattedValue = d3.format(",")(totalValue);
        centerValue.text(`${formattedValue} MWh`);
    }
    
    
    
    function arcVisible(d) {
        return d.y1 <= 3 && d.y0 >= 1 && d.x1 > d.x0;
    }

    function labelVisible(d) {
        return d.y1 <= 3 && d.y0 >= 1 && (d.y1 - d.y0) * (d.x1 - d.x0) > 0.1;
    }

    function labelTransform(d) {
        const x = ((d.x0 + d.x1) / 2) * (180 / Math.PI);
        const y = (d.y0 + d.y1) / 2 * radius;
        return `rotate(${x - 90}) translate(${y},0) rotate(${x < 180 ? 0 : 180})`;
    }

    
    // 8. Add Tooltip
    const tooltip = d3.select("#sunburst_diagram_2023")
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

        path.on("mouseover", function (event, d) {
            const totalValue = root.value; // Total value of the root node
            const formattedValue = d3.format(",")(d.value);
            const percentage = ((d.value / totalValue) * 100).toFixed(2); // Calculate percentage
        
            tooltip.style("visibility", "visible")
                .html(`
                    <b>${d.data.name}</b><br>
                    Produced: <b>${formattedValue}</b> MWh<br>
                    Percentage of Total: <b>${percentage}%</b>
                `);
        })
        .on("mousemove", (event) => {
            tooltip.style("top", `${event.pageY + 10}px`)
                   .style("left", `${event.pageX + 10}px`);
        })
        .on("mouseout", () => {
            tooltip.style("visibility", "hidden");
        });
        
}

drawSunburst2023();
