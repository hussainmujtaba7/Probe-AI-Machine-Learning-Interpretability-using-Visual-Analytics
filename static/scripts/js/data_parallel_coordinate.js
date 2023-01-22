var svg_data_PC;
var y_PC = {};
var foreground_PC;

function drawParallel(data) {
  var margin = { top: 30, right: 50, bottom: 10, left: 50 },
    width = 1400 - margin.left - margin.right,
    height = 150 - margin.top - margin.bottom;

  var x = d3
    .scaleBand()
    .rangeRound([0, width + 100])
    .padding(0.1),
    dragging = {};

  var line = d3.line();

  let tooltip = d3.select("#tooltip")
    .attr("class", "tooltip")
    .style("opacity", 0);

  svg_data_PC = d3
    .select("#parallelArea")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  x.domain(
    (dimensions = d3.keys(data[0]).filter(function (d) {
      if (d == "diagnosis" || d == "id") {
        return false;
      }
      return (y_PC[d] = d3
        .scaleLinear()
        .domain(
          d3.extent(data, function (p) {
            return +p[d];
          })
        )
        .range([height, 0]));
    }))
  );

  foreground_PC = svg_data_PC
    .append("g")
    .attr("class", "foreground")
    .selectAll("path")
    .data(data)
    .enter()
    .append("path")
    .style("stroke", function (d) {
      return color(d["diagnosis"]);
    })
    .attr("class", "forepath")
    .attr("d", path)
    .on("mouseover", function (d) {
      d3.select(this)
        .transition()
        .duration(200)
        .attr("opacity", "1")
        .style("stroke-width", "3px");
      tooltip.transition()
        .duration(200)
        .style("opacity", .9);
      tooltip.html(`<strong>Data Point: </strong> ${labels[d.diagnosis]} <br><br> <strong>Value: </strong> ${d.id}`)
        .style("left", (d3.event.pageX + 5) + "px")
        .style("top", (d3.event.pageY - 28) + "px");
    })
    .on("mouseout", function (d) {
      d3.select(this)
        .transition()
        .duration(200)
        .attr("opacity", ".7")
        .style("stroke-width", "1px");
      tooltip.transition()
        .duration(500)
        .style("opacity", 0);
    });

  // Add a group element for each dimension.
  var g = svg_data_PC
    .selectAll(".dimension")
    .data(dimensions)
    .enter()
    .append("g")
    .attr("class", "dimension")
    .attr("transform", function (d) {
      return "translate(" + x(d) + ")";
    })
    .call(
      d3
        .drag()
        .subject(function (d) {
          return { x: x(d) };
        })
        .on("start", function (d) {
          dragging[d] = x(d);
          foreground_PC.attr("opacity", "0.1");
        })
        .on("drag", function (d) {
          dragging[d] = Math.min(width, Math.max(0, d3.event.x));
          foreground_PC.attr("d", path);
          dimensions.sort(function (a, b) {
            return position(a) - position(b);
          });
          x.domain(dimensions);
          g.attr("transform", function (d) {
            return "translate(" + position(d) + ")";
          });
        })
        .on("end", function (d) {
          delete dragging[d];
          transition(d3.select(this)).attr(
            "transform",
            "translate(" + x(d) + ")"
          );
          transition(foreground_PC).attr("d", path);
          foreground_PC
            .attr("d", path)
            .transition()
            .delay(500)
            .duration(0)
            .attr("opacity", "1");
        })
    );
  // Add an axis and title.
  g.append("g")
    .attr("class", "axis")
    .each(function (d) {
      d3.select(this).call(d3.axisLeft(y_PC[d]).ticks(5));
    })
    //text does not show up because previous line breaks somehow
    .append("text")
    .style("text-anchor", "middle")
    .attr("y", -9)
    .text(function (d) {
      return d;
    });

  // Add and store a brush for each axis.
  g.append("g")
    .attr("class", "brush")
    .each(function (d) {
      d3.select(this).call(
        (y_PC[d].brush = d3
          .brushY()
          .extent([
            [-8, 0],
            [8, height],
          ])
          .on("start", null)
          .on("brush end", function () {
            if (activeBrush === "coordinate") {
              return brush_parallel_chart(
                d3.event,
                global_selected_items,
                data
              );
            } else {
              return null;
            }
          }))
      );
    })
    .selectAll("rect")
    .attr("x", -8)
    .attr("width", 16);

  function position(d) {
    var v = dragging[d];
    return v == null ? x(d) : v;
  }

  function transition(g) {
    return g.transition().duration(500);
  }

  // Returns the path for a given data point.
  function path(d) {
    return line(
      dimensions.map(function (p) {
        return [position(p), y_PC[p](d[p])];
      })
    );
  }
}

