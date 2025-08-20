import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Ambulance, Menu, X, Calendar, User, Settings, LogOut, Shield } from "lucide-react";
import { Link } from "wouter";
import Messaging from "./messaging";

export default function Navigation() {
  const { user, isAuthenticated } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const userInitials = user ? 
    `${(user.firstName || '').charAt(0)}${(user.lastName || '').charAt(0)}`.toUpperCase() || 
    user.email?.charAt(0).toUpperCase() || 'U'
    : 'U';

  return (
    <>
      <nav className="bg-white shadow-sm border-b border-slate-200 sticky top-0 z-50" data-testid="navigation">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <Link href="/" className="flex items-center space-x-3" data-testid="nav-logo">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                <Ambulance className="text-white text-lg" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-primary">Holly Transportation</h1>
                <p className="text-xs text-gray-500">Professional Ambulatory Services</p>
              </div>
            </Link>
            
            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <Button variant="ghost" asChild data-testid="nav-home">
                <Link href="/">Home</Link>
              </Button>
              <Button variant="ghost" asChild data-testid="nav-book">
                <Link href="/book">
                  <Calendar className="w-4 h-4 mr-2" />
                  Book Ride
                </Link>
              </Button>
              <Button variant="ghost" asChild data-testid="nav-dashboard">
                <Link href="/dashboard">
                  <User className="w-4 h-4 mr-2" />
                  My Account
                </Link>
              </Button>
              
              {user?.isAdmin && (
                <Button variant="ghost" asChild data-testid="nav-admin">
                  <Link href="/admin">
                    <Shield className="w-4 h-4 mr-2" />
                    Admin
                  </Link>
                </Button>
              )}
            </div>
            
            {/* User Menu */}
            <div className="flex items-center space-x-4">
              {isAuthenticated && user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-8 w-8 rounded-full" data-testid="user-menu">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={user.profileImageUrl} alt={user.firstName || user.email} />
                        <AvatarFallback>{userInitials}</AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end" forceMount>
                    <div className="flex items-center justify-start gap-2 p-2">
                      <div className="flex flex-col space-y-1 leading-none">
                        <p className="font-medium">{user.firstName} {user.lastName}</p>
                        <p className="w-[200px] truncate text-sm text-muted-foreground">
                          {user.email}
                        </p>
                      </div>
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/dashboard" className="w-full cursor-pointer">
                        <User className="mr-2 h-4 w-4" />
                        <span>My Account</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/book" className="w-full cursor-pointer">
                        <Calendar className="mr-2 h-4 w-4" />
                        <span>Book Ride</span>
                      </Link>
                    </DropdownMenuItem>
                    {user.isAdmin && (
                      <DropdownMenuItem asChild>
                        <Link href="/admin" className="w-full cursor-pointer">
                          <Shield className="mr-2 h-4 w-4" />
                          <span>Admin Portal</span>
                        </Link>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="cursor-pointer text-red-600 focus:text-red-600"
                      onClick={() => window.location.href = '/api/logout'}
                      data-testid="logout-button"
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Log out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <div className="flex items-center space-x-2">
                  <Button variant="ghost" onClick={() => window.location.href = '/api/login'} data-testid="login-button">
                    Login
                  </Button>
                  <Button onClick={() => window.location.href = '/api/login'} data-testid="signup-button">
                    Sign Up
                  </Button>
                </div>
              )}
              
              {/* Mobile menu button */}
              <Button
                variant="ghost"
                size="sm"
                className="md:hidden"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                data-testid="mobile-menu-toggle"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </Button>
            </div>
          </div>
        </div>
        
        {/* Mobile Navigation Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-slate-200" data-testid="mobile-menu">
            <div className="px-4 py-4 space-y-3">
              <Button variant="ghost" asChild className="w-full justify-start" onClick={() => setMobileMenuOpen(false)}>
                <Link href="/">Home</Link>
              </Button>
              <Button variant="ghost" asChild className="w-full justify-start" onClick={() => setMobileMenuOpen(false)}>
                <Link href="/book">
                  <Calendar className="w-4 h-4 mr-2" />
                  Book Ride
                </Link>
              </Button>
              <Button variant="ghost" asChild className="w-full justify-start" onClick={() => setMobileMenuOpen(false)}>
                <Link href="/dashboard">
                  <User className="w-4 h-4 mr-2" />
                  My Account
                </Link>
              </Button>
              {user?.isAdmin && (
                <Button variant="ghost" asChild className="w-full justify-start" onClick={() => setMobileMenuOpen(false)}>
                  <Link href="/admin">
                    <Shield className="w-4 h-4 mr-2" />
                    Admin Portal
                  </Link>
                </Button>
              )}
            </div>
          </div>
        )}
      </nav>
      
      {/* Messaging Component */}
      {isAuthenticated && <Messaging />}
    </>
  );
}
