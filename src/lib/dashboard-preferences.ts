/**
 * Dashboard widget visibility preferences (stored per user in DB, synced to Zustand)
 */
export const DASHBOARD_WIDGET_IDS = [
  "show_total_deals",
  "show_total_value",
  "show_avg_deal_value",
  "show_deals_this_month",
  "show_weighted_forecast",
  "show_pipeline_health",
  "show_revenue_trend",
  "show_team_leaderboard",
] as const;

/** Widget id used in react-grid-layout (key) */
export const GRID_WIDGET_IDS = [
  "total_deals",
  "total_value",
  "avg_deal_value",
  "deals_this_month",
  "weighted_forecast",
  "pipeline_health",
  "revenue_trend",
  "team_leaderboard",
] as const;

export type GridWidgetId = (typeof GRID_WIDGET_IDS)[number];

/** Single item for react-grid-layout */
export interface DashboardLayoutItem {
  i: string;
  x: number;
  y: number;
  w: number;
  h: number;
  minW?: number;
  minH?: number;
}

export type DashboardLayout = DashboardLayoutItem[];

export interface DashboardPreferences {
  show_total_deals: boolean;
  show_total_value: boolean;
  show_avg_deal_value: boolean;
  show_deals_this_month: boolean;
  show_weighted_forecast: boolean;
  show_pipeline_health: boolean;
  show_revenue_trend: boolean;
  show_team_leaderboard: boolean;
}

export const DEFAULT_DASHBOARD_PREFERENCES: DashboardPreferences = {
  show_total_deals: true,
  show_total_value: true,
  show_avg_deal_value: true,
  show_deals_this_month: true,
  show_weighted_forecast: true,
  show_pipeline_health: true,
  show_revenue_trend: true,
  show_team_leaderboard: true,
};

export function parseDashboardPreferences(json: string | null): DashboardPreferences {
  if (!json) return { ...DEFAULT_DASHBOARD_PREFERENCES };
  try {
    const parsed = JSON.parse(json) as Partial<DashboardPreferences>;
    return { ...DEFAULT_DASHBOARD_PREFERENCES, ...parsed };
  } catch {
    return { ...DEFAULT_DASHBOARD_PREFERENCES };
  }
}

const GRID_ID_TO_PREF: Record<GridWidgetId, keyof DashboardPreferences> = {
  total_deals: "show_total_deals",
  total_value: "show_total_value",
  avg_deal_value: "show_avg_deal_value",
  deals_this_month: "show_deals_this_month",
  weighted_forecast: "show_weighted_forecast",
  pipeline_health: "show_pipeline_health",
  revenue_trend: "show_revenue_trend",
  team_leaderboard: "show_team_leaderboard",
};

/** Get visible grid widget ids from preferences */
export function getVisibleGridWidgetIds(prefs: DashboardPreferences): GridWidgetId[] {
  return (GRID_WIDGET_IDS as readonly GridWidgetId[]).filter(
    (id) => prefs[GRID_ID_TO_PREF[id]]
  );
}

/** Default layout for visible widgets: 12 cols, KPI row then forecast, then 2 charts, then leaderboard */
export function getDefaultDashboardLayout(visibleIds: GridWidgetId[]): DashboardLayout {
  const layout: DashboardLayout = [];
  const cols = 12;
  let y = 0;
  const kpiIds: GridWidgetId[] = ["total_deals", "total_value", "avg_deal_value", "deals_this_month"];
  const kpiVisible = kpiIds.filter((id) => visibleIds.includes(id));
  if (kpiVisible.length) {
    const w = Math.floor(cols / kpiVisible.length);
    kpiVisible.forEach((id, i) => {
      layout.push({ i: id, x: i * w, y: 0, w, h: 2, minW: 2, minH: 2 });
    });
    y = 2;
  }
  if (visibleIds.includes("weighted_forecast")) {
    layout.push({ i: "weighted_forecast", x: 0, y, w: 3, h: 2, minW: 2, minH: 2 });
    y += 2;
  }
  const chartIds: GridWidgetId[] = ["pipeline_health", "revenue_trend"];
  const chartsVisible = chartIds.filter((id) => visibleIds.includes(id));
  if (chartsVisible.length) {
    const w = Math.floor(cols / chartsVisible.length);
    chartsVisible.forEach((gridId, i) => {
      layout.push({ i: gridId, x: i * w, y, w, h: 6, minW: 4, minH: 4 });
    });
    y += 6;
  }
  if (visibleIds.includes("team_leaderboard")) {
    layout.push({ i: "team_leaderboard", x: 0, y, w: 12, h: 6, minW: 6, minH: 3 });
  }
  return layout;
}
