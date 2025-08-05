// Family Tree Script
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

const treeLayout = d3.tree().nodeSize([150, 120]);

d3.json("tree.json").then(data => {
  const root = d3.hierarchy(transformData(data));
  treeLayout(root);

  // Render links
  svgGroup.selectAll("path.link")
    .data(root.links())
    .enter()
    .append("path")
    .attr("class", "link")
    .attr("d", d3.linkVertical()
      .x(d => d.x)
      .y(d => d.y)
    );

  // Render nodes
  const node = svgGroup.selectAll("g.node")
    .data(root.descendants())
    .enter()
    .append("g")
    .attr("class", "node")
    .attr("transform", d => `translate(${d.x},${d.y})`);

  node.append("rect")
    .attr("width", 150)
    .attr("height", 30)
    .attr("x", -75)
    .attr("y", -15)
    .attr("rx", 8)
    .attr("ry", 8);

  node.append("text")
    .attr("dy", 5)
    .attr("text-anchor", "middle")
    .text(d => d.data.name);
});

// Helper: Transform JSON for hierarchy
function transformData(person) {
  const children = [];

  if (person.marriages) {
    person.marriages.forEach(marriage => {
      // Add spouse node
      children.push({
        name: marriage.spouse,
        isSpouse: true
      });

      // Add children of this marriage
      if (marriage.children) {
        marriage.children.forEach(child => {
          children.push(transformData(child));
        });
      }
    });
  }

  return {
    name: person.name,
    children: children
  };
}
