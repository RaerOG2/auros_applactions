export type CustomEmojiItem = {
  id: string;
  shortcode: string;
  image_url: string;
  created_by: string | null;
  is_active: boolean;
  created_at: string;
};

export type EmojiReactionGroup = {
  emojiKey: string;
  count: number;
  reactedByCurrentUser: boolean;
};