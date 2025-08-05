const width = window.innerWidth;
const height = window.innerHeight;

const svg = d3.select("svg")
  .attr("width", width)
  .attr("height", height)
  .call(d3.zoom().on("zoom", function (event) {
    svgGroup.attr("transform", event.transform);
  }))
  .append("g");

const svgGroup = svg.append("g");

const treeLayout = d3.tree().nodeSize([160, 120]);

d3.json("tree.json").then(data => {
  const parsed = buildTree(data);
  const root = d3.hierarchy(parsed);
  treeLayout(root);

  svgGroup.selectAll("path.link")
    .data(root.links())
    .enter()
    .append("path")
    .attr("class", "link")
    .attr("fill", "none")
    .attr("stroke", "#aaa")
    .attr("stroke-width", 2)
    .attr("d", d3.linkVertical()
      .x(d => d.x)
      .y(d => d.y));

  const node = svgGroup.selectAll("g.node")
    .data(root.descendants())
    .enter()
    .append("g")
    .attr("class", "node")
    .attr("transform", d => `translate(${d.x},${d.y})`);

  node.append("rect")
    .attr("width", 160)
    .attr("height", 30)
    .attr("x", -80)
    .attr("y", -15)
    .attr("rx", 8)
    .attr("ry", 8)
    .attr("fill", "#fff")
    .attr("stroke", "#333");

  node.append("text")
    .attr("dy", 5)
    .attr("text-anchor", "middle")
    .text(d => d.data.name);
});

function buildTree(person) {
  const node = { name: person.name, children: [] };

  if (person.marriages) {
    person.marriages.forEach(marriage => {
      // Add the spouse node
      const spouseNode = { name: marriage.spouse };

      // Virtual couple node for children
      const couple = {
        name: `${person.name} & ${marriage.spouse}`,
        children: []
      };

      // Recurse into children
      if (marriage.children) {
        couple.children = marriage.children.map(buildTree);
      }

      // Add spouse and couple node
      node.children.push(spouseNode, couple);
    });
  }

  return node;
}
