import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ThemeToggle } from "@/components/theme-toggle";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { 
  Ticket, 
  BarChart3, 
  Users, 
  Bell, 
  Shield, 
  Zap,
  ArrowRight,
  Loader2,
  X,
  Sparkles
} from "lucide-react";
import { motion, AnimatePresence, useMotionTemplate, useMotionValue, animate } from "framer-motion";
import { useTheme } from "@/components/theme-provider";

const COLORS_TOP = ['#3b82f6', '#8b5cf6', '#ec4899', '#06b6d4'];
const COLORS_TOP_LIGHT = ['#2563eb', '#7c3aed', '#db2777', '#0891b2'];

export default function Landing() {
  const [showAuthForm, setShowAuthForm] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { theme } = useTheme();
  const color = useMotionValue(COLORS_TOP[0]);

  // Determine if dark mode is active
  const isDark = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
  const colors = isDark ? COLORS_TOP : COLORS_TOP_LIGHT;

  useEffect(() => {
    animate(color, colors, {
      ease: 'easeInOut',
      duration: 10,
      repeat: Infinity,
      repeatType: 'mirror',
    });
  }, [isDark]);

  // Listen for auth state changes and redirect to dashboard when logged in
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (session?.user) {
          window.location.href = '/';
        }
      }
    );

    // Check if already logged in
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        window.location.href = '/';
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const backgroundImage = useMotionTemplate`radial-gradient(125% 125% at 50% 0%, hsl(var(--background)) 50%, ${color})`;

  const handleLogin = () => {
    setShowAuthForm(true);
    setIsSignUp(false);
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {

      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/`,
          },
        });
        if (error) throw error;
        toast({
          title: "Check your email",
          description: "We sent you a confirmation link.",
        });
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        toast({
          title: "Welcome back!",
          description: "You've successfully signed in.",
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const features = [
    {
      icon: Ticket,
      title: "Smart Ticket Management",
      description: "Create, track, and resolve customer feedback tickets with intelligent categorization and routing."
    },
    {
      icon: Zap,
      title: "AI-Powered Insights",
      description: "Automatic sentiment analysis, keyword extraction, and smart categorization using AI."
    },
    {
      icon: Users,
      title: "Team Collaboration",
      description: "Auto-assign tickets to the right teams, track workloads, and collaborate seamlessly."
    },
    {
      icon: Bell,
      title: "Automated Notifications",
      description: "Stay informed with real-time alerts for assignments, status changes, and SLA breaches."
    },
    {
      icon: BarChart3,
      title: "Advanced Analytics",
      description: "Comprehensive dashboards with KPIs, trends, and performance metrics."
    },
    {
      icon: Shield,
      title: "SLA Tracking",
      description: "Monitor resolution times with visual indicators and automatic escalations."
    }
  ];

  return (
    <div className={`min-h-screen overflow-hidden ${isDark ? 'bg-background' : 'bg-white'}`}>
      {/* Header */}
      <header className={`sticky top-0 z-50 w-full border-b backdrop-blur-xl supports-[backdrop-filter]:bg-background/60 ${
        isDark
          ? 'bg-background/80 border-gray-800'
          : 'bg-white/95 border-blue-200'
      }`}>
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <motion.div 
            className="flex items-center gap-3"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <img src="/logo.png" alt="Physique 57 India" className="h-9 w-auto" />
            <span className="font-bold hidden sm:inline text-foreground tracking-tight">Support Hub</span>
          </motion.div>
          <motion.div 
            className="flex items-center gap-2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <ThemeToggle />
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button 
                onClick={handleLogin} 
                data-testid="button-login"
                className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
              >
                Sign In
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </header>

      {/* Auth Modal */}
      <AnimatePresence>
        {showAuthForm && (
          <motion.div 
            className={`fixed inset-0 z-50 flex items-center justify-center backdrop-blur-md ${
              isDark ? 'bg-black/50' : 'bg-black/30'
            }`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowAuthForm(false)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="relative"
              onClick={(e) => e.stopPropagation()}
            >
              <motion.button
                onClick={() => setShowAuthForm(false)}
                className={`absolute -top-10 -right-10 z-10 p-2 rounded-full transition-colors ${
                  isDark
                    ? 'hover:bg-white/10 text-foreground'
                    : 'hover:bg-gray-200 text-gray-800'
                }`}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <X className="w-5 h-5" />
              </motion.button>
              <Card className={`w-full max-w-md mx-4 border-2 shadow-2xl ${
                isDark
                  ? 'border-blue-500/20'
                  : 'border-blue-300/50 bg-white'
              }`}>
                <CardHeader>
                  <CardTitle className={`flex items-center gap-2 ${isDark ? 'text-foreground' : 'text-gray-900'}`}>
                    <Sparkles className="w-5 h-5" />
                    {isSignUp ? "Create Account" : "Sign In"}
                  </CardTitle>
                  <CardDescription className={isDark ? '' : 'text-gray-600'}>
                    {isSignUp 
                      ? "Enter your email to create a new account" 
                      : "Enter your email and password to sign in"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleAuth} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="name@physique57.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password">Password</Label>
                      <Input
                        id="password"
                        type="password"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                      />
                    </div>
                    <div className="flex gap-2">
                      <motion.div 
                        className="flex-1"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Button 
                          type="submit" 
                          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300" 
                          disabled={loading}
                        >
                          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                          {isSignUp ? "Sign Up" : "Sign In"}
                        </Button>
                      </motion.div>
                      <motion.div
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Button 
                          type="button" 
                          variant="outline" 
                          onClick={() => setShowAuthForm(false)}
                        >
                          Cancel
                        </Button>
                      </motion.div>
                    </div>
                    <div className="text-center text-sm">
                      {isSignUp ? (
                        <>
                          Already have an account?{" "}
                          <button
                            type="button"
                            className="text-primary hover:underline"
                            onClick={() => setIsSignUp(false)}
                          >
                            Sign in
                          </button>
                        </>
                      ) : (
                        <>
                          Don't have an account?{" "}
                          <button
                            type="button"
                            className="text-primary hover:underline"
                            onClick={() => setIsSignUp(true)}
                          >
                            Sign up
                          </button>
                        </>
                      )}
                    </div>
                  </form>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <main>
        {/* Hero Section with Animated Background */}
        <motion.section
          style={{ backgroundImage }}
          className="relative min-h-screen flex items-center justify-center overflow-hidden px-4 py-12"
        >
          {/* Animated gradient orbs */}
          <div className="absolute inset-0 z-0 overflow-hidden">
            <motion.div
              className={`absolute w-96 h-96 rounded-full blur-3xl opacity-20 ${isDark ? 'bg-blue-500' : 'bg-blue-300'}`}
              style={{ top: '-100px', left: '-100px' }}
              animate={{
                x: [0, 50, 0],
                y: [0, 50, 0],
              }}
              transition={{
                duration: 20,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />
            <motion.div
              className={`absolute w-96 h-96 rounded-full blur-3xl opacity-20 ${isDark ? 'bg-blue-500' : 'bg-blue-300'}`}
              style={{ bottom: '-100px', right: '-100px' }}
              animate={{
                x: [0, -50, 0],
                y: [0, -50, 0],
              }}
              transition={{
                duration: 25,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />
            {/* Animated background stars */}
            {[...Array(60)].map((_, i) => (
              <motion.div
                key={i}
                className={`absolute rounded-full ${isDark ? 'bg-white' : 'bg-blue-600/30'}`}
                style={{
                  width: Math.random() * 2.5 + 'px',
                  height: Math.random() * 2.5 + 'px',
                  top: Math.random() * 100 + '%',
                  left: Math.random() * 100 + '%',
                  opacity: Math.random() * 0.6 + 0.1,
                }}
                animate={{
                  opacity: [Math.random() * 0.6 + 0.1, Math.random() * 0.8 + 0.3, Math.random() * 0.6 + 0.1],
                  scale: [1, 1.2, 1],
                }}
                transition={{
                  duration: Math.random() * 4 + 3,
                  repeat: Infinity,
                  delay: Math.random() * 2,
                }}
              />
            ))}
          </div>

          <div className="relative z-10 container mx-auto max-w-4xl text-center">
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className={`mb-8 inline-flex items-center gap-2 rounded-full backdrop-blur-md border px-5 py-2.5 text-xs font-bold tracking-wider uppercase shadow-lg ${
                isDark
                  ? 'bg-blue-600/10 border-blue-500/30 shadow-blue-500/20 text-blue-300'
                  : 'bg-blue-50 border-blue-300/60 shadow-blue-200/30 text-blue-700'
              }`}
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
              >
                ⚙️
              </motion.div>
              Intelligent Support Management
            </motion.div>

            {/* Main Heading */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2, type: 'spring', stiffness: 100 }}
              className="mb-8"
            >
              <div className="relative inline-block">
                {/* Animated gradient background behind title - only in light mode */}
                {!isDark && (
                  <motion.div
                    className="absolute inset-0 rounded-2xl blur-2xl opacity-30 bg-gradient-to-r from-blue-300 to-blue-400"
                    animate={{
                      opacity: [0.2, 0.4, 0.2],
                    }}
                    transition={{
                      duration: 4,
                      repeat: Infinity,
                      ease: 'easeInOut',
                    }}
                  />
                )}
                <h1 className={`relative text-5xl font-black tracking-tighter sm:text-6xl md:text-8xl leading-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  <motion.span
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.3, type: 'spring', stiffness: 80 }}
                    className="block bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 bg-clip-text text-transparent"
                  >
                    Enterprise
                  </motion.span>
                  <motion.span
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.5, type: 'spring', stiffness: 80 }}
                    className="block"
                  >
                    Ticket & Support
                  </motion.span>
                  <motion.span
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.7, type: 'spring', stiffness: 80 }}
                    className="block"
                  >
                    Management Platform
                  </motion.span>
                </h1>
              </div>
            </motion.div>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 1 }}
              className={`mb-6 max-w-2xl mx-auto text-xl leading-relaxed font-semibold ${
                isDark ? 'text-gray-200' : 'text-slate-700'
              }`}
            >
              Streamline support operations with intelligent routing, real-time analytics, and comprehensive ticket lifecycle management.
            </motion.p>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 1.2 }}
              className={`mb-12 max-w-2xl mx-auto text-base ${
                isDark ? 'text-gray-400' : 'text-slate-600'
              }`}
            >
              Purpose-built for high-volume support teams at Physique 57 India
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 1.4 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-5 mb-16"
            >
              <motion.div
                whileHover={{ scale: 1.08, y: -2 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button 
                  size="lg" 
                  onClick={handleLogin} 
                  data-testid="button-get-started"
                  className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold px-10 py-6 rounded-lg shadow-xl shadow-blue-600/40 hover:shadow-2xl hover:shadow-blue-600/60 transition-all duration-300 text-base"
                >
                  Access Platform
                  <motion.span
                    animate={{ x: [0, 6, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    className="ml-3 inline-block"
                  >
                    <ArrowRight className="h-5 w-5" />
                  </motion.span>
                </Button>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.08, y: -2 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button 
                  size="lg" 
                  variant="outline" 
                  asChild
                  className={`border-2 font-bold px-10 py-6 rounded-lg text-base transition-all duration-300 ${isDark ? 'border-blue-500/50 text-blue-300 hover:bg-blue-500/10' : 'border-blue-400 text-blue-700 hover:bg-blue-100'}`}
                >
                  <a href="#features">
                    View Features
                  </a>
                </Button>
              </motion.div>
            </motion.div>

            {/* Stats Preview */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.8 }}
              className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto"
            >
              <div className={`p-4 rounded-xl backdrop-blur-lg border transition-all duration-300 ${
                isDark
                  ? 'bg-white/5 border-white/10 hover:border-blue-400/50'
                  : 'bg-blue-50/60 border-blue-200/60 hover:border-blue-400/80'
              }`}>
                <div className={`text-xl md:text-2xl font-bold ${isDark ? 'text-blue-400' : 'text-blue-700'}`}>13</div>
                <div className={`text-xs ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Categories</div>
              </div>
              <div className={`p-4 rounded-xl backdrop-blur-lg border transition-all duration-300 ${
                isDark
                  ? 'bg-white/5 border-white/10 hover:border-purple-400/50'
                  : 'bg-purple-50/60 border-purple-200/60 hover:border-purple-400/80'
              }`}>
                <div className={`text-xl md:text-2xl font-bold ${isDark ? 'text-purple-400' : 'text-purple-700'}`}>100+</div>
                <div className={`text-xs ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Fields</div>
              </div>
              <div className={`p-4 rounded-xl backdrop-blur-lg border transition-all duration-300 ${
                isDark
                  ? 'bg-white/5 border-white/10 hover:border-cyan-400/50'
                  : 'bg-cyan-50/60 border-cyan-200/60 hover:border-cyan-400/80'
              }`}>
                <div className={`text-xl md:text-2xl font-bold ${isDark ? 'text-cyan-400' : 'text-cyan-700'}`}>8</div>
                <div className={`text-xs ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Locations</div>
              </div>
              <div className={`p-4 rounded-xl backdrop-blur-lg border transition-all duration-300 ${
                isDark
                  ? 'bg-white/5 border-white/10 hover:border-pink-400/50'
                  : 'bg-pink-50/60 border-pink-200/60 hover:border-pink-400/80'
              }`}>
                <div className={`text-xl md:text-2xl font-bold ${isDark ? 'text-pink-400' : 'text-pink-700'}`}>AI</div>
                <div className={`text-xs ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Powered</div>
              </div>
            </motion.div>
          </div>
        </motion.section>

        {/* Stats Section */}
        <section className={`border-y backdrop-blur-xl ${
          isDark
            ? 'border-blue-500/20 bg-gradient-to-b from-background via-blue-950/10 to-background'
            : 'border-blue-200 bg-gradient-to-b from-blue-50/50 via-white to-white'
        }`}>
          <div className="container mx-auto px-4 py-20">
            <motion.div 
              className="grid grid-cols-2 md:grid-cols-4 gap-6"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ staggerChildren: 0.1 }}
              viewport={{ once: true }}
            >
              {[
                { num: '13', label: 'Categories' },
                { num: '100+', label: 'Subcategories' },
                { num: '8', label: 'Locations' },
                { num: '8', label: 'Departments' }
              ].map((stat, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  viewport={{ once: true }}
                  className={`text-center p-6 rounded-2xl backdrop-blur-lg border transition-all duration-300 ${
                    isDark
                      ? 'bg-white/5 border-blue-400/20 hover:border-blue-400/50 hover:bg-blue-500/10'
                      : 'bg-white border-blue-200 hover:border-blue-400 hover:bg-blue-50/50'
                  }`}
                >
                  <div className={`text-3xl md:text-4xl font-bold bg-gradient-to-r ${
                    isDark
                      ? 'from-blue-400 to-purple-400'
                      : 'from-blue-700 to-purple-700'
                  } bg-clip-text text-transparent`}>{stat.num}</div>
                  <div className={`text-sm mt-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{stat.label}</div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className={`container mx-auto px-4 py-16 md:py-24 ${isDark ? '' : 'bg-white'}`}>
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.6 }}
              className={`inline-block px-4 py-2 rounded-lg mb-6 text-xs font-bold tracking-wider uppercase ${
                isDark
                  ? 'bg-blue-600/10 text-blue-300'
                  : 'bg-blue-100 text-blue-700'
              }`}
            >
              Core Capabilities
            </motion.div>
            <h2 className={`text-4xl md:text-5xl font-black tracking-tight ${
              isDark
                ? 'text-white'
                : 'text-slate-900'
            }`}>
              Built for Enterprise Operations
            </h2>
            <p className={`mt-6 max-w-2xl mx-auto text-lg font-medium ${
              isDark ? 'text-gray-400' : 'text-slate-600'
            }`}>
              Comprehensive tools designed for modern support teams handling high-volume customer interactions.
            </p>
          </motion.div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -5 }}
              >
                <Card className={`relative overflow-hidden h-full backdrop-blur-lg border transition-all duration-300 group ${
                  isDark
                    ? 'bg-slate-800/40 border-blue-500/30 hover:border-blue-500/60 hover:shadow-lg hover:shadow-blue-500/20'
                    : 'bg-white border-slate-200/80 hover:border-blue-400/80 hover:shadow-2xl hover:shadow-blue-200/40'
                }`}>
                  <div className={`absolute inset-0 opacity-0 group-hover:opacity-5 transition-opacity duration-300 ${isDark ? 'bg-blue-500' : 'bg-blue-300'}`} />
                  <CardHeader>
                    <div className="flex items-start justify-between mb-2">
                      <div className={`flex h-14 w-14 items-center justify-center rounded-xl border transition-all duration-300 group-hover:scale-110 ${
                        isDark
                          ? 'bg-gradient-to-br from-blue-600/40 to-blue-600/20 border-blue-500/50 group-hover:border-blue-400'
                          : 'bg-gradient-to-br from-blue-100/80 to-blue-50/80 border-blue-300/60 group-hover:border-blue-400'
                      }`}>
                        <feature.icon className={`h-7 w-7 ${isDark ? 'text-blue-300' : 'text-blue-600'}`} />
                      </div>
                    </div>
                    <CardTitle className={`text-lg font-bold leading-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className={`text-sm leading-relaxed ${isDark ? 'text-gray-400' : 'text-slate-600'}`}>
                      {feature.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </section>

        {/* CTA Section */}
        <section className={`border-t backdrop-blur-xl ${
          isDark
            ? 'border-blue-500/20 bg-gradient-to-b from-background via-purple-950/10 to-background'
            : 'border-blue-200 bg-gradient-to-b from-white via-blue-50/30 to-white'
        }`}>
          <div className="container mx-auto px-4 py-24">
            <motion.div 
              className="mx-auto max-w-3xl text-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ duration: 0.6 }}
                className={`inline-block px-4 py-2 rounded-lg mb-6 text-xs font-bold tracking-wider uppercase ${
                  isDark
                    ? 'bg-blue-600/10 text-blue-300'
                    : 'bg-blue-100 text-blue-700'
                }`}
              >
                Get Started Today
              </motion.div>
              <h2 className={`text-4xl md:text-5xl font-black tracking-tight ${
                isDark
                  ? 'text-white'
                  : 'text-slate-900'
              }`}>
                Take Control of Your Support Operations
              </h2>
              <p className={`mt-6 text-lg font-medium ${isDark ? 'text-gray-400' : 'text-slate-600'}`}>
                Join teams across Physique 57 India managing support at scale with intelligent automation and real-time visibility.
              </p>
              <div className="mt-12 flex flex-col items-center gap-8">
                <motion.div
                  whileHover={{ scale: 1.08, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button 
                    size="lg" 
                    onClick={handleLogin} 
                    data-testid="button-signin-bottom"
                    className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold px-12 py-6 rounded-lg shadow-xl shadow-blue-600/40 hover:shadow-2xl hover:shadow-blue-600/60 transition-all duration-300 text-base"
                  >
                    Launch Support Platform
                    <motion.span
                      animate={{ x: [0, 6, 0] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                      className="ml-3 inline-block"
                    >
                      <ArrowRight className="h-5 w-5" />
                    </motion.span>
                  </Button>
                </motion.div>
                <motion.div 
                  className="flex flex-wrap items-center justify-center gap-5 text-sm"
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  viewport={{ once: true }}
                >
                  {[
                    { icon: <Shield className={`h-5 w-5 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />, label: 'Enterprise Security' },
                    { icon: <Users className={`h-5 w-5 ${isDark ? 'text-purple-400' : 'text-purple-600'}`} />, label: 'Team Collaboration' },
                    { icon: <Zap className={`h-5 w-5 ${isDark ? 'text-cyan-400' : 'text-cyan-600'}`} />, label: 'Real-time Sync' }
                  ].map((item, idx) => (
                    <motion.div 
                      key={idx} 
                      whileHover={{ y: -2 }}
                      className={`flex items-center gap-3 px-5 py-3 rounded-xl backdrop-blur-lg border font-semibold ${
                        isDark
                          ? 'bg-white/8 border-white/15 text-gray-300'
                          : 'bg-white border-slate-200/80 text-slate-700 shadow-sm hover:shadow-md'
                      }`}
                    >
                      {item.icon}
                      <span>{item.label}</span>
                    </motion.div>
                  ))}
                </motion.div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Footer */}
        <footer className={`border-t py-8 ${
          isDark
            ? 'border-blue-500/20 bg-gradient-to-t from-background via-background to-transparent'
            : 'border-blue-200 bg-gradient-to-t from-white via-white to-transparent'
        }`}>
          <div className="container mx-auto px-4">
            <motion.div 
              className="flex flex-col md:flex-row items-center justify-between gap-4"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
            >
              <div className="flex items-center gap-2">
                <img src="/logo.png" alt="Physique 57 India" className="h-7 w-auto" />
                <span className={`text-sm ${isDark ? 'text-muted-foreground' : 'text-gray-600'}`}>
                  Physique 57 India - Smart Ticket Management
                </span>
              </div>
              <p className={`text-sm ${isDark ? 'text-muted-foreground' : 'text-gray-600'}`}>
                &copy; {new Date().getFullYear()} Physique 57. All rights reserved.
              </p>
            </motion.div>
          </div>
        </footer>
      </main>
    </div>
  );
}
