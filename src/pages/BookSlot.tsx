
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { Calendar as CalendarIcon, ArrowLeft, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface Game {
  id: string;
  name: string;
  description: string;
}

const timeSlots = [
  '09:00', '10:00', '11:00', '12:00',
  '13:00', '14:00', '15:00', '16:00',
  '17:00', '18:00', '19:00', '20:00'
];

const BookSlot = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [games, setGames] = useState<Game[]>([]);
  const [selectedGame, setSelectedGame] = useState('');
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [selectedTime, setSelectedTime] = useState('');
  const [bookedSlots, setBookedSlots] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchGames();
  }, []);

  useEffect(() => {
    if (selectedGame && selectedDate) {
      fetchBookedSlots();
    }
  }, [selectedGame, selectedDate]);

  const fetchGames = async () => {
    try {
      const { data, error } = await supabase
        .from('games')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (error) {
        console.error('Error fetching games:', error);
        return;
      }

      setGames(data || []);
    } catch (error) {
      console.error('Error fetching games:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchBookedSlots = async () => {
    if (!selectedGame || !selectedDate) return;

    try {
      const { data, error } = await supabase
        .from('bookings')
        .select('time_slot')
        .eq('game_id', selectedGame)
        .eq('booking_date', format(selectedDate, 'yyyy-MM-dd'))
        .in('status', ['pending', 'confirmed']);

      if (error) {
        console.error('Error fetching booked slots:', error);
        return;
      }

      setBookedSlots(data?.map(booking => booking.time_slot) || []);
    } catch (error) {
      console.error('Error fetching booked slots:', error);
    }
  };

  const handleSubmit = async () => {
    if (!selectedGame || !selectedDate || !selectedTime || !user) {
      toast({
        title: "Missing information",
        description: "Please select game, date, and time slot",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from('bookings')
        .insert([
          {
            user_id: user.id,
            game_id: selectedGame,
            booking_date: format(selectedDate, 'yyyy-MM-dd'),
            time_slot: selectedTime,
            status: 'pending'
          }
        ]);

      if (error) {
        console.error('Booking error:', error);
        toast({
          title: "Booking failed",
          description: "This slot might already be taken. Please try another time.",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Booking submitted!",
        description: "Your booking request has been sent for approval",
      });

      navigate('/dashboard');
    } catch (error) {
      console.error('Booking error:', error);
      toast({
        title: "Booking failed",
        description: "Please try again",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const isSlotAvailable = (time: string) => {
    return !bookedSlots.includes(time);
  };

  const selectedGameData = games.find(g => g.id === selectedGame);

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
                <h1 className="text-xl font-bold text-gray-900">Book Slot</h1>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={logout}>
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Book a Slot</h1>
          <p className="text-gray-600">Select your preferred game, date, and time</p>
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-500 mt-4">Loading games...</p>
          </div>
        ) : (
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Booking Form */}
            <div className="space-y-6">
              {/* Game Selection */}
              <Card>
                <CardHeader>
                  <CardTitle>Select Game</CardTitle>
                  <CardDescription>Choose the sport you want to play</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {games.map((game) => (
                      <div
                        key={game.id}
                        className={cn(
                          "p-4 border rounded-lg cursor-pointer transition-colors",
                          selectedGame === game.id
                            ? "border-blue-600 bg-blue-50"
                            : "border-gray-200 hover:border-gray-300"
                        )}
                        onClick={() => setSelectedGame(game.id)}
                      >
                        <div className="flex justify-between items-center">
                          <div>
                            <h3 className="font-medium">{game.name}</h3>
                            <p className="text-sm text-gray-500">{game.description}</p>
                          </div>
                          {selectedGame === game.id && (
                            <Badge className="bg-blue-600">Selected</Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Date Selection */}
              <Card>
                <CardHeader>
                  <CardTitle>Select Date</CardTitle>
                  <CardDescription>Pick your preferred date</CardDescription>
                </CardHeader>
                <CardContent>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !selectedDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {selectedDate ? format(selectedDate, "PPP") : "Pick a date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={selectedDate}
                        onSelect={setSelectedDate}
                        disabled={(date) => date < new Date()}
                        initialFocus
                        className="p-3"
                      />
                    </PopoverContent>
                  </Popover>
                </CardContent>
              </Card>

              {/* Time Selection */}
              <Card>
                <CardHeader>
                  <CardTitle>Select Time</CardTitle>
                  <CardDescription>Choose an available time slot</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-3">
                    {timeSlots.map((time) => {
                      const available = isSlotAvailable(time);
                      return (
                        <Button
                          key={time}
                          variant={selectedTime === time ? "default" : "outline"}
                          className={cn(
                            "text-sm",
                            !available && "opacity-50 cursor-not-allowed"
                          )}
                          disabled={!available}
                          onClick={() => available && setSelectedTime(time)}
                        >
                          {time}
                        </Button>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Booking Summary */}
            <Card className="lg:sticky lg:top-8 h-fit">
              <CardHeader>
                <CardTitle>Booking Summary</CardTitle>
                <CardDescription>Review your selection</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Game:</span>
                    <span className="font-medium">
                      {selectedGameData?.name || 'Not selected'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Date:</span>
                    <span className="font-medium">
                      {selectedDate ? format(selectedDate, "PPP") : 'Not selected'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Time:</span>
                    <span className="font-medium">{selectedTime || 'Not selected'}</span>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <div className="flex items-center space-x-2 text-sm text-gray-600 mb-4">
                    <Clock className="w-4 h-4" />
                    <span>Booking requires admin approval</span>
                  </div>
                  <Button
                    className="w-full"
                    onClick={handleSubmit}
                    disabled={!selectedGame || !selectedDate || !selectedTime || isSubmitting}
                  >
                    {isSubmitting ? 'Submitting...' : 'Submit Booking Request'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
};

export default BookSlot;
