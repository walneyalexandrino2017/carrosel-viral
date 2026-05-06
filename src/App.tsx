/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import confetti from "canvas-confetti";
import { toPng } from "html-to-image";
import { 
  Download, 
  Image as ImageIcon, 
  Layers, 
  Maximize, 
  Minimize, 
  Moon, 
  Plus, 
  RefreshCcw, 
  Smartphone, 
  Sun, 
  Type as TypeIcon,
  Check,
  ChevronLeft,
  ChevronRight,
  DownloadCloud,
  Sparkles,
  Instagram,
  Layout,
  Info,
  ChevronDown,
  FileArchive
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useEffect, useRef, useState } from "react";
import JSZip from "jszip";

// Types
type AspectRatio = "9:16" | "4:5" | "16:9";

type Niche = 
  | "Marketing Digital"
  | "Advogado"
  | "E-commerce"
  | "Fitness"
  | "Estética"
  | "Imobiliário"
  | "Restaurante"
  | "Educação"
  | "Geral";

const NICHES: Niche[] = [
  "Marketing Digital",
  "Advogado",
  "E-commerce",
  "Fitness",
  "Estética",
  "Imobiliário",
  "Restaurante",
  "Educação",
  "Geral"
];

type Objective = "Vendas" | "Leads" | "Engajamento";

const OBJECTIVES: Objective[] = ["Vendas", "Leads", "Engajamento"];

type VisualStyle = 
  | "Ultra Realista 8K" 
  | "Cartoon Colorido" 
  | "Anime Cinematográfico" 
  | "Preto e Branco Dramático" 
  | "Minimalista Clean" 
  | "Futurista Tech" 
  | "Corporativo Profissional" 
  | "Neon Cyberpunk" 
  | "3D Render Premium" 
  | "Anúncio para Produto Físico"
  | "Anúncio para Serviços"
  | "Agência de Marketing Premium"
  | "HQ (Quadrinhos Estilo Marvel)";

const VISUAL_STYLES: VisualStyle[] = [
  "Ultra Realista 8K",
  "Cartoon Colorido",
  "Anime Cinematográfico",
  "Preto e Branco Dramático",
  "Minimalista Clean",
  "Futurista Tech",
  "Corporativo Profissional",
  "Neon Cyberpunk",
  "3D Render Premium",
  "Anúncio para Produto Físico",
  "Anúncio para Serviços",
  "Agência de Marketing Premium",
  "HQ (Quadrinhos Estilo Marvel)"
];

import { Toaster, toast } from "react-hot-toast";
import { gerarCarrossel } from "./services/carouselService";

interface Slide {
  titulo: string;
  subtitulo: string;
  descricao: string;
  prompt_imagem?: string;
  imageUrl?: string;
}

interface CarouselResponse {
  titulo_geral: string;
  slides: Slide[];
  legenda: string;
  hashtags: string[];
}