function brush_parallel_chart(
  event,
  selectedItems,
  data,
  allow_recurse = true
) {
  console.log("brush_parallel_chart");
  global_selected_items = selectedItems;
  var selectedIds = [];
  var actives = [];
  svg_data_PC
    .selectAll(".dimension .brush")
    .filter(function () {
      return d3.brushSelection(this);
    })
    .each(function (d) {
      actives.push({
        dimension: d,
        extent: d3.brushSelection(this),
      });
    });
  console.log(actives);

  if (actives.length !== 0) {
    console.log(data);
    data.forEach(function (d) {
      var isBrushed = actives.every(function (active) {
        var dim = active.dimension;
        // Test if the data element is within the brushed range for the current dimension
        return (
          active.extent[0] <= y_PC[dim](d[dim]) &&
          y_PC[dim](d[dim]) <= active.extent[1]
        );
      });
      if (isBrushed) {
        console.log(isBrushed);
        selectedIds.push(d.id);
      }
    });
  }

  console.log(selectedIds);

  if (selectedIds.length === 0 && actives.length === 0) {
    console.log("selectedIds.length === 0 &&  actives.length === 0");
    let selectedItems_other = getIntersection(global_selected_items);

    foreground_PC.style("stroke", function (d) {
      if (selectedItems_other.includes(d.id)) {
        return color(d.diagnosis);
      } else {
        return "darkgray";
      }
    });
    foreground_PC.attr("class", function (d) {
      if (selectedItems_other.includes(d.id)) {
        return "selectedLine";
      } else {
        return "nonSelected";
      }
    });
  } else {
    // If there are active brushes, find the ids of the data elements that are brushed over

    global_selected_items.pc = selectedIds;
    console.log(global_selected_items.pc.length);
    console.log(global_selected_items.pce.length);
    console.log(selectedIds);
    let selectedItems_here = getIntersection(global_selected_items);
    console.log(selectedItems_here);

    foreground_PC.style("stroke", function (d) {
      if (selectedItems_here.includes(d.id)) {
        return color(d.diagnosis);
      } else {
        return "darkgray";
      }
    });

    foreground_PC.attr("class", function (d) {
      if (selectedItems_here.includes(d.id)) {
        return "selectedLine";
      } else {
        return "nonSelected";
      }
    });
  }
  if (allow_recurse == true) {
    brush_parallel_chart_exp(
      undefined,
      global_selected_items,
      derived_data,
      false
    );
    brush_scatter_plot(
      undefined,
      global_selected_items,
      tsne_original_data,
      false
    );
    brush_scatter_plot_exp(
      undefined,
      global_selected_items,
      tsne_derived_data,
      false
    );
  }
}

function clear_brushes_PC(clear_pc) {
  global_selected_items = clear_pc;
  console.log("clear_brushes_PC");
  svg_data_PC
    .selectAll(".dimension .brush")
    .filter(function () {
      return d3.brushSelection(this);
    })
    .each(function (d) {
      d3.select(this).call(y_PC[d].brush.move, null);
    });
  global_selected_items["pc"] = all_data_ids;
  brush_parallel_chart(undefined, global_selected_items, original_data, true);
}
