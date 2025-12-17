import { GoogleGenAI, Type, Schema } from "@google/genai";
import { ExtractionResult } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const extractionSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    metadata: {
      type: Type.OBJECT,
      properties: {
        title: { type: Type.STRING, description: "The title of the drawing usually found in the title block" },
        drawingNumber: { type: Type.STRING, description: "The unique drawing number or ID" },
        revision: { type: Type.STRING, description: "Revision level (e.g., A, B, 1.0)" },
        date: { type: Type.STRING, description: "Date found in the title block" },
        drawnBy: { type: Type.STRING, description: "Name of the drafter or engineer" }
      },
      description: "Information extracted from the drawing's title block"
    },
    dimensions: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          feature: { type: Type.STRING, description: "The name of the feature or part being measured (e.g., Base, Mounting Hole, Shaft)" },
          type: { type: Type.STRING, description: "Type of dimension (e.g., Length, Width, Radius, Diameter, Angle)" },
          value: { type: Type.STRING, description: "The numeric value found on the drawing (e.g., 50, 12.5, R5, Ø10)" },
          unit: { type: Type.STRING, description: "The unit of measurement (e.g., mm, in, deg)" },
          notes: { type: Type.STRING, description: "Additional context (e.g., 2 places, Typical, Through hole)" }
        },
        required: ["value", "type"],
      },
      description: "List of geometric dimensions, focusing on radii and major linear dimensions"
    },
    bom: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          itemNumber: { type: Type.STRING, description: "The item number or reference designation (e.g., 1, 2, A, B)" },
          partNumber: { type: Type.STRING, description: "The specific part number or code" },
          description: { type: Type.STRING, description: "Description of the part or component" },
          quantity: { type: Type.STRING, description: "Quantity required (e.g., 1, 4x, 10)" },
          material: { type: Type.STRING, description: "Material specification (e.g., Steel, Aluminum, PVC)" },
          remarks: { type: Type.STRING, description: "Any additional notes or comments found in the row" }
        },
        required: ["description", "quantity"],
      },
      description: "List of items in the Bill of Materials table"
    }
  },
  required: ["bom", "dimensions"]
};

export const extractBOM = async (base64Image: string, mimeType: string): Promise<ExtractionResult> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: mimeType,
              data: base64Image,
            },
          },
          {
            text: `Analyze this engineering drawing. 
            1. Locate the Title Block and extract key metadata (Title, Drawing Number, Revision, Date, Drawn By).
            2. Identify and extract key geometric dimensions marked on the drawing. 
               - Look for **Radius (R)** and **Diameter (Ø)** dimensions for circles, holes, and arcs.
               - Look for major Linear dimensions (Length, Width, Height, Thickness).
               - Infer the 'feature' name based on where the dimension points (e.g., "Mounting Hole", "Main Plate").
            3. Locate the Bill of Materials (BOM), Parts List, or Material Schedule table and extract all rows.
            
            Return the data in a structured JSON format containing 'metadata', 'dimensions', and 'bom'.
            If a value is missing, use an empty string. Preserve all technical codes and dimensions accurately.`
          },
        ],
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: extractionSchema,
        temperature: 0.1, // Low temperature for high factual accuracy
      },
    });

    if (response.text) {
      const data = JSON.parse(response.text) as ExtractionResult;
      if (!data.bom) data.bom = [];
      if (!data.dimensions) data.dimensions = [];
      return data;
    }
    
    throw new Error("No data returned from Gemini");
  } catch (error) {
    console.error("Error extracting data:", error);
    throw error;
  }
};
