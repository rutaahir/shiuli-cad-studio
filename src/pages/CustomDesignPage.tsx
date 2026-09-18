import React, { useState, useEffect, useMemo, useRef } from 'react';
import { PageId } from '../types';
import {
  api,
  OptionGroupData,
  CustomRequestStonePayload
} from '../services/api';
import { useAuth } from '../context/AuthContext';
import { appStore } from '../services/store';
import {
  Sparkles,
  Upload,
  Check,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  FileText,
  Gem,
  Plus,
  Trash2,
  AlertCircle,
  Loader2,
  HelpCircle,
  X,
  Ruler,
  ShieldCheck,
  Clock,
  Layers,
  Feather,
  Box,
  Sliders,
  CheckCircle,
  Mic,
  MicOff,
  Volume2,
  Play,
  Pause,
  Radio,
  FileAudio
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface CustomDesignPageProps {
  initialProductId?: string;
  onNavigate: (page: PageId, extraId?: string) => void;
}

// Ring Size Conversion Matrix
const RING_SIZE_CONVERSION_TABLE = [
  { us: '4', uk: 'H 1/2', in_hk: '7', eu: '47', inside_mm: '14.9 mm' },
  { us: '4.5', uk: 'I 1/2', in_hk: '8', eu: '48', inside_mm: '15.3 mm' },
  { us: '5', uk: 'J 1/2', in_hk: '9', eu: '49.5', inside_mm: '15.7 mm' },
  { us: '5.5', uk: 'K 1/2', in_hk: '10', eu: '50.5', inside_mm: '16.1 mm' },
  { us: '6', uk: 'L 1/2', in_hk: '12', eu: '52', inside_mm: '16.5 mm' },
  { us: '6.5', uk: 'M 1/2', in_hk: '13', eu: '53', inside_mm: '16.9 mm' },
  { us: '7', uk: 'N 1/2', in_hk: '14', eu: '54.5', inside_mm: '17.3 mm' },
  { us: '7.5', uk: 'O 1/2', in_hk: '15', eu: '55.5', inside_mm: '17.7 mm' },
  { us: '8', uk: 'P 1/2', in_hk: '16', eu: '57', inside_mm: '18.1 mm' },
  { us: '8.5', uk: 'Q 1/2', in_hk: '17', eu: '58', inside_mm: '18.5 mm' },
  { us: '9', uk: 'R 1/2', in_hk: '18', eu: '59.5', inside_mm: '18.9 mm' },
  { us: '9.5', uk: 'S 1/2', in_hk: '19', eu: '60.5', inside_mm: '19.3 mm' },
  { us: '10', uk: 'T 1/2', in_hk: '20', eu: '62', inside_mm: '19.8 mm' },
  { us: '10.5', uk: 'U 1/2', in_hk: '22', eu: '63', inside_mm: '20.2 mm' },
  { us: '11', uk: 'V 1/2', in_hk: '23', eu: '64.5', inside_mm: '20.6 mm' },
  { us: '12', uk: 'Y', in_hk: '25', eu: '67.5', inside_mm: '21.4 mm' },
];

<<<<<<< HEAD
const DEFAULT_OPTION_GROUPS: any[] = [
  {
    id: 1,
    key: 'metal',
    label: 'Metal Alloy Selection',
    display_type: 'swatch',
    options: [
      { id: 101, key: '18k_yellow_gold', label: '18K Yellow Gold', swatch_color: '#E5C158', is_active: true },
      { id: 102, key: '14k_yellow_gold', label: '14K Yellow Gold', swatch_color: '#F0D478', is_active: true },
      { id: 103, key: '18k_white_gold', label: '18K White Gold', swatch_color: '#E0E3E6', is_active: true },
      { id: 104, key: '18k_rose_gold', label: '18K Rose Gold', swatch_color: '#E8A398', is_active: true },
      { id: 105, key: 'platinum_950', label: 'Platinum 950', swatch_color: '#E5E4E2', is_active: true },
      { id: 106, key: 'silver_925', label: 'Sterling Silver 925', swatch_color: '#D8D8D8', is_active: true },
    ]
  },
  {
    id: 2,
    key: 'gold_purity',
    label: 'Gold Purity Standard',
    display_type: 'pill',
    options: [
      { id: 201, key: '18k', label: '18K Gold (750)', is_active: true },
      { id: 202, key: '14k', label: '14K Gold (585)', is_active: true },
      { id: 203, key: '22k', label: '22K Gold (916)', is_active: true },
      { id: 204, key: '10k', label: '10K Gold (417)', is_active: true },
      { id: 205, key: '24k', label: '24K Pure Gold', is_active: true },
    ]
  },
  {
    id: 3,
    key: 'design_style',
    label: 'Aesthetic & Setting Architecture',
    display_type: 'card',
    options: [
      { id: 301, key: 'solitaire', label: 'Solitaire Focus', description: 'Single prominent center stone focus with clean classic lines', is_active: true },
      { id: 302, key: 'halo', label: 'Halo Surround', description: 'Center stone encircled by high-brilliance accent pave diamonds', is_active: true },
      { id: 303, key: 'vintage', label: 'Vintage Filigree & Milgrain', description: 'Hand-carved vintage lace filigree with delicate milgrain borders', is_active: true },
      { id: 304, key: 'modern', label: 'Modern Minimalist', description: 'Sleek architectural lines, bezel/tension settings, contemporary profile', is_active: true },
      { id: 305, key: 'cathedral', label: 'Cathedral Arch', description: 'Elevated center head supported by elegant graceful metal arches', is_active: true },
      { id: 306, key: 'articulated', label: 'Multi-Stone Articulated', description: 'Interlocking multi-part links or multi-stone cluster composition', is_active: true },
    ]
  },
  {
    id: 4,
    key: 'ring_type',
    label: 'Ring Style Profile',
    display_type: 'pill',
    options: [
      { id: 401, key: 'engagement', label: 'Engagement Ring', is_active: true },
      { id: 402, key: 'eternity', label: 'Eternity Band', is_active: true },
      { id: 403, key: 'cocktail', label: 'Statement / Cocktail Ring', is_active: true },
      { id: 404, key: 'mens_signet', label: 'Men\'s Signet Ring', is_active: true },
      { id: 405, key: 'stackable', label: 'Stackable Band', is_active: true },
    ]
  },
  {
    id: 5,
    key: 'cad_file_format',
    label: 'Required CAD Output Format',
    display_type: 'select',
    options: [
      { id: 501, key: 'standard_3dm_stl', label: 'Rhino 8 Native .3DM + Watertight Solid .STL + 4K Renders', description: 'Recommended for 3D Printing & Master Casting', is_active: true },
      { id: 502, key: 'matrix_gold', label: 'MatrixGold / CounterSketch .3DM Pack', is_active: true },
      { id: 503, key: 'stl_only', label: 'High-Res Solid STL Mesh Only', is_active: true },
    ]
  },
  {
    id: 6,
    key: 'delivery_speed',
    label: 'CAD Delivery Turnaround',
    display_type: 'select',
    options: [
      { id: 601, key: 'standard', label: 'Standard Atelier Delivery (24-48 Hours)', is_active: true },
      { id: 602, key: 'rush', label: 'Rush Express Delivery (12 Hours)', is_active: true },
    ]
  }
];

export const CustomDesignPage: React.FC<CustomDesignPageProps> = ({
  initialProductId,
  onNavigate,
}) => {
  const { user } = useAuth();
  const catalogState = useCatalog();

  // Navigation & Step Control
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submittedTicket, setSubmittedTicket] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionError, setSubmissionError] = useState('');
  const [showRingSizeModal, setShowRingSizeModal] = useState(false);

  // Dynamic Option Groups from Backend API
  const [optionGroups, setOptionGroups] = useState<OptionGroupData[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [optionsLoading, setOptionsLoading] = useState(true);

  // Category Selection
  const [selectedCategory, setSelectedCategory] = useState<string>('rings');
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);

  // Category-Specific Specs
  const [ringSizeStandard, setRingSizeStandard] = useState('US');
  const [ringSize, setRingSize] = useState('6.5');
  const [targetWeightGrams, setTargetWeightGrams] = useState('4.5');
  const [heightMm, setHeightMm] = useState('');
  const [widthMm, setWidthMm] = useState('');
  const [chainLength, setChainLength] = useState('18 inches (Standard)');
  const [earringBacking, setEarringBacking] = useState('Push Back');
  const [wristCircumference, setWristCircumference] = useState('');
  const [braceletStyle, setBraceletStyle] = useState('Kada');
  const [customSpecsText, setCustomSpecsText] = useState('');

  // Selections Map for Dynamic Option Groups (group.key -> option_value.id)
  const [selections, setSelections] = useState<Record<string, number>>({});

  // Stones Specification
  const [isMetalOnly, setIsMetalOnly] = useState(false);
  const [stonesList, setStonesList] = useState<CustomRequestStonePayload[]>([
    {
      stone_type: 'Natural Diamond',
      shape: 'Round Brilliant',
      setting_style: 'Prong',
      size_value: '1.0',
      size_unit: 'carat',
      clarity: 'VS1',
      quantity: 1,
      is_center_stone: true
    }
  ]);

  // Personalization & Branding
  const [engravingText, setEngravingText] = useState('');
  const [engravingFont, setEngravingFont] = useState('Script');
  const [engravingPlacement, setEngravingPlacement] = useState('Inside Shank');
  const [hasLogo, setHasLogo] = useState(false);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreviewUrl, setLogoPreviewUrl] = useState<string>('');
  const [logoError, setLogoError] = useState('');

  // Step 4 Reference Images - 2 Mode Options: Existing Products vs Upload Files
  const [activeReferenceTab, setActiveReferenceTab] = useState<'catalog' | 'upload'>('catalog');
  const [catalogSearchQuery, setCatalogSearchQuery] = useState('');
  const [catalogCategoryFilter, setCatalogCategoryFilter] = useState('all');
  const [selectedCatalogProducts, setSelectedCatalogProducts] = useState<SelectedCatalogRef[]>([]);

  // Files & Attachments
  const [sketchFiles, setSketchFiles] = useState<File[]>([]);
  const [sketchPreviews, setSketchPreviews] = useState<string[]>([]);
  const [specialInstructions, setSpecialInstructions] = useState(
    initialProductId ? `Referencing SKU #${initialProductId} modifications.` : ''
  );

  // Project Complexity Tier & Needed By Date
  const [projectTier, setProjectTier] = useState('High Precision Fine Jewelry');
  const [neededByDate, setNeededByDate] = useState('');
  const [selectedDeliverySpeedId, setSelectedDeliverySpeedId] = useState<number | null>(null);

  // Contact Info & Portfolio Consent
  const [clientName, setClientName] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [clientConsent, setClientConsent] = useState(false);

  // Prefill Auth User Info
  useEffect(() => {
    if (user) {
      if (user.first_name) setClientName(`${user.first_name} ${user.last_name || ''}`.trim());
      if (user.email) setClientEmail(user.email);
      if (user.phone_number) setClientPhone(user.phone_number);
    }
  }, [user]);

  // Merge Catalog Products for Reference Selection (Backend + Mock fallback)
  const availableCatalogProducts = useMemo<SelectedCatalogRef[]>(() => {
    const list: SelectedCatalogRef[] = [];

    // Add backend products
    if (catalogState.products && catalogState.products.length > 0) {
      catalogState.products.forEach(bp => {
        list.push({
          id: bp.id || bp.slug,
          title: bp.title,
          category: bp.category_name || 'Jewelry',
          image: bp.primary_image || '/unsplash-img/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=600&q=80'
        });
      });
    }

    // Add static products if empty or to augment
    PRODUCTS.forEach(p => {
      if (!list.some(item => String(item.id) === String(p.id))) {
        list.push({
          id: p.id,
          title: p.title,
          category: p.category,
          image: p.primaryImage
        });
      }
    });

    return list;
  }, [catalogState.products]);

  // Filtered Catalog Items for Reference Picker
  const filteredCatalogItems = useMemo(() => {
    return availableCatalogProducts.filter(item => {
      const matchesSearch = item.title.toLowerCase().includes(catalogSearchQuery.toLowerCase()) ||
                            String(item.id).toLowerCase().includes(catalogSearchQuery.toLowerCase());
      const matchesCategory = catalogCategoryFilter === 'all' ||
                              item.category.toLowerCase().includes(catalogCategoryFilter.toLowerCase());
      return matchesSearch && matchesCategory;
    });
  }, [availableCatalogProducts, catalogSearchQuery, catalogCategoryFilter]);

  // Auto-select initialProductId if passed (either catalog product or category pre-selection)
  useEffect(() => {
    if (initialProductId) {
      // 1. Pre-select category if initialProductId matches a category slug
      const cleanId = initialProductId.toLowerCase().replace('-cad-design', '').replace('-cad', '');
      if (categories.length > 0) {
        const matchedCat = categories.find((c: any) => 
          (c.slug && c.slug.toLowerCase().includes(cleanId)) || 
          (c.name && c.name.toLowerCase().includes(cleanId)) ||
          cleanId.includes(c.slug?.toLowerCase() || '')
        );
        if (matchedCat) {
          setSelectedCategory(matchedCat.slug || matchedCat.name.toLowerCase());
          setSelectedCategoryId(matchedCat.id);
        } else {
          // Fallback category matching for common keywords
          if (cleanId.includes('ring')) setSelectedCategory('rings');
          else if (cleanId.includes('earring')) setSelectedCategory('earrings');
          else if (cleanId.includes('pendant')) setSelectedCategory('pendants');
          else if (cleanId.includes('necklace')) setSelectedCategory('necklaces');
          else if (cleanId.includes('bracelet')) setSelectedCategory('bracelets');
          else if (cleanId.includes('bangle')) setSelectedCategory('bangles');
          else if (cleanId.includes('bridal')) setSelectedCategory('bridal');
          else if (cleanId.includes('men')) setSelectedCategory('mens');
        }
      }

      // 2. Select catalog product reference if available
      if (availableCatalogProducts.length > 0) {
        const match = availableCatalogProducts.find(p => String(p.id) === String(initialProductId));
        if (match && !selectedCatalogProducts.some(p => String(p.id) === String(match.id))) {
          setSelectedCatalogProducts(prev => [...prev, match]);
        }
      }
    }
  }, [initialProductId, availableCatalogProducts, categories]);

