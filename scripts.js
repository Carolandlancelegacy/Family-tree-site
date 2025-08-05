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

  function createNode(name) {
    const id = idCounter++;
    nodes.push({ id, name });
    return id;
  }

  function buildTree(person, parentId = null) {
    const personId = createNode(person.name);

    if (parentId !== null) {
      links.push({ source: parentId, target: personId, dashed: false });
    }

    if (person.marriages) {
      person.marriages.forEach(marriage => {
        const spouseId = createNode(marriage.spouse);
        links.push({
          source: personId,
          target: spouseId,
          dashed: marriage.divorced || false
        });

        if (marriage.children) {
          marriage.children.forEach(child => {
            buildTree(child, personId);
          });
        }
      });
    }

    if (person.children) {
      person.children.forEach(child => {
        buildTree(child, personId);
      });
    }

    return personId;
  }

  buildTree(data);

  const treeData = d3.stratify()
    .id(d => d.id)
    .parentId(d => null)(nodes);

  const hierarchy = d3.hierarchy(data, d => {
    const children = [];

    if (d.marriages) {
      d.marriages.forEach(m => {
        if (m.children) {
          children.push(...m.children);
        }
      });
    }

    if (d.children) {
      children.push(...d.children);
    }

    return children;
  });

  const treeLayout = d3.tree().nodeSize([150, 100]);
  treeLayout(hierarchy);

  const nodeMap = new Map();
  hierarchy.descendants().forEach(d => {
    nodeMap.set(d.data.name, d);
  });

  g.selectAll(".link")
    .data(links)
    .join("path")
    .attr("class", "link")
    .attr("stroke-dasharray", d => d.dashed ? "4,2" : null)
    .attr("stroke", "#999")
    .attr("stroke-width", 1.5)
    .attr("fill", "none")
    .attr("d", d => {
      const source = nodeMap.get(nodes[d.source].name);
      const target = nodeMap.get(nodes[d.target].name);
      if (!source || !target) return;
      return d3.linkVertical()
        .x(d => d.x)
        .y(d => d.y)({ source, target });
    });

  const node = g.selectAll(".node")
    .data(hierarchy.descendants())
    .join("g")
    .attr("class", "node")
    .attr("transform", d => `translate(${d.x},${d.y})`);

  node.each(function(d) {
    const padding = 10;
    const textElement = d3.select(this).append("text")
      .text(d.data.name)
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
