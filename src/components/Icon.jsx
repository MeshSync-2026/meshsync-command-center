// Icon component backed by lucide-react
import {
  LayoutDashboard, TriangleAlert, Group, Users, User, RefreshCw,
  Satellite, BarChart3, ShieldCheck, ClipboardList, Settings, LogOut,
  Search, Bell, Plus, SquarePen, Trash2, X, Check, ChevronLeft,
  ChevronRight, ChevronDown, Menu, Map, Radio, Clock, Download,
  Printer, Filter, MapPin, Globe, Layers, Shield,
} from "lucide-react";

const ICON_MAP = {
  dashboard: LayoutDashboard,
  incidents: TriangleAlert,
  clusters: Group,
  squads: Users,
  responders: User,
  sync: RefreshCw,
  satellite: Satellite,
  analytics: BarChart3,
  access: ShieldCheck,
  audit: ClipboardList,
  profile: User,
  settings: Settings,
  logout: LogOut,
  search: Search,
  bell: Bell,
  plus: Plus,
  edit: SquarePen,
  trash: Trash2,
  close: X,
  check: Check,
  chevronLeft: ChevronLeft,
  chevronRight: ChevronRight,
  chevronDown: ChevronDown,
  menu: Menu,
  map: Map,
  alert: TriangleAlert,
  radio: Radio,
  users: Users,
  clock: Clock,
  download: Download,
  print: Printer,
  filter: Filter,
  refresh: RefreshCw,
  pin: MapPin,
  globe: Globe,
  layers: Layers,
  shield: Shield,
};

export default function Icon({ name, className = "w-5 h-5", strokeWidth = 1.8 }) {
  const Cmp = ICON_MAP[name];
  if (!Cmp) return null;
  return <Cmp className={className} strokeWidth={strokeWidth} />;
}