=======
>>>>>>> d78b1bc (Update Shiuli CAD Studio DONE)
const DEFAULT_OPTION_GROUPS: OptionGroupData[] = [
  {
    id: 1,
    key: 'metal',
    label: 'Metal Alloy',
    description: 'Target metal alloy and color',
    is_required: true,
    display_order: 1,
    options: [
      { id: 101, group: 1, group_key: 'metal', key: 'yellow_gold', label: 'Yellow Gold', description: '', price_modifier: '0', modifier_type: 'FLAT', swatch_color: '#E5C158', is_active: true, display_order: 1 },
      { id: 102, group: 1, group_key: 'metal', key: 'rose_gold', label: 'Rose Gold', description: '', price_modifier: '0', modifier_type: 'FLAT', swatch_color: '#E8A398', is_active: true, display_order: 2 },
      { id: 103, group: 1, group_key: 'metal', key: 'white_gold', label: 'White Gold', description: '', price_modifier: '0', modifier_type: 'FLAT', swatch_color: '#E0E5EC', is_active: true, display_order: 3 },
      { id: 104, group: 1, group_key: 'metal', key: 'platinum', label: 'Platinum 950', description: '', price_modifier: '20', modifier_type: 'PERCENT', swatch_color: '#D4D8E2', is_active: true, display_order: 4 },
      { id: 105, group: 1, group_key: 'metal', key: 'sterling_silver', label: '925 Sterling Silver', description: '', price_modifier: '-15', modifier_type: 'PERCENT', swatch_color: '#C0C0C0', is_active: true, display_order: 5 },
    ]
  },
  {
    id: 2,
    key: 'gold_purity',
    label: 'Gold Purity',
    description: 'Gold Karat / Purity Standard',
    is_required: true,
    display_order: 2,
    options: [
      { id: 201, group: 2, group_key: 'gold_purity', key: '18k', label: '18K (750)', description: '', price_modifier: '0', modifier_type: 'FLAT', swatch_color: '', is_active: true, display_order: 1 },
      { id: 202, group: 2, group_key: 'gold_purity', key: '14k', label: '14K (585)', description: '', price_modifier: '0', modifier_type: 'FLAT', swatch_color: '', is_active: true, display_order: 2 },
      { id: 203, group: 2, group_key: 'gold_purity', key: '22k', label: '22K (916)', description: '', price_modifier: '0', modifier_type: 'FLAT', swatch_color: '', is_active: true, display_order: 3 },
      { id: 204, group: 2, group_key: 'gold_purity', key: '10k', label: '10K (417)', description: '', price_modifier: '0', modifier_type: 'FLAT', swatch_color: '', is_active: true, display_order: 4 },
      { id: 205, group: 2, group_key: 'gold_purity', key: '9k', label: '9K (375)', description: '', price_modifier: '0', modifier_type: 'FLAT', swatch_color: '', is_active: true, display_order: 5 },
    ]
  },
  {
    id: 3,
    key: 'design_style',
    label: 'Design Style',
    description: 'Aesthetic setting architecture',
    is_required: true,
    display_order: 3,
    options: [
      { id: 301, group: 3, group_key: 'design_style', key: 'solitaire', label: 'Solitaire Classic', description: 'Single centerpiece focus with clean minimal wirework', price_modifier: '0', modifier_type: 'FLAT', swatch_color: '', is_active: true, display_order: 1 },
      { id: 302, group: 3, group_key: 'design_style', key: 'halo', label: 'Micro-Pavé Halo', description: 'Surrounding accent diamond frame for extra sparkle', price_modifier: '0', modifier_type: 'FLAT', swatch_color: '', is_active: true, display_order: 2 },
      { id: 303, group: 3, group_key: 'design_style', key: 'vintage', label: 'Vintage Filigree', description: 'Intricate 3D relief wirework and milgrain edge details', price_modifier: '0', modifier_type: 'FLAT', swatch_color: '', is_active: true, display_order: 3 },
      { id: 304, group: 3, group_key: 'design_style', key: 'modern', label: 'Modern Geometric', description: 'Sleek architectural chamfers and clean knife-edge lines', price_modifier: '0', modifier_type: 'FLAT', swatch_color: '', is_active: true, display_order: 4 },
    ]
  },
  {
    id: 4,
    key: 'cad_file_format',
    label: 'Required CAD Output Format',
    description: 'File delivery format',
    is_required: true,
    display_order: 4,
    options: [
      { id: 401, group: 4, group_key: 'cad_file_format', key: '3dm', label: '.3DM Rhino 8 Native + .STL', description: 'Layered NURBS source file & wax print mesh', price_modifier: '0', modifier_type: 'FLAT', swatch_color: '', is_active: true, display_order: 1 },
      { id: 402, group: 4, group_key: 'cad_file_format', key: 'stl', label: '.STL High-Density Mesh Only', description: 'Watertight ready for direct 3D printing', price_modifier: '0', modifier_type: 'FLAT', swatch_color: '', is_active: true, display_order: 2 },
      { id: 403, group: 4, group_key: 'cad_file_format', key: 'obj', label: '.OBJ / .STEP Universal CAD', description: 'Universal CAD assembly format', price_modifier: '0', modifier_type: 'FLAT', swatch_color: '', is_active: true, display_order: 3 },
    ]
  }
];

<<<<<<< HEAD
  // Load Option Groups & Categories from Backend with Fallbacks
