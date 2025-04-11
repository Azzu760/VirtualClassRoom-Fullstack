import { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import AnimatedTransition from "@/components/AnimatedTransition";
import { ArrowLeft, User, Mail, Lock, Github, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { useToast } from "@/components/ui/use-toast";
import AuthContext from "@/context/AuthContext";

const Signup = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("student");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { signup, handleGoogleAuth, handleGitHubAuth, error, clearError } =
    useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Clear any previous errors
    clearError();

    // Validate form fields
    if (!name || !email || !password) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      // Call the signup function from AuthContext
      const result = await signup(name, email, password, role);

      if (result.success) {
        toast({
          title: "Account created",
          description: "Your account has been created successfully!",
        });

        // Redirect to the login page after successful signup
        navigate("/login");
      } else {
        toast({
          title: "Error",
          description: result.message || "Signup failed",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error("Signup error:", error);
      toast({
        title: "Error",
        description: error.message || "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatedTransition className="min-h-screen flex flex-col">
      <div className="fixed top-4 left-4 z-10">
        <Button variant="ghost" size="icon" asChild>
          <Link to="/" aria-label="Go back to home page">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
      </div>

      <div className="flex flex-1">
        <div className="relative hidden lg:block lg:w-1/2">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-700 to-blue-900 h-full w-full object-cover">
            <div className="absolute inset-0 bg-black/10 backdrop-blur-[2px]"></div>
            <div className="absolute inset-0 flex flex-col items-center justify-center p-12">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, delay: 0.6 }}
                className="w-full max-w-md text-white text-center"
              >
                <h2 className="text-3xl font-bold mb-6">
                  Join ClassroomHive Today
                </h2>
                <p className="text-xl mb-8">
                  Unlock a world of educational possibilities with our
                  comprehensive virtual classroom platform.
                </p>
                <div className="space-y-6">
                  {[
                    "Free for individual educators and students",
                    "Create unlimited classrooms and assignments",
                    "Join live classes with video and chat",
                    "Access educational resources anywhere, anytime",
                  ].map((item, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.5, delay: 0.7 + index * 0.1 }}
                      className="flex items-center space-x-2"
                    >
                      <svg
                        className="h-5 w-5 flex-shrink-0 text-blue-300"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span>{item}</span>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </div>
          </div>
        </div>

        <div className="flex flex-col justify-center px-4 py-12 sm:px-6 lg:flex-none lg:px-20 xl:px-24 w-full lg:w-1/2">
          <div className="mx-auto w-full max-w-sm lg:w-96">
            <div className="text-center lg:text-left">
              <motion.h2
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="mt-6 text-3xl font-bold tracking-tight text-gray-900 dark:text-white"
              >
                Create your account
              </motion.h2>
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="mt-2 text-sm text-gray-600 dark:text-gray-400"
              >
                Already have an account?{" "}
                <Link
                  to="/login"
                  className="font-medium text-primary hover:text-primary/90"
                >
                  Sign in here
                </Link>
              </motion.p>
            </div>

            {/* Display error message if it exists
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="mt-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-md"
              >
                {error}
              </motion.div>
            )} */}

            <div className="mt-8">
              <div>
                <div>
                  <motion.p
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    Sign up with
                  </motion.p>

                  <div className="mt-2 grid grid-cols-2 gap-3">
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 0.3 }}
                    >
                      <Button
                        variant="outline"
                        className="w-full"
                        type="button"
                        onClick={handleGoogleAuth}
                      >
                        <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24">
                          <path
                            d="M12.545, 10.239v3.821h5.445c-0.712, 2.315-2.647, 3.972-5.445, 3.972-3.332, 0-6.033-2.701-6.033-6.032s2.701-6.032, 6.033-6.032c1.498, 0, 2.866, 0.549, 3.921, 1.453l2.814-2.814C17.503, 2.988, 15.139, 2, 12.545, 2 7.021, 2, 2.543, 6.477, 2.543, 12s4.478, 10, 10.002, 10c8.396, 0, 10.249-7.85, 9.426-11.748l-9.426, 0z"
                            fill="currentColor"
                          />
                        </svg>
                        Google
                      </Button>
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 0.4 }}
                    >
                      <Button
                        variant="outline"
                        className="w-full"
                        type="button"
                        onClick={handleGitHubAuth}
                      >
                        <Github className="h-5 w-5 mr-2" />
                        GitHub
                      </Button>
                    </motion.div>
                  </div>
                </div>

                <div className="relative mt-6">
                  <div
                    className="absolute inset-0 flex items-center"
                    aria-hidden="true"
                  >
                    <div className="w-full border-t border-gray-300 dark:border-gray-700" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="bg-white dark:bg-gray-900 px-2 text-gray-500 dark:text-gray-400">
                      Or continue with
                    </span>
                  </div>
                </div>
              </div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.5 }}
                className="mt-6"
              >
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <Label htmlFor="name" className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Full name
                    </Label>
                    <div className="mt-1">
                      <Input
                        id="name"
                        name="name"
                        type="text"
                        autoComplete="name"
                        required
                        value={name}
                        onChange={(e) => {
                          setName(e.target.value);
                          clearError(); // Clear error when user starts typing
                        }}
                        className="block w-full"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="email" className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      Email address
                    </Label>
                    <div className="mt-1">
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        autoComplete="email"
                        required
                        value={email}
                        onChange={(e) => {
                          setEmail(e.target.value);
                          clearError(); // Clear error when user starts typing
                        }}
                        className="block w-full"
                      />
                    </div>
                  </div>

                  <div>
                    <Label
                      htmlFor="password"
                      className="flex items-center gap-2"
                    >
                      <Lock className="h-4 w-4" />
                      Password
                    </Label>
                    <div className="mt-1">
                      <Input
                        id="password"
                        name="password"
                        type="password"
                        autoComplete="new-password"
                        required
                        value={password}
                        onChange={(e) => {
                          setPassword(e.target.value);
                          clearError(); // Clear error when user starts typing
                        }}
                        className="block w-full"
                      />
                    </div>
                  </div>

                  <div>
                    <Label className="mb-2 block">I am a</Label>
                    <RadioGroup
                      value={role}
                      onValueChange={setRole}
                      className="flex space-x-4"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="student" id="student" />
                        <Label htmlFor="student">Student</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="teacher" id="teacher" />
                        <Label htmlFor="teacher">Teacher</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="parent" id="parent" />
                        <Label htmlFor="parent">Parent</Label>
                      </div>
                    </RadioGroup>
                  </div>

                  <div>
                    <Button
                      type="submit"
                      className="w-full"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Creating account
                        </>
                      ) : (
                        "Create account"
                      )}
                    </Button>
                  </div>

                  <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-4">
                    By signing up, you agree to our{" "}
                    <Link
                      to="/terms"
                      className="text-primary hover:text-primary/90"
                    >
                      Terms of Service
                    </Link>{" "}
                    and{" "}
                    <Link
                      to="/privacy"
                      className="text-primary hover:text-primary/90"
                    >
                      Privacy Policy
                    </Link>
                  </p>
                </form>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </AnimatedTransition>
  );
};

export default Signup;
