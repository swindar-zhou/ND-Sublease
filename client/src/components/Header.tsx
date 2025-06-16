import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { signOut } from "@/lib/auth";
import { AuthModal } from "./AuthModal";
import { CreateListingModal } from "./CreateListingModal";
import { MessagingModal } from "./MessagingModal";
import { Menu, X, MessageCircle, Plus } from "lucide-react";

export const Header = () => {
  const { user, isAuthenticated, isNDStudent } = useAuth();
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"signin" | "signup">("signin");
  const [createListingOpen, setCreateListingOpen] = useState(false);
  const [messagingOpen, setMessagingOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const openAuthModal = (mode: "signin" | "signup") => {
    setAuthMode(mode);
    setAuthModalOpen(true);
  };

  return (
    <>
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <h1 className="text-2xl font-bold text-nd-blue">ND Sublease</h1>
                <p className="text-xs text-gray-500">Notre Dame Student Housing</p>
              </div>
            </div>
            
            {/* Desktop Navigation */}
            <nav className="hidden md:flex space-x-8">
              <a href="/" className="text-gray-900 hover:text-nd-blue font-medium">Browse</a>
              {isAuthenticated && (
                <>
                  <a href="/favorites" className="text-gray-500 hover:text-nd-blue">Favorites</a>
                  <a href="/inbox" className="text-gray-500 hover:text-nd-blue">Inbox</a>
                </>
              )}
              {isAuthenticated && isNDStudent && (
                <>
                  <a href="/my-listings" className="text-gray-500 hover:text-nd-blue">My Listings</a>
                  <button 
                    onClick={() => setCreateListingOpen(true)}
                    className="text-gray-500 hover:text-nd-blue"
                  >
                    Post Listing
                  </button>
                </>
              )}
              <a href="#" className="text-gray-500 hover:text-nd-blue">Help</a>
            </nav>

            {/* Auth Buttons */}
            <div className="flex items-center space-x-4">
              {isAuthenticated ? (
                <div className="flex items-center space-x-4">
                  <span className="hidden sm:block text-sm text-gray-700">
                    {user?.name}
                  </span>
                  <Button
                    variant="outline"
                    onClick={handleSignOut}
                    className="hidden sm:block"
                  >
                    Sign Out
                  </Button>
                </div>
              ) : (
                <>
                  <Button
                    variant="ghost"
                    onClick={() => openAuthModal("signin")}
                    className="hidden sm:block"
                  >
                    Log in
                  </Button>
                  <Button
                    onClick={() => openAuthModal("signup")}
                    className="bg-nd-blue text-white hover:bg-nd-blue-light"
                  >
                    Sign up
                  </Button>
                </>
              )}
              
              <Button
                variant="ghost"
                size="sm"
                className="md:hidden"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X /> : <Menu />}
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 bg-white">
            <div className="px-4 py-2 space-y-2">
              <a href="#" className="block py-2 text-gray-900 font-medium">Browse</a>
              {isAuthenticated && (
                <button 
                  onClick={() => {
                    setMessagingOpen(true);
                    setMobileMenuOpen(false);
                  }}
                  className="block py-2 text-gray-500 w-full text-left"
                >
                  Messages
                </button>
              )}
              {isAuthenticated && isNDStudent && (
                <button 
                  onClick={() => {
                    setCreateListingOpen(true);
                    setMobileMenuOpen(false);
                  }}
                  className="block py-2 text-gray-500 w-full text-left"
                >
                  Post Listing
                </button>
              )}
              <a href="#" className="block py-2 text-gray-500">Help</a>
              {isAuthenticated && (
                <>
                  <hr className="my-2" />
                  <div className="py-2 text-sm text-gray-700">{user?.name}</div>
                  <button 
                    onClick={handleSignOut}
                    className="block py-2 text-gray-700 w-full text-left"
                  >
                    Sign Out
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </header>

      <AuthModal
        open={authModalOpen}
        onOpenChange={setAuthModalOpen}
        mode={authMode}
        onModeChange={setAuthMode}
      />

      <CreateListingModal
        open={createListingOpen}
        onOpenChange={setCreateListingOpen}
      />

      <MessagingModal
        open={messagingOpen}
        onOpenChange={setMessagingOpen}
      />
    </>
  );
};
