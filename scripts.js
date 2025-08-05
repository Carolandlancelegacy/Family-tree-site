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
  const links = [];
  let idCounter = 0;

  function assignIds(node) {
    node._id = idCounter++;
    if (node.marriages) {
      node.marriages.forEach(marriage => {
        marriage._id = idCounter++;
        if (marriage.children) {
          marriage.children.forEach(assignIds);
        }
      });
    }
    if (node.children) {
      node.children.forEach(assignIds);
    }
  }

  assignIds(data);

  function buildHierarchy(node) {
    const children = [];

    if (node.children) {
      children.push(...node.children.map(buildHierarchy));
    }

    if (node.marriages) {
      node.marriages.forEach(marriage => {
        const marriageNode = {
          name: `${node.name} + ${marriage.spouse}${marriage.divorced ? " (divorced)" : ""}`,
          _id: marriage._id,
          isMarriage: true,
          children: (marriage.children || []).map(buildHierarchy)
        };
        links.push({
          source: node._id,
          target: marriage._id,
          dashed: !!marriage.divorced
        });
        children.push(marriageNode);
      });
    }

    return {
      name: node.name,
      _id: node._id,
      children
    };
  }

  const hierarchyData = d3.hierarchy(buildHierarchy(data));

  const treeLayout = d3.tree().nodeSize([160, 100]);
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
