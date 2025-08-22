import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import Navigation from "@/components/navigation";
import Footer from "@/components/footer";
import { 
  Calendar, 
  Users, 
  MessageCircle, 
  ArrowLeft, 
  DollarSign,
  CheckCircle,
  XCircle,
  Clock,
  MapPin,
  Phone,
  Mail,
  Edit,
  Trash2
} from "lucide-react";
import { Link } from "wouter";
import type { Booking, Message, ContactMessage } from "@shared/schema";

/**
 * Admin Portal Component
 * 
 * @description Protected admin dashboard for managing Holly Transportation operations.
 * Features booking management, user administration, messaging system, and analytics.
 * Only accessible to users with admin privileges.
 * 
 * @component
 * @returns {JSX.Element} Complete admin portal with comprehensive management tools
 */
export default function Admin() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [bookingStatusFilter, setBookingStatusFilter] = useState("all");

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
    // Skip admin check for demo purposes when on /admin-demo route
    if (window.location.pathname === '/admin-demo') {
      return;
    }
    if (!isLoading && isAuthenticated && user && !user.isAdmin) {
      toast({
        title: "Access Denied",
        description: "Admin access required to view this page.",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/";
      }, 500);
      return;
    }
  }, [user, isAuthenticated, isLoading, toast]);

  // Determine if this is demo mode
  const isDemo = window.location.pathname === '/admin-demo';
  
  // Fetch admin stats
  const { data: stats = {}, isLoading: statsLoading } = useQuery<{
    todayBookings: number;
    activeUsers: number;
    pendingMessages: number;
    totalRevenue: number;
  }>({
    queryKey: isDemo ? ["/api/admin/demo-stats"] : ["/api/admin/stats"],
    enabled: isDemo || !!user?.isAdmin,
  });

  // Fetch all bookings
  const { data: bookings = [], isLoading: bookingsLoading } = useQuery<Booking[]>({
    queryKey: isDemo ? ["/api/admin/demo-bookings"] : ["/api/bookings"],
    enabled: isDemo || !!user?.isAdmin,
  });

  // Fetch all messages
  const { data: messages = [], isLoading: messagesLoading } = useQuery<Message[]>({
    queryKey: isDemo ? ["/api/admin/demo-messages"] : ["/api/messages"],
    enabled: isDemo || !!user?.isAdmin,
  });

  // Fetch contact messages - DISABLED
  // const { data: contactMessages = [], isLoading: contactMessagesLoading } = useQuery<ContactMessage[]>({
  //   queryKey: ["/api/admin/contact-messages"],
  //   enabled: !!user?.isAdmin,
  // });

  // Update booking status mutation
  const updateBookingStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      await apiRequest("PATCH", `/api/bookings/${id}/status`, { status });
    },
    onSuccess: () => {
      toast({
        title: "Booking Updated",
        description: "Booking status has been updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/bookings"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
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
        description: "Failed to update booking status.",
        variant: "destructive",
      });
    },
  });

  // Respond to message mutation
  const respondToMessageMutation = useMutation({
    mutationFn: async ({ id, response }: { id: string; response: string }) => {
      await apiRequest("PATCH", `/api/messages/${id}/response`, { response });
    },
    onSuccess: () => {
      toast({
        title: "Response Sent",
        description: "Your response has been sent successfully.",
      });
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
        description: "Failed to send response.",
        variant: "destructive",
      });
    },
  });

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

  const filteredBookings = bookings?.filter((booking: Booking) => 
    bookingStatusFilter === "all" || booking.status === bookingStatusFilter
  ) || [];

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

  // Allow demo access for /admin-demo route
  if (window.location.pathname !== '/admin-demo' && (!isAuthenticated || !user || !user.isAdmin)) {
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-8">
          <Button variant="ghost" asChild className="mb-4" data-testid="back-button">
            <Link href="/">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Link>
          </Button>
          <h1 className="text-3xl font-bold text-gray-900" data-testid="admin-title">
            Admin Portal {isDemo && <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded ml-2">DEMO</span>}
          </h1>
          <p className="text-gray-600 mt-2">
            Holly Transportation Management Dashboard
            {isDemo && " - Preview Mode"}
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-primary/5">
            <CardContent className="p-6">
              <div className="text-2xl font-bold text-primary" data-testid="stat-today-bookings">
                {statsLoading ? "..." : stats?.todayBookings || 0}
              </div>
              <div className="text-sm text-gray-600">Today's Bookings</div>
            </CardContent>
          </Card>
          <Card className="bg-healthcare-green/5">
            <CardContent className="p-6">
              <div className="text-2xl font-bold text-healthcare-green" data-testid="stat-active-users">
                {statsLoading ? "..." : stats?.activeUsers || 0}
              </div>
              <div className="text-sm text-gray-600">Active Users</div>
            </CardContent>
          </Card>
          <Card className="bg-yellow-50">
            <CardContent className="p-6">
              <div className="text-2xl font-bold text-yellow-600" data-testid="stat-pending-messages">
                {statsLoading ? "..." : stats?.pendingMessages || 0}
              </div>
              <div className="text-sm text-gray-600">Pending Messages</div>
            </CardContent>
          </Card>
          <Card className="bg-slate-50">
            <CardContent className="p-6">
              <div className="text-2xl font-bold text-gray-600" data-testid="stat-monthly-revenue">
                ${statsLoading ? "..." : ((stats?.totalRevenue || 0) / 1000).toFixed(1)}k
              </div>
              <div className="text-sm text-gray-600">Monthly Revenue</div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="bookings" className="space-y-6" data-testid="admin-tabs">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="bookings" data-testid="tab-bookings">Manage Bookings</TabsTrigger>
            <TabsTrigger value="users" data-testid="tab-users">User Management</TabsTrigger>
            <TabsTrigger value="messages" data-testid="tab-messages">Messages</TabsTrigger>
            <TabsTrigger value="analytics" data-testid="tab-analytics">Analytics</TabsTrigger>
          </TabsList>

          {/* Bookings Management */}
          <TabsContent value="bookings" className="space-y-6" data-testid="bookings-content">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="flex items-center space-x-2">
                    <Calendar className="w-5 h-5 text-primary" />
                    <span>Recent Bookings</span>
                  </CardTitle>
                  <div className="flex space-x-3">
                    <Select value={bookingStatusFilter} onValueChange={setBookingStatusFilter}>
                      <SelectTrigger className="w-40">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="confirmed">Confirmed</SelectItem>
                        <SelectItem value="in_progress">In Progress</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button variant="outline">Export</Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {bookingsLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                    <p className="mt-2 text-gray-600">Loading bookings...</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Patient</TableHead>
                          <TableHead>Date & Time</TableHead>
                          <TableHead>Route</TableHead>
                          <TableHead>Service</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredBookings.map((booking: Booking) => (
                          <TableRow key={booking.id} data-testid={`booking-row-${booking.id}`}>
                            <TableCell>
                              <div>
                                <div className="font-medium text-gray-900">{booking.patientName}</div>
                                <div className="text-sm text-gray-500">{booking.phone}</div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div>
                                <div className="text-sm text-gray-900">{booking.pickupDate}</div>
                                <div className="text-sm text-gray-500">{booking.pickupTime}</div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="text-sm text-gray-900">
                                <div className="truncate max-w-xs">{booking.pickupAddress}</div>
                                <div className="text-gray-500">→</div>
                                <div className="truncate max-w-xs">{booking.destination}</div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="text-sm text-gray-900">{formatServiceType(booking.serviceType)}</div>
                            </TableCell>
                            <TableCell>
                              <Badge className={getStatusColor(booking.status)}>
                                {booking.status}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex space-x-2">
                                {booking.status === 'pending' && (
                                  <Button
                                    size="sm"
                                    className="bg-healthcare-green text-white hover:bg-healthcare-green/90"
                                    onClick={() => updateBookingStatusMutation.mutate({ id: booking.id, status: 'confirmed' })}
                                    data-testid={`confirm-booking-${booking.id}`}
                                  >
                                    <CheckCircle className="w-3 h-3 mr-1" />
                                    Confirm
                                  </Button>
                                )}
                                {(booking.status === 'pending' || booking.status === 'confirmed') && (
                                  <Button
                                    size="sm"
                                    variant="destructive"
                                    onClick={() => updateBookingStatusMutation.mutate({ id: booking.id, status: 'cancelled' })}
                                    data-testid={`cancel-booking-${booking.id}`}
                                  >
                                    <XCircle className="w-3 h-3 mr-1" />
                                    Cancel
                                  </Button>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                    {filteredBookings.length === 0 && (
                      <div className="text-center py-8">
                        <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-500">No bookings found for the selected filter</p>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* User Management */}
          <TabsContent value="users" className="space-y-6" data-testid="users-content">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Users className="w-5 h-5 text-healthcare-green" />
                  <span>User Management</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">User management features coming soon</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Messages */}
          <TabsContent value="messages" className="space-y-6" data-testid="messages-content">
            <div className="grid lg:grid-cols-2 gap-6">
              {/* User Messages */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <MessageCircle className="w-5 h-5 text-blue-600" />
                    <span>User Messages</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {messagesLoading ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                      <p className="mt-2 text-gray-600">Loading messages...</p>
                    </div>
                  ) : messages && messages.length > 0 ? (
                    <div className="space-y-4 max-h-96 overflow-y-auto">
                      {messages.map((message: Message) => (
                        <Card key={message.id} className="p-4" data-testid={`user-message-${message.id}`}>
                          <div className="space-y-3">
                            <div className="flex justify-between items-start">
                              <div className="font-medium text-gray-900">{message.subject}</div>
                              <div className="text-sm text-gray-500">
                                {new Date(message.createdAt).toLocaleDateString()}
                              </div>
                            </div>
                            <p className="text-gray-600 text-sm">{message.message}</p>
                            {!message.response && (
                              <div className="space-y-2">
                                <Textarea
                                  placeholder="Write your response..."
                                  id={`response-${message.id}`}
                                  rows={3}
                                  data-testid={`response-textarea-${message.id}`}
                                />
                                <Button
                                  size="sm"
                                  className="bg-primary text-white hover:bg-primary/90"
                                  onClick={() => {
                                    const textarea = document.getElementById(`response-${message.id}`) as HTMLTextAreaElement;
                                    if (textarea?.value) {
                                      respondToMessageMutation.mutate({ id: message.id, response: textarea.value });
                                    }
                                  }}
                                  data-testid={`send-response-${message.id}`}
                                >
                                  Send Response
                                </Button>
                              </div>
                            )}
                            {message.response && (
                              <div className="bg-primary/5 p-3 rounded-lg">
                                <div className="text-sm font-medium text-gray-900 mb-1">Your Response:</div>
                                <p className="text-gray-600 text-sm">{message.response}</p>
                              </div>
                            )}
                          </div>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <MessageCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500">No user messages</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Contact Form Messages - DISABLED */}
              {/* <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Mail className="w-5 h-5 text-healthcare-green" />
                    <span>Contact Messages</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {contactMessagesLoading ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                      <p className="mt-2 text-gray-600">Loading contact messages...</p>
                    </div>
                  ) : contactMessages && contactMessages.length > 0 ? (
                    <div className="space-y-4 max-h-96 overflow-y-auto">
                      {contactMessages.map((message: ContactMessage) => (
                        <Card key={message.id} className="p-4" data-testid={`contact-message-${message.id}`}>
                          <div className="space-y-3">
                            <div className="flex justify-between items-start">
                              <div>
                                <div className="font-medium text-gray-900">
                                  {message.firstName} {message.lastName}
                                </div>
                                <div className="text-sm text-gray-500">{message.email}</div>
                              </div>
                              <div className="text-sm text-gray-500">
                                {new Date(message.createdAt).toLocaleDateString()}
                              </div>
                            </div>
                            <div className="text-sm font-medium text-gray-700">{message.subject}</div>
                            <p className="text-gray-600 text-sm">{message.message}</p>
                            {message.phone && (
                              <div className="text-sm text-gray-500">Phone: {message.phone}</div>
                            )}
                          </div>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Mail className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500">No contact messages</p>
                    </div>
                  )}
                </CardContent>
              </Card> */}
            </div>
          </TabsContent>

          {/* Analytics */}
          <TabsContent value="analytics" className="space-y-6" data-testid="analytics-content">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <DollarSign className="w-5 h-5 text-primary" />
                  <span>Analytics & Reports</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <DollarSign className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">Analytics dashboard coming soon</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <Footer />
    </div>
  );
}
