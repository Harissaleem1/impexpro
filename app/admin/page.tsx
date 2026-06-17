import type { Metadata } from "next";
import Link from "next/link";
import { AdminChrome } from "@/components/AdminChrome";
import { getAllActivities } from "@/lib/activities";
import { getAllBlogs } from "@/lib/blogs";
import { getAllReviews } from "@/lib/reviews";
import { getSubmissions } from "@/lib/submissions";
import { getAllTeamMembers } from "@/lib/team";
import { formatDate } from "@/lib/blog-shared";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Admin Dashboard | Impex-Pro CMS",
  robots: { index: false, follow: false }
};

export default async function AdminDashboardPage() {
  const [blogs, activities, submissions, team, reviews] = await Promise.all([
    getAllBlogs(),
    getAllActivities(),
    getSubmissions(),
    getAllTeamMembers(),
    getAllReviews()
  ]);
  const recentSubmissions = submissions.slice(0, 5);
  const recentContent = [
    ...blogs.slice(0, 3).map((item) => ({ id: item.id, href: `/admin/blogs/edit/${item.id}`, title: item.title, meta: `Blog - ${item.category}`, date: item.updatedAt })),
    ...activities.slice(0, 3).map((item) => ({ id: item.id, href: `/admin/activities/edit/${item.id}`, title: item.title, meta: `Activity - ${item.activityType}`, date: item.updatedAt }))
  ]
    .sort((a, b) => new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime())
    .slice(0, 5);
  const stats = [
    { label: "Total Submissions", value: submissions.length, icon: "Inbox", href: "/admin/submissions" },
    { label: "Total Blogs", value: blogs.length, icon: "Blogs", href: "/admin/blogs" },
    { label: "Total Activities", value: activities.length, icon: "Events", href: "/admin/activities" },
    { label: "Team Members", value: team.length, icon: "Team", href: "/admin/team" },
    { label: "Reviews", value: reviews.length, icon: "Reviews", href: "/admin/reviews" }
  ];

  return (
    <AdminChrome>
      <div className="admin-page-head">
        <div>
          <h1>Admin Dashboard</h1>
          <p>Welcome back. Here is a clean snapshot of your Impex-Pro content, inquiries, and management activity.</p>
        </div>
      </div>
      <section className="admin-stats admin-stats-premium">
        {stats.map((stat) => (
          <Link href={stat.href} key={stat.label}>
            <span className="admin-stat-icon">{stat.icon}</span>
            <strong>{stat.value}</strong>
            <span>{stat.label}</span>
          </Link>
        ))}
      </section>
      <div className="admin-dashboard-grid">
        <section className="admin-panel">
          <div className="admin-panel-head">
            <div>
              <span>Inbox</span>
              <h2>Recent Submissions</h2>
            </div>
            <Link href="/admin/submissions">View all</Link>
          </div>
          <div className="admin-recent-list">
            {recentSubmissions.map((submission) => (
              <Link key={submission.id} href={`/admin/submissions/${submission.id}`}>
                <strong>{submission.name}</strong>
                <span>{submission.service || submission.formType} - {formatDate(submission.createdAt)}</span>
              </Link>
            ))}
            {!recentSubmissions.length ? <p>No submissions yet.</p> : null}
          </div>
        </section>
        <section className="admin-panel">
          <div className="admin-panel-head">
            <div>
              <span>Content</span>
              <h2>Recent Content Activity</h2>
            </div>
          </div>
          <div className="admin-recent-list">
            {recentContent.map((item) => (
              <Link key={`${item.href}-${item.id}`} href={item.href}>
                <strong>{item.title}</strong>
                <span>{item.meta} - {formatDate(item.date)}</span>
              </Link>
            ))}
            {!recentContent.length ? <p>No content activity yet.</p> : null}
          </div>
        </section>
      </div>
    </AdminChrome>
  );
}
