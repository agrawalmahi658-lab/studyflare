import sys
import json

# Simple recommendation logic (no install needed yet)
data = {
    "machine learning": ["Deep Learning", "AI Basics", "Neural Networks"],
    "python": ["Python Basics", "Flask Guide", "Data Science with Python"],
    "data science": ["Data Analysis", "Pandas Tutorial", "Visualization"]
}

def recommend(query):
    query = query.lower()
    for key in data:
        if key in query:
            return data[key]
    return ["General Study Tips", "Time Management", "Productivity"]

if __name__ == "__main__":
    query = sys.argv[1]
    result = recommend(query)
    print(json.dumps(result))