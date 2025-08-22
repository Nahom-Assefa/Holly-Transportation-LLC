import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Navigation from "@/components/navigation";
import Footer from "@/components/footer";
import { Calendar, MessageCircle, User, Settings, LogOut } from "lucide-react";
import { Link } from "wouter";

export default function Home() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();

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
            Welcome back, {user.firstName || user.email}!
          </h1>
          <p className="text-gray-600 mt-2">
            Manage your transportation needs with Holly Transportation
          </p>
        </div>

        {/* Quick Actions */}
        <div className={`grid md:grid-cols-2 ${user.isAdmin ? 'lg:grid-cols-2' : 'lg:grid-cols-4'} gap-6 mb-8`}>
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

          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardContent className="p-6">
              <Link href="/dashboard" className="block">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-healthcare-green/10 rounded-xl flex items-center justify-center">
                    <User className="w-6 h-6 text-healthcare-green" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{user.isAdmin ? 'Recent Bookings' : 'My Bookings'}</h3>
                    <p className="text-sm text-gray-600">{user.isAdmin ? 'Manage all rides' : 'View & manage rides'}</p>
                  </div>
                </div>
              </Link>
            </CardContent>
          </Card>

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
        </div>

        {/* Recent Activity */}
        <div className={`grid ${user.isAdmin ? 'lg:grid-cols-1' : 'lg:grid-cols-2'} gap-8`}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Calendar className="w-5 h-5 text-primary" />
                <span>Recent Bookings</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <p className="text-gray-500 mb-4">No recent bookings</p>
                <Button asChild>
                  <Link href="/book">
                    <Calendar className="w-4 h-4 mr-2" />
                    Book Your First Ride
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          {!user.isAdmin && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <MessageCircle className="w-5 h-5 text-healthcare-green" />
                  <span>Recent Messages</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <p className="text-gray-500 mb-4">No recent messages</p>
                  <Button 
                    variant="outline"
                    onClick={() => window.open('mailto:hollytransport04@gmail.com?subject=Transportation Inquiry', '_self')}
                  >
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Contact Support
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

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
