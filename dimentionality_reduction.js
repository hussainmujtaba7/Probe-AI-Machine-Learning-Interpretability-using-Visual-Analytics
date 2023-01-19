function dimentionality_reduction_tSNE(data) {
  var data = data;

  column_names=Object.keys(data[0])
  console.log(column_names)

  var features = data.map(function (d) {
    return Object.keys(d)
      .filter(function(key) {
        return column_names.includes(key) && key != "diagnosis" && key != "id";
      })
      .map(function(key) {
        return d[key];
      });
});

  var diagnosis = data.map(function (d) {
    return d.diagnosis;
  });
  var id = data.map(function (d) {
    return d.id;
  });
  var tsne = new tsnejs.tSNE({
    dim: 2,
  });
  tsne.initDataRaw(features);
  for (var k = 0; k < 100; k++) {
    tsne.step(); // every time you call this, solution gets better.
  }

  var result = tsne.getSolution(); // Y is an array of 2-D points that you can plot
  var finalData = result.map(function (d, i) {
    return { x: d[0], y: d[1], diagnosis: diagnosis[i], id: id[i] };
  });
  return finalData
}
