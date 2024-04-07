# AI Model Performance Metrics Report (Revised Approach)

We are using GPT-4 vision model to interpret handwritten notes and transform into a structured JSON format, adhering to our predefined schema. To ensure the reliability of our application, we closely monitor the model's accuracy through key metrics: **Precision**, **Recall**, and **F1 Score**, especially following a refined evaluation approach that emphasizes task matching based on title similarity.

## Understanding the Metrics

A brief overview of the metrics used in our analysis:

- **Precision**: The ratio of correctly identified attributes by the AI to all identifications made, reflecting the model's accuracy in prediction.
- **Recall**: The model's capability to identify all relevant attributes within the data, indicating the comprehensiveness of its detection.
- **F1 Score**: A harmonized measure that balances precision and recall, offering a singular view of the model's overall accuracy.

## Revised Evaluation Methodology

In our latest evaluation method, we first match tasks based on title similarity. This allows for a more direct and meaningful comparison between AI-generated data and the expected output. Post-matching, we proceed with attribute-specific metric calculations and then aggregate these to understand our model's performance comprehensively.

### Sample Output Analysis

Recent evaluations under this revised approach yielded the following metrics:

```json
{
  "metrics": {
    "title": {
      "precision": 0.98,
      "recall": 0.98,
      "f1Score": 0.98
    },
    "time": {
      "precision": 0.78,
      "recall": 0.75,
      "f1Score": 0.76
    },
    "date": {
      "precision": 0.99,
      "recall": 1,
      "f1Score": 0.995
    },
    "tags": {
      "precision": 0.55,
      "recall": 0.65,
      "f1Score": 0.59
    }
  },
  "OverallMetrics": {
    "precision": 0.83,
    "recall": 0.85,
    "f1Score": 0.84,
    "totalAttributes": 4
  }
}
```

### Insights from the Analysis

- **Title** and **Date** Metrics:
  - Near-perfect performance with precision and recall at or above 0.98, underscoring the model's accuracy in extracting titles and dates.
- **Time** Metrics:
  - Shows improvement, with precision and recall around 0.75-0.78, highlighting better accuracy in time interpretation.
- **Tags** Metrics:
  - Indicates a notable area for enhancement. Despite a precision increase to 0.55, it shows the model's ongoing challenges in accurately identifying tags.

## Concluding Observations

This revised analytical approach, particularly the initial task matching based on title similarity, has offered nuanced insights into our AI model's performance:

- **Overall Excellence**: With an overall precision of 0.83 and recall of 0.85, the model showcases robust performance, especially in extracting critical details like titles and dates.
- **Focused Improvement on Tags**: The enhanced precision in tag identification, though improved, directs us towards targeted refinement efforts.

## The aggregate metrics reflect a comprehensive understanding of the model's capabilities and pinpoint areas requiring focused improvements, ensuring our continuous commitment to enhancing model accuracy.

---

ChatGPT Conversations:

- https://chat.openai.com/share/3f7c0973-f47d-4f19-b62e-4d6897d6dba2
- https://chat.openai.com/share/f0bee293-d973-4a09-bd2b-03c4906ad587
