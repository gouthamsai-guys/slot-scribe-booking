
import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from '@/hooks/use-toast';
import { 
  Users, 
  Calendar, 
  Clock, 
  TrendingUp, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  LogOut,
  Filter
} from 'lucide-react';

interface Booking {
  id: string;
  userId: string;
  userName: string;
  game: string;
  date: string;
  time: string;
  status: 'pending' | 'confirmed' | 'canceled' | 'no-show';
  cost?: number;
  createdAt: string;
}

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    // Mock bookings data
    setBookings([
      {
        id: '1',
        userId: '2',
        userName: 'John Doe',
        game: 'Cricket',
        date: '2024-06-15',
        time: '10:00 AM',
        status: 'pending',
        createdAt: '2024-06-10'
      },
      {
        id: '2',
        userId: '3',
        userName: 'Jane Smith',
        game: 'Carrom',
        date: '2024-06-14',
        time: '2:00 PM',
        status: 'confirmed',
        cost: 300,
        createdAt: '2024-06-12'
      },
      {
        id: '3',
        userId: '2',
        userName: 'John Doe',
        game: 'Cricket',
        date: '2024-06-13',
        time: '6:00 PM',
        status: 'confirmed',
        cost: 500,
        createdAt: '2024-06-08'
      },
      {
        id: '4',
        userId: '4',
        userName: 'Mike Johnson',
        game: 'Badminton',
        date: '2024-06-12',
        time: '4:00 PM',
        status: 'pending',
        createdAt: '2024-06-11'
      }
    ]);
  }, []);

  const updateBookingStatus = (bookingId: string, newStatus: string, cost?: number) => {
    setBookings(prev => prev.map(booking => 
      booking.id === bookingId 
        ? { ...booking, status: newStatus as any, cost: cost || booking.cost }
        : booking
    ));
    
    toast({
      title: "Booking updated",
      description: `Booking has been ${newStatus}`,
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'canceled': return 'bg-red-100 text-red-800';
      case 'no-show': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredBookings = bookings.filter(booking => 
    statusFilter === 'all' || booking.status === statusFilter
  );

  const stats = {
    totalBookings: bookings.length,
    pendingBookings: bookings.filter(b => b.status === 'pending').length,
    confirmedBookings: bookings.filter(b => b.status === 'confirmed').length,
    totalRevenue: bookings
      .filter(b => b.status === 'confirmed' && b.cost)
      .reduce((sum, b) => sum + (b.cost || 0), 0)
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-green-600 rounded-lg"></div>
              <h1 className="text-xl font-bold text-gray-900">SportClub Admin</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">Welcome, {user?.name}</span>
              <Button variant="outline" size="sm" onClick={logout}>
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
          <p className="text-gray-600">Manage bookings, slots, and view analytics</p>
        </div>

        <Tabs defaultValue="bookings" className="space-y-6">
          <TabsList className="grid w-full lg:w-96 grid-cols-3">
            <TabsTrigger value="bookings">Bookings</TabsTrigger>
            <TabsTrigger value="slots">Slots</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          {/* Overview Stats */}
          <div className="grid md:grid-cols-4 gap-6">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-2xl font-bold">{stats.totalBookings}</div>
                    <p className="text-sm text-gray-600">Total Bookings</p>
                  </div>
                  <Calendar className="w-8 h-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-2xl font-bold text-yellow-600">{stats.pendingBookings}</div>
                    <p className="text-sm text-gray-600">Pending</p>
                  </div>
                  <Clock className="w-8 h-8 text-yellow-600" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-2xl font-bold text-green-600">{stats.confirmedBookings}</div>
                    <p className="text-sm text-gray-600">Confirmed</p>
                  </div>
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-2xl font-bold">₹{stats.totalRevenue}</div>
                    <p className="text-sm text-gray-600">Revenue</p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-green-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          <TabsContent value="bookings" className="space-y-6">
            {/* Filter */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center space-x-4">
                  <Filter className="w-5 h-5 text-gray-500" />
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="confirmed">Confirmed</SelectItem>
                      <SelectItem value="canceled">Canceled</SelectItem>
                      <SelectItem value="no-show">No Show</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Bookings Management */}
            <Card>
              <CardHeader>
                <CardTitle>Booking Requests</CardTitle>
                <CardDescription>Manage all booking requests and confirmations</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredBookings.map((booking) => (
                    <div key={booking.id} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-4">
                          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                            <Users className="w-5 h-5 text-blue-600" />
                          </div>
                          <div>
                            <h3 className="font-medium">{booking.userName}</h3>
                            <p className="text-sm text-gray-500">
                              {booking.game} - {booking.date} at {booking.time}
                            </p>
                            <p className="text-xs text-gray-400">
                              Requested on {booking.createdAt}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-4">
                          {booking.cost && (
                            <span className="text-sm font-medium">₹{booking.cost}</span>
                          )}
                          <Badge className={getStatusColor(booking.status)}>
                            {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                          </Badge>
                        </div>
                      </div>
                      
                      {booking.status === 'pending' && (
                        <div className="flex items-center space-x-2">
                          <Button
                            size="sm"
                            onClick={() => updateBookingStatus(booking.id, 'confirmed', 500)}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Confirm (₹500)
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => updateBookingStatus(booking.id, 'canceled')}
                          >
                            <XCircle className="w-4 h-4 mr-1" />
                            Reject
                          </Button>
                        </div>
                      )}
                      
                      {booking.status === 'confirmed' && (
                        <div className="flex items-center space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateBookingStatus(booking.id, 'no-show')}
                          >
                            <AlertCircle className="w-4 h-4 mr-1" />
                            Mark No-Show
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="slots" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Slot Management</CardTitle>
                <CardDescription>View and manage time slot availability</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">Slot management feature coming soon</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Analytics Dashboard</CardTitle>
                <CardDescription>View performance metrics and insights</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <TrendingUp className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">Analytics dashboard coming soon</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default AdminDashboard;
