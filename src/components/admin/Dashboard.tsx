import { useState, useEffect } from 'react';
import { 
  DollarSign, 
  ShoppingCart, 
  Monitor, 
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Package,
  Users
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { DashboardStats, RevenueData, PopularItem, InventoryAlert } from '../../types/admin';
import { adminApi } from '../../services/adminApi';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

export const Dashboard = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [revenueData, setRevenueData] = useState<RevenueData[]>([]);
  const [popularItems, setPopularItems] = useState<PopularItem[]>([]);
  const [alerts, setAlerts] = useState<InventoryAlert[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const [statsRes, revenueRes, popularRes, alertsRes] = await Promise.all([
          adminApi.getDashboardStats(),
          adminApi.getRevenueData(),
          adminApi.getPopularItems(),
          adminApi.getInventoryAlerts()
        ]);

        if (statsRes.success) setStats(statsRes.data);
        if (revenueRes.success) setRevenueData(revenueRes.data);
        if (popularRes.success) setPopularItems(popularRes.data);
        if (alertsRes.success) setAlerts(alertsRes.data);
      } catch (error) {
        console.error('Error loading dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const statCards = [
    {
      title: 'Total Revenue',
      value: `$${stats?.totalRevenue.toFixed(2) || '0.00'}`,
      change: `+${stats?.revenueGrowth || 0}%`,
      icon: DollarSign,
      trend: 'up'
    },
    {
      title: 'Total Sales',
      value: stats?.totalSales.toLocaleString() || '0',
      change: `+${stats?.salesGrowth || 0}%`,
      icon: ShoppingCart,
      trend: 'up'
    },
    {
      title: 'Active Machines',
      value: `${stats?.activeMachines || 0}/${stats?.totalMachines || 0}`,
      change: `${Math.round(((stats?.activeMachines || 0) / (stats?.totalMachines || 1)) * 100)}%`,
      icon: Monitor,
      trend: 'neutral'
    },
    {
      title: 'Low Stock Alerts',
      value: stats?.lowStockAlerts.toString() || '0',
      change: 'Needs attention',
      icon: AlertTriangle,
      trend: 'down'
    }
  ];

  return (
    <div className="space-y-8">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="bg-white/10 backdrop-blur-xl border-white/20 text-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white/80 text-sm font-medium">{stat.title}</p>
                    <p className="text-3xl font-bold mt-2">{stat.value}</p>
                    <div className="flex items-center mt-2">
                      {stat.trend === 'up' && <TrendingUp size={16} className="text-green-400 mr-1" />}
                      {stat.trend === 'down' && <TrendingDown size={16} className="text-red-400 mr-1" />}
                      <span className={`text-sm ${
                        stat.trend === 'up' ? 'text-green-400' : 
                        stat.trend === 'down' ? 'text-red-400' : 'text-white/80'
                      }`}>
                        {stat.change}
                      </span>
                    </div>
                  </div>
                  <div className="bg-white/10 p-3 rounded-xl">
                    <Icon size={24} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Revenue Chart */}
        <Card className="bg-white/10 backdrop-blur-xl border-white/20 text-white">
          <CardHeader>
            <CardTitle className="text-xl font-bold">Revenue Trend (Last 7 Days)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis 
                  dataKey="date" 
                  stroke="rgba(255,255,255,0.8)"
                  fontSize={12}
                />
                <YAxis stroke="rgba(255,255,255,0.8)" fontSize={12} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(0,0,0,0.8)', 
                    border: '1px solid rgba(255,255,255,0.2)',
                    borderRadius: '8px'
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#10b981" 
                  strokeWidth={3}
                  dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Popular Items */}
        <Card className="bg-white/10 backdrop-blur-xl border-white/20 text-white">
          <CardHeader>
            <CardTitle className="text-xl font-bold">Popular Items</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {popularItems.map((item, index) => (
                <div key={item.itemId} className="flex items-center space-x-4 p-3 bg-white/5 rounded-xl">
                  <div className="flex-shrink-0">
                    <img
                      src={item.image}
                      alt={item.itemName}
                      className="w-12 h-12 object-cover rounded-lg"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold truncate">{item.itemName}</p>
                    <p className="text-sm text-white/80">{item.totalSales} sales</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-green-400">${item.revenue.toFixed(2)}</p>
                    <Badge className="bg-emerald-600 text-white text-xs">
                      #{index + 1}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Alerts */}
      {alerts.length > 0 && (
        <Card className="bg-white/10 backdrop-blur-xl border-white/20 text-white">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl font-bold">Recent Alerts</CardTitle>
              <Badge className="bg-red-500 text-white">
                {alerts.length} alerts
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {alerts.slice(0, 5).map((alert) => (
                <div key={alert.id} className="flex items-center justify-between p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
                  <div className="flex items-center space-x-3">
                    <AlertTriangle size={20} className="text-red-400" />
                    <div>
                      <p className="font-semibold">{alert.itemName} - {alert.machineName}</p>
                      <p className="text-sm text-white/80">
                        Stock: {alert.currentStock} (Threshold: {alert.threshold})
                      </p>
                    </div>
                  </div>
                  <Badge className={`${
                    alert.severity === 'critical' ? 'bg-red-600' :
                    alert.severity === 'low' ? 'bg-yellow-600' : 'bg-gray-600'
                  } text-white`}>
                    {alert.severity}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};