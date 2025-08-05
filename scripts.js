const width = window.innerWidth;
const height = window.innerHeight;

const svg = d3.select("body").append("svg")
  .attr("width", width)
  .attr("height", height)
  .call(
    d3.zoom()
      .scaleExtent([0.25, 2])
      .on("zoom", (event) => {
        g.attr("transform", event.transform);
      })
  );

const g = svg.append("g")
  .attr("transform", `translate(${width / 2}, 100)`);

d3.json("tree.json").then(function(data) {
  const nodes = [];
  const links = [];
  let idCounter = 0;

  function traverse(node, parent = null) {
    const nodeId = idCounter++;
    node._id = nodeId;
    nodes.push({ id: nodeId, name: node.name });

    if (parent !== null) {
      links.push({ source: parent._id, target: nodeId, dashed: false });
    }

    if (node.marriages) {
      node.marriages.forEach(marriage => {
        const spouseId = idCounter++;
        nodes.push({ id: spouseId, name: marriage.spouse });

        links.push({
          source: nodeId,
          target: spouseId,
          dashed: marriage.divorced || false
        });

        if (marriage.children) {
          marriage.children.forEach(child => traverse(child, { _id: spouseId }));
        }
      });
    }

    if (node.children) {
      node.children.forEach(child => traverse(child, node));
    }
  }

  // Manually set the root node
  const rootId = idCounter++;
  data._id = rootId;
  nodes.push({ id: rootId, name: data.name });

  if (data.children) {
    data.children.forEach(child => {
      traverse(child, data);
    });
  }

  const treeLayout = d3.tree().nodeSize([150, 100]);

  const hierarchyData = d3.hierarchy(data, d => {
    const kids = [];

    if (d.marriages) {
      d.marriages.forEach(m => {
        if (m.children) kids.push(...m.children);
      });
    }

    if (d.children) {
      kids.push(...d.children);
    }

    return kids;
  });

  treeLayout(hierarchyData);

  const nodeMap = new Map();
  hierarchyData.descendants().forEach(d => {
    nodeMap.set(d.data._id, d);
  });

  g.selectAll(".link")
    .data(links)
    .join("path")
    .attr("class", "link")
    .attr("stroke-dasharray", d => d.dashed ? "4,2" : "none")
    .attr("fill", "none")
    .attr("stroke", "#999")
    .attr("stroke-width", 1.5)
    .attr("d", d => {
      const source = nodeMap.get(d.source);
      const target = nodeMap.get(d.target);
      if (!source || !target) return;
      return d3.linkVertical()
        .x(d => d.x)
        .y(d => d.y)({ source, target });
    });

  const node = g.selectAll(".node")
    .data(hierarchyData.descendants())
    .join("g")
    .attr("class", "node")
    .attr("transform", d => `translate(${d.x},${d.y})`);

  node.each(function(d) {
    const text = d.data.name;
    const padding = 10;
    const textElement = d3.select(this).append("text")
      .text(text)
      .attr("text-anchor", "middle")
      .attr("dy", "0.35em");

    const bbox = textElement.node().getBBox();
    d3.select(this).insert("rect", "text")
      .attr("x", -bbox.width / 2 - padding / 2)
      .attr("y", -bbox.height / 2 - padding / 2)
      .attr("width", bbox.width + padding)
      .attr("height", bbox.height + padding)
      .attr("rx", 4)
      .attr("ry", 4)
      .attr("fill", "white")
      .attr("stroke", "#333")
      .attr("stroke-width", 1.5);
  });
});
