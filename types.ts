export enum BuildingType {
  RESIDENTIAL = 'Rumah Tinggal',
  VILLA = 'Villa Private/Komersial',
  KOST = 'Rumah Kost (Boarding House)',
  APARTMENT = 'Apartemen Low-Rise',
  OFFICE = 'Kantor',
  COMMERCIAL = 'Ruko/Toko',
  WAREHOUSE = 'Gudang',
  OTHER = 'Lainnya (Custom)'
}

export enum MaterialQuality {
  BUDGET = 'Ekonomis',
  STANDARD = 'Standar',
  PREMIUM = 'Mewah'
}

export interface ProjectDetails {
  projectName: string;
  location: string;
  landArea: number; // m2
  buildingArea: number; // m2
  floors: number;
  buildingType: BuildingType;
  customBuildingType?: string; // Field baru untuk input manual
  quality: MaterialQuality;
  notes: string;
}

export interface RABItem {
  description: string;
  unit: string;
  volume: number;
  unitPrice: number;
  totalPrice: number;
}

export interface RABCategory {
  categoryName: string;
  items: RABItem[];
  subtotal: number;
}

export interface RABResult {
  projectSummary: string;
  categories: RABCategory[];
  grandTotal: number;
  estimatedDuration: string;
}