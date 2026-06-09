export type CriterionAttribute = "benefit" | "cost";

export interface Criterion {
  id: number;
  code: string;
  name: string;
  attribute: CriterionAttribute;
  weight: number;
  normalized_weight: number;
  created_at: string;
  updated_at: string;
}

export interface SaveCriterionPayload {
  code: string;
  name: string;
  attribute: CriterionAttribute;
  weight: number;
}
