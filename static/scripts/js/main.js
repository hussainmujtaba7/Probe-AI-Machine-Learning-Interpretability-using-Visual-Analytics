let selected_features = [];
let i_data, o_data;

d3.csv("/static/data/lime_outputbreast_cancer_data_updated.csv", function (error, i_d) {
    if (error) throw error;
    d3.csv("/static/data/breast_cancer_data_updated.csv", function (error, o_d) {
        if (error) throw error;
        i_data = i_d; o_data = o_d;
        $('#cover-spin').show(); //show loader
        setTimeout(() => {

            // for syncronized scrolling   
            $('#bottom').on('scroll', function () {
                $('#top').scrollLeft($(this).scrollLeft());
            });

            // for feature select dropdown

            var selectBox = document.getElementById('inputFeatures');
            let options = Object.keys(o_data[0]);
            selectBox.options.add(new Option('Id', 'id', true, true))
            selectBox.options.add(new Option('Diagnosis', 'diagnosis', true, true))
            document.querySelectorAll("#inputFeatures option").forEach(opt => {
                if (opt.value == "id" || opt.value == "diagnosis") { opt.disabled = true; }
            });

            for (var i = 0, l = options.length; i < l; i++) {
                if (options[i] !== 'id' && options[i] !== 'diagnosis') {
                    var optionName = options[i].charAt(0).toUpperCase() + options[i].slice(1);
                    selectBox.options.add(new Option(optionName, options[i]));
                }
            }

            $(function () { $('select').multipleSelect() })


            selected_features = Object.keys(o_data[0])
            drawGraphs(selected_features, o_data, i_data);
            $("#reset-btn1").click(function () { if (activeBrush == "coordinate") { clear_brushes_SC(global_selected_items); } })
            $("#reset-btn2").click(function () { clear_brushes_SCE(global_selected_items) })
            $("#reset-btn3").click(function () { if (activeBrush == "coordinate") { clear_brushes_PC(global_selected_items); } })
            $("#reset-btn4").click(function () { if (activeBrush == "coordinate") { clear_brushes_PCE(global_selected_items); } })
            $("#dTree-btn").click(function () { $('#chartBox').empty(); $('#dtree-box').addClass('show'); test_flask() })
            $('#cover-spin').hide();
        }, 100);
    });
});
let updateMode = () => {
    let mode1 = (activeBrush === 'green' || activeBrush === 'red');
    activeBrush = $('input[name="mode"]:checked').val();
    let mode2 = (activeBrush == "coordinate");

    let title = (activeBrush == "coordinate") ? "Co-ordinated Mode" : "Cluster Mode";
    $("#mode-title").text(title);

    if (mode1 == mode2) {
        activeBrush = "red"; //graph resets only if its red or green
        clear_brushes_SCE(global_selected_items);
        clear_brushes_SC(global_selected_items);
        clear_brushes_PC(global_selected_items);
        clear_brushes_PCE(global_selected_items);
        activeBrush = $('input[name="mode"]:checked').val(); //adding back the original value
    }
}

let callDrawGraphs = () => {
    $('#cover-spin').show(0);

    var select = document.getElementById('inputFeatures');
    var selected = [...select.selectedOptions]
        .map(option => option.value);
    console.log(selected);

    setTimeout(() => { $('#cover-spin').hide(); }, 1500); //spin loader for 1500ms

    drawGraphs(selected, o_data, i_data);
}

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
    return list.map(function (item) {
        return item.id;
    });
}

function findMinMax(list) {
    let min = Infinity;
    let max = -Infinity;
    list.forEach(function (obj) {
        Object.entries(obj).forEach(function ([key, value]) {
            if (key !== 'id' && key !== 'diagnosis') {
                min = Math.min(min, value);
                max = Math.max(max, value);
            }
        });
    });

    return { min: min, max: max };
}

let drawGraphs = (selected_features, o_data, i_data) => {
    original_data = getSelectedFeatures(o_data, selected_features);
    derived_data = getSelectedFeatures(i_data, selected_features);

    let { min, max } = findMinMax(derived_data)
    all_data_ids = getIds(original_data);
    global_selected_items = {
        'sp': all_data_ids,
        'spe': all_data_ids,
        'pc': all_data_ids,
        'pce': all_data_ids
    };

    desision_tree_variable = { 'red': [], 'green': [] };

    tsne_derived_data = dimentionality_reduction_tSNE(derived_data);
    tsne_original_data = dimentionality_reduction_tSNE(original_data);


    $("#scatterArea").empty(); $("#scatterArea_explanation").empty();
    $("#parallelArea").empty(); $("#parallelArea_explanation").empty();

    drawScatter(tsne_original_data);
    drawScatter_exp(tsne_derived_data);
    drawParallel(original_data);
    drawParallel_exp(derived_data, min, max);


}

