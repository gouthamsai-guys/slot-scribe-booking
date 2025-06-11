import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from '@/hooks/use-toast';
import { LogOut, Plus, Users, Calendar, Clock, TrendingUp } from 'lucide-react';
import { format } from 'date-fns';

interface Booking {
  id: string;
  user_id: string;
  game_id: string;
  booking_date: string;
  time_slot: string;
  status: 'pending' | 'confirmed' | 'canceled' | 'no-show';
  cost?: number;
  notes?: string;
  created_at: string;
  profiles: { name: string; email: string };
  games: { name: string };
}

interface Game {
  id: string;
  name: string;
  description: string;
  is_active: boolean;
}

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [games, setGames] = useState<Game[]>([]);
  const [newGame, setNewGame] = useState({ name: '', description: '' });
  const [statusFilter, setStatusFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [isAddingGame, setIsAddingGame] = useState(false);

  useEffect(() => {
    fetchBookings();
    fetchGames();
  }, []);

  const fetchBookings = async () => {
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          profiles (name, email),
          games (name)
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching bookings:', error);
        return;
      }

      setBookings(data || []);
    } catch (error) {
      console.error('Error fetching bookings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchGames = async () => {
    try {
      const { data, error } = await supabase
        .from('games')
        .select('*')
        .order('name');

      if (error) {
        console.error('Error fetching games:', error);
        return;
      }

      setGames(data || []);
    } catch (error) {
      console.error('Error fetching games:', error);
    }
  };

  const updateBookingStatus = async (bookingId: string, status: string, cost?: number) => {
    try {
      const updateData: any = { status };
      if (cost !== undefined) {
        updateData.cost = cost;
      }

      const { error } = await supabase
        .from('bookings')
        .update(updateData)
        .eq('id', bookingId);

      if (error) {
        console.error('Error updating booking:', error);
        toast({
          title: "Update failed",
          description: "Failed to update booking status",
          variant: "destructive",
        });
        return;
      }

      await fetchBookings();
      toast({
        title: "Booking updated",
        description: `Status changed to ${status}`,
      });
    } catch (error) {
      console.error('Error updating booking:', error);
    }
  };

  const addGame = async () => {
    if (!newGame.name.trim()) {
      toast({
        title: "Invalid input",
        description: "Game name is required",
        variant: "destructive",
      });
      return;
    }

    setIsAddingGame(true);
    try {
      const { error } = await supabase
        .from('games')
        .insert([{
          name: newGame.name.trim(),
          description: newGame.description.trim() || null,
          is_active: true
        }]);

      if (error) {
        console.error('Error adding game:', error);
        toast({
          title: "Failed to add game",
          description: "Please try again",
          variant: "destructive",
        });
        return;
      }

      setNewGame({ name: '', description: '' });
      await fetchGames();
      toast({
        title: "Game added",
        description: "New game has been added successfully",
      });
    } catch (error) {
      console.error('Error adding game:', error);
    } finally {
      setIsAddingGame(false);
    }
  };

  const toggleGameStatus = async (gameId: string, isActive: boolean) => {
    try {
      const { error } = await supabase
        .from('games')
        .update({ is_active: !isActive })
        .eq('id', gameId);

      if (error) {
        console.error('Error toggling game status:', error);
        return;
      }

      await fetchGames();
      toast({
        title: "Game updated",
        description: `Game ${!isActive ? 'activated' : 'deactivated'}`,
      });
    } catch (error) {
      console.error('Error toggling game status:', error);
    }
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-500 mt-4">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

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
          <p className="text-gray-600">Manage bookings, games, and view analytics</p>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2">
                <Calendar className="w-5 h-5 text-blue-600" />
                <div>
                  <div className="text-2xl font-bold">{stats.totalBookings}</div>
                  <p className="text-sm text-gray-600">Total Bookings</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2">
                <Clock className="w-5 h-5 text-yellow-600" />
                <div>
                  <div className="text-2xl font-bold text-yellow-600">{stats.pendingBookings}</div>
                  <p className="text-sm text-gray-600">Pending Approval</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2">
                <Users className="w-5 h-5 text-green-600" />
                <div>
                  <div className="text-2xl font-bold text-green-600">{stats.confirmedBookings}</div>
                  <p className="text-sm text-gray-600">Confirmed</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2">
                <TrendingUp className="w-5 h-5 text-purple-600" />
                <div>
                  <div className="text-2xl font-bold text-purple-600">₹{stats.totalRevenue}</div>
                  <p className="text-sm text-gray-600">Total Revenue</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Bookings Management */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div>
                  <CardTitle>Booking Management</CardTitle>
                  <CardDescription>Review and manage all booking requests</CardDescription>
                </div>
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
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Game</TableHead>
                      <TableHead>Date & Time</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredBookings.map((booking) => (
                      <TableRow key={booking.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{booking.profiles.name}</p>
                            <p className="text-sm text-gray-500">{booking.profiles.email}</p>
                          </div>
                        </TableCell>
                        <TableCell>{booking.games.name}</TableCell>
                        <TableCell>
                          <div>
                            <p>{format(new Date(booking.booking_date), 'PPP')}</p>
                            <p className="text-sm text-gray-500">{booking.time_slot}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(booking.status)}>
                            {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            {booking.status === 'pending' && (
                              <>
                                <Dialog>
                                  <DialogTrigger asChild>
                                    <Button size="sm" variant="outline">Confirm</Button>
                                  </DialogTrigger>
                                  <DialogContent>
                                    <DialogHeader>
                                      <DialogTitle>Confirm Booking</DialogTitle>
                                      <DialogDescription>
                                        Set the cost and confirm this booking
                                      </DialogDescription>
                                    </DialogHeader>
                                    <div className="space-y-4">
                                      <div>
                                        <Label htmlFor="cost">Cost (₹)</Label>
                                        <Input
                                          id="cost"
                                          type="number"
                                          placeholder="Enter cost"
                                          onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                              const cost = (e.target as HTMLInputElement).value;
                                              updateBookingStatus(booking.id, 'confirmed', parseFloat(cost) || 0);
                                            }
                                          }}
                                        />
                                      </div>
                                      <Button
                                        onClick={() => {
                                          const costInput = document.getElementById('cost') as HTMLInputElement;
                                          const cost = parseFloat(costInput.value) || 0;
                                          updateBookingStatus(booking.id, 'confirmed', cost);
                                        }}
                                      >
                                        Confirm Booking
                                      </Button>
                                    </div>
                                  </DialogContent>
                                </Dialog>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => updateBookingStatus(booking.id, 'canceled')}
                                >
                                  Reject
                                </Button>
                              </>
                            )}
                            {booking.status === 'confirmed' && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => updateBookingStatus(booking.id, 'no-show')}
                              >
                                Mark No Show
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>

          {/* Games Management */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Games Management</CardTitle>
                <CardDescription>Add and manage available games</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Add New Game */}
                <div className="space-y-3 p-4 border rounded-lg">
                  <h4 className="font-medium flex items-center">
                    <Plus className="w-4 h-4 mr-2" />
                    Add New Game
                  </h4>
                  <div>
                    <Label htmlFor="game-name">Name</Label>
                    <Input
                      id="game-name"
                      placeholder="Game name"
                      value={newGame.name}
                      onChange={(e) => setNewGame({...newGame, name: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="game-description">Description</Label>
                    <Textarea
                      id="game-description"
                      placeholder="Game description"
                      value={newGame.description}
                      onChange={(e) => setNewGame({...newGame, description: e.target.value})}
                    />
                  </div>
                  <Button onClick={addGame} disabled={isAddingGame} className="w-full">
                    {isAddingGame ? 'Adding...' : 'Add Game'}
                  </Button>
                </div>

                {/* Existing Games */}
                <div className="space-y-3">
                  <h4 className="font-medium">Existing Games</h4>
                  {games.map((game) => (
                    <div key={game.id} className="flex items-center justify-between p-3 border rounded">
                      <div>
                        <p className="font-medium">{game.name}</p>
                        <p className="text-sm text-gray-500">{game.description}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant={game.is_active ? "default" : "secondary"}>
                          {game.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => toggleGameStatus(game.id, game.is_active)}
                        >
                          {game.is_active ? 'Deactivate' : 'Activate'}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
