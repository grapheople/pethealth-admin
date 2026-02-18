import Link from "next/link";
import {
  UtensilsCrossed,
  Activity,
  MessageSquare,
  Trophy,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createAdminClient } from "@/lib/supabase/server";

async function getStats() {
  const supabase = createAdminClient();

  const [food, stool, posts, missions] = await Promise.all([
    supabase
      .from("food_analyses")
      .select("*", { count: "exact", head: true }),
    supabase
      .from("stool_analyses")
      .select("*", { count: "exact", head: true }),
    supabase
      .from("community_posts")
      .select("*", { count: "exact", head: true }),
    supabase
      .from("mission_completions")
      .select("*", { count: "exact", head: true }),
  ]);

  return {
    foodCount: food.count ?? 0,
    stoolCount: stool.count ?? 0,
    postsCount: posts.count ?? 0,
    missionsCount: missions.count ?? 0,
  };
}

async function getRecentActivity() {
  const supabase = createAdminClient();

  const [recentFood, recentStool] = await Promise.all([
    supabase
      .from("food_analyses")
      .select("id, product_name, created_at, overall_rating")
      .order("created_at", { ascending: false })
      .limit(5),
    supabase
      .from("stool_analyses")
      .select("id, health_summary, created_at, health_score")
      .order("created_at", { ascending: false })
      .limit(5),
  ]);

  return {
    recentFood: recentFood.data ?? [],
    recentStool: recentStool.data ?? [],
  };
}

export default async function DashboardPage() {
  const stats = await getStats();
  const { recentFood, recentStool } = await getRecentActivity();

  const cards = [
    {
      title: "사료 분석",
      count: stats.foodCount,
      icon: UtensilsCrossed,
      href: "/food-analyses",
    },
    {
      title: "배변 분석",
      count: stats.stoolCount,
      icon: Activity,
      href: "/stool-analyses",
    },
    {
      title: "커뮤니티 게시글",
      count: stats.postsCount,
      icon: MessageSquare,
      href: "/community-posts",
    },
    {
      title: "미션 완료",
      count: stats.missionsCount,
      icon: Trophy,
      href: "/mission-completions",
    },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">대시보드</h1>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => (
          <Link key={card.href} href={card.href}>
            <Card className="hover:bg-accent/50 transition-colors">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {card.title}
                </CardTitle>
                <card.icon className="size-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {card.count.toLocaleString()}
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">최근 사료 분석</CardTitle>
          </CardHeader>
          <CardContent>
            {recentFood.length === 0 ? (
              <p className="text-sm text-muted-foreground">데이터가 없습니다.</p>
            ) : (
              <div className="space-y-3">
                {recentFood.map((item) => (
                  <Link
                    key={item.id}
                    href={`/food-analyses/${item.id}`}
                    className="flex items-center justify-between rounded-md p-2 hover:bg-accent transition-colors"
                  >
                    <div>
                      <p className="text-sm font-medium">
                        {item.product_name ?? "이름 없음"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(item.created_at).toLocaleDateString("ko-KR")}
                      </p>
                    </div>
                    {item.overall_rating != null && (
                      <span className="text-sm font-medium">
                        {item.overall_rating}/10
                      </span>
                    )}
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">최근 배변 분석</CardTitle>
          </CardHeader>
          <CardContent>
            {recentStool.length === 0 ? (
              <p className="text-sm text-muted-foreground">데이터가 없습니다.</p>
            ) : (
              <div className="space-y-3">
                {recentStool.map((item) => (
                  <Link
                    key={item.id}
                    href={`/stool-analyses/${item.id}`}
                    className="flex items-center justify-between rounded-md p-2 hover:bg-accent transition-colors"
                  >
                    <div>
                      <p className="text-sm font-medium">
                        {item.health_summary
                          ? item.health_summary.slice(0, 40)
                          : "요약 없음"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(item.created_at).toLocaleDateString("ko-KR")}
                      </p>
                    </div>
                    {item.health_score != null && (
                      <span className="text-sm font-medium">
                        {item.health_score}/10
                      </span>
                    )}
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
