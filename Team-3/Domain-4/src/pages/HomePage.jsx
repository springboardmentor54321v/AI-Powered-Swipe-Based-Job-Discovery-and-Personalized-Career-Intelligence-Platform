import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Compass,
  FileText,
  LayoutDashboard,
  ArrowRight,
  CheckCircle2,
  Zap,
  ShieldCheck,
  Briefcase,
  Users,
  Check,
  X,
  Target,
  ChevronDown,
  Building,
  Sparkles,
  Search,
  SlidersHorizontal,
  Lock,
  Globe,
  TrendingUp,
  Award
} from 'lucide-react';
import Button from '../components/common/Button';
import Chip from '../components/common/Chip';
import authService from '../services/auth';

const ROTATING_PHRASES = [
  'Intuitive Swipe Matchmaking',
  'Instant Resume Scoring',
  'Transparent Salary Insights',
  'Direct Recruiter Connections',
  'Zero Form Fatigue',
];

export default function HomePage() {
  const navigate = useNavigate();

  // Rotating Headline Phrase Animation State
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setIsTransitioning(true);
      setTimeout(() => {
        setPhraseIndex((prev) => (prev + 1) % ROTATING_PHRASES.length);
        setIsTransitioning(false);
      }, 350);
    }, 2800);

    return () => clearInterval(timer);
  }, []);

  // Reactive Auth State
  const [session, setSession] = useState(() => authService.getSession());

  useEffect(() => {
    const unsubscribe = authService.subscribe((updated) => {
      setSession(updated);
    });
    return unsubscribe;
  }, []);

  const isAuthenticated = Boolean(session && session.access_token);

  // Interactive Gesture Demo Card State
  const [demoState, setDemoState] = useState('center'); // 'left' | 'right' | 'center'
  const [demoCount, setDemoCount] = useState({ saved: 0, passed: 0 });

  // Persona Tab State
  const [activeTab, setActiveTab] = useState('candidates'); // 'candidates' | 'employers'

  // FAQ Accordion State
  const [openFaq, setOpenFaq] = useState(null);

  const toggleFaq = (index) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const handleDemoGesture = (direction) => {
    setDemoState(direction);
    setDemoCount((prev) => ({
      saved: direction === 'right' ? prev.saved + 1 : prev.saved,
      passed: direction === 'left' ? prev.passed + 1 : prev.passed,
    }));

    setTimeout(() => {
      setDemoState('center');
    }, 600);
  };

  const faqs = [
    {
      question: 'What is SwipeX and how does it work?',
      answer: 'SwipeX is an intuitive job discovery platform by Infosys. It replaces long forms and endless job board scrolling with a high-velocity swipe interface: swipe right to save or apply to a verified position, and swipe left to skip to the next opportunity.'
    },
    {
      question: 'Why is SwipeX a product of Infosys?',
      answer: 'SwipeX is developed under the Infosys Springboard initiative to modernize digital recruitment, providing candidates and recruiters with enterprise-grade reliability, transparent compensation visibility, and secure candidate data privacy.'
    },
    {
      question: 'How does ATS resume compatibility help my application?',
      answer: 'When you upload your resume, SwipeX automatically parses your verified skill keywords and benchmarks them against specific requisition requirements. It highlights your keyword match readiness and identifies gaps before you interview.'
    },
    {
      question: 'Can recruiters directly source candidates on SwipeX?',
      answer: 'Yes! When a job seeker swipes right on a requisition, their profile is instantly ingested into the recruiter’s active pipeline for that role, eliminating weeks of resume screening delays.'
    },
    {
      question: 'Is candidate data and privacy protected?',
      answer: 'Absolutely. Built on Infosys enterprise architecture principles, all profile details and uploaded documents are encrypted and managed under strict enterprise data protection standards.'
    }
  ];

  return (
    <div className="space-y-20 sm:space-y-28 py-6 sm:py-10 overflow-x-hidden w-full">

      {/* ========================================================= */}
      {/* 1. HERO SECTION WITH INFOSYS BRANDING */}
      {/* ========================================================= */}
      <section className="relative text-center max-w-4xl mx-auto space-y-8 pt-2">
        {/* Ambient Gradient Glows */}
        <div 
          className="absolute -top-16 left-1/2 -translate-x-1/2 w-[550px] max-w-[90vw] h-[350px] bg-gradient-to-r from-primary/20 via-[#0070ad]/15 to-purple-600/10 rounded-full blur-3xl pointer-events-none -z-10 animate-glow-pulse" 
          aria-hidden="true" 
        />

        {/* Official Infosys Product Badge */}
        <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-surface-elevated/90 border border-outline-variant/90 shadow-md backdrop-blur-sm text-xs font-medium text-content transition-transform hover:scale-105">
          <span className="flex h-2.5 w-2.5 rounded-full bg-[#0070ad] shadow-sm shadow-[#0070ad]" />
          <span className="text-[#0070ad] font-bold tracking-wide">Infosys Springboard</span>
          <span className="text-content-subtle">•</span>
          <span className="text-content-muted">A Product of Infosys</span>
        </div>

        {/* Main Headline with Smooth Rotating Phrase Animation */}
        <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-content leading-[1.14]">
          Reinventing Job Discovery With <br className="hidden sm:inline" />
          <span className="inline-block relative min-h-[1.25em] overflow-hidden align-bottom">
            <span
              key={phraseIndex}
              className={`inline-block animated-gradient-text transition-all duration-300 ease-out transform ${
                isTransitioning
                  ? 'opacity-0 -translate-y-4 scale-95'
                  : 'opacity-100 translate-y-0 scale-100'
              }`}
            >
              {ROTATING_PHRASES[phraseIndex]}
            </span>
          </span>
        </h1>

        {/* Value Proposition */}
        <p className="text-base sm:text-xl text-content-muted max-w-2xl mx-auto leading-relaxed">
          SwipeX transforms career discovery into a frictionless, gesture-driven experience. 
          Swipe right on opportunities that align with your ambitions, get instant ATS resume 
          readiness insights, and connect directly with hiring teams.
        </p>

        {/* Primary Dynamic CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-2">
          {isAuthenticated ? (
            <Button
              size="lg"
              variant="filled"
              icon={LayoutDashboard}
              onClick={() => navigate('/dashboard')}
              className="w-full sm:w-auto font-semibold shadow-sm"
            >
              Go to Dashboard
            </Button>
          ) : (
            <>
              <Button
                size="lg"
                variant="filled"
                icon={ArrowRight}
                onClick={() => navigate('/register')}
                className="w-full sm:w-auto shadow-lg shadow-primary/25 hover:shadow-primary/40 font-semibold"
              >
                Get Started Free
              </Button>
              <Button
                size="lg"
                variant="tonal"
                onClick={() => navigate('/login')}
                className="w-full sm:w-auto"
              >
                Sign In to Account
              </Button>
              <a
                href="#what-is-swipex"
                className="inline-flex items-center gap-1.5 px-4 py-3 text-xs font-medium text-content-muted hover:text-content transition-colors"
              >
                <span>Learn how it works</span>
                <ChevronDown className="w-3.5 h-3.5" />
              </a>
            </>
          )}
        </div>

        {/* Value Metrics Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-6 max-w-3xl mx-auto text-left">
          <div className="surface-card-subtle flex items-center gap-3 hover-lift">
            <div className="p-2 rounded-xl bg-primary/10 text-primary">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-content">1-Swipe Match</div>
              <div className="text-[11px] text-content-subtle">No 40-minute forms</div>
            </div>
          </div>

          <div className="surface-card-subtle flex items-center gap-3 hover-lift">
            <div className="p-2 rounded-xl bg-[#0070ad]/15 text-[#0070ad]">
              <Target className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-content">ATS Compatibility</div>
              <div className="text-[11px] text-content-subtle">Instant skill scoring</div>
            </div>
          </div>

          <div className="surface-card-subtle flex items-center gap-3 hover-lift">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
              <TrendingUp className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-content">Full Transparency</div>
              <div className="text-[11px] text-content-subtle">Upfront salary & mode</div>
            </div>
          </div>

          <div className="surface-card-subtle flex items-center gap-3 hover-lift">
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-content">Infosys Security</div>
              <div className="text-[11px] text-content-subtle">Enterprise standards</div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* 2. INTERACTIVE CONCEPT SHOWCASE (ANIMATED SWIPE MECHANISM) */}
      {/* ========================================================= */}
      <section className="surface-card relative overflow-hidden border-outline/80">
        <div className="max-w-3xl mx-auto space-y-6">
          <div className="text-center space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-primary/10 text-primary text-xs font-semibold">
              <Compass className="w-3.5 h-3.5" />
              Interactive Gesture Preview
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-content">
              How the Swipe Match Works
            </h2>
            <p className="text-xs sm:text-sm text-content-muted max-w-lg mx-auto">
              Test the tactile gesture mechanism below. Discover how effortless passing on unwanted listings or saving dream roles can be.
            </p>
          </div>

          {/* Interactive Concept Card Stage */}
          <div className="relative min-h-[300px] flex items-center justify-center p-4">
            
            {/* Ambient Animated Glow behind the card */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-72 h-44 bg-primary/10 rounded-full blur-2xl animate-pulse" />
            </div>

            {/* Gesture Card */}
            <div 
              className={`w-full max-w-md surface-card-subtle bg-surface-high border-outline shadow-2xl transition-all duration-500 transform ${
                demoState === 'left'
                  ? '-translate-x-32 -rotate-12 opacity-30 border-red-500/40'
                  : demoState === 'right'
                  ? 'translate-x-32 rotate-12 opacity-30 border-emerald-500/40'
                  : 'translate-x-0 rotate-0 opacity-100 hover:scale-[1.01]'
              }`}
            >
              {/* Card Meta Header */}
              <div className="flex items-center justify-between pb-3 border-b border-outline-variant/60">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-xs font-bold text-content uppercase tracking-wider">Opportunity Match</span>
                </div>
                <div className="px-2.5 py-1 rounded-full bg-primary/10 text-primary text-[11px] font-semibold">
                  92% Compatibility Fit
                </div>
              </div>

              {/* Sample Card Body */}
              <div className="py-4 space-y-3">
                <div className="space-y-1">
                  <div className="text-xs font-medium text-content-muted">Role & Department</div>
                  <h3 className="text-lg font-bold text-content">Cloud Solutions Architect</h3>
                  <div className="text-xs text-primary font-medium flex items-center gap-1.5">
                    <Building className="w-3.5 h-3.5" />
                    <span>Global Technology Enterprise</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs py-2 px-3 rounded-xl bg-surface-container/70 border border-outline-variant/50">
                  <div>
                    <span className="text-content-subtle text-[11px]">Work Arrangement</span>
                    <p className="font-semibold text-content">Remote • Worldwide</p>
                  </div>
                  <div>
                    <span className="text-content-subtle text-[11px]">Compensation</span>
                    <p className="font-semibold text-emerald-400">$130,000 - $160,000</p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-1.5 pt-1">
                  <Chip variant="neutral">Architecture</Chip>
                  <Chip variant="neutral">Cloud Platforms</Chip>
                  <Chip variant="neutral">DevOps</Chip>
                  <Chip variant="primary">ATS Keyword Match</Chip>
                </div>
              </div>

              {/* Interactive Buttons */}
              <div className="grid grid-cols-2 gap-3 pt-3 border-t border-outline-variant">
                <button
                  type="button"
                  onClick={() => handleDemoGesture('left')}
                  className="flex items-center justify-center gap-2 py-2.5 rounded-xl border border-red-500/30 bg-red-500/10 hover:bg-red-500/20 text-red-300 text-xs font-semibold transition-all active:scale-95 group"
                >
                  <X className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
                  <span>Pass (Swipe Left)</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleDemoGesture('right')}
                  className="flex items-center justify-center gap-2 py-2.5 rounded-xl border border-emerald-500/30 bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 text-xs font-semibold transition-all active:scale-95 group"
                >
                  <Check className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                  <span>Match & Save (Right)</span>
                </button>
              </div>
            </div>
          </div>

          {/* Interactive Counter Feedback */}
          <div className="flex items-center justify-between pt-2 text-xs text-content-muted border-t border-outline-variant/60 px-2">
            <div className="flex items-center gap-4">
              <span>Demo Roles Saved: <strong className="text-emerald-400 font-bold">{demoCount.saved}</strong></span>
              <span>Passed: <strong className="text-red-400 font-bold">{demoCount.passed}</strong></span>
            </div>

            <div className="text-[11px] text-content-subtle">
              Pointer & touch gesture enabled
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* 3. WHAT IS SWIPEX? (THE PLATFORM CONCEPT) */}
      {/* ========================================================= */}
      <section id="what-is-swipex" className="space-y-8 scroll-mt-24">
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-primary uppercase tracking-widest">
            Platform Overview
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-content">
            What Is SwipeX?
          </h2>
          <p className="text-sm text-content-muted leading-relaxed">
            SwipeX is a next-generation employment discovery platform created to solve the fatigue of modern job hunting. 
            By replacing static, multi-page application boards with a tactile swipe deck, SwipeX connects candidates and 
            hiring managers with clarity and unprecedented speed.
          </p>
        </div>

        {/* 3 Core Architecture Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="surface-card space-y-4 hover-lift group cursor-default">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-surface transition-all">
              <Compass className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-content">Tactile Swipe Discovery</h3>
            <p className="text-xs sm:text-sm text-content-muted leading-relaxed">
              Explore opportunities through curated, responsive cards. Swipe right to bookmark and express interest; swipe left to move forward. Zero clutter, zero unnecessary clicks.
            </p>
            <div className="pt-2 border-t border-outline-variant/60 text-xs text-content-subtle flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span>Fluid gesture controls on mobile & desktop</span>
            </div>
          </div>

          <div className="surface-card space-y-4 hover-lift group cursor-default">
            <div className="w-12 h-12 rounded-2xl bg-[#0070ad]/15 flex items-center justify-center text-[#0070ad] group-hover:bg-[#0070ad] group-hover:text-white transition-all">
              <FileText className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-content">ATS Compatibility Readiness</h3>
            <p className="text-xs sm:text-sm text-content-muted leading-relaxed">
              Upload your resume to extract skills and instantly benchmark your profile against real job descriptions. Identify missing keywords to elevate your interview conversion.
            </p>
            <div className="pt-2 border-t border-outline-variant/60 text-xs text-content-subtle flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span>Actionable keyword gap recommendations</span>
            </div>
          </div>

          <div className="surface-card space-y-4 hover-lift group cursor-default">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 group-hover:bg-emerald-500 group-hover:text-surface transition-all">
              <TrendingUp className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-content">Upfront Transparency</h3>
            <p className="text-xs sm:text-sm text-content-muted leading-relaxed">
              Every card explicitly reveals salary bands, workplace flexibility (Remote, On-site, Hybrid), and essential required qualifications before you invest your time.
            </p>
            <div className="pt-2 border-t border-outline-variant/60 text-xs text-content-subtle flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span>No hidden salaries or vague expectations</span>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* 4. WHY SWIPEX? (LEGACY VS MODERN COMPARISON) */}
      {/* ========================================================= */}
      <section className="space-y-8">
        <div className="text-center space-y-2 max-w-xl mx-auto">
          <div className="text-xs font-bold text-[#0070ad] uppercase tracking-widest">
            The Industry Shift
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-content">
            Why We Built SwipeX
          </h2>
          <p className="text-xs sm:text-sm text-content-muted">
            The traditional hiring process is broken for both sides. Here is how SwipeX fixes it.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Legacy Job Search */}
          <div className="surface-card space-y-5 border-red-500/20 bg-red-950/10">
            <div className="flex items-center gap-2.5 text-red-400 font-bold text-base">
              <div className="p-2 rounded-xl bg-red-500/10">
                <X className="w-5 h-5 text-red-400" />
              </div>
              <span>Traditional Job Boards</span>
            </div>

            <ul className="space-y-3 text-xs sm:text-sm text-content-muted">
              <li className="flex items-start gap-2.5">
                <span className="text-red-400 font-bold mt-0.5">✕</span>
                <span>45-minute repetitive forms asking for data already present in your resume.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-red-400 font-bold mt-0.5">✕</span>
                <span>Opaque compensation disclosures with "Competitive Salary" placeholders.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-red-400 font-bold mt-0.5">✕</span>
                <span>Applications disappear into ATS black holes with zero feedback or status updates.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-red-400 font-bold mt-0.5">✕</span>
                <span>Recruiters spend days sifting through hundreds of mismatched resumes.</span>
              </li>
            </ul>
          </div>

          {/* The SwipeX Experience */}
          <div className="surface-card space-y-5 border-emerald-500/30 bg-emerald-950/10 shadow-lg shadow-emerald-500/5">
            <div className="flex items-center gap-2.5 text-emerald-400 font-bold text-base">
              <div className="p-2 rounded-xl bg-emerald-500/10">
                <Check className="w-5 h-5 text-emerald-400" />
              </div>
              <span>The SwipeX Standard</span>
            </div>

            <ul className="space-y-3 text-xs sm:text-sm text-content">
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                <span>Single-swipe application: profile and skills transmit instantly upon right-swipe.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                <span>Transparent compensation ranges and verified workplace modes on every position.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                <span>Objective ATS keyword gap diagnostics so you know your compatibility upfront.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                <span>Direct recruiter applicant ingestion stream for faster screening and decisions.</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* 5. A PRODUCT OF INFOSYS (ENTERPRISE HERITAGE & TRUST) */}
      {/* ========================================================= */}
      <section className="surface-card relative overflow-hidden border-[#0070ad]/40 bg-gradient-to-br from-surface-container via-surface-elevated to-surface-high space-y-8">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-6 border-b border-outline-variant/80">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#0070ad]/15 text-[#0070ad] text-xs font-bold uppercase tracking-wider mb-2">
              Enterprise Excellence
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-content">
              A Product of Infosys
            </h2>
          </div>
          <div className="text-xs text-content-muted font-medium bg-surface-container px-4 py-2 rounded-xl border border-outline-variant">
            Infosys Springboard Initiative
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2.5">
            <div className="w-10 h-10 rounded-xl bg-[#0070ad]/15 text-[#0070ad] flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h4 className="text-base font-bold text-content">Enterprise Security</h4>
            <p className="text-xs sm:text-sm text-content-muted leading-relaxed">
              Engineered with world-class security protocols, encrypted resume storage, and robust identity access management.
            </p>
          </div>

          <div className="space-y-2.5">
            <div className="w-10 h-10 rounded-xl bg-purple-500/15 text-purple-400 flex items-center justify-center">
              <Globe className="w-5 h-5" />
            </div>
            <h4 className="text-base font-bold text-content">Infosys Springboard</h4>
            <p className="text-xs sm:text-sm text-content-muted leading-relaxed">
              Designed as part of Infosys's mission to bridge education, skills, and industry employment through human-centered digital tools.
            </p>
          </div>

          <div className="space-y-2.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center">
              <Award className="w-5 h-5" />
            </div>
            <h4 className="text-base font-bold text-content">Reliable Engineering</h4>
            <p className="text-xs sm:text-sm text-content-muted leading-relaxed">
              Built on scalable, microservice-based architecture ensuring high reliability, low-latency swiping, and global uptime.
            </p>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* 6. HOW IT WORKS (3-STEP GUIDED JOURNEY) */}
      {/* ========================================================= */}
      <section className="space-y-8">
        <div className="text-center space-y-2 max-w-xl mx-auto">
          <div className="text-xs font-bold text-primary uppercase tracking-widest">
            Simple 3-Step Journey
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-content">
            From Profile to Job Offer
          </h2>
          <p className="text-xs sm:text-sm text-content-muted">
            Three straightforward steps to accelerate your hiring trajectory.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Step 1 */}
          <div className="surface-card space-y-4 relative group hover-lift cursor-default">
            <div className="w-10 h-10 rounded-2xl bg-primary text-surface font-black text-base flex items-center justify-center shadow-md">
              1
            </div>
            <h4 className="text-base font-bold text-content">Upload Your Resume</h4>
            <p className="text-xs sm:text-sm text-content-muted leading-relaxed">
              Upload your PDF or DOCX file. The platform automatically extracts your technical capabilities, tools, and domain keywords into your profile.
            </p>
          </div>

          {/* Step 2 */}
          <div className="surface-card space-y-4 relative group hover-lift cursor-default">
            <div className="w-10 h-10 rounded-2xl bg-primary text-surface font-black text-base flex items-center justify-center shadow-md">
              2
            </div>
            <h4 className="text-base font-bold text-content">Swipe & Discover</h4>
            <p className="text-xs sm:text-sm text-content-muted leading-relaxed">
              Review transparent job cards tailored to your target compensation and preferred mode. Swipe right on positions you like; skip those that don't fit.
            </p>
          </div>

          {/* Step 3 */}
          <div className="surface-card space-y-4 relative group hover-lift cursor-default">
            <div className="w-10 h-10 rounded-2xl bg-primary text-surface font-black text-base flex items-center justify-center shadow-md">
              3
            </div>
            <h4 className="text-base font-bold text-content">Track & Interview</h4>
            <p className="text-xs sm:text-sm text-content-muted leading-relaxed">
              Monitor your saved roles and applications in real time. Inspect your ATS compatibility score and connect directly with hiring teams.
            </p>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* 7. PURPOSE-BUILT FOR CANDIDATES AND EMPLOYERS */}
      {/* ========================================================= */}
      <section className="space-y-6">
        <div className="text-center space-y-2 max-w-xl mx-auto">
          <div className="text-xs font-bold text-primary uppercase tracking-widest">
            Dual Ecosystem
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-content">
            Built for Both Sides of Hiring
          </h2>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center justify-center gap-2 p-1.5 rounded-2xl bg-surface-container max-w-xs mx-auto border border-outline-variant">
          <button
            type="button"
            onClick={() => setActiveTab('candidates')}
            className={`flex-1 py-2 px-4 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'candidates'
                ? 'bg-primary text-surface shadow-sm'
                : 'text-content-muted hover:text-content'
            }`}
          >
            For Candidates
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('employers')}
            className={`flex-1 py-2 px-4 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'employers'
                ? 'bg-primary text-surface shadow-sm'
                : 'text-content-muted hover:text-content'
            }`}
          >
            For Employers
          </button>
        </div>

        {/* Tab Content Display */}
        <div className="surface-card max-w-3xl mx-auto border-outline">
          {activeTab === 'candidates' ? (
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-content">Speed and Transparency for Job Seekers</h3>
              <p className="text-xs sm:text-sm text-content-muted leading-relaxed">
                Take control of your job search without the exhaustion of repetitive forms and invisible applicant queues.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div className="surface-card-subtle text-xs flex items-center gap-2.5 text-content">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span>Instant 1-gesture swipe applications</span>
                </div>
                <div className="surface-card-subtle text-xs flex items-center gap-2.5 text-content">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span>Objective ATS keyword gap diagnostics</span>
                </div>
                <div className="surface-card-subtle text-xs flex items-center gap-2.5 text-content">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span>Complete salary and workplace mode clarity</span>
                </div>
                <div className="surface-card-subtle text-xs flex items-center gap-2.5 text-content">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span>Live tracking of saved & applied positions</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-content">High-Velocity Candidate Ingestion for Hiring Teams</h3>
              <p className="text-xs sm:text-sm text-content-muted leading-relaxed">
                Reach qualified talent faster. Requisitions swiped right by candidates automatically populate your active candidate pipeline.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div className="surface-card-subtle text-xs flex items-center gap-2.5 text-content">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span>Inbound candidate pool directly from right-swipes</span>
                </div>
                <div className="surface-card-subtle text-xs flex items-center gap-2.5 text-content">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span>Requisition deck preview & management</span>
                </div>
                <div className="surface-card-subtle text-xs flex items-center gap-2.5 text-content">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span>Impression & candidate conversion rate metrics</span>
                </div>
                <div className="surface-card-subtle text-xs flex items-center gap-2.5 text-content">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span>Accelerated screening and interview scheduling</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ========================================================= */}
      {/* 8. INTERACTIVE FAQ SECTION (ACCORDION) */}
      {/* ========================================================= */}
      <section className="space-y-6 max-w-3xl mx-auto">
        <div className="text-center space-y-2">
          <div className="text-xs font-bold text-primary uppercase tracking-widest">
            Got Questions?
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-content">
            Frequently Asked Questions
          </h2>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, index) => {
            const isOpen = openFaq === index;
            return (
              <div
                key={faq.question}
                className="surface-card-subtle border border-outline-variant/70 rounded-2xl overflow-hidden transition-all"
              >
                <button
                  type="button"
                  onClick={() => toggleFaq(index)}
                  className="w-full flex items-center justify-between text-left p-2 sm:p-2.5 text-sm font-semibold text-content hover:text-primary transition-colors focus:outline-none"
                >
                  <span>{faq.question}</span>
                  <ChevronDown
                    className={`w-4 h-4 text-content-subtle transition-transform duration-300 ${
                      isOpen ? 'transform rotate-180 text-primary' : ''
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-2 sm:px-2.5 pb-3 text-xs sm:text-sm text-content-muted leading-relaxed border-t border-outline-variant/50 pt-3">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* ========================================================= */}
      {/* 9. BOTTOM HERO CALL-TO-ACTION BANNER */}
      {/* ========================================================= */}
      <section className="surface-card text-center space-y-6 bg-gradient-to-b from-surface-container to-surface-elevated border-primary/20 relative overflow-hidden">
        <div 
          className="absolute -top-16 left-1/2 -translate-x-1/2 w-80 h-80 bg-[#0070ad]/15 rounded-full blur-3xl pointer-events-none -z-10" 
          aria-hidden="true" 
        />

        <div className="max-w-2xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#0070ad]/15 text-[#0070ad] text-xs font-bold uppercase tracking-wider">
            Infosys Springboard
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-content">
            Start Discovering Your Next Opportunity
          </h2>
          <p className="text-xs sm:text-sm text-content-muted leading-relaxed">
            Experience the faster, cleaner way to match with roles that fit your ambitions. 
            SwipeX is engineered by Infosys to empower your career advancement.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-2">
          {isAuthenticated ? (
            <Button
              size="lg"
              variant="filled"
              icon={LayoutDashboard}
              onClick={() => navigate('/dashboard')}
              className="w-full sm:w-auto shadow-lg shadow-primary/25"
            >
              Continue to Dashboard
            </Button>
          ) : (
            <>
              <Button
                size="lg"
                variant="filled"
                icon={ArrowRight}
                onClick={() => navigate('/register')}
                className="w-full sm:w-auto shadow-lg shadow-primary/25 font-semibold"
              >
                Create Free Account
              </Button>
              <Button
                size="lg"
                variant="outlined"
                onClick={() => navigate('/login')}
                className="w-full sm:w-auto"
              >
                Sign In
              </Button>
            </>
          )}
        </div>
      </section>

    </div>
  );
}
