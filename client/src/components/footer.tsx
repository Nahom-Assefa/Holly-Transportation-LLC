import { Ambulance, Phone, Mail, MapPin, Clock } from "lucide-react";
import { COMPANY_INFO } from "@shared/constants";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/hooks/useAuth";
import { handlePhoneClick } from "@/utils/telUtility";
import { useCustomAlert } from "@/utils/customAlert";

export default function Footer() {
  const { isAuthenticated } = useAuth();
  const customAlert = useCustomAlert();
  
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    } else {
      // If section doesn't exist on current page, go to landing page
      window.location.href = `/#${sectionId}`;
    }
  };

  return (
    <footer className="bg-gray-900 text-white py-16" data-testid="footer">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className={`grid ${isAuthenticated ? 'md:grid-cols-3' : 'md:grid-cols-4'} gap-8`}>
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
              Trusted ambulatory transportation services for over 2 years. Safe, reliable, and compassionate care 
              for all your medical transportation needs.
            </p>
          </div>
          
          {!isAuthenticated && (
            <div>
              <h4 className="font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-3 text-gray-400">
                <li>
                  <button 
                    onClick={() => scrollToSection('about')} 
                    className="hover:text-white transition-colors text-left"
                  >
                    About Us
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => scrollToSection('services')} 
                    className="hover:text-white transition-colors text-left"
                  >
                    Our Services
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => scrollToSection('book')} 
                    className="hover:text-white transition-colors text-left"
                  >
                    Book Now
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => scrollToSection('contact')} 
                    className="hover:text-white transition-colors text-left"
                  >
                    Contact
                  </button>
                </li>
              </ul>
            </div>
          )}
          
          <div>
            <h4 className="font-semibold mb-4">Contact Info</h4>
            <ul className="space-y-3 text-gray-400">
              <li className="flex items-center space-x-2">
                <Phone className="w-4 h-4 text-primary flex-shrink-0" />
                <button 
                  onClick={() => handlePhoneClick({ toast: customAlert })}
                  className="hover:text-white transition-colors"
                >
                  {COMPANY_INFO.PHONE}
                </button>
              </li>
              <li className="flex items-center space-x-2">
                <Mail className="w-4 h-4 text-primary flex-shrink-0" />
                <a href={`mailto:${COMPANY_INFO.EMAIL}`} className="hover:text-white transition-colors">
                  {COMPANY_INFO.EMAIL}
                </a>
              </li>
              <li className="flex items-start space-x-2">
                <MapPin className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                <span>19255 Clearwater Loop<br />Farmington, MN 55024</span>
              </li>
              <li className="flex items-center space-x-2">
                <Clock className="w-4 h-4 text-healthcare-green flex-shrink-0" />
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
  );
}
