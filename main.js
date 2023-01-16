d3.csv("lime_outputbreast_cancer_data_updated.csv", function (error, i_data) {
  if (error) throw error;
  d3.csv("breast_cancer_data_updated.csv", function (error, o_data) {
    if (error) throw error;

    // functions defined

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

    let{min,max} =findMinMax(i_data)

    original_data=o_data
    derived_data=i_data

    all_data_ids=getIds(original_data)
    global_selected_items= {'pc': all_data_ids,
                        'pce':all_data_ids};


    // code begins here
    // ###################
    console.log(o_data)
    drawScatter(o_data)
    drawParallel(original_data);
    drawParallel_exp(derived_data,min,max);
  });
});
