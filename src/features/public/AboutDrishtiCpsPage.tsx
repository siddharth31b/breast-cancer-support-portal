import React from "react";
import {
  Building2,
  Cpu,
  Globe,
  Award,
  ExternalLink,
  Phone,
  Mail,
  MapPin,
  CheckCircle,
  ArrowRight,
  Sparkles
} from "lucide-react";

export const AboutDrishtiCpsPage: React.FC = () => {
  return (
    <div className="bg-white text-slate-800 overflow-x-hidden min-h-screen">
      
      {/* ── A. ABOUT HERO ───────────────────────────────────────────────────── */}
      <section className="relative min-h-[70vh] gradient-hero flex flex-col justify-center pt-12 pb-20 px-6 border-b border-slate-100 overflow-hidden" aria-label="About DRISHTI CPS Introduction">
        {/* Full-bleed Hero Visual Layer blending with text & left side gradient */}
        <div className="absolute inset-y-0 right-0 w-full lg:w-[65%] pointer-events-none z-0 overflow-hidden">
          <img
            src="/assets/images/drishti-hero-research.jpg"
            alt="Researchers evaluating technology simulation models in an institutional facility"
            className="w-full h-full object-cover object-center block"
          />
          {/* Multi-stop Gradient Overlay for seamless blending with hero background and text */}
          <div 
            className="absolute inset-0"
            style={{
              background: `
                linear-gradient(to right, #f0f9f8 0%, #f0f9f8 15%, rgba(240, 249, 248, 0.98) 25%, rgba(240, 249, 248, 0.85) 42%, rgba(230, 244, 243, 0.45) 65%, rgba(230, 244, 243, 0.1) 85%, rgba(230, 244, 243, 0) 100%),
                linear-gradient(to bottom, rgba(240, 249, 248, 0.5) 0%, rgba(240, 249, 248, 0) 20%, rgba(240, 244, 255, 0) 80%, rgba(240, 244, 255, 0.5) 100%)
              `
            }}
          />
        </div>

        <div className="max-w-7xl mx-auto w-full relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left: Headline & Copy */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 bg-white/90 border border-slate-200 rounded-full px-4 py-2 shadow-xs hover:border-primary/30 transition-all duration-300 cursor-default">
                <Building2 className="w-4 h-4 text-primary" />
                <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">Technology Innovation Hub · IIT Indore</span>
              </div>

              <h1 className="text-display text-slate-900 leading-tight">
                Translating deep technology<br />
                <span className="text-primary">into real-world impact.</span>
              </h1>

              <p className="text-lg text-slate-600 font-normal leading-relaxed max-w-2xl">
                IITI DRISHTI CPS Foundation is a Technology Innovation Hub hosted at IIT Indore advancing cyber-physical-system innovation, system modeling, simulation, visualization, and technology translation across critical sectors.
              </p>

              <div className="flex flex-wrap gap-2 pt-2">
                {[
                  "IIT Indore",
                  "Technology Innovation Hub",
                  "NM-ICPS",
                  "Department of Science & Technology",
                  "Technology Translation Research Park",
                  "Digital Healthcare",
                ].map((tag, i) => (
                  <span key={i} className="text-xs font-semibold px-3.5 py-1.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200/80 hover:bg-white hover:border-primary/40 hover:shadow-xs transition-all duration-200 cursor-default">
                    {tag}
                  </span>
                ))}
              </div>

              <div className="flex flex-wrap gap-4 pt-4">
                <a href="#who-we-are" className="px-6 py-3.5 bg-primary hover:bg-primary-hover text-white font-semibold rounded-2xl shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all text-xs flex items-center gap-2 focus-ring">
                  Explore DRISHTI CPS <ArrowRight className="w-4 h-4" />
                </a>
                <a
                  href="https://drishticps.org/"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Visit Official DRISHTI CPS Website (opens in a new tab)"
                  className="px-6 py-3.5 bg-white border border-slate-200 text-slate-700 font-semibold rounded-2xl hover:border-primary/40 hover:text-primary hover:shadow-md hover:-translate-y-0.5 transition-all text-xs flex items-center gap-2 focus-ring"
                >
                  Official Website <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>

            {/* Right: Balances grid with background visual */}
            <div className="lg:col-span-5 hidden lg:block pointer-events-none" />

          </div>
        </div>
      </section>

      {/* ── B. WHO THEY ARE ─────────────────────────────────────────────────── */}
      <section id="who-we-are" className="py-24 px-6 bg-slate-50/50 border-b border-slate-100" aria-label="Who We Are">
        <div className="max-w-7xl mx-auto space-y-12">
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            
            <div className="space-y-6">
              <span className="text-xs font-bold text-primary uppercase tracking-widest">Institutional Identity</span>
              <h2 className="text-headline text-slate-900">About IITI DRISHTI CPS Foundation</h2>
              <p className="text-slate-600 text-sm leading-relaxed">
                Established as a Section 8 non-profit organization hosted at the Indian Institute of Technology (IIT) Indore, IITI DRISHTI CPS Foundation operates under the National Mission on Interdisciplinary Cyber-Physical Systems (NM-ICPS) funded by the Department of Science and Technology (DST), Government of India.
              </p>
              <p className="text-slate-600 text-sm leading-relaxed">
                The hub serves as a Technology Translation Research Park dedicated to bridging the gap between academic laboratory innovation and real-world commercial adoption through industry partnerships, startup incubation, and translational research initiatives.
              </p>

              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-2xs hover:shadow-md hover:border-primary/30 hover:-translate-y-0.5 transition-all duration-300">
                  <span className="text-xl font-black text-slate-900 block">NM-ICPS</span>
                  <span className="text-[11px] text-slate-500 font-medium">Supported National Mission</span>
                </div>
                <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-2xs hover:shadow-md hover:border-primary/30 hover:-translate-y-0.5 transition-all duration-300">
                  <span className="text-xl font-black text-slate-900 block">IIT Indore</span>
                  <span className="text-[11px] text-slate-500 font-medium">Host Institution</span>
                </div>
              </div>
            </div>

            {/* Foundational Focus Card with Visual Placement B */}
            <div className="p-8 rounded-3xl bg-white border border-slate-200/80 shadow-md hover:shadow-xl hover:border-primary/20 transition-all duration-300 space-y-6 group">
              <div className="rounded-2xl overflow-hidden aspect-[16/9] border border-slate-200/80 shadow-2xs">
                <img
                  src="/assets/images/drishti-foundational-focus.jpg"
                  alt="Computer simulation and visual modeling workstation"
                  width={800}
                  height={450}
                  className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                  loading="lazy"
                />
              </div>

              <h3 className="font-bold text-slate-900 text-lg border-b border-slate-100 pb-3">Foundational Focus Areas</h3>
              <div className="space-y-4">
                {[
                  { title: "System Modelling", desc: "Developing mathematical and computational representations of complex physical processes." },
                  { title: "System Simulation", desc: "Simulating physical and digital interactions to evaluate performance before real-world deployment." },
                  { title: "System Visualisation", desc: "Creating intuitive visual overlays and dashboards for complex data interpretation." },
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-3 p-2 rounded-xl hover:bg-slate-50/80 transition-colors duration-200">
                    <CheckCircle className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-bold text-slate-900 text-xs">{item.title}</h4>
                      <p className="text-xs text-slate-500 leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* ── C. VISION AND MISSION ───────────────────────────────────────────── */}
      <section className="py-24 px-6 bg-white border-b border-slate-100" aria-label="Vision and Mission">
        <div className="max-w-7xl mx-auto space-y-12">
          
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-xs font-bold text-primary uppercase tracking-widest">Guiding Principles</span>
            <h2 className="text-headline text-slate-900">Vision & Mission</h2>
            <p className="text-slate-500 text-sm leading-relaxed">
              Driving cyber-physical-system innovation from foundational research to societal impact.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* Vision Card */}
            <div className="p-8 rounded-3xl bg-slate-50 hover:bg-white border border-slate-200/80 hover:border-teal-300/60 shadow-xs hover:shadow-xl hover:-translate-y-1 transition-all duration-300 space-y-4 group">
              <div className="w-12 h-12 rounded-2xl bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-600 group-hover:scale-110 group-hover:bg-teal-100 transition-all duration-300">
                <Globe className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-slate-900 text-xl group-hover:text-primary transition-colors duration-200">Our Vision</h3>
              <p className="text-sm text-slate-600 leading-relaxed font-normal">
                To become a premier one-stop destination for cyber-physical-system solutions, with core expertise in system simulation, modelling, and visualization to solve national and global technological challenges.
              </p>
            </div>

            {/* Mission Card */}
            <div className="p-8 rounded-3xl bg-slate-50 hover:bg-white border border-slate-200/80 hover:border-blue-300/60 shadow-xs hover:shadow-xl hover:-translate-y-1 transition-all duration-300 space-y-4 group">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 group-hover:scale-110 group-hover:bg-blue-100 transition-all duration-300">
                <Award className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-slate-900 text-xl group-hover:text-blue-700 transition-colors duration-200">Our Mission</h3>
              <p className="text-sm text-slate-600 leading-relaxed font-normal">
                To accelerate the translation and market adoption of technologies developed in academic laboratories by fostering robust collaborations between researchers, industry partners, and startup enterprises.
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* ── D. CORE CAPABILITIES ───────────────────────────────────────────── */}
      <section className="py-24 px-6 bg-slate-50/50 border-b border-slate-100" aria-label="Core Capabilities">
        <div className="max-w-7xl mx-auto space-y-12">
          
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-xs font-bold text-indigo-600 uppercase tracking-widest">Institutional Expertise</span>
            <h2 className="text-headline text-slate-900">Core Institutional Capabilities</h2>
            <p className="text-slate-500 text-sm leading-relaxed">
              Comprehensive capabilities supporting technological innovation, translation, and deployment.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {[
              "System Modelling",
              "System Simulation",
              "Data Visualisation",
              "Digital Healthcare",
              "Technology Development",
              "Technology Translation",
              "Pilot Deployment",
              "Industry Collaboration",
              "Startup Incubation",
              "Skill Development",
            ].map((cap, i) => (
              <div key={i} className="p-4 rounded-xl bg-white border border-slate-200/70 hover:border-indigo-300/80 shadow-2xs hover:shadow-md hover:-translate-y-1 transition-all duration-300 text-center space-y-1 group cursor-default">
                <Cpu className="w-5 h-5 text-indigo-600 mx-auto mb-1 group-hover:scale-110 transition-transform duration-300" />
                <p className="font-bold text-xs text-slate-900 group-hover:text-indigo-700 transition-colors duration-200">{cap}</p>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ── E. SECTORS (With Placement C: Digital Healthcare Banner) ────────── */}
      <section className="py-24 px-6 bg-white border-b border-slate-100" aria-label="Key Focus Sectors">
        <div className="max-w-7xl mx-auto space-y-12">
          
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-xs font-bold text-primary uppercase tracking-widest">Domains of Impact</span>
            <h2 className="text-headline text-slate-900">Key Focus Sectors</h2>
            <p className="text-slate-500 text-sm leading-relaxed">
              Driving cyber-physical-system solutions across critical national domain sectors.
            </p>
          </div>

          {/* Placement C: Digital Healthcare Innovation Visual */}
          <div className="rounded-3xl overflow-hidden border border-slate-200/80 shadow-md hover:shadow-xl transition-all duration-500 aspect-[21/9] bg-slate-900 max-w-5xl mx-auto group">
            <img
              src="/assets/images/drishti-digital-healthcare.jpg"
              alt="Clinical decision support and medical research workstation environment"
              width={1000}
              height={428}
              className="w-full h-full object-cover opacity-90 group-hover:opacity-100 group-hover:scale-103 transition-all duration-700 ease-out"
              loading="lazy"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { title: "Digital Healthcare", desc: "AI-assisted screening, medical imaging visualization, & decision support systems.", highlight: true },
              { title: "Agriculture", desc: "Precision farming, CPS crop modeling, & smart sensor monitoring systems." },
              { title: "Education", desc: "Interactive simulation tools & digital learning cyber-physical environments." },
              { title: "Automotive", desc: "Autonomous vehicle simulation, system modeling, & safety validation." },
              { title: "Industry 4.0", desc: "Smart manufacturing, digital twins, & industrial automation solutions." },
              { title: "Smart Cities", desc: "Urban infrastructure modeling, energy management, & environmental sensing." },
            ].map((sec, i) => (
              <div key={i} className={`p-6 rounded-2xl border transition-all duration-300 hover:shadow-lg hover:-translate-y-1 ${sec.highlight ? "bg-primary/5 border-primary/40 ring-1 ring-primary/20 hover:bg-primary/10" : "bg-slate-50 hover:bg-white border-slate-200/80 hover:border-primary/25"}`}>
                <h3 className="font-bold text-slate-900 text-base flex items-center justify-between">
                  {sec.title}
                  {sec.highlight && <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-primary text-white shadow-2xs">NariSetu AI Domain</span>}
                </h3>
                <p className="text-xs text-slate-500 mt-2 leading-relaxed">{sec.desc}</p>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ── F. FROM LAB TO IMPACT METHODOLOGY (With Placement D) ───────────── */}
      <section className="py-24 px-6 bg-slate-50/50 border-b border-slate-100" aria-label="Technology Translation Process">
        <div className="max-w-7xl mx-auto space-y-12">
          
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-xs font-bold text-primary uppercase tracking-widest">Translation Pathway</span>
            <h2 className="text-headline text-slate-900">From Academic Lab to Real-World Impact</h2>
            <p className="text-slate-500 text-sm leading-relaxed">
              A structured lifecycle for translating research discoveries into scalable technology solutions.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
            {[
              { num: "1", name: "Challenge Identification", desc: "Defining key societal & industry problems." },
              { num: "2", name: "Expert Engagement", desc: "Partnering with domain researchers & faculty." },
              { num: "3", name: "Technology Development", desc: "Building CPS prototypes & simulation models." },
              { num: "4", name: "Pilot Deployment", desc: "Testing in real-world clinical or field environments." },
              { num: "5", name: "Iterative Refinement", desc: "Incorporating user feedback & safety validation." },
              { num: "6", name: "Commercial Adoption", desc: "Supporting startup licensing & market scale." },
            ].map((p, i) => (
              <div key={i} className="p-4 rounded-xl bg-white border border-slate-200/70 hover:border-primary/40 shadow-2xs hover:shadow-md hover:-translate-y-1 transition-all duration-300 space-y-2 text-center group cursor-default">
                <span className="w-7 h-7 rounded-full bg-primary/10 group-hover:bg-primary group-hover:text-white text-primary text-xs font-bold flex items-center justify-center mx-auto transition-colors duration-300">{p.num}</span>
                <h4 className="font-bold text-slate-900 text-xs group-hover:text-primary transition-colors duration-200">{p.name}</h4>
                <p className="text-[10px] text-slate-500 leading-tight">{p.desc}</p>
              </div>
            ))}
          </div>

          {/* Placement D: Research Team Collaboration & Translation Visual */}
          <div className="rounded-3xl overflow-hidden border border-slate-200/80 shadow-md hover:shadow-xl transition-all duration-500 aspect-[21/9] bg-slate-900 max-w-5xl mx-auto mt-8 group">
            <img
              src="/assets/images/drishti-translation-team.jpg"
              alt="Collaborative technology translation team evaluating pilot research deployment"
              width={1000}
              height={428}
              className="w-full h-full object-cover opacity-85 group-hover:opacity-100 group-hover:scale-103 transition-all duration-700 ease-out"
              loading="lazy"
            />
          </div>

        </div>
      </section>

      {/* ── G. NARISETU AI CONNECTION ────────────────────────────────────── */}
      <section className="py-24 px-6 bg-white border-b border-slate-100" aria-label="NariSetu AI Connection">
        <div className="max-w-5xl mx-auto space-y-6 p-8 rounded-3xl bg-slate-900 hover:bg-slate-950 text-white shadow-xl hover:shadow-2xl hover:border-teal-500/30 border border-transparent transition-all duration-300">
          <div className="inline-flex items-center gap-2 bg-slate-800 border border-slate-700 rounded-full px-4 py-1.5 text-[11px] font-bold text-teal-400 uppercase tracking-wider shadow-2xs">
            <Sparkles className="w-3.5 h-3.5" /> Digital Healthcare Initiative
          </div>
          <h2 className="text-headline text-white">NariSetu AI & The Digital Healthcare Mission</h2>
          <p className="text-slate-300 text-sm leading-relaxed font-normal">
            NariSetu AI is being developed within the digital-healthcare innovation environment associated with IITI DRISHTI CPS Foundation and IIT Indore. It explores how explainable artificial intelligence, structured screening workflows, and mandatory clinician oversight can support transparent and accessible breast-healthcare experiences.
          </p>
          <p className="text-slate-400 text-xs leading-relaxed font-normal">
            As a research platform, NariSetu AI demonstrates how cyber-physical system principles—integrating data intake, neural visualization, and clinical interaction—can be applied to real-world medical challenges.
          </p>
        </div>
      </section>

      {/* ── H. OFFICIAL CONTACT ────────────────────────────────────────────── */}
      <section className="py-24 px-6 bg-slate-50/50" aria-label="Official Contact Information">
        <div className="max-w-4xl mx-auto space-y-12">
          
          <div className="text-center space-y-3">
            <span className="text-xs font-bold text-primary uppercase tracking-widest">Get In Touch</span>
            <h2 className="text-headline text-slate-900">Official Institutional Contact</h2>
            <p className="text-slate-500 text-sm">IITI DRISHTI CPS Foundation · IIT Indore</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-white border border-slate-200/80 hover:border-primary/30 shadow-2xs hover:shadow-lg hover:-translate-y-1 transition-all duration-300 space-y-2 text-center group">
              <MapPin className="w-6 h-6 text-primary mx-auto mb-1 group-hover:scale-110 transition-transform duration-300" />
              <h4 className="font-bold text-slate-900 text-xs">Official Address</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                IITI DRISHTI CPS Foundation<br />
                4th Floor, LRC, IIT Indore<br />
                Khandwa Road, Simrol, Indore<br />
                Madhya Pradesh – 453552
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-slate-200/80 hover:border-primary/30 shadow-2xs hover:shadow-lg hover:-translate-y-1 transition-all duration-300 space-y-2 text-center flex flex-col justify-center group">
              <Phone className="w-6 h-6 text-primary mx-auto mb-1 group-hover:scale-110 transition-transform duration-300" />
              <h4 className="font-bold text-slate-900 text-xs">Telephone</h4>
              <p className="text-xs text-slate-600 font-semibold">+91-731-660-3372</p>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-slate-200/80 hover:border-primary/30 shadow-2xs hover:shadow-lg hover:-translate-y-1 transition-all duration-300 space-y-2 text-center flex flex-col justify-center group">
              <Mail className="w-6 h-6 text-primary mx-auto mb-1 group-hover:scale-110 transition-transform duration-300" />
              <h4 className="font-bold text-slate-900 text-xs">Email Inquiry</h4>
              <a href="mailto:officedrishti@iiti.ac.in" className="text-xs text-primary font-semibold hover:underline">
                officedrishti@iiti.ac.in
              </a>
            </div>
          </div>

          <div className="text-center pt-4">
            <a
              href="https://drishticps.org/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Visit Official DRISHTI CPS Website (opens in a new tab)"
              className="inline-flex items-center gap-2 px-8 py-4 bg-primary hover:bg-primary-hover text-white font-semibold rounded-2xl text-xs transition-all shadow-md hover:shadow-xl hover:-translate-y-0.5 focus-ring"
            >
              Visit Official DRISHTI CPS Website <ExternalLink className="w-4 h-4" />
            </a>
          </div>

        </div>
      </section>

    </div>
  );
};
