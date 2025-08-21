import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { 
  Ambulance, 
  Shield, 
  Clock, 
  Heart, 
  Accessibility, 
  Smartphone, 
  Phone, 
  Mail, 
  MapPin, 
  Star, 
  CheckCircle,
  Calendar,
  Users,
  DollarSign,
  Menu,
  X
} from "lucide-react";
import vehicleImage from "@assets/generated_images/Professional_NEMT_vehicle_corrected_34ea87bd.png";
import assistanceImage from "@assets/generated_images/Holly_Transportation_assistance_scene_e4b0d332.png";

export default function Landing() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { toast } = useToast();

  // Contact form mutation
  const contactMutation = useMutation({
    mutationFn: async (data: any) => {
      await apiRequest("POST", "/api/contact", data);
    },
    onSuccess: () => {
      toast({
        title: "Message Sent",
        description: "Thank you for contacting us. We'll get back to you soon!",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleContactSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const firstName = formData.get("firstName") as string;
    const lastName = formData.get("lastName") as string;
    const email = formData.get("email") as string;
    const phone = formData.get("phone") as string;
    const subject = formData.get("subject") as string;
    const message = formData.get("message") as string;
    
    // Create mailto URL
    const emailBody = `
Name: ${firstName} ${lastName}
Email: ${email}
Phone: ${phone || 'Not provided'}

Message:
${message}

---
Sent from Holly Transportation contact form
    `.trim();
    
    const mailtoUrl = `mailto:hollytransport04@gmail.com?subject=${encodeURIComponent(`Contact Form: ${subject}`)}&body=${encodeURIComponent(emailBody)}`;
    
    // Open default email client
    window.location.href = mailtoUrl;
    
    // Show success message
    toast({
      title: "Email Client Opened",
      description: "Your default email client has been opened with the message ready to send.",
    });
  };

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    element?.scrollIntoView({ behavior: 'smooth' });
    setMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b border-slate-200 sticky top-0 z-50" data-testid="navigation">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                <Ambulance className="text-white text-lg" />
              </div>
              <div>
                <h1 className="text-xl lg:text-3xl font-bold text-primary">Holly Transportation</h1>
                <p className="text-xs lg:text-sm text-gray-500">Professional Ambulatory Services</p>
              </div>
            </div>
            
            <div className="hidden md:flex items-center space-x-8">
              <button 
                onClick={() => scrollToSection('home')}
                className="text-gray-700 hover:text-primary font-medium transition-colors"
                data-testid="nav-home"
              >
                Home
              </button>
              <button 
                onClick={() => scrollToSection('about')}
                className="text-gray-700 hover:text-primary font-medium transition-colors"
                data-testid="nav-about"
              >
                About
              </button>
              <button 
                onClick={() => scrollToSection('services')}
                className="text-gray-700 hover:text-primary font-medium transition-colors"
                data-testid="nav-services"
              >
                Services
              </button>
              <button 
                onClick={() => scrollToSection('payment')}
                className="text-gray-700 hover:text-primary font-medium transition-colors"
                data-testid="nav-payment"
              >
                Payment
              </button>
              <button 
                onClick={() => scrollToSection('contact')}
                className="text-gray-700 hover:text-primary font-medium transition-colors"
                data-testid="nav-contact"
              >
                Contact
              </button>
              <button 
                onClick={() => scrollToSection('book')}
                className="bg-primary text-white px-4 py-2 rounded-lg font-medium hover:bg-primary/90 transition-colors"
                data-testid="nav-book"
              >
                Book Now
              </button>
            </div>
            
            <div className="flex items-center space-x-4">
              <Button 
                variant="ghost" 
                onClick={() => window.location.href = '/api/login'}
                data-testid="login-button"
              >
                Login
              </Button>
              <Button 
                className="bg-healthcare-green text-white hover:bg-healthcare-green/90"
                onClick={() => window.location.href = '/api/login'}
                data-testid="signup-button"
              >
                Sign Up
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                className="md:hidden"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                data-testid="mobile-menu-toggle"
              >
                {mobileMenuOpen ? <X /> : <Menu />}
              </Button>
            </div>
          </div>
        </div>
        
        {/* Mobile Navigation Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-slate-200" data-testid="mobile-menu">
            <div className="px-4 py-4 space-y-3">
              <button 
                onClick={() => scrollToSection('home')}
                className="block w-full text-left text-gray-700 hover:text-primary font-medium"
              >
                Home
              </button>
              <button 
                onClick={() => scrollToSection('about')}
                className="block w-full text-left text-gray-700 hover:text-primary font-medium"
              >
                About
              </button>
              <button 
                onClick={() => scrollToSection('services')}
                className="block w-full text-left text-gray-700 hover:text-primary font-medium"
              >
                Services
              </button>
              <button 
                onClick={() => scrollToSection('payment')}
                className="block w-full text-left text-gray-700 hover:text-primary font-medium"
              >
                Payment
              </button>
              <button 
                onClick={() => scrollToSection('contact')}
                className="block w-full text-left text-gray-700 hover:text-primary font-medium"
              >
                Contact
              </button>
              <button 
                onClick={() => scrollToSection('book')}
                className="block w-full bg-primary text-white px-4 py-2 rounded-lg font-medium text-center"
              >
                Book Now
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section id="home" className="relative bg-gradient-to-br from-primary/5 to-healthcare-green/5 py-20" data-testid="hero-section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <Badge variant="secondary" className="bg-healthcare-green/10 text-healthcare-green border-healthcare-green/20">
                  <Shield className="w-4 h-4 mr-2" />
                  Trusted Healthcare Transportation
                </Badge>
                <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 leading-tight">
                  Safe & Reliable<br />
                  <span className="text-primary">Ambulatory Services</span>
                </h1>
                <p className="text-xl text-gray-600 leading-relaxed">
                  Professional medical transportation for individuals who can walk independently or with minimal assistance. 
                  Get to your medical appointments safely and on time with Holly Transportation.
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  size="lg" 
                  className="bg-primary text-white hover:bg-primary/90 text-xl font-bold py-6 px-8"
                  onClick={() => scrollToSection('book')}
                  data-testid="hero-book-button"
                >
                  <Calendar className="w-6 h-6 mr-3" />
                  Book Transportation
                </Button>
                <Button 
                  variant="outline" 
                  size="lg"
                  className="border-primary text-primary hover:bg-primary/5 text-xl font-bold py-6 px-8"
                  onClick={() => window.open('tel:+16515006198', '_self')}
                  data-testid="hero-call-button"
                >
                  <Phone className="w-6 h-6 mr-3" />
                  Call (651) 500-6198
                </Button>
              </div>
              
              <div className="grid grid-cols-3 gap-6 pt-8">
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary">100+</div>
                  <div className="text-sm text-gray-600">Satisfied Patients</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-healthcare-green">6AM to 6PM</div>
                  <div className="text-sm text-gray-600">Daily Hours</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary">5★</div>
                  <div className="text-sm text-gray-600">Average Rating</div>
                </div>
              </div>
            </div>
            
            <div className="relative">
              <div className="aspect-video bg-gradient-to-br from-primary/10 to-healthcare-green/10 rounded-2xl shadow-2xl overflow-hidden">
                <img 
                  src={vehicleImage} 
                  alt="Professional NEMT transport vehicle by Holly Transportation"
                  className="w-full h-full object-cover"
                  data-testid="hero-vehicle-image"
                />
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white" data-testid="features-section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">Why Choose Holly Transportation?</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Serving the Twin Cities area with professional ambulatory transportation services, 
              specializing in Dakota, Scott, Washington, and Ramsey counties.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="p-8 hover:shadow-lg transition-shadow">
              <CardContent className="p-0">
                <div className="w-16 h-16 bg-primary/10 rounded-xl flex items-center justify-center mb-6">
                  <Shield className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-4">Licensed & Insured</h3>
                <p className="text-gray-600">
                  Fully licensed transportation service with comprehensive insurance coverage for your peace of mind.
                </p>
              </CardContent>
            </Card>
            
            <Card className="p-8 hover:shadow-lg transition-shadow">
              <CardContent className="p-0">
                <div className="w-16 h-16 bg-healthcare-green/10 rounded-xl flex items-center justify-center mb-6">
                  <Clock className="w-8 h-8 text-healthcare-green" />
                </div>
                <h3 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-4">Punctual Service</h3>
                <p className="text-gray-600">
                  On-time arrivals guaranteed. We understand the importance of keeping your medical appointments.
                </p>
              </CardContent>
            </Card>
            
            <Card className="p-8 hover:shadow-lg transition-shadow">
              <CardContent className="p-0">
                <div className="w-16 h-16 bg-primary/10 rounded-xl flex items-center justify-center mb-6">
                  <Heart className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-4">Compassionate Care</h3>
                <p className="text-gray-600">
                  Our trained staff provides respectful, patient-centered service with attention to individual needs.
                </p>
              </CardContent>
            </Card>
            
            <Card className="p-8 hover:shadow-lg transition-shadow">
              <CardContent className="p-0">
                <div className="w-16 h-16 bg-healthcare-green/10 rounded-xl flex items-center justify-center mb-6">
                  <Users className="w-8 h-8 text-healthcare-green" />
                </div>
                <h3 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-4">Walking Assistance</h3>
                <p className="text-gray-600">
                  Professional support for ambulatory patients who can walk independently or with minimal assistance to medical appointments.
                </p>
              </CardContent>
            </Card>
            
            <Card className="p-8 hover:shadow-lg transition-shadow">
              <CardContent className="p-0">
                <div className="w-16 h-16 bg-primary/10 rounded-xl flex items-center justify-center mb-6">
                  <Smartphone className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-4">Easy Booking</h3>
                <p className="text-gray-600">
                  Simple online booking system with real-time scheduling and automatic confirmation notifications.
                </p>
              </CardContent>
            </Card>
            
            <Card className="p-8 hover:shadow-lg transition-shadow">
              <CardContent className="p-0">
                <div className="w-16 h-16 bg-healthcare-green/10 rounded-xl flex items-center justify-center mb-6">
                  <Phone className="w-8 h-8 text-healthcare-green" />
                </div>
                <h3 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-4">24/7 Support</h3>
                <p className="text-gray-600">
                  Round-the-clock customer support for booking assistance, changes, and emergency transportation needs.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20 bg-gradient-to-br from-slate-50 to-primary/5" data-testid="about-section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <h2 className="text-3xl lg:text-4xl font-bold text-gray-900">About Holly Transportation</h2>
                <p className="text-lg text-gray-600 leading-relaxed">
                  For over 2 years, Holly Transportation has been providing reliable ambulatory transportation 
                  services to patients across our community. We specialize in safe, comfortable transportation 
                  for individuals who can walk independently or with minimal assistance.
                </p>
                <p className="text-lg text-gray-600 leading-relaxed">
                  Our mission is to ensure that mobility limitations never prevent anyone from accessing 
                  essential medical care. We pride ourselves on punctuality, professionalism, and 
                  compassionate service tailored to each patient's unique needs.
                </p>
                
                <div className="bg-white rounded-lg p-6 border border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Where We Transport You</h3>
                  <div className="grid sm:grid-cols-2 gap-3">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-healthcare-green flex-shrink-0" />
                      <span className="text-gray-600">Care Facilities</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-healthcare-green flex-shrink-0" />
                      <span className="text-gray-600">Cancer Treatment Centers</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-healthcare-green flex-shrink-0" />
                      <span className="text-gray-600">Doctor's Offices</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-healthcare-green flex-shrink-0" />
                      <span className="text-gray-600">Hospital Discharge</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-healthcare-green flex-shrink-0" />
                      <span className="text-gray-600">Dialysis Treatment</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-healthcare-green flex-shrink-0" />
                      <span className="text-gray-600">Rehab Centers</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-healthcare-green flex-shrink-0" />
                      <span className="text-gray-600">School & Day Programs</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="grid sm:grid-cols-2 gap-6">
                <Card className="p-6">
                  <CardContent className="p-0">
                    <div className="text-2xl font-bold text-primary mb-2">2+</div>
                    <div className="text-gray-600 font-medium">Years of Service</div>
                  </CardContent>
                </Card>
                <Card className="p-6">
                  <CardContent className="p-0">
                    <div className="text-2xl font-bold text-healthcare-green mb-2">100+</div>
                    <div className="text-gray-600 font-medium">Safe Transports</div>
                  </CardContent>
                </Card>
              </div>
              
              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-gray-900">Our Values</h3>
                <ul className="space-y-3">
                  <li className="flex items-start space-x-3">
                    <CheckCircle className="w-6 h-6 text-healthcare-green mt-1 flex-shrink-0" />
                    <span className="text-gray-600"><strong>Safety First:</strong> Every trip prioritizes passenger safety and comfort</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <CheckCircle className="w-6 h-6 text-healthcare-green mt-1 flex-shrink-0" />
                    <span className="text-gray-600"><strong>Reliability:</strong> Dependable service you can count on</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <CheckCircle className="w-6 h-6 text-healthcare-green mt-1 flex-shrink-0" />
                    <span className="text-gray-600"><strong>Compassion:</strong> Understanding and respectful patient care</span>
                  </li>
                </ul>
              </div>
            </div>
            
            <div className="space-y-6">
              <div className="aspect-video bg-gradient-to-br from-primary/10 to-healthcare-green/10 rounded-xl shadow-lg overflow-hidden">
                <img 
                  src={assistanceImage} 
                  alt="Holly Transportation staff helping ambulatory patient exit vehicle"
                  className="w-full h-full object-cover"
                  data-testid="about-assistance-image"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-20 bg-white" data-testid="services-section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">Our Services</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Comprehensive ambulatory transportation services designed to meet your medical transportation needs safely and reliably.
            </p>
          </div>
          
          <div className="grid lg:grid-cols-3 gap-8">
            <Card className="p-8 bg-gradient-to-br from-primary/5 to-primary/10">
              <CardContent className="p-0">
                <div className="w-16 h-16 bg-primary rounded-xl flex items-center justify-center mb-6">
                  <Heart className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Medical Appointments</h3>
                <p className="text-gray-600 mb-6">
                  Reliable transportation to and from doctor visits, specialists, routine check-ups, and medical procedures.
                </p>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-healthcare-green mr-2 flex-shrink-0" />
                    Doctor visits
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-healthcare-green mr-2 flex-shrink-0" />
                    Specialist appointments
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-healthcare-green mr-2 flex-shrink-0" />
                    Lab work & testing
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-healthcare-green mr-2 flex-shrink-0" />
                    Physical therapy
                  </li>
                </ul>
              </CardContent>
            </Card>
            
            <Card className="p-8 bg-gradient-to-br from-healthcare-green/5 to-healthcare-green/10">
              <CardContent className="p-0">
                <div className="w-16 h-16 bg-healthcare-green rounded-xl flex items-center justify-center mb-6">
                  <Calendar className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Scheduled Transportation</h3>
                <p className="text-gray-600 mb-6">
                  Pre-planned transportation services with flexible scheduling options to accommodate your medical needs.
                </p>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-healthcare-green mr-2 flex-shrink-0" />
                    Recurring appointments
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-healthcare-green mr-2 flex-shrink-0" />
                    Flexible scheduling
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-healthcare-green mr-2 flex-shrink-0" />
                    Advance booking
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-healthcare-green mr-2 flex-shrink-0" />
                    Reminder notifications
                  </li>
                </ul>
              </CardContent>
            </Card>
            
            <Card className="p-8 bg-gradient-to-br from-slate-50 to-slate-100">
              <CardContent className="p-0">
                <div className="w-16 h-16 bg-gray-600 rounded-xl flex items-center justify-center mb-6">
                  <Ambulance className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Specialized Support</h3>
                <p className="text-gray-600 mb-6">
                  Additional assistance and accommodations for patients with specific mobility or medical requirements.
                </p>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-healthcare-green mr-2 flex-shrink-0" />
                    Accessibility assistance
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-healthcare-green mr-2 flex-shrink-0" />
                    Walker/mobility aid support
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-healthcare-green mr-2 flex-shrink-0" />
                    Medical equipment transport
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-healthcare-green mr-2 flex-shrink-0" />
                    Companion assistance
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
          
          {/* Service Areas */}
          <Card className="mt-16 p-8 bg-slate-50">
            <CardContent className="p-0">
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Service Areas</h3>
                <p className="text-gray-600">We proudly serve patients throughout the metropolitan area and surrounding communities.</p>
              </div>
              <div className="grid md:grid-cols-3 gap-6 text-center">
                <div>
                  <MapPin className="w-8 h-8 text-primary mx-auto mb-2" />
                  <h4 className="font-semibold text-gray-900">Downtown Core</h4>
                  <p className="text-sm text-gray-600">All major medical facilities</p>
                </div>
                <div>
                  <MapPin className="w-8 h-8 text-healthcare-green mx-auto mb-2" />
                  <h4 className="font-semibold text-gray-900">Suburban Areas</h4>
                  <p className="text-sm text-gray-600">Residential communities</p>
                </div>
                <div>
                  <MapPin className="w-8 h-8 text-primary mx-auto mb-2" />
                  <h4 className="font-semibold text-gray-900">Outlying Clinics</h4>
                  <p className="text-sm text-gray-600">Extended service radius</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Payment Section */}
      <section id="payment" className="py-20 bg-gradient-to-br from-slate-50 to-primary/5" data-testid="payment-section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">Payment & Insurance</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We accept various payment methods and work with insurance providers to make transportation accessible and affordable.
            </p>
          </div>
          
          <div className="grid lg:grid-cols-3 gap-8 mb-12">
            <Card className="p-8 bg-white shadow-lg">
              <CardContent className="p-0">
                <div className="w-16 h-16 bg-primary rounded-xl flex items-center justify-center mb-6">
                  <DollarSign className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Payment Options</h3>
                <p className="text-gray-600 mb-6">
                  We accept multiple convenient payment methods for your transportation services.
                </p>
                <ul className="space-y-3 text-gray-600">
                  <li className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-healthcare-green mr-3 flex-shrink-0" />
                    <span className="font-medium">Cash payments</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-healthcare-green mr-3 flex-shrink-0" />
                    <span className="font-medium">Credit & debit cards</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-healthcare-green mr-3 flex-shrink-0" />
                    <span className="font-medium">Personal checks</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
            
            <Card className="p-8 bg-white shadow-lg">
              <CardContent className="p-0">
                <div className="w-16 h-16 bg-healthcare-green rounded-xl flex items-center justify-center mb-6">
                  <Shield className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Minnesota Medicaid (MA)</h3>
                <p className="text-gray-600 mb-6">
                  Minnesota's Medicaid program for people with low income.
                </p>
                <ul className="space-y-3 text-gray-600">
                  <li className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-healthcare-green mr-3 flex-shrink-0" />
                    <span className="font-medium">No monthly premium required</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-healthcare-green mr-3 flex-shrink-0" />
                    <span className="font-medium">Small co-pays: $1 - $3</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-healthcare-green mr-3 flex-shrink-0" />
                    <span className="font-medium">MinnesotaCare available</span>
                  </li>
                  <li className="flex items-center text-sm">
                    <div className="w-5 h-5 mr-3 flex-shrink-0"></div>
                    <span className="text-gray-500 italic">For Minnesotans with low incomes who do not have access to affordable health care coverage</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
            
            <Card className="p-8 bg-white shadow-lg">
              <CardContent className="p-0">
                <div className="w-16 h-16 bg-gray-600 rounded-xl flex items-center justify-center mb-6">
                  <Users className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Waiver Programs</h3>
                <p className="text-gray-600 mb-6">
                  We accept various Minnesota waiver programs to help cover your transportation costs.
                </p>
                <ul className="space-y-3 text-gray-600">
                  <li className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-healthcare-green mr-3 flex-shrink-0" />
                    <span className="font-medium">BI</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-healthcare-green mr-3 flex-shrink-0" />
                    <span className="font-medium">CAC</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-healthcare-green mr-3 flex-shrink-0" />
                    <span className="font-medium">CADI</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-healthcare-green mr-3 flex-shrink-0" />
                    <span className="font-medium">DD</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
          
          {/* Billing Information */}
          <Card className="p-8 bg-white">
            <CardContent className="p-0">
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-6">Billing Process</h3>
                  <div className="space-y-4">
                    <div className="flex items-start space-x-4">
                      <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                        <span className="text-primary font-semibold text-sm">1</span>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">Pre-Authorization</h4>
                        <p className="text-gray-600 text-sm">We handle insurance pre-authorization when required for your transportation.</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-4">
                      <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                        <span className="text-primary font-semibold text-sm">2</span>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">Service Completion</h4>
                        <p className="text-gray-600 text-sm">After your safe transport, we process billing with your insurance provider.</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-4">
                      <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                        <span className="text-primary font-semibold text-sm">3</span>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">Statement & Payment</h4>
                        <p className="text-gray-600 text-sm">You receive a clear statement for any remaining balance after insurance.</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-slate-50 rounded-lg p-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Questions About Payment?</h4>
                  <p className="text-gray-600 mb-4">
                    Our billing team is here to help you understand your coverage and payment options.
                  </p>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <Phone className="w-5 h-5 text-primary" />
                      <div>
                        <div className="font-medium text-gray-900">Call for Billing Questions</div>
                        <button 
                          onClick={() => window.open('tel:+16515006198', '_self')}
                          className="text-gray-600 hover:text-primary transition-colors"
                        >
                          (651) 500-6198
                        </button>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Mail className="w-5 h-5 text-healthcare-green" />
                      <div>
                        <div className="font-medium text-gray-900">Email Support</div>
                        <a href="mailto:hollytransport04@gmail.com" className="text-gray-600 hover:text-healthcare-green transition-colors">
                          hollytransport04@gmail.com
                        </a>
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 p-4 bg-primary/10 rounded-lg">
                    <p className="text-sm text-gray-700">
                      <strong>Important:</strong> Payment is never required upfront. We bill insurance first and work with you on any remaining balance.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Booking Section */}
      <section id="book" className="py-20 bg-gradient-to-br from-primary to-primary/80" data-testid="booking-section">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">Book Your Transportation</h2>
            <p className="text-xl text-primary-foreground/80">
              Schedule your ambulatory transportation service online. Quick, easy, and secure booking.
            </p>
          </div>
          
          <Card className="p-8">
            <CardContent className="p-0">
              <div className="text-center py-8">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Ready to Schedule?</h3>
                <p className="text-gray-600 mb-6">
                  Create an account or sign in to access our easy-to-use booking system and manage your transportation needs.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button 
                    size="lg"
                    onClick={() => window.location.href = '/api/login'}
                    className="bg-primary text-white hover:bg-primary/90 text-xl font-bold py-6 px-8"
                    data-testid="book-login-button"
                  >
                    <Calendar className="w-6 h-6 mr-3" />
                    Sign In to Book
                  </Button>
                  <Button 
                    variant="outline" 
                    size="lg"
                    className="border-primary text-primary hover:bg-primary/5 text-xl font-bold py-6 px-8"
                    onClick={() => window.open('tel:+16515006198', '_self')}
                    data-testid="book-call-button"
                  >
                    <Phone className="w-6 h-6 mr-3" />
                    Call (651) 500-6198
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <div className="text-center mt-8">
            <p className="text-primary-foreground/80 mb-2">Need immediate assistance or have questions?</p>
            <p className="text-white font-semibold">Call us at (651) 500-6198 or email hollytransport04@gmail.com</p>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20 bg-white" data-testid="contact-section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">Contact Us</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Get in touch with Holly Transportation for questions, support, or additional information about our services.
            </p>
          </div>
          
          <div className="grid lg:grid-cols-2 gap-16">
            {/* Contact Information */}
            <div className="space-y-8">
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Get in Touch</h3>
                <div className="space-y-4">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                      <Phone className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">Phone</div>
                      <button 
                        onClick={() => window.open('tel:+16515006198', '_self')}
                        className="text-gray-600 hover:text-primary transition-colors"
                      >
                        (651) 500-6198
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-healthcare-green/10 rounded-xl flex items-center justify-center">
                      <Mail className="w-6 h-6 text-healthcare-green" />
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">Email</div>
                      <div className="text-gray-600">hollytransport04@gmail.com</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                      <MapPin className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">Address</div>
                      <div className="text-gray-600">19255 Clearwater Loop<br />Farmington, MN 55024</div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Business Hours</h4>
                <div className="space-y-2 text-gray-600">
                  <div className="flex justify-between">
                    <span>Monday - Sunday:</span>
                    <span>6:00 AM - 8:00 PM</span>
                  </div>
                  <div className="text-healthcare-green font-medium mt-2">
                    Daily Service Available
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Service Coverage</h4>
                <p className="text-gray-600">
                  We provide ambulatory transportation services throughout the metropolitan area, 
                  including all major medical facilities, hospitals, clinics, and residential areas within a 30-mile radius.
                </p>
              </div>
            </div>
            
            {/* Contact Form */}
            <Card className="p-8 bg-slate-50">
              <CardContent className="p-0">
                <h3 className="text-xl font-semibold text-gray-900 mb-6">Send us a Message</h3>
                
                <form onSubmit={handleContactSubmit} className="space-y-6" data-testid="contact-form">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">First Name *</label>
                      <Input 
                        name="firstName"
                        placeholder="John"
                        required
                        data-testid="input-first-name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Last Name *</label>
                      <Input 
                        name="lastName"
                        placeholder="Doe"
                        required
                        data-testid="input-last-name"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email Address *</label>
                    <Input 
                      name="email"
                      type="email"
                      placeholder="john@example.com"
                      required
                      data-testid="input-email"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                    <Input 
                      name="phone"
                      type="tel"
                      placeholder="(555) 123-4567"
                      data-testid="input-phone"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Subject *</label>
                    <Select name="subject" required data-testid="select-subject">
                      <SelectTrigger>
                        <SelectValue placeholder="Select a subject" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="General Information">General Information</SelectItem>
                        <SelectItem value="Booking Question">Booking Question</SelectItem>
                        <SelectItem value="Service Feedback">Service Feedback</SelectItem>
                        <SelectItem value="Billing Inquiry">Billing Inquiry</SelectItem>
                        <SelectItem value="Partnership Opportunity">Partnership Opportunity</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Message *</label>
                    <Textarea 
                      name="message"
                      rows={4}
                      placeholder="How can we help you today?"
                      required
                      data-testid="textarea-message"
                    />
                  </div>
                  
                  <Button 
                    type="submit" 
                    className="w-full bg-primary text-white hover:bg-primary/90"
                    disabled={contactMutation.isPending}
                    data-testid="button-submit-contact"
                  >
                    <Mail className="w-5 h-5 mr-2" />
                    {contactMutation.isPending ? "Sending..." : "Send Message"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16" data-testid="footer">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="col-span-2">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                  <Ambulance className="text-white text-lg" />
                </div>
                <div>
                  <h3 className="text-xl font-bold">Holly Transportation</h3>
                  <p className="text-sm text-gray-400">Professional Ambulatory Services</p>
                </div>
              </div>
              <p className="text-gray-400 mb-6 max-w-md">
                Trusted ambulatory transportation services for over a decade. Safe, reliable, and compassionate care 
                for all your medical transportation needs.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-3 text-gray-400">
                <li><button onClick={() => scrollToSection('about')} className="hover:text-white transition-colors">About Us</button></li>
                <li><button onClick={() => scrollToSection('services')} className="hover:text-white transition-colors">Our Services</button></li>
                <li><button onClick={() => scrollToSection('payment')} className="hover:text-white transition-colors">Payment & Insurance</button></li>
                <li><button onClick={() => scrollToSection('book')} className="hover:text-white transition-colors">Book Now</button></li>
                <li><button onClick={() => scrollToSection('contact')} className="hover:text-white transition-colors">Contact</button></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Contact Info</h4>
              <ul className="space-y-3 text-gray-400">
                <li className="flex items-center space-x-2">
                  <Phone className="w-4 h-4 text-primary" />
                  <button 
                    onClick={() => window.open('tel:+16515006198', '_self')}
                    className="hover:text-primary transition-colors"
                  >
                    (651) 500-6198
                  </button>
                </li>
                <li className="flex items-center space-x-2">
                  <Mail className="w-4 h-4 text-primary" />
                  <a href="mailto:hollytransport04@gmail.com" className="hover:text-primary transition-colors">
                    hollytransport04@gmail.com
                  </a>
                </li>
                <li className="flex items-center space-x-2">
                  <MapPin className="w-4 h-4 text-primary" />
                  <span>19255 Clearwater Loop<br />Farmington, MN 55024</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Clock className="w-4 h-4 text-healthcare-green" />
                  <span>6AM to 6PM Daily</span>
                </li>
              </ul>
            </div>
          </div>
          
          <Separator className="my-8 bg-gray-800" />
          
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400">© 2025 Holly Transportation. All rights reserved.</p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">Privacy Policy</a>
              <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">Terms of Service</a>
              <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">Accessibility</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
