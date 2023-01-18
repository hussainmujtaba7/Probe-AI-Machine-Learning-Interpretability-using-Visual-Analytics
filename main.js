d3.csv("lime_outputbreast_cancer_data_updated.csv", function (error, i_data) {
  if (error) throw error;
  d3.csv("breast_cancer_data_updated.csv", function (error, o_data) {
    if (error) throw error;

    // functions defined

    function getSelectedFeatures(data, selectedFeatures) {
        return data.map(function (d) {
            var selectedData = {};
            selectedFeatures.forEach(function (feature) {
                    selectedData[feature] = d[feature];
            });
            return selectedData;
        });
    }


    function getIds(list) {
        return list.map(function(item) {
            return item.id;
        });
    }

    function findMinMax(list) {
        let min = Infinity;
        let max = -Infinity;
        list.forEach(function(obj) {
            Object.entries(obj).forEach(function([key, value]) {
                if(key !== 'id' && key !== 'diagnosis'){
                    min = Math.min(min, value);
                    max = Math.max(max, value);
                }
            });
        });
    
        return {min: min, max: max};
    }
// select features 
    console.log(o_data)
    console.log(i_data)
    console.log(Object.keys(o_data[0]))
    console.log(Object.keys(i_data[0]))

    
    var selected_features = ["id","diagnosis", 
     "area_mean", "area_se", "concave points_mean", 
     "concavity_mean", "concavity_se", "concavity_worst"
     , "fractal_dimension_mean",];
    // var selected_features=Object.keys(o_data[0])

    original_data=getSelectedFeatures(o_data, selected_features);
    derived_data=getSelectedFeatures(i_data, selected_features);

    console.log(Object.keys(original_data[0]))
    console.log(Object.keys(derived_data[0]))

    let{min,max} =findMinMax(derived_data)

    all_data_ids=getIds(original_data)
    global_selected_items= {'sp': all_data_ids,
    'spe': all_data_ids,
    'pc': all_data_ids,
    'pce':all_data_ids};
    console.log("in main file");

   
    console.log(original_data);
    console.log(derived_data);
    console.log(global_selected_items);

    tsne_derived_data=dimentionality_reduction_tSNE(derived_data);
    console.log(tsne_derived_data);
    console.log(derived_data);

    tsne_original_data=dimentionality_reduction_tSNE(original_data);
    console.log(tsne_original_data);
    console.log(original_data);




    // code begins here
    // ###################
    drawScatter(tsne_original_data);
    drawScatter_exp(tsne_derived_data);
    drawParallel(original_data);
    drawParallel_exp(derived_data,min,max);
  });
});
