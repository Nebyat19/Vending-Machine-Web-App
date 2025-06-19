import { useState, useEffect } from 'react';
import { 
  Package, 
  AlertTriangle, 
  RefreshCw, 
  Search,
  Filter,
  Download,
  Plus
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Label } from '../ui/label';
import { VendingMachine, InventoryAlert } from '../../types/admin';
import { VendingItem } from '../../types';
import { adminApi } from '../../services/adminApi';
import { toast } from 'sonner';

export const InventoryManagement = () => {
  const [machines, setMachines] = useState<VendingMachine[]>([]);
  const [items, setItems] = useState<VendingItem[]>([]);
  const [alerts, setAlerts] = useState<InventoryAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMachine, setSelectedMachine] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showRestockDialog, setShowRestockDialog] = useState(false);
  const [restockData, setRestockData] = useState({
    machineId: '',
    itemId: '',
    quantity: 0
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [machinesRes, itemsRes, alertsRes] = await Promise.all([
        adminApi.getMachines(),
        adminApi.getItems(),
        adminApi.getInventoryAlerts()
      ]);

      if (machinesRes.success) setMachines(machinesRes.data);
      if (itemsRes.success) setItems(itemsRes.data);
      if (alertsRes.success) setAlerts(alertsRes.data);
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Failed to load inventory data');
    } finally {
      setLoading(false);
    }
  };

  const handleRestock = async () => {
    try {
      const response = await adminApi.updateInventory(
        restockData.machineId,
        restockData.itemId,
        restockData.quantity
      );

      if (response.success) {
        await loadData(); // Reload data
        setShowRestockDialog(false);
        setRestockData({ machineId: '', itemId: '', quantity: 0 });
        toast.success('Inventory updated successfully');
      }
    } catch (error) {
      console.error('Error updating inventory:', error);
      toast.error('Failed to update inventory');
    }
  };

  const filteredMachines = machines.filter(machine => 
    selectedMachine === 'all' || machine.id === selectedMachine
  );

  const getStockStatus = (stock: number, capacity: number) => {
    const percentage = (stock / capacity) * 100;
    if (percentage === 0) return { status: 'out', color: 'bg-red-600', text: 'Out of Stock' };
    if (percentage <= 20) return { status: 'critical', color: 'bg-red-500', text: 'Critical' };
    if (percentage <= 40) return { status: 'low', color: 'bg-yellow-500', text: 'Low Stock' };
    return { status: 'good', color: 'bg-green-500', text: 'Good' };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-white">Inventory Management</h2>
          <p className="text-white/80 mt-1">Monitor and manage stock levels across all machines</p>
        </div>
        
        <div className="flex space-x-3">
          <Dialog open={showRestockDialog} onOpenChange={setShowRestockDialog}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white">
                <Plus size={20} className="mr-2" />
                Restock Item
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-slate-900 border-slate-700 text-white">
              <DialogHeader>
                <DialogTitle>Restock Inventory</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Machine</Label>
                  <Select value={restockData.machineId} onValueChange={(value) => 
                    setRestockData({...restockData, machineId: value})
                  }>
                    <SelectTrigger className="bg-slate-800 border-slate-600">
                      <SelectValue placeholder="Select machine" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-600">
                      {machines.map((machine) => (
                        <SelectItem key={machine.id} value={machine.id}>
                          {machine.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Item</Label>
                  <Select value={restockData.itemId} onValueChange={(value) => 
                    setRestockData({...restockData, itemId: value})
                  }>
                    <SelectTrigger className="bg-slate-800 border-slate-600">
                      <SelectValue placeholder="Select item" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-600">
                      {items.map((item) => (
                        <SelectItem key={item.id} value={item.id}>
                          {item.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>New Stock Quantity</Label>
                  <Input
                    type="number"
                    value={restockData.quantity}
                    onChange={(e) => setRestockData({...restockData, quantity: parseInt(e.target.value) || 0})}
                    placeholder="Enter quantity"
                    className="bg-slate-800 border-slate-600"
                  />
                </div>
                <div className="flex justify-end space-x-3">
                  <Button variant="outline" onClick={() => setShowRestockDialog(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleRestock} className="bg-emerald-600 hover:bg-emerald-700">
                    Update Stock
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
          
          <Button variant="outline" className="border-white/20 text-white hover:bg-white/10">
            <Download size={20} className="mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        <div className="flex-1 min-w-64">
          <div className="relative">
            <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60" />
            <Input
              placeholder="Search items..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/60"
            />
          </div>
        </div>
        <Select value={selectedMachine} onValueChange={setSelectedMachine}>
          <SelectTrigger className="w-64 bg-white/10 border-white/20 text-white">
            <SelectValue placeholder="All Machines" />
          </SelectTrigger>
          <SelectContent className="bg-slate-800 border-slate-600">
            <SelectItem value="all">All Machines</SelectItem>
            {machines.map((machine) => (
              <SelectItem key={machine.id} value={machine.id}>
                {machine.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Alerts Section */}
      {alerts.length > 0 && (
        <Card className="bg-red-500/10 border-red-500/20 text-white">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-red-400">
              <AlertTriangle size={24} />
              <span>Stock Alerts ({alerts.length})</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {alerts.map((alert) => (
                <div key={alert.id} className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold">{alert.itemName}</h4>
                    <Badge className={`${
                      alert.severity === 'critical' ? 'bg-red-600' :
                      alert.severity === 'low' ? 'bg-yellow-600' : 'bg-gray-600'
                    } text-white`}>
                      {alert.severity}
                    </Badge>
                  </div>
                  <p className="text-sm text-white/80 mb-2">{alert.machineName}</p>
                  <p className="text-sm">
                    Stock: <span className="font-bold text-red-400">{alert.currentStock}</span> / 
                    Threshold: {alert.threshold}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Inventory Grid */}
      <div className="space-y-6">
        {filteredMachines.map((machine) => (
          <Card key={machine.id} className="bg-white/10 backdrop-blur-xl border-white/20 text-white">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl">{machine.name}</CardTitle>
                  <p className="text-white/80">{machine.id}</p>
                </div>
                <Badge className={`${
                  machine.status === 'online' ? 'bg-green-500' :
                  machine.status === 'offline' ? 'bg-red-500' : 'bg-yellow-500'
                } text-white`}>
                  {machine.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              {machine.inventory.length === 0 ? (
                <div className="text-center py-8 text-white/60">
                  <Package size={48} className="mx-auto mb-4 opacity-50" />
                  <p>No inventory data available</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {machine.inventory.map((inventoryItem) => {
                    const item = items.find(i => i.id === inventoryItem.itemId);
                    if (!item) return null;

                    const stockStatus = getStockStatus(inventoryItem.stock, inventoryItem.capacity);

                    return (
                      <div key={inventoryItem.itemId} className="bg-white/5 rounded-lg p-4">
                        <div className="flex items-center space-x-3 mb-3">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-12 h-12 object-cover rounded-lg"
                          />
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold truncate">{item.name}</h4>
                            <p className="text-sm text-white/80">${item.price.toFixed(2)}</p>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm">Stock:</span>
                            <Badge className={`${stockStatus.color} text-white text-xs`}>
                              {stockStatus.text}
                            </Badge>
                          </div>
                          
                          <div className="flex items-center justify-between text-sm">
                            <span>Current:</span>
                            <span className="font-bold">{inventoryItem.stock}</span>
                          </div>
                          
                          <div className="flex items-center justify-between text-sm">
                            <span>Capacity:</span>
                            <span>{inventoryItem.capacity}</span>
                          </div>
                          
                          <div className="w-full bg-gray-700 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full ${stockStatus.color}`}
                              style={{
                                width: `${Math.min((inventoryItem.stock / inventoryItem.capacity) * 100, 100)}%`
                              }}
                            />
                          </div>
                          
                          <div className="flex items-center justify-between text-xs text-white/60">
                            <span>Sales: {inventoryItem.salesCount}</span>
                            <span>
                              Restocked: {new Date(inventoryItem.lastRestocked).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};