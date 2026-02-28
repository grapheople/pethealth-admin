import {
  LayoutDashboard,
  MessageSquare,
  FlaskConical,
  Users,
  Dog,
  Coins,
  Gem,
  Mail,
  Megaphone,
  Scissors,
  Stethoscope,
  UtensilsCrossed,
  Footprints,
} from "lucide-react";

export const PAGE_SIZE = 20;

export const NAV_ITEMS = [
  { href: "/", label: "대시보드", icon: LayoutDashboard },
  { href: "/users", label: "사용자", icon: Users },
  { href: "/pet-profiles", label: "반려동물", icon: Dog },
  { href: "/point-transactions", label: "포인트", icon: Coins },
  { href: "/gem-transactions", label: "젬", icon: Gem },
  { href: "/food-records", label: "식단 기록", icon: UtensilsCrossed },
  { href: "/walk-records", label: "산책 기록", icon: Footprints },
  { href: "/grooming-records", label: "미용 기록", icon: Scissors },
  { href: "/checkup-records", label: "검진 기록", icon: Stethoscope },
  { href: "/community-posts", label: "커뮤니티", icon: MessageSquare },
  { href: "/user-mails", label: "우편함", icon: Mail },
  { href: "/notices", label: "공지사항", icon: Megaphone },
  { href: "/api-test", label: "엣지펑션 테스트", icon: FlaskConical },
] as const;