=======
// Voice Instructions Control Component with Live Speech-to-Text & Audio Recording
const VoiceInstructionsControl: React.FC<{
  value: string;
  onChange: (text: string) => void;
  onAudioFileAttached: (file: File) => void;
  onAudioFileRemoved: (file: File) => void;
}> = ({ value, onChange, onAudioFileAttached, onAudioFileRemoved }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [speechRecognition, setSpeechRecognition] = useState<any>(null);
  const [voiceStatus, setVoiceStatus] = useState<string>('');
  const [recordedAudioUrl, setRecordedAudioUrl] = useState<string | null>(null);
  const [attachedAudioFile, setAttachedAudioFile] = useState<File | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioProgress, setAudioProgress] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const timerRef = useRef<any>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const startRecording = async () => {
    setVoiceStatus('');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const chunks: Blob[] = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };

      recorder.onstop = () => {
        const mime = recorder.mimeType || 'audio/webm';
        const audioBlob = new Blob(chunks, { type: mime });
        const url = URL.createObjectURL(audioBlob);
        const fileName = `Voice_Note_${new Date().toISOString().slice(0,10)}_${Date.now()}.webm`;
        const file = new File([audioBlob], fileName, { type: audioBlob.type });

        setRecordedAudioUrl(url);
        setAttachedAudioFile(file);
        onAudioFileAttached(file);
        setVoiceStatus('Voice note recorded & attached successfully!');
      };

      recorder.start();
      setMediaRecorder(recorder);

      // Speech Recognition API (Live Speech to Text)
      const SpeechRec = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRec) {
        const recognition = new SpeechRec();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        recognition.onresult = (event: any) => {
          let currentTranscript = '';
          for (let i = event.resultIndex; i < event.results.length; i++) {
            currentTranscript += event.results[i][0].transcript;
          }
          if (currentTranscript.trim()) {
            onChange(value ? `${value.trim()} ${currentTranscript.trim()}` : currentTranscript.trim());
          }
        };

        recognition.onerror = (e: any) => {
          console.warn('Speech recognition notice:', e.error);
        };

        recognition.start();
        setSpeechRecognition(recognition);
      }

      setIsRecording(true);
      setRecordingSeconds(0);
      timerRef.current = setInterval(() => {
        setRecordingSeconds(prev => prev + 1);
      }, 1000);

    } catch (err: any) {
      console.error('Mic access error:', err);
      setVoiceStatus('Microphone permission required. Please allow mic access in browser.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
      mediaRecorder.stop();
      mediaRecorder.stream.getTracks().forEach(track => track.stop());
    }
    if (speechRecognition) {
      try {
        speechRecognition.stop();
      } catch (e) {}
    }
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    setIsRecording(false);
  };

  const handleAudioUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const url = URL.createObjectURL(file);
      setRecordedAudioUrl(url);
      setAttachedAudioFile(file);
      onAudioFileAttached(file);
      setVoiceStatus(`Uploaded voice note: ${file.name}`);
    }
  };

  const removeAudioNote = () => {
    if (attachedAudioFile) {
      onAudioFileRemoved(attachedAudioFile);
    }
    if (recordedAudioUrl) {
      URL.revokeObjectURL(recordedAudioUrl);
    }
    setRecordedAudioUrl(null);
    setAttachedAudioFile(null);
    setIsPlaying(false);
    setAudioProgress(0);
    setVoiceStatus('');
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
  };

  const togglePlayAudio = () => {
    if (!audioRef.current && recordedAudioUrl) {
      const audio = new Audio(recordedAudioUrl);
      audio.ontimeupdate = () => {
        if (audio.duration) {
          setAudioProgress((audio.currentTime / audio.duration) * 100);
        }
      };
      audio.onended = () => {
        setIsPlaying(false);
        setAudioProgress(0);
      };
      audioRef.current = audio;
    }

    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        audioRef.current.play();
        setIsPlaying(true);
      }
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <label className="text-xs font-bold text-[#F5E7A3] uppercase tracking-wider block">
          Special CAD Instructions &amp; Customization Notes
        </label>

        {/* Voice Action Buttons */}
        <div className="flex items-center gap-2">
          {!isRecording ? (
            <button
              type="button"
              onClick={startRecording}
              className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-[#F5E7A3] via-[#D4AF37] to-[#B8860B] text-[#0B1330] font-extrabold text-xs shadow-md hover:scale-105 transition-all flex items-center gap-1.5"
            >
              <Mic className="w-4 h-4 text-[#0B1330]" /> Record Voice Note
            </button>
          ) : (
            <button
              type="button"
              onClick={stopRecording}
              className="px-3.5 py-1.5 rounded-xl bg-red-600 text-white font-extrabold text-xs shadow-lg animate-pulse flex items-center gap-1.5"
            >
              <Radio className="w-4 h-4 text-white animate-spin" /> Stop ({formatTime(recordingSeconds)})
            </button>
          )}

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="px-3.5 py-1.5 rounded-xl bg-[#121F4D]/80 border border-[#D4AF37]/40 text-[#F5E7A3] hover:bg-[#D4AF37]/20 font-bold text-xs transition-all flex items-center gap-1.5"
          >
            <Upload className="w-3.5 h-3.5 text-[#D4AF37]" /> Upload Voice Note
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="audio/*,.mp3,.wav,.m4a,.webm,.ogg,.aac"
            onChange={handleAudioUpload}
            className="hidden"
          />
        </div>
      </div>

      {/* Recording status indicator */}
      {isRecording && (
        <div className="p-3 rounded-xl bg-[#1E4FA3]/30 border border-[#5B8DEF]/40 flex items-center gap-3 animate-pulse text-xs text-[#F5E7A3]">
          <span className="w-3 h-3 rounded-full bg-red-500 animate-ping" />
          <span className="font-semibold">Recording Voice Note &amp; Auto-Transcribing Speech... Speak into your microphone.</span>
        </div>
      )}

      {/* Textarea */}
      <textarea
        rows={4}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Describe stone layout modifications, prong counts, shank width requirements, or click 'Record Voice Note' to speak..."
        className="w-full bg-[#09112B] border border-white/10 rounded-2xl p-4 text-xs text-white placeholder-slate-500 focus:border-[#D4AF37] outline-none leading-relaxed transition-all"
      />

      {/* Audio Player Card (If Voice Note Recorded or Uploaded) */}
      {recordedAudioUrl && attachedAudioFile && (
        <div className="p-3.5 rounded-2xl bg-[#121F4D]/90 border border-[#D4AF37]/40 flex items-center justify-between gap-3 shadow-lg">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={togglePlayAudio}
              className="w-9 h-9 rounded-full bg-[#D4AF37] text-[#0B1330] flex items-center justify-center font-bold shadow-md hover:scale-110 transition-transform"
            >
              {isPlaying ? <Pause className="w-4 h-4 text-[#0B1330]" /> : <Play className="w-4 h-4 ml-0.5 text-[#0B1330]" />}
            </button>

            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <FileAudio className="w-3.5 h-3.5 text-[#D4AF37]" />
                <span className="text-xs font-bold text-[#F5E7A3] max-w-[200px] truncate">
                  {attachedAudioFile.name}
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#D4AF37]/20 text-[#F5E7A3] font-mono">
                  {(attachedAudioFile.size / 1024).toFixed(0)} KB
                </span>
              </div>

              {/* Progress bar */}
              <div className="w-36 sm:w-56 h-1.5 bg-black/40 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[#F5E7A3] to-[#D4AF37] transition-all duration-200"
                  style={{ width: `${audioProgress}%` }}
                />
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={removeAudioNote}
            className="p-2 text-slate-400 hover:text-red-400 hover:bg-white/5 rounded-lg transition-colors"
            title="Remove Voice Note"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      )}

      {voiceStatus && !isRecording && (
        <p className="text-[11px] text-emerald-400 font-medium flex items-center gap-1">
          <CheckCircle className="w-3.5 h-3.5" /> {voiceStatus}
        </p>
      )}
    </div>
  );
};

export const CustomDesignPage: React.FC<CustomDesignPageProps> = ({
  initialProductId,
  onNavigate,
}) => {
  const { user } = useAuth();

  // Navigation & Step Control
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submittedTicket, setSubmittedTicket] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionError, setSubmissionError] = useState('');
  const [showRingSizeModal, setShowRingSizeModal] = useState(false);

  // Dynamic Option Groups from Backend API
  const [optionGroups, setOptionGroups] = useState<OptionGroupData[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [optionsLoading, setOptionsLoading] = useState(true);

  // Category Selection
  const [selectedCategory, setSelectedCategory] = useState<string>('rings');
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);

  // Category-Specific Specs
  const [ringSizeStandard, setRingSizeStandard] = useState('US');
  const [ringSize, setRingSize] = useState('6.5');
  const [targetWeightGrams, setTargetWeightGrams] = useState('4.5');
  const [heightMm, setHeightMm] = useState('');
  const [widthMm, setWidthMm] = useState('');
  const [chainLength, setChainLength] = useState('18 inches (Standard)');
  const [earringBacking, setEarringBacking] = useState('Push Back');
  const [wristCircumference, setWristCircumference] = useState('');
  const [braceletStyle, setBraceletStyle] = useState('Kada');
  const [customSpecsText, setCustomSpecsText] = useState('');

  // Selections Map for Dynamic Option Groups (group.key -> option_value.id)
  const [selections, setSelections] = useState<Record<string, number>>({});

  // Stones Specification
  const [isMetalOnly, setIsMetalOnly] = useState(false);
  const [stonesList, setStonesList] = useState<CustomRequestStonePayload[]>([
    {
      stone_type: 'Natural Diamond',
      shape: 'Round Brilliant',
      setting_style: 'Prong',
      size_value: '1.0',
      size_unit: 'carat',
      clarity: 'VS1',
      quantity: 1,
      is_center_stone: true
    }
  ]);

  // Files & Attachments
  const [sketchFiles, setSketchFiles] = useState<File[]>([]);
  const [sketchPreviews, setSketchPreviews] = useState<string[]>([]);
  const [specialInstructions, setSpecialInstructions] = useState(
    initialProductId ? `Referencing SKU #${initialProductId} modifications.` : ''
  );

  // Contact Info & Portfolio Consent
  const [clientName, setClientName] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [clientConsent, setClientConsent] = useState(false);

  // Prefill Auth User Info
  useEffect(() => {
    if (user) {
      if (user.first_name) setClientName(`${user.first_name} ${user.last_name || ''}`.trim());
      if (user.email) setClientEmail(user.email);
      if (user.phone_number) setClientPhone(user.phone_number);
    }
  }, [user]);

  // Load Option Groups & Categories from Backend
