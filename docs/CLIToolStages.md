# Overview of CLI Tool Operation Stages

This document outlines the stages involved when running our command-line interface (CLI) tool for assessing the accuracy of AI-generated tasks from handwritten notes. The tool processes images, analyzes them with AI to extract structured JSON, and evaluates the accuracy of this extraction process.

## Command Example

```bash
dotenvx run -- npm run assess-accuracy -- \
 --samples-group software_engineer \
 --samples 28_02_2024 | pino-pretty
```

## Environment Configuration

Before running the tool, ensure the `.env` file is correctly set up as per `.env.example`:

```plaintext
OPENAI_API_KEY=
OPENAI_ANALYSIS_ASSISTANT_ID=
LOG_LEVEL=debug
```

- `OPENAI_API_KEY`: Your API key for OpenAI services.
- `OPENAI_ANALYSIS_ASSISTANT_ID`: The specific ID for the analysis assistant used in processing.
- `LOG_LEVEL`: Sets the verbosity of logs (e.g., `debug`, `info`).

## Stages of Operation

### 1. Argument Parsing with Yargs

- **Purpose**: Parses CLI arguments to specify which samples to process.
- **Details**: Requires `--samples-group` for the category and `--samples` for the specific dates.

### 2. Initialization and Logging

- **Purpose**: Initializes the process and logs the start.
- **Details**: Sets up the samples directory based on the specified group.

### 3. Listing Image Files

- **Purpose**: Identifies and prepares image files for processing.
- **Details**: Lists all images for the specified dates, readying them for analysis.

### 4. Processing Images

- **Sub-Stages**:
  - **Context Reading**: Extracts any needed pre-processing information.
  - **Transformation to JSON**: Analyzes the image to extract data into a structured format.
  - **Debugging Information Storage**: Captures data for each image for troubleshooting and analysis.

### 5. Calculating Metrics

- **Purpose**: Compares the AI-generated JSON against expected formats to assess accuracy.
- **Details**: Focuses on precision, recall, and F1 scores for attributes like title, time, date, and tags.

### 6. Analyzing Calculated Metrics

- **Purpose**: Provides deeper insights into the calculated metrics using another AI model.
- **Details**: Stores analysis results for each processed image, identifying performance trends or anomalies.

### 7. Error Handling

- **Purpose**: Ensures robust operation by capturing and logging any errors that occur during processing.

### 8. Logging Completion

- **Purpose**: Marks the completion of the process, including major milestones like image processing and analysis.

## Conclusion

The tool automates the end-to-end process of converting handwritten notes into structured data, assessing the conversion's accuracy, and analyzing these results to improve future performance. It's designed to provide a scalable, automated approach to enhancing the AI model's accuracy over time.

---

ChatGPT conversations:

- https://chat.openai.com/share/f0bee293-d973-4a09-bd2b-03c4906ad587
- https://chat.openai.com/share/709dfc3c-c591-4099-afd6-12261147bc54
