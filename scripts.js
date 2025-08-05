const width = window.innerWidth;
const height = window.innerHeight;

const svg = d3.select("body")
  .append("svg")
  .attr("width", width)
  .attr("height", height)
  .append("g")
  .attr("transform", "translate(40,40)");

d3.json("tree.json").then(function(data) {
  const nodes = [];
  const links = [];
  const marriageLinks = [];

  let idCounter = 0;

  function traverse(node, x = 0, y = 0, parent = null) {
    const currentNode = {
      id: ++idCounter,
      name: node.name,
      x: x,
      y: y,
      isSpouse: node._isSpouse || false
    };
    nodes.push(currentNode);

    if (parent && !currentNode.isSpouse) {
      links.push({ source: parent, target: currentNode });
    }

    if (node.children && Array.isArray(node.children)) {
      let offsetX = -((node.children.length - 1) * 120) / 2;
      node.children.forEach((child, i) => {
        if (child._isSpouse) {
          const spouseNode = {
            id: ++idCounter,
            name: child.name,
            x: x + 100,
            y: y,
            isSpouse: true
          };
          nodes.push(spouseNode);
          marriageLinks.push({
            source: currentNode,
            target: spouseNode,
            divorced: child.name.toLowerCase().includes("divorced")
          });

          if (child.children) {
            let offsetChildX = -((child.children.length - 1) * 120) / 2;
            child.children.forEach((grandchild, j) => {
              traverse(grandchild, x + offsetChildX + j * 120, y + 120, currentNode);
            });
          }
        } else {
          traverse(child, x + offsetX + i * 120, y + 120, currentNode);
        }
      });
    }
  }

  traverse(data, width / 2, 40);

  // Draw parent-to-child lines
  svg.selectAll(".link")
    .data(links)
    .enter()
    .append("path")
    .attr("class", "link")
    .attr("fill", "none")
    .attr("stroke", "#ccc")
    .attr("d", d => {
      return `M${d.source.x},${d.source.y + 10} V${(d.source.y + d.target.y) / 2} H${d.target.x} V${d.target.y - 10}`;
    });

  // Draw marriage lines
  svg.selectAll(".marriage")
    .data(marriageLinks)
    .enter()
    .append("line")
    .attr("class", "marriage")
    .attr("x1", d => d.source.x)
    .attr("y1", d => d.source.y)
    .attr("x2", d => d.target.x)
    .attr("y2", d => d.target.y)
    .attr("stroke", "#666")
    .attr("stroke-dasharray", d => d.divorced ? "4,4" : "0");

  // Draw nodes
  const node = svg.selectAll(".node")
    .data(nodes)
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
    .attr("ry", 5)
    .attr("fill", "#fff")
    .attr("stroke", "#000");

  node.append("text")
    .attr("dy", 4)
    .attr("text-anchor", "middle")
    .text(d => d.name);
});
