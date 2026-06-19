import Layout from "@/components/layout";
import Full from "@/components/posts/full";

export const post = {
  slug: "fh",
  title: "战马",
  publishedAt: "2026-06-18T22:09:00",
  content: `<iframe width="713" height="401" src="https://www.youtube.com/embed/asKQbk7AcJU" title="崔伟立原唱《战马》完整版 歌曲旋律优美，句句入耳入心超好听" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>
  `,
};

export default function Post() {
  return (
    <Layout>
      <Full post={post} />
    </Layout>
  );
}
