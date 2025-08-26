import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/hooks/useAuth";
import { AUTH_CONFIG } from "@/lib/authConfig";
import type { Booking } from "@shared/schema";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
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
  Mail,
  Trash2
} from "lucide-react";
import { COMPANY_INFO } from "@shared/constants";
import { Link } from "wouter";
import { handlePhoneClick } from "@/utils/telUtility";
import { useCustomAlert } from "@/utils/customAlert";
import { formatTime } from "@/utils/timeUtils";
import { formatServiceType, formatMobilityAssistance, formatStatus } from "@/utils/formatUtils";

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
  const customAlert = useCustomAlert();
  const queryClient = useQueryClient();
  const [profileForm, setProfileForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
  });
  
  // Pagination and selection state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selectedBookings, setSelectedBookings] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      customAlert("You are logged out. Logging in again...", "error");
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading]); // Removed customAlert dependency

  useEffect(() => {
    if (user) {
      setProfileForm({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        email: user.email || "",
        phone: user.phone || "",
      });
      // Also update local user state to keep them in sync
      setLocalUser(user);
    }
  }, [user?.id]);

  // Local state for immediate UI updates
  const [localUser, setLocalUser] = useState(user);
  
  // Function to refresh user data from the server
  const refreshUserData = useCallback(async () => {
    try {
      console.log("🔄 Fetching fresh user data from server...");
      const response = await apiRequest("GET", "/api/auth/user");
      const userData = await response.json();
      console.log("📥 Received user data from server:", userData);
      
      if (userData) {
        // Update the local user state with fresh data from server
        setLocalUser(userData);
        console.log("✅ Updated localUser state:", userData);
        
        // Also update the profile form with the fresh data
        setProfileForm({
          firstName: userData.firstName || "",
          lastName: userData.lastName || "",
          email: userData.email || "",
          phone: userData.phone || "",
        });
        console.log("✅ Updated profileForm state:", {
          firstName: userData.firstName || "",
          lastName: userData.lastName || "",
          email: userData.email || "",
          phone: userData.phone || "",
        });
      }
    } catch (error) {
      console.error("❌ Failed to refresh user data:", error);
    }
  }, []); // Empty dependency array - this function never needs to change



  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // In Firebase mode, prevent email changes for security
    if (AUTH_CONFIG.useFirebase && profileForm.email !== user?.email) {
      customAlert("Email cannot be changed in Firebase authentication mode for security reasons.", "warning");
      return;
    }
    
    try {
      console.log("🔄 Updating profile...");
      const response = await apiRequest("PUT", "/api/profile", profileForm);
      
      if (response.ok) {
        console.log("✅ Profile updated successfully");
        customAlert("Profile updated successfully!", "success");
        
        // Get fresh user data from server and update React Query cache directly
        console.log("🔄 Fetching fresh user data from server...");
        const freshUserResponse = await apiRequest("GET", "/api/auth/user");
        if (freshUserResponse.ok) {
          const freshUserData = await freshUserResponse.json();
          console.log("📥 Fresh user data:", freshUserData);
          
          // Update React Query cache with fresh data
          queryClient.setQueryData(["/api/auth/user", AUTH_CONFIG.useFirebase ? "firebase" : "local"], freshUserData);
          
          // Also refresh local user data for immediate UI updates
          await refreshUserData();
          console.log("✅ User data refreshed successfully");
        }
        
      } else {
        console.error("❌ Failed to update profile:", response.statusText);
        customAlert("Failed to update profile. Please try again.", "error");
      }
    } catch (error) {
      console.error("❌ Failed to update profile:", error);
      customAlert("Failed to update profile. Please try again.", "error");
    }
  };

  // Fetch bookings
  const { data: bookings = [], isLoading: bookingsLoading, refetch: refetchBookings } = useQuery<Booking[]>({
    queryKey: ["/api/bookings"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/bookings");
      return response.json();
    },
    enabled: !!user,
    staleTime: 2 * 60 * 1000, // 5 minutes - prevent excessive refetching
    refetchOnWindowFocus: false, // Prevent refetching when window gains focus
  });

  // Refresh data when component mounts or user changes
  useEffect(() => {
    if (user) {
      // Refresh user data if needed
      if (!localUser || localUser.id !== user.id) {
        refreshUserData();
      }
    }
  }, [user?.id, refreshUserData]); // refreshUserData is stable due to useCallback

  // Delete booking mutation
  const deleteBookingMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/bookings/${id}/user`);
    },
    onSuccess: () => {
      customAlert("Booking deleted successfully", "success");
      queryClient.invalidateQueries({ queryKey: ["/api/bookings"] });
      // Reset to first page if current page becomes empty
      if (bookings.length <= pageSize) {
        setCurrentPage(1);
      }
      // Clear selection
      setSelectedBookings(new Set());
    },
    onError: (error) => {
      console.error("Error deleting booking:", error);
      customAlert("Failed to delete booking. Please try again.", "error");
    },
  });

  // Messages functionality removed - now uses mailto protocol for direct email contact

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

  // Pagination and selection helpers
  const totalPages = Math.ceil(bookings.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedBookings = bookings.slice(startIndex, endIndex);

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedBookings(new Set(paginatedBookings.map(booking => booking.id)));
    } else {
      setSelectedBookings(new Set());
    }
  };

  const handleSelectBooking = (bookingId: string, checked: boolean) => {
    const newSelection = new Set(selectedBookings);
    if (checked) {
      newSelection.add(bookingId);
    } else {
      newSelection.delete(bookingId);
    }
    setSelectedBookings(newSelection);
  };

  const handleBulkDelete = () => {
    if (selectedBookings.size === 0) return;
    
    const count = selectedBookings.size;
    if (confirm(`Are you sure you want to delete ${count} booking${count > 1 ? 's' : ''}?`)) {
      selectedBookings.forEach(bookingId => {
        deleteBookingMutation.mutate(bookingId);
      });
    }
  };

  // Reset to first page when page size changes
  useEffect(() => {
    setCurrentPage(1);
  }, [pageSize]);

  // React Query handles this automatically - no manual refetching needed

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
          <p className="text-gray-600 mt-2">Welcome back, {localUser?.firstName || localUser?.email}</p>
        </div>

        <Tabs defaultValue={user.isAdmin ? "profile" : "bookings"} className="space-y-6" data-testid="dashboard-tabs">
          <TabsList className={`grid w-full ${user.isAdmin ? 'grid-cols-1' : 'grid-cols-3'}`}>
            {!user.isAdmin && (
              <TabsTrigger value="bookings" data-testid="tab-bookings">My Bookings</TabsTrigger>
            )}
            <TabsTrigger value="profile" data-testid="tab-profile">Profile Settings</TabsTrigger>
            {!user.isAdmin && (
              <TabsTrigger value="messages" data-testid="tab-messages">Contact Support</TabsTrigger>
            )}
          </TabsList>

          {/* Bookings Tab - Only for non-admin users */}
          {!user.isAdmin && (
            <TabsContent value="bookings" className="space-y-6" data-testid="bookings-content">
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle className="flex items-center space-x-2">
                      <Calendar className="w-5 h-5 text-primary" />
                      <span>My Bookings</span>
                    </CardTitle>
                    <div className="flex items-center space-x-3">
                      <select 
                        value={pageSize.toString()} 
                        onChange={(e) => setPageSize(parseInt(e.target.value))}
                        className="border border-gray-300 rounded-md px-3 py-2 text-sm"
                      >
                        <option value="5">5 per page</option>
                        <option value="10">10 per page</option>
                        <option value="20">20 per page</option>
                        <option value="50">50 per page</option>
                      </select>
                      <Button asChild data-testid="new-booking-button">
                        <Link href="/book">
                          <Calendar className="w-4 h-4 mr-2" />
                          New Booking
                        </Link>
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {bookingsLoading ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                      <p className="mt-2 text-gray-600">Loading bookings...</p>
                    </div>
                  ) : bookings && bookings.length > 0 ? (
                    <>
                      {/* Selection Controls */}
                      <div className="flex items-center justify-between mb-4 p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <Checkbox
                            checked={selectedBookings.size === paginatedBookings.length && paginatedBookings.length > 0}
                            onCheckedChange={handleSelectAll}
                            className="data-[state=checked]:bg-primary"
                          />
                          <span className="text-sm text-gray-600">
                            {selectedBookings.size} of {paginatedBookings.length} selected
                          </span>
                        </div>
                        {selectedBookings.size > 0 && (
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={handleBulkDelete}
                            className="bg-red-600 hover:bg-red-700"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete Selected ({selectedBookings.size})
                          </Button>
                        )}
                      </div>

                      <div className="space-y-4">
                        {paginatedBookings.map((booking: Booking) => (
                          <Card key={booking.id} className="p-6" data-testid={`booking-${booking.id}`}>
                            <div className="flex justify-between items-start mb-4">
                              <div className="flex items-start space-x-3">
                                <Checkbox
                                  checked={selectedBookings.has(booking.id)}
                                  onCheckedChange={(checked) => handleSelectBooking(booking.id, checked as boolean)}
                                  className="data-[state=checked]:bg-primary mt-1"
                                />
                                <div>
                                  <div className="font-semibold text-gray-900">{booking.patientName}</div>
                                  <div className="text-sm text-gray-600 flex items-center">
                                    <Clock className="w-4 h-4 mr-1" />
                                    {booking.pickupDate} at {formatTime(booking.pickupTime)}
                                  </div>
                                  {booking.phone && (
                                    <div className="text-sm text-gray-600 flex items-center mt-1">
                                      <Phone className="w-4 h-4 mr-1" />
                                      <a href={`tel:${booking.phone}`} className="hover:text-primary">{booking.phone}</a>
                                    </div>
                                  )}
                                </div>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Badge className={getStatusColor(booking.status || 'pending')}>
                                  {formatStatus(booking.status || 'pending')}
                                </Badge>
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  onClick={() => {
                                    if (confirm(`Are you sure you want to delete the booking for ${booking.patientName}?`)) {
                                      deleteBookingMutation.mutate(booking.id);
                                    }
                                  }}
                                  className="bg-red-600 hover:bg-red-700 text-white"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
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
                        
                        {/* Pagination Controls */}
                        {totalPages > 1 && (
                          <div className="flex items-center justify-between mt-6 pt-6 border-t border-gray-200">
                            <div className="text-sm text-gray-600">
                              Showing {startIndex + 1} to {Math.min(endIndex, bookings.length)} of {bookings.length} bookings
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
                    </>
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
          )}

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
                <form onSubmit={handleProfileSubmit} className="space-y-4" data-testid="profile-form">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                      <Input
                        value={profileForm.firstName}
                        onChange={(e) => setProfileForm(prev => ({ ...prev, firstName: e.target.value }))}
                        placeholder="Enter your first name"
                        className="placeholder:text-gray-400 border-gray-200 focus:border-primary focus:ring-1 focus:ring-primary/20"
                        data-testid="input-first-name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                      <Input
                        value={profileForm.lastName}
                        onChange={(e) => setProfileForm(prev => ({ ...prev, lastName: e.target.value }))}
                        placeholder="Enter your last name"
                        className="placeholder:text-gray-400 border-gray-200 focus:border-primary focus:ring-1 focus:ring-primary/20"
                        data-testid="input-last-name"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address
                      {AUTH_CONFIG.useFirebase && (
                        <span className="text-sm text-gray-500 ml-2">(Cannot be changed for security reasons)</span>
                      )}
                    </label>
                    <Input
                      type="email"
                      value={profileForm.email}
                      onChange={(e) => setProfileForm(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="Enter your email address"
                      disabled={AUTH_CONFIG.useFirebase}
                      className={`placeholder:text-gray-400 border-gray-200 focus:border-primary focus:ring-1 focus:ring-primary/20 ${
                        AUTH_CONFIG.useFirebase ? "bg-gray-100 cursor-not-allowed" : ""
                      }`}
                      data-testid="input-email"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                    <Input
                      type="tel"
                      value={profileForm.phone}
                      onChange={(e) => setProfileForm(prev => ({ ...prev, phone: e.target.value }))}
                      placeholder="Enter your phone number"
                      className="placeholder:text-gray-400 border-gray-200 focus:border-primary focus:ring-1 focus:ring-primary/20"
                      data-testid="input-phone"
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
                            onClick={() => window.open(`mailto:${COMPANY_INFO.EMAIL}?subject=Transportation Inquiry from Dashboard`, '_self')}
                            data-testid="email-support-button"
                          >
                            <Mail className="w-5 h-5 mr-2" />
                            Email Support
                          </Button>
                          <p className="text-sm text-gray-500 mt-2">{COMPANY_INFO.EMAIL}</p>
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
                            onClick={() => handlePhoneClick({ toast: customAlert })}
                            data-testid="call-support-button"
                          >
                            <Phone className="w-5 h-5 mr-2" />
                            Call {COMPANY_INFO.PHONE}
                          </Button>
                          <p className="text-sm text-gray-500 mt-2">Available {COMPANY_INFO.HOURS} Daily</p>
                        </CardContent>
                      </Card>
                    </div>
                    
                    <div className="mt-8 p-4 bg-slate-50 rounded-lg max-w-2xl mx-auto">
                      <h4 className="font-semibold text-gray-900 mb-2">Common Topics We Can Help With:</h4>
                      <div className="text-sm text-gray-600 space-y-1">
                        <p>• Booking assistance and scheduling changes</p>
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
