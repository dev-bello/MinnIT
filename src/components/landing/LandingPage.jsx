import React, { useState, useEffect } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Modal } from "../ui/modal";
import { db } from "../../lib/supabase";
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
  XIcon,
  LogInIcon,
  UserIcon,
} from "lucide-react";

import { Link } from "react-router-dom";

export const LandingPage = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [activeFeature, setActiveFeature] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  // Pricing calculator state
  const [numResidents, setNumResidents] = useState(30);
  const [numTablets, setNumTablets] = useState(1);
  const [isDemoOpen, setIsDemoOpen] = useState(false);
  const [demoSource, setDemoSource] = useState(null);
  const [demoForm, setDemoForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    organisation: "",
    residents: 30,
    tablets: 1,
    notes: "",
  });
  const [isSubmittingDemo, setIsSubmittingDemo] = useState(false);
  const [demoError, setDemoError] = useState("");
  const [demoSuccess, setDemoSuccess] = useState("");

  useEffect(() => {
    setIsVisible(true);

    // Auto-rotate features
    const interval = setInterval(() => {
      setActiveFeature((prev) => (prev + 1) % 3);
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  const features = [
    {
      icon: ShieldCheckIcon,
      title: "Advanced Security",
      description:
        "State-of-the-art visitor management with QR codes and real-time verification",
      color: "from-blue-500 to-blue-600",
    },
    {
      icon: UsersIcon,
      title: "Smart Management",
      description:
        "Comprehensive resident and guard management with automated workflows",
      color: "from-green-500 to-green-600",
    },
    {
      icon: QrCodeIcon,
      title: "Digital Innovation",
      description:
        "Seamless digital experience with mobile-first design and instant notifications",
      color: "from-purple-500 to-purple-600",
    },
  ];

  const stats = [
    { number: "99.9%", label: "Uptime", suffix: "" },
    { number: "500", label: "Properties", suffix: "+" },
    { number: "50K", label: "Residents", suffix: "+" },
    { number: "24/7", label: "Support", suffix: "" },
  ];

  const testimonials = [
    {
      name: "Bello Yahaya",
      role: "Property Manager",
      content:
        "MinnIT transformed our visitor management completely. The efficiency gains are incredible!",
      rating: 5,
    },
    {
      name: "Yusuf Mohammed",
      role: "Security Director",
      content:
        "The real-time verification system has enhanced our security protocols significantly.",
      rating: 5,
    },
    {
      name: "Yusuf Mohammed",
      role: "Resident",
      content:
        "So easy to invite visitors now. The QR code system is brilliant and user-friendly.",
      rating: 5,
    },
  ];

  // VAMS Pricing Constants
  const HARDWARE_COST_PER_TABLET = 220000; // ₦220,000 per tablet (one-time)
  const SUBSCRIPTION_PER_RESIDENT_PER_MONTH = 7000; // ₦7,000 per resident per month

  const formatPrice = (amount) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const bundleSoftwareFeatures = [
    "Digital visitor logbook",
    "Real-time host notifications (SMS and email)",
    "Secure code-based visitor authentication",
    "Admin dashboard for resident and guard management",
    "Cloud-based data storage and security",
    "Unlimited data connectivity for tablets",
    "Ongoing support, updates and maintenance",
    "On-site onboarding & training included",
  ];

  const hardwareItems = [
    "1 x Tecno tablet with 4G (or equivalent)",
    "Rugged case for durability",
    "SIM card & device configuration (value-add)",
    "On-site onboarding & training (value-add)",
  ];

  const annualSubscription =
    numResidents * SUBSCRIPTION_PER_RESIDENT_PER_MONTH * 12;
  const oneTimeHardware = numTablets * HARDWARE_COST_PER_TABLET;
  const firstYearTotal = annualSubscription + oneTimeHardware;

  const openDemoFromPricing = () => {
    setDemoSource("pricing");
    setDemoForm((prev) => ({
      ...prev,
      residents: Math.max(30, numResidents),
      tablets: Math.max(1, numTablets),
      notes: `Interested in VAMS bundle. First-year estimate: ${formatPrice(
        firstYearTotal
      )}.`,
    }));
    setIsDemoOpen(true);
  };

  const openDemoBlank = (source) => {
    setDemoSource(source || "cta");
    setDemoForm({
      fullName: "",
      email: "",
      phone: "",
      organisation: "",
      residents: 30,
      tablets: 1,
      notes: "",
    });
    setIsDemoOpen(true);
  };

  const submitDemoRequest = async (e) => {
    e?.preventDefault?.();
    try {
      setIsSubmittingDemo(true);
      setDemoError("");
      setDemoSuccess("");

      const payload = {
        full_name: demoForm.fullName,
        email: demoForm.email,
        phone: demoForm.phone,
        organisation: demoForm.organisation,
        residents: Math.max(30, Number(demoForm.residents) || 30),
        tablets: Math.max(1, Number(demoForm.tablets) || 1),
        notes: demoForm.notes,
        source: demoSource || "unknown",
      };

      await db.createDemoRequest(payload);
      setDemoSuccess(
        "Thanks! Your request has been submitted. We will reach out shortly."
      );
      setTimeout(() => setIsDemoOpen(false), 1200);
    } catch (err) {
      console.error("Demo request failed:", err);
      setDemoError("Failed to submit request. Please try again.");
    } finally {
      setIsSubmittingDemo(false);
    }
  };

  const scrollToPricing = () => {
    document.getElementById("pricing")?.scrollIntoView({ behavior: "smooth" });
    setMobileMenuOpen(false);
  };

  const demoCredentials = [
    {
      role: "Admin",
      email: "admin@example.com",
      password: "admin123",
      color: "from-red-500 to-red-600",
      icon: ShieldCheckIcon,
    },
    {
      role: "Guard Alpha",
      email: "guard001@example.com",
      password: "guard123",
      color: "from-blue-500 to-blue-600",
      icon: ShieldCheckIcon,
    },
    {
      role: "Eze (Morning)",
      email: "eze@example.com",
      password: "eze123",
      color: "from-green-500 to-green-600",
      icon: ShieldCheckIcon,
    },
    {
      role: "Bello (Evening)",
      email: "bello@example.com",
      password: "bello123",
      color: "from-purple-500 to-purple-600",
      icon: ShieldCheckIcon,
    },
    {
      role: "Yusuf (Night)",
      email: "yusuf@example.com",
      password: "yusuf123",
      color: "from-orange-500 to-orange-600",
      icon: ShieldCheckIcon,
    },
    {
      role: "Resident",
      email: "resident001@example.com",
      password: "resident123",
      color: "from-indigo-500 to-indigo-600",
      icon: UserIcon,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-green-500/10 rounded-full blur-3xl animate-pulse delay-2000"></div>
      </div>

      {/* Navigation */}
      <nav className="relative z-50 px-4 sm:px-6 lg:px-8 py-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div
            className={`flex items-center space-x-3 transition-all duration-1000 ${
              isVisible
                ? "translate-x-0 opacity-100"
                : "-translate-x-10 opacity-0"
            }`}
          >
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
              <ShieldCheckIcon className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              MinnIT
            </span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <a
              href="#features"
              className="text-gray-300 hover:text-white transition-colors duration-200"
            >
              Features
            </a>
            <button
              onClick={scrollToPricing}
              className="text-gray-300 hover:text-white transition-colors duration-200"
            >
              Pricing
            </button>
            <a
              href="#about"
              className="text-gray-300 hover:text-white transition-colors duration-200"
            >
              About
            </a>
            <a
              href="#testimonials"
              className="text-gray-300 hover:text-white transition-colors duration-200"
            >
              Reviews
            </a>
            <Link to="/login">
              <Button
                variant="outline"
                className="border-2 border-white/20 text-white hover:bg-white/10 px-4 py-2 rounded-xl font-medium transition-all duration-300 backdrop-blur-sm"
              >
                <LogInIcon className="w-4 h-4 mr-2" />
                Login
              </Button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg bg-white/10 backdrop-blur-sm"
          >
            {mobileMenuOpen ? (
              <XIcon className="w-6 h-6" />
            ) : (
              <MenuIcon className="w-6 h-6" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden absolute top-full left-0 right-0 bg-slate-900/95 backdrop-blur-xl border-t border-white/10 animate-slide-down">
            <div className="px-4 py-6 space-y-4">
              <a
                href="#features"
                className="block text-gray-300 hover:text-white transition-colors duration-200"
              >
                Features
              </a>
              <button
                onClick={scrollToPricing}
                className="block text-gray-300 hover:text-white transition-colors duration-200 text-left"
              >
                Pricing
              </button>
              <a
                href="#about"
                className="block text-gray-300 hover:text-white transition-colors duration-200"
              >
                About
              </a>
              <a
                href="#testimonials"
                className="block text-gray-300 hover:text-white transition-colors duration-200"
              >
                Reviews
              </a>
              <Button
                onClick={() => {
                  setMobileMenuOpen(false);
                  openDemoBlank("mobile");
                }}
                variant="outline"
                className="w-full border-2 border-white/20 text-white hover:bg-white/10 px-6 py-3 rounded-xl font-medium transition-all duration-300 backdrop-blur-sm mb-2"
              >
                <LogInIcon className="w-4 h-4 mr-2" />
                Request Demo
              </Button>
              <Link to="/login" className="w-full">
                <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300">
                  Log In
                  <ArrowRightIcon className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 px-4 sm:px-6 lg:px-8 pt-20 pb-32">
        <div className="max-w-7xl mx-auto text-center">
          <div
            className={`transition-all duration-1000 delay-300 ${
              isVisible
                ? "translate-y-0 opacity-100"
                : "translate-y-10 opacity-0"
            }`}
          >
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

          <div
            className={`transition-all duration-1000 delay-500 ${
              isVisible
                ? "translate-y-0 opacity-100"
                : "translate-y-10 opacity-0"
            }`}
          >
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
              <Button
                onClick={() => openDemoBlank("hero")}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 rounded-2xl text-lg font-semibold transition-all duration-300 transform hover:scale-105 shadow-2xl hover:shadow-blue-500/25 w-full sm:w-auto"
              >
                <PlayIcon className="w-5 h-5 mr-2" />
                Request Demo
              </Button>
              <Link to="/login">
                <Button
                  variant="outline"
                  className="border-2 border-white/20 text-white hover:bg-white/10 px-8 py-4 rounded-2xl text-lg font-semibold backdrop-blur-sm transition-all duration-300 w-full sm:w-auto"
                >
                  Log In
                </Button>
              </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 max-w-4xl mx-auto">
              {stats.map((stat, index) => (
                <div
                  key={index}
                  className={`transition-all duration-1000 delay-${
                    700 + index * 100
                  } ${
                    isVisible
                      ? "translate-y-0 opacity-100"
                      : "translate-y-10 opacity-0"
                  }`}
                >
                  <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:bg-white/20 transition-all duration-300">
                    <div className="text-2xl sm:text-3xl font-bold text-blue-400 mb-2">
                      {stat.number}
                      {stat.suffix}
                    </div>
                    <div className="text-gray-300 text-sm sm:text-base">
                      {stat.label}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <ChevronDownIcon className="w-8 h-8 text-white/60" />
        </div>
      </section>

      {/* Features Section */}
      <section
        id="features"
        className="relative z-10 px-4 sm:px-6 lg:px-8 py-32 bg-gradient-to-r from-slate-900/50 to-blue-900/50 backdrop-blur-sm"
      >
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-5xl font-bold mb-6 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Powerful Features
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Experience the future of property management with our cutting-edge
              technology
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
                        ? "bg-white/20 border-blue-400/50 shadow-2xl scale-105"
                        : "bg-white/5 border-white/10 hover:bg-white/10"
                    }`}
                    onClick={() => setActiveFeature(index)}
                  >
                    <div className="flex items-start space-x-4">
                      <div
                        className={`w-12 h-12 bg-gradient-to-r ${feature.color} rounded-2xl flex items-center justify-center shadow-lg`}
                      >
                        <IconComponent className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold text-white mb-2">
                          {feature.title}
                        </h3>
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
                      {React.createElement(features[activeFeature].icon, {
                        className: "w-12 h-12 text-white",
                      })}
                    </div>
                    <h4 className="text-2xl font-bold text-white mb-2">
                      {features[activeFeature].title}
                    </h4>
                    <p className="text-gray-300">
                      {features[activeFeature].description}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section
        id="about"
        className="relative z-10 px-4 sm:px-6 lg:px-8 py-24 bg-gradient-to-r from-blue-900/60 to-purple-900/60 backdrop-blur-sm"
      >
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-10 border border-white/20 shadow-2xl">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              About MinnIT
            </h2>
            <p className="text-lg text-gray-200 mb-6 text-justify">
              MinnIT is a modern digital platform designed to revolutionize
              visitor management and property security for residential
              communities, estates, and properties. Our mission is to empower
              property managers, residents, and security teams with seamless,
              secure, and efficient tools for managing visitors, verifying
              access, and enhancing community safety.
            </p>
            <p className="text-base text-gray-300 text-justify">
              With real-time verification, QR code technology, automated
              workflows, and instant notifications, MinnIT streamlines the
              entire process of welcoming guests and safeguarding your property.
              Experience the future of property management—secure, smart, and
              effortless.
            </p>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section
        id="pricing"
        className="relative z-10 px-4 sm:px-6 lg:px-8 py-32"
      >
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-5xl font-bold mb-6 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Proposed Pricing Bundle: The VAMS Solution
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-8">
              Transparent bundle with a one-time hardware setup and an
              all-inclusive annual software subscription.
            </p>
          </div>

          {/* VAMS Pricing Bundle */}
          <div className="space-y-12">
            {/* 1. One-Time Hardware & Setup Fee */}
            <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-8 border border-white/20">
              <h3 className="text-2xl font-bold text-white mb-2">
                1. One-Time Hardware & Setup Fee
              </h3>
              <p className="text-gray-300 mb-6">
                Upfront cost for physical hardware and professional onboarding.
              </p>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-lg font-semibold text-white mb-3">
                    Items Included
                  </h4>
                  <ul className="space-y-3">
                    {hardwareItems.map((item, idx) => (
                      <li key={idx} className="flex items-start">
                        <CheckCircleIcon className="w-5 h-5 text-green-400 mr-3 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-300">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
                  <div className="text-sm text-gray-400 mb-2">
                    Cost per tablet
                  </div>
                  <div className="text-4xl font-bold text-white mb-4">
                    {formatPrice(HARDWARE_COST_PER_TABLET)}
                  </div>
                  <div className="space-y-3">
                    <label className="block text-sm text-gray-300">
                      Number of tablets (min 1)
                    </label>
                    <Input
                      type="number"
                      min={1}
                      value={numTablets}
                      onChange={(e) =>
                        setNumTablets(Math.max(1, Number(e.target.value)))
                      }
                      className="bg-white/10 border-white/20 text-white"
                    />
                    <div className="text-gray-300 mt-2">
                      One-time total:{" "}
                      <span className="font-semibold text-white">
                        {formatPrice(oneTimeHardware)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 2. Annual All-Inclusive Subscription */}
            <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-8 border border-white/20">
              <h3 className="text-2xl font-bold text-white mb-2">
                2. Annual All-Inclusive Subscription
              </h3>
              <p className="text-gray-300 mb-6">
                Single annual fee covering software access and all operational
                costs, including data.
              </p>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-lg font-semibold text-white mb-3">
                    What you get
                  </h4>
                  <ul className="space-y-3">
                    {bundleSoftwareFeatures.map((feature, idx) => (
                      <li key={idx} className="flex items-start">
                        <CheckCircleIcon className="w-5 h-5 text-green-400 mr-3 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-300">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
                  <div className="text-sm text-gray-400 mb-2">
                    Price per resident per month
                  </div>
                  <div className="text-4xl font-bold text-white mb-4">
                    {formatPrice(SUBSCRIPTION_PER_RESIDENT_PER_MONTH)}
                    <span className="text-lg text-gray-300 font-normal">
                      /month
                    </span>
                  </div>
                  <div className="space-y-3">
                    <label className="block text-sm text-gray-300">
                      Number of residents (min 30)
                    </label>
                    <Input
                      type="number"
                      min={30}
                      value={numResidents}
                      onChange={(e) =>
                        setNumResidents(Math.max(30, Number(e.target.value)))
                      }
                      className="bg-white/10 border-white/20 text-white"
                    />
                    <div className="text-gray-300 mt-2">
                      Annual subscription:{" "}
                      <span className="font-semibold text-white">
                        {formatPrice(annualSubscription)}
                      </span>
                    </div>
                    <div className="text-sm text-gray-400">
                      Calculation: (
                      {formatPrice(SUBSCRIPTION_PER_RESIDENT_PER_MONTH)} x
                      residents) x 12
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Totals Illustration */}
            <div className="bg-gradient-to-br from-blue-600/20 to-purple-600/20 backdrop-blur-sm rounded-3xl p-8 border border-blue-400/30">
              <h3 className="text-2xl font-bold text-white mb-4">
                Total Cost of the Whole Bundle (Currently)
              </h3>
              <p className="text-gray-300 mb-6">
                Example for{" "}
                <span className="font-semibold text-white">{numResidents}</span>{" "}
                residents and{" "}
                <span className="font-semibold text-white">{numTablets}</span>{" "}
                tablet{numTablets === 1 ? "" : "s"} for a full year.
              </p>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
                  <div className="text-sm text-gray-400 mb-1">
                    One-Time Hardware & Setup Fee
                  </div>
                  <div className="text-3xl font-bold text-white">
                    {formatPrice(oneTimeHardware)}
                  </div>
                </div>
                <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
                  <div className="text-sm text-gray-400 mb-1">
                    Annual All-Inclusive SaaS Subscription
                  </div>
                  <div className="text-3xl font-bold text-white">
                    {formatPrice(annualSubscription)}
                  </div>
                </div>
                <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
                  <div className="text-sm text-gray-400 mb-1">
                    Total First-Year Cost
                  </div>
                  <div className="text-3xl font-bold text-white">
                    {formatPrice(firstYearTotal)}
                  </div>
                </div>
              </div>
              <div className="text-center text-gray-300 mt-6">
                In subsequent years, hardware is not recharged unless new
                tablets are required. The subscription remains a single
                predictable line item.
              </div>
            </div>

            <div className="max-w-md mx-auto">
              <Button
                onClick={openDemoFromPricing}
                className="w-full py-4 rounded-xl font-semibold transition-all duration-300 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white text-lg"
              >
                Get Started
              </Button>
            </div>
          </div>

          {/* Key Benefits */}
          <div className="text-center mt-16">
            <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
                <CheckCircleIcon className="w-12 h-12 text-green-400 mx-auto mb-4" />
                <h4 className="text-lg font-semibold text-white mb-2">
                  Unlimited Data Included
                </h4>
                <p className="text-gray-300 text-sm">
                  We cover tablet data costs for seamless operation.
                </p>
              </div>
              <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
                <CheckCircleIcon className="w-12 h-12 text-green-400 mx-auto mb-4" />
                <h4 className="text-lg font-semibold text-white mb-2">
                  On-site Training
                </h4>
                <p className="text-gray-300 text-sm">
                  Our team trains guards and management on-site.
                </p>
              </div>
              <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
                <CheckCircleIcon className="w-12 h-12 text-green-400 mx-auto mb-4" />
                <h4 className="text-lg font-semibold text-white mb-2">
                  Support & Updates
                </h4>
                <p className="text-gray-300 text-sm">
                  Continuous support, maintenance and improvements.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section
        id="testimonials"
        className="relative z-10 px-4 sm:px-6 lg:px-8 py-32 bg-gradient-to-r from-slate-900/50 to-blue-900/50 backdrop-blur-sm"
      >
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
                    <StarIcon
                      key={i}
                      className="w-5 h-5 text-yellow-400 fill-current"
                    />
                  ))}
                </div>
                <p className="text-gray-300 mb-4 italic">
                  "{testimonial.content}"
                </p>
                <div>
                  <div className="font-semibold text-white">
                    {testimonial.name}
                  </div>
                  <div className="text-sm text-gray-400">
                    {testimonial.role}
                  </div>
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
            Join thousands of properties already using MinnIT to enhance their
            security and streamline operations.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/login">
              <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 rounded-2xl text-lg font-semibold transition-all duration-300 transform hover:scale-105 shadow-2xl hover:shadow-blue-500/25 w-full sm:w-auto">
                <ShieldCheckIcon className="w-5 h-5 mr-2" />
                Start Your Journey
              </Button>
            </Link>
            <Button
              variant="outline"
              onClick={() => openDemoBlank("cta")}
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
              © 2025 <a href="#">Voxcle Solutions</a>. All rights reserved.
              Securing properties worldwide.
            </div>
          </div>
        </div>
      </footer>
      {/* Request Demo Modal */}
      <Modal
        isOpen={isDemoOpen}
        onClose={() => setIsDemoOpen(false)}
        size="md"
        title="Request a Demo"
        align="start"
      >
        <form
          onSubmit={submitDemoRequest}
          className="bg-white rounded-2xl p-6 border border-neutral-200"
        >
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-neutral-700 mb-1">
                Full Name
              </label>
              <Input
                value={demoForm.fullName}
                onChange={(e) =>
                  setDemoForm({ ...demoForm, fullName: e.target.value })
                }
                required
                className="bg-white border-neutral-300 text-neutral-800"
              />
            </div>
            <div>
              <label className="block text-sm text-neutral-700 mb-1">
                Email
              </label>
              <Input
                type="email"
                value={demoForm.email}
                onChange={(e) =>
                  setDemoForm({ ...demoForm, email: e.target.value })
                }
                required
                className="bg-white border-neutral-300 text-neutral-800"
              />
            </div>
            <div>
              <label className="block text-sm text-neutral-700 mb-1">
                Phone
              </label>
              <Input
                value={demoForm.phone}
                onChange={(e) =>
                  setDemoForm({ ...demoForm, phone: e.target.value })
                }
                className="bg-white border-neutral-300 text-neutral-800"
              />
            </div>
            <div>
              <label className="block text-sm text-neutral-700 mb-1">
                Organisation
              </label>
              <Input
                value={demoForm.organisation}
                onChange={(e) =>
                  setDemoForm({ ...demoForm, organisation: e.target.value })
                }
                className="bg-white border-neutral-300 text-neutral-800"
              />
            </div>
            <div>
              <label className="block text-sm text-neutral-700 mb-1">
                Residents (min 30)
              </label>
              <Input
                type="number"
                min={30}
                value={demoForm.residents}
                onChange={(e) =>
                  setDemoForm({
                    ...demoForm,
                    residents: Math.max(30, Number(e.target.value)),
                  })
                }
                className="bg-white border-neutral-300 text-neutral-800"
              />
            </div>
            <div>
              <label className="block text-sm text-neutral-700 mb-1">
                Tablets (min 1)
              </label>
              <Input
                type="number"
                min={1}
                value={demoForm.tablets}
                onChange={(e) =>
                  setDemoForm({
                    ...demoForm,
                    tablets: Math.max(1, Number(e.target.value)),
                  })
                }
                className="bg-white border-neutral-300 text-neutral-800"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm text-neutral-700 mb-1">
                Notes
              </label>
              <textarea
                value={demoForm.notes}
                onChange={(e) =>
                  setDemoForm({ ...demoForm, notes: e.target.value })
                }
                rows={4}
                className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm text-neutral-800"
              />
            </div>
          </div>
          {demoError && (
            <div className="mt-3 text-sm text-red-600">{demoError}</div>
          )}
          {demoSuccess && (
            <div className="mt-3 text-sm text-green-600">{demoSuccess}</div>
          )}
          <div className="mt-6 flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsDemoOpen(false)}
              className="border-neutral-300 text-neutral-700"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmittingDemo}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
            >
              {isSubmittingDemo ? "Submitting…" : "Submit Request"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
