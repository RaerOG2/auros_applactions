export type MapMarkerType =
  | "poi"
  | "landmark"
  | "story"
  | "event"
  | "spawn"
  | "other";

export interface MapMarker {
  id: string;

  map_id: string;

  name: string;

  type: MapMarkerType;

  description: string | null;

  image_url: string | null;

  icon: string | null;

  x: number;
  y: number;

  published: boolean;

  sort_order: number;

  created_at: string;
  updated_at: string;
}

export interface MapMarkerForm {
  name: string;

  type: MapMarkerType;

  description: string;

  image_url: string;

  icon: string;

  x: number;
  y: number;

  published: boolean;

  sort_order: number;
}

export const emptyMapMarkerForm: MapMarkerForm = {
  name: "",
  type: "poi",
  description: "",
  image_url: "",
  icon: "",
  x: 50,
  y: 50,
  published: true,
  sort_order: 0,
};