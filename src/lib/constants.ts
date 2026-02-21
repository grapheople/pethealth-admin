import {
  LayoutDashboard,
  UtensilsCrossed,
  Activity,
  MessageSquare,
  FlaskConical,
  Users,
  Dog,
  Coins,
  Gem,
  Mail,
  Megaphone,
} from "lucide-react";

export const PAGE_SIZE = 20;

export const NAV_ITEMS = [
  { href: "/", label: "대시보드", icon: LayoutDashboard },
  { href: "/users", label: "사용자", icon: Users },
  { href: "/pet-profiles", label: "반려동물", icon: Dog },
  { href: "/point-transactions", label: "포인트", icon: Coins },
  { href: "/gem-transactions", label: "젬", icon: Gem },
  { href: "/food-analyses", label: "사료 분석", icon: UtensilsCrossed },
  { href: "/stool-analyses", label: "배변 분석", icon: Activity },
  { href: "/community-posts", label: "커뮤니티", icon: MessageSquare },
  { href: "/user-mails", label: "우편함", icon: Mail },
  { href: "/notices", label: "공지사항", icon: Megaphone },
  { href: "/api-test", label: "엣지펑션 테스트", icon: FlaskConical },
] as const;
