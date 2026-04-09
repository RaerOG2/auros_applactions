export type Job = {
  id: string;
  title: string | null;
  department: string | null;
  type: string | null;
  location: string | null;
  description: string | null;
  requirements: string[] | null;
  status: string | null;
  role_category: string | null;
};

export type ApplyFieldType =
  | "text"
  | "textarea"
  | "email"
  | "url"
  | "select"
  | "file";

export type ApplyFieldOption = {
  label: string;
  value: string;
};

export type ApplyFieldConfig = {
  key: string;
  label: string;
  type: ApplyFieldType;
  required?: boolean;
  placeholder?: string;
  minHeight?: number;
  options?: ApplyFieldOption[];
  width?: "full" | "half";
  description?: string;
};

export type ApplyFormValues = Record<string, string>;

export type SubmissionResult = {
  trackingCode: string;
  roleTitle: string;
};