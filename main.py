from sklearn.tree import DecisionTreeClassifier
import numpy as np
import json
from flask import Flask, request ,render_template
app = Flask(__name__)

@app.route('/')
def index():
    return render_template('index.html')


@app.route('/postmethod', methods = ['POST'])
def get_post_javascript_data():
    jsdata = request.get_json()
    json_rules= train_decision_tree(jsdata)
    # print(json_rules)
    return json_rules


def train_decision_tree(data):
    # Preprocessing
    X = []
    y = []
    for item in data:
        y.append(item.pop("cluster"))
        item.pop("id")
        X.append([float(val) for val in item.values()])
    feature_names = list(item.keys())
    # Training
    clf = DecisionTreeClassifier()
    clf.fit(X, y)
    accuracy=clf.score(X, y)
    print(accuracy)
    # Exporting rules
    extracted_rules=rules(clf,feature_names,["Malignanat","Beningn"])
    # print(extracted_rules)
    return json.dumps(extracted_rules, cls=MyEncoder)

def rules(clf, features, labels, node_index=0):
    """Structure of rules in a fit decision tree classifier

    Parameters
    ----------
    clf : DecisionTreeClassifier
        A tree that has already been fit.

    features, labels : lists of str
        The names of the features and labels, respectively.

    """
    node = {}
    if clf.tree_.children_left[node_index] == -1:  # indicates leaf
        count_labels = zip(clf.tree_.value[node_index, 0], labels)
        node['name'] = ', '.join(('{} of {}'.format(int(count), label)
                                 for count, label in count_labels))
        node['type']='leaf'
        node['value'] = clf.tree_.value[node_index, 0].tolist()
        node['error'] = np.float64(clf.tree_.impurity[node_index]).item()
        node['samples'] = clf.tree_.n_node_samples[node_index]
    else:
        feature = features[clf.tree_.feature[node_index]]
        threshold = clf.tree_.threshold[node_index]
        node['type']='split'
        node['label'] = '{} > {}'.format(feature, threshold)
        node['error'] = np.float64(clf.tree_.impurity[node_index]).item()
        node['samples'] = clf.tree_.n_node_samples[node_index]
        node['value'] = clf.tree_.value[node_index, 0].tolist()
        left_index = clf.tree_.children_left[node_index]
        right_index = clf.tree_.children_right[node_index]
        node['children'] = [rules(clf, features, labels, right_index),
                            rules(clf, features, labels, left_index)]
        
    return node

class MyEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, np.integer):
            return int(obj)
        elif isinstance(obj, np.floating):
            return float(obj)
        elif isinstance(obj, np.ndarray):
            return obj.tolist()
        else:
            return super(MyEncoder, self).default(obj)


if __name__ == '__main__':
    app.run(debug=True)