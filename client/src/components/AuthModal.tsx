import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { signIn, signUp } from "@/lib/auth";
import { useAuth } from "@/contexts/AuthContext";

interface AuthModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "signin" | "signup";
  onModeChange: (mode: "signin" | "signup") => void;
}

export const AuthModal = ({ open, onOpenChange, mode, onModeChange }: AuthModalProps) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    name: "",
  });
  const { toast } = useToast();
  const { setUser } = useAuth();

  const updateField = <K extends keyof typeof formData>(
    field: K, 
    value: typeof formData[K]
  ) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validateForm = () => {
    if (!formData.email.endsWith("@nd.edu")) {
      toast({
        title: "Invalid Email",
        description: "Only Notre Dame email addresses (@nd.edu) are allowed.",
        variant: "destructive",
      });
      return false;
    }

    if (formData.password.length < 6) {
      toast({
        title: "Weak Password",
        description: "Password must be at least 6 characters long.",
        variant: "destructive",
      });
      return false;
    }

    if (mode === "signup") {
      if (!formData.name.trim()) {
        toast({
          title: "Name Required",
          description: "Please enter your full name.",
          variant: "destructive",
        });
        return false;
      }

      if (formData.password !== formData.confirmPassword) {
        toast({
          title: "Password Mismatch",
          description: "Passwords do not match.",
          variant: "destructive",
        });
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);

    try {
      if (mode === "signin") {
        const response = await signIn(formData.email, formData.password);
        
        // Store user data and token
        localStorage.setItem("auth_token", response.token);
        localStorage.setItem("current_user", JSON.stringify(response.user));
        setUser(response.user);
        
        toast({
          title: "Welcome back!",
          description: "You have successfully signed in.",
        });
      } else {
        const response = await signUp(formData.email, formData.password, formData.name);
        
        // Store user data and token
        localStorage.setItem("auth_token", response.token);
        localStorage.setItem("current_user", JSON.stringify(response.user));
        setUser(response.user);

        toast({
          title: "Account created!",
          description: "Welcome to ND Sublease! You can now post listings.",
        });
      }

      // Reset form and close modal
      setFormData({
        email: "",
        password: "",
        confirmPassword: "",
        name: "",
      });
      onOpenChange(false);

    } catch (error: any) {
      console.error("Auth error:", error);
      
      let errorMessage = "An error occurred. Please try again.";
      
      if (error.code === "auth/user-not-found" || error.code === "auth/wrong-password") {
        errorMessage = "Invalid email or password.";
      } else if (error.code === "auth/email-already-in-use") {
        errorMessage = "An account with this email already exists.";
      } else if (error.code === "auth/weak-password") {
        errorMessage = "Password is too weak. Please choose a stronger password.";
      } else if (error.code === "auth/invalid-email") {
        errorMessage = "Invalid email address.";
      } else if (error.message) {
        errorMessage = error.message;
      }

      toast({
        title: mode === "signin" ? "Sign In Failed" : "Sign Up Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {mode === "signin" ? "Sign In" : "Create Account"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === "signup" && (
            <div>
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                type="text"
                value={formData.name}
                onChange={(e) => updateField("name", e.target.value)}
                placeholder="John Doe"
                required
              />
            </div>
          )}

          <div>
            <Label htmlFor="email">Notre Dame Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => updateField("email", e.target.value)}
              placeholder="your.email@nd.edu"
              required
            />
          </div>

          <div>
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={formData.password}
              onChange={(e) => updateField("password", e.target.value)}
              placeholder="Enter your password"
              required
            />
          </div>

          {mode === "signup" && (
            <div>
              <Label htmlFor="confirm-password">Confirm Password</Label>
              <Input
                id="confirm-password"
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => updateField("confirmPassword", e.target.value)}
                placeholder="Confirm your password"
                required
              />
            </div>
          )}

          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-nd-blue text-white hover:bg-nd-blue-light"
          >
            {loading 
              ? (mode === "signin" ? "Signing In..." : "Creating Account...")
              : (mode === "signin" ? "Sign In" : "Create Account")
            }
          </Button>
        </form>

        <div className="text-center">
          <button
            type="button"
            onClick={() => onModeChange(mode === "signin" ? "signup" : "signin")}
            className="text-sm text-nd-blue hover:underline"
          >
            {mode === "signin" 
              ? "Don't have an account? Sign up"
              : "Already have an account? Sign in"
            }
          </button>
        </div>

        <div className="text-xs text-gray-500 text-center">
          Only Notre Dame students with @nd.edu email addresses can create accounts.
        </div>
      </DialogContent>
    </Dialog>
  );
};
