import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Button } from "@/components/ui/button";
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
import type { Booking } from "@shared/schema";
import { formatTime } from "@/utils/timeUtils";
import { formatServiceType, formatStatus } from "@/utils/formatUtils";

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
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

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
  }, [user?.id, user?.isAdmin, isAuthenticated, isLoading, toast]);


  
  // Fetch admin stats
  const { data: stats, isLoading: statsLoading } = useQuery<{
    todayBookings: number;
    activeUsers: number;
  }>({
    queryKey: ['/api/admin/stats'],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/admin/stats");
      return response.json();
    },
    enabled: !!user?.isAdmin,
  });

  // Fetch all bookings
  const { data: bookings = [], isLoading: bookingsLoading } = useQuery<Booking[]>({
    queryKey: ['/api/bookings'],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/bookings");
      return response.json();
    },
    enabled: !!user?.isAdmin,
  });

  // Fetch all messages - DISABLED since using mailto: protocol
  // const { data: messages = [], isLoading: messagesLoading } = useQuery<Message[]>({
  //   queryKey: ['/api/messages'],
  //   enabled: !!user?.isAdmin,
  // });

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

  // Respond to message mutation - DISABLED since using mailto: protocol
  // const respondToMessageMutation = useMutation({
  //   mutationFn: async ({ id, response }: { id: string; response: string }) => {
  //     await apiRequest("PATCH", `/api/messages/${id}/response`, { response });
  //   },
  //   onSuccess: () => {
  //     toast({
  //       title: "Response Sent",
  //       description: "Your response has been sent successfully.",
  //     });
  //     queryClient.invalidateQueries({ queryKey: ["/api/messages"] });
  //   },
  //   onError: (error) => {
  //     if (isUnauthorizedError(error)) {
  //       toast({
  //         title: "Unauthorized",
  //         description: "You are logged out. Logging in again...",
  //         variant: "destructive",
  //       });
  //       setTimeout(() => {
  //         title: "Error",
  //         description: "Failed to send response.",
  //         variant: "destructive",
  //       });
  //     }
  //   },
  // });

  // Delete booking mutation
  const deleteBookingMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/bookings/${id}`);
    },
    onSuccess: () => {
      console.log("Delete successful, refreshing bookings...");
      
      toast({
        title: "Booking Deleted",
        description: "Booking has been deleted successfully.",
      });
      
      // Get fresh data immediately
      queryClient.refetchQueries({ queryKey: ["/api/bookings"] });
      queryClient.refetchQueries({ queryKey: ["/api/admin/stats"] });
      
      // Reset to first page if current page becomes empty
      if (bookings.length <= pageSize) {
        setCurrentPage(1);
      }
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
        description: "Failed to delete booking.",
        variant: "destructive",
      });
    },
  });

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




  const filteredBookings = bookings?.filter((booking: Booking) => 
    bookingStatusFilter === "all" || booking.status === bookingStatusFilter
  ) || [];

  // Pagination logic
  const totalPages = Math.ceil(filteredBookings.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedBookings = filteredBookings.slice(startIndex, endIndex);

  // Reset to first page when filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [bookingStatusFilter]);

  // Reset to first page when page size changes
  useEffect(() => {
    setCurrentPage(1);
  }, [pageSize]);

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

  if (!isAuthenticated || !user || !user.isAdmin) {
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
            Admin Portal
          </h1>
          <p className="text-gray-600 mt-2">
            Holly Transportation Management Dashboard
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <Card className="bg-primary/5">
            <CardContent className="p-6">
              <div className="text-2xl font-bold text-primary" data-testid="stat-today-bookings">
                {statsLoading ? "..." : stats?.todayBookings ?? 0}
              </div>
              <div className="text-sm text-gray-600">Today's Bookings</div>
            </CardContent>
          </Card>
          <Card className="bg-healthcare-green/5">
            <CardContent className="p-6">
              <div className="text-2xl font-bold text-healthcare-green" data-testid="stat-active-users">
                {statsLoading ? "..." : stats?.activeUsers ?? 0}
              </div>
              <div className="text-sm text-gray-600">Active Users</div>
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
                    <Select value={pageSize.toString()} onValueChange={(value) => setPageSize(parseInt(value))}>
                      <SelectTrigger className="w-24">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="5">5</SelectItem>
                        <SelectItem value="10">10</SelectItem>
                        <SelectItem value="20">20</SelectItem>
                        <SelectItem value="50">50</SelectItem>
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
                        {paginatedBookings.map((booking: Booking) => (
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
                                <div className="text-sm text-gray-500">{formatTime(booking.pickupTime)}</div>
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
                                {formatStatus(booking.status)}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex space-x-2">
                                {booking.status === 'pending' && (
                                  <>
                                    <Button
                                      size="sm"
                                      className="bg-healthcare-green text-white hover:bg-healthcare-green/90"
                                      onClick={() => updateBookingStatusMutation.mutate({ id: booking.id, status: 'confirmed' })}
                                      data-testid={`confirm-booking-${booking.id}`}
                                    >
                                      <CheckCircle className="w-3 h-3 mr-1" />
                                      Confirm
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="destructive"
                                      onClick={() => updateBookingStatusMutation.mutate({ id: booking.id, status: 'cancelled' })}
                                      data-testid={`deny-booking-${booking.id}`}
                                    >
                                      <XCircle className="w-3 h-3 mr-1" />
                                      Deny
                                    </Button>
                                  </>
                                )}
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  className="bg-red-600 hover:bg-red-700 text-white"
                                  onClick={() => {
                                    if (confirm(`Are you sure you want to deny the booking for ${booking.patientName}?`)) {
                                      deleteBookingMutation.mutate(booking.id);
                                    }
                                  }}
                                  data-testid={`delete-booking-${booking.id}`}
                                >
                                  <Trash2 className="w-4 h-4 mr-1" />
                                  Delete
                                </Button>
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
                    
                    {/* Pagination Controls */}
                    {filteredBookings.length > 0 && (
                      <div className="flex items-center justify-between mt-6">
                        <div className="text-sm text-gray-600">
                          Showing {startIndex + 1} to {Math.min(endIndex, filteredBookings.length)} of {filteredBookings.length} bookings
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                            disabled={currentPage === 1}
                          >
                            Previous
                          </Button>
                          <div className="flex items-center space-x-1">
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                              <Button
                                key={page}
                                variant={currentPage === page ? "default" : "outline"}
                                size="sm"
                                onClick={() => setCurrentPage(page)}
                                className="w-8 h-8 p-0"
                              >
                                {page}
                              </Button>
                            ))}
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                            disabled={currentPage === totalPages}
                          >
                            Next
                          </Button>
                        </div>
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

          {/* Messages - DISABLED since using mailto: protocol */}
          <TabsContent value="messages" className="space-y-6" data-testid="messages-content">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <MessageCircle className="w-5 h-5 text-blue-600" />
                  <span>Messages</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <MessageCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 mb-2">Message management features coming soon</p>
                  <p className="text-sm text-gray-400">
                    Currently using mailto: protocol for direct email communication
                  </p>
                </div>
              </CardContent>
            </Card>
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
