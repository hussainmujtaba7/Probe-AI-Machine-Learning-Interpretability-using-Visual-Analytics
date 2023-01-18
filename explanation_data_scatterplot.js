var svg_data_sc_exp;
var x_sc_exp;
var y_sc_exp;
var foreground_sc_exp;
var focus_exp;

function drawScatter_exp(data) {
  var margin = { top: 20, right: 20, bottom: 20, left: 50 },
    width = 400 - margin.left - margin.right,
    height = 350 - margin.top - margin.bottom;

    x_sc_exp = d3.scaleLinear().range([0, width]);
    y_sc_exp = d3.scaleLinear().range([height, 0]);

  var xAxis = d3.axisBottom(x_sc_exp),
    yAxis = d3.axisLeft(y_sc_exp);

    x_sc_exp.domain(
    d3.extent(data, function (d) {
      return d["x"];
    })
  );
  y_sc_exp.domain(
    d3.extent(data, function (d) {
      return d["y"];
    })
  );
// Brush for Coordination
  var brushScatter_exp = d3
    .brush()
    .extent([
      [0, 0],
      [width, height],
    ])
    .on("brush end", function () {
      brush_scatter_plot_exp(d3.event, global_selected_items, data);
    })
    .on("start",null);

 //Brush for decision tree


    svg_data_sc_exp = d3
    .select("#scatterArea_explanation")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom);

    svg_data_sc_exp
    .append("defs")
    .append("clipPath")
    .attr("id", "clip2")
    .append("rect")
    .attr("width", width)
    .attr("height", height);

  focus_exp = svg_data_sc_exp
    .append("g")
    .attr("class", "focus")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  // append scatter plot to main chart area
  foreground_sc_exp = focus_exp.append("g")
  .attr("clip-path", "url(#clip2)")
    .selectAll("dot")
    .data(data)
    .enter()
    .append("circle")
    .attr("class", "dot")
    .attr("r", 4)
    .attr("opacity", ".4")
    .attr("cx", function (d) {
      return x_sc_exp(d["x"]);
    })
    .attr("cy", function (d) {
      return y_sc_exp(d["y"]);
    })
    .style("fill", function (d) {
      return color(+d["diagnosis"]);
    });

    focus_exp
    .append("g")
    .attr("class", "axis axis--x")
    .attr("transform", "translate(0," + height + ")")
    .call(xAxis);

    focus_exp.append("g").attr("class", "axis axis--y").call(yAxis);

    focus_exp
    .append("g")
    .attr("class", "brushScatterExp")
    .call(brushScatter_exp);

}

function brush_scatter_plot_exp(event, selectedItems, data, allow_recurse = true) {
  // Get the brush selection
  console.log("brush_scatter_plot_exp");
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
  var selection=[]
  var brushExtent = d3.brushSelection(focus_exp.select(".brushScatterExp").node());
  if(brushExtent){
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
        selection[0][0] <= x_sc_exp(d["x"]) &&
        x_sc_exp(d["x"]) <= selection[1][0] &&
        selection[0][1] <= y_sc_exp(d["y"]) &&
        y_sc_exp(d["y"]) <= selection[1][1];
      if (isBrushed) {
        console.log(isBrushed);
        selectedIds.push(d.id);
      }
    });
  }
  console.log(selectedIds);

  if (selectedIds.length === 0 && selection.length===0  ) {
    console.log("selectedIds.length === 0");
    let selectedItems_other = getIntersection(global_selected_items);
    console.log(selectedItems_other)

    foreground_sc_exp.attr("r", function(d) {
      if (selectedItems_other.includes(d.id)) {
        return "5";
      } else {
        return "2";
      }
    });
    foreground_sc_exp.attr("class", function(d) {
      if (selectedItems_other.includes(d.id)) {
        return "selecteddot";
      } else {
        return "nonSelecteddot";
      }
    });
  } else {
    // If there are active brushes, find the ids of the data elements that are brushed over

    global_selected_items.spe = selectedIds;
    console.log(global_selected_items.pc.length);
    console.log(global_selected_items.pce.length);
    console.log(selectedIds);
    let selectedItems_here = getIntersection(global_selected_items);
    console.log(selectedItems_here);

    foreground_sc_exp.attr("r", function (d) {
      if (selectedItems_here.includes(d.id)) {
        return "5";
      } else {
        return "2";
      }
    });

    foreground_sc_exp.attr("class", function (d) {
      if (selectedItems_here.includes(d.id)) {
        return "selecteddot";
      } else {
        return "nonSelecteddot";
      }
    });
  }
  if (allow_recurse == true) {
    brush_parallel_chart_exp(undefined,global_selected_items,derived_data,false);
    brush_parallel_chart(undefined,global_selected_items,original_data,false);
    brush_scatter_plot(undefined,global_selected_items,tsne_original_data,false);
  }
}

// function brush_analytics(){




// }

