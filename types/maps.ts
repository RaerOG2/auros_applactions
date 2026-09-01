export interface AurosMap {
  id: string;

  name: string;

  slug: string | null;

  venture_name: string | null;

  season_name: string | null;

  season_number: number | null;

  version: string | null;

  description: string | null;

  image_url: string;

  thumbnail_url: string | null;

  release_date: string | null;

  current: boolean;

  published: boolean;

  dev_only: boolean;

  sort_order: number;

  created_at: string;

  updated_at: string;
}

export interface MapEditorForm {
  name: string;

  venture_name: string;

  season_name: string;

  season_number: string;

  version: string;

  description: string;

  image_url: string;

  thumbnail_url: string;

  release_date: string;

  current: boolean;

  published: boolean;

  dev_only: boolean;

  sort_order: string;
}

export const emptyMapEditorForm: MapEditorForm = {
  name: "",

  venture_name: "",

  season_name: "",

  season_number: "",

  version: "",

  description: "",

  image_url: "",

  thumbnail_url: "",

  release_date: "",

  current: false,

  published: false,

  dev_only: false,

  sort_order: "0",
};