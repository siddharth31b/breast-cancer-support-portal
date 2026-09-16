import React, { useState } from "react";
import { 
  Search, 
  Bookmark, 
  BookmarkCheck, 
  Clock, 
  ChevronRight,
  Sparkles,
  X
} from "lucide-react";
import { mockArticles } from "../../mocks/patient-portal.mock";
import type { EducationArticle, EducationCategory } from "../../types/patient-portal";
import { MedicalDisclaimer } from "../../components/patient/MedicalDisclaimer";

const CATEGORIES: EducationCategory[] = [
  "Breast Self-Awareness",
  "Screening Methods",
  "Mammography",
  "Ultrasound",
  "Biopsy",
  "Understanding AI Screening",
  "Preparing for Appointments",
  "Understanding Reports",
  "Treatment Pathways",
  "Emotional Well-being",
  "FAQs"
];

export const HealthEducationPage: React.FC = () => {
  const [articles, setArticles] = useState<EducationArticle[]>(mockArticles);
  const [search, setSearch] = useState("");
  const [selectedCat, setSelectedCat] = useState<string>("All");
  const [activeArticle, setActiveArticle] = useState<EducationArticle | null>(null);

  const toggleSave = (id: string) => {
    setArticles(prev => prev.map(a => a.id === id ? { ...a, isSaved: !a.isSaved } : a));
  };

  const filteredArticles = articles.filter(a => {
    const matchesSearch = a.title.toLowerCase().includes(search.toLowerCase()) || a.summary.toLowerCase().includes(search.toLowerCase());
    const matchesCat = selectedCat === "All" || a.category === selectedCat;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="space-y-6">
      {/* Disclaimer */}
      <MedicalDisclaimer variant="general" />

      {/* Header & Controls */}
      <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-xs space-y-4">
        <div className="flex justify-between items-center flex-wrap gap-3">
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Clinical Library</span>
            <h2 className="text-lg font-black text-slate-800">Breast Health & Screening Knowledge Center</h2>
          </div>
          <div className="relative min-w-[240px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search articles..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-hidden focus:ring-2 focus:ring-primary/20"
            />
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
          <button
            onClick={() => setSelectedCat("All")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              selectedCat === "All" ? "bg-primary text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200/60"
            }`}
          >
            All Articles
          </button>
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCat(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                selectedCat === cat ? "bg-primary text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200/60"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Articles Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
        {filteredArticles.map((art) => (
          <div key={art.id} className="bg-white border border-slate-100 rounded-2xl p-5 shadow-xs flex flex-col justify-between space-y-4 hover:border-slate-200 transition-all">
            <div className="space-y-2">
              <div className="flex justify-between items-start gap-2">
                <span className="text-[10px] font-black text-primary uppercase tracking-wider bg-primary/5 px-2 py-0.5 rounded-md">
                  {art.category}
                </span>
                <button
                  onClick={() => toggleSave(art.id)}
                  className="text-slate-400 hover:text-amber-500 transition-colors"
                >
                  {art.isSaved ? <BookmarkCheck className="w-4 h-4 text-amber-500 fill-amber-500" /> : <Bookmark className="w-4 h-4" />}
                </button>
              </div>

              {art.isRecommendedByDoctor && (
                <span className="inline-flex items-center gap-1 text-[9px] font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-md border border-teal-200">
                  <Sparkles className="w-3 h-3 text-teal-600" /> Doctor Recommended
                </span>
              )}

              <h3 className="text-sm font-black text-slate-800 leading-snug">{art.title}</h3>
              <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed font-medium">{art.summary}</p>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[10px] text-slate-400 flex items-center gap-1">
                <Clock className="w-3 h-3" /> {art.readingTimeMin} min read
              </span>
              <button
                onClick={() => setActiveArticle(art)}
                className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
              >
                Read Article <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Article Detail View Modal */}
      {activeArticle && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-xl space-y-4 relative max-h-[85vh] overflow-y-auto">
            <button
              onClick={() => setActiveArticle(null)}
              className="absolute top-4 right-4 p-1 rounded-lg text-slate-400 hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>

            <span className="text-[10px] font-black text-primary uppercase tracking-wider bg-primary/5 px-2.5 py-1 rounded-md">
              {activeArticle.category}
            </span>

            <h2 className="text-lg font-black text-slate-800">{activeArticle.title}</h2>

            <p className="text-xs text-slate-400 font-medium">Published: {activeArticle.publishedAt} • {activeArticle.readingTimeMin} min read</p>

            <div className="bg-slate-50 border border-slate-100 p-4 rounded-xl text-xs text-slate-700 leading-relaxed space-y-3 font-medium">
              <p><strong>Overview:</strong> {activeArticle.summary}</p>
              <p>Regular breast self-awareness and timely clinical screening are essential pillars of proactive breast health. Understanding your imaging reports and diagnostic pathways helps reduce anxiety and empowers you during medical consultations.</p>
              <p>Always discuss specific screening recommendations with your assigned specialist physician based on your personal and family medical history.</p>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setActiveArticle(null)}
                className="px-4 py-2 bg-primary text-white text-xs font-bold rounded-xl hover:bg-primary-hover"
              >
                Close Article
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
