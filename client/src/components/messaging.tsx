import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { MessageCircle, Mail, Phone } from "lucide-react";

/**
 * Contact Support Component (formerly Messaging)
 * 
 * @description Floating contact widget for authenticated users to reach Holly Transportation
 * directly via email or phone. Uses mailto protocol for immediate email client opening
 * and tel protocol for direct phone dialing.
 * 
 * @component
 * @returns {JSX.Element} Floating contact button and dialog interface
 */
export default function Messaging() {
  const { user, isAuthenticated } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  if (!isAuthenticated || !user) {
    return null;
  }

  return (
    <>
      {/* Floating Contact Button */}
      <div className="fixed bottom-6 right-6 z-40">
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button
              className="bg-healthcare-green text-white w-16 h-16 rounded-full shadow-lg hover:bg-healthcare-green/90 transition-colors"
              data-testid="messaging-button"
            >
              <MessageCircle className="w-6 h-6" />
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md" data-testid="messaging-dialog">
            <DialogHeader>
              <DialogTitle className="flex items-center space-x-2">
                <MessageCircle className="w-5 h-5 text-healthcare-green" />
                <span>Contact Support</span>
              </DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4">
              <p className="text-gray-600 text-center">
                Get help with your transportation needs. Contact Holly Transportation directly for immediate assistance.
              </p>
              
              <div className="grid gap-4">
                {/* Email Contact */}
                <Card className="border-healthcare-green/20 hover:border-healthcare-green/40 transition-colors cursor-pointer"
                      onClick={() => window.open('mailto:hollytransport04@gmail.com?subject=Transportation Inquiry', '_self')}>
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center space-x-3 text-lg">
                      <Mail className="w-5 h-5 text-healthcare-green" />
                      <span>Send Email</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-gray-600 text-sm mb-3">Get a detailed response to your questions</p>
                    <Button
                      className="w-full bg-healthcare-green text-white hover:bg-healthcare-green/90"
                      onClick={(e) => {
                        e.stopPropagation();
                        window.open('mailto:hollytransport04@gmail.com?subject=Transportation Inquiry', '_self');
                        setIsOpen(false);
                      }}
                      data-testid="email-support-button"
                    >
                      <Mail className="w-4 h-4 mr-2" />
                      Email Support
                    </Button>
                    <p className="text-xs text-gray-500 text-center mt-2">hollytransport04@gmail.com</p>
                  </CardContent>
                </Card>

                {/* Phone Contact */}
                <Card className="border-blue-200 hover:border-blue-300 transition-colors cursor-pointer"
                      onClick={() => window.open('tel:+16515006198', '_self')}>
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center space-x-3 text-lg">
                      <Phone className="w-5 h-5 text-blue-600" />
                      <span>Call Us</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-gray-600 text-sm mb-3">Speak directly with our team</p>
                    <Button
                      variant="outline"
                      className="w-full border-blue-600 text-blue-600 hover:bg-blue-50"
                      onClick={(e) => {
                        e.stopPropagation();
                        window.open('tel:+16515006198', '_self');
                        setIsOpen(false);
                      }}
                      data-testid="call-support-button"
                    >
                      <Phone className="w-4 h-4 mr-2" />
                      Call (651) 500-6198
                    </Button>
                    <p className="text-xs text-gray-500 text-center mt-2">Available 6AM - 6PM Daily</p>
                  </CardContent>
                </Card>
              </div>
              
              <div className="text-center text-xs text-gray-500 mt-4">
                <p>Common topics: Booking assistance • Insurance questions • Special requests</p>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
}
