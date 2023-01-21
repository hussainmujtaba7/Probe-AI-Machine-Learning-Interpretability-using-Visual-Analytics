var svg_data_sc;
var x_sc;
var y_sc;
var foreground_sc;
var focus;
var brushScatter;


function drawScatter(data) {
  var margin = { top: 20, right: 40, bottom: 20, left: 50 },
    width = 400 - margin.left - margin.right,
    height = 350 - margin.top - margin.bottom;

  x_sc = d3.scaleLinear().range([0, width]);
  y_sc = d3.scaleLinear().range([height, 0]);

  var xAxis = d3.axisBottom(x_sc),
    yAxis = d3.axisLeft(y_sc);

  x_sc.domain(
    d3.extent(data, function (d) {
      return d["x"];
    })
  );
  y_sc.domain(
    d3.extent(data, function (d) {
      return d["y"];
    })
  );

  brushScatter = d3
    .brush()
    .extent([
      [0, 0],
      [width, height],
    ])
    .on("brush", function () {
      if (activeBrush === "coordinate") {
        return brush_scatter_plot_exp(d3.event, global_selected_items, data)
      } else { return null; }
    })
    .on("end", function () {
      if (activeBrush === "red") {
        return null
      } else if (activeBrush === "green") {
        return null
      } else {
        return null
      }
    });


  svg_data_sc = d3
    .select("#scatterArea")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom);

  svg_data_sc
    .append("defs")
    .append("clipPath")
    .attr("id", "clip1")
    .append("rect")
    .attr("width", width)
    .attr("height", height);

  focus = svg_data_sc
    .append("g")
    .attr("class", "focus")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  focus
    .append("g")
    .attr("class", "brushScatter")
    .call(brushScatter);

  // append scatter plot to main chart area
  foreground_sc = focus.append("g")
    .attr("clip-path", "url(#clip1)")
    .selectAll("dot")
    .data(data)
    .enter()
    .append("circle")
    .attr("class", "dot")
    .attr("r", 4)
    .attr("opacity", ".4")
    .attr("cx", function (d) {
      return x_sc(d["x"]);
    })
    .attr("cy", function (d) {
      return y_sc(d["y"]);
    })
    .style("fill", function (d) {
      return color(+d["diagnosis"]);
    })
    .on("mouseover", function (d) {
      d3.select(this)
        .transition()
        .duration(200)
        .attr("opacity", 1)
        .attr("r", 6);
    })
    .on("mouseout", function (d) {
      d3.select(this)
        .transition()
        .duration(200)
        .attr("opacity", "0.4")
        .attr("r", 4);
    });

  focus
    .append("g")
    .attr("class", "axis axis--x")
    .attr("transform", "translate(0," + height + ")")
    .call(xAxis);

  focus.append("g").attr("class", "axis axis--y").call(yAxis);

}

function brush_scatter_plot(event, selectedItems, data, allow_recurse = true) {

  // Get the brush selection
  console.log("brush_scatter_plot");
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

  global_selected_items = selectedItems;
  var selectedIds = [];
  var selection = []
  var brushExtent = d3.brushSelection(focus.select(".brushScatter").node());
  if (brushExtent) {
    selection.push([brushExtent[0][0], brushExtent[0][1]]);
    selection.push([brushExtent[1][0], brushExtent[1][1]]);
  }
  console.log(brushExtent)
  console.log(selection)


  // If a brush selection exists
  if (selection.length !== 0) {
    // Get the selected circles
    data.forEach(function (d) {
      var isBrushed =
        selection[0][0] <= x_sc(d["x"]) &&
        x_sc(d["x"]) <= selection[1][0] &&
        selection[0][1] <= y_sc(d["y"]) &&
        y_sc(d["y"]) <= selection[1][1];
      if (isBrushed) {
        console.log(isBrushed);
        selectedIds.push(d.id);
      }
    });
  }
  console.log(selectedIds);

  if (selectedIds.length === 0 && selection.length === 0) {
    console.log("selectedIds.length === 0");
    let selectedItems_other = getIntersection(global_selected_items);
    console.log(selectedItems_other)

    foreground_sc.attr("r", function (d) {
      if (selectedItems_other.includes(d.id)) {
        return "5";
      } else {
        return "2";
      }
    });
    foreground_sc.attr("class", function (d) {
      if (selectedItems_other.includes(d.id)) {
        return "selecteddot";
      } else {
        return "nonSelecteddot";
      }
    });
  } else {
    // If there are active brushes, find the ids of the data elements that are brushed over

    global_selected_items.sp = selectedIds;
    console.log(global_selected_items.pc.length);
    console.log(global_selected_items.pce.length);
    console.log(selectedIds);
    let selectedItems_here = getIntersection(global_selected_items);
    console.log(selectedItems_here);

    foreground_sc.attr("r", function (d) {
      if (selectedItems_here.includes(d.id)) {
        return "5";
      } else {
        return "2";
      }
    });

    foreground_sc.attr("class", function (d) {
      if (selectedItems_here.includes(d.id)) {
        return "selecteddot";
      } else {
        return "nonSelecteddot";
      }
    });
  }
  if (allow_recurse == true) {
    brush_parallel_chart_exp(undefined, global_selected_items, derived_data, false);
    brush_parallel_chart(undefined, global_selected_items, original_data, false);
    brush_scatter_plot_exp(undefined, global_selected_items, tsne_derived_data, false);
  }
}

function clear_brushes_SC(clear_pc) {
  global_selected_items = clear_pc;
  console.log("clear_brushes_SC")
  focus
    .selectAll(".brushScatter").call(brushScatter.move, null);
  global_selected_items['sp'] = all_data_ids;
  brush_scatter_plot(undefined, global_selected_items, original_data, true);

}