export interface BaseBlock {
  id: string;
  type:
    | "paragraph"
    | "heading"
    | "quote"
    | "toggleListItem"
    | "numberedListItem"
    | "bulletListItem"
    | "codeBlock"
    | "divider"
    | "table"
    | "image"
    | "video"
    | "audio"
    | "file";
  props: Record<string, any>;
  content?: string | null;
  children?: BaseBlock[];
}

export interface ParagraphBlock extends BaseBlock {
  type: "paragraph";
  props: {
    text?: string;
    alignment?: "left" | "center" | "right";
  };
}

export interface HeadingBlock extends BaseBlock {
  type: "heading";
  props: {
    level: 1 | 2 | 3 | 4 | 5 | 6;
    text: string;
  };
}

export interface QuoteBlock extends BaseBlock {
  type: "quote";
  props: {
    text: string;
    author?: string;
  };
}

export interface ListItemBlock extends BaseBlock {
  type: "toggleListItem" | "numberedListItem" | "bulletListItem";
  props: {
    text: string;
    checked?: boolean;
  };
}

export interface CodeBlock extends BaseBlock {
  type: "codeBlock";
  props: {
    language: string;
    code: string;
  };
}

export interface DividerBlock extends BaseBlock {
  type: "divider";
  props: {};
}

export interface TableBlock extends BaseBlock {
  type: "table";
  props: {
    rows: number;
    columns: number;
    data?: string[][];
  };
}

export interface MediaBlock extends BaseBlock {
  type: "image" | "video" | "audio" | "file";
  props: {
    url: string;
    name?: string;
    caption?: string;
    size?: number;
    mimeType?: string;
  };
}

export type Block =
  | ParagraphBlock
  | HeadingBlock
  | QuoteBlock
  | ListItemBlock
  | CodeBlock
  | DividerBlock
  | TableBlock
  | MediaBlock;
