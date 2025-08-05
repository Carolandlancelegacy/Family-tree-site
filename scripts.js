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

const treeLayout = d3.tree().nodeSize([160, 100]);

d3.json("tree.json").then(data => {
  const root = d3.hierarchy(parseNode(data));
  treeLayout(root);

  svgGroup.selectAll("path.link")
    .data(root.links())
    .enter()
    .append("path")
    .attr("class", "link")
    .attr("fill", "none")
    .attr("stroke", "#ccc")
    .attr("stroke-width", 2)
    .attr("d", d3.linkVertical()
      .x(d => d.x)
      .y(d => d.y)
    );

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

// Recursive parser
function parseNode(person) {
  const result = { name: person.name, children: [] };

  if (person.marriages) {
    person.marriages.forEach(marriage => {
      const spouseNode = { name: marriage.spouse, children: [] };

      // Create a joint node representing the couple
      const coupleNode = {
        name: `${person.name} + ${marriage.spouse}`,
        hidden: true,
        children: []
      };

      // Add children of the couple
      if (marriage.children) {
        marriage.children.forEach(child => {
          coupleNode.children.push(parseNode(child));
        });
      }

      // Add spouse and couple as separate nodes
      result.children.push(spouseNode);
      result.children.push(coupleNode);
    });
  }

  return result;
}
