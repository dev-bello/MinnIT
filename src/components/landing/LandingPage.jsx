import React, { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { 
  ArrowRightIcon, 
  ShieldCheckIcon, 
  UsersIcon, 
  QrCodeIcon,
  StarIcon,
  CheckCircleIcon,
  PlayIcon,
  ChevronDownIcon,
  MenuIcon,
  XIcon
} from 'lucide-react';

export const LandingPage = ({ onEnterPortal }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [activeFeature, setActiveFeature] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    setIsVisible(true);
    
    // Auto-rotate features
    const interval = setInterval(() => {
      setActiveFeature(prev => (prev + 1) % 3);
    }, 4000);
    
    return () => clearInterval(interval);
  }, []);

  const features = [
    {
      icon: ShieldCheckIcon,
      title: "Advanced Security",
      description: "State-of-the-art visitor management with QR codes and real-time verification",
      color: "from-blue-500 to-blue-600"
    },
    {
      icon: UsersIcon,
      title: "Smart Management",
      description: "Comprehensive resident and guard management with automated workflows",
      color: "from-green-500 to-green-600"
    },
    {
      icon: QrCodeIcon,
      title: "Digital Innovation",
      description: "Seamless digital experience with mobile-first design and instant notifications",
      color: "from-purple-500 to-purple-600"
    }
  ];

  const stats = [
    { number: "99.9%", label: "Uptime", suffix: "" },
    { number: "500", label: "Properties", suffix: "+" },
    { number: "50K", label: "Residents", suffix: "+" },
    { number: "24/7", label: "Support", suffix: "" }
  ];

  const testimonials = [
    {
      name: "Ali Muhammed",
      role: "Estate Manager",
      content: "MinnIT transformed our visitor management completely. The efficiency gains are incredible!",
      rating: 5
    },
    {
      name: "Michael Adedeji",
      role: "Security Director", 
      content: "The real-time verification system has enhanced our security protocols significantly.",
      rating: 5
    },
    {
      name: "Fatima Ayoola",
      role: "Resident",
      content: "So easy to invite visitors now. The QR code system is brilliant and user-friendly.",
      rating: 5
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white overflow-hidden">
      {/* Animated BG */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-green-500/10 rounded-full blur-3xl animate-pulse delay-2000"></div>
      </div>

      {/* Navigation */}
      <nav className="relative z-50 px-4 sm:px-6 lg:px-8 py-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className={`flex items-center space-x-3 transition-all duration-1000 ${isVisible ? 'translate-x-0 opacity-100' : '-translate-x-10 opacity-0'}`}>
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
              <ShieldCheckIcon className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              MinnIT
            </span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <a href="#features" className="text-gray-300 hover:text-white transition-colors duration-200">Features</a>
            <a href="#about" className="text-gray-300 hover:text-white transition-colors duration-200">About</a>
            <a href="#testimonials" className="text-gray-300 hover:text-white transition-colors duration-200">Reviews</a>
            <Button
              onClick={onEnterPortal}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-2 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
            >
              Enter Portal
              <ArrowRightIcon className="w-4 h-4 ml-2" />
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg bg-white/10 backdrop-blur-sm"
          >
            {mobileMenuOpen ? <XIcon className="w-6 h-6" /> : <MenuIcon className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden absolute top-full left-0 right-0 bg-slate-900/95 backdrop-blur-xl border-t border-white/10 animate-slide-down">
            <div className="px-4 py-6 space-y-4">
              <a href="#features" className="block text-gray-300 hover:text-white transition-colors duration-200">Features</a>
              <a href="#about" className="block text-gray-300 hover:text-white transition-colors duration-200">About</a>
              <a href="#testimonials" className="block text-gray-300 hover:text-white transition-colors duration-200">Reviews</a>
              <Button
                onClick={onEnterPortal}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300"
              >
                Log In
                <ArrowRightIcon className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 px-4 sm:px-6 lg:px-8 pt-20 pb-32">
        <div className="max-w-7xl mx-auto text-center">
          <div className={`transition-all duration-1000 delay-300 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
              <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-blue-400 bg-clip-text text-transparent animate-pulse">
                Smart Visitor
              </span>
              <br />
              <span className="text-white">Management</span>
            </h1>
            <p className="text-xl sm:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed">
              Revolutionize your property security with visitor management, 
              real-time verification, and seamless digital experiences.
            </p>
          </div>

          <div className={`transition-all duration-1000 delay-500 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
              <Button
                onClick={onEnterPortal}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 rounded-2xl text-lg font-semibold transition-all duration-300 transform hover:scale-105 shadow-2xl hover:shadow-blue-500/25 w-full sm:w-auto"
              >
                <PlayIcon className="w-5 h-5 mr-2" />
                Log In
              </Button>
              <Button
                variant="outline"
                className="border-2 border-white/20 text-white hover:bg-white/10 px-8 py-4 rounded-2xl text-lg font-semibold backdrop-blur-sm transition-all duration-300 w-full sm:w-auto"
              >
                Watch Demo
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 max-w-4xl mx-auto">
              {stats.map((stat, index) => (
                <div
                  key={index}
                  className={`transition-all duration-1000 delay-${700 + index * 100} ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}
                >
                  <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:bg-white/20 transition-all duration-300">
                    <div className="text-2xl sm:text-3xl font-bold text-blue-400 mb-2">
                      {stat.number}{stat.suffix}
                    </div>
                    <div className="text-gray-300 text-sm sm:text-base">{stat.label}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <ChevronDownIcon className="w-8 h-8 text-white/60" />
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="relative z-10 px-4 sm:px-6 lg:px-8 py-32 bg-gradient-to-r from-slate-900/50 to-blue-900/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-5xl font-bold mb-6 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Powerful Features
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Experience the future of property management with our cutting-edge technology
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Feature Cards */}
            <div className="space-y-6">
              {features.map((feature, index) => {
                const IconComponent = feature.icon;
                const isActive = activeFeature === index;
                
                return (
                  <div
                    key={index}
                    className={`p-6 rounded-2xl border transition-all duration-500 cursor-pointer ${
                      isActive 
                        ? 'bg-white/20 border-blue-400/50 shadow-2xl scale-105' 
                        : 'bg-white/5 border-white/10 hover:bg-white/10'
                    }`}
                    onClick={() => setActiveFeature(index)}
                  >
                    <div className="flex items-start space-x-4">
                      <div className={`w-12 h-12 bg-gradient-to-r ${feature.color} rounded-2xl flex items-center justify-center shadow-lg`}>
                        <IconComponent className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold text-white mb-2">{feature.title}</h3>
                        <p className="text-gray-300">{feature.description}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Feature Visualization */}
            <div className="relative">
              <div className="bg-gradient-to-br from-blue-600/20 to-purple-600/20 rounded-3xl p-8 backdrop-blur-sm border border-white/10">
                <div className="aspect-square bg-gradient-to-br from-blue-500/30 to-purple-500/30 rounded-2xl flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-24 h-24 bg-gradient-to-r from-blue-500 to-purple-600 rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-2xl animate-pulse">
                      {React.createElement(features[activeFeature].icon, { className: "w-12 h-12 text-white" })}
                    </div>
                    <h4 className="text-2xl font-bold text-white mb-2">{features[activeFeature].title}</h4>
                    <p className="text-gray-300">{features[activeFeature].description}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="relative z-10 px-4 sm:px-6 lg:px-8 py-32">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-5xl font-bold mb-6 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Trusted by Thousands
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              See what our customers say about their MinnIT experience
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:bg-white/20 transition-all duration-300 transform hover:scale-105"
              >
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <StarIcon key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-300 mb-4 italic">"{testimonial.content}"</p>
                <div>
                  <div className="font-semibold text-white">{testimonial.name}</div>
                  <div className="text-sm text-gray-400">{testimonial.role}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 px-4 sm:px-6 lg:px-8 py-32 bg-gradient-to-r from-blue-600/20 to-purple-600/20 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl sm:text-5xl font-bold mb-6 text-white">
            Ready to Transform Your Property?
          </h2>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Join thousands of properties already using MinnIT to enhance their security and streamline operations.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button
              onClick={onEnterPortal}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 rounded-2xl text-lg font-semibold transition-all duration-300 transform hover:scale-105 shadow-2xl hover:shadow-blue-500/25 w-full sm:w-auto"
            >
              <ShieldCheckIcon className="w-5 h-5 mr-2" />
              Start Your Journey
            </Button>
            <Button
              variant="outline"
              className="border-2 border-white/20 text-white hover:bg-white/10 px-8 py-4 rounded-2xl text-lg font-semibold backdrop-blur-sm transition-all duration-300 w-full sm:w-auto"
            >
              Schedule Demo
            </Button>
          </div>

          <div className="mt-8 flex items-center justify-center space-x-6 text-sm text-gray-400">
            <div className="flex items-center">
              <CheckCircleIcon className="w-4 h-4 mr-2 text-green-400" />
              Free Setup
            </div>
            <div className="flex items-center">
              <CheckCircleIcon className="w-4 h-4 mr-2 text-green-400" />
              24/7 Support
            </div>
            <div className="flex items-center">
              <CheckCircleIcon className="w-4 h-4 mr-2 text-green-400" />
              No Long-term Contracts
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 px-4 sm:px-6 lg:px-8 py-12 border-t border-white/10">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center space-x-3 mb-4 md:mb-0">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                <ShieldCheckIcon className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                MinnIT
              </span>
            </div>
            
            <div className="text-gray-400 text-sm">
              © 2025 MinnIT. All rights reserved. Securing properties Nationwide.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};