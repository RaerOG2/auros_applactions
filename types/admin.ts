/* =========================================================
   PATCHNOTES EDITOR 4.0
   ========================================================= */

export type PatchnoteSplitRatio =
  | "30-70"
  | "40-60"
  | "50-50"
  | "60-40"
  | "70-30";


export type PatchnoteHeadingBlock = {
  id: string;
  type: "heading";
  text: string;
};


export type PatchnoteTextBlock = {
  id: string;
  type: "text";
  text: string;
};


export type PatchnoteVideoBlock = {
  id: string;
  type: "video";
  url: string;
  poster?: string;
  caption?: string;
  autoplay?: boolean;
  muted?: boolean;
  loop?: boolean;
};


export type PatchnoteImageBlock = {
  id: string;
  type: "image";
  url: string;
  alt?: string;
  caption?: string;
};


export type PatchnoteSplitBlock = {
  id: string;
  type: "split";

  ratio:
    PatchnoteSplitRatio;

  imagePosition:
    | "left"
    | "right";

  heading: string;
  text: string;
  imageUrl: string;

  imageAlt?: string;
  imageCaption?: string;
};


export type PatchnoteHighlightBlock = {
  id: string;
  type: "highlight";

  eyebrow?: string;

  heading: string;
  text: string;

  tone?:
    | "cyan"
    | "purple"
    | "green"
    | "amber";
};


export type PatchnoteGalleryImage = {
  id: string;
  url: string;

  alt?: string;
  caption?: string;
};


export type PatchnoteGalleryBlock = {
  id: string;
  type: "gallery";

  columns?:
    | 2
    | 3;

  images:
    PatchnoteGalleryImage[];
};


export type PatchnoteDividerBlock = {
  id: string;
  type: "divider";
};


export type PatchnoteSpacerBlock = {
  id: string;
  type: "spacer";

  size:
    | "small"
    | "medium"
    | "large";
};


export type PatchnoteContentBlock =
  | PatchnoteHeadingBlock
  | PatchnoteTextBlock
  | PatchnoteImageBlock
  | PatchnoteVideoBlock
  | PatchnoteSplitBlock
  | PatchnoteHighlightBlock
  | PatchnoteGalleryBlock
  | PatchnoteDividerBlock
  | PatchnoteSpacerBlock;


export type PatchnoteItem = {
  id: string;

  version:
    string | null;

  title:
    string | null;

  slug:
    string | null;

  summary:
    string | null;

  content:
    string | null;

  cover_url:
    string | null;

  content_blocks:
    | PatchnoteContentBlock[]
    | null;

  published:
    boolean;

  created_at:
    string | null;

  updated_at?:
    string | null;

  release_at?:
    string | null;
};


export type PatchnoteEditorForm = {
  version: string;
  title: string;
  slug: string;
  summary: string;
  cover_url: string;
  published: boolean;
  release_at: string;

  blocks:
    PatchnoteContentBlock[];
};


export const emptyPatchnoteEditorForm:
  PatchnoteEditorForm = {
  version: "",
  title: "",
  slug: "",
  summary: "",
  cover_url: "",
  published: false,
  release_at: "",
  blocks: [],
};