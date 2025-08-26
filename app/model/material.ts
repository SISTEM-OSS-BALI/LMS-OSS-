import { Assignment } from "./assigment";
import { Type } from "./enums";
import { AssignmentProgress, MaterialProgress } from "./progress";

export interface MaterialAssignmentBase {
  base_id: string;
  title: string;
  course_id: string;
  type?: Type;
  position: number;
  progressMaterial: MaterialProgress[];
  progressAssignment: AssignmentProgress[];
  materials: Material[];
  assignments: Assignment[];
  createdAt: Date;
}

export interface Material {
  material_id: string;
  base_id: string;
  createdAt: string;
  texts: Array<{
    text_id: string;
    material_id: string;
    contentText: string;
    index: number;
  }>;
  urls: Array<{
    url_id: string;
    material_id: string;
    contentUrl: string;
    index: number;
  }>;
  images: Array<{
    image_id: string;
    material_id: string;
    imageUrl: string;
    index: number;
  }>;
  pdf: Array<{
    pdf_id: string;
    material_id: string;
    pdfUrl: string;
    index: number;
  }>;
}

export interface MaterialImage {
  image_id: string;
  material_id: string;
  imageUrl: string;
  index: number;
}

export interface MaterialUrl {
  url_id: string;
  material_id: string;
  contentUrl: string;
  index: number;
}

export interface MaterialText {
  text_id: string;
  material_id: string;
  contentText?: string;
  index?: number;
}

