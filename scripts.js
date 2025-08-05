const width = window.innerWidth;
const height = window.innerHeight;

const svg = d3.select("body")
  .append("svg")
  .attr("width", width)
  .attr("height", height)
  .call(d3.zoom().on("zoom", function (event) {
    g.attr("transform", event.transform);
  }))
  .append("g");

const g = svg.append("g").attr("transform", "translate(40,40)");

d3.json("tree.json").then(function (data) {
  const root = d3.hierarchy(data, d => d.children || []);
  const treeLayout = d3.tree().nodeSize([120, 120]);
  treeLayout(root);

  const marriageLinks = [];
  const spouseNodes = [];

  function processMarriages(node) {
    if (node.data.marriages) {
      node.data.marriages.forEach((m, i) => {
        const spouseX = node.x + (i + 1) * 120;
        const spouseY = node.y;

        spouseNodes.push({
          name: m.spouse,
          x: spouseX,
          y: spouseY
        });

        marriageLinks.push({
          source: { x: node.x, y: node.y },
          target: { x: spouseX, y: spouseY },
          divorced: m.divorced
        });

        if (m.children) {
          m.children.forEach((child, j) => {
            const childX = node.x + j * 120 - (m.children.length - 1) * 60;
            const childY = node.y + 120;

            // Add child node
            g.append("g")
              .attr("class", "node")
              .attr("transform", `translate(${childX},${childY})`)
              .call(group => {
                group.append("rect")
                  .attr("x", -50)
                  .attr("y", -10)
                  .attr("width", 100)
                  .attr("height", 20)
                  .attr("rx", 5)
                  .attr("ry", 5);

                group.append("text")
                  .attr("dy", 4)
                  .attr("text-anchor", "middle")
                  .text(child.name);
              });

            // Connect spouse to child
            g.append("path")
              .attr("class", "link")
              .attr("d", d3.linkVertical()
                .source(() => ({ x: (node.x + spouseX) / 2, y: node.y }))
                .target(() => ({ x: childX, y: childY }))
              );
          });
        }
      });
    }

    if (node.children) {
      node.children.forEach(processMarriages);
    }
  }

  // Apply tree layout to all descendants
  treeLayout(root);

  // Render parent-child links
  g.selectAll(".link")
    .data(root.links())
    .enter()
    .append("path")
    .attr("class", "link")
    .attr("d", d3.linkVertical()
      .x(d => d.x)
      .y(d => d.y)
    );

  // Render main nodes
  const node = g.selectAll(".node")
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

  // Handle all marriages recursively
  processMarriages(root);

  // Render spouse nodes
  g.selectAll(".spouse-node")
    .data(spouseNodes)
    .enter()
    .append("g")
    .attr("class", "spouse-node")
    .attr("transform", d => `translate(${d.x},${d.y})`)
    .call(group => {
      group.append("rect")
        .attr("x", -50)
        .attr("y", -10)
        .attr("width", 100)
        .attr("height", 20)
        .attr("rx", 5)
        .attr("ry", 5);

      group.append("text")
        .attr("dy", 4)
        .attr("text-anchor", "middle")
        .text(d => d.name);
    });

  // Render marriage lines
  g.selectAll(".marriage-link")
    .data(marriageLinks)
    .enter()
    .append("line")
    .attr("class", d => d.divorced ? "link divorced" : "link")
    .attr("x1", d => d.source.x)
    .attr("y1", d => d.source.y)
    .attr("x2", d => d.target.x)
    .attr("y2", d => d.target.y);
});
