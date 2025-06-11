
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Calendar, Users, User } from 'lucide-react';

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-green-600 rounded-lg"></div>
              <h1 className="text-2xl font-bold text-gray-900">SportClub</h1>
            </div>
            <Link to="/login">
              <Button>Login</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center">
          <h1 className="text-4xl sm:text-6xl font-bold text-gray-900 mb-6">
            Book Your
            <span className="bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent"> Sports </span>
            Session
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Easy online booking for cricket, carrom, and other sports. Join our community and play your favorite games.
          </p>
          <Link to="/login">
            <Button size="lg" className="bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700">
              Get Started
            </Button>
          </Link>
        </div>

        {/* Features */}
        <div className="mt-24 grid md:grid-cols-3 gap-8">
          <Card className="text-center p-6 hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
              <Calendar className="w-12 h-12 text-blue-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Easy Booking</h3>
              <p className="text-gray-600">Select your game, pick a time slot, and submit your booking request instantly.</p>
            </CardContent>
          </Card>

          <Card className="text-center p-6 hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
              <Users className="w-12 h-12 text-green-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Multiple Sports</h3>
              <p className="text-gray-600">Cricket, carrom, and more sports available. Find your favorite game.</p>
            </CardContent>
          </Card>

          <Card className="text-center p-6 hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
              <User className="w-12 h-12 text-blue-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Track Bookings</h3>
              <p className="text-gray-600">View your booking history and track the status of your requests.</p>
            </CardContent>
          </Card>
        </div>

        {/* Demo Credentials */}
        <div className="mt-16 bg-white rounded-lg shadow-lg p-8 max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-6">Demo Credentials</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-semibold text-blue-900 mb-2">Regular User</h3>
              <p className="text-sm text-blue-700">Email: user@sportclub.com</p>
              <p className="text-sm text-blue-700">Password: user123</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <h3 className="font-semibold text-green-900 mb-2">Admin User</h3>
              <p className="text-sm text-green-700">Email: admin@sportclub.com</p>
              <p className="text-sm text-green-700">Password: admin123</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
