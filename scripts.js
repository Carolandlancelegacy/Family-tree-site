const width = window.innerWidth;
const height = window.innerHeight;

const svg = d3.select("body")
  .append("svg")
  .attr("width", width)
  .attr("height", height)
  .append("g")
  .attr("transform", "translate(40,40)");

d3.json("tree.json").then(function(data) {
  const root = d3.hierarchy(data, d => d.children || []);

  const treeLayout = d3.tree().nodeSize([120, 120]);
  treeLayout(root);

  // Draw lines between parent and children
  svg.selectAll(".link")
    .data(root.links())
    .enter()
    .append("path")
    .attr("class", "link")
    .attr("d", d3.linkVertical()
      .x(d => d.x)
      .y(d => d.y)
    );

  // Draw nodes
  const node = svg.selectAll(".node")
    .data(root.descendants())
    .enter()
    .append("g")
    .attr("class", "node")
    .attr("transform", d => `translate(${d.x},${d.y})`);

  node.append("rect")
    .attr("x", -50)
    .attr("y", -10)
    .attr("width", 100)
    .attr("height", 20)
    .attr("rx", 5)
    .attr("ry", 5);

  node.append("text")
    .attr("dy", 4)
    .attr("text-anchor", "middle")
    .text(d => d.data.name);

  // Handle marriages
  const marriageLinks = [];
  const spouseNodes = [];

  function processMarriages(node) {
    if (node.data.marriages) {
      node.data.marriages.forEach((m, i) => {
        const spouseId = `${node.data.name}-spouse-${i}`;
        spouseNodes.push({
          name: m.spouse,
          x: node.x + (i + 1) * 120,
          y: node.y
        });

        // Connect main person to spouse
        marriageLinks.push({
          source: { x: node.x, y: node.y },
          target: { x: node.x + (i + 1) * 120, y: node.y },
          divorced: m.divorced
        });

        // Connect spouse to children
        if (m.children) {
          m.children.forEach((child, j) => {
            const childX = node.x + (i + 1) * 60 + j * 50;
            const childY = node.y + 120;
            svg.append("path")
              .attr("class", "link")
              .attr("d", d3.linkVertical()
                .x(() => node.x + (i + 1) * 120)
                .y(() => node.y)
                .target(() => ({ x: childX, y: childY }))
              );

            svg.append("g")
              .attr("class", "node")
              .attr("transform", `translate(${childX},${childY})`)
              .call(g => {
                g.append("rect")
                  .attr("x", -50)
                  .attr("y", -10)
                  .attr("width", 100)
                  .attr("height", 20)
                  .attr("rx", 5)
                  .attr("ry", 5);

                g.append("text")
                  .attr("dy", 4)
                  .attr("text-anchor", "middle")
                  .text(child.name);
              });
          });
        }
      });
    }

    if (node.children) {
      node.children.forEach(processMarriages);
    }
  }

  processMarriages(root);

  // Draw spouse nodes
  svg.selectAll(".spouse-node")
    .data(spouseNodes)
    .enter()
    .append("g")
    .attr("class", "spouse-node")
    .attr("transform", d => `translate(${d.x},${d.y})`)
    .call(g => {
      g.append("rect")
        .attr("x", -50)
        .attr("y", -10)
        .attr("width", 100)
        .attr("height", 20)
        .attr("rx", 5)
        .attr("ry", 5);

      g.append("text")
        .attr("dy", 4)
        .attr("text-anchor", "middle")
        .text(d => d.name);
    });

  // Draw marriage lines
  svg.selectAll(".marriage-link")
    .data(marriageLinks)
    .enter()
    .append("line")
    .attr("class", d => d.divorced ? "link divorced" : "link")
    .attr("x1", d => d.source.x)
    .attr("y1", d => d.source.y)
    .attr("x2", d => d.target.x)
    .attr("y2", d => d.target.y);
});
