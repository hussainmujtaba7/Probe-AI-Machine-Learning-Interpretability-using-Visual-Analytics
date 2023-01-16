var svg_data_sc, y_sc, x_sc, foreground_sc;

function drawScatter(data) {
  var margin = { top: 20, right: 20, bottom: 20, left: 50 },
    width = 400 - margin.left - margin.right,
    height = 350 - margin.top - margin.bottom;

  (x = d3.scaleLinear().range([0, width])),
    (y = d3.scaleLinear().range([height, 0]));

  var xAxis = d3.axisBottom(x),
    yAxis = d3.axisLeft(y);

  var brushTot = d3
    .brush()
    .extent([
      [0, 0],
      [width, height],
    ])
    .on("brush", null);
  // .on("end", selected);

  svg_data_sc = d3
    .select("#scatterArea")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom);

  svg_data_sc
    .append("defs")
    .append("clipPath")
    .attr("id", "clip")
    .append("rect")
    .attr("width", width)
    .attr("height", height);

  focus = svg_data_sc
    .append("g")
    .attr("class", "focus")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  x.domain(
    d3.extent(data, function (d) {
      return +d["concavity_worst"];
    })
  );
  y.domain(
    d3.extent(data, function (d) {
      return +d["area_mean"];
    })
  );

  // append scatter plot to main chart area
  var dots = focus.append("g");
  dots.attr("clip-path", "url(#clip)");
  dots
    .selectAll("dot")
    .data(data)
    .enter()
    .append("circle")
    .attr("class", "dot")
    .attr("r", 5)
    .attr("fill", "grey")
    .attr("opacity", ".3")
    .attr("cx", function (d) {
      return x(+d["concavity_worst"]);
    })
    .attr("cy", function (d) {
      return y(+d["area_mean"]);
    })
    .style("fill", function (d) {
      return color(+d["diagnosis"]);
    });

  focus
    .append("g")
    .attr("class", "axis axis--x")
    .attr("transform", "translate(0," + height + ")")
    .call(xAxis);

  focus.append("g").attr("class", "axis axis--y").call(yAxis);

  //   focus
  //     .append("text")
  //     .attr("transform", "rotate(-90)")
  //     .attr("y", 0 - margin.left)
  //     .attr("x", 0 - height / 2)
  //     .attr("dy", "1em")
  //     .style("text-anchor", "middle")
  //     .text("hi");

  focus
    .append("g")
    .attr("class", "brushT")
    .call(brushTot)
    .call(brushTot.move, null);
}

function selected() {
  dataSelection = [];
  var selection = d3.event.selection;

  if (selection != null) {
    focus.selectAll(".dot").style("opacity", function (d) {
      if (
        x(d[chiavi[0]]) > selection[0][0] &&
        x(d[chiavi[0]]) < selection[1][0] &&
        y(d[chiavi[1]]) > selection[0][1] &&
        y(d[chiavi[1]]) < selection[1][1]
      ) {
        dataSelection.push(d.id);
        return "1.0";
      } else {
        return "0.3";
      }
    });

    d3.select("#parallelArea")
      .selectAll(".forepath")
      .style("stroke", function (d) {
        return color(d[chiavi[2]]);
      });

    d3.select("#parallelArea")
      .selectAll(".forepath")
      .style("stroke", function (d) {
        if (
          x(d[chiavi[0]]) > selection[0][0] &&
          x(d[chiavi[0]]) < selection[1][0] &&
          y(d[chiavi[1]]) > selection[0][1] &&
          y(d[chiavi[1]]) < selection[1][1]
        ) {
          dataSelection.push(d.id);
          return "red";
        } else {
          return color(d[chiavi[2]]);
        }
      });
  } else {
    focus
      .selectAll(".dot")
      .style("fill", function (d) {
        return color(d[chiavi[2]]);
      })
      .style("opacity", ".3")
      .attr("r", 3);
    console.log("reset");
  }
}
