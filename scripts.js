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
  Promise.all([
  d3.json("tree.json"),
  d3.json("bios.json")
]).then(([data, bios]) => {
  const rootData = buildRoot(data);
  const root = d3.hierarchy(rootData);
  treeLayout(root);

  // existing code continues...

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
    .attr("stroke", "#013220")
    .attr("stroke-linecap", "round")
    .attr("stroke-opacity", 1)
    .attr("stroke-width", 20)
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

// Add the pattern definition once
const defs = svg.append("defs");

defs.append("pattern")
  .attr("id", "leafPattern")
  .attr("patternUnits", "objectBoundingBox")
  .attr("width", 1)
  .attr("height", 1)
  node.append("image")
  .attr("xlink:href", "leaf-removebg-preview.png")  // your leaf image file
  .attr("x", -50)  // shift to centre
  .attr("y", -50)
  .attr("width", 100)  // increase size here (try 120 if needed)
  .attr("height", 100)
  .attr("preserveAspectRatio", "xMidYMid slice");


const leafPath = "M0,-40 C40,-40 40,40 0,40 C-40,40 -40,-40 0,-40 Z";

node.append("path")
  .attr("d", leafPath)
  .attr("fill", "url(#leafPattern)")
  .attr("stroke", "#145214")
  .attr("stroke-width", 2);



  node.append("text")
  .attr("dy", 5)
  .attr("text-anchor", "middle")
  .attr("fill", "#fff") // white text on green leaf
  .text(d => d.data.name);
      // Add tooltip group
  const tooltip = d3.select("body")
    .append("div")
    .attr("class", "tooltip")
    .style("position", "absolute")
    .style("z-index", "10")
    .style("visibility", "hidden")
    .style("background", "#f4f4f4")
    .style("border", "1px solid #ccc")
    .style("padding", "10px")
    .style("border-radius", "6px")
    .style("box-shadow", "0 2px 10px rgba(0,0,0,0.2)")
    .style("max-width", "220px");

  node.on("mouseover", function (event, d) {
    const bio = bios[d.data.name];
    if (bio) {
      const interestList = bio.interests.map(item => `<li>${item}</li>`).join("");
      tooltip.html(`
        <img src="${bio.image}" style="width: 100%; border-radius: 4px;"><br>
        <strong>${d.data.name}</strong><br>
        <em>Born:</em> ${bio.birthdate}<br>
        <em>Star sign:</em> ${bio.starsign}<br>
        <em>Interests:</em>
        <ul style="margin: 0 0 0 16px; padding: 0;">${interestList}</ul>
      `).style("visibility", "visible");
    }
  })
  .on("mousemove", function (event) {
    tooltip.style("top", (event.pageY - 10) + "px")
           .style("left", (event.pageX + 15) + "px");
  })
  .on("mouseout", function () {
    tooltip.style("visibility", "hidden");
  });


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
