import React, { useState, useEffect } from 'react';
import { AvailableJob, StaffMember } from '../../types';
import {
  Zap,
  Clock,
  AlertTriangle,
  Lock,
  Info,
  Sparkles,
  X,
  Gem,
  ShieldCheck,
  Eye,
  Layers,
  Maximize2,
  FileText,
  ChevronRight,
  Ruler,
  Scale,
  Compass,
  CheckCircle2,
} from 'lucide-react';

interface StaffJobPoolTabProps {
  availableJobs: AvailableJob[];
  staff: StaffMember;
  activeJobsCount: number;
  onAcceptJob: (jobId: string) => void;
}

export const StaffJobPoolTab: React.FC<StaffJobPoolTabProps> = ({
  availableJobs,
  staff,
  activeJobsCount,
  onAcceptJob,
}) => {
  const [securingJobId, setSecuringJobId] = useState<string | null>(null);
  const [capacityError, setCapacityError] = useState<string | null>(null);
  const [selectedJobForDetails, setSelectedJobForDetails] = useState<AvailableJob | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState<number>(0);
  const [activeZoomImage, setActiveZoomImage] = useState<string | null>(null);

  const isFullCapacity = activeJobsCount >= staff.maxJobLimit;

  // Keyboard shortcut listener (Esc to close slide-over and lightbox)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (activeZoomImage) {
          setActiveZoomImage(null);
        } else if (selectedJobForDetails) {
          setSelectedJobForDetails(null);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeZoomImage, selectedJobForDetails]);

  // Prevent body scrolling when slide-over or lightbox is open
  useEffect(() => {
    if (selectedJobForDetails || activeZoomImage) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [selectedJobForDetails, activeZoomImage]);

  // Reset selected image index when switching active job
  useEffect(() => {
    setSelectedImageIndex(0);
  }, [selectedJobForDetails]);

  const handleClaimClick = async (jobId: string) => {
    if (isFullCapacity) {
      setCapacityError(`You have reached your maximum capacity limit (${staff.maxJobLimit}/${staff.maxJobLimit} active jobs). Please deliver an active CAD job from your workbench tray first.`);
      return;
    }
    setCapacityError(null);
    setSecuringJobId(jobId);

    try {
      await onAcceptJob(jobId);
      // Close sidebar if claiming from inside sidebar
      setSelectedJobForDetails(null);
    } catch (e: any) {
      console.error('Failed to claim job:', e);
    } finally {
      setSecuringJobId(null);
    }
  };

  // Helper: Extract all images/sketches for the active job
  const getJobImages = (job: AvailableJob): string[] => {
    const list: string[] = [];
    if (job.referenceImage) list.push(job.referenceImage);
    if (job.sketches && Array.isArray(job.sketches)) {
      job.sketches.forEach((s: any) => {
        const url = s.image_url || s.image;
        if (url && !list.includes(url)) list.push(url);
      });
    }
    if (job.rawRequest?.sketches && Array.isArray(job.rawRequest.sketches)) {
      job.rawRequest.sketches.forEach((s: any) => {
        const url = s.image_url || s.image;
        if (url && !list.includes(url)) list.push(url);
      });
    }
    if (list.length === 0) {
      list.push('https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&q=80&w=600');
    }
    return list;
  };

  // Helper: Extract stones list
  const getGemstonesList = (job: AvailableJob): any[] => {
    if (job.gemstones && Array.isArray(job.gemstones) && job.gemstones.length > 0) {
      return job.gemstones;
    }
    if (job.rawRequest?.stones && Array.isArray(job.rawRequest.stones) && job.rawRequest.stones.length > 0) {
      return job.rawRequest.stones;
    }
    if (job.rawRequest?.gemstones && Array.isArray(job.rawRequest.gemstones) && job.rawRequest.gemstones.length > 0) {
      return job.rawRequest.gemstones;
    }
    return [];
  };

  // Helper: Extract parsed stone lines from instructions
  const getParsedStoneRows = (text?: string): string[] => {
    if (!text) return [];
    const rows: string[] = [];
    const regex = /Row\s*#\d+:[^\n\r]+/gi;
    let match;
    while ((match = regex.exec(text)) !== null) {
      rows.push(match[0].trim());
    }
    return rows;
  };

  return (
    <div className="w-full space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-[#E5E7EF] shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-mono font-bold uppercase tracking-widest flex items-center gap-1">
              <Zap className="w-3 h-3 text-emerald-600" /> First-Accept-Wins Live Race
            </span>
            <span className="text-xs text-[#6B7280] font-mono">• Open Broadcast Pool</span>
          </div>
          <h1 className="font-serif text-2xl font-bold text-[#1E2230] tracking-tight">
            Available Custom CAD Job Pool
          </h1>
          <p className="text-xs text-[#6B7280] max-w-2xl font-light">
            Click on any commission card to inspect the complete blueprint and client specifications in the right drawer. The first CAD artisan to click <strong className="text-[#09112B] font-semibold">Accept This Job</strong> secures the order immediately.
          </p>
        </div>

        {/* Capacity Indicator Widget */}
        <div className="px-4 py-3 rounded-2xl bg-[#09112B] text-white text-right shrink-0 shadow-md">
          <div className="text-[10px] uppercase tracking-wider text-[#F5E7A3] font-mono">Workbench Capacity</div>
          <div className="text-base font-bold font-mono flex items-center justify-end gap-2 mt-0.5">
            <span className={isFullCapacity ? 'text-rose-400 font-bold' : 'text-emerald-400 font-bold'}>
              {activeJobsCount} / {staff.maxJobLimit} Occupied
            </span>
            <span className="text-[#C9C2A6] text-xs">
              ({staff.maxJobLimit - activeJobsCount} Open)
            </span>
          </div>
        </div>
      </div>

      {/* Real-time Scope Note */}
      <div className="p-4 rounded-2xl bg-[#FAF9F5] border border-[#C9A227]/30 text-xs text-[#1E2230] leading-relaxed flex items-start gap-3 shadow-sm">
        <Info className="w-4 h-4 text-[#C9A227] shrink-0 mt-0.5" />
        <div>
          <strong className="text-[#09112B] font-serif">Artisan Inspection Notice:</strong> Click any order card in the pool below to slide open the complete 3D CAD technical blueprint, ring sizes, metal purities, stone dimensions, and customer design notes from the right.
        </div>
      </div>

      {/* Full Capacity Error Banner */}
      {capacityError && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-between gap-3 text-xs text-rose-800 animate-fadeIn shadow-sm">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            <span className="font-medium">{capacityError}</span>
          </div>
          <button
            onClick={() => setCapacityError(null)}
            className="text-rose-700 hover:text-rose-950 underline font-bold cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Available Job Cards Grid */}
      {availableJobs.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-white border border-[#E5E7EF] space-y-4 shadow-sm">
          <Zap className="w-10 h-10 text-[#C9A227] mx-auto opacity-50" />
          <h3 className="font-serif text-xl font-bold text-[#1E2230]">No Open Orders in Broadcast Pool</h3>
          <p className="text-xs text-[#6B7280] max-w-md mx-auto">
            All negotiated client orders have been claimed or are awaiting Stage 1 booking confirmation. New approved commissions will appear here live in real-time.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {availableJobs.map((job) => {
            const isSecuringThis = securingJobId === job.id;

            return (
              <div
                key={job.id}
                onClick={() => setSelectedJobForDetails(job)}
                className="bg-white border-l-4 border-l-[#C9A227] border border-[#E5E7EF] hover:border-[#C9A227] rounded-2xl p-5 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between group relative overflow-hidden cursor-pointer"
              >
                {/* Release time pill & deadline */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-mono font-bold flex items-center gap-1">
                    <Clock className="w-3 h-3 text-emerald-600" />
                    Released {job.releasedTimeAgo}
                  </span>
                  <span className="text-[10px] text-[#6B7280] font-mono font-semibold">
                    Deadline: {job.deadlineHours}h
                  </span>
                </div>

                {/* Reference Image + Title */}
                <div className="space-y-3">
                  <div className="relative aspect-video rounded-xl overflow-hidden border border-[#E5E7EF] bg-slate-900 group">
                    <img
                      src={job.referenceImage}
                      alt={job.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    {/* Hover Overlay Hint */}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <span className="px-3 py-1.5 rounded-xl bg-[#09112B]/90 text-[#F5E7A3] text-xs font-mono font-bold flex items-center gap-1.5 shadow-lg border border-[#D4AF37]/60">
                        <Eye className="w-3.5 h-3.5 text-[#C9A227]" />
                        Click to View All Details
                      </span>
                    </div>

                    <div className="absolute top-2 right-2 px-2.5 py-1 rounded-lg bg-[#09112B]/90 backdrop-blur-md border border-[#D4AF37]/50 text-[#F5E7A3] font-mono font-bold text-[10px] shadow-md flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-[#C9A227]" />
                      <span>Priority Brief</span>
                    </div>
                    <div className="absolute bottom-2 left-2 px-2.5 py-0.5 rounded bg-black/80 backdrop-blur-md text-white text-[10px] font-mono border border-slate-700">
                      {job.metalPreference}
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded bg-[#09112B] text-[#F5E7A3] text-[10px] font-mono font-bold">
                        {job.orderNumber}
                      </span>
                      <span className="text-[10px] text-[#6B7280] font-bold uppercase tracking-wider">
                        {job.category}
                      </span>
                    </div>
                    <h3 className="font-serif font-bold text-[#1E2230] text-lg mt-1 group-hover:text-[#C9A227] transition-colors line-clamp-1">
                      {job.title}
                    </h3>
                    <p className="text-xs text-[#6B7280] line-clamp-2 mt-1">
                      {job.description}
                    </p>
                  </div>

                  {/* Specs Summary Pill Grid */}
                  <div className="grid grid-cols-2 gap-2 text-[11px] bg-[#F8FAFC] p-3 rounded-xl border border-[#E5E7EF] font-mono text-[#1E2230]">
                    <div>
                      <span className="text-[#6B7280] block text-[9px] uppercase font-semibold">Diamonds</span>
                      {job.specsSummary.diamondCount} stones
                    </div>
                    <div>
                      <span className="text-[#6B7280] block text-[9px] uppercase font-semibold">Weight Est</span>
                      {job.specsSummary.weightEst}
                    </div>
                    {job.specsSummary.ringSize && (
                      <div className="col-span-2">
                        <span className="text-[#6B7280] block text-[9px] uppercase font-semibold">Size</span>
                        {job.specsSummary.ringSize}
                      </div>
                    )}
                  </div>
                </div>

                {/* Card Footer: Quick Actions */}
                <div className="mt-5 pt-3 border-t border-[#E5E7EF] space-y-2">
                  <div className="flex items-center justify-between text-xs text-[#C9A227] font-semibold group-hover:translate-x-0.5 transition-transform">
                    <span className="flex items-center gap-1">
                      <Eye className="w-3.5 h-3.5" />
                      <span>Inspect Full Blueprint &amp; Specs</span>
                    </span>
                    <ChevronRight className="w-4 h-4 text-[#C9A227]" />
                  </div>

                  {/* Action Button: First-Accept-Wins */}
                  <button
                    disabled={isSecuringThis}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleClaimClick(job.id);
                    }}
                    className={`w-full py-3 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer ${
                      isFullCapacity
                        ? 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed'
                        : isSecuringThis
                        ? 'bg-[#09112B] text-[#F5E7A3] border border-[#D4AF37] animate-pulse'
                        : 'btn-gold-luxury font-semibold transform hover:-translate-y-0.5'
                    }`}
                  >
                    {isSecuringThis ? (
                      <>
                        <div className="w-4 h-4 border-2 border-[#D4AF37] border-t-transparent rounded-full animate-spin" />
                        <span>Securing Lock...</span>
                      </>
                    ) : isFullCapacity ? (
                      <>
                        <Lock className="w-4 h-4 text-slate-400" />
                        <span>Workbench Capacity Full</span>
                      </>
                    ) : (
                      <>
                        <Zap className="w-4 h-4 fill-[#0B1330]" />
                        <span>Accept This Job (First-Wins)</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ========================================================================= */}
      {/* SLIDE-OVER RIGHT SIDEBAR DRAWER: COMPLETE TECHNICAL BLUEPRINT & DETAILS   */}
      {/* ========================================================================= */}
      {selectedJobForDetails && (() => {
        const job = selectedJobForDetails;
        const imagesList = getJobImages(job);
        const activeImg = imagesList[selectedImageIndex] || imagesList[0];
        const stonesList = getGemstonesList(job);
        const parsedRows = getParsedStoneRows(job.special_instructions || job.description);
        const isSecuringActive = securingJobId === job.id;

        const metalStr = job.metal_alloy_name || job.gold_purity || job.metalPreference || '18K Yellow Gold';
        const ringSizeDisplay = job.ring_size || job.specsSummary.ringSize || 'Custom Size';
        const weightDisplay = job.target_weight_grams ? `${job.target_weight_grams}g` : job.specsSummary.weightEst || `Calibrated ${metalStr}`;
        const styleDisplay = job.aesthetic_style_name || 'Bespoke Masterpiece';

        return (
          <div className="fixed inset-0 z-50 overflow-hidden animate-fadeIn">
            {/* Backdrop Blur Overlay */}
            <div
              className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
              onClick={() => setSelectedJobForDetails(null)}
            />

            {/* Slide-Over Drawer Container (Slides smoothly from Right) */}
            <div className="fixed inset-y-0 right-0 max-w-full flex pl-6 sm:pl-12">
              <div className="w-screen max-w-2xl bg-[#FAF8F5] shadow-2xl flex flex-col border-l border-[#D4AF37]/40 animate-slide-in-right">
                
                {/* DRAWER TOP HEADER */}
                <div className="p-6 bg-[#09112B] text-white border-b border-[#D4AF37]/30 shrink-0">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-1 rounded-md bg-[#D4AF37] text-[#09112B] font-mono font-extrabold text-xs shadow-sm">
                        {job.orderNumber}
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-mono font-bold uppercase tracking-wider flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                        Available in Open Pool
                      </span>
                      <span className="px-2 py-0.5 rounded bg-white/10 text-slate-300 font-mono text-[10px]">
                        Deadline: {job.deadlineHours}h SLA
                      </span>
                    </div>

                    {/* Close Button */}
                    <button
                      type="button"
                      onClick={() => setSelectedJobForDetails(null)}
                      className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-colors cursor-pointer flex items-center gap-1 text-xs"
                      title="Close drawer (Esc)"
                    >
                      <X className="w-5 h-5" />
                      <span className="text-[10px] font-mono hidden sm:inline">ESC</span>
                    </button>
                  </div>

                  <div className="mt-3">
                    <div className="text-[10px] uppercase tracking-wider text-[#D4AF37] font-mono font-bold">
                      {job.category} • Client Design Commission
                    </div>
                    <h2 className="font-serif text-2xl font-bold text-[#FAF8F3] mt-0.5">
                      {job.title}
                    </h2>
                  </div>
                </div>

                {/* DRAWER SCROLLABLE BODY */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
                  
                  {/* SECTION 1: REFERENCE ARTWORK & CAD BLUEPRINT GALLERY */}
                  <div className="bg-white rounded-2xl border border-[#E5E7EF] p-4 shadow-sm space-y-3">
                    <div className="flex items-center justify-between border-b border-[#E5E7EF] pb-2">
                      <span className="text-xs font-serif font-bold text-[#1E2230] uppercase tracking-wider flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-[#C9A227]" />
                        Client Reference Artwork &amp; Design Sketch
                      </span>
                      <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 font-mono text-[10px] font-bold">
                        Confidential Brief
                      </span>
                    </div>

                    {/* Main Image Stage */}
                    <div className="relative aspect-video rounded-xl overflow-hidden bg-slate-900 border border-[#E5E7EF] group">
                      <img
                        src={activeImg}
                        alt="Reference Blueprint"
                        className="w-full h-full object-contain cursor-zoom-in"
                        onClick={() => setActiveZoomImage(activeImg)}
                      />
                      <button
                        type="button"
                        onClick={() => setActiveZoomImage(activeImg)}
                        className="absolute bottom-3 right-3 px-3 py-1.5 rounded-xl bg-[#09112B]/90 backdrop-blur-md border border-[#D4AF37]/60 text-[#F5E7A3] font-mono text-[11px] font-bold flex items-center gap-1.5 shadow-lg opacity-90 hover:opacity-100 transition-opacity cursor-pointer"
                      >
                        <Maximize2 className="w-3.5 h-3.5 text-[#C9A227]" />
                        <span>Click to Enlarge (4K Zoom)</span>
                      </button>
                    </div>

                    {/* Multi-thumbnail row if multiple sketches exist */}
                    {imagesList.length > 1 && (
                      <div className="flex items-center gap-2 overflow-x-auto pt-1 pb-1">
                        {imagesList.map((img, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => setSelectedImageIndex(idx)}
                            className={`w-16 h-16 rounded-lg overflow-hidden border-2 transition-all shrink-0 cursor-pointer ${
                              selectedImageIndex === idx
                                ? 'border-[#C9A227] shadow-md scale-105'
                                : 'border-slate-200 opacity-60 hover:opacity-100'
                            }`}
                          >
                            <img src={img} alt={`Sketch ${idx + 1}`} className="w-full h-full object-cover" />
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* SECTION 2: MASTER TECHNICAL SPECIFICATIONS GRID */}
                  <div className="space-y-3">
                    <h3 className="font-serif text-sm font-bold text-[#1E2230] uppercase tracking-wider flex items-center gap-2">
                      <Compass className="w-4 h-4 text-[#C9A227]" />
                      Master Structural &amp; Material Specifications
                    </h3>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {/* Metal & Purity */}
                      <div className="p-3.5 rounded-xl bg-white border border-[#E5E7EF] shadow-sm space-y-1">
                        <span className="text-[10px] font-mono uppercase text-[#6B7280] block font-semibold flex items-center gap-1">
                          <Layers className="w-3 h-3 text-[#C9A227]" />
                          Metal Alloy &amp; Purity
                        </span>
                        <div className="font-serif font-bold text-sm text-[#09112B]">
                          {metalStr}
                        </div>
                        <span className="inline-block text-[10px] font-mono text-amber-900 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                          Hallmark Grade
                        </span>
                      </div>

                      {/* Ring Size */}
                      <div className="p-3.5 rounded-xl bg-white border border-[#E5E7EF] shadow-sm space-y-1">
                        <span className="text-[10px] font-mono uppercase text-[#6B7280] block font-semibold flex items-center gap-1">
                          <Ruler className="w-3 h-3 text-[#C9A227]" />
                          Ring Size
                        </span>
                        <div className="font-mono font-bold text-sm text-[#09112B]">
                          {ringSizeDisplay}
                        </div>
                        <span className="inline-block text-[10px] font-mono text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                          Calibrated Shank
                        </span>
                      </div>

                      {/* Target Weight */}
                      <div className="p-3.5 rounded-xl bg-white border border-[#E5E7EF] shadow-sm space-y-1">
                        <span className="text-[10px] font-mono uppercase text-[#6B7280] block font-semibold flex items-center gap-1">
                          <Scale className="w-3 h-3 text-[#C9A227]" />
                          Target Cast Weight
                        </span>
                        <div className="font-mono font-bold text-sm text-[#09112B]">
                          {weightDisplay}
                        </div>
                        <span className="inline-block text-[10px] font-mono text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded">
                          +1.8% Shrinkage Factored
                        </span>
                      </div>

                      {/* Category */}
                      <div className="p-3.5 rounded-xl bg-white border border-[#E5E7EF] shadow-sm space-y-1">
                        <span className="text-[10px] font-mono uppercase text-[#6B7280] block font-semibold">
                          Jewellery Classification
                        </span>
                        <div className="font-serif font-bold text-sm text-[#09112B]">
                          {job.category}
                        </div>
                        <span className="inline-block text-[10px] font-mono text-slate-500">
                          Watertight Solid
                        </span>
                      </div>

                      {/* Aesthetic Style */}
                      <div className="p-3.5 rounded-xl bg-white border border-[#E5E7EF] shadow-sm space-y-1">
                        <span className="text-[10px] font-mono uppercase text-[#6B7280] block font-semibold">
                          Aesthetic Silhouette
                        </span>
                        <div className="font-serif font-bold text-sm text-[#09112B] truncate">
                          {styleDisplay}
                        </div>
                        <span className="inline-block text-[10px] font-mono text-slate-500">
                          Haute Joaillerie
                        </span>
                      </div>

                      {/* SLA Production Window */}
                      <div className="p-3.5 rounded-xl bg-white border border-[#E5E7EF] shadow-sm space-y-1">
                        <span className="text-[10px] font-mono uppercase text-[#6B7280] block font-semibold flex items-center gap-1">
                          <Clock className="w-3 h-3 text-emerald-600" />
                          Delivery SLA Window
                        </span>
                        <div className="font-mono font-bold text-sm text-emerald-700">
                          {job.deadlineHours} Hours
                        </div>
                        <span className="inline-block text-[10px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                          Standard SLA
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* SECTION 3: DETAILED GEMSTONE & DIAMOND SCHEDULE */}
                  <div className="bg-white rounded-2xl border border-[#E5E7EF] p-5 shadow-sm space-y-3">
                    <div className="flex items-center justify-between border-b border-[#E5E7EF] pb-2">
                      <span className="text-xs font-serif font-bold text-[#1E2230] uppercase tracking-wider flex items-center gap-1.5">
                        <Gem className="w-4 h-4 text-indigo-600" />
                        Gemstone &amp; Diamond Specification Schedule
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 text-[10px] font-mono font-bold">
                        {stonesList.length || (parsedRows.length > 0 ? parsedRows.length : 0)} Stones Defined
                      </span>
                    </div>

                    {/* Render Stone Rows */}
                    {stonesList.length > 0 ? (
                      <div className="space-y-2">
                        {stonesList.map((stone: any, idx: number) => {
                          const isCenter = stone.is_center_stone || idx === 0;
                          return (
                            <div
                              key={idx}
                              className={`p-3.5 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs ${
                                isCenter
                                  ? 'bg-amber-50/50 border-amber-300'
                                  : 'bg-[#F8FAFC] border-[#E5E7EF]'
                              }`}
                            >
                              <div className="space-y-1">
                                <div className="font-bold text-[#1E2230] text-sm flex items-center gap-2">
                                  <span>{stone.quantity || 1}x {stone.stone_type || 'Natural Diamond'}</span>
                                  {isCenter && (
                                    <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-300 text-[10px] font-bold font-mono">
                                      MAIN CENTERPIECE
                                    </span>
                                  )}
                                </div>
                                <div className="text-[11px] text-[#4B5563] font-mono flex flex-wrap items-center gap-2">
                                  <span>Cut: <strong>{stone.cut_type || stone.shape || 'Round Brilliant'}</strong></span>
                                  <span>•</span>
                                  <span>Weight: <strong>{stone.carat_size ? `${stone.carat_size}` : (stone.size_value ? `${stone.size_value} ${stone.size_unit || 'ct'}` : '1.0 ct')}</strong></span>
                                  {stone.clarity && (
                                    <>
                                      <span>•</span>
                                      <span>Clarity: <strong>{stone.clarity}</strong></span>
                                    </>
                                  )}
                                  {stone.setting_style && (
                                    <>
                                      <span>•</span>
                                      <span>Setting: <strong>{stone.setting_style}</strong></span>
                                    </>
                                  )}
                                </div>
                              </div>

                              <span className="px-2.5 py-1 rounded-lg bg-[#09112B] text-[#F5E7A3] font-mono font-bold text-[10px] shrink-0 self-start sm:self-auto">
                                Stone #{idx + 1}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    ) : parsedRows.length > 0 ? (
                      <div className="space-y-2">
                        {parsedRows.map((rowText, idx) => (
                          <div
                            key={idx}
                            className="p-3.5 rounded-xl bg-amber-50/60 border border-amber-300 flex items-center justify-between gap-2 text-xs"
                          >
                            <div className="space-y-0.5">
                              <span className="font-mono font-bold text-amber-950 block text-xs">
                                {rowText}
                              </span>
                              <span className="text-[10px] font-mono text-amber-800">
                                Exact Customer Calibrated Setting Specification
                              </span>
                            </div>
                            <span className="px-2 py-1 rounded bg-[#09112B] text-[#F5E7A3] font-mono text-[10px] font-bold shrink-0">
                              Spec #{idx + 1}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-center text-xs text-slate-600 font-mono">
                        Solid Metal Jewellery Silhouette — No Gemstones Configured
                      </div>
                    )}
                  </div>

                  {/* SECTION 4: CLIENT WRITTEN INSTRUCTIONS & DESIGN BRIEF */}
                  <div className="bg-white rounded-2xl border border-[#E5E7EF] p-5 shadow-sm space-y-2.5">
                    <span className="text-xs font-serif font-bold text-[#1E2230] uppercase tracking-wider flex items-center gap-1.5">
                      <FileText className="w-4 h-4 text-[#C9A227]" />
                      Customer Written Brief &amp; Special Instructions
                    </span>
                    <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#C9A227]/30 text-xs text-[#1E2230] leading-relaxed italic font-serif">
                      "{job.description || job.special_instructions || 'Customer requested premium watertight 3D CAD design adhering to atelier standard guidelines.'}"
                    </div>
                  </div>

                  {/* SECTION 5: CATALOG INSPIRATION REFERENCES (IF ANY) */}
                  {(job.catalog_references_text || (job.catalog_references && job.catalog_references.length > 0)) && (
                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
                      <span className="text-[11px] font-mono uppercase font-bold text-slate-700 block">
                        Catalog Design Reference &amp; SKU Alignment
                      </span>
                      <p className="text-xs font-mono text-slate-800">
                        {job.catalog_references_text || (Array.isArray(job.catalog_references) ? job.catalog_references.map(c => `[SKU #${c.sku_id || c.id}: ${c.title || 'Reference'}]`).join(' • ') : '')}
                      </p>
                    </div>
                  )}

                  {/* SECTION 6: ARTISAN CAD MANUFACTURING STANDARDS CHECKLIST */}
                  <div className="p-4 rounded-2xl bg-[#09112B] text-white border border-[#D4AF37]/40 shadow-sm space-y-2">
                    <div className="flex items-center gap-2 text-[#D4AF37]">
                      <ShieldCheck className="w-4 h-4" />
                      <h4 className="font-serif font-bold text-xs uppercase tracking-wider">
                        Atelier CAD Engineering Standards for this Order
                      </h4>
                    </div>
                    <ul className="text-[11px] text-slate-300 space-y-1 font-mono">
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span>Mesh Geometry: 100% Watertight Closed Manifold Solid (.STL)</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span>Wall Thickness: Minimum 1.0mm - 1.2mm for {metalStr} durability</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span>Stone Bearing Seats: Cut to 35% depth with castable prong safety</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span>Deliverables Required: Rhino Master (.3DM) + Castable (.STL) + 4K Renders</span>
                      </li>
                    </ul>
                  </div>

                  {/* SECTION 7: STRICT CONFIDENTIALITY NOTICE */}
                  <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-950 flex items-start gap-2.5">
                    <Lock className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                    <div>
                      <strong className="font-bold">Confidentiality Guarantee:</strong> As per Shiuli CAD Studio artisan protocol, all client billing and negotiated order amounts remain strictly confidential between Client and SuperAdmin.
                    </div>
                  </div>

                </div>

                {/* DRAWER STICKY FOOTER: ACCEPT ACTION */}
                <div className="p-5 bg-white border-t border-[#E5E7EF] flex items-center justify-between gap-4 shrink-0 shadow-lg">
                  <div>
                    <span className="text-[10px] uppercase font-mono text-[#6B7280] block">Workbench Slot</span>
                    <span className="text-xs font-mono font-bold text-[#1E2230]">
                      {activeJobsCount} / {staff.maxJobLimit} In Use
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setSelectedJobForDetails(null)}
                      className="px-4 py-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
                    >
                      Close Details
                    </button>

                    <button
                      type="button"
                      disabled={isSecuringActive || isFullCapacity}
                      onClick={() => handleClaimClick(job.id)}
                      className={`px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow-lg transition-all cursor-pointer ${
                        isFullCapacity
                          ? 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed'
                          : isSecuringActive
                          ? 'bg-[#09112B] text-[#F5E7A3] border border-[#D4AF37] animate-pulse'
                          : 'btn-gold-luxury transform hover:-translate-y-0.5'
                      }`}
                    >
                      {isSecuringActive ? (
                        <>
                          <div className="w-4 h-4 border-2 border-[#D4AF37] border-t-transparent rounded-full animate-spin" />
                          <span>Securing Lock...</span>
                        </>
                      ) : isFullCapacity ? (
                        <>
                          <Lock className="w-4 h-4 text-slate-400" />
                          <span>Workbench Full</span>
                        </>
                      ) : (
                        <>
                          <Zap className="w-4 h-4 fill-[#0B1330]" />
                          <span>Accept This Job (First-Wins)</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

              </div>
            </div>
          </div>
        );
      })()}

      {/* ========================================================================= */}
      {/* 4K LIGHTBOX IMAGE ZOOM MODAL                                              */}
      {/* ========================================================================= */}
      {activeZoomImage && (
        <div
          className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-4 sm:p-8 animate-fadeIn"
          onClick={() => setActiveZoomImage(null)}
        >
          <div
            className="relative max-w-4xl max-h-[90vh] rounded-2xl overflow-hidden border-2 border-[#D4AF37] shadow-2xl bg-black"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setActiveZoomImage(null)}
              className="absolute top-4 right-4 p-2.5 rounded-full bg-black/70 text-white hover:bg-black transition-colors cursor-pointer z-10"
              title="Close 4K Zoom (Esc)"
            >
              <X className="w-5 h-5" />
            </button>
            <img
              src={activeZoomImage}
              alt="4K Reference Zoom"
              className="w-full h-full object-contain max-h-[85vh]"
            />
          </div>
        </div>
      )}
    </div>
  );
};
