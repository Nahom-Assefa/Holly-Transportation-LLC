import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Navigation from "@/components/navigation";
import Footer from "@/components/footer";
import { Calendar, MessageCircle, User, Settings, Activity } from "lucide-react";
import { Link } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { formatTime } from "@/utils/timeUtils";
import { formatStatus } from "@/utils/formatUtils";


export default function Home() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();
  const [localUser, setLocalUser] = useState(user);



  // Fetch recent bookings for non-admin users
  const { data: recentBookings = [], isLoading: bookingsLoading, refetch: refetchBookings } = useQuery<Array<{
    id: string;
    pickupAddress: string;
    destination: string;
    pickupDate: string;
    pickupTime: string;
    status: string;
    patientName?: string; // Added for deny functionality
  }>>({
    queryKey: ['/api/bookings'],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/bookings");
      return response.json();
    },
    enabled: !!user && !user.isAdmin,
  });

  // Get the 4 most recent bookings
  const topFourBookings = recentBookings.slice(0, 4);

  // Function to get status color for badges
  const getStatusColor = (status: string | null) => {
    if (!status) return 'bg-gray-100 text-gray-700';
    
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-700';
      case 'pending':
        return 'bg-yellow-100 text-yellow-700';
      case 'in_progress':
        return 'bg-blue-100 text-blue-700';
      case 'completed':
        return 'bg-gray-100 text-gray-700';
      case 'cancelled':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };



  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  // Refresh bookings when page becomes visible (user navigates back)
  useEffect(() => {
    if (user && !user.isAdmin) {
      refetchBookings();
    }
  }, [user, refetchBookings]);

  // Refresh bookings when page becomes visible (user navigates back)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && user && !user.isAdmin) {
        refetchBookings();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [user, refetchBookings]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Welcome Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900" data-testid="welcome-heading">
            Welcome back, {user?.firstName || user?.email}!
          </h1>
          <p className="text-gray-600 mt-2">
            Manage your transportation needs with Holly Transportation
          </p>
        </div>

        {/* Quick Actions */}
        <div className={`grid gap-6 mb-8 ${
          user.isAdmin 
            ? 'md:grid-cols-2 lg:grid-cols-2 justify-items-center' 
            : 'md:grid-cols-2 lg:grid-cols-4'
        }`}>
          {!user.isAdmin && (
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="p-6">
                <Link href="/book" className="block">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                      <Calendar className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Book Ride</h3>
                      <p className="text-sm text-gray-600">Schedule transportation</p>
                    </div>
                  </div>
                </Link>
              </CardContent>
            </Card>
          )}

          {!user.isAdmin && (
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="p-6">
                <Link href="/dashboard" className="block">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-healthcare-green/10 rounded-xl flex items-center justify-center">
                      <User className="w-6 h-6 text-healthcare-green" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{user.isAdmin ? 'Profile Settings' : 'My Bookings'}</h3>
                      <p className="text-sm text-gray-600">{user.isAdmin ? 'Manage account settings' : 'View & manage rides'}</p>
                    </div>
                  </div>
                </Link>
              </CardContent>
            </Card>
          )}

          {user.isAdmin && (
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="p-6">
                <Link href="/dashboard" className="block">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-healthcare-green/10 rounded-xl flex items-center justify-center">
                      <User className="w-6 h-6 text-healthcare-green" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Profile Settings</h3>
                      <p className="text-sm text-gray-600">Manage account settings</p>
                    </div>
                  </div>
                </Link>
              </CardContent>
            </Card>
          )}

          {user.isAdmin && (
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="p-6">
                <Link href="/admin/audit-logs" className="block">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                      <Activity className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">User Change Log</h3>
                      <p className="text-sm text-gray-600">Track user actions & changes</p>
                    </div>
                  </div>
                </Link>
              </CardContent>
            </Card>
          )}

          {!user.isAdmin && (
            <Card 
              className="hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => window.open('mailto:hollytransport04@gmail.com?subject=Transportation Inquiry from Dashboard', '_self')}
            >
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                    <MessageCircle className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Messages</h3>
                    <p className="text-sm text-gray-600">Contact support</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {!user.isAdmin && (
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="p-6">
                <Link href="/dashboard" className="block">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center">
                      <Settings className="w-6 h-6 text-gray-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Settings</h3>
                      <p className="text-sm text-gray-600">Account preferences</p>
                    </div>
                  </div>
                </Link>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Recent Bookings */}
        {!user.isAdmin && (
          <div className="flex justify-center">
            <Card className="w-full max-w-2xl">
              <CardHeader>
                <CardTitle className="flex items-center justify-center space-x-2">
                  <Calendar className="w-5 h-5 text-primary" />
                  <span>Recent Bookings</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {bookingsLoading ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500 mb-4">Loading recent bookings...</p>
                  </div>
                ) : recentBookings.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500 mb-4">No recent bookings</p>
                    <Button asChild>
                      <Link href="/book">
                        <Calendar className="w-4 h-4 mr-2" />
                        Book Your First Ride
                      </Link>
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {topFourBookings.map((booking) => (
                      <div key={booking.id} className="flex items-center justify-between p-4 bg-white rounded-lg shadow-sm">
                        <div>
                          <p className="font-semibold text-gray-900">{booking.pickupAddress} to {booking.destination}</p>
                          <p className="text-sm text-gray-600">Date: {booking.pickupDate}</p>
                          <p className="text-sm text-gray-600">Time: {formatTime(booking.pickupTime)}</p>
                        </div>
                        <Badge className={getStatusColor(booking.status)}>{formatStatus(booking.status)}</Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Admin Portal Access */}
        {user.isAdmin && (
          <Card className="mt-8 bg-gradient-to-r from-primary/5 to-healthcare-green/5">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Admin Portal</h3>
                  <p className="text-gray-600">Manage bookings, users, and system settings</p>
                </div>
                <Button asChild className="bg-primary text-white hover:bg-primary/90">
                  <Link href="/admin">
                    <Settings className="w-4 h-4 mr-2" />
                    Open Admin Portal
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      <Footer />
    </div>
  );
}
