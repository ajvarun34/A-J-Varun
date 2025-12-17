export const getPythonScript = () => `import os
import json
from google import genai
from google.genai import types

# ---------------------------------------------------------
# BOM & Dimension Extractor - Python Implementation
# ---------------------------------------------------------
# Prerequisites:
# 1. Install the SDK: pip install google-genai
# 2. Set your API Key: export API_KEY="your_api_key_here"
# ---------------------------------------------------------

def extract_from_drawing(image_path):
    """
    Extracts BOM, Dimensions (Radius/Linear), and Metadata from an engineering drawing using Gemini.
    """
    client = genai.Client(api_key=os.environ.get("API_KEY"))

    # Define the schema to ensure structured JSON output
    # Matches the web application schema
    schema = {
        "type": types.Type.OBJECT,
        "properties": {
            "metadata": {
                "type": types.Type.OBJECT,
                "properties": {
                    "title": {"type": types.Type.STRING, "description": "The title of the drawing"},
                    "drawingNumber": {"type": types.Type.STRING, "description": "The unique drawing number"},
                    "revision": {"type": types.Type.STRING, "description": "Revision level"},
                    "date": {"type": types.Type.STRING, "description": "Date found in the title block"},
                    "drawnBy": {"type": types.Type.STRING, "description": "Name of the drafter"}
                }
            },
            "dimensions": {
                "type": types.Type.ARRAY,
                "items": {
                    "type": types.Type.OBJECT,
                    "properties": {
                        "feature": {"type": types.Type.STRING, "description": "Name of feature (e.g., Mounting Hole)"},
                        "type": {"type": types.Type.STRING, "description": "Type (e.g., Radius, Diameter, Length)"},
                        "value": {"type": types.Type.STRING, "description": "Numeric value (e.g. 5.5, R10)"},
                        "unit": {"type": types.Type.STRING, "description": "Unit (e.g. mm, in)"},
                        "notes": {"type": types.Type.STRING, "description": "Context (e.g. 2 places)"}
                    },
                    "required": ["value", "type"]
                }
            },
            "bom": {
                "type": types.Type.ARRAY,
                "items": {
                    "type": types.Type.OBJECT,
                    "properties": {
                        "itemNumber": {"type": types.Type.STRING, "description": "Item number"},
                        "partNumber": {"type": types.Type.STRING, "description": "Part number"},
                        "description": {"type": types.Type.STRING, "description": "Description"},
                        "quantity": {"type": types.Type.STRING, "description": "Quantity"},
                        "material": {"type": types.Type.STRING, "description": "Material"},
                        "remarks": {"type": types.Type.STRING, "description": "Remarks"}
                    },
                    "required": ["description", "quantity"]
                }
            }
        },
        "required": ["bom", "dimensions"]
    }

    print(f"Reading image: {image_path}...")
    try:
        with open(image_path, "rb") as f:
            image_bytes = f.read()
    except FileNotFoundError:
        print("Error: Image file not found.")
        return None

    print("Sending request to Gemini 2.5 Flash...")
    
    prompt = """Analyze this engineering drawing. 
    1. Locate the Title Block and extract key metadata (Title, Drawing Number, Revision, Date, Drawn By).
    2. Identify and extract key geometric dimensions marked on the drawing. 
       - Look for **Radius (R)** and **Diameter (Ø)** dimensions for circles, holes, and arcs.
       - Look for major Linear dimensions (Length, Width, Height, Thickness).
       - Infer the 'feature' name based on where the dimension points (e.g., "Mounting Hole", "Main Plate").
    3. Locate the Bill of Materials (BOM), Parts List, or Material Schedule table and extract all rows.
    
    Return the data in a structured JSON format containing 'metadata', 'dimensions', and 'bom'.
    If a value is missing, use an empty string."""

    response = client.models.generate_content(
        model="gemini-2.5-flash",
        contents=[
            types.Content(
                parts=[
                    types.Part.from_bytes(data=image_bytes, mime_type="image/jpeg"),
                    types.Part.from_text(text=prompt)
                ]
            )
        ],
        config=types.GenerateContentConfig(
            response_mime_type="application/json",
            response_schema=schema,
            temperature=0.1
        )
    )

    if response.text:
        return json.loads(response.text)
    return None

if __name__ == "__main__":
    # Example Usage
    IMAGE_PATH = "drawing.jpg" 
    
    if not os.path.exists(IMAGE_PATH):
        print(f"Please place an image file at '{IMAGE_PATH}' or update the path in the script.")
    else:
        result = extract_from_drawing(IMAGE_PATH)
        if result:
            print(json.dumps(result, indent=2))
            
            # Print Summary
            bom_count = len(result.get('bom', []))
            dim_count = len(result.get('dimensions', []))
            print(f"Extracted {bom_count} BOM items and {dim_count} dimensions.")
`;
