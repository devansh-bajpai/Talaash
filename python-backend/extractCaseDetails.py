from ollama import Client
import json

client = Client(host='http://localhost:11434')

params = [
    "type", "location", "time", "date", "injuries", "deathcount",
    "weapons", "clues", "witness_count", "motive", "victim_type", "suspect_type"
]


def extract_case_details(text):
    prompt = f"""
You are an information extraction model.

Extract the following fields from the case description below:
{params}

Return ONLY valid JSON with all keys. No other text needed.
If any value is missing, set it to null.

Case Description:
\"\"\"
{text}
\"\"\"
"""

    response = client.generate(
        model="llama3.2",
        prompt=prompt
    )

    output = response['response']

    try:
        return json.loads(output)
    except json.JSONDecodeError:
        print("Model returned invalid JSON:")
        print(output)
        return None