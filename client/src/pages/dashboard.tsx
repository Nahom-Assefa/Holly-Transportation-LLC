import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import type { Booking } from "@shared/schema";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import Navigation from "@/components/navigation";
import Footer from "@/components/footer";
import { 
  Calendar, 
  User, 
  MessageCircle, 
  ArrowLeft, 
  Clock,
  MapPin,
  Phone,
  Mail
} from "lucide-react";
import { Link } from "wouter";

/**
 * User Dashboard Component
 * 
 * @description Protected dashboard page for authenticated users to manage their profile,
 * view bookings, and communicate with Holly Transportation admin. Features accessibility
 * optimizations and comprehensive user account management.
 * 
 * @component
 * @returns {JSX.Element} Complete dashboard with profile, bookings, and messaging sections
 */
export default function Dashboard() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();
  const [profileForm, setProfileForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    medicalNotes: "",
  });

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

  useEffect(() => {
    if (user) {
      setProfileForm({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        email: user.email || "",
        phone: user.phone || "",
        medicalNotes: user.medicalNotes || "",
      });
    }
  }, [user]);

  // Fetch bookings
  const { data: bookings = [], isLoading: bookingsLoading } = useQuery<Booking[]>({
    queryKey: ["/api/bookings"],
    enabled: !!user,
  });

  // Messages functionality removed - now uses mailto protocol for direct email contact

  const getStatusColor = (status: string) => {
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

  const formatServiceType = (type: string) => {
    switch (type) {
      case 'one_way':
        return 'One-way';
      case 'round_trip':
        return 'Round-trip';
      case 'wait_and_return':
        return 'Wait and return';
      default:
        return type;
    }
  };

  const formatMobilityAssistance = (type: string) => {
    switch (type) {
      case 'independent':
        return 'Independent walking';
      case 'walker':
        return 'Walker assistance';
      case 'other':
        return 'Other';
      default:
        return type;
    }
  };

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
      
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-8">
          <Button variant="ghost" asChild className="mb-4" data-testid="back-button">
            <Link href="/">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Link>
          </Button>
          <h1 className="text-3xl font-bold text-gray-900" data-testid="dashboard-title">My Account</h1>
          <p className="text-gray-600 mt-2">Welcome back, {user.firstName || user.email}</p>
        </div>

        <Tabs defaultValue="bookings" className="space-y-6" data-testid="dashboard-tabs">
          <TabsList className={`grid w-full ${user.isAdmin ? 'grid-cols-2' : 'grid-cols-3'}`}>
            <TabsTrigger value="bookings" data-testid="tab-bookings">{user.isAdmin ? 'Recent Bookings' : 'My Bookings'}</TabsTrigger>
            <TabsTrigger value="profile" data-testid="tab-profile">Profile Settings</TabsTrigger>
            {!user.isAdmin && (
              <TabsTrigger value="messages" data-testid="tab-messages">Contact Support</TabsTrigger>
            )}
          </TabsList>

          {/* Bookings Tab */}
          <TabsContent value="bookings" className="space-y-6" data-testid="bookings-content">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="flex items-center space-x-2">
                    <Calendar className="w-5 h-5 text-primary" />
                    <span>{user.isAdmin ? 'Recent Bookings' : 'My Bookings'}</span>
                  </CardTitle>
                  {!user.isAdmin && (
                    <Button asChild data-testid="new-booking-button">
                      <Link href="/book">
                        <Calendar className="w-4 h-4 mr-2" />
                        New Booking
                      </Link>
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {bookingsLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                    <p className="mt-2 text-gray-600">Loading bookings...</p>
                  </div>
                ) : bookings && bookings.length > 0 ? (
                  <div className="space-y-4">
                    {bookings.map((booking: Booking) => (
                      <Card key={booking.id} className="p-6" data-testid={`booking-${booking.id}`}>
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <div className="font-semibold text-gray-900">{booking.patientName}</div>
                            <div className="text-sm text-gray-600 flex items-center">
                              <Clock className="w-4 h-4 mr-1" />
                              {booking.pickupDate} at {booking.pickupTime}
                            </div>
                            {booking.phone && (
                              <div className="text-sm text-gray-600 flex items-center mt-1">
                                <Phone className="w-4 h-4 mr-1" />
                                <a href={`tel:${booking.phone}`} className="hover:text-primary">{booking.phone}</a>
                              </div>
                            )}
                          </div>
                          <Badge className={getStatusColor(booking.status || 'pending')}>
                            {booking.status || 'pending'}
                          </Badge>
                        </div>
                        <div className="space-y-2 text-sm text-gray-600">
                          <div className="flex items-start">
                            <MapPin className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
                            <div>
                              <div><strong>From:</strong> {booking.pickupAddress}</div>
                              <div><strong>To:</strong> {booking.destination}</div>
                            </div>
                          </div>
                          <div><strong>Service:</strong> {formatServiceType(booking.serviceType)}</div>
                          <div><strong>Mobility:</strong> {formatMobilityAssistance(booking.mobilityAssistance)}</div>
                          {user.isAdmin && booking.createdAt && (
                            <div><strong>Booked:</strong> {new Date(booking.createdAt).toLocaleDateString('en-US', { 
                              weekday: 'short',
                              year: 'numeric', 
                              month: 'short', 
                              day: 'numeric'
                            })} at {new Date(booking.createdAt).toLocaleString('en-US', {
                              hour: 'numeric',
                              minute: '2-digit',
                              hour12: true,
                              timeZone: 'America/Chicago'
                            }).split(', ')[1]}</div>
                          )}
                          {booking.notes && <div><strong>Notes:</strong> {booking.notes}</div>}
                        </div>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 mb-4">No bookings found</p>
                    <Button asChild>
                      <Link href="/book">
                        <Calendar className="w-4 h-4 mr-2" />
                        Schedule your first ride
                      </Link>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-6" data-testid="profile-content">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <User className="w-5 h-5 text-healthcare-green" />
                  <span>Profile Information</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form className="space-y-4" data-testid="profile-form">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                      <Input
                        value={profileForm.firstName}
                        onChange={(e) => setProfileForm(prev => ({ ...prev, firstName: e.target.value }))}
                        data-testid="input-first-name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                      <Input
                        value={profileForm.lastName}
                        onChange={(e) => setProfileForm(prev => ({ ...prev, lastName: e.target.value }))}
                        data-testid="input-last-name"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                    <Input
                      type="email"
                      value={profileForm.email}
                      onChange={(e) => setProfileForm(prev => ({ ...prev, email: e.target.value }))}
                      data-testid="input-email"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                    <Input
                      type="tel"
                      value={profileForm.phone}
                      onChange={(e) => setProfileForm(prev => ({ ...prev, phone: e.target.value }))}
                      data-testid="input-phone"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Medical Notes & Accessibility Needs</label>
                    <Textarea
                      rows={3}
                      value={profileForm.medicalNotes}
                      onChange={(e) => setProfileForm(prev => ({ ...prev, medicalNotes: e.target.value }))}
                      placeholder="Any medical conditions, accessibility needs, or special requirements..."
                      data-testid="textarea-medical-notes"
                    />
                  </div>
                  <Button className="bg-primary text-white hover:bg-primary/90" data-testid="button-update-profile">
                    Update Profile
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Messages Tab - Now uses mailto protocol */}
          {!user.isAdmin && (
            <TabsContent value="messages" className="space-y-6" data-testid="messages-content">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="flex items-center space-x-2">
                    <MessageCircle className="w-5 h-5 text-blue-600" />
                    <span>Contact Support</span>
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <Mail className="w-16 h-16 text-healthcare-green mx-auto mb-6" />
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">Need Help or Have Questions?</h3>
                  <p className="text-lg text-gray-600 mb-8 max-w-md mx-auto">
                    Contact Holly Transportation directly via email or phone for personalized assistance with your transportation needs.
                  </p>
                  
                  <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto">
                    {/* Email Contact */}
                    <Card className="p-6 border-healthcare-green/20 hover:border-healthcare-green/40 transition-colors">
                      <CardContent className="p-0 text-center">
                        <Mail className="w-8 h-8 text-healthcare-green mx-auto mb-4" />
                        <h4 className="text-xl font-bold text-gray-900 mb-2">Send Email</h4>
                        <p className="text-gray-600 mb-4">Get a detailed response to your questions</p>
                        <Button
                          size="lg"
                          className="bg-healthcare-green text-white hover:bg-healthcare-green/90 w-full"
                          onClick={() => window.open('mailto:hollytransport04@gmail.com?subject=Transportation Inquiry from Dashboard', '_self')}
                          data-testid="email-support-button"
                        >
                          <Mail className="w-5 h-5 mr-2" />
                          Email Support
                        </Button>
                        <p className="text-sm text-gray-500 mt-2">hollytransport04@gmail.com</p>
                      </CardContent>
                    </Card>

                    {/* Phone Contact */}
                    <Card className="p-6 border-blue-200 hover:border-blue-300 transition-colors">
                      <CardContent className="p-0 text-center">
                        <Phone className="w-8 h-8 text-blue-600 mx-auto mb-4" />
                        <h4 className="text-xl font-bold text-gray-900 mb-2">Call Us</h4>
                        <p className="text-gray-600 mb-4">Speak directly with our team</p>
                        <Button
                          size="lg"
                          variant="outline"
                          className="border-blue-600 text-blue-600 hover:bg-blue-50 w-full"
                          onClick={() => window.open('tel:+16515006198', '_self')}
                          data-testid="call-support-button"
                        >
                          <Phone className="w-5 h-5 mr-2" />
                          Call (651) 500-6198
                        </Button>
                        <p className="text-sm text-gray-500 mt-2">Available 6AM - 6PM Daily</p>
                      </CardContent>
                    </Card>
                  </div>
                  
                  <div className="mt-8 p-4 bg-slate-50 rounded-lg max-w-2xl mx-auto">
                    <h4 className="font-semibold text-gray-900 mb-2">Common Topics We Can Help With:</h4>
                    <div className="text-sm text-gray-600 space-y-1">
                      <p>• Booking assistance and scheduling changes</p>
                      <p>• Insurance and billing questions</p>
                      <p>• Special accommodation requests</p>
                      <p>• Service area information</p>
                      <p>• General transportation inquiries</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          )}
        </Tabs>
      </div>

      <Footer />
    </div>
  );
}