>>>>>>> d78b1bc (Update Shiuli CAD Studio DONE)
  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      setOptionsLoading(true);
      try {
        const [groupsData, catsData] = await Promise.all([
          api.getOptionGroups().catch(() => []),
          api.getCategories(true).catch(() => [])
        ]);

        if (!isMounted) return;

        const effectiveGroups = (Array.isArray(groupsData) && groupsData.length > 0) ? groupsData : DEFAULT_OPTION_GROUPS;
        setOptionGroups(effectiveGroups);
        setCategories(Array.isArray(catsData) ? catsData : []);

        if (Array.isArray(catsData) && catsData.length > 0) {
          const initialMatch = catsData.find((c: any) => 
            c.slug?.toLowerCase() === 'rings' || 
            c.name?.toLowerCase().includes('ring')
          ) || catsData[0];
          setSelectedCategoryId(initialMatch.id);
        }

        // Set default selections for each group
        const defaults: Record<string, number> = {};
        effectiveGroups.forEach(group => {
          const activeOptions = (group.options || []).filter(o => o.is_active);
          if (activeOptions.length > 0) {
            defaults[group.key] = activeOptions[0].id;
          }
        });
        setSelections(defaults);
      } catch (err) {
        console.error('Failed to load custom design option groups:', err);
        if (isMounted) {
          setOptionGroups(DEFAULT_OPTION_GROUPS);
          const defaults: Record<string, number> = {};
          DEFAULT_OPTION_GROUPS.forEach(group => {
            const activeOptions = (group.options || []).filter(o => o.is_active);
            if (activeOptions.length > 0) {
              defaults[group.key] = activeOptions[0].id;
            }
          });
          setSelections(defaults);
        }
      } finally {
        if (isMounted) setOptionsLoading(false);
      }
    }
    loadData();
    return () => { isMounted = false; };
  }, []);

  // Dynamic Category Selector Config from API (filtered to exclude test items)
  const [apiCategories, setApiCategories] = useState<any[]>([]);

  useEffect(() => {
    api.getCategories(true).then((cats) => {
      if (cats && Array.isArray(cats) && cats.length > 0) {
        setApiCategories(cats);
      }
    }).catch(() => {});
  }, []);

  const categoryGroups = useMemo(() => {
    if (apiCategories.length > 0) {
      const filtered = apiCategories.filter(
        (c) => !c.name.toLowerCase().includes('test') && c.slug !== 'xyz'
      );
      if (filtered.length > 0) {
        return filtered.map((c) => ({
          id: c.slug,
          name: c.name,
          icon: c.slug.includes('ring') ? Sparkles : c.slug.includes('ear') ? Gem : c.slug.includes('pendant') ? Layers : Ruler,
          desc: `Bespoke ${c.name} 3D CAD modeling & precision engineering.`
        }));
      }
    }
    return [
      { id: 'rings', name: 'Rings', icon: Sparkles, desc: 'Engagement, Solitaire, Eternity, Wedding & Fashion Rings' },
      { id: 'pendants', name: 'Pendants & Necklaces', icon: Layers, desc: 'Pendants, Solitaire Drops, Statement Chokers & Chains' },
      { id: 'earrings', name: 'Earrings', icon: Gem, desc: 'Studs, Drop Earrings, Dangles, Hoops & Huggies' },
      { id: 'bracelets', name: 'Bracelets & Bangles', icon: Ruler, desc: 'Kadas, Tennis Bracelets, Stackable Bangles & Cuffs' },
      { id: 'other', name: 'Custom / Other', icon: Feather, desc: 'Brooches, Cufflinks, Sculptures & Specialty Concepts' },
    ];
  }, [apiCategories]);

  // Helper maps for option groups with fallbacks
  const groupMap = useMemo(() => {
    const map: Record<string, OptionGroupData> = {};
    DEFAULT_OPTION_GROUPS.forEach(g => {
      map[g.key] = g;
    });
    optionGroups.forEach(g => {
      if (g && g.key && (g.options || []).length > 0) {
        map[g.key] = g;
      }
    });
    return map;
  }, [optionGroups]);

  const selectedMetalObj = useMemo(() => {
    const metalGroupId = selections['metal'];
    if (!metalGroupId || !groupMap['metal']) return null;
    return groupMap['metal'].options.find(o => o.id === metalGroupId);
  }, [selections, groupMap]);

  const isGoldSelected = useMemo(() => {
    if (!selectedMetalObj) return true;
    const label = selectedMetalObj.label.toLowerCase();
    const key = selectedMetalObj.key.toLowerCase();
    return label.includes('gold') || key.includes('gold');
  }, [selectedMetalObj]);

  // Handle Sketches Upload
  const handleSketchUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArr = Array.from(e.target.files);
      setSketchFiles(prev => [...prev, ...filesArr]);
      const newPreviews = filesArr.map(f => URL.createObjectURL(f as Blob));
      setSketchPreviews(prev => [...prev, ...newPreviews]);
    }
  };

  const removeSketch = (index: number) => {
    setSketchFiles(prev => prev.filter((_, i) => i !== index));
    setSketchPreviews(prev => prev.filter((_, i) => i !== index));
  };

  // Audio file callbacks for Voice Note
  const handleAudioFileAttached = (file: File) => {
    setSketchFiles(prev => [...prev, file]);
  };

  const handleAudioFileRemoved = (file: File) => {
    setSketchFiles(prev => prev.filter(f => f !== file));
  };

  // Stone Add/Remove
  const addStoneRow = () => {
    setStonesList(prev => [
      ...prev,
      {
        stone_type: 'Natural Diamond',
        shape: 'Round Brilliant',
        setting_style: 'Prong',
        size_value: '0.50',
        size_unit: 'carat',
        clarity: 'VS1',
        quantity: 1,
        is_center_stone: false
      }
    ]);
  };

  const removeStoneRow = (index: number) => {
    setStonesList(prev => prev.filter((_, i) => i !== index));
  };

  const updateStoneRow = (index: number, field: keyof CustomRequestStonePayload, val: any) => {
    setStonesList(prev => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: val };
      return copy;
    });
  };

  // Handle Form Submission
  const handleSubmit = async (submissionIntent: 'quote_only' | 'place_order') => {
    setSubmissionError('');
    setIsSubmitting(true);

    try {
      const selectedValueIds: number[] = Object.values(selections).filter((id): id is number => typeof id === 'number' && Boolean(id));
      const selectedOptionsPayload = selectedValueIds.map(valId => {
        let groupObj = optionGroups.find(g => (g.options || []).some(o => o.id === valId));
        return {
          option_group: groupObj ? groupObj.id : 1,
          option_value: valId
        };
      });

<<<<<<< HEAD
      // Find selected metal, purity & style labels
      const metalGroup = optionGroups.find(g => g.key === 'metal');
      const purityGroup = optionGroups.find(g => g.key === 'gold_purity');
      const styleGroup = optionGroups.find(g => g.key === 'design_style');

      const selectedMetalOpt = metalGroup?.options?.find(o => o.id === selections['metal']);
      const selectedPurityOpt = purityGroup?.options?.find(o => o.id === selections['gold_purity']);
      const selectedStyleOpt = styleGroup?.options?.find(o => o.id === selections['design_style']);

      const metalNameStr = selectedMetalOpt
        ? (isGoldSelected && selectedPurityOpt ? `${selectedPurityOpt.label} ${selectedMetalOpt.label}` : selectedMetalOpt.label)
        : '18K Yellow Gold';
      const styleNameStr = selectedStyleOpt ? selectedStyleOpt.label : 'Bespoke Custom CAD';
      const swatchColor = selectedMetalOpt?.swatch_color || '#E5C158';

      // Build comprehensive specification summary text
      const specLines: string[] = [];
      specLines.push(`=== 3D CAD MASTER SPECIFICATION BRIEF ===`);
      specLines.push(`Category: ${selectedCategory.toUpperCase()}`);

      if (selectedCategory === 'rings') {
        specLines.push(`Ring Sizing: ${ringSizeStandard} Standard | Size: ${ringSize} | Target Weight: ${targetWeightGrams}g`);
      } else if (selectedCategory === 'pendants') {
        specLines.push(`Pendant Dimensions: ${heightMm || 'N/A'}mm (H) x ${widthMm || 'N/A'}mm (W) | Chain: ${chainLength}`);
      } else if (selectedCategory === 'earrings') {
        specLines.push(`Earring Architecture: ${heightMm || 'N/A'}mm Drop/Stud | Backing: ${earringBacking}`);
      } else if (selectedCategory === 'bracelets') {
        specLines.push(`Wrist Specs: ${wristCircumference || 'N/A'} | Style: ${braceletStyle}`);
      } else if (customSpecsText) {
        specLines.push(`Custom Structural Specs: ${customSpecsText}`);
      }

      specLines.push(`Metal Alloy & Purity: ${metalNameStr}`);
      specLines.push(`Design Style: ${styleNameStr}`);

      if (isMetalOnly) {
        specLines.push(`Gemstone Setup: Solid Metal Design (No Stones)`);
      } else if (stonesList.length > 0) {
        specLines.push(`Gemstones Layout (${stonesList.length} Row/Group):`);
        stonesList.forEach((s, idx) => {
          specLines.push(`  Row #${idx + 1}: ${s.quantity}x ${s.stone_type} (${s.shape}), ${s.size_value} ${s.size_unit}, ${s.clarity}, Setting: ${s.setting_style} ${s.is_center_stone ? '[MAIN CENTERPIECE]' : ''}`);
        });
      }

      if (engravingText) {
        specLines.push(`Engraving: "${engravingText}" (${engravingFont} Font, ${engravingPlacement})`);
      }
      if (hasLogo) {
        specLines.push(`Hallmark Vector Logo Stamp: Yes (Required on 3D geometry)`);
      }

      if (selectedCatalogProducts.length > 0) {
        specLines.push(`Catalog References (${selectedCatalogProducts.length}): ${selectedCatalogProducts.map(p => `[SKU #${p.id}: ${p.title}]`).join(', ')}`);
      }

      if (specialInstructions) {
        specLines.push(`Special Instructions: ${specialInstructions}`);
      }

      const fullNotes = specLines.join('\n');

      const mapRingStandard = (std: string) => {
        if (!std) return 'us';
        const s = std.toLowerCase();
        if (s === 'in_hk' || s === 'in' || s === 'hk') return 'in';
        if (['us', 'uk', 'eu', 'in', 'mm'].includes(s)) return s;
        return 'us';
      };

      const finalContactName = clientName.trim() || (user?.first_name ? `${user.first_name} ${user.last_name || ''}`.trim() : user?.username || 'Valued Client');
      const finalContactPhone = clientPhone.trim() || user?.phone_number || '+91 9876543210';
      const finalContactEmail = clientEmail.trim() || user?.email || '';

      const matchedCat = categories.find((c: any) =>
        c.slug?.toLowerCase() === selectedCategory.toLowerCase() ||
        c.name?.toLowerCase() === selectedCategory.toLowerCase() ||
        c.name?.toLowerCase().includes(selectedCategory.toLowerCase())
      );
      const resolvedCategory = matchedCat ? matchedCat.id : (selectedCategoryId || (categories && categories.length > 0 ? categories[0].id : 1));
      const parsedWeight = parseFloat(targetWeightGrams);
      const safeWeight = (!isNaN(parsedWeight) && parsedWeight > 0) ? parsedWeight : null;

      const purityStr = selectedPurityOpt ? selectedPurityOpt.label : (isGoldSelected ? '24K' : '');
      const catalogRefsString = selectedCatalogProducts.length > 0 
        ? selectedCatalogProducts.map(p => `[#${p.id}] ${p.title} (${p.category || ''})`).join(', ')
        : '';

=======
>>>>>>> d78b1bc (Update Shiuli CAD Studio DONE)
      const bodyData = {
        category: resolvedCategory,
        description: fullNotes,
        special_instructions: fullNotes,
        gold_purity: purityStr,
        contact_email: finalContactEmail,
        contact_name: finalContactName,
        contact_phone: finalContactPhone,
        ring_size_standard: mapRingStandard(ringSizeStandard),
        ring_size: selectedCategory === 'rings' ? (ringSize || '6.5') : '',
        target_weight_grams: selectedCategory === 'rings' ? safeWeight : null,
        height_mm: heightMm || '',
        width_mm: widthMm || '',
        chain_length: chainLength || '',
        earring_backing: earringBacking || '',
        wrist_circumference: wristCircumference || '',
        bracelet_style: braceletStyle || '',
        custom_specs_text: customSpecsText || '',
        catalog_references_text: catalogRefsString,
        is_metal_only: isMetalOnly,
<<<<<<< HEAD
        engraving_text: engravingText || '',
        engraving_font: engravingFont || '',
        engraving_placement: engravingPlacement || '',
        has_logo: hasLogo,
        budget_range: projectTier || '',
        needed_by_date: neededByDate || null,
        submission_intent: submissionIntent,
        selections_data: selectedOptionsPayload,
        stones_data: isMetalOnly ? [] : stonesList.map(s => ({
          stone_type: s.stone_type,
          quantity: Number(s.quantity) || 1,
          size_value: String(s.size_value || ''),
          size_unit: s.size_unit || 'carat',
          clarity: s.clarity || 'VS1',
          is_center_stone: Boolean(s.is_center_stone),
        })),
      };

      let res: any = null;
      try {
        res = await api.createCustomRequest(bodyData);
      } catch (err: any) {
        console.warn('Primary backend submission failed, attempting failsafe database save...', err);
        // Failsafe retry with minimal clean payload
        try {
          res = await api.createCustomRequest({
            description: fullNotes,
            special_instructions: fullNotes,
            contact_email: finalContactEmail,
            contact_name: finalContactName,
            contact_phone: finalContactPhone,
            ring_size: selectedCategory === 'rings' ? (ringSize || '6.5') : '',
            ring_size_standard: mapRingStandard(ringSizeStandard),
            custom_specs_text: customSpecsText || '',
            catalog_references_text: catalogRefsString,
            is_metal_only: isMetalOnly,
            engraving_text: engravingText || '',
          });
        } catch (retryErr: any) {
          console.error('Database persistence failed:', retryErr);
          throw new Error(retryErr?.message || 'Failed to save order specification to database. Please try again.');
        }
      }

      if (!res || !res.id) {
        throw new Error('Database did not return a valid order ID. Please try again.');
      }

      const userKey = (user?.email || clientEmail || user?.username || 'anonymous').toLowerCase();
      const newReqKey = `shiuli_user_custom_requests_${userKey}`;
      
      const allSketches: any[] = [
        ...sketchPreviews.map((url, i) => ({ id: i + 1, image_url: url, image: url })),
        ...selectedCatalogProducts.map((p, i) => ({ id: 100 + i, image_url: p.image, image: p.image, title: p.title }))
      ];

      const formattedStones = isMetalOnly ? [] : stonesList.map(s => ({
        stone_type: s.stone_type,
        cut_type: s.shape,
        carat_size: `${s.size_value} ${s.size_unit}`,
        quantity: s.quantity,
        setting_style: s.setting_style,
        clarity: s.clarity,
        is_center_stone: s.is_center_stone
      }));

      const newReqItem = {
        ...res,
        id: res.id,
        client_name: finalContactName,
        contact_name: finalContactName,
        client_email: finalContactEmail,
        contact_phone: finalContactPhone,
        category_name: matchedCat?.name || (selectedCategory ? selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1) : 'Rings'),
        aesthetic_style_name: styleNameStr,
        metal_alloy_name: metalNameStr,
        metal_swatch_color: swatchColor,
        gold_purity: purityStr,
        custom_specs_text: customSpecsText || '',
        catalog_references_text: catalogRefsString,
        is_metal_only: isMetalOnly,
        ring_size: ringSize,
        ring_size_standard: ringSizeStandard,
        target_weight_grams: targetWeightGrams,
        engraving_text: engravingText,
        engraving_font: engravingFont,
        engraving_placement: engravingPlacement,
        has_logo: hasLogo,
        estimated_price_shown: res.estimated_price_shown || 0,
        status: res.status || 'new',
        description: fullNotes,
        created_at: res.created_at || new Date().toISOString(),
        messages: res.messages || [],
        sketches: res.sketches || allSketches,
        gemstones: res.gemstones || formattedStones,
        budget_range: projectTier,
        needed_by_date: neededByDate || null,
        special_instructions: fullNotes,
=======
        special_instructions: specialInstructions,
>>>>>>> d78b1bc (Update Shiuli CAD Studio DONE)
        client_consent_to_feature: clientConsent,
        submission_intent: submissionIntent,
        client_phone: finalContactPhone,
        selected_options: selectedOptionsPayload,
        stones: isMetalOnly ? [] : (res.stones || formattedStones || stonesList)
      };

      // Save into user-scoped localStorage for Client Dashboard
      let existingUserReqs: any[] = [];
      try {
        const stored = localStorage.getItem(newReqKey);
        if (stored) existingUserReqs = JSON.parse(stored);
      } catch {}
      existingUserReqs.unshift(newReqItem);
      localStorage.setItem(newReqKey, JSON.stringify(existingUserReqs));

      // Also save into global shiuli_store_custom_requests for Admin & Staff realtime visibility
      let existingStoreReqs: any[] = [];
      try {
        const storeRaw = localStorage.getItem('shiuli_store_custom_requests');
        if (storeRaw) existingStoreReqs = JSON.parse(storeRaw);
      } catch {}
      if (!existingStoreReqs.some((r: any) => String(r.id) === String(newReqItem.id))) {
        existingStoreReqs.unshift(newReqItem);
        localStorage.setItem('shiuli_store_custom_requests', JSON.stringify(existingStoreReqs));
      }

      // Also register in appStore for Admin view
      appStore.addCustomRequest({
        id: String(newReqItem.id),
        clientName: newReqItem.client_name,
        clientEmail: newReqItem.client_email,
        clientPhone: clientPhone || '',
        jewelleryType: newReqItem.category_name,
        metalPreference: metalNameStr,
        targetBudget: styleNameStr,
        description: fullNotes,
        status: 'new',
        createdAt: new Date().toISOString(),
        messages: [],
        gemstones: formattedStones,
        sketches: allSketches
      } as any);

      // Dispatch real-time cross-tab events
      window.dispatchEvent(new Event('storage'));
      window.dispatchEvent(new CustomEvent('shiuli_custom_requests_changed', { detail: newReqItem }));

      setSubmittedTicket(res || newReqItem);
      setIsSubmitted(true);
      confetti({ particleCount: 140, spread: 90, origin: { y: 0.55 } });
    } catch (err: any) {
      console.error('Submission error:', err);
      setSubmissionError(err.message || 'Failed to submit design specification. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-[#060B1E] text-[#F5F1E8] pt-24 pb-24 px-4 sm:px-8 lg:px-12 relative overflow-hidden">
        <div className="max-w-3xl mx-auto bg-[#09112B]/90 backdrop-blur-xl rounded-3xl border border-[#D4AF37]/40 shadow-2xl p-8 sm:p-12 text-center my-8">
          <div className="w-20 h-20 bg-gradient-to-br from-[#F5E7A3] via-[#D4AF37] to-[#B8860B] rounded-full flex items-center justify-center mx-auto mb-6 text-[#0B1330] shadow-[0_0_30px_rgba(212,175,55,0.4)]">
            <CheckCircle2 className="w-10 h-10 animate-pulse" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-serif gold-gradient-text font-bold mb-3 tracking-wide">
            {submittedTicket?.submission_intent === 'quote_only'
              ? 'Specification Quote Requested'
              : 'Custom 3D CAD Request Submitted!'}
          </h1>
          <p className="text-[#FAF8F3]/80 text-base sm:text-lg mb-8 max-w-xl mx-auto leading-relaxed">
            Your custom specification ticket <span className="font-mono font-bold text-[#F5E7A3] bg-[#D4AF37]/20 px-3 py-1 rounded-full border border-[#D4AF37]/30">#{submittedTicket?.ticket_id || 'CR-SUCCESS'}</span> has been assigned to our master CAD engineering team.
          </p>

          <div className="bg-[#121F4D]/80 border border-[#D4AF37]/30 rounded-2xl p-6 text-left mb-8 max-w-md mx-auto space-y-3">
            <h3 className="font-serif gold-gradient-text text-sm font-bold uppercase tracking-widest pb-2 border-b border-[#D4AF37]/20">
              Specification Details
            </h3>
            <div className="space-y-2 text-xs text-[#FAF8F3]/80">
              <div className="flex justify-between">
                <span className="text-[#FAF8F3]/60">Design Category:</span>
                <span className="font-bold text-[#FAF8F3] capitalize">{selectedCategory}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#FAF8F3]/60">Client Contact:</span>
                <span className="font-bold text-[#F5E7A3]">{clientName || user?.first_name || 'Valued Client'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#FAF8F3]/60">Included Assets:</span>
                <span className="font-bold text-[#D4AF37]">3DM + Printable STL + 4K Renders</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => onNavigate('account', 'custom')}
              className="px-8 py-3.5 btn-gold-luxury font-bold rounded-xl shadow-lg transition-all flex items-center justify-center gap-2"
            >
              View My Custom CAD Order & Journey <ArrowRight className="w-5 h-5" />
            </button>
            <button
              onClick={() => {
                setIsSubmitted(false);
                setCurrentStep(1);
              }}
              className="px-8 py-3.5 bg-transparent border border-[#D4AF37]/40 text-[#F5E7A3] font-bold rounded-xl hover:bg-[#D4AF37]/10 transition-all"
            >
              Start Another Custom Specification
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#060B1E] text-[#F5F1E8] pt-24 sm:pt-28 pb-24 px-4 sm:px-6 lg:px-8 xl:px-12 relative overflow-hidden">
      <div className="max-w-[1400px] mx-auto space-y-6 relative z-10">

        {/* HEADER */}
        <div className="text-center max-w-3xl mx-auto space-y-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#D4AF37]/10 border border-[#D4AF37]/30 text-[#F5E7A3]">
            <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" /> 3D CAD Studio &amp; Bespoke Custom Orders
          </span>
          <h1 className="text-3xl sm:text-4xl font-serif gold-gradient-text font-bold tracking-tight">
            Custom Jewelry 3D CAD Studio
          </h1>
          <p className="text-[#FAF8F3]/70 text-xs sm:text-sm">
            Create your custom jewelry design in 3 easy steps. Get 100% castable, print-ready 3D CAD files.
          </p>
        </div>

        {/* SIMPLIFIED 3-STEPPER HEADER */}
        <div className="w-full bg-[#09112B]/80 backdrop-blur-md p-4 rounded-2xl border border-[#D4AF37]/30 shadow-xl max-w-3xl mx-auto">
          <div className="grid grid-cols-3 gap-2 text-center">
            {[
              { step: 1, title: '1. Category & Metal' },
              { step: 2, title: '2. Photos & Notes' },
              { step: 3, title: '3. Contact & Submit' },
            ].map((s) => (
              <button
                key={s.step}
                onClick={() => currentStep > s.step && setCurrentStep(s.step)}
                disabled={currentStep < s.step}
                className={`py-2.5 px-3 rounded-xl font-bold text-xs sm:text-sm transition-all duration-300 flex items-center justify-center gap-2 ${
                  currentStep === s.step
                    ? 'bg-gradient-to-r from-[#F5E7A3] via-[#D4AF37] to-[#B8860B] text-[#0B1330] shadow-[0_0_15px_rgba(212,175,55,0.4)] font-extrabold scale-[1.02]'
                    : currentStep > s.step
                    ? 'bg-[#1E4FA3]/40 text-[#F5E7A3] border border-[#5B8DEF]/40 cursor-pointer hover:bg-[#1E4FA3]/60'
                    : 'bg-[#121F4D]/40 text-[#FAF8F3]/40 border border-white/5 cursor-not-allowed'
                }`}
              >
                {currentStep > s.step ? <Check className="w-4 h-4 text-[#F5E7A3]" /> : null}
                <span>{s.title}</span>
              </button>
            ))}
          </div>
        </div>

        {/* MAIN LAYOUT: FORM + SUMMARY SIDEBAR */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Main Form Area */}
          <div className="lg:col-span-8 bg-[#09112B]/85 backdrop-blur-xl rounded-3xl p-6 sm:p-8 border border-[#D4AF37]/30 shadow-2xl space-y-6">
            {optionsLoading ? (
              <div className="py-20 text-center">
                <Loader2 className="w-10 h-10 text-[#D4AF37] animate-spin mx-auto mb-4" />
                <p className="text-[#FAF8F3]/60 font-medium text-sm">Loading studio design parameters...</p>
              </div>
            ) : (
              <>
                {/* STEP 1: CATEGORY & METAL SPECS */}
                {currentStep === 1 && (
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-xl font-serif gold-gradient-text font-bold mb-1">Step 1: Choose Design Category &amp; Metal</h2>
                      <p className="text-xs text-[#FAF8F3]/60">Select what type of jewelry you want to create and your metal preferences.</p>
                    </div>

                    {/* Category Selection Grid */}
                    <div className="space-y-3">
                      <label className="text-xs font-bold text-[#F5E7A3] uppercase tracking-wider block">
                        Jewelry Category
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {categoryGroups.map((cat) => {
                          const IconComp = cat.icon;
                          const isSelected = selectedCategory === cat.id;
                          return (
                            <div
                              key={cat.id}
                              onClick={() => {
                                setSelectedCategory(cat.id);
                                const match = categories.find(c => c.slug === cat.id);
                                if (match) setSelectedCategoryId(match.id);
                              }}
                              className={`cursor-pointer p-4 rounded-2xl border transition-all duration-300 flex flex-col justify-between ${
                                isSelected
                                  ? 'bg-gradient-to-br from-[#12204B] to-[#1E3678] border-[#D4AF37] shadow-[0_0_20px_rgba(212,175,55,0.25)] ring-2 ring-[#D4AF37]/50'
                                  : 'bg-[#121F4D]/50 border-white/10 hover:border-[#D4AF37]/40 hover:bg-[#121F4D]/80'
                              }`}
                            >
                              <div className="flex items-start justify-between mb-3">
                                <div className={`p-2.5 rounded-xl ${isSelected ? 'bg-[#D4AF37] text-[#0B1330]' : 'bg-[#09112B] text-[#D4AF37]'}`}>
                                  <IconComp className="w-5 h-5" />
                                </div>
                                {isSelected && (
                                  <div className="w-5 h-5 rounded-full bg-[#D4AF37] text-[#0B1330] flex items-center justify-center">
                                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                                  </div>
                                )}
                              </div>
                              <div>
                                <h3 className={`font-serif font-bold text-sm mb-1 ${isSelected ? 'text-[#F5E7A3]' : 'text-[#FAF8F3]'}`}>
                                  {cat.name}
                                </h3>
                                <p className="text-[11px] text-[#FAF8F3]/60 leading-tight">
                                  {cat.desc}
                                </p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Ring Specific Details */}
                    {selectedCategory === 'rings' && (
                      <div className="bg-[#121F4D]/40 border border-[#D4AF37]/20 rounded-2xl p-5 space-y-4">
                        <div className="flex justify-between items-center">
                          <h4 className="font-serif gold-gradient-text font-bold text-sm flex items-center gap-2">
                            <Ruler className="w-4 h-4 text-[#D4AF37]" /> Ring Size &amp; Target Weight
                          </h4>
                          <button
                            type="button"
                            onClick={() => setShowRingSizeModal(true)}
                            className="text-xs text-[#F5E7A3] underline hover:text-[#D4AF37] flex items-center gap-1"
                          >
                            <HelpCircle className="w-3.5 h-3.5" /> View Size Conversion Chart
                          </button>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                          <div>
                            <label className="text-[11px] text-[#FAF8F3]/70 font-semibold block mb-1">Size Standard</label>
                            <select
                              value={ringSizeStandard}
                              onChange={(e) => setRingSizeStandard(e.target.value)}
                              className="w-full bg-[#09112B] border border-white/10 rounded-xl p-2.5 text-xs text-white focus:border-[#D4AF37] outline-none"
                            >
                              <option value="US">US / Canada</option>
                              <option value="UK">UK / Australia</option>
                              <option value="IN_HK">India / Hong Kong</option>
                              <option value="EU">EU (ISO Standard)</option>
                            </select>
                          </div>
                          <div>
                            <label className="text-[11px] text-[#FAF8F3]/70 font-semibold block mb-1">Target Ring Size</label>
                            <select
                              value={ringSize}
                              onChange={(e) => setRingSize(e.target.value)}
                              className="w-full bg-[#09112B] border border-white/10 rounded-xl p-2.5 text-xs text-white focus:border-[#D4AF37] outline-none"
                            >
                              {RING_SIZE_CONVERSION_TABLE.map((row) => (
                                <option key={row.us} value={row.us}>
                                  US {row.us} ({row.inside_mm})
                                </option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <label className="text-[11px] text-[#FAF8F3]/70 font-semibold block mb-1">Est. Target Gold Weight (g)</label>
                            <input
                              type="number"
                              step="0.1"
                              value={targetWeightGrams}
                              onChange={(e) => setTargetWeightGrams(e.target.value)}
                              placeholder="e.g. 4.5"
                              className="w-full bg-[#09112B] border border-white/10 rounded-xl p-2.5 text-xs text-white focus:border-[#D4AF37] outline-none"
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Metal & Alloy Options */}
                    {groupMap['metal'] && (
                      <div className="space-y-3">
                        <label className="text-xs font-bold text-[#F5E7A3] uppercase tracking-wider block">
                          Metal Alloy
                        </label>
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                          {groupMap['metal'].options.map((opt) => {
                            const isSelected = selections['metal'] === opt.id;
                            return (
                              <button
                                key={opt.id}
                                type="button"
                                onClick={() => setSelections(prev => ({ ...prev, metal: opt.id }))}
                                className={`p-3 rounded-xl border text-left transition-all flex flex-col items-center justify-center gap-2 ${
                                  isSelected
                                    ? 'bg-[#D4AF37]/20 border-[#D4AF37] text-[#F5E7A3] shadow-[0_0_12px_rgba(212,175,55,0.3)] font-bold'
                                    : 'bg-[#121F4D]/40 border-white/10 text-slate-300 hover:bg-[#121F4D]/80'
                                }`}
                              >
                                {opt.swatch_color && (
                                  <span
                                    className="w-5 h-5 rounded-full border border-white/20 shadow-inner"
                                    style={{ backgroundColor: opt.swatch_color }}
                                  />
                                )}
                                <span className="text-xs text-center">{opt.label}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Gold Purity */}
                    {isGoldSelected && groupMap['gold_purity'] && (
                      <div className="space-y-3">
                        <label className="text-xs font-bold text-[#F5E7A3] uppercase tracking-wider block">
                          Gold Purity
                        </label>
                        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                          {groupMap['gold_purity'].options.map((opt) => {
                            const isSelected = selections['gold_purity'] === opt.id;
                            return (
                              <button
                                key={opt.id}
                                type="button"
                                onClick={() => setSelections(prev => ({ ...prev, gold_purity: opt.id }))}
                                className={`py-2.5 px-3 rounded-xl border text-center text-xs font-semibold transition-all ${
                                  isSelected
                                    ? 'bg-[#D4AF37] text-[#0B1330] font-bold border-[#D4AF37]'
                                    : 'bg-[#121F4D]/40 text-slate-300 border-white/10 hover:bg-[#121F4D]/80'
                                }`}
                              >
                                {opt.label}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Design Style */}
                    {groupMap['design_style'] && (
                      <div className="space-y-3">
                        <label className="text-xs font-bold text-[#F5E7A3] uppercase tracking-wider block">
                          Design Setting Architecture
                        </label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {groupMap['design_style'].options.map((opt) => {
                            const isSelected = selections['design_style'] === opt.id;
                            return (
                              <div
                                key={opt.id}
                                onClick={() => setSelections(prev => ({ ...prev, design_style: opt.id }))}
                                className={`cursor-pointer p-3.5 rounded-xl border transition-all ${
                                  isSelected
                                    ? 'bg-[#D4AF37]/20 border-[#D4AF37] text-white'
                                    : 'bg-[#121F4D]/40 border-white/10 text-slate-300 hover:bg-[#121F4D]/80'
                                }`}
                              >
                                <div className="font-bold text-xs text-[#F5E7A3] mb-1">{opt.label}</div>
                                <div className="text-[11px] text-slate-400 leading-tight">{opt.description}</div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Navigation Buttons */}
                    <div className="pt-4 border-t border-white/10 flex justify-end">
                      <button
                        type="button"
                        onClick={() => setCurrentStep(2)}
                        className="px-8 py-3.5 btn-gold-luxury font-bold text-xs rounded-xl shadow-lg flex items-center gap-2"
                      >
                        Continue to Photos &amp; Notes <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}

                {/* STEP 2: PHOTOS & DESIGN NOTES */}
                {currentStep === 2 && (
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-xl font-serif gold-gradient-text font-bold mb-1">Step 2: Reference Photos &amp; Voice Instructions</h2>
                      <p className="text-xs text-[#FAF8F3]/60">Upload sketches or inspirational photos, write specifications, or speak a voice note.</p>
                    </div>

                    {/* Upload Reference Files */}
                    <div className="space-y-3">
                      <label className="text-xs font-bold text-[#F5E7A3] uppercase tracking-wider block">
                        Upload Reference Images / CAD Sketches
                      </label>
                      <div className="border-2 border-dashed border-[#D4AF37]/40 hover:border-[#D4AF37] rounded-2xl p-6 text-center bg-[#121F4D]/30 transition-colors">
                        <Upload className="w-8 h-8 text-[#D4AF37] mx-auto mb-2" />
                        <p className="text-xs font-semibold text-slate-200 mb-1">
                          Drag &amp; drop reference images or click to browse
                        </p>
                        <p className="text-[11px] text-slate-400 mb-4">
                          Supports PNG, JPG, WEBP, PDF, CAD files up to 25MB each
                        </p>
                        <label className="inline-block px-5 py-2.5 bg-[#D4AF37] text-[#0B1330] font-bold text-xs rounded-xl cursor-pointer hover:bg-[#F5E7A3] transition-colors">
                          Browse Files
                          <input
                            type="file"
                            multiple
                            accept="image/*,.pdf,.3dm,.stl"
                            onChange={handleSketchUpload}
                            className="hidden"
                          />
                        </label>
                      </div>

                      {/* Image Previews */}
                      {sketchPreviews.length > 0 && (
                        <div className="flex flex-wrap gap-3 pt-2">
                          {sketchPreviews.map((preview, idx) => (
                            <div key={idx} className="relative w-20 h-20 rounded-xl overflow-hidden border border-[#D4AF37]/40 bg-[#09112B]">
                              <img src={preview} alt="Sketch upload" className="w-full h-full object-cover" />
                              <button
                                type="button"
                                onClick={() => removeSketch(idx)}
                                className="absolute top-1 right-1 p-1 bg-black/70 text-red-400 rounded-full hover:bg-black"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Voice Instructions Control & Textarea */}
                    <VoiceInstructionsControl
                      value={specialInstructions}
                      onChange={setSpecialInstructions}
                      onAudioFileAttached={handleAudioFileAttached}
                      onAudioFileRemoved={handleAudioFileRemoved}
                    />

                    {/* Gemstone / Metal Only Option */}
                    <div className="bg-[#121F4D]/40 border border-white/10 rounded-2xl p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-serif text-xs font-bold text-[#F5E7A3]">Metal-Only Design (No Gemstones)</h4>
                          <p className="text-[11px] text-slate-400">Enable if your design is plain metal without stone seats.</p>
                        </div>
                        <input
                          type="checkbox"
                          checked={isMetalOnly}
                          onChange={(e) => setIsMetalOnly(e.target.checked)}
                          className="w-4 h-4 accent-[#D4AF37] rounded cursor-pointer"
                        />
                      </div>
                    </div>

                    {/* Stones Table (if not metal only) */}
                    {!isMetalOnly && (
                      <div className="space-y-4 pt-2">
                        <div className="flex justify-between items-center">
                          <label className="text-xs font-bold text-[#F5E7A3] uppercase tracking-wider block">
                            Gemstone Breakdown
                          </label>
                          <button
                            type="button"
                            onClick={addStoneRow}
                            className="px-3 py-1.5 bg-[#D4AF37]/20 border border-[#D4AF37]/40 text-[#F5E7A3] font-bold text-xs rounded-lg hover:bg-[#D4AF37]/30 flex items-center gap-1"
                          >
                            <Plus className="w-3.5 h-3.5 text-[#D4AF37]" /> Add Stone
                          </button>
                        </div>

                        <div className="space-y-3">
                          {stonesList.map((st, idx) => (
                            <div key={idx} className="p-4 bg-[#121F4D]/50 border border-white/10 rounded-2xl space-y-3">
                              <div className="flex justify-between items-center">
                                <span className="text-xs font-bold text-[#F5E7A3]">
                                  {st.is_center_stone ? '💎 Center Stone' : `Accent Stone #${idx}`}
                                </span>
                                {stonesList.length > 1 && (
                                  <button
                                    type="button"
                                    onClick={() => removeStoneRow(idx)}
                                    className="text-red-400 hover:text-red-300 p-1"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                )}
                              </div>

                              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                <div>
                                  <label className="text-[10px] text-slate-400 font-semibold block mb-1">Stone Type</label>
                                  <input
                                    type="text"
                                    value={st.stone_type}
                                    onChange={(e) => updateStoneRow(idx, 'stone_type', e.target.value)}
                                    placeholder="e.g. Natural Diamond"
                                    className="w-full bg-[#09112B] border border-white/10 rounded-lg p-2 text-xs text-white outline-none focus:border-[#D4AF37]"
                                  />
                                </div>
                                <div>
                                  <label className="text-[10px] text-slate-400 font-semibold block mb-1">Shape</label>
                                  <select
                                    value={st.shape}
                                    onChange={(e) => updateStoneRow(idx, 'shape', e.target.value)}
                                    className="w-full bg-[#09112B] border border-white/10 rounded-lg p-2 text-xs text-white outline-none focus:border-[#D4AF37]"
                                  >
                                    <option value="Round Brilliant">Round Brilliant</option>
                                    <option value="Oval">Oval</option>
                                    <option value="Emerald Cut">Emerald Cut</option>
                                    <option value="Pear Shape">Pear Shape</option>
                                    <option value="Cushion Cut">Cushion Cut</option>
                                    <option value="Princess Cut">Princess Cut</option>
                                    <option value="Marquise">Marquise</option>
                                  </select>
                                </div>
                                <div>
                                  <label className="text-[10px] text-slate-400 font-semibold block mb-1">Size / Weight</label>
                                  <input
                                    type="text"
                                    value={st.size_value}
                                    onChange={(e) => updateStoneRow(idx, 'size_value', e.target.value)}
                                    placeholder="1.0 ct"
                                    className="w-full bg-[#09112B] border border-white/10 rounded-lg p-2 text-xs text-white outline-none focus:border-[#D4AF37]"
                                  />
                                </div>
                                <div>
                                  <label className="text-[10px] text-slate-400 font-semibold block mb-1">Quantity</label>
                                  <input
                                    type="number"
                                    min="1"
                                    value={st.quantity}
                                    onChange={(e) => updateStoneRow(idx, 'quantity', parseInt(e.target.value) || 1)}
                                    className="w-full bg-[#09112B] border border-white/10 rounded-lg p-2 text-xs text-white outline-none focus:border-[#D4AF37]"
                                  />
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Navigation Buttons */}
                    <div className="pt-4 border-t border-white/10 flex justify-between">
                      <button
                        type="button"
                        onClick={() => setCurrentStep(1)}
                        className="px-6 py-3 bg-transparent border border-white/20 text-slate-300 font-bold text-xs rounded-xl hover:bg-white/5 flex items-center gap-2"
                      >
                        <ArrowLeft className="w-4 h-4" /> Back to Category
                      </button>
                      <button
                        type="button"
                        onClick={() => setCurrentStep(3)}
                        className="px-8 py-3.5 btn-gold-luxury font-bold text-xs rounded-xl shadow-lg flex items-center gap-2"
                      >
                        Continue to Contact &amp; Submit <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}

                {/* STEP 3: CONTACT & SUBMISSION */}
                {currentStep === 3 && (
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-xl font-serif gold-gradient-text font-bold mb-1">Step 3: Contact &amp; Submission</h2>
                      <p className="text-xs text-[#FAF8F3]/60">Provide your contact info to receive your 3D CAD files and custom quote.</p>
                    </div>

                    {submissionError && (
                      <div className="p-4 rounded-2xl bg-red-500/20 border border-red-500/50 text-red-200 text-xs flex items-center gap-3">
                        <AlertCircle className="w-5 h-5 shrink-0 text-red-400" />
                        <span>{submissionError}</span>
                      </div>
                    )}

                    {/* Contact Details */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <label className="text-[11px] text-[#FAF8F3]/70 font-semibold block mb-1">Full Name *</label>
                        <input
                          type="text"
                          required
                          value={clientName}
                          onChange={(e) => setClientName(e.target.value)}
                          placeholder="Your Name"
                          className="w-full bg-[#09112B] border border-white/10 rounded-xl p-3 text-xs text-white focus:border-[#D4AF37] outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] text-[#FAF8F3]/70 font-semibold block mb-1">Email Address *</label>
                        <input
                          type="email"
                          required
                          value={clientEmail}
                          onChange={(e) => setClientEmail(e.target.value)}
                          placeholder="client@example.com"
                          className="w-full bg-[#09112B] border border-white/10 rounded-xl p-3 text-xs text-white focus:border-[#D4AF37] outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] text-[#FAF8F3]/70 font-semibold block mb-1">Phone / WhatsApp</label>
                        <input
                          type="tel"
                          value={clientPhone}
                          onChange={(e) => setClientPhone(e.target.value)}
                          placeholder="+1 (555) 000-0000"
                          className="w-full bg-[#09112B] border border-white/10 rounded-xl p-3 text-xs text-white focus:border-[#D4AF37] outline-none"
                        />
                      </div>
                    </div>

                    {/* Portfolio Consent */}
                    <div className="flex items-start gap-3 p-4 bg-[#121F4D]/30 border border-white/10 rounded-2xl">
                      <input
                        type="checkbox"
                        id="consent"
                        checked={clientConsent}
                        onChange={(e) => setClientConsent(e.target.checked)}
                        className="mt-0.5 w-4 h-4 accent-[#D4AF37] rounded cursor-pointer"
                      />
                      <label htmlFor="consent" className="text-xs text-slate-300 leading-relaxed cursor-pointer">
                        I permit Shiuli CAD Studio to display anonymized renders of this CAD file in their studio portfolio gallery.
                      </label>
                    </div>

                    {/* Dual Action Buttons */}
                    <div className="pt-4 border-t border-white/10 space-y-3">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <button
                          type="button"
                          disabled={isSubmitting}
                          onClick={() => handleSubmit('quote_only')}
                          className="py-3.5 px-4 bg-transparent border border-[#D4AF37]/50 text-[#F5E7A3] hover:bg-[#D4AF37]/10 font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-2"
                        >
                          {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin text-[#D4AF37]" /> : <FileText className="w-4 h-4" />}
                          Request Specification Quote Only
                        </button>

                        <button
                          type="button"
                          disabled={isSubmitting}
                          onClick={() => handleSubmit('place_order')}
                          className="py-3.5 px-4 btn-gold-luxury font-extrabold text-xs rounded-xl shadow-xl flex items-center justify-center gap-2"
                        >
                          {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin text-[#0B1330]" /> : <CheckCircle2 className="w-4 h-4" />}
                          Submit Custom 3D CAD Order
                        </button>
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                        <button
                          type="button"
                          onClick={() => setCurrentStep(2)}
                          className="text-slate-300 hover:text-white flex items-center gap-1 underline"
                        >
                          <ArrowLeft className="w-3.5 h-3.5" /> Back to Photos &amp; Notes
                        </button>
                        <span className="flex items-center gap-1 text-emerald-400">
                          <ShieldCheck className="w-3.5 h-3.5" /> 100% Guaranteed 3D Print &amp; Cast Quality
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          {/* STICKY SPECIFICATION SUMMARY SIDEBAR */}
          <div className="lg:col-span-4 sticky top-28 space-y-4">
            <div className="bg-[#09112B]/90 backdrop-blur-xl rounded-3xl p-6 border border-[#D4AF37]/30 shadow-2xl space-y-4">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <h3 className="font-serif gold-gradient-text font-bold text-sm uppercase tracking-wider flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-[#D4AF37]" /> Specification Summary
                </h3>
                <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-[#D4AF37]/20 text-[#F5E7A3] border border-[#D4AF37]/30 uppercase">
                  {selectedCategory}
                </span>
              </div>

              {/* Selected Parameters List */}
              <div className="space-y-2 text-xs">
                <div className="p-3 rounded-xl bg-[#121F4D]/60 border border-white/10 flex justify-between items-center">
                  <span className="text-slate-400">Design Category:</span>
                  <span className="font-bold text-white capitalize">{selectedCategory}</span>
                </div>

                {selectedCategory === 'rings' && (
                  <div className="p-3 rounded-xl bg-[#121F4D]/60 border border-white/10 flex justify-between items-center">
                    <span className="text-slate-400">Ring Size:</span>
                    <span className="font-bold text-[#F5E7A3]">{ringSize} ({ringSizeStandard})</span>
                  </div>
                )}

                <div className="p-3 rounded-xl bg-[#121F4D]/60 border border-white/10 flex justify-between items-center">
                  <span className="text-slate-400">Attached Files:</span>
                  <span className="font-bold text-[#D4AF37]">{sketchFiles.length} File(s)</span>
                </div>

                <div className="p-3 rounded-xl bg-[#121F4D]/60 border border-white/10 flex justify-between items-center">
                  <span className="text-slate-400">Turnaround:</span>
                  <span className="font-bold text-emerald-400 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" /> 48-Hour Guarantee
                  </span>
                </div>
              </div>

              {/* Included Deliverables */}
              <div className="p-4 bg-[#121F4D]/80 border border-[#D4AF37]/30 rounded-2xl text-xs space-y-2">
                <h4 className="font-bold text-[#F5E7A3] flex items-center gap-1.5">
                  <Box className="w-4 h-4 text-[#D4AF37]" /> Included CAD Deliverables
                </h4>
                <ul className="space-y-1.5 text-slate-200 text-[11px]">
                  <li className="flex items-center gap-1.5"><CheckCircle className="w-3.5 h-3.5 text-[#D4AF37]" /> Native Rhino .3DM Source File</li>
                  <li className="flex items-center gap-1.5"><CheckCircle className="w-3.5 h-3.5 text-[#D4AF37]" /> Printable High-Density STL Mesh</li>
                  <li className="flex items-center gap-1.5"><CheckCircle className="w-3.5 h-3.5 text-[#D4AF37]" /> 4K Ultra-HD Photorealistic Renders</li>
                </ul>
              </div>

              {/* Quality Guarantee */}
              <div className="p-3.5 bg-[#09112B] rounded-2xl border border-white/10 text-slate-300 text-[11px] flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>100% Production &amp; Shrinkage Allowance Guarantee</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* RING SIZE CONVERSION MODAL */}
      {showRingSizeModal && (
        <div className="fixed inset-0 z-50 bg-[#0B1330]/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#09112B] rounded-3xl max-w-2xl w-full max-h-[85vh] overflow-hidden shadow-2xl border border-[#D4AF37]/40 flex flex-col">
            <div className="p-6 bg-[#121F4D] text-[#FAF8F3] flex justify-between items-center border-b border-[#D4AF37]/30">
              <div>
                <h3 className="text-lg font-serif text-[#F5E7A3] font-bold flex items-center gap-2">
                  <Ruler className="w-5 h-5 text-[#D4AF37]" /> International Ring Size Conversion Chart
                </h3>
                <p className="text-xs text-slate-300">Match inside diameter in millimeters across global sizing standards.</p>
              </div>
              <button
                onClick={() => setShowRingSizeModal(false)}
                className="p-1 rounded-full text-slate-400 hover:text-white hover:bg-white/10"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-[#121F4D] text-[#F5E7A3] font-bold uppercase tracking-wider border-b border-white/10">
                    <th className="p-2.5 rounded-l-xl">US / Canada</th>
                    <th className="p-2.5">UK / Aus</th>
                    <th className="p-2.5">IN / HK</th>
                    <th className="p-2.5">EU (ISO)</th>
                    <th className="p-2.5 rounded-r-xl">Inside Dia (mm)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {RING_SIZE_CONVERSION_TABLE.map((row, idx) => (
                    <tr key={idx} className="hover:bg-[#121F4D]/50 transition-colors">
                      <td className="p-2.5 font-bold text-white">{row.us}</td>
                      <td className="p-2.5 text-slate-300">{row.uk}</td>
                      <td className="p-2.5 text-slate-300">{row.in_hk}</td>
                      <td className="p-2.5 text-slate-300">{row.eu}</td>
                      <td className="p-2.5 font-mono text-[#D4AF37] font-semibold">{row.inside_mm}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="p-4 bg-[#121F4D]/60 border-t border-white/10 text-right">
              <button
                onClick={() => setShowRingSizeModal(false)}
                className="px-6 py-2 btn-gold-luxury font-bold text-xs rounded-xl"
              >
                Close Conversion Chart
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
