var svg_data_sc_exp;
var x_sc_exp;
var y_sc_exp;
var foreground_sc_exp;
var focus_exp;
var brushScatter_exp;

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
brushScatter_exp = d3
.brush()
.extent([
  [0, 0],
  [width, height],
]).on("end", null)
.on("brush", function () {
  if (activeBrush === "coordinate") {
    return brush_scatter_plot_exp(d3.event, global_selected_items, data)
  } else {return null; }
})
.on("end", function () {
  if (activeBrush === "red") {
    return  brush_analytics_red(data) 
  } else if (activeBrush === "green") {
    return brush_analytics_green(data)
  } else {
    return null }
});


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

  focus_exp
    .append("g")
    .attr("class", "brushScatterExp")
    .call(brushScatter_exp);

  // append scatter plot to main chart area
  foreground_sc_exp = focus_exp.append("g")
  .attr("clip-path", "url(#clip2)")
    .selectAll("dot")
    .data(data)
    .enter()
    .append("circle")
    .attr("class", "dot")
    .attr("r", 4)
    .attr("opacity", ".5")
    .attr("cx", function (d) {
      return x_sc_exp(d["x"]);
    })
    .attr("cy", function (d) {
      return y_sc_exp(d["y"]);
    })
    .style("fill", function (d) {
      return color(+d["diagnosis"]);
    })
    .on("mouseover", function(d) {
      d3.select(this)
        .transition()
        .duration(200)
        .attr("opacity", 1)
        .attr("r", 6);
    })
    .on("mouseout", function(d) {
      d3.select(this)
        .transition()
        .duration(200)
        .attr("opacity",function()
        { if (getIntersection(global_selected_items).includes(d.id)) {
          return "0.5";
        } else {
          return "0.1";
        }})
        .attr("r",function()
        { if (getIntersection(global_selected_items).includes(d.id)) {
          return "4";
        } else {
          return "2";
        }});
    });


    focus_exp
    .append("g")
    .attr("class", "axis axis--x")
    .attr("transform", "translate(0," + height + ")")
    .call(xAxis);

    focus_exp.append("g").attr("class", "axis axis--y").call(yAxis);

 

}

function brush_scatter_plot_exp(event, selectedItems, data, allow_recurse = true) {
  // Get the brush selection
  console.log("brush_scatter_plot_exp");

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
        return "4";
      } else {
        return "2";
      }
    });
    foreground_sc_exp.attr("opacity", function(d) {
      if (selectedItems_other.includes(d.id)) {
        return "0.5";
      } else {
        return "0.1";
      }
    });
  } else {
    // If there are active brushes, find the ids of the data elements that are brushed over

    global_selected_items.spe = selectedIds;
    let selectedItems_here = getIntersection(global_selected_items);
    console.log(selectedItems_here);

    foreground_sc_exp.attr("r", function (d) {
      if (selectedItems_here.includes(d.id)) {
        return "4";
      } else {
        return "2";
      }
    });

    foreground_sc_exp.attr("opacity", function (d) {
      if (selectedItems_here.includes(d.id)) {
        return "0.5";
      } else {
        return "0.1";
      }
    });
  }
  if (allow_recurse == true) {
    brush_parallel_chart_exp(undefined,global_selected_items,derived_data,false);
    brush_parallel_chart(undefined,global_selected_items,original_data,false);
    brush_scatter_plot(undefined,global_selected_items,tsne_original_data,false);
  }
}

function brush_analytics_red(data) {
  var selectedIds = [];
  var selection = [];
  var brushExtent = d3.brushSelection(
    focus_exp.select(".brushScatterExp").node()
  );
  if (brushExtent) {
    selection.push([brushExtent[0][0], brushExtent[0][1]]);
    selection.push([brushExtent[1][0], brushExtent[1][1]]);
  }
  console.log(brushExtent);
  console.log(selection);

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

  foreground_sc_exp.style("fill", function (d) {
    if(desision_tree_variable.green.includes(d.id) && selectedIds.includes(d.id)){
      return "grey";
    }else if (desision_tree_variable.green.includes(d.id)) {
      return "green";
    } else if(selectedIds.includes(d.id)){
      return "red";
    }else { return color(d["diagnosis"]);}
  });

  desision_tree_variable.red=selectedIds;
  console.log(desision_tree_variable)
}

function brush_analytics_green(data) {
  var selectedIds = [];
  var selection = [];
  var brushExtent = d3.brushSelection(
    focus_exp.select(".brushScatterExp").node()
  );
  if (brushExtent) {
    selection.push([brushExtent[0][0], brushExtent[0][1]]);
    selection.push([brushExtent[1][0], brushExtent[1][1]]);
  }
  console.log(brushExtent);
  console.log(selection);

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


  foreground_sc_exp.style("fill", function (d) {
    if(desision_tree_variable.red.includes(d.id) && selectedIds.includes(d.id)){
      return "grey";
    }else if (desision_tree_variable.red.includes(d.id)) {
      return "red";
    } else if(selectedIds.includes(d.id)){
      return "green";
    }else { return color(d["diagnosis"]);}
  });
  desision_tree_variable.green=selectedIds;
  console.log(desision_tree_variable)
}

function clear_brushes_SCE(clear_pc) {
  global_selected_items=clear_pc;
  console.log("clear_brushes_SCE")
  focus_exp
  .selectAll(".brushScatterExp").call(brushScatter_exp.move, null);
  global_selected_items['spe']=all_data_ids;
  desision_tree_variable.red=[]
  desision_tree_variable.green=[]
  console.log(desision_tree_variable)
  brush_analytics_red(derived_data)
  brush_scatter_plot_exp(undefined, global_selected_items, derived_data, true);
  
}