export default function App() {
  const [inputText, setInputText] = useState("");
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>("4:5");
  const [selectedStyle, setSelectedStyle] = useState<VisualStyle>("Ultra Realista 8K");
  const [selectedNiche, setSelectedNiche] = useState<Niche>("Marketing Digital");
  const [selectedObjective, setSelectedObjective] = useState<Objective>("Vendas");
  const [isLoading, setIsLoading] = useState(false);
  const [generatedData, setGeneratedData] = useState<CarouselResponse | null>(null);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const carouselRef = useRef<HTMLDivElement>(null);
  const slideRefs = useRef<(HTMLDivElement | null)[]>([]);

  const handleGenerate = async () => {
    if (!inputText.trim()) return;

    setIsLoading(true);
    setGenerationProgress(10);
    setError(null);
    setGeneratedData(null);
    setCurrentSlideIndex(0);

    try {
      const carouselData = await gerarCarrossel(
        inputText,
        selectedStyle,
        selectedNiche,
        selectedObjective,
        aspectRatio
      );
      
      setGeneratedData(carouselData);
      setGenerationProgress(100);
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#FF0055', '#FFD700', '#00E5FF']
      });
    } catch (err: any) {
      console.error(err);
      if (err?.message?.includes("429") || err?.message?.includes("quota")) {
        setError("Limite de cota atingido. Por favor, aguarde 1 minuto e tente novamente.");
        toast.error("Limite de cota atingido.");
      } else {
        setError(err instanceof Error ? err.message : "Ocorreu um erro ao gerar o carrossel. Por favor, tente novamente.");
        toast.error("Erro na geração do carrossel.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const downloadSlide = async (index: number) => {
    const slideEl = slideRefs.current[index];
    if (slideEl) {
      try {
        const dataUrl = await toPng(slideEl, { quality: 0.95 });
        const link = document.createElement("a");
        link.download = `slide-${index + 1}.png`;
        link.href = dataUrl;
        link.click();
      } catch (err) {
        console.error("Download failed", err);
      }
    }
  };

  const downloadAllImages = async () => {
    if (!generatedData) return;
    
    setIsLoading(true);
    const zip = new JSZip();
    const folder = zip.folder("carrossel-images");
    
    try {
      const promises = generatedData.slides.map(async (slide, idx) => {
        const slideEl = slideRefs.current[idx];
        if (slideEl) {
          const dataUrl = await toPng(slideEl, { quality: 1, pixelRatio: 2 });
          const base64Data = dataUrl.split(',')[1];
          folder?.file(`slide-${idx + 1}.png`, base64Data, { base64: true });
        }
      });
      
      await Promise.all(promises);
      const content = await zip.generateAsync({ type: "blob" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(content);
      link.download = `carrossel-${generatedData.titulo_geral.toLowerCase().replace(/\s+/g, '-')}.zip`;
      link.click();
      toast.success("Download iniciado!");
    } catch (err) {
      console.error("Zip download failed", err);
      toast.error("Erro ao preparar download.");
    } finally {
      setIsLoading(false);
    }
  };

  const getAspectClass = () => {
    switch (aspectRatio) {
      case "9:16": return "aspect-[9/16]";
      case "4:5": return "aspect-[4/5]";
      case "16:9": return "aspect-[16/9]";
      default: return "aspect-[4/5]";
    }
  };

  const scrollCarousel = (direction: 'left' | 'right') => {
    if (carouselRef.current) {
      const scrollAmount = carouselRef.current.offsetWidth;
      carouselRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div className="min-h-screen bg-[#0d0e25] text-slate-300 font-sans selection:bg-indigo-500/30 overflow-x-hidden">
      <Toaster position="bottom-right" reverseOrder={false} />
      {/* Header Navigation */}
      <header className="flex items-center justify-between px-8 py-5 border-b border-white/5 bg-[#0f1129]/80 backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <Instagram className="w-6 h-6 text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight text-white">Viral<span className="text-indigo-400">Slide</span>.ai</span>
        </div>
        
        <div className="flex items-center gap-4">
          {generatedData && (
            <button 
              onClick={downloadAllImages}
              disabled={isLoading}
              className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-2.5 rounded-full text-sm font-bold transition-all active:scale-95 shadow-lg shadow-indigo-500/20 flex items-center gap-2 disabled:opacity-50"
            >
              <FileArchive className="w-4 h-4" />
              Baixar Tudo (.zip)
            </button>
          )}
        </div>
      </header>

      <main className="max-w-[1700px] mx-auto flex flex-col lg:flex-row min-h-[calc(100vh-80px)] overflow-hidden">
        {/* Sidebar Input Panel */}
        <aside className="w-full lg:w-[420px] border-r border-white/5 flex flex-col bg-[#0f1129] p-8 gap-10 lg:sticky lg:top-20 lg:h-[calc(100vh-80px)] overflow-y-auto custom-scrollbar">
            <div className="space-y-8">
              
            <div className="space-y-4">
              <label className="text-xs font-bold uppercase tracking-widest text-slate-500">Texto base / Assunto</label>
              <div className="relative group">
                <textarea
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Ex: Como vencer a procrastinação..."
                  className="w-full h-44 bg-[#1a1c3d] border border-white/10 rounded-2xl p-5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 placeholder:text-slate-600 transition-all resize-none"
                />
              </div>
            </div>

            <div className="space-y-4">
              <label className="text-xs font-bold uppercase tracking-widest text-slate-500">Objetivo do Carrossel</label>
              <div className="relative">
                <select 
                  value={selectedObjective}
                  onChange={(e) => setSelectedObjective(e.target.value as Objective)}
                  className="w-full bg-[#1a1c3d] border border-white/10 rounded-2xl p-4 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 appearance-none cursor-pointer"
                >
                  {OBJECTIVES.map((obj) => (
                    <option key={obj} value={obj}>{obj}</option>
                  ))}
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
                  <ChevronDown className="w-4 h-4" />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <label className="text-xs font-bold uppercase tracking-widest text-slate-500">Nicho do Negócio</label>
              <div className="relative">
                <select 
                  id="nicho"
                  value={selectedNiche}
                  onChange={(e) => setSelectedNiche(e.target.value as Niche)}
                  className="w-full bg-[#1a1c3d] border border-white/10 rounded-2xl p-4 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 appearance-none cursor-pointer"
                >
                  {NICHES.filter(n => n !== "Geral").map((niche) => (
                    <option key={niche} value={niche}>{niche}</option>
                  ))}
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
                  <ChevronDown className="w-4 h-4" />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <label className="text-xs font-bold uppercase tracking-widest text-slate-500">Estilo Visual</label>
              <div className="relative">
                <select 
                  value={selectedStyle}
                  onChange={(e) => setSelectedStyle(e.target.value as VisualStyle)}
                  className="w-full bg-[#1a1c3d] border border-white/10 rounded-2xl p-4 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 appearance-none cursor-pointer"
                >
                  {VISUAL_STYLES.map((style) => (
                    <option key={style} value={style}>{style}</option>
                  ))}
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
                  <ChevronDown className="w-4 h-4" />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <label className="text-xs font-bold uppercase tracking-widest text-slate-500">Formato da Imagem</label>
              <div className="grid grid-cols-3 gap-3">
                {(["4:5", "9:16", "16:9"] as AspectRatio[]).map((fmt) => (
                  <button
                    key={fmt}
                    onClick={() => setAspectRatio(fmt)}
                    className={`flex flex-col items-center gap-2 p-3 rounded-2xl border transition-all ${
                      aspectRatio === fmt 
                      ? "bg-indigo-600/10 border-indigo-500 text-white" 
                      : "bg-[#1a1c3d] border-white/5 text-slate-500 hover:text-slate-300"
                    }`}
                  >
                    <span className="text-xs font-black">{fmt}</span>
                    <span className="text-[9px] uppercase tracking-tighter opacity-60">
                      {fmt === "4:5" ? "Retrato" : fmt === "9:16" ? "Stories/Reels" : "Widescreen"}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleGenerate}
              disabled={isLoading || !inputText.trim()}
              className={`w-full py-5 rounded-2xl font-black text-sm uppercase tracking-wider transition-all active:scale-[0.98] flex items-center justify-center gap-3 ${
                isLoading || !inputText.trim()
                ? "bg-white/5 text-slate-600 cursor-not-allowed"
                : "bg-indigo-600 hover:bg-indigo-500 text-white shadow-xl shadow-indigo-500/20"
              }`}
            >
              {isLoading ? (
                <>
                  <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}>
                    <RefreshCcw className="w-5 h-5" />
                  </motion.div>
                  <span>GERANDO... ({Math.round(generationProgress)}%)</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  <span>Gerar Carrossel Viral</span>
                </>
              )}
            </button>

            <div className="bg-indigo-950/30 border border-indigo-500/20 rounded-2xl p-5 space-y-2">
              <div className="flex items-center gap-2 text-indigo-400">
                <Info className="w-4 h-4" />
                <span className="text-xs font-bold uppercase tracking-wider">Dica Pro</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed font-medium">
                Seja específico no texto base para que a IA consiga criar ganchos mais poderosos e imagens mais contextuais.
              </p>
            </div>
          </div>

          {error && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-6 bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl text-xs flex items-center gap-3">
              <Info className="w-4 h-4 shrink-0" />
              {error}
            </motion.div>
          )}
        </aside>

        {/* Preview Canvas Area */}
        <section className="flex-1 bg-[#0a0b1e] flex flex-col p-8 md:p-16 min-h-screen overflow-x-hidden relative">
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-indigo-500/5 blur-[120px] rounded-full pointer-events-none"></div>
          
          <div className="flex items-center justify-between mb-16 relative z-10">
            <div></div>
            {generatedData && (
              <div className="flex gap-4">
                 <button 
                  onClick={() => scrollCarousel('left')}
                  className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-indigo-500/10 hover:border-indigo-500/30 transition-all text-slate-400 hover:text-indigo-400 shadow-xl"
                 >
                   <ChevronLeft className="w-6 h-6" />
                 </button>
                 <button 
                  onClick={() => scrollCarousel('right')}
                  className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-indigo-500/10 hover:border-indigo-500/30 transition-all text-slate-400 hover:text-indigo-400 shadow-xl"
                 >
                   <ChevronRight className="w-6 h-6" />
                 </button>
              </div>
            )}
          </div>

          <div className="flex-1 flex flex-col items-center justify-center">
            {!generatedData && !isLoading && (
              <div className="text-center space-y-10 max-w-md">
                <div className="w-40 h-40 bg-[#131530] rounded-[2.5rem] flex items-center justify-center mx-auto border border-white/5 relative group shadow-2xl">
                  <div className="absolute inset-0 bg-indigo-600/10 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <div className="w-16 h-16 bg-[#1a1c3d] rounded-2xl flex items-center justify-center border border-white/5 shadow-inner">
                    <ImageIcon className="text-indigo-400/40 w-8 h-8" />
                  </div>
                </div>
                <div className="space-y-4">
                  <h3 className="text-2xl font-black text-white">Workspace Vazio</h3>
                  <p className="text-slate-500 text-sm leading-relaxed font-medium">
                    Defina o conteúdo do seu carrossel no painel lateral e a inteligência artificial criará os 5 slides prontos para conversão.
                  </p>
                </div>
              </div>
            )}

            {isLoading && !generatedData && (
               <div className="w-full max-w-lg space-y-12">
                 <div className={`w-full bg-[#131530] rounded-[3rem] ${getAspectClass()} animate-pulse flex items-center justify-center overflow-hidden shadow-2xl relative border border-white/5`}>
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-transparent"></div>
                    <div className="text-center space-y-4 px-12 relative z-10">
                      <motion.div animate={{ opacity: [0.3, 1, 0.3], scale: [0.9, 1.1, 0.9] }} transition={{ duration: 2, repeat: Infinity }}>
                        <Sparkles className="w-16 h-16 text-indigo-500/40 mx-auto" />
                      </motion.div>
                      <div className="space-y-2">
                        <p className="text-indigo-400/60 font-bold text-xs uppercase tracking-[0.3em] animate-pulse"> Criando Carrossel Viral</p>
                        <p className="text-slate-600 text-[10px] uppercase tracking-widest font-medium">Aguarde enquanto a IA executa a mágica</p>
                      </div>
                    </div>
                 </div>
                 <div className="h-1 bg-white/5 w-64 mx-auto rounded-full overflow-hidden">
                   <motion.div className="h-full bg-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.8)]" initial={{ width: 0 }} animate={{ width: `${generationProgress}%` }} />
                 </div>
               </div>
            )}

            {generatedData && (
              <div className="w-full max-w-5xl space-y-12">
                <div 
                  ref={carouselRef}
                  className="flex overflow-x-auto snap-x snap-mandatory hide-scrollbar gap-8 md:gap-12 pb-12"
                  style={{ scrollbarWidth: 'none' }}
                >
                  {generatedData.slides.map((slide, idx) => (
                    <div key={idx} className="flex-none w-[90%] md:w-[500px] snap-center py-8">
                      <div 
                        ref={el => slideRefs.current[idx] = el}
                        className={`relative bg-[#1A1A1C] rounded-[2.5rem] overflow-hidden shadow-[0_40px_100px_rgba(0,0,0,0.7)] border border-white/5 ${getAspectClass()} group`}
                      >
                        <AnimatePresence mode="wait">
                          {slide.imageUrl ? (
                            <motion.img 
                              key={slide.imageUrl}
                              initial={{ opacity: 0, scale: 1.1 }}
                              animate={{ opacity: 0.6, scale: 1 }}
                              transition={{ duration: 1 }}
                              src={slide.imageUrl} 
                              className="absolute inset-0 w-full h-full object-cover grayscale-[0.3]"
                              alt={slide.titulo}
                            />
                          ) : (
                            <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                              <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }}>
                                <RefreshCcw className="text-white/10 w-8 h-8" />
                              </motion.div>
                            </div>
                          )}
                        </AnimatePresence>

                        {/* Aesthetic Overlays */}
                        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0b1e] via-[#0a0b1e]/20 to-transparent"></div>
                        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-transparent pointer-events-none"></div>

                        {/* Content Overlay */}
                        <div className="relative h-full flex flex-col p-12 md:p-16 z-10 text-white items-start text-left justify-end">
                          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="space-y-6">

                            <h4 className="text-4xl md:text-5xl font-black tracking-tight leading-[0.9] uppercase italic">
                              {slide.titulo.split(' ').map((word, i) => (
                                <span key={i} className={i % 3 === 2 ? 'text-indigo-400' : ''}>
                                  {word}{' '}
                                </span>
                              ))}
                            </h4>
                            <p className="text-lg md:text-xl font-bold text-slate-200 tracking-tight leading-tight font-sans">
                              {slide.subtitulo}
                            </p>
                            <p className="text-sm md:text-base text-slate-400 font-medium leading-relaxed max-w-sm font-sans">
                              {slide.descricao}
                            </p>
                          </motion.div>
                        </div>

                        {/* Professional Indicators */}
                        <div className="absolute top-10 left-10 flex gap-1 z-20">
                          {[0,1,2,3,4].map(i => (
                            <div key={i} className={`w-8 h-1 rounded-full transition-all duration-500 ${i === idx ? 'bg-indigo-500' : 'bg-white/10'}`} />
                          ))}
                        </div>
                        
                      </div>
                      
                      <div className="mt-8 flex items-center justify-between px-6">
                         <button 
                          onClick={() => downloadSlide(idx)}
                          className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 hover:text-indigo-400 transition-all group"
                         >
                           <DownloadCloud className="w-5 h-5 group-hover:-translate-y-1 transition-transform" />
                           <span>Exportar.png</span>
                         </button>
                         <div className="flex gap-2">
                            <span className="text-[9px] bg-white/5 border border-white/5 px-3 py-1.5 rounded-lg text-slate-600">ID: {slide.titulo.substring(0, 8).toUpperCase()}</span>
                         </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
