# JPEG Folder Bucketing

## Overview

This project demonstrates a solution for mapping scanned JPEG filenames to their corresponding folder identifiers.

The input consists of two lists:

1. A list of folder identifiers.
2. A list of scanned JPEG filenames.

Each JPEG filename contains its corresponding folder identifier followed by `_J_` and an image sequence number.

For example:

```text
MS-011_1_1_25_J_0042.jpg
```

belongs to the folder:

```text
MS-011_1_1_25
```

The program automatically identifies the folder associated with each JPEG file and groups the files into their respective buckets.

---

## Test Data

The project generates synthetic test data for demonstration and testing.

The generated dataset contains:

* **600 folder identifiers**
* **60,000 JPEG filenames**
* Every folder is guaranteed to have at least one JPEG filename.

Example folder identifiers:

```text
MS-011_1_1_1
MS-011_1_1_2
MS-011_1_1_3
...
```

Example JPEG filenames:

```text
MS-011_1_1_1_J_0001.jpg
MS-011_1_1_1_J_0002.jpg
MS-011_1_1_2_J_0001.jpg
MS-011_1_1_3_J_0001.jpg
```

The JPEG files themselves are not created because the assignment requires filenames, not actual image files.

---

## Project Structure

```text
jpeg-folder-bucketing/
│
├── data/
│   ├── folders.txt
│   └── files.txt
│
├── output/
│   └── buckets.json
│
├── generate_test_data.py
├── bucket_files.py
└── README.md
```

### Files and Directories

**`generate_test_data.py`**

Generates the synthetic folder identifiers and JPEG filenames.

**`bucket_files.py`**

Reads the input lists, identifies the folder corresponding to each JPEG filename, and creates the bucketed output.

**`data/folders.txt`**

Contains the list of folder identifiers.

**`data/files.txt`**

Contains the list of JPEG filenames.

**`output/buckets.json`**

Contains the final structured mapping between folders and JPEG files.

---

## How It Works

The folder identifier is extracted from the JPEG filename using `_J_` as the separator.

For example:

```text
MS-011_1_2_6_341_J_0025.jpg
```

The program extracts:

```text
Folder ID:
MS-011_1_2_6_341
```

The complete JPEG filename is then added to that folder's bucket.

Conceptually:

```text
Folder
  |
  +-- JPEG 1
  +-- JPEG 2
  +-- JPEG 3
  +-- ...
```

---

## Example

### Input

Folder list:

```text
MS-011_1_1_1
MS-011_1_1_2
```

JPEG list:

```text
MS-011_1_1_1_J_0001.jpg
MS-011_1_1_1_J_0002.jpg
MS-011_1_1_2_J_0001.jpg
```

### Output

```json
{
  "MS-011_1_1_1": [
    "MS-011_1_1_1_J_0001.jpg",
    "MS-011_1_1_1_J_0002.jpg"
  ],
  "MS-011_1_1_2": [
    "MS-011_1_1_2_J_0001.jpg"
  ]
}
```

---

## How to Run

### Step 1: Generate Test Data

Run:

```bash
python generate_test_data.py
```

This creates:

```text
data/folders.txt
data/files.txt
```

with 600 folders and 60,000 JPEG filenames.

### Step 2: Bucket the JPEG Files

Run:

```bash
python bucket_files.py
```

The program creates:

```text
output/buckets.json
```

containing the folder-to-JPEG mapping.

---

## Validation

The bucketing program reports:

* Total number of JPEG files processed
* Number of successfully matched files
* Number of unmatched files
* Number of folders
* Location of the generated output file

Example:

```text
Loaded 600 folders.

Bucketing completed!
--------------------
Total JPEG files : 60000
Matched files    : 60000
Unmatched files  : 0
Folders          : 600
```

If a JPEG filename refers to a folder that does not exist in the folder list, the program reports it as an unmatched file rather than terminating.

---

## Approach

The solution uses a dictionary where:

```text
key   = folder identifier
value = list of JPEG filenames
```

The overall process is:

```text
Read folder identifiers
        ↓
Create an empty bucket for each folder
        ↓
Read JPEG filenames
        ↓
Extract folder identifier from filename
        ↓
Check whether the folder exists
        ↓
Add JPEG filename to the corresponding bucket
        ↓
Write buckets to JSON
```

---

## Complexity

Let:

* `F` = number of folders
* `J` = number of JPEG filenames

Loading the folders takes approximately:

```text
O(F)
```

Processing the JPEG filenames takes:

```text
O(J)
```

Therefore, the overall time complexity is approximately:

```text
O(F + J)
```

The dictionary provides efficient average-case lookup for checking whether a folder exists.

The space complexity is:

```text
O(F + J)
```

because the buckets store the folder identifiers and their associated JPEG filenames.

---

## Error Handling

The program handles:

* Empty lines in input files
* Invalid JPEG filename formats
* JPEG files whose folder identifier does not exist
* Duplicate folder identifiers in the generated test data

Unmatched files are reported separately so that they can be investigated without stopping the entire processing operation.

---

## Technologies Used

* Python 3
* Standard Python libraries
* JSON
* Text files

No external Python packages are required.

---

## Conclusion

This project provides a simple and scalable approach for associating scanned JPEG filenames with their corresponding folder identifiers.

The solution separates test-data generation from the actual bucketing logic and produces a structured JSON output that can be easily consumed by other applications or processing pipelines.
