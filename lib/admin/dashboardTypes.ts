/** Response shape for GET /api/admin/dashboard */
export type AdminDashboardPayload = {
  totalUsers: number;
  soldGameUnits: number;
  totalRevenue: number;
  totalTax: number;
  totalSubtotal: number;
  totalOrders: number;
  paidOrdersCount: number;
  pendingOrdersCount: number;
  averageOrderValue: number;
  popularGames: { gameId: string; title: string; unitsSold: number }[];
  salesChart: { date: string; revenue: number; units: number; orders: number }[];
  ordersStatusPie: { name: string; value: number }[];
  revenueLast7Days: number;
  revenuePrevious7Days: number;
};
