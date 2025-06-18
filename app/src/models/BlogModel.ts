import { type ContentBlock } from "../components/blogblockcontent";

export type Content = {
  blocks: ContentBlock[];
  [key: string]: any;
};

export type BlogParams = {
  _id?: string;
  blog_id?: string;
  title?: string;
  des?: string;
  banner?: string;
  activity?: any;
  tags?: string[];
  publishedAt?: string;
  author?: any;
  draft?: boolean;
  content?: Content;
};

export class BlogModel {
  _id?: string;
  blog_id?: string;
  title?: string;
  des?: string;
  banner?: string;
  activity?: any;
  tags?: string[];
  publishedAt?: string;
  author?: any;
  draft?: boolean;
  content?: Content;

  constructor(data: BlogParams) {
    Object.assign(this, data);
  }
}
