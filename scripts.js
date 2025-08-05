const width = window.innerWidth;
const height = window.innerHeight;

const svg = d3.select("svg")
  .attr("width", width)
  .attr("height", height)
  .call(d3.zoom().on("zoom", function (event) {
    svgGroup.attr("transform", event.transform);
  }));

const svgGroup = svg.append("g");
const treeLayout = d3.tree().nodeSize([180, 120]);

d3.json("tree.json").then(data => {
  const rootData = buildRoot(data);
  const root = d3.hierarchy(rootData);
  treeLayout(root);

  // Draw links
  svgGroup.selectAll(".link")
    .data(root.links())
    .enter()
    .append("path")
    .attr("class", d => {
      return "link" + (d.target.data.divorced ? " divorced" : "");
    })
    .attr("fill", "none")
    .attr("stroke", "#ccc")
    .attr("stroke-width", 2)
    .attr("d", d3.linkVertical()
      .x(d => d.x)
      .y(d => d.y));

  // Draw nodes
  const node = svgGroup.selectAll(".node")
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

function buildRoot(person) {
  const node = { name: person.name || "Root", children: [] };

  if (person.marriages) {
    person.marriages.forEach(marriage => {
      const couple = {
        name: `${person.name} & ${marriage.spouse}`,
        divorced: marriage.divorced || false,
        children: []
      };

      if (marriage.children) {
        couple.children = marriage.children.map(buildRoot);
      }

      node.children.push(couple);
    });
  }

  return node;
}
