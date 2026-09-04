export type StarStatus = "published" | "hidden";
export type StarSource = "tablet" | "xiaohongshu" | "douyin" | "wechat" | "manual";

export type Star = {
  id: string;
  content: string;
  source: StarSource;
  status: StarStatus;
  likes: number;
  featured: boolean;
  created_at: string;
};

export const sourceLabels: Record<StarSource, string> = {
  tablet: "平板投稿",
  xiaohongshu: "小红书",
  douyin: "抖音",
  wechat: "朋友圈",
  manual: "手动添加",
};
