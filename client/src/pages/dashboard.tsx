import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
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

export default function Dashboard() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [messageForm, setMessageForm] = useState({
    subject: "",
    message: "",
  });
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
  const { data: bookings = [], isLoading: bookingsLoading } = useQuery<any[]>({
    queryKey: ["/api/bookings"],
    enabled: !!user,
  });

  // Fetch messages
  const { data: messages = [], isLoading: messagesLoading } = useQuery<any[]>({
    queryKey: ["/api/messages"],
    enabled: !!user,
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (data: any) => {
      await apiRequest("POST", "/api/messages", data);
    },
    onSuccess: () => {
      toast({
        title: "Message Sent",
        description: "Your message has been sent to the admin team.",
      });
      setMessageForm({ subject: "", message: "" });
      queryClient.invalidateQueries({ queryKey: ["/api/messages"] });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
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
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSendMessage = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    sendMessageMutation.mutate(messageForm);
  };

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
      case 'wheelchair':
        return 'Wheelchair assistance';
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
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="bookings" data-testid="tab-bookings">My Bookings</TabsTrigger>
            <TabsTrigger value="profile" data-testid="tab-profile">Profile Settings</TabsTrigger>
            <TabsTrigger value="messages" data-testid="tab-messages">Messages</TabsTrigger>
          </TabsList>

          {/* Bookings Tab */}
          <TabsContent value="bookings" className="space-y-6" data-testid="bookings-content">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="flex items-center space-x-2">
                    <Calendar className="w-5 h-5 text-primary" />
                    <span>My Bookings</span>
                  </CardTitle>
                  <Button asChild data-testid="new-booking-button">
                    <Link href="/book">
                      <Calendar className="w-4 h-4 mr-2" />
                      New Booking
                    </Link>
                  </Button>
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
                    {bookings.map((booking: any) => (
                      <Card key={booking.id} className="p-6" data-testid={`booking-${booking.id}`}>
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <div className="font-semibold text-gray-900">{booking.patientName}</div>
                            <div className="text-sm text-gray-600 flex items-center">
                              <Clock className="w-4 h-4 mr-1" />
                              {booking.pickupDate} at {booking.pickupTime}
                            </div>
                          </div>
                          <Badge className={getStatusColor(booking.status)}>
                            {booking.status}
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

          {/* Messages Tab */}
          <TabsContent value="messages" className="space-y-6" data-testid="messages-content">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="flex items-center space-x-2">
                    <MessageCircle className="w-5 h-5 text-blue-600" />
                    <span>Messages</span>
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                {/* Send New Message */}
                <Card className="mb-6 bg-healthcare-green/5">
                  <CardHeader>
                    <CardTitle className="text-lg">Send New Message</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleSendMessage} className="space-y-4" data-testid="message-form">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
                        <Input
                          value={messageForm.subject}
                          onChange={(e) => setMessageForm(prev => ({ ...prev, subject: e.target.value }))}
                          placeholder="Brief description of your inquiry"
                          required
                          data-testid="input-message-subject"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Message</label>
                        <Textarea
                          value={messageForm.message}
                          onChange={(e) => setMessageForm(prev => ({ ...prev, message: e.target.value }))}
                          rows={4}
                          placeholder="How can we help you?"
                          required
                          data-testid="textarea-message-content"
                        />
                      </div>
                      <Button
                        type="submit"
                        className="bg-healthcare-green text-white hover:bg-healthcare-green/90"
                        disabled={sendMessageMutation.isPending}
                        data-testid="button-send-message"
                      >
                        <MessageCircle className="w-4 h-4 mr-2" />
                        {sendMessageMutation.isPending ? "Sending..." : "Send Message"}
                      </Button>
                    </form>
                  </CardContent>
                </Card>

                {/* Message History */}
                {messagesLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                    <p className="mt-2 text-gray-600">Loading messages...</p>
                  </div>
                ) : messages && messages.length > 0 ? (
                  <div className="space-y-4">
                    {messages.map((message: any) => (
                      <Card key={message.id} className="p-6" data-testid={`message-${message.id}`}>
                        <div className="flex items-start space-x-4">
                          <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                            <MessageCircle className="w-5 h-5 text-primary" />
                          </div>
                          <div className="flex-1">
                            <div className="flex justify-between items-center mb-2">
                              <div className="font-medium text-gray-900">{message.subject}</div>
                              <div className="text-sm text-gray-500">
                                {new Date(message.createdAt).toLocaleDateString()}
                              </div>
                            </div>
                            <p className="text-gray-600 mb-3">{message.message}</p>
                            {message.response && (
                              <div className="bg-slate-50 p-4 rounded-lg">
                                <div className="text-sm font-medium text-gray-900 mb-2">
                                  Admin Response:
                                </div>
                                <p className="text-gray-600">{message.response}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <MessageCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No messages yet</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <Footer />
    </div>
  );
}
