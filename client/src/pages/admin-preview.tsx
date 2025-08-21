import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
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
  Mail
} from "lucide-react";

export default function AdminPreview() {
  // Sample data for preview
  const sampleStats = {
    todayBookings: 8,
    activeUsers: 24,
    pendingMessages: 3,
    totalRevenue: 12500
  };

  const sampleBookings = [
    {
      id: "1",
      patientName: "John Smith",
      phone: "612-555-0101",
      pickupDate: "2025-08-21",
      pickupTime: "09:00",
      pickupAddress: "1234 Maple Ave, Farmington, MN 55024",
      destination: "Mayo Clinic, 200 1st St SW, Rochester, MN",
      serviceType: "round_trip",
      status: "confirmed"
    },
    {
      id: "2", 
      patientName: "Mary Johnson",
      phone: "651-555-0202",
      pickupDate: "2025-08-21",
      pickupTime: "14:00",
      pickupAddress: "5678 Oak Street, Apple Valley, MN 55124",
      destination: "Fairview Southdale Hospital, Edina, MN",
      serviceType: "one_way",
      status: "pending"
    },
    {
      id: "3",
      patientName: "Robert Davis", 
      phone: "952-555-0303",
      pickupDate: "2025-08-22",
      pickupTime: "08:30",
      pickupAddress: "9012 Pine Road, Burnsville, MN 55337",
      destination: "University of Minnesota Medical Center",
      serviceType: "wait_and_return",
      status: "in_progress"
    }
  ];

  const sampleMessages = [
    {
      id: "1",
      subject: "Schedule Change Request",
      message: "Hi, I need to reschedule my appointment from Thursday to Friday. Can you please help?",
      isRead: false,
      createdAt: "2025-08-20T10:30:00Z"
    },
    {
      id: "2",
      subject: "Payment Question",
      message: "What payment methods do you accept? I prefer to pay with insurance if possible.",
      isRead: true,
      createdAt: "2025-08-20T09:15:00Z"
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-gray-100 text-gray-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Holly Transportation Admin Portal 
            <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded ml-2">PREVIEW</span>
          </h1>
          <p className="text-gray-600">Management Dashboard - Preview Mode</p>
        </div>

        {/* Quick Stats */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-primary/5">
            <CardContent className="p-6">
              <div className="text-2xl font-bold text-primary">
                {sampleStats.todayBookings}
              </div>
              <div className="text-sm text-gray-600">Today's Bookings</div>
            </CardContent>
          </Card>
          <Card className="bg-healthcare-green/5">
            <CardContent className="p-6">
              <div className="text-2xl font-bold text-healthcare-green">
                {sampleStats.activeUsers}
              </div>
              <div className="text-sm text-gray-600">Active Users</div>
            </CardContent>
          </Card>
          <Card className="bg-yellow-50">
            <CardContent className="p-6">
              <div className="text-2xl font-bold text-yellow-600">
                {sampleStats.pendingMessages}
              </div>
              <div className="text-sm text-gray-600">Pending Messages</div>
            </CardContent>
          </Card>
          <Card className="bg-slate-50">
            <CardContent className="p-6">
              <div className="text-2xl font-bold text-gray-600">
                ${(sampleStats.totalRevenue / 1000).toFixed(1)}k
              </div>
              <div className="text-sm text-gray-600">Monthly Revenue</div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="bookings" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="bookings">Manage Bookings</TabsTrigger>
            <TabsTrigger value="users">User Management</TabsTrigger>
            <TabsTrigger value="messages">Messages</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          {/* Bookings Management */}
          <TabsContent value="bookings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Calendar className="w-5 h-5 text-primary" />
                  <span>Recent Bookings</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Patient</TableHead>
                      <TableHead>Date & Time</TableHead>
                      <TableHead>Route</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sampleBookings.map((booking) => (
                      <TableRow key={booking.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{booking.patientName}</div>
                            <div className="text-sm text-gray-500">{booking.phone}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{booking.pickupDate}</div>
                            <div className="text-sm text-gray-500">{booking.pickupTime}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="max-w-xs">
                            <div className="text-sm font-medium truncate">{booking.pickupAddress}</div>
                            <div className="text-xs text-gray-500 truncate">→ {booking.destination}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {booking.serviceType.replace('_', ' ')}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(booking.status)}>
                            {booking.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            {booking.status === 'pending' && (
                              <Button size="sm" className="bg-green-600 hover:bg-green-700">
                                <CheckCircle className="w-4 h-4" />
                              </Button>
                            )}
                            {booking.status === 'confirmed' && (
                              <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                                <Clock className="w-4 h-4" />
                              </Button>
                            )}
                            <Button size="sm" variant="outline">
                              <Phone className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Messages Tab */}
          <TabsContent value="messages" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <MessageCircle className="w-5 h-5 text-primary" />
                  <span>Customer Messages</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {sampleMessages.map((message) => (
                    <div key={message.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-medium">{message.subject}</h3>
                        <div className="flex items-center space-x-2">
                          {!message.isRead && (
                            <Badge className="bg-red-100 text-red-800">Unread</Badge>
                          )}
                          <span className="text-xs text-gray-500">
                            {new Date(message.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <p className="text-gray-700 text-sm mb-3">{message.message}</p>
                      <div className="flex space-x-2">
                        <Button size="sm">Reply</Button>
                        <Button size="sm" variant="outline">Mark Resolved</Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Users className="w-5 h-5 text-primary" />
                  <span>User Management</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">User management features would include:</p>
                <ul className="list-disc list-inside mt-4 space-y-2 text-sm text-gray-600">
                  <li>View all registered customers</li>
                  <li>Manage customer profiles and preferences</li>
                  <li>Track booking history per customer</li>
                  <li>Handle customer account issues</li>
                </ul>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <DollarSign className="w-5 h-5 text-primary" />
                  <span>Analytics & Reports</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">Analytics dashboard would include:</p>
                <ul className="list-disc list-inside mt-4 space-y-2 text-sm text-gray-600">
                  <li>Monthly revenue trends and projections</li>
                  <li>Most popular routes and destinations</li>
                  <li>Customer satisfaction metrics</li>
                  <li>Driver performance and scheduling efficiency</li>
                  <li>Booking patterns and demand forecasting</li>
                </ul>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}