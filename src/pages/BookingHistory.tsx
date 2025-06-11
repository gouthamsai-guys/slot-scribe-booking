
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Filter, Users } from 'lucide-react';

interface Booking {
  id: string;
  game: string;
  date: string;
  time: string;
  status: 'pending' | 'confirmed' | 'canceled' | 'no-show';
  cost?: number;
  createdAt: string;
}

const BookingHistory = () => {
  const { user, logout } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    // Mock bookings data
    setBookings([
      {
        id: '1',
        game: 'Cricket',
        date: '2024-06-15',
        time: '10:00 AM',
        status: 'confirmed',
        cost: 500,
        createdAt: '2024-06-10'
      },
      {
        id: '2',
        game: 'Carrom',
        date: '2024-06-14',
        time: '2:00 PM',
        status: 'pending',
        createdAt: '2024-06-12'
      },
      {
        id: '3',
        game: 'Cricket',
        date: '2024-06-13',
        time: '6:00 PM',
        status: 'confirmed',
        cost: 500,
        createdAt: '2024-06-08'
      },
      {
        id: '4',
        game: 'Badminton',
        date: '2024-06-12',
        time: '4:00 PM',
        status: 'canceled',
        createdAt: '2024-06-05'
      },
      {
        id: '5',
        game: 'Carrom',
        date: '2024-06-11',
        time: '1:00 PM',
        status: 'no-show',
        createdAt: '2024-06-06'
      }
    ]);
  }, []);

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

  const totalSpent = bookings
    .filter(booking => booking.status === 'confirmed' && booking.cost)
    .reduce((sum, booking) => sum + (booking.cost || 0), 0);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <Link to="/dashboard">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
              </Link>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-green-600 rounded-lg"></div>
                <h1 className="text-xl font-bold text-gray-900">Booking History</h1>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={logout}>
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Your Bookings</h1>
          <p className="text-gray-600">Track all your booking activities and expenses</p>
        </div>

        {/* Summary Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">{bookings.length}</div>
              <p className="text-sm text-gray-600">Total Bookings</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-green-600">
                {bookings.filter(b => b.status === 'confirmed').length}
              </div>
              <p className="text-sm text-gray-600">Confirmed</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-yellow-600">
                {bookings.filter(b => b.status === 'pending').length}
              </div>
              <p className="text-sm text-gray-600">Pending</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">₹{totalSpent}</div>
              <p className="text-sm text-gray-600">Total Spent</p>
            </CardContent>
          </Card>
        </div>

        {/* Filter */}
        <Card className="mb-6">
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

        {/* Bookings List */}
        <Card>
          <CardHeader>
            <CardTitle>All Bookings</CardTitle>
            <CardDescription>Your complete booking history</CardDescription>
          </CardHeader>
          <CardContent>
            {filteredBookings.length > 0 ? (
              <div className="space-y-4">
                {filteredBookings.map((booking) => (
                  <div key={booking.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Users className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-medium">{booking.game}</h3>
                        <p className="text-sm text-gray-500">
                          {booking.date} at {booking.time}
                        </p>
                        <p className="text-xs text-gray-400">
                          Booked on {booking.createdAt}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      {booking.cost && (
                        <div className="text-right">
                          <p className="text-sm font-medium">₹{booking.cost}</p>
                          <p className="text-xs text-gray-500">Cost</p>
                        </div>
                      )}
                      <Badge className={getStatusColor(booking.status)}>
                        {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No bookings found</p>
                <Link to="/book-slot">
                  <Button className="mt-4">Make a Booking</Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default BookingHistory;
