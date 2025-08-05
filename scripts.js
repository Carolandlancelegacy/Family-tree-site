// Password protection
function checkPassword() {
  const pw = document.getElementById('password').value;
  if (pw === 'cllegacy') {
    window.location.href = 'tree.html';
  } else {
    document.getElementById('error').innerText = 'Incorrect password';
  }
};

document.addEventListener("DOMContentLoaded", function () {
  const width = window.innerWidth;
  const height = window.innerHeight;

  const svg = d3.select("body").append("svg")
    .attr("width", width)
    .attr("height", height)
    .call(d3.zoom().on("zoom", (event) => {
      svg.attr("transform", event.transform);
    }))
    .append("g")
    .attr("transform", `translate(${width / 2}, 100)`);

  d3.json("tree.json").then(data => {
    const root = d3.hierarchy(data, d => {
      let kids = [];
      if (d.children) kids = kids.concat(d.children);
      if (d.marriages) {
        d.marriages.forEach(m => {
          const spouseNode = {
            name: m.spouse,
            spouse: true,
            marriedTo: d.name,
            marriage: m
          };
          kids.push(spouseNode);
        });
      }
      return kids.length > 0 ? kids : null;
    });

    const treeLayout = d3.tree().nodeSize([180, 120]);
    treeLayout(root);

    // Render links
    svg.selectAll(".link")
      .data(root.links())
      .enter().append("path")
      .attr("class", "link")
      .attr("d", d3.linkVertical()
        .x(d => d.x)
        .y(d => d.y))
      .attr("stroke", d => {
        const isDivorced = (d.source.data.marriage && d.source.data.marriage.divorced) ||
                           (d.target.data.marriage && d.target.data.marriage.divorced);
        return isDivorced ? "#999" : "#ccc";
      })
      .attr("stroke-dasharray", d => {
        const isDivorced = (d.source.data.marriage && d.source.data.marriage.divorced) ||
                           (d.target.data.marriage && d.target.data.marriage.divorced);
        return isDivorced ? "4 2" : null;
      });

    // Render nodes
    const node = svg.selectAll(".node")
      .data(root.descendants())
      .enter().append("g")
      .attr("class", "node")
      .attr("transform", d => `translate(${d.x},${d.y})`);

    node.each(function (d) {
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
        .attr("rx", 6).attr("ry", 6)
        .attr("fill", d.data.spouse ? "#f8f8f8" : "white")
        .attr("stroke", d.data.spouse ? "#999" : "#333");
    });
  });
});
