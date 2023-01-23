// JavaScript object to send to the server

function modify_data(objectArray, cluster,cluster_name) {
    return objectArray
        .filter(function(obj) {
            return cluster.includes(obj.id);
        })
        .map(function(obj) {
            const { diagnosis, ...rest } = obj;
            return {...rest, cluster: cluster_name};
        });
    }
function create_dataset(array1, array2) {
    let ids = new Set();
    return array1.concat(array2).reduce(function(result, obj) {
        if (!ids.has(obj.id)) {
            ids.add(obj.id);
            result.push(obj);
        }
        return result;
    }, []);
}

async function test_flask()
{
data_red=modify_data(original_data,desision_tree_variable.red,'red')
data_green=modify_data(original_data,desision_tree_variable.green,'green')
dataset=create_dataset(data_red,data_green)

await $.ajax({
  type: "POST",
  url: '/postmethod',
  contentType: 'application/json',
  data: JSON.stringify(dataset)
}).done(function(response) {
    console.log(response)
    draw_decision_tree();
    $('#accuracy-val').text(parseFloat(response).toFixed(4));
    $("#accuracy-box").addClass('show')
})
}