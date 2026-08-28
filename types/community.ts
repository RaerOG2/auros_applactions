export type ContentBlock =
  | {
      type: "heading";
      text: string;
    }
  | {
      type: "text";
      text: string;
    }
  | {
      type: "image";
      url: string;
      alt?: string;
      caption?: string;
    };

export type CommunityPatchnote = {
  id: string;

  version:
    | string
    | null;

  title:
    | string
    | null;

  slug:
    | string
    | null;

  summary:
    | string
    | null;

  content:
    | string
    | null;

  cover_url:
    | string
    | null;

  content_blocks:
    | ContentBlock[]
    | null;

  published:
    | boolean
    | null;

  created_at:
    | string
    | null;
};

export type NewsItem = {
  id: string;

  title: string;

  slug: string;

  summary:
    | string
    | null;

  content:
    | string
    | null;

  image_url:
    | string
    | null;

  pinned: boolean;

  published: boolean;

  created_at: string;
};

export type NewsEditorForm = {
  title: string;

  slug: string;

  summary: string;

  content: string;

  image_url: string;

  pinned: boolean;

  published: boolean;
};

export const emptyNewsEditorForm: NewsEditorForm =
  {
    title: "",
    slug: "",
    summary: "",
    content: "",
    image_url: "",
    pinned: false,
    published: false,
  };

export type GalleryItem = {
  id: string;

  title: string;

  image_url: string;

  category:
    | string
    | null;

  description:
    | string
    | null;

  featured: boolean;

  published: boolean;

  created_at: string;
};

export type GalleryEditorForm = {
  title: string;

  image_url: string;

  category: string;

  description: string;

  featured: boolean;

  published: boolean;
};

export const emptyGalleryEditorForm: GalleryEditorForm =
  {
    title: "",
    image_url: "",
    category: "",
    description: "",
    featured: false,
    published: false,
  };