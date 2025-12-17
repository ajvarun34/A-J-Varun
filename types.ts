export interface BOMItem {
  itemNumber: string;
  partNumber: string;
  description: string;
  quantity: string;
  material: string;
  remarks: string;
}

export interface DrawingMetadata {
  title?: string;
  drawingNumber?: string;
  revision?: string;
  date?: string;
  drawnBy?: string;
}

export interface DimensionItem {
  feature: string;
  type: string;
  value: string;
  unit: string;
  notes: string;
}

export interface ExtractionResult {
  metadata: DrawingMetadata;
  dimensions: DimensionItem[];
  bom: BOMItem[];
}

export enum AppState {
  IDLE = 'IDLE',
  ANALYZING = 'ANALYZING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR'
}
