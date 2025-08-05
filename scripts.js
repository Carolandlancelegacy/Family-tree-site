const width = window.innerWidth;
const height = window.innerHeight;

const svg = d3.select("body")
  .append("svg")
  .attr("width", width)
  .attr("height", height)
  .append("g")
  .attr("transform", "translate(40,40)");

d3.json("tree.json").then(function(data) {
  const root = d3.hierarchy(data, d => d.children?.filter(c => !c._isSpouse) || []);
  const treeLayout = d3.tree().nodeSize([120, 120]);
  treeLayout(root);

  const spouseNodes = [];
  const marriageLinks = [];
  const allChildren = [];

  function traverse(node) {
    if (!node || !node.data) return;

    const baseX = node.x;
    const baseY = node.y;

    const spouses = node.data.children?.filter(c => c._isSpouse) || [];

    spouses.forEach((spouseData, i) => {
      const spouseX = baseX + 100 + i * 100;
      const spouseY = baseY;

      spouseNodes.push({
        name: spouseData.name,
        x: spouseX,
        y: spouseY
      });

      marriageLinks.push({
        source: { x: baseX, y: baseY },
        target: { x: spouseX, y: spouseY },
        divorced: spouseData.name.toLowerCase().includes("divorc")
      });

      (spouseData.children || []).forEach((child, j) => {
        const childX = baseX + (i * 60) + j * 60;
        const childY = baseY + 120;

        allChildren.push({
          name: child.name,
          x: childX,
          y: childY
        });

        svg.append("path")
          .attr("class", "link")
          .attr("d", d3.linkVertical()
            .x(() => spouseX)
            .y(() => spouseY)
            .target(() => ({ x: childX, y: childY }))
          );
      });
    });

    node.children?.forEach(traverse);
  }

  traverse(root);

  // Draw tree links
  svg.selectAll(".link")
    .data(root.links())
    .enter()
    .append("path")
    .attr("class", "link")
    .attr("d", d3.linkVertical()
      .x(d => d.x)
      .y(d => d.y)
    );

  // Draw main nodes
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

  // Draw children of spouses
  svg.selectAll(".child-node")
    .data(allChildren)
    .enter()
    .append("g")
    .attr("class", "child-node")
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
});
