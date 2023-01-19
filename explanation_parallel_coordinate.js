var svg_data_PC_exp;
var y_PC_exp = {};
var foreground_PC_exp;

function drawParallel_exp(data,min,max) {
  var margin = { top: 30, right: 50, bottom: 10, left: 50 },
    width = 1400 - margin.left - margin.right,
    height = 150 - margin.top - margin.bottom;

  var x = d3
      .scaleBand()
      .rangeRound([0, width + 100])
      .padding(0.1),
    dragging = {};

  var line = d3.line();

  svg_data_PC_exp = d3
    .select("#parallelArea_explanation")
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
      return (y_PC_exp[d] = 
        d3.scaleLinear()
        .domain([min, max])
        .range([height, 0]));
    }))
  );

  foreground_PC_exp = svg_data_PC_exp
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
    .attr("d", path);

  // Add a group element for each dimension.
  var g = svg_data_PC_exp
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
          foreground_PC_exp.attr("opacity", "0.1");
        })
        .on("drag", function (d) {
          dragging[d] = Math.min(width, Math.max(0, d3.event.x));
          foreground_PC_exp.attr("d", path);
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
          transition(foreground_PC_exp).attr("d", path);
          foreground_PC_exp
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
      d3.select(this).call(d3.axisLeft(y_PC_exp[d]).ticks(5));
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
        (y_PC_exp[d].brush = d3
          .brushY()
          .extent([
            [-8, 0],
            [8, height],
          ]).on('start',null).on('brush end',function () {
            brush_parallel_chart_exp(d3.event, global_selected_items, data);
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

  function brushstart() {
    d3.event.sourceEvent.stopPropagation();
  }

  // Returns the path for a given data point.
  function path(d) {
    return line(
      dimensions.map(function (p) {
        return [position(p), y_PC_exp[p](d[p])];
      })
    );
  }
  document.getElementById('loader').style.display = 'none';
  document.getElementById('pencil').style.display = 'block';
}

function brush_parallel_chart_exp(
  event,
  selectedItems,
  data,
  allow_recurse = true
) {
  console.log("brush_parallel_chart_exp");
  function getIntersection(obj) {
    let keys = Object.keys(obj);
    let intersection = obj[keys[0]];
    for (let i = 1; i < keys.length; i++) {
      intersection = intersection.filter(function (n) {
        return obj[keys[i]].includes(n);
      });
    }
    return intersection;
  }
  global_selected_items=selectedItems;

  var selectedIds = [];
  var actives = [];
  svg_data_PC_exp
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
    console.log(data)
    data.forEach(function (d) {
      var isBrushed = actives.every(function (active) {
        var dim = active.dimension;
        // Test if the data element is within the brushed range for the current dimension
        return (
          active.extent[0] <= y_PC_exp[dim](d[dim]) &&
          y_PC_exp[dim](d[dim]) <= active.extent[1]
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

    foreground_PC_exp.style("stroke", function (d) {
      if (selectedItems_other.includes(d.id)) {
        return color(d.diagnosis);
      } else {
        return "darkgray";
      }
    });
    foreground_PC_exp.attr("class", function (d) {
      if (selectedItems_other.includes(d.id)) {
        return "selectedLine";
      } else {
        return "nonSelected";
      }
    });
  } else {
    // If there are active brushes, find the ids of the data elements that are brushed over

    global_selected_items.pce = selectedIds;
    console.log(selectedIds);
    console.log(global_selected_items.pc.length)
    console.log(global_selected_items.pce.length)
    console.log(global_selected_items.sp.length)
    console.log(global_selected_items.spe.length)
    let selectedItems_here = getIntersection(global_selected_items);
    console.log(selectedItems_here);

    foreground_PC_exp.style("stroke", function (d) {
      if (selectedItems_here.includes(d.id)) {
        return color(d.diagnosis);
      } else {
        return "darkgray";
      }
    });

    foreground_PC_exp.attr("class", function (d) {
      if (selectedItems_here.includes(d.id)) {
        return "selectedLine";
      } else {
        return "nonSelected";
      }
    });
  }
  if (allow_recurse == true) {
    brush_parallel_chart(undefined, global_selected_items, original_data, false);
    brush_scatter_plot(undefined, global_selected_items, tsne_original_data, false);
    brush_scatter_plot_exp(undefined, global_selected_items, tsne_derived_data, false);


  }
}

