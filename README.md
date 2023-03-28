# Probe-AI Machine-Learning-Interpretability-using-Visual-Analytics

For a detailed explanation of project, check out the [report](Visual Analytics report.pdf)

Probe-AI is a visual analytics system designed to provide a comprehensive understanding of complex machine learning models. The goal of the project is to enable the identification and interpretation of different model strategies to gain insights into how the models work.

To achieve this, Probe-AI uses post-hoc explanation methods such as LIME to generate explanations of how the models make predictions. These explanations are then visualized using scatter plots, parallel coordinates, and decision trees to identify patterns and relationships in the feature contribution vectors and real data.

One of the key features of Probe-AI is its ability to compare the model's strategies with the actual data. By analyzing clusters of malignant and benign cases and identifying the strategies the model uses to distinguish between them, the system can determine whether the model is consistent and accurate in its predictions. For example, by analyzing clusters based on area mean value, the system found that the model was treating them differently in terms of malignancy. The higher area mean values were in a different cluster and were malignant, while lower area mean values were in a different cluster and were benign.

Overall, Probe-AI provides a powerful tool for understanding complex machine learning models and their strategies. Its use of visualization techniques and post-hoc explanation methods makes it easy to identify patterns and relationships in the data, while its focus on model consistency and accuracy ensures that the models are reliable and trustworthy.





Requirements:
Python - tested on version 3.8
