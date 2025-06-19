import { useState, useEffect } from 'react';
import { 
  Plus, 
  Monitor, 
  MapPin, 
  Wifi, 
  WifiOff, 
  Settings, 
  Trash2,
  Edit,
  Power,
  Package,
  AlertCircle
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { VendingMachine } from '../../types/admin';
import { adminApi } from '../../services/adminApi';
import { toast } from 'sonner';

export const MachineManagement = () => {
  const [machines, setMachines] = useState<VendingMachine[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editingMachine, setEditingMachine] = useState<VendingMachine | null>(null);
  const [restarting, setRestarting] = useState<string | null>(null);

  const [newMachine, setNewMachine] = useState({
    name: '',
    address: '',
    city: '',
    status: 'offline' as const
  });

  useEffect(() => {
    loadMachines();
  }, []);

  const loadMachines = async () => {
    try {
      const response = await adminApi.getMachines();
      if (response.success) {
        setMachines(response.data);
      }
    } catch (error) {
      console.error('Error loading machines:', error);
      toast.error('Failed to load machines');
    } finally {
      setLoading(false);
    }
  };

  const handleAddMachine = async () => {
    try {
      const response = await adminApi.addMachine({
        name: newMachine.name,
        location: {
          address: newMachine.address,
          city: newMachine.city,
          state: '',
          zipCode: '',
          coordinates: { lat: 0, lng: 0 } // Would be geocoded in real app
        },
        status: newMachine.status,
        lastHeartbeat: new Date()
      });

      if (response.success) {
        setMachines([...machines, response.data]);
        setShowAddDialog(false);
        setNewMachine({
          name: '',
          address: '',
          city: '',
          status: 'offline'
        });
        toast.success('Machine added successfully');
      }
    } catch (error) {
      console.error('Error adding machine:', error);
      toast.error('Failed to add machine');
    }
  };

  const handleEditMachine = async () => {
    if (!editingMachine) return;

    try {
      const response = await adminApi.updateMachine(editingMachine.id, {
        name: editingMachine.name,
        location: editingMachine.location,
        status: editingMachine.status
      });

      if (response.success) {
        setMachines(machines.map(m => m.id === editingMachine.id ? response.data : m));
        setShowEditDialog(false);
        setEditingMachine(null);
        toast.success('Machine updated successfully');
      }
    } catch (error) {
      console.error('Error updating machine:', error);
      toast.error('Failed to update machine');
    }
  };

  const handleRestartMachine = async (machineId: string) => {
    setRestarting(machineId);
    try {
      const response = await adminApi.restartMachine(machineId);
      if (response.success) {
        await loadMachines(); // Reload to get updated status
        toast.success('Machine restarted successfully');
      } else {
        toast.error(response.message || 'Failed to restart machine');
      }
    } catch (error) {
      console.error('Error restarting machine:', error);
      toast.error('Failed to restart machine');
    } finally {
      setRestarting(null);
    }
  };

  const handleDeleteMachine = async (machineId: string) => {
    if (!confirm('Are you sure you want to delete this machine?')) return;

    try {
      const response = await adminApi.deleteMachine(machineId);
      if (response.success) {
        setMachines(machines.filter(m => m.id !== machineId));
        toast.success('Machine deleted successfully');
      }
    } catch (error) {
      console.error('Error deleting machine:', error);
      toast.error('Failed to delete machine');
    }
  };

  const getStatusColor = (status: VendingMachine['status']) => {
    switch (status) {
      case 'online': return 'bg-green-500';
      case 'offline': return 'bg-red-500';
      case 'maintenance': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusIcon = (status: VendingMachine['status']) => {
    switch (status) {
      case 'online': return <Wifi size={16} />;
      case 'offline': return <WifiOff size={16} />;
      case 'maintenance': return <Settings size={16} />;
      default: return <AlertCircle size={16} />;
    }
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
          <h2 className="text-3xl font-bold text-white">Vending Machines</h2>
          <p className="text-white/80 mt-1">Manage your vending machine fleet</p>
        </div>
        
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white">
              <Plus size={20} className="mr-2" />
              Add Machine
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-slate-900 border-slate-700 text-white">
            <DialogHeader>
              <DialogTitle>Add New Vending Machine</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Machine Name</Label>
                <Input
                  id="name"
                  value={newMachine.name}
                  onChange={(e) => setNewMachine({...newMachine, name: e.target.value})}
                  placeholder="e.g., Main Campus - Building A"
                  className="bg-slate-800 border-slate-600"
                />
              </div>
              <div>
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  value={newMachine.address}
                  onChange={(e) => setNewMachine({...newMachine, address: e.target.value})}
                  placeholder="123 University Ave"
                  className="bg-slate-800 border-slate-600"
                />
              </div>
              <div>
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  value={newMachine.city}
                  onChange={(e) => setNewMachine({...newMachine, city: e.target.value})}
                  placeholder="College Town"
                  className="bg-slate-800 border-slate-600"
                />
              </div>
              <div className="flex justify-end space-x-3">
                <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddMachine} className="bg-emerald-600 hover:bg-emerald-700">
                  Add Machine
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Machines Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {machines.map((machine) => (
          <Card key={machine.id} className="bg-white/10 backdrop-blur-xl border-white/20 text-white">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Monitor size={24} />
                  <div>
                    <CardTitle className="text-lg">{machine.name}</CardTitle>
                    <p className="text-sm text-white/80">{machine.id}</p>
                  </div>
                </div>
                <Badge className={`${getStatusColor(machine.status)} text-white flex items-center space-x-1`}>
                  {getStatusIcon(machine.status)}
                  <span className="capitalize">{machine.status}</span>
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Location */}
              <div className="flex items-start space-x-2">
                <MapPin size={16} className="text-white/60 mt-1" />
                <div className="text-sm">
                  <p>{machine.location.address}</p>
                  <p className="text-white/80">{machine.location.city}</p>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-4 pt-2 border-t border-white/20">
                <div>
                  <p className="text-xs text-white/60">Revenue</p>
                  <p className="font-bold text-green-400">${machine.totalRevenue.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-xs text-white/60">Sales</p>
                  <p className="font-bold">{machine.totalSales}</p>
                </div>
              </div>

              {/* Last Heartbeat */}
              <div className="text-xs text-white/60">
                Last seen: {new Date(machine.lastHeartbeat).toLocaleString()}
              </div>

              {/* Actions */}
              <div className="flex space-x-2 pt-2">
                <Button
                  size="sm"
                  onClick={() => handleRestartMachine(machine.id)}
                  disabled={restarting === machine.id}
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                >
                  {restarting === machine.id ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Power size={16} />
                  )}
                  <span className="ml-1">Restart</span>
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setEditingMachine(machine);
                    setShowEditDialog(true);
                  }}
                  className="border-white/20 text-white hover:bg-white/10"
                >
                  <Edit size={16} />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleDeleteMachine(machine.id)}
                  className="border-red-500/50 text-red-400 hover:bg-red-500/10"
                >
                  <Trash2 size={16} />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {machines.length === 0 && (
        <div className="text-center py-12">
          <Monitor size={64} className="mx-auto text-white/30 mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">No machines found</h3>
          <p className="text-white/60 mb-6">Add your first vending machine to get started</p>
          <Button 
            onClick={() => setShowAddDialog(true)}
            className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700"
          >
            <Plus size={20} className="mr-2" />
            Add Machine
          </Button>
        </div>
      )}

      {/* Edit Machine Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="bg-slate-900 border-slate-700 text-white">
          <DialogHeader>
            <DialogTitle>Edit Vending Machine</DialogTitle>
          </DialogHeader>
          {editingMachine && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="editName">Machine Name</Label>
                <Input
                  id="editName"
                  value={editingMachine.name}
                  onChange={(e) => setEditingMachine({
                    ...editingMachine, 
                    name: e.target.value
                  })}
                  className="bg-slate-800 border-slate-600"
                />
              </div>
              <div>
                <Label htmlFor="editAddress">Address</Label>
                <Input
                  id="editAddress"
                  value={editingMachine.location.address}
                  onChange={(e) => setEditingMachine({
                    ...editingMachine,
                    location: {
                      ...editingMachine.location,
                      address: e.target.value
                    }
                  })}
                  className="bg-slate-800 border-slate-600"
                />
              </div>
              <div>
                <Label htmlFor="editCity">City</Label>
                <Input
                  id="editCity"
                  value={editingMachine.location.city}
                  onChange={(e) => setEditingMachine({
                    ...editingMachine,
                    location: {
                      ...editingMachine.location,
                      city: e.target.value
                    }
                  })}
                  className="bg-slate-800 border-slate-600"
                />
              </div>
              <div>
                <Label htmlFor="editStatus">Status</Label>
                <Select 
                  value={editingMachine.status} 
                  onValueChange={(value: 'online' | 'offline' | 'maintenance') => 
                    setEditingMachine({
                      ...editingMachine,
                      status: value
                    })
                  }
                >
                  <SelectTrigger className="bg-slate-800 border-slate-600">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-600">
                    <SelectItem value="online">Online</SelectItem>
                    <SelectItem value="offline">Offline</SelectItem>
                    <SelectItem value="maintenance">Maintenance</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end space-x-3">
                <Button variant="outline" onClick={() => setShowEditDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={handleEditMachine} className="bg-emerald-600 hover:bg-emerald-700">
                  Update Machine
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};