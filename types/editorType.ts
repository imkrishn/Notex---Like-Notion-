type Styles = {
  bold: boolean;
  italic: boolean;
  underline: boolean;
  strikethrough: boolean;
  textColor: string;
  backgroundColor: string;
};

type Link = {
  type: "link";
  content: StyledText[];
  href: string;
};

type StyledText = {
  type: "text";
  text: string;
  styles: Styles;
};

type InlineContent = Link | StyledText;

type TableContent = {
  type: "tableContent";
  rows: {
    cells: InlineContent[][];
  }[];
};

export type Block = {
  id: string;
  type: string;
  props: Record<string, boolean | number | string>;
  content: InlineContent[] | TableContent | undefined;
  children: Block[];
};