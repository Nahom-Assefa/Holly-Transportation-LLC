import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import type { InsertBooking } from "@shared/schema";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import Navigation from "@/components/navigation";
import Footer from "@/components/footer";
import { Calendar, Phone, ArrowLeft } from "lucide-react";
import { Link } from "wouter";

/**
 * Transportation Booking Component
 * 
 * @description Protected booking page for authenticated users to schedule ambulatory
 * transportation services. Features comprehensive form validation, accessibility design,
 * and real-time booking submission to Holly Transportation.
 * 
 * @component
 * @returns {JSX.Element} Complete booking form with service options and validation
 */
export default function Booking() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    patientName: "",
    phone: "",
    pickupDate: "",
    pickupTime: "",
    pickupAddress: "",
    destination: "",
    serviceType: "one_way",
    mobilityAssistance: "independent",
    notes: "",
    agreedToTerms: false,
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
    if (user && user.firstName && user.lastName) {
      setFormData(prev => ({
        ...prev,
        patientName: `${user.firstName} ${user.lastName}`,
        phone: user.phone || "",
      }));
    }
  }, [user]);

  const bookingMutation = useMutation({
    mutationFn: async (data: Omit<InsertBooking, 'userId'>) => {
      await apiRequest("POST", "/api/bookings", data);
    },
    onSuccess: () => {
      toast({
        title: "Booking Confirmed",
        description: "Your transportation has been scheduled successfully!",
      });
      setFormData({
        patientName: user ? `${user.firstName} ${user.lastName}` : "",
        phone: user?.phone || "",
        pickupDate: "",
        pickupTime: "",
        pickupAddress: "",
        destination: "",
        serviceType: "one_way",
        mobilityAssistance: "independent",
        notes: "",
        agreedToTerms: false,
      });
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
        title: "Booking Failed",
        description: "Failed to schedule booking. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!formData.agreedToTerms) {
      toast({
        title: "Terms Required",
        description: "Please agree to the terms of service to continue.",
        variant: "destructive",
      });
      return;
    }

    // Validate pickup time is within business hours (6am - 9pm)
    if (formData.pickupTime) {
      const [hours, minutes] = formData.pickupTime.split(':').map(Number);
      const timeIn24Hour = hours + minutes / 60;
      
      if (timeIn24Hour < 6 || timeIn24Hour > 21) {
        toast({
          title: "Invalid Pickup Time",
          description: "Please select a pickup time between 6:00 AM and 9:00 PM. Our service hours are 6AM to 9PM daily.",
          variant: "destructive",
        });
        return;
      }
    }

    bookingMutation.mutate({
      patientName: formData.patientName,
      phone: formData.phone,
      pickupDate: formData.pickupDate,
      pickupTime: formData.pickupTime,
      pickupAddress: formData.pickupAddress,
      destination: formData.destination,
      serviceType: formData.serviceType,
      mobilityAssistance: formData.mobilityAssistance,
      notes: formData.notes,
    });
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
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
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-8">
          <Button variant="ghost" asChild className="mb-4" data-testid="back-button">
            <Link href="/">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Link>
          </Button>
          <h1 className="text-3xl font-bold text-gray-900" data-testid="booking-title">Book Transportation</h1>
          <p className="text-gray-600 mt-2">
            Schedule your ambulatory transportation service with Holly Transportation
          </p>
        </div>

        {/* Phone Booking Option */}
        <Card className="mb-8 border-blue-200 bg-blue-50/50" data-testid="phone-booking-card">
          <CardHeader>
            <CardTitle className="flex items-center text-blue-700">
              <Phone className="w-5 h-5 mr-2" />
              Prefer to Book by Phone?
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-4 sm:space-y-0">
              <div>
                <p className="text-gray-700 mb-2">
                  Speak directly with our booking team for personalized service and immediate assistance.
                </p>
                <div className="space-y-1 text-sm text-gray-600">
                  <p>• Available 6AM to 6PM daily</p>
                  <p>• Immediate confirmation and scheduling</p>
                  <p>• Special requests and custom arrangements</p>
                </div>
              </div>
              <div className="flex-shrink-0">
                <Button 
                  size="lg"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3"
                  onClick={() => window.open('tel:+16513506846', '_self')}
                  data-testid="phone-booking-button"
                >
                  <Phone className="w-5 h-5 mr-2" />
                  Call 651-350-6846
                </Button>
                <p className="text-xs text-gray-500 text-center mt-1">Available 6AM to 6PM</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Divider */}
        <div className="flex items-center my-8">
          <div className="flex-1 border-t border-gray-300"></div>
          <div className="px-4 text-gray-500 text-sm font-medium">OR</div>
          <div className="flex-1 border-t border-gray-300"></div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Calendar className="w-5 h-5 text-primary" />
              <span>Transportation Details</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6" data-testid="booking-form">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Full Name *</label>
                  <Input
                    value={formData.patientName}
                    onChange={(e) => handleInputChange("patientName", e.target.value)}
                    placeholder="Enter your full name"
                    required
                    data-testid="input-patient-name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number *</label>
                  <Input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                    placeholder="(555) 123-4567"
                    required
                    data-testid="input-phone"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Pickup Date *</label>
                  <Input
                    type="date"
                    value={formData.pickupDate}
                    onChange={(e) => handleInputChange("pickupDate", e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    required
                    data-testid="input-pickup-date"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Pickup Time *</label>
                  <Input
                    type="time"
                    value={formData.pickupTime}
                    onChange={(e) => handleInputChange("pickupTime", e.target.value)}
                    required
                    data-testid="input-pickup-time"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Pickup Address *</label>
                <Input
                  value={formData.pickupAddress}
                  onChange={(e) => handleInputChange("pickupAddress", e.target.value)}
                  placeholder="123 Main St, City, State 12345"
                  required
                  data-testid="input-pickup-address"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Destination Address *</label>
                <Input
                  value={formData.destination}
                  onChange={(e) => handleInputChange("destination", e.target.value)}
                  placeholder="Medical facility or clinic address"
                  required
                  data-testid="input-destination"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Service Type</label>
                  <Select 
                    value={formData.serviceType} 
                    onValueChange={(value) => handleInputChange("serviceType", value)}
                    data-testid="select-service-type"
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="one_way">One-way</SelectItem>
                      <SelectItem value="round_trip">Round-trip</SelectItem>
                      <SelectItem value="wait_and_return">Wait and return</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Mobility Assistance</label>
                  <Select 
                    value={formData.mobilityAssistance} 
                    onValueChange={(value) => handleInputChange("mobilityAssistance", value)}
                    data-testid="select-mobility-assistance"
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="independent">Independent walking</SelectItem>
                      <SelectItem value="walker">Walker assistance</SelectItem>
                      <SelectItem value="other">Other (specify in notes)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Special Instructions or Medical Notes</label>
                <Textarea
                  value={formData.notes}
                  onChange={(e) => handleInputChange("notes", e.target.value)}
                  rows={3}
                  placeholder="Any special requirements, medical conditions, or additional information..."
                  data-testid="textarea-notes"
                />
              </div>

              <div className="bg-slate-50 p-4 rounded-lg">
                <div className="flex items-start space-x-3">
                  <Checkbox
                    checked={formData.agreedToTerms}
                    onCheckedChange={(checked) => handleInputChange("agreedToTerms", checked as boolean)}
                    data-testid="checkbox-terms"
                  />
                  <label className="text-sm text-gray-600">
                    I acknowledge that this is ambulatory transportation service for individuals who can walk independently or with minimal assistance. 
                    I agree to the <a href="#" className="text-primary hover:underline">terms of service</a> and 
                    <a href="#" className="text-primary hover:underline"> privacy policy</a>.
                  </label>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  type="submit"
                  className="flex-1 bg-primary text-white hover:bg-primary/90"
                  disabled={bookingMutation.isPending}
                  data-testid="button-book-transportation"
                >
                  <Calendar className="w-5 h-5 mr-2" />
                  {bookingMutation.isPending ? "Booking..." : "Book Transportation"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="border-primary text-primary hover:bg-primary/5"
                  data-testid="button-call-to-book"
                >
                  <Phone className="w-5 h-5 mr-2" />
                  Call to Book
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>

      <Footer />
    </div>
  );
}
