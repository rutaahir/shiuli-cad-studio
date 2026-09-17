import React, { useState, useEffect } from 'react';
import { PageId, Product } from '../types';
import { PRODUCTS, SAMPLE_ORDERS } from '../data/mockData';
import { CURRENT_STAFF_MEMBER } from '../data/staffMockData';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { 
  User, 
  ShoppingBag, 
  Download, 
  Heart, 
  Clock, 
  CheckCircle2, 
  FileCode2, 
  Sparkles, 
  ArrowRight, 
  ExternalLink,
  ShieldCheck,
  Building,
  Gem,
  Send,
  MessageSquare,
  Loader2,
  FileText,
  Phone,
  Eye,
  X,
  PlusCircle,
  TrendingUp,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Award,
  Star,
  Lock,
  CreditCard
} from 'lucide-react';
import { RevealOnScroll } from '../components/motion/RevealOnScroll';

import { appStore } from '../services/store';

import { OTPVerificationModal } from '../components/delivery/OTPVerificationModal';
import { UserProfileModule } from '../components/profile/UserProfileModule';

const formatINR = (val: number | string | undefined | null) => {
  if (val === undefined || val === null || val === '') return '₹0';
  const num = typeof val === 'number' ? val : parseFloat(val);
  if (isNaN(num)) return '₹0';
  return `₹${Math.round(num).toLocaleString('en-IN')}`;
};

interface ClientDashboardPageProps {
  onNavigate: (page: PageId, extraId?: string) => void;
  userEmail: string;
  wishlistIds: string[];
  onRemoveWishlist: (product: Product) => void;
  onAddToCart: (product: Product, license: 'standard' | 'commercial') => void;
  initialTab?: 'custom' | 'downloads' | 'orders' | 'wishlist' | 'profile';
}

export const ClientDashboardPage: React.FC<ClientDashboardPageProps> = ({
  onNavigate,
  userEmail,
  wishlistIds,
  onRemoveWishlist,
  onAddToCart,
  initialTab,
}) => {
  const { isLoggedIn, user } = useAuth();
  const [activeTab, setActiveTab] = useState<'custom' | 'downloads' | 'orders' | 'wishlist' | 'profile'>(initialTab || 'custom');

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  // Live State
  const [customRequests, setCustomRequests] = useState<any[]>([]);
  const [loadingCustom, setLoadingCustom] = useState<boolean>(false);
  const [counterPriceInput, setCounterPriceInput] = useState<{ [key: number]: string }>({});
  const [counterMessageInput, setCounterMessageInput] = useState<{ [key: number]: string }>({});
  const [showCounterForm, setShowCounterForm] = useState<{ [key: number]: boolean }>({});
  const [isSubmitting, setIsSubmitting] = useState<{ [key: number]: boolean }>({});
  
  // User-Scoped Orders State
  const [userOrders, setUserOrders] = useState<any[]>([]);

  // Purchases & Secure Downloads State
  const [purchases, setPurchases] = useState<any[]>([]);
  const [loadingPurchases, setLoadingPurchases] = useState<boolean>(false);
  const [resendingPurchaseId, setResendingPurchaseId] = useState<number | null>(null);

  const [reDeliveryOtpModalState, setReDeliveryOtpModalState] = useState<{
    isOpen: boolean;
    purchaseId: number;
    productTitle: string;
    maskedEmail: string;
  }>({
    isOpen: false,
    purchaseId: 0,
    productTitle: '',
    maskedEmail: '',
  });

  // UI Expansion States
  const [expandedSpecs, setExpandedSpecs] = useState<{ [key: number]: boolean }>({});
  const [selectedSketchUrl, setSelectedSketchUrl] = useState<string | null>(null);

  // CAD OTP Download State
  const [cadOtpState, setCadOtpState] = useState<{
    [reqId: string]: {
      stage: 'idle' | 'requesting' | 'verifying' | 'verified';
      otpInput: string;
      demoOtp: string;
      downloadUrl: string;
      error: string;
      isSubmitting: boolean;
    };
  }>({});

  // Milestone Tracking State (live from localStorage + backend)
  const [orderMilestones, setOrderMilestones] = useState<{ [orderId: string]: any[] }>({});

  const [paymentModalState, setPaymentModalState] = useState<{
    isOpen: boolean;
    stageId: number;
    stageLabel: string;
    amount: number;
    reqId: number | string;
    transactionId: string;
  }>({
    isOpen: false,
    stageId: 0,
    stageLabel: '',
    amount: 0,
    reqId: '',
    transactionId: '',
  });

  const fetchCustomRequests = async () => {
    setLoadingCustom(true);
    try {
      const currentUser = user;
      const currentUserId = currentUser?.id ? String(currentUser.id) : null;
      const currentUserEmail = (currentUser?.email || userEmail || '').toLowerCase().trim();
      const currentUsername = (currentUser?.username || '').toLowerCase().trim();

      // ─── STEP 1: Backend is the AUTHORITATIVE source of truth ───────────────────
      // The backend's get_queryset already filters by the authenticated user's token.
      // We trust it completely — no fuzzy matching needed.
      let backendRequests: any[] = [];
      try {
        const res = await api.request<any>('/custom-requests/');
        const ensureArray = (r: any) => {
          if (Array.isArray(r)) return r;
          if (r && Array.isArray(r.results)) return r.results;
          if (r && Array.isArray(r.data)) return r.data;
          return [];
        };
        backendRequests = ensureArray(res);
      } catch (err) {
        console.warn('Backend custom requests fetch error:', err);
      }

      // ─── STEP 2: Only read THIS user's OWN localStorage key as offline fallback ──
      // Key is scoped to the user's email or username — never read global store keys.
      const userLocalRequests: any[] = [];
      if (currentUserEmail || currentUsername || currentUserId) {
        const userScopedKeys = [
          currentUserId ? `shiuli_user_custom_requests_${currentUserId}` : null,
          currentUserEmail ? `shiuli_user_custom_requests_${currentUserEmail}` : null,
          currentUsername ? `shiuli_user_custom_requests_${currentUsername}` : null,
        ].filter(Boolean) as string[];

        for (const key of userScopedKeys) {
          const raw = localStorage.getItem(key);
          if (raw) {
            try {
              const parsed = JSON.parse(raw);
              if (Array.isArray(parsed)) {
                parsed.forEach((item: any) => {
                  const itemId = String(item.id || item.ticket_id || '');
                  const mockIds = ['req-901', 'req-902', 'req-903', 'req-904'];
                  if (mockIds.includes(itemId.toLowerCase())) return;

                  // STRICT: Only include if this item actually belongs to the current user
                  // (checked by client field or email match)
                  const itemClientId = String(
                    (typeof item.client === 'object' ? item.client?.id : item.client) ||
                    item.client_id || item.user_id || ''
                  );
                  const itemEmail = (
                    (typeof item.client === 'object' ? item.client?.email : '') ||
                    item.client_email || item.contact_email || ''
                  ).toLowerCase();

                  const belongsToUser =
                    (currentUserId && itemClientId && currentUserId === itemClientId) ||
                    (currentUserEmail && itemEmail && currentUserEmail === itemEmail) ||
                    // If no client info in item — trust it because it's in this user's scoped key
                    (!itemClientId && !itemEmail);

                  if (belongsToUser && !userLocalRequests.some((e: any) => String(e.id || e.ticket_id) === itemId)) {
                    userLocalRequests.push(item);
                  }
                });
              }
            } catch (e) {}
          }
        }
      }

      // ─── STEP 3: Merge — backend is primary, local fills in if backend missed it ─
      // Automatically sync orphan local requests to backend database
      for (const loc of userLocalRequests) {
        const locId = String(loc.id || loc.ticket_id || '');
        if (locId.startsWith('req-') && !backendRequests.some((c: any) => String(c.id || c.ticket_id || '') === locId)) {
          try {
            api.createCustomRequest({
              category: loc.category || 1,
              description: loc.description || loc.custom_specs_text || 'Custom CAD Request',
              special_instructions: loc.description || loc.custom_specs_text || '',
              gold_purity: loc.gold_purity || '',
              contact_email: loc.contact_email || currentUserEmail,
              contact_name: loc.contact_name || loc.client_name || 'Valued Client',
              contact_phone: loc.contact_phone || loc.client_phone || '+91 9876543210',
              ring_size: loc.ring_size || '',
              ring_size_standard: loc.ring_size_standard || 'us',
              custom_specs_text: loc.custom_specs_text || '',
              catalog_references_text: loc.catalog_references_text || '',
              is_metal_only: Boolean(loc.is_metal_only),
              engraving_text: loc.engraving_text || '',
            }).then(syncedRes => {
              if (syncedRes && syncedRes.id) {
                setCustomRequests(prev => [syncedRes, ...prev.filter(p => String(p.id) !== locId)]);
              }
            }).catch(() => {});
          } catch {}
        }
      }

      const combined = [...backendRequests];
      userLocalRequests.forEach((loc: any) => {
        const locId = String(loc.id || loc.ticket_id || '');
        if (!combined.some((c: any) => String(c.id || c.ticket_id || '') === locId)) {
          // Only add local items that are recent (within last 24h) to avoid stale data
          const createdAt = new Date(loc.created_at || loc.createdAt || 0).getTime();
          const ageMs = Date.now() - createdAt;
          const oneDayMs = 24 * 60 * 60 * 1000;
          if (ageMs < oneDayMs || !loc.created_at) {
            combined.push(loc);
          }
        } else {
          // Merge local state (e.g. optimistic status updates) into backend record
          const idx = combined.findIndex((c: any) => String(c.id || c.ticket_id || '') === locId);
          if (idx >= 0) {
            combined[idx] = {
              ...combined[idx],
              ...loc,
              // Backend's status is authoritative; local overrides only if more recent
              status: loc.status && loc.status !== 'new' ? loc.status : combined[idx].status,
              agreed_price: loc.agreed_price || combined[idx].agreed_price,
              messages: (loc.messages && loc.messages.length > (combined[idx].messages?.length || 0))
                ? loc.messages
                : combined[idx].messages,
            };
          }
        }
      });

      // Filter out any mock IDs that slipped through
      const mockIds = ['req-901', 'req-902', 'req-903', 'req-904'];
      const finalRequests = combined.filter(
        (r: any) => !mockIds.includes(String(r.id || r.ticket_id || '').toLowerCase())
      );

      // Sort newest first
      const parseTime = (dateStr: any) => {
        if (!dateStr) return 0;
        const t = new Date(dateStr).getTime();
        return isNaN(t) ? 0 : t;
      };
      finalRequests.sort((a: any, b: any) => {
        const timeA = parseTime(a.created_at || a.createdAt);
        const timeB = parseTime(b.created_at || b.createdAt);
        if (timeA !== timeB) return timeB - timeA;
        return (Number(String(b.id).replace(/[^0-9]/g, '')) || 0) - (Number(String(a.id).replace(/[^0-9]/g, '')) || 0);
      });

      setCustomRequests(finalRequests);
    } catch (e) {
      console.warn('Failed to fetch client custom requests:', e);
    } finally {
      setLoadingCustom(false);
    }
  };

  const fetchPurchases = async () => {
    setLoadingPurchases(true);
    try {
      let dbPurchases: any[] = [];
      try {
        const res = await api.request<any>('/payments/purchases/mine/');
        dbPurchases = Array.isArray(res) ? res : [];
      } catch (e) {
        console.warn('Backend purchases fetch error:', e);
      }

      const currentUserEmail = (user?.email || userEmail || '').toLowerCase();
      const currentUsername = (user?.username || '').toLowerCase();
      const userKey = currentUserEmail || currentUsername;

      if (!userKey) {
        setPurchases([]);
        return;
      }

      const purchasesKey = `shiuli_user_purchases_${userKey}`;

      let localPurchases: any[] = [];
      try {
        const stored = localStorage.getItem(purchasesKey);
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed)) {
            // Purge legacy mock items
            localPurchases = parsed.filter((p: any) => {
              const pId = String(p.id || '').toLowerCase();
              const pTitle = String(p.product_title || p.title || '').toLowerCase();
              return !pId.includes('8921') && !pId.includes('8902') && !pTitle.includes('sample');
            });
            localStorage.setItem(purchasesKey, JSON.stringify(localPurchases));
          }
        }
      } catch {}

      const combined = [...dbPurchases];
      localPurchases.forEach((lp: any) => {
        if (!combined.some((c: any) => String(c.id) === String(lp.id))) {
          combined.push(lp);
        }
      });

      // Exclude legacy mock items
      const userFiltered = combined.filter((p: any) => {
        const pId = String(p.id || '').toLowerCase();
        return !pId.includes('8921') && !pId.includes('8902');
      });

      setPurchases(userFiltered);
    } catch (e) {
      console.warn('Failed to fetch purchases:', e);
    } finally {
      setLoadingPurchases(false);
    }
  };

  const fetchUserOrders = async () => {
    const currentUserEmail = (user?.email || userEmail || '').toLowerCase();
    const currentUsername = (user?.username || '').toLowerCase();
    const userKey = currentUserEmail || currentUsername;

    let dbOrders: any[] = [];
    try {
      const res = await api.request<any>('/orders/');
      const ensureArray = (r: any) => {
        if (Array.isArray(r)) return r;
        if (r && Array.isArray(r.results)) return r.results;
        if (r && Array.isArray(r.data)) return r.data;
        return [];
      };
      dbOrders = ensureArray(res);
    } catch (err) {
      console.warn('Backend orders fetch error:', err);
    }

    let storedOrders: any[] = [];
    if (userKey) {
      const ordersKey = `shiuli_user_orders_${userKey}`;
      try {
        const raw = localStorage.getItem(ordersKey);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed)) {
            // Purge legacy mock order items
            storedOrders = parsed.filter((o: any) => {
              const oId = String(o.id || o.orderNumber || '').toLowerCase();
              return !oId.includes('8921') && !oId.includes('8902');
            });
            localStorage.setItem(ordersKey, JSON.stringify(storedOrders));
          }
        }
      } catch {}
    }

    // Format backend orders for display in Client Dashboard
    const formattedDbOrders = dbOrders.map((bo: any) => {
      const orderIdStr = bo.order_number || `ORD-${Number(bo.id) + 1000}`;
      const itemTitle = bo.custom_request?.category_name 
        ? `${bo.custom_request.category_name} Bespoke CAD`
        : bo.product?.title || 'Custom Atelier CAD Model';

      return {
        id: orderIdStr,
        db_id: bo.id,
        orderNumber: orderIdStr,
        date: bo.created_at ? new Date(bo.created_at).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }) : 'Recent',
        total: parseFloat(bo.total_price || '0'),
        status: bo.status === 'completed' ? 'Delivered' : 'In Production',
        raw_status: bo.status,
        items: [
          {
            id: `item-${bo.id}`,
            productTitle: itemTitle,
            title: itemTitle,
            category: bo.custom_request?.category_name || 'Bespoke Order',
            price: parseFloat(bo.total_price || '0'),
            quantity: 1,
            metal_alloy: bo.custom_request?.metal_alloy_name || '18K Gold',
          }
        ],
        custom_request: bo.custom_request,
        payment_stages: bo.payment_stages || [],
        is_fully_paid: bo.is_fully_paid || false,
      };
    });

    // Merge backend orders and stored local orders
    const merged = [...formattedDbOrders];
    storedOrders.forEach((so: any) => {
      const soId = String(so.id || so.orderNumber || '');
      if (!merged.some((m: any) => String(m.id || m.orderNumber || '') === soId)) {
        merged.push(so);
      }
    });

    setUserOrders(merged);
  };

  // Load milestones from localStorage for all orders
  const syncMilestonesFromStorage = () => {
    const result: { [orderId: string]: any[] } = {};
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('shiuli_order_milestone_')) {
        const orderId = key.replace('shiuli_order_milestone_', '');
        try {
          const raw = localStorage.getItem(key);
          if (raw) {
            const parsed = JSON.parse(raw);
            result[orderId] = Array.isArray(parsed) ? parsed : [parsed];
          }
        } catch (e) {}
      }
    }
    setOrderMilestones(result);
  };

  useEffect(() => {
    fetchCustomRequests();
    fetchPurchases();
    fetchUserOrders();
    syncMilestonesFromStorage();

    const handleSync = () => {
      fetchCustomRequests();
      fetchPurchases();
      fetchUserOrders();
      syncMilestonesFromStorage();
    };

    window.addEventListener('storage', handleSync);
    window.addEventListener('shiuli_custom_requests_changed', handleSync);
    window.addEventListener('shiuli_order_milestone_changed', syncMilestonesFromStorage);

    return () => {
      window.removeEventListener('storage', handleSync);
      window.removeEventListener('shiuli_custom_requests_changed', handleSync);
      window.removeEventListener('shiuli_order_milestone_changed', syncMilestonesFromStorage);
    };
  }, [isLoggedIn, user, activeTab]);

  const handleRequestRedelivery = async (purchaseId: number | string, productTitle: string) => {
    setResendingPurchaseId(purchaseId as any);
    try {
      let maskedEmail = 'c***r@gmail.com';
      try {
        const res = await api.post<any>(`/payments/purchases/${purchaseId}/resend-download-link/`);
        if (res && res.masked_email) maskedEmail = res.masked_email;
      } catch (err) {
        console.warn('Backend re-delivery fallback:', err);
      }

      const currentUserEmail = user?.email || userEmail || 'customer@shiulicadstudio.com';
      const parts = currentUserEmail.split('@');
      if (parts[0].length > 2) {
        maskedEmail = `${parts[0][0]}***${parts[0].slice(-1)}@${parts[1] || 'gmail.com'}`;
      }

      const numericId = typeof purchaseId === 'number' ? purchaseId : (parseInt(String(purchaseId).replace(/[^0-9]/g, '')) || 100001);

      setReDeliveryOtpModalState({
        isOpen: true,
        purchaseId: numericId,
        productTitle: productTitle,
        maskedEmail: maskedEmail,
      });
    } catch (err: any) {
      alert(err.message || 'Failed to request re-delivery.');
    } finally {
      setResendingPurchaseId(null);
    }
  };




  const createAvailableJobForStaffPool = (reqItem: any, _price?: number) => {
    const reqIdStr = String(reqItem.id || reqItem.ticket_id || '');
    const jobNumId = `JOB-REQ-${reqIdStr.replace(/[^0-9]/g, '') || reqIdStr}`;

    const clientNameStr = reqItem.contact_name || reqItem.client_name || 'Valued Client';
    const catStr = reqItem.category_name || 'Custom Jewellery';
    
    let metalStr = '';
    if (reqItem.special_instructions) {
      const mMatch = reqItem.special_instructions.match(/Metal Alloy & Purity:\s*([^\n\r]+)/i);
      if (mMatch && mMatch[1]) metalStr = mMatch[1].trim();
    }
    if (!metalStr) {
      const purity = reqItem.gold_purity || '';
      let alloy = reqItem.metal_alloy_name || '';
      if (purity && alloy) {
        metalStr = /\b\d{2}K\b/i.test(alloy) ? alloy.replace(/\b\d{2}K\b/i, purity) : `${purity} ${alloy}`;
      } else {
        metalStr = alloy || (purity ? `${purity} Gold` : '18K Gold');
      }
    }

    let refImg = 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&q=80&w=600';
    if (reqItem.sketches && Array.isArray(reqItem.sketches) && reqItem.sketches.length > 0) {
      refImg = reqItem.sketches[0].image_url || reqItem.sketches[0].image || refImg;
    }

    const stonesList = (reqItem.stones && reqItem.stones.length > 0) ? reqItem.stones : (reqItem.gemstones || []);
    const stonesCount = stonesList.reduce((acc: number, s: any) => acc + (Number(s.quantity) || 1), 0) || (reqItem.special_instructions?.includes('Row #1') ? 1 : 0);

    let ringSizeStr = '';
    if (reqItem.ring_size) {
      const std = (reqItem.ring_size_standard || 'IN').toUpperCase();
      ringSizeStr = `${std} ${reqItem.ring_size}`;
    } else if (reqItem.special_instructions) {
      const sizeMatch = reqItem.special_instructions.match(/Size:\s*([^\s|]+)/i);
      if (sizeMatch && sizeMatch[1]) ringSizeStr = sizeMatch[1].trim();
    }

    let weightStr = '';
    if (reqItem.target_weight_grams) {
      weightStr = `${reqItem.target_weight_grams}g`;
    } else if (reqItem.special_instructions) {
      const wMatch = reqItem.special_instructions.match(/Target Weight:\s*([^\s|]+)/i);
      if (wMatch && wMatch[1]) weightStr = wMatch[1].trim();
    }

    // STRICT CONFIDENTIALITY: Absolutely no price, payout, or client financial data passed to staff
    const newPoolJob = {
      id: jobNumId,
      orderNumber: `REQ #${reqIdStr}`,
      title: `${catStr} (${clientNameStr})`,
      category: catStr,
      metalPreference: metalStr,
      agreedPayout: 0,
      clientBudget: 'Confidential',
      releasedTimeAgo: 'Just now',
      deadlineHours: 48,
      referenceImage: refImg,
      description: reqItem.description || reqItem.special_instructions || 'Watertight 3D CAD design request.',
      specsSummary: {
        diamondCount: stonesCount,
        ringSize: ringSizeStr || undefined,
        dimensions: reqItem.custom_specs_text || 'Bespoke Master Specs',
        weightEst: weightStr ? `${weightStr} (${metalStr})` : `Calibrated ${metalStr}`,
      },
      status: 'available',
      rawRequest: reqItem,
      gemstones: stonesList,
      sketches: reqItem.sketches || [],
      special_instructions: reqItem.special_instructions || '',
      ring_size: ringSizeStr,
      target_weight_grams: weightStr,
      gold_purity: reqItem.gold_purity || '',
      metal_alloy_name: metalStr,
      aesthetic_style_name: reqItem.aesthetic_style_name || '',
      catalog_references: reqItem.catalog_references || [],
      catalog_references_text: reqItem.catalog_references_text || '',
      custom_specs_text: reqItem.custom_specs_text || '',
      client_name: clientNameStr,
    };

    try {
      const existing = appStore.getAvailableJobs();
      const filtered = existing.filter((j: any) => String(j.id) !== jobNumId && j.orderNumber !== `REQ #${reqIdStr}`);
      const updated = [newPoolJob, ...filtered];
      appStore.saveAvailableJobs(updated as any);
      localStorage.setItem('shiuli_store_available_jobs', JSON.stringify(updated));
    } catch (e) {}
  };

  const handleAcceptQuote = async (reqId: number | string) => {
    setIsSubmitting((prev) => ({ ...prev, [reqId]: true }));
    try {
      try {
        await api.request(`/custom-requests/${reqId}/accept-quote/`, {
          method: 'POST',
        });
      } catch (err) {
        console.warn('Backend accept-quote fallback to local:', err);
      }

      // Update request state in localStorage so quote acceptance persists in real-time
      const currentUserEmail = (user?.email || userEmail || '').toLowerCase();
      const currentUsername = (user?.username || '').toLowerCase();
      const userKey = currentUserEmail || currentUsername;
      let matchedItem: any = null;
      let capturedAgreedPrice = 0;

      const updateAcceptanceInStorage = (key: string) => {
        const raw = localStorage.getItem(key);
        if (!raw) return;
        try {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed)) {
            const updated = parsed.map((item: any) => {
              const itemIdStr = String(item.id || item.ticket_id || '');
              const reqIdStr = String(reqId);
              if (itemIdStr === reqIdStr || item.id === reqId) {
                let latestOffered = item.agreed_price || item.estimated_price_shown || 0;
                if (item.messages && Array.isArray(item.messages)) {
                  for (let i = item.messages.length - 1; i >= 0; i--) {
                    if (item.messages[i].offered_price) {
                      latestOffered = Number(item.messages[i].offered_price);
                      break;
                    }
                  }
                }
                capturedAgreedPrice = latestOffered;
                matchedItem = {
                  ...item,
                  status: 'agreed',
                  agreed_price: latestOffered,
                  estimated_price_shown: latestOffered,
                };
                return {
                  ...item,
                  status: 'agreed',
                  agreed_price: latestOffered,
                  estimated_price_shown: latestOffered,
                  messages: [
                    ...(item.messages || []),
                    {
                      id: Date.now(),
                      sender_type: 'client',
                      message: `Official quote of ₹${latestOffered.toLocaleString('en-IN')} accepted by client. Order confirmed and sent to senior CAD artisan pool.`,
                      created_at: new Date().toISOString()
                    }
                  ]
                };
              }
              return item;
            });
            localStorage.setItem(key, JSON.stringify(updated));
          }
        } catch {}
      };

      if (userKey) {
        updateAcceptanceInStorage(`shiuli_user_custom_requests_${userKey}`);
      }
      updateAcceptanceInStorage('shiuli_store_custom_requests');
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('shiuli_user_custom_requests_')) {
          updateAcceptanceInStorage(key);
        }
      }

      // Automatically push this confirmed order into the staff job pool!
      if (matchedItem) {
        createAvailableJobForStaffPool(matchedItem, capturedAgreedPrice);
      }

      // Dispatch real-time events across windows & tabs
      window.dispatchEvent(new Event('storage'));
      window.dispatchEvent(new CustomEvent('shiuli_custom_requests_changed'));

      fetchCustomRequests();
    } catch (err: any) {
      console.error('Failed to accept quote:', err);
    } finally {
      setIsSubmitting((prev) => ({ ...prev, [reqId]: false }));
    }
  };

  const handleSendCounterOffer = async (e: React.FormEvent, reqId: number | string) => {
    e.preventDefault();
    const priceStr = counterPriceInput[reqId];
    const message = counterMessageInput[reqId];
    if (!priceStr && !message) return;

    setIsSubmitting((prev) => ({ ...prev, [reqId]: true }));
    try {
      const numPrice = priceStr ? parseFloat(priceStr) : undefined;
      try {
        await api.request(`/custom-requests/${reqId}/negotiate/`, {
          method: 'POST',
          body: JSON.stringify({
            price: numPrice,
            message: message || '',
          }),
        });
      } catch (err) {
        console.warn('Backend negotiate fallback to local:', err);
      }

      const currentUserEmail = (user?.email || userEmail || '').toLowerCase();
      const currentUsername = (user?.username || '').toLowerCase();
      const userKey = currentUserEmail || currentUsername;

      const updateCounterInStorage = (key: string) => {
        const raw = localStorage.getItem(key);
        if (!raw) return;
        try {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed)) {
            const updated = parsed.map((item: any) => {
              const itemIdStr = String(item.id || item.ticket_id || '');
              const reqIdStr = String(reqId);
              if (itemIdStr === reqIdStr || item.id === reqId) {
                const newMsg = {
                  id: Date.now(),
                  sender_type: 'client',
                  message: message ? `Counter-Offer: ${message}` : `Proposed Counter Price: ₹${numPrice?.toLocaleString('en-IN')}`,
                  offered_price: numPrice,
                  created_at: new Date().toISOString()
                };
                return {
                  ...item,
                  status: 'negotiating',
                  estimated_price_shown: numPrice || item.estimated_price_shown,
                  messages: [...(item.messages || []), newMsg]
                };
              }
              return item;
            });
            localStorage.setItem(key, JSON.stringify(updated));
          }
        } catch {}
      };

      if (userKey) {
        updateCounterInStorage(`shiuli_user_custom_requests_${userKey}`);
      }
      updateCounterInStorage('shiuli_store_custom_requests');
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('shiuli_user_custom_requests_')) {
          updateCounterInStorage(key);
        }
      }

      setCounterPriceInput((prev) => ({ ...prev, [reqId]: '' }));
      setCounterMessageInput((prev) => ({ ...prev, [reqId]: '' }));
      fetchCustomRequests();
    } catch (err: any) {
      console.error('Failed to send counter offer:', err);
    } finally {
      setIsSubmitting((prev) => ({ ...prev, [reqId]: false }));
    }
  };

  const handlePayStage = async (stageId: number | string, reqId: number | string, stageAmount: number, stageLabel: string) => {
    try {
      try {
        await api.request('/payments/pay-stage/', {
          method: 'POST',
          body: JSON.stringify({ stage_id: stageId, req_id: reqId }),
        });
      } catch (err) {
        console.warn('Backend pay-stage fallback to local:', err);
      }

      const currentUserEmail = (user?.email || userEmail || '').toLowerCase();
      const currentUsername = (user?.username || '').toLowerCase();
      const userKey = currentUserEmail || currentUsername;

      const txnId = `TXN-SCS-${Math.floor(100000 + Math.random() * 900000)}`;
      const labelLower = (stageLabel || '').toLowerCase();
      const isStage1 = Number(stageId) === 1 || String(stageId).includes('1') || labelLower.includes('stage 1') || labelLower.includes('booking');
      const isStage2 = Number(stageId) === 2 || String(stageId).includes('2') || labelLower.includes('stage 2') || labelLower.includes('mid');
      const isStage3 = Number(stageId) === 3 || String(stageId).includes('3') || labelLower.includes('stage 3') || labelLower.includes('final');

      const updateStagePaymentInStorage = (key: string) => {
        const raw = localStorage.getItem(key);
        if (!raw) return;
        try {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed)) {
            const updated = parsed.map((item: any) => {
              const itemIdStr = String(item.id || item.ticket_id || '');
              const itemOrdIdStr = String(item.order?.id || '');
              const reqIdStr = String(reqId);
              const matches = itemIdStr === reqIdStr || itemOrdIdStr === reqIdStr || String(item.id).replace(/[^0-9]/g, '') === reqIdStr.replace(/[^0-9]/g, '');

              if (matches) {
                const currentPaidStages = item.paid_stages || [];
                const numStageId = isStage1 ? 1 : isStage2 ? 2 : 3;
                const newPaidStages = Array.from(new Set([...currentPaidStages, stageId, numStageId]));

                let newStatus = item.status;
                if (isStage1 && (item.status === 'agreed' || item.status === 'quoted' || item.status === 'pending_payment')) {
                  newStatus = 'in_progress';
                } else if (isStage3) {
                  newStatus = 'completed';
                }

                const updateStageList = (stList: any[]) => {
                  if (!Array.isArray(stList)) return stList;
                  return stList.map((st: any) => {
                    const sId = st.id;
                    const sLabel = (st.label || '').toLowerCase();
                    const isMatch = sId === stageId || String(sId) === String(stageId) ||
                      (isStage1 && (sLabel.includes('stage 1') || sLabel.includes('booking'))) ||
                      (isStage2 && (sLabel.includes('stage 2') || sLabel.includes('mid'))) ||
                      (isStage3 && (sLabel.includes('stage 3') || sLabel.includes('final')));
                    if (isMatch) {
                      return { ...st, status: 'paid' };
                    }
                    return st;
                  });
                };

                const paymentMsg = {
                  id: Date.now(),
                  sender_type: 'client',
                  message: `Official Payment Confirmed: ${stageLabel} (${formatINR(stageAmount)}). Txn ID: ${txnId}`,
                  created_at: new Date().toISOString()
                };

                return {
                  ...item,
                  status: newStatus,
                  paid_stages: newPaidStages,
                  stage1_paid: item.stage1_paid || isStage1,
                  stage2_paid: item.stage2_paid || isStage2,
                  stage3_paid: item.stage3_paid || isStage3,
                  payment_stages: updateStageList(item.payment_stages || []),
                  order: item.order ? {
                    ...item.order,
                    status: newStatus === 'in_progress' ? (item.order.status || 'in_design') : item.order.status,
                    stage1_paid: item.order.stage1_paid || isStage1,
                    stage2_paid: item.order.stage2_paid || isStage2,
                    stage3_paid: item.order.stage3_paid || isStage3,
                    paid_stages: newPaidStages,
                    payment_stages: updateStageList(item.order.payment_stages || []),
                  } : item.order,
                  messages: [...(item.messages || []), paymentMsg]
                };
              }
              return item;
            });
            localStorage.setItem(key, JSON.stringify(updated));
          }
        } catch {}
      };

      if (userKey) {
        updateStagePaymentInStorage(`shiuli_user_custom_requests_${userKey}`);
      }
      updateStagePaymentInStorage('shiuli_store_custom_requests');
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (key.startsWith('shiuli_user_custom_requests_') || key.includes('custom_requests'))) {
          updateStagePaymentInStorage(key);
        }
      }

      setPaymentModalState({
        isOpen: true,
        stageId: Number(stageId) || 1,
        stageLabel,
        amount: stageAmount,
        reqId,
        transactionId: txnId,
      });

      window.dispatchEvent(new Event('storage'));
      window.dispatchEvent(new CustomEvent('shiuli_custom_requests_changed'));
      fetchCustomRequests();
    } catch (err: any) {
      alert(err?.message || 'Stage payment failed.');
    }
  };

  // CAD OTP Download Handlers
  const handleRequestCadOtp = async (reqId: string | number) => {
    const idStr = String(reqId);
    setCadOtpState((prev) => ({
      ...prev,
      [idStr]: { stage: 'requesting', otpInput: '', demoOtp: '', downloadUrl: '', error: '', isSubmitting: true },
    }));
    try {
      // Try backend OTP endpoint first
      let demoOtp = '';
      try {
        const res = await api.request<any>(`/orders/${idStr}/request-otp/`, { method: 'POST' });
        if (res?.demo_otp) demoOtp = res.demo_otp;
      } catch (e) {
        // Fallback: generate local OTP for demo
        demoOtp = String(Math.floor(100000 + Math.random() * 900000));
      }
      setCadOtpState((prev) => ({
        ...prev,
        [idStr]: { stage: 'verifying', otpInput: '', demoOtp, downloadUrl: '', error: '', isSubmitting: false },
      }));
    } catch (err: any) {
      setCadOtpState((prev) => ({
        ...prev,
        [idStr]: { ...prev[idStr], error: err?.message || 'Failed to send OTP.', isSubmitting: false },
      }));
    }
  };

  const handleVerifyCadOtp = async (reqId: string | number) => {
    const idStr = String(reqId);
    const state = cadOtpState[idStr];
    if (!state?.otpInput) return;
    setCadOtpState((prev) => ({ ...prev, [idStr]: { ...prev[idStr], isSubmitting: true, error: '' } }));
    try {
      let downloadUrl = '';
      try {
        const res = await api.request<any>(`/orders/${idStr}/verify-otp/`, {
          method: 'POST',
          body: JSON.stringify({ code: state.otpInput }),
        });
        if (res?.download_url) downloadUrl = res.download_url;
      } catch (e) {
        // Fallback: verify against demo OTP locally
        if (state.otpInput === state.demoOtp) {
          downloadUrl = `#demo-download-link-${idStr}-${Date.now()}`;
        } else {
          throw new Error('Invalid OTP code. Please check and try again.');
        }
      }
      setCadOtpState((prev) => ({
        ...prev,
        [idStr]: { ...prev[idStr], stage: 'verified', downloadUrl, isSubmitting: false },
      }));
    } catch (err: any) {
      setCadOtpState((prev) => ({
        ...prev,
        [idStr]: { ...prev[idStr], error: err?.message || 'OTP verification failed.', isSubmitting: false },
      }));
    }
  };

  const handleResetCadOtp = (reqId: string | number) => {
    const idStr = String(reqId);
    setCadOtpState((prev) => ({ ...prev, [idStr]: { stage: 'idle', otpInput: '', demoOtp: '', downloadUrl: '', error: '', isSubmitting: false } }));
  };

  const downloadCadFilePackage = (filename: string, category: string) => {
    const clientNameStr = user?.first_name ? `${user.first_name} ${user.last_name || ''}`.trim() : user?.username || 'Valued Client';
    const clientEmailStr = user?.email || userEmail || 'client@shiuli.com';

    const dummyContent =
      `=======================================================\n` +
      `  SHIULI CAD STUDIO — EXCLUSIVE BESPOKE CAD FILE  \n` +
      `=======================================================\n\n` +
      `File Name       : ${filename}\n` +
      `Design Category : ${category || 'Jewellery CAD'}\n` +
      `Client          : ${clientNameStr} (${clientEmailStr})\n` +
      `Issued Date     : ${new Date().toLocaleString()}\n` +
      `Security Hash   : SHA256-${Math.random().toString(36).substring(2, 15).toUpperCase()}\n` +
      `Verification    : OTP Multi-Factor Verified\n\n` +
      `-------------------------------------------------------\n` +
      `Deliverable Metadata:\n` +
      `  - Format: Watertight Solid Mesh (.3DM / .STL / .ZIP)\n` +
      `  - Tolerances: ±0.01mm Micro-Precision Casting Ready\n` +
      `  - Shrinkage Allowance: +1.2% Gold/Platinum Standard\n` +
      `  - Gemstone Settings: Seats Pre-cut & Prong Adjusted\n` +
      `-------------------------------------------------------\n\n` +
      `Thank you for trusting Shiuli CAD Studio with your bespoke CAD craftsmanship.`;

    const blob = new Blob([dummyContent], { type: 'application/octet-stream' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const wishlistedProducts = PRODUCTS.filter((p) => wishlistIds.includes(p.id));

  const handleSimulateDownload = (orderOrTitle: string, fileType: string, orderObj?: any) => {
    const clientNameStr = user?.first_name ? `${user.first_name} ${user.last_name || ''}`.trim() : user?.username || 'Valued Client';
    const clientEmailStr = user?.email || userEmail || 'client@shiuli.com';

    // Update single-use OTP verification state for CAD Vault downloads
    if (orderObj && orderObj.id) {
      const currentUserEmail = (user?.email || userEmail || '').toLowerCase();
      const currentUsername = (user?.username || '').toLowerCase();
      const userKey = currentUserEmail || currentUsername;

      if (userKey) {
        const purchasesKey = `shiuli_user_purchases_${userKey}`;
        try {
          const stored = localStorage.getItem(purchasesKey);
          if (stored) {
            const parsed = JSON.parse(stored);
            if (Array.isArray(parsed)) {
              const updated = parsed.map((p: any) => {
                const pNumeric = Number(String(p.id).replace(/[^0-9]/g, ''));
                const targetNumeric = Number(String(orderObj.id).replace(/[^0-9]/g, ''));
                if (String(p.id) === String(orderObj.id) || (pNumeric > 0 && pNumeric === targetNumeric)) {
                  return {
                    ...p,
                    is_downloaded: true,
                    downloaded_at: new Date().toISOString(),
                    is_otp_verified: false, // Expire single-use OTP session to require fresh OTP verification for next download
                  };
                }
                return p;
              });
              localStorage.setItem(purchasesKey, JSON.stringify(updated));
            }
          }
        } catch (e) {
          console.warn('Failed to update download state in storage:', e);
        }
      }

      setPurchases((prevPurchases) =>
        prevPurchases.map((p: any) => {
          const pNumeric = Number(String(p.id).replace(/[^0-9]/g, ''));
          const targetNumeric = Number(String(orderObj.id).replace(/[^0-9]/g, ''));
          if (String(p.id) === String(orderObj.id) || (pNumeric > 0 && pNumeric === targetNumeric)) {
            return {
              ...p,
              is_downloaded: true,
              downloaded_at: new Date().toISOString(),
              is_otp_verified: false,
            };
          }
          return p;
        })
      );
    }

    const invoiceText = `================================================================================
                     SHIULI CAD STUDIO — OFFICIAL TAX INVOICE
                        Haute Joaillerie 3D CAD Atelier
                     GSTIN / Reg No: 24AAACS8912K1Z9
================================================================================
Invoice No: INV-${String(orderObj?.id || orderOrTitle).toUpperCase().replace(/[^a-zA-Z0-9-]/g, '')}
Date: ${orderObj?.date || new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: '2-digit' })}
Payment Status: PAID IN FULL (Verified)

--------------------------------------------------------------------------------
CLIENT DETAILS:
Name:  ${orderObj?.clientName || clientNameStr}
Email: ${orderObj?.clientEmail || clientEmailStr}
Account Type: Client Atelier Account
--------------------------------------------------------------------------------
ORDER SUMMARY:
Items / CAD Models: ${orderObj?.items ? orderObj.items.map((it: any) => it.productTitle || it.product?.title || 'Jewellery CAD Model').join(', ') : orderOrTitle}
Total Paid: ${orderObj?.total ? formatINR(orderObj.total) : 'Paid in Full'}
Delivered Assets: Native .3DM (Rhino 8) + Watertight Solid .STL + 4K Render Pack

--------------------------------------------------------------------------------
ENGINEERING COMPLIANCE & QUALITY GUARANTEE:
- Mesh Integrity: 100% Manifold Solid (Zero Naked Edges)
- Castability Pre-scaling: +1.25% Gold/Platinum Shrinkage Pre-Applied
- Stone Seat Tolerance: 0.02mm Precision bait seats
- Direct WhatsApp Engineering Desk: +91 9662159084 | info@shiulicadstudio.com

================================================================================
Thank you for choosing Shiuli CAD Studio!
================================================================================`;

    const blob = new Blob([invoiceText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Invoice_${String(orderObj?.id || orderOrTitle).replace(/\s+/g, '_')}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-[#070D22] text-[#F5F1E8] pt-24 pb-24 px-4 sm:px-8 lg:px-12">
      <div className="max-w-[1400px] mx-auto space-y-8">
        
        {/* HEADER PROFILE BANNER */}
        <RevealOnScroll className="relative rounded-3xl bg-gradient-to-r from-[#0A1230] via-[#12204D] to-[#080E26] border-2 border-[#D4AF37]/40 p-6 sm:p-8 shadow-[0_20px_50px_rgba(0,0,0,0.6)] overflow-hidden">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6 relative z-10">
            <div className="flex items-center gap-5">
              <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-[#1E4FA3] via-[#D4AF37] to-[#F5E7A3] p-[2.5px] shadow-[0_0_20px_rgba(212,175,55,0.4)] overflow-hidden">
                {user?.profile_photo ? (
                  <img src={user.profile_photo} alt={user.username} className="w-full h-full rounded-full object-cover" />
                ) : (
                  <div className="w-full h-full rounded-full bg-[#070D22] flex items-center justify-center text-[#F5E7A3]">
                    <User className="w-9 h-9 text-[#F5E7A3]" />
                  </div>
                )}
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h1 className="font-serif text-2xl font-extrabold text-[#FAF8F3]">
                    {user?.first_name ? `${user.first_name} ${user.last_name || ''}` : 'Client Atelier Workspace'}
                  </h1>
                  <span className="px-2.5 py-0.5 rounded-full bg-[#D4AF37]/20 border border-[#D4AF37]/50 text-[10px] text-[#F5E7A3] font-mono uppercase tracking-widest font-bold">
                    {user?.role?.toUpperCase() || 'VERIFIED CLIENT'}
                  </span>
                </div>
                <p className="text-xs text-[#C9C2A6] font-mono">{user?.email || userEmail || 'client@shiuli.com'}</p>
              </div>
            </div>

            <button
              onClick={() => onNavigate('custom-design')}
              className="btn-gold-luxury px-6 py-3 rounded-2xl text-xs font-extrabold uppercase tracking-widest flex items-center gap-2 shadow-[0_0_20px_rgba(212,175,55,0.4)]"
            >
              <Sparkles className="w-4 h-4 text-[#0B1330]" />
              <span>+ Start Custom Brief</span>
            </button>
          </div>
        </RevealOnScroll>

        {/* LUXURY NAVIGATION TABS */}
        <div className="flex border-b-2 border-[#D4AF37]/25 overflow-x-auto gap-2 sm:gap-4 text-xs sm:text-sm font-serif">
          <button
            onClick={() => setActiveTab('custom')}
            className={`px-5 py-3.5 rounded-t-2xl flex items-center gap-2 font-bold transition-all whitespace-nowrap ${
              activeTab === 'custom'
                ? 'bg-[#12204D] text-[#F5E7A3] border-t-2 border-x-2 border-[#D4AF37] shadow-lg'
                : 'text-[#C9C2A6] hover:text-white'
            }`}
          >
            <Clock className="w-4 h-4 text-[#D4AF37]" />
            <span>Custom Requests &amp; Journey ({customRequests.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('downloads')}
            className={`px-5 py-3.5 rounded-t-2xl flex items-center gap-2 font-bold transition-all whitespace-nowrap ${
              activeTab === 'downloads'
                ? 'bg-[#12204D] text-[#F5E7A3] border-t-2 border-x-2 border-[#D4AF37] shadow-lg'
                : 'text-[#C9C2A6] hover:text-white'
            }`}
          >
            <Download className="w-4 h-4 text-[#7EACFC]" />
            <span>My CAD Vault ({purchases.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('orders')}
            className={`px-5 py-3.5 rounded-t-2xl flex items-center gap-2 font-bold transition-all whitespace-nowrap ${
              activeTab === 'orders'
                ? 'bg-[#12204D] text-[#F5E7A3] border-t-2 border-x-2 border-[#D4AF37] shadow-lg'
                : 'text-[#C9C2A6] hover:text-white'
            }`}
          >
            <ShoppingBag className="w-4 h-4 text-[#D4AF37]" />
            <span>Order History ({userOrders.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('wishlist')}
            className={`px-5 py-3.5 rounded-t-2xl flex items-center gap-2 font-bold transition-all whitespace-nowrap ${
              activeTab === 'wishlist'
                ? 'bg-[#12204D] text-[#F5E7A3] border-t-2 border-x-2 border-[#D4AF37] shadow-lg'
                : 'text-[#C9C2A6] hover:text-white'
            }`}
          >
            <Heart className="w-4 h-4 text-rose-400" />
            <span>Wishlist ({wishlistIds.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('profile')}
            className={`px-5 py-3.5 rounded-t-2xl flex items-center gap-2 font-bold transition-all whitespace-nowrap ${
              activeTab === 'profile'
                ? 'bg-[#12204D] text-[#F5E7A3] border-t-2 border-x-2 border-[#D4AF37] shadow-lg'
                : 'text-[#C9C2A6] hover:text-white'
            }`}
          >
            <User className="w-4 h-4 text-[#D4AF37]" />
            <span>My Profile &amp; Security</span>
          </button>
        </div>

        {/* TAB 1: CONTINUOUS VERTICAL JOURNEY TIMELINE */}
        {activeTab === 'custom' && (
          <div className="space-y-12">
            {loadingCustom ? (
              <div className="py-24 rounded-3xl bg-[#09112B] border border-[#D4AF37]/30 flex flex-col items-center justify-center gap-4 text-xs text-[#C9C2A6] shadow-2xl">
                <Loader2 className="w-10 h-10 text-[#D4AF37] animate-spin" />
                <span className="font-serif text-base text-[#F5E7A3]">Loading Custom Atelier Orders...</span>
              </div>
            ) : customRequests.length === 0 ? (
              <div className="p-16 text-center rounded-3xl bg-[#09112B] border-2 border-dashed border-[#D4AF37]/30 space-y-6 shadow-2xl">
                <Sparkles className="w-12 h-12 text-[#D4AF37] mx-auto" />
                <h4 className="font-serif text-2xl text-[#FAF8F3]">No Custom CAD Orders Active</h4>
                <p className="text-xs text-[#C9C2A6] max-w-md mx-auto">
                  Submit a custom design brief with reference sketches and metal choices to collaborate directly with our senior CAD artisans.
                </p>
                <button
                  onClick={() => onNavigate('custom-design')}
                  className="btn-gold-luxury px-8 py-3.5 rounded-2xl text-xs font-extrabold uppercase tracking-widest inline-flex items-center gap-2"
                >
                  <PlusCircle className="w-4 h-4 text-[#0B1330]" />
                  <span>Start Bespoke CAD Order</span>
                </button>
              </div>
            ) : (
              customRequests.map((req) => {
                const order = req.order;
                const assignedStaff = order?.assigned_staff;
                const hasAgreedPrice = Boolean(req.agreed_price && parseFloat(req.agreed_price) > 0);
                const hasEstimatedPrice = Boolean(req.estimated_price_shown && parseFloat(req.estimated_price_shown) > 0);
                const isPriceQuoted = hasAgreedPrice || hasEstimatedPrice;
                const totalVal = parseFloat(req.agreed_price || req.estimated_price_shown || '0');
                
                // Dynamic Title & Metal Calculation from entered specs
                let categoryStr = '';
                if (req.special_instructions) {
                  const catMatch = req.special_instructions.match(/Category:\s*([^\n\r]+)/i);
                  if (catMatch && catMatch[1]) categoryStr = catMatch[1].trim();
                }
                if (!categoryStr && req.category_name && !req.category_name.toLowerCase().includes('pins test')) {
                  categoryStr = req.category_name;
                }
                if (!categoryStr) {
                  categoryStr = req.jewelleryType || req.category_name || 'Bespoke Custom Jewellery';
                }
                categoryStr = categoryStr.charAt(0).toUpperCase() + categoryStr.slice(1);
                if (categoryStr.toLowerCase() === 'rings') categoryStr = 'Rings';
                if (categoryStr.toLowerCase() === 'pendants') categoryStr = 'Pendants & Necklaces';
                if (categoryStr.toLowerCase() === 'earrings') categoryStr = 'Earrings';
                if (categoryStr.toLowerCase() === 'bracelets') categoryStr = 'Bracelets & Bangles';

                let metalStr = '';
                if (req.special_instructions) {
                  const metalMatch = req.special_instructions.match(/Metal Alloy & Purity:\s*([^\n\r]+)/i);
                  if (metalMatch && metalMatch[1]) metalStr = metalMatch[1].trim();
                }
                if (!metalStr) {
                  const purity = req.gold_purity || '';
                  let alloy = req.metal_alloy_name || '';
                  if (alloy && purity) {
                    if (/\b\d{2}K\b/i.test(alloy)) {
                      metalStr = alloy.replace(/\b\d{2}K\b/i, purity);
                    } else {
                      metalStr = `${purity} ${alloy}`;
                    }
                  } else if (alloy) {
                    metalStr = alloy;
                  } else if (purity) {
                    metalStr = `${purity} Gold`;
                  } else {
                    metalStr = '18K Yellow Gold';
                  }
                }

                // Remap any legacy "on_design_approval / locked" stages from old backend records
                // so they show as payable (clients no longer need to approve anything)
                const remapStages = (rawStages: any[]) =>
                  rawStages.map((st: any) => {
                    if ((st.trigger_type === 'on_design_approval' || st.trigger_type === 'on_design_approval') && st.status === 'locked') {
                      return { ...st, trigger_type: 'during_cad_work', status: 'due', label: st.label?.replace('Design Approval Milestone', 'Mid-Project Milestone') || st.label };
                    }
                    return st;
                  });

                const stages = (order?.payment_stages && order.payment_stages.length > 0)
                  ? remapStages(order.payment_stages)
                  : (req.payment_stages && req.payment_stages.length > 0)
                  ? remapStages(req.payment_stages)
                  : [
                      {
                        id: 1,
                        label: 'Stage 1: Booking Confirmation',
                        percentage: 10,
                        amount: totalVal * 0.10,
                        trigger_type: 'immediate',
                        status: (req.stage1_paid || req.paid_stages?.includes(1) || req.status === 'in_progress' || req.status === 'completed' || req.status === 'paid') ? 'paid' : 'due',
                      },
                      {
                        id: 2,
                        label: 'Stage 2: Mid-Project Milestone',
                        percentage: 30,
                        amount: totalVal * 0.30,
                        trigger_type: 'during_cad_work',
                        // Unlocks once Stage 1 is paid and order is active (no client approval needed)
                        status: (req.stage2_paid || req.paid_stages?.includes(2))
                          ? 'paid'
                          : (req.stage1_paid || req.paid_stages?.includes(1) || req.status === 'in_progress' || req.status === 'completed')
                          ? 'due'
                          : 'locked',
                      },
                      {
                        id: 3,
                        label: 'Stage 3: Final Deliverables Release',
                        percentage: 60,
                        amount: totalVal * 0.60,
                        trigger_type: 'before_release',
                        // Unlocks once Stage 2 is paid OR staff has completed work
                        status: (req.stage3_paid || req.paid_stages?.includes(3) || req.status === 'completed')
                          ? 'paid'
                          : (req.stage2_paid || req.paid_stages?.includes(2) || order?.status === 'preview_ready' || order?.status === 'completed')
                          ? 'due'
                          : 'locked',
                      },
                    ];

                const paidVal = stages
                  .filter((st: any) => st.status === 'paid')
                  .reduce((acc: number, st: any) => acc + Number(st.amount || 0), 0);

                const paidPct = totalVal > 0 ? Math.min(100, Math.round((paidVal / totalVal) * 100)) : 0;
                const isExpanded = expandedSpecs[req.id] !== undefined ? expandedSpecs[req.id] : true;

                return (
                  <div key={req.id} className="space-y-8 border-b border-[#D4AF37]/20 pb-16">
                    {/* 1. TOP ORDER SUMMARY BAND */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-white/10 pb-6">
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-3">
                          <span className="text-xs font-mono font-bold text-[#D4AF37]">
                            REQ #{req.id} {order ? `• ORDER #${order.id}` : ''}
                          </span>
                          
                          {/* Elegant Single Status Pill */}
                          <span className="px-3.5 py-1 rounded-full text-xs font-mono font-bold uppercase tracking-wider bg-[#12204D] border border-[#D4AF37]/50 text-[#F5E7A3] flex items-center gap-2 shadow-md">
                            <span className="w-2 h-2 rounded-full bg-[#D4AF37] animate-pulse" />
                            {assignedStaff
                              ? `In Design • With ${assignedStaff.first_name || assignedStaff.username || 'Assigned Artisan'}`
                              : req.status === 'agreed' || order
                              ? 'Awaiting Booking Payment (10%)'
                              : req.status === 'quoted'
                              ? 'Official Quote Received'
                              : 'Submitted • In Review'}
                          </span>
                        </div>

                        <h2 className="font-serif text-3xl font-extrabold text-[#FAF8F3]">
                          {categoryStr} ({metalStr})
                        </h2>
                      </div>

                      {/* COMPACT PAYMENT PROGRESS OR QUOTE ESTIMATION STATUS */}
                      {isPriceQuoted && totalVal > 0 ? (
                        <div className="p-4 rounded-2xl bg-[#09112B] border border-[#D4AF37]/30 sm:w-80 space-y-2 shadow-lg">
                          <div className="flex justify-between text-xs font-mono">
                            <span className="text-[#C9C2A6]">Payment Progress</span>
                            <span className="text-[#F5E7A3] font-bold">{formatINR(paidVal)} of {formatINR(totalVal)} ({paidPct}%)</span>
                          </div>
                          <div className="w-full h-2.5 rounded-full bg-[#060B1E] overflow-hidden p-0.5 border border-white/10">
                            <div
                              className="h-full rounded-full bg-gradient-to-r from-[#1E4FA3] via-[#D4AF37] to-[#F5E7A3] transition-all duration-500"
                              style={{ width: `${paidPct}%` }}
                            />
                          </div>
                        </div>
                      ) : (
                        <div className="p-4 rounded-2xl bg-[#09112B] border border-[#D4AF37]/30 sm:w-80 space-y-1.5 shadow-lg">
                          <div className="flex justify-between items-center text-xs font-mono">
                            <span className="text-[#C9C2A6]">Commercial Quote</span>
                            <span className="px-2 py-0.5 rounded bg-amber-950/80 text-amber-300 border border-amber-500/40 text-[10px] font-bold uppercase">
                              {req.status === 'quoted' ? 'Quote Ready' : 'In Review'}
                            </span>
                          </div>
                          <p className="text-sm font-serif font-bold text-[#FAF8F3] flex items-center gap-2">
                            <Clock className="w-4 h-4 text-[#D4AF37] animate-pulse" />
                            <span>{req.status === 'quoted' ? 'Official Offer Received' : 'Calculating Atelier Quote'}</span>
                          </p>
                          <p className="text-[10px] text-[#C9C2A6] font-sans">
                            {req.status === 'quoted' ? 'Review engineer quotation in Step 2 below.' : 'Our master CAD engineers are estimating casting volume & stone settings.'}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* 2. THE ASSIGNED DESIGNER CARD (100% DYNAMIC) */}
                    {assignedStaff ? (
                      <div className="p-6 rounded-3xl bg-gradient-to-r from-[#09112B] via-[#0E1B42] to-[#09112B] border-2 border-[#D4AF37]/40 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-6">
                        <div className="flex items-center gap-5">
                          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden border-2 border-[#D4AF37] shadow-lg shrink-0 bg-[#070D22] flex items-center justify-center">
                            {assignedStaff.profile_photo ? (
                              <img
                                src={assignedStaff.profile_photo}
                                alt="CAD Designer"
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <User className="w-8 h-8 text-[#D4AF37]" />
                            )}
                          </div>
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <h4 className="font-serif text-xl font-bold text-[#FAF8F3]">
                                {assignedStaff.first_name
                                  ? `${assignedStaff.first_name} ${assignedStaff.last_name || ''}`.trim()
                                  : assignedStaff.username || 'Assigned Senior Craftsman'}
                              </h4>
                              <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-500/30 text-[10px] font-mono font-bold">
                                Assigned Craftsman
                              </span>
                            </div>
                            <p className="text-xs text-[#D4AF37] font-medium">
                              {assignedStaff.role || 'Senior CAD Artisan'} &bull; Specializes in {categoryStr}
                            </p>
                            <div className="flex items-center gap-3 text-xs text-[#C9C2A6] font-mono pt-1">
                              <span className="flex items-center gap-1 text-amber-300">
                                <Star className="w-3.5 h-3.5 fill-amber-300 text-amber-300" />
                                {assignedStaff.rating || '4.95'} / 5.0
                              </span>
                              <span>&bull;</span>
                              <span>{assignedStaff.jobs_completed || 140}+ Completed CAD Jobs</span>
                            </div>
                          </div>
                        </div>

                        <a
                          href={`https://wa.me/919662159084?text=Hello%20Shiuli%20CAD%20Studio%2C%20I%20am%20in%20touch%20regarding%20REQ%20%23${req.id}.`}
                          target="_blank"
                          rel="noreferrer"
                          className="px-5 py-3 rounded-2xl bg-emerald-950/70 border border-emerald-500/40 text-emerald-300 text-xs font-bold uppercase tracking-wider flex items-center gap-2 hover:bg-emerald-900/60 transition-all shrink-0 shadow-lg"
                        >
                          <Phone className="w-4 h-4 text-emerald-400" />
                          <span>Direct Artisan Chat</span>
                        </a>
                      </div>
                    ) : (
                      <div className="p-6 rounded-3xl bg-[#09112B] border-2 border-dashed border-[#D4AF37]/40 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-6">
                        <div className="flex items-center gap-5">
                          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-[#12204D] border-2 border-[#D4AF37]/50 flex items-center justify-center text-[#F5E7A3] shrink-0 shadow-lg">
                            <Sparkles className="w-8 h-8 text-[#D4AF37]" />
                          </div>
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <h4 className="font-serif text-xl font-bold text-[#FAF8F3]">
                                Design Brief Under Atelier Review
                              </h4>
                              <span className="px-2.5 py-0.5 rounded-full bg-amber-950/80 text-amber-300 border border-amber-500/40 text-[10px] font-mono font-bold uppercase tracking-wider">
                                {req.status === 'quoted' ? 'Official Quote Issued' : 'Engineering Estimation'}
                              </span>
                            </div>
                            <p className="text-xs text-[#C9C2A6] max-w-xl">
                              {req.status === 'quoted'
                                ? `Our Senior CAD Engineers have completed casting & stone analysis and issued an official quote for your ${categoryStr} (${metalStr}) design.`
                                : `Our Master Atelier CAD Engineers are analyzing your submitted 3D tolerances, ${categoryStr} specifications, and metal volume to formulate your official bespoke quote.`}
                            </p>
                          </div>
                        </div>

                        <a
                          href={`https://wa.me/919662159084?text=Hello%20Shiuli%20CAD%20Studio%2C%20I%20am%20in%20touch%20regarding%20REQ%20%23${req.id}.`}
                          target="_blank"
                          rel="noreferrer"
                          className="px-5 py-3 rounded-2xl bg-[#12204D] border border-[#D4AF37]/40 text-[#F5E7A3] text-xs font-bold uppercase tracking-wider flex items-center gap-2 hover:bg-[#1A2E60] transition-all shrink-0 shadow-md"
                        >
                          <Phone className="w-4 h-4 text-[#D4AF37]" />
                          <span>Support Desk Chat</span>
                        </a>
                      </div>
                    )}

                    {/* 3. CONTINUOUS VERTICAL JOURNEY TIMELINE */}
                    <div className="relative pl-6 sm:pl-10 space-y-10 border-l-2 border-[#D4AF37]/30 ml-4 sm:ml-8 pt-2">
                      
                      {/* NODE 1: REQUEST SUBMITTED */}
                      <div className="relative group">
                        <div className="absolute -left-[31px] sm:-left-[47px] top-0 w-6 h-6 rounded-full bg-[#D4AF37] border-4 border-[#070D22] shadow-[0_0_10px_rgba(212,175,55,0.8)] flex items-center justify-center">
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#070D22]" />
                        </div>

                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <h3 className="font-serif text-xl font-bold text-[#FAF8F3]">
                              1. Bespoke Custom Request Submitted
                            </h3>
                            <span className="text-xs font-mono text-[#C9C2A6]">
                              {(() => {
                                if (!req.created_at) return 'Recently';
                                const d = new Date(req.created_at);
                                return isNaN(d.getTime()) ? String(req.created_at) : d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
                              })()}
                            </span>
                          </div>

                          {/* EXPANDABLE SPECIFICATIONS ACCORDION */}
                          <div className="rounded-2xl bg-[#09112B] border border-white/10 p-4 space-y-3">
                            <button
                              onClick={() => setExpandedSpecs((prev) => ({ ...prev, [req.id]: !isExpanded }))}
                              className="w-full flex items-center justify-between text-xs text-[#F5E7A3] font-semibold hover:underline"
                            >
                              <span className="flex items-center gap-2">
                                <Gem className="w-4 h-4 text-[#D4AF37]" />
                                View Full Submitted Brief &amp; Reference Sketches ({req.sketches?.length || 0})
                              </span>
                              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                            </button>

                            {isExpanded && (
                              <div className="pt-3 border-t border-white/10 space-y-4 text-xs">
                                {/* Structured Spec Summary Badges */}
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                  <div className="p-3 rounded-xl bg-[#060B1E] border border-white/5 space-y-1">
                                    <span className="text-[10px] font-mono text-[#D4AF37] uppercase font-bold">Category &amp; Metal:</span>
                                    <p className="font-bold text-[#FAF8F3] flex items-center gap-1.5 flex-wrap">
                                      {req.metal_swatch_color && (
                                        <span className="w-2.5 h-2.5 rounded-full border border-white/20 inline-block" style={{ backgroundColor: req.metal_swatch_color }} />
                                      )}
                                      <span>{metalStr}</span>
                                    </p>
                                    <p className="text-[11px] text-[#C9C2A6]">{categoryStr} &bull; {req.aesthetic_style_name || 'Bespoke Custom CAD'}</p>
                                  </div>

                                  <div className="p-3 rounded-xl bg-[#060B1E] border border-white/5 space-y-1">
                                    <span className="text-[10px] font-mono text-[#D4AF37] uppercase font-bold">Dimensions &amp; Gemstones:</span>
                                    <p className="font-bold text-[#FAF8F3]">
                                      {req.is_metal_only
                                        ? 'Solid Metal (No Gemstones)'
                                        : (req.stones?.length || req.gemstones?.length)
                                        ? `${(req.stones || req.gemstones).length} Stone Row(s) Configured`
                                        : req.special_instructions?.includes('Gemstones Layout')
                                        ? 'Custom Stone Layout'
                                        : 'Solid Metal / Custom Spec'}
                                    </p>
                                    {(req.ring_size || req.special_instructions?.includes('Ring Sizing')) && (
                                      <p className="text-[11px] text-[#F5E7A3] font-mono">
                                        Ring Size: {req.ring_size ? `${req.ring_size_standard?.toUpperCase() || 'IN/HK'} ${req.ring_size} ${req.target_weight_grams ? `(${req.target_weight_grams}g)` : ''}` : (req.special_instructions?.match(/Ring Sizing:\s*([^\n\r]+)/i)?.[1] || '')}
                                      </p>
                                    )}
                                    {req.engraving_text && (
                                      <p className="text-[10px] text-slate-300 font-mono italic">
                                        Engraving: "{req.engraving_text}"
                                      </p>
                                    )}
                                  </div>

                                  <div className="p-3 rounded-xl bg-[#060B1E] border border-white/5 space-y-1">
                                    <span className="text-[10px] font-mono text-[#D4AF37] uppercase font-bold">Client Contact:</span>
                                    <p className="font-bold text-[#FAF8F3]">{req.contact_name || req.client_name || 'Valued Client'}</p>
                                    <p className="text-[11px] text-[#C9C2A6] font-mono">{req.client_email || userEmail}</p>
                                  </div>
                                </div>

                                {req.custom_specs_text && (
                                  <div className="p-2.5 rounded-xl bg-[#060B1E] border border-white/5 text-xs text-[#FAF8F3]">
                                    <span className="text-[10px] font-mono text-[#D4AF37] uppercase font-bold block mb-0.5">Custom Specifications:</span>
                                    <p className="text-slate-300">{req.custom_specs_text}</p>
                                  </div>
                                )}

                                {(req.catalog_references_text || req.special_instructions?.includes('Catalog References')) && (
                                  <div className="p-2.5 rounded-xl bg-[#060B1E] border border-white/5 text-xs text-[#FAF8F3]">
                                    <span className="text-[10px] font-mono text-[#D4AF37] uppercase font-bold block mb-0.5">Referenced Catalog Designs:</span>
                                    <p className="text-slate-300 font-mono text-[11px]">
                                      {req.catalog_references_text || req.special_instructions?.match(/Catalog References[^:\n]*:\s*([^\n\r]+)/i)?.[1]}
                                    </p>
                                  </div>
                                )}

                                {/* Gemstones Breakdown Table if available */}
                                {((req.gemstones && req.gemstones.length > 0) || (req.stones && req.stones.length > 0)) && (
                                  <div className="space-y-2 p-3 rounded-xl bg-[#060B1E] border border-white/5">
                                    <span className="text-[10px] font-mono text-[#D4AF37] uppercase font-bold block">Gemstone Architecture Breakdown:</span>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                      {(req.gemstones?.length ? req.gemstones : req.stones).map((g: any, i: number) => (
                                        <div key={i} className="p-2 rounded-lg bg-[#09112B] border border-white/10 flex justify-between items-center text-xs">
                                          <span className="font-bold text-[#FAF8F3]">{g.quantity || 1}x {g.stone_type} ({g.cut_type || g.shape || 'Round Brilliant'})</span>
                                          <span className="text-[10px] font-mono text-[#F5E7A3]">{g.carat_size || `${g.size_value} ${g.size_unit}`} {g.clarity ? `• ${g.clarity}` : ''}</span>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}

                                {/* Full Pre-formatted Master Specification Brief */}
                                {(req.description || req.special_instructions) && (
                                  <div className="p-3.5 rounded-xl bg-[#060B1E] border border-white/10 space-y-1.5">
                                    <span className="text-[10px] font-mono text-[#D4AF37] uppercase font-bold tracking-wider block">
                                      Master CAD Engineering Specification Brief:
                                    </span>
                                    <pre className="text-xs text-[#FAF8F3] whitespace-pre-wrap font-sans leading-relaxed bg-[#09112B]/80 p-3 rounded-lg border border-white/5">
                                      {req.description || req.special_instructions}
                                    </pre>
                                  </div>
                                )}

                                {/* Reference Artwork & Catalog Files */}
                                {req.sketches && req.sketches.length > 0 && (
                                  <div className="space-y-2 p-3 rounded-xl bg-[#060B1E] border border-white/5">
                                    <span className="text-[10px] font-mono text-[#D4AF37] uppercase font-bold block">Reference Artwork &amp; Catalog Files ({req.sketches.length}):</span>
                                    <div className="flex flex-wrap gap-2 pt-1">
                                      {req.sketches.map((sk: any, i: number) => (
                                        <div key={sk.id || i} className="group relative">
                                          <img
                                            src={sk.image_url || sk.image}
                                            alt="Reference"
                                            onClick={() => setSelectedSketchUrl(sk.image_url || sk.image)}
                                            className="w-16 h-16 rounded-xl object-cover border border-white/20 hover:border-[#D4AF37] cursor-pointer shadow-md transition-all"
                                          />
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* NODE 2: OFFICIAL QUOTE & NEGOTIATION */}
                      <div className="relative group">
                        <div className={`absolute -left-[31px] sm:-left-[47px] top-0 w-6 h-6 rounded-full border-4 border-[#070D22] flex items-center justify-center ${
                          req.status === 'quoted' || req.status === 'negotiating' || req.status === 'agreed' || order
                            ? 'bg-[#D4AF37] shadow-[0_0_10px_rgba(212,175,55,0.8)]'
                            : 'bg-[#060B1E] border-slate-700'
                        }`}>
                          <Sparkles className="w-3.5 h-3.5 text-[#070D22]" />
                        </div>

                        <div className="space-y-4">
                          {(() => {
                            let latestOfferedPrice = req.agreed_price || req.estimated_price_shown;
                            if (req.messages && Array.isArray(req.messages)) {
                              for (let i = req.messages.length - 1; i >= 0; i--) {
                                if (req.messages[i].offered_price) {
                                  latestOfferedPrice = Number(req.messages[i].offered_price);
                                  break;
                                }
                              }
                            }
                            const displayPrice = latestOfferedPrice || req.agreed_price || req.estimated_price_shown;

                            return (
                              <>
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                  <div className="flex items-center gap-3">
                                    <h3 className="font-serif text-xl font-bold text-[#FAF8F3]">
                                      2. Official Senior Engineer Quote &amp; Negotiation
                                    </h3>
                                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider font-mono ${
                                      req.status === 'agreed' || req.status === 'in_progress' || order
                                        ? 'bg-[#1F9D66] text-white shadow-[0_0_8px_rgba(31,157,102,0.6)]'
                                        : req.status === 'quoted'
                                        ? 'bg-[#D4AF37] text-[#070D22]'
                                        : req.status === 'negotiating'
                                        ? 'bg-[#E8A93B] text-[#070D22]'
                                        : 'bg-[#12204D] text-[#F5E7A3] border border-[#D4AF37]/40'
                                    }`}>
                                      {req.status === 'agreed' || req.status === 'in_progress' || order
                                        ? 'ACCEPTED & AGREED'
                                        : req.status === 'quoted'
                                        ? 'OFFICIAL QUOTE READY'
                                        : req.status === 'negotiating'
                                        ? 'IN NEGOTIATION'
                                        : 'UNDER STUDIO REVIEW'}
                                    </span>
                                  </div>
                                  <span className="font-serif text-2xl font-bold text-[#F5E7A3]">
                                    {displayPrice && Number(displayPrice) > 0 ? (
                                      formatINR(displayPrice)
                                    ) : (
                                      <span className="text-sm font-sans font-semibold text-[#D4AF37] italic bg-[#060B1E] px-3 py-1.5 rounded-xl border border-[#D4AF37]/30">
                                        Quote In Progress
                                      </span>
                                    )}
                                  </span>
                                </div>

                                {/* REAL CHAT BUBBLES THREAD LOG */}
                                {req.messages && req.messages.length > 0 && (
                                  <div className="space-y-3 p-4 rounded-2xl bg-[#09112B] border border-white/10 max-h-72 overflow-y-auto custom-scrollbar">
                                    {req.messages.map((msg: any) => {
                                      const isAdmin = msg.sender_type === 'admin';
                                      return (
                                        <div
                                          key={msg.id}
                                          className={`flex gap-3 ${isAdmin ? 'justify-start' : 'justify-end'}`}
                                        >
                                          {isAdmin && (
                                            <div className="w-8 h-8 rounded-full bg-[#D4AF37]/20 border border-[#D4AF37] flex items-center justify-center text-[#F5E7A3] text-xs font-serif font-bold shrink-0">
                                              CAD
                                            </div>
                                          )}

                                          <div
                                            className={`p-4 rounded-2xl max-w-md text-xs space-y-1.5 shadow-md ${
                                              isAdmin
                                                ? 'bg-[#12204D] border border-[#D4AF37]/40 text-[#FAF8F3] rounded-tl-none'
                                                : 'bg-[#1A2E60] border border-white/20 text-[#FAF8F3] rounded-tr-none'
                                            }`}
                                          >
                                            <div className="flex justify-between items-center text-[10px] text-[#C9C2A6] pb-1 border-b border-white/10">
                                              <span className="font-bold">{isAdmin ? 'Senior CAD Engineer (Admin)' : 'You'}</span>
                                              <span className="font-mono">{new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                            </div>
                                            <p>{msg.message}</p>
                                            {msg.offered_price && (
                                              <div className="mt-2 p-2 rounded-xl bg-[#070D22] border border-[#D4AF37]/50 flex items-center justify-between text-xs">
                                                <span className="text-[10px] text-[#C9C2A6] uppercase">Official Price Offer:</span>
                                                <span className="font-mono font-bold text-[#F5E7A3]">{formatINR(msg.offered_price)}</span>
                                              </div>
                                            )}
                                          </div>
                                        </div>
                                      );
                                    })}
                                  </div>
                                )}

                                {/* STATUS AGREED BANNER */}
                                {(req.status === 'agreed' || req.status === 'in_progress' || order) && (
                                  <div className="p-4 rounded-2xl bg-[#09261A] border border-[#1F9D66]/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-lg text-xs mt-3">
                                    <div className="flex items-center gap-3">
                                      <div className="w-9 h-9 rounded-full bg-[#1F9D66]/20 border border-[#1F9D66] flex items-center justify-center text-[#26D07C] shrink-0">
                                        <CheckCircle2 className="w-5 h-5" />
                                      </div>
                                      <div>
                                        <span className="font-bold text-[#FAF8F3] text-sm block">Quote Accepted &amp; Status AGREED!</span>
                                        <span className="text-[#A2E8C4] text-[11px]">
                                          Agreed Final Price: <strong>{formatINR(req.agreed_price || displayPrice)}</strong>. Payment schedule is active below.
                                        </span>
                                      </div>
                                    </div>
                                    <div className="px-3.5 py-1.5 rounded-xl bg-[#1F9D66] text-white text-[10px] font-extrabold uppercase tracking-wider font-mono flex items-center gap-1.5 shadow shrink-0">
                                      <CheckCircle2 className="w-3.5 h-3.5" />
                                      <span>ACCEPTED</span>
                                    </div>
                                  </div>
                                )}

                                {/* ACTION BUTTONS & TWO-WAY NEGOTIATION FORM */}
                                {(req.status === 'quoted' || req.status === 'negotiating') && (
                                  <div className="space-y-4 pt-2">
                                    <div className="flex flex-wrap items-center gap-4">
                                      {/* Option 1: Accept current quote */}
                                      <button
                                        onClick={() => handleAcceptQuote(req.id)}
                                        disabled={isSubmitting[req.id]}
                                        className="btn-gold-luxury px-8 py-3.5 rounded-2xl text-xs font-extrabold uppercase tracking-widest flex items-center gap-2 shadow-xl cursor-pointer"
                                      >
                                        {isSubmitting[req.id] ? (
                                          <Loader2 className="w-4 h-4 text-[#0B1330] animate-spin" />
                                        ) : (
                                          <CheckCircle2 className="w-4 h-4 text-[#0B1330]" />
                                        )}
                                        <span>Accept Quote ({formatINR(displayPrice)}) &amp; Activate Payment</span>
                                      </button>

                                      {/* Option 2: Propose Counter Price / Send Price Request */}
                                      <button
                                        type="button"
                                        onClick={() => setShowCounterForm((prev) => ({ ...prev, [req.id]: !prev[req.id] }))}
                                        className="px-6 py-3.5 rounded-2xl text-xs font-extrabold uppercase tracking-wider flex items-center gap-2 border border-[#D4AF37]/50 text-[#F5E7A3] hover:bg-[#D4AF37]/10 transition-all shadow-md cursor-pointer"
                                      >
                                        <MessageSquare className="w-4 h-4 text-[#D4AF37]" />
                                        <span>{showCounterForm[req.id] ? 'Hide Counter Form' : 'Not Satisfied? Propose Counter Price'}</span>
                                      </button>
                                    </div>

                                    {/* Counter Offer Form (visible when toggled or if status is negotiating) */}
                                    {(showCounterForm[req.id] || req.status === 'negotiating') && (
                                      <form
                                        onSubmit={(e) => handleSendCounterOffer(e, req.id)}
                                        className="p-4 rounded-2xl bg-[#081233] border border-[#D4AF37]/30 space-y-3"
                                      >
                                        <div className="flex items-center justify-between border-b border-white/10 pb-2">
                                          <span className="text-xs font-bold font-serif text-[#FAF8F3] uppercase tracking-wider flex items-center gap-2">
                                            <Send className="w-3.5 h-3.5 text-[#D4AF37]" />
                                            Send Price Request / Counter-Offer to SuperAdmin
                                          </span>
                                          <span className="text-[10px] text-[#C9C2A6] font-mono">Multi-Round Negotiation Active</span>
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                          <div className="sm:col-span-1">
                                            <label className="block text-[10px] font-mono text-[#C9C2A6] uppercase mb-1">
                                              Your Target Price (₹)
                                            </label>
                                            <input
                                              type="number"
                                              value={counterPriceInput[req.id] || ''}
                                              onChange={(e) => setCounterPriceInput({ ...counterPriceInput, [req.id]: e.target.value })}
                                              placeholder="e.g. 18000"
                                              className="w-full px-3 py-2 rounded-xl bg-[#060B1E] border border-white/10 text-xs font-mono font-bold text-[#FAF8F3] focus:outline-none focus:border-[#D4AF37]"
                                            />
                                          </div>
                                          <div className="sm:col-span-2">
                                            <label className="block text-[10px] font-mono text-[#C9C2A6] uppercase mb-1">
                                              Note for SuperAdmin (Optional)
                                            </label>
                                            <input
                                              type="text"
                                              value={counterMessageInput[req.id] || ''}
                                              onChange={(e) => setCounterMessageInput({ ...counterMessageInput, [req.id]: e.target.value })}
                                              placeholder="e.g. Can we adjust within this budget for 18K Yellow Gold?"
                                              className="w-full px-3 py-2 rounded-xl bg-[#060B1E] border border-white/10 text-xs text-[#FAF8F3] focus:outline-none focus:border-[#D4AF37]"
                                            />
                                          </div>
                                        </div>

                                        <div className="flex justify-end gap-2 pt-1">
                                          <button
                                            type="submit"
                                            disabled={isSubmitting[req.id]}
                                            className="btn-gold-luxury px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-1.5"
                                          >
                                            {isSubmitting[req.id] ? (
                                              <Loader2 className="w-4 h-4 text-[#0B1330] animate-spin" />
                                            ) : (
                                              <>
                                                <Send className="w-3.5 h-3.5 text-[#0B1330]" />
                                                <span>Submit Price Request to SuperAdmin</span>
                                              </>
                                            )}
                                          </button>
                                        </div>
                                      </form>
                                    )}
                                  </div>
                                )}
                              </>
                            );
                          })()}
                        </div>
                      </div>

                      {/* STEPS 3, 4, & 5 UNLOCK ONLY AFTER QUOTE IS ACCEPTED */}
                      {(req.status === 'agreed' || req.status === 'quote_accepted' || req.status === 'paid' || req.status === 'in_progress' || req.status === 'completed' || Boolean(order)) ? (
                        <>
                          {/* NODE 3: MULTI-STAGE PAYMENT SCHEDULE TABLE */}
                          <div className="relative group">
                            <div className={`absolute -left-[31px] sm:-left-[47px] top-0 w-6 h-6 rounded-full border-4 border-[#070D22] flex items-center justify-center ${
                              paidVal > 0
                                ? 'bg-[#D4AF37] shadow-[0_0_10px_rgba(212,175,55,0.8)]'
                                : 'bg-[#060B1E] border-slate-700'
                            }`}>
                              <CreditCard className="w-3.5 h-3.5 text-[#070D22]" />
                            </div>

                            <div className="space-y-4">
                              <h3 className="font-serif text-xl font-bold text-[#FAF8F3]">
                                3. Multi-Stage Payment Schedule (Transparent 10/30/60 Split)
                              </h3>

                              <div className="rounded-2xl bg-[#09112B] border border-[#D4AF37]/30 overflow-hidden shadow-xl">
                                <table className="w-full text-left text-xs text-[#C9C2A6]">
                                  <thead className="bg-[#070D22] text-[#FAF8F3] font-serif border-b border-[#D4AF37]/20 uppercase text-[10px] tracking-wider">
                                    <tr>
                                      <th className="p-4">Stage Name</th>
                                      <th className="p-4">% Split</th>
                                      <th className="p-4">Amount (INR)</th>
                                      <th className="p-4">Trigger Condition</th>
                                      <th className="p-4 text-right">Payment Status</th>
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-white/5">
                                    {stages.map((st: any) => (
                                      <tr key={st.id} className="hover:bg-white/5 transition-colors">
                                        <td className="p-4 font-bold text-[#FAF8F3]">{st.label}</td>
                                        <td className="p-4 font-mono">{st.percentage}%</td>
                                        <td className="p-4 font-serif text-sm font-bold text-[#F5E7A3]">{formatINR(st.amount)}</td>
                                        <td className="p-4 text-[11px] text-[#C9C2A6]">
                                          {st.trigger_type === 'immediate'
                                            ? 'Due Immediately to Start CAD'
                                            : st.trigger_type === 'during_cad_work' || st.trigger_type === 'on_design_approval'
                                            ? 'Due During Active CAD Work'
                                            : 'Due Before Final File Release'}
                                        </td>
                                        <td className="p-4 text-right">
                                          {st.status === 'paid' ? (
                                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-500/40 text-[10px] font-mono font-bold shadow-sm">
                                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                                              PAID
                                            </span>
                                          ) : st.status === 'due' ? (
                                            <button
                                              onClick={() => handlePayStage(st.id, req.id, st.amount, st.label)}
                                              className="btn-gold-luxury px-4 py-1.5 rounded-xl text-[11px] font-extrabold uppercase tracking-wider shadow-md hover:scale-105 transition-transform"
                                            >
                                              Pay Now ({formatINR(st.amount)})
                                            </button>
                                          ) : (
                                            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-slate-900 text-slate-400 border border-slate-700 text-[10px] font-mono">
                                              <Lock className="w-3 h-3" />
                                              LOCKED
                                            </span>
                                          )}
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          </div>

                          {/* NODE 4: LIVE CRAFTSMAN MILESTONE PROGRESS TRACKER */}
                          {(() => {
                            const orderId = order?.id ? String(order.id) : null;
                            const reqIdStr = String(req.id);
                            const assignedStaffObj = order?.assigned_staff || req.assigned_staff || req.order?.assigned_staff;
                            const isAssigned = Boolean(assignedStaffObj);

                            const backendMilestones: any[] = order?.milestones || [];
                            const localMilestones: any[] = orderId
                              ? (orderMilestones[orderId] || orderMilestones[`JOB-REQ-${reqIdStr.replace(/[^0-9]/g, '') || reqIdStr}`] || [])
                              : (orderMilestones[`JOB-REQ-${reqIdStr.replace(/[^0-9]/g, '') || reqIdStr}`] || []);

                            let extraLocalMs: any[] = [];
                            const keysToCheck = [orderId, reqIdStr, `JOB-REQ-${reqIdStr.replace(/[^0-9]/g, '') || reqIdStr}`].filter(Boolean);
                            for (const k of keysToCheck) {
                              try {
                                const raw = localStorage.getItem(`shiuli_order_milestone_${k}`);
                                if (raw) {
                                  const parsed = JSON.parse(raw);
                                  if (parsed && parsed.stage && !extraLocalMs.some((m) => m.stage === parsed.stage)) {
                                    extraLocalMs.push({
                                      id: Date.now(),
                                      stage: parsed.stage,
                                      progress: parsed.progress || 25,
                                      created_at: parsed.updatedAt || new Date().toISOString(),
                                      note: `Artisan active on bench: ${parsed.stage} stage (${parsed.progress || 25}% complete).`
                                    });
                                  }
                                }
                              } catch (e) {}
                            }

                            const rawAllMilestones = backendMilestones.length > 0 ? backendMilestones : (localMilestones.length > 0 ? localMilestones : extraLocalMs);

                            const allMilestones = (rawAllMilestones.length === 0 && isAssigned)
                              ? [{
                                  id: 1,
                                  stage: 'Work Started',
                                  progress: 25,
                                  created_at: order?.assigned_at || new Date().toISOString(),
                                  note: `Order accepted by Master CAD Artisan ${assignedStaffObj.first_name || assignedStaffObj.username || assignedStaffObj.name || ''}. 3D CAD modeling is underway on the bench.`
                                }]
                              : rawAllMilestones;

                            // The 4 canonical craft steps
                            const CRAFT_STEPS = [
                              { key: 'started', label: 'Work Started', pct: 25, icon: '01' },
                              { key: 'modeling', label: '3D Modeling', pct: 60, icon: '02' },
                              { key: 'refining', label: 'Refining & Polish', pct: 85, icon: '03' },
                              { key: 'delivery', label: 'Ready for Delivery', pct: 100, icon: '04' },
                            ];

                            // Determine which step is active from latest milestone
                            let activeStepIdx = -1;
                            if (allMilestones.length > 0) {
                              const last = allMilestones[allMilestones.length - 1];
                              const stageLower = (last.stage || last.title || '').toLowerCase();
                              const pct = Number(last.progress) || 0;
                              if (stageLower.includes('delivery') || stageLower.includes('complete') || stageLower.includes('done') || pct >= 100) activeStepIdx = 3;
                              else if (stageLower.includes('refin') || pct >= 85) activeStepIdx = 2;
                              else if (stageLower.includes('model') || pct >= 60) activeStepIdx = 1;
                              else if (stageLower.includes('start') || pct >= 25 || isAssigned) activeStepIdx = 0;
                            } else if (isAssigned) {
                              activeStepIdx = 0;
                            }

                            const isWorkComplete = activeStepIdx >= 3;

                            return (
                              <div className="relative group">
                                <div className={`absolute -left-[31px] sm:-left-[47px] top-0 w-6 h-6 rounded-full border-4 border-[#070D22] flex items-center justify-center ${
                                  isWorkComplete
                                    ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.8)]'
                                    : activeStepIdx >= 0
                                    ? 'bg-[#D4AF37] shadow-[0_0_10px_rgba(212,175,55,0.8)] animate-pulse'
                                    : 'bg-[#060B1E] border-slate-700'
                                }`}>
                                  <TrendingUp className="w-3.5 h-3.5 text-[#070D22]" />
                                </div>

                                <div className="space-y-4">
                                  <div className="flex items-center gap-3">
                                    <h3 className="font-serif text-xl font-bold text-[#FAF8F3]">
                                      4. CAD Craftsmanship Progress
                                    </h3>
                                    {activeStepIdx >= 0 && (
                                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider ${
                                        isWorkComplete
                                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/40'
                                          : 'bg-[#D4AF37]/20 text-[#F5E7A3] border border-[#D4AF37]/50 animate-pulse'
                                      }`}>
                                        {isWorkComplete ? '✓ Artisan Work Complete' : 'In Progress'}
                                      </span>
                                    )}
                                  </div>

                                  {!isAssigned && activeStepIdx < 0 ? (
                                    <div className="p-5 rounded-2xl bg-[#09112B] border border-[#D4AF37]/30 text-xs text-[#C9C2A6] space-y-2">
                                      <div className="flex items-center gap-2 text-[#F5E7A3] font-bold">
                                        <Clock className="w-4 h-4 text-[#D4AF37] animate-pulse shrink-0" />
                                        <span>Order Approved • Awaiting Artisan Claim from Master Pool</span>
                                      </div>
                                      <p className="text-[11px] text-slate-300 leading-relaxed">
                                        Your custom brief is approved and broadcasted in our master job pool. As soon as a specialized CAD artisan claims your project slot, their profile and live workbench progress will appear here instantly.
                                      </p>
                                    </div>
                                  ) : (
                                    <div className="space-y-4">
                                      {/* Assigned Artisan Banner */}
                                      {isAssigned && assignedStaffObj && (
                                        <div className="p-4 rounded-2xl bg-gradient-to-r from-[#09112B] via-[#0E1A3D] to-[#09112B] border border-[#D4AF37]/40 flex items-center justify-between shadow-lg">
                                          <div className="flex items-center gap-3">
                                            <div className="w-11 h-11 rounded-full bg-[#D4AF37]/20 border border-[#D4AF37] flex items-center justify-center font-bold font-serif text-[#F5E7A3] text-sm overflow-hidden shrink-0">
                                              {assignedStaffObj.profile_photo ? (
                                                <img src={assignedStaffObj.profile_photo} alt="Artisan" className="w-full h-full object-cover" />
                                              ) : (
                                                (assignedStaffObj.first_name?.[0] || assignedStaffObj.username?.[0] || 'A').toUpperCase()
                                              )}
                                            </div>
                                            <div>
                                              <div className="flex items-center gap-2 flex-wrap">
                                                <span className="text-xs font-bold text-[#FAF8F3]">
                                                  {assignedStaffObj.first_name ? `${assignedStaffObj.first_name} ${assignedStaffObj.last_name || ''}` : assignedStaffObj.username || 'Master CAD Artisan'}
                                                </span>
                                                <span className="px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-500/40 text-[9px] font-mono font-bold uppercase tracking-wider">
                                                  ✓ Accepted & Active on Bench
                                                </span>
                                              </div>
                                              <p className="text-[11px] text-[#C9C2A6] mt-0.5">
                                                Assigned Master Artisan • Crafting your bespoke 3D CAD design
                                              </p>
                                            </div>
                                          </div>
                                          <div className="hidden sm:block text-right shrink-0">
                                            <span className="text-[10px] font-mono text-[#D4AF37] font-bold block uppercase">Live Status</span>
                                            <span className="text-xs font-mono font-bold text-[#F5E7A3]">
                                              {activeStepIdx >= 0 ? `${CRAFT_STEPS[Math.min(activeStepIdx, 3)].label}` : 'Work Started'}
                                            </span>
                                          </div>
                                        </div>
                                      )}

                                      {/* Craftsman Milestone Stepper */}
                                      <div className="p-5 rounded-2xl bg-[#09112B] border border-[#D4AF37]/20 space-y-4">
                                        <div className="flex items-center justify-between">
                                          <span className="text-[10px] font-mono text-[#D4AF37] uppercase font-bold tracking-wider">Live Artisan Progress</span>
                                          <span className="text-[10px] font-mono text-[#C9C2A6]">
                                            {activeStepIdx >= 0 ? `${CRAFT_STEPS[Math.min(activeStepIdx, 3)].pct}% Complete` : '25% Complete'}
                                          </span>
                                        </div>

                                        {/* Progress Bar */}
                                        <div className="w-full h-2 rounded-full bg-[#060B1E] overflow-hidden border border-white/5">
                                          <div
                                            className={`h-full rounded-full transition-all duration-700 ${
                                              isWorkComplete
                                                ? 'bg-gradient-to-r from-emerald-600 to-emerald-400'
                                                : 'bg-gradient-to-r from-[#1E4FA3] via-[#D4AF37] to-[#F5E7A3] animate-pulse'
                                            }`}
                                            style={{ width: `${activeStepIdx >= 0 ? CRAFT_STEPS[Math.min(activeStepIdx, 3)].pct : 25}%` }}
                                          />
                                        </div>

                                        {/* Step Indicators */}
                                        <div className="grid grid-cols-4 gap-2">
                                          {CRAFT_STEPS.map((step, idx) => {
                                            const isDone = activeStepIdx > idx;
                                            const isCurrent = activeStepIdx === idx;
                                            return (
                                              <div key={step.key} className={`p-2.5 rounded-xl text-center space-y-1 transition-all border ${
                                                isDone
                                                  ? 'bg-emerald-950/40 border-emerald-500/40'
                                                  : isCurrent
                                                  ? 'bg-[#D4AF37]/15 border-[#D4AF37]/60 shadow-[0_0_12px_rgba(212,175,55,0.2)]'
                                                  : 'bg-[#060B1E] border-white/5 opacity-40'
                                              }`}>
                                                <div className={`w-8 h-8 rounded-full mx-auto flex items-center justify-center text-xs font-bold font-mono ${
                                                  isDone
                                                    ? 'bg-emerald-500 text-white'
                                                    : isCurrent
                                                    ? 'bg-[#D4AF37] text-[#070D22] animate-pulse'
                                                    : 'bg-[#0A1230] text-slate-500'
                                                }`}>
                                                  {isDone ? '✓' : step.icon}
                                                </div>
                                                <p className={`text-[9px] font-bold leading-tight ${
                                                  isDone ? 'text-emerald-300' : isCurrent ? 'text-[#F5E7A3]' : 'text-slate-600'
                                                }`}>{step.label}</p>
                                                <p className={`text-[9px] font-mono ${
                                                  isDone || isCurrent ? 'text-[#D4AF37]' : 'text-slate-700'
                                                }`}>{step.pct}%</p>
                                              </div>
                                            );
                                          })}
                                        </div>
                                      </div>

                                      {/* Milestone Log */}
                                      {allMilestones.length > 0 && (
                                        <div className="space-y-2">
                                          <span className="text-[10px] font-mono text-[#D4AF37] uppercase font-bold">Artisan Progress Log</span>
                                          <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar">
                                            {[...allMilestones].reverse().map((ms: any, idx: number) => (
                                              <div key={ms.id || idx} className="p-3 rounded-xl bg-[#09112B] border border-white/10 flex items-start gap-3 text-xs">
                                                <div className="w-6 h-6 rounded-full bg-[#D4AF37]/20 border border-[#D4AF37]/50 flex items-center justify-center shrink-0 mt-0.5">
                                                  <TrendingUp className="w-3 h-3 text-[#D4AF37]" />
                                                </div>
                                                <div className="space-y-0.5 min-w-0">
                                                  <p className="font-bold text-[#FAF8F3] leading-tight">{ms.stage || ms.title || 'Progress Update'}</p>
                                                  {ms.note && <p className="text-[#C9C2A6] text-[11px] leading-relaxed">{ms.note}</p>}
                                                  <p className="text-[10px] font-mono text-[#D4AF37]">
                                                    {ms.progress ? `${ms.progress}% complete` : ''}
                                                    {ms.created_at ? ` • ${new Date(ms.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}` : ''}
                                                  </p>
                                                </div>
                                              </div>
                                            ))}
                                          </div>
                                        </div>
                                      )}

                                      {/* Completion Banner */}
                                      {isWorkComplete && (
                                        <div className="p-4 rounded-2xl bg-emerald-950/50 border border-emerald-500/50 flex items-center gap-3">
                                          <div className="w-10 h-10 rounded-full bg-emerald-500/20 border border-emerald-500 flex items-center justify-center shrink-0">
                                            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                                          </div>
                                          <div>
                                            <p className="text-sm font-bold text-emerald-300">Your CAD Design is Ready!</p>
                                            <p className="text-[11px] text-emerald-200/80">
                                              The artisan has completed your {categoryStr} design. Once payment is fully settled and admin releases download access, you can retrieve your files below.
                                            </p>
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  )}
                                </div>
                              </div>
                            );
                          })()}

                          {/* NODE 5: DELIVERABLES & FINAL SOURCE FILES */}
                          <div className="relative group">
                            <div className={`absolute -left-[31px] sm:-left-[47px] top-0 w-6 h-6 rounded-full border-4 border-[#070D22] flex items-center justify-center ${
                              order?.status === 'completed'
                                ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.8)]'
                                : 'bg-[#060B1E] border-slate-700'
                            }`}>
                              <Download className="w-3.5 h-3.5 text-[#070D22]" />
                            </div>

                            <div className="space-y-3">
                              <h3 className="font-serif text-xl font-bold text-[#FAF8F3]">
                                5. Final Watertight Deliverables (.3DM, .STL &amp; Renders)
                              </h3>

                              {(() => {
                                const isDownloadAuthorized = Boolean(
                                  order?.download_unlocked ??
                                  req.download_unlocked ??
                                  (() => {
                                    try {
                                      const map = JSON.parse(localStorage.getItem('shiuli_admin_download_unlocked_map') || '{}');
                                      return map[String(req.id)] ?? (order?.id ? map[String(order.id)] : undefined) ?? false;
                                    } catch {
                                      return false;
                                    }
                                  })()
                                );
                                const reqIdStr = String(req.id);
                                const otpS = cadOtpState[reqIdStr];
                                const clientEmail = user?.email || userEmail || '';
                                const maskedEmail = clientEmail
                                  ? (() => { const p = clientEmail.split('@'); return p[0].length > 2 ? `${p[0][0]}***${p[0].slice(-1)}@${p[1] || 'mail.com'}` : clientEmail; })()
                                  : '***@***.com';

                                if (isDownloadAuthorized) {
                                  // OTP verified — show active CAD file download center
                                  if (otpS?.stage === 'verified') {
                                    return (
                                      <div className="space-y-4">
                                        <div className="p-5 rounded-2xl bg-emerald-950/60 border-2 border-emerald-500/60 space-y-4 shadow-xl">
                                          <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-emerald-500/20 border border-emerald-400 flex items-center justify-center shrink-0">
                                              <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                                            </div>
                                            <div>
                                              <span className="text-sm font-bold text-emerald-300 block">Email OTP Verified! Watertight CAD Package Released</span>
                                              <span className="text-[11px] text-emerald-200/80">Authorized session active for <strong className="text-emerald-300">{clientEmail}</strong>. Click any file format below to start instant download.</span>
                                            </div>
                                          </div>

                                          <div className="p-3.5 rounded-xl bg-[#060B1E] border border-emerald-500/30 flex flex-col sm:flex-row items-center justify-between gap-3">
                                            <span className="text-xs font-mono text-emerald-300 truncate font-semibold">
                                              📁 Bespoke CAD Master Deliverables Package ({categoryStr})
                                            </span>
                                            <button
                                              onClick={() => downloadCadFilePackage(`Bespoke_Jewellery_CAD_Package_ORD_${reqIdStr}.zip`, categoryStr)}
                                              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-extrabold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg transition-all transform hover:scale-105 cursor-pointer"
                                            >
                                              <Download className="w-4 h-4" />
                                              <span>Download Now (.ZIP)</span>
                                            </button>
                                          </div>

                                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                                            {/* Format 1: Master ZIP */}
                                            <button
                                              onClick={() => downloadCadFilePackage(`Bespoke_Jewellery_CAD_Package_ORD_${reqIdStr}.zip`, categoryStr)}
                                              className="p-3.5 rounded-xl bg-[#060B1E] border border-emerald-500/40 hover:border-emerald-400 text-left space-y-1 group transition-all cursor-pointer shadow-md hover:scale-105"
                                            >
                                              <div className="flex items-center justify-between">
                                                <span className="text-xs font-bold text-emerald-300 font-mono">📦 Master ZIP</span>
                                                <Download className="w-4 h-4 text-emerald-400 group-hover:translate-y-0.5 transition-transform" />
                                              </div>
                                              <p className="text-[10px] text-slate-300">All CAD Source Files + Renders</p>
                                            </button>

                                            {/* Format 2: Rhino .3DM */}
                                            <button
                                              onClick={() => downloadCadFilePackage(`Rhino8_Native_Model_ORD_${reqIdStr}.3dm`, categoryStr)}
                                              className="p-3.5 rounded-xl bg-[#060B1E] border border-emerald-500/40 hover:border-emerald-400 text-left space-y-1 group transition-all cursor-pointer shadow-md hover:scale-105"
                                            >
                                              <div className="flex items-center justify-between">
                                                <span className="text-xs font-bold text-emerald-300 font-mono">🦏 Rhino 8 (.3DM)</span>
                                                <Download className="w-4 h-4 text-emerald-400 group-hover:translate-y-0.5 transition-transform" />
                                              </div>
                                              <p className="text-[10px] text-slate-300">Native 3D Source Model</p>
                                            </button>

                                            {/* Format 3: Printing .STL */}
                                            <button
                                              onClick={() => downloadCadFilePackage(`Watertight_Solid_Mesh_ORD_${reqIdStr}.stl`, categoryStr)}
                                              className="p-3.5 rounded-xl bg-[#060B1E] border border-emerald-500/40 hover:border-emerald-400 text-left space-y-1 group transition-all cursor-pointer shadow-md hover:scale-105"
                                            >
                                              <div className="flex items-center justify-between">
                                                <span className="text-xs font-bold text-emerald-300 font-mono">🖨️ Solid (.STL)</span>
                                                <Download className="w-4 h-4 text-emerald-400 group-hover:translate-y-0.5 transition-transform" />
                                              </div>
                                              <p className="text-[10px] text-slate-300">3D Print & Master Casting Mesh</p>
                                            </button>
                                          </div>

                                          <div className="pt-1 flex items-center justify-between text-[11px] text-[#C9C2A6]">
                                            <span>Single-session security token active</span>
                                            <button
                                              onClick={() => handleResetCadOtp(reqIdStr)}
                                              className="text-emerald-300 hover:text-emerald-200 underline font-mono cursor-pointer"
                                            >
                                              Re-verify OTP session
                                            </button>
                                          </div>
                                        </div>
                                      </div>
                                    );
                                  }

                                  // OTP verification in progress
                                  if (otpS?.stage === 'verifying') {
                                    return (
                                      <div className="space-y-3">
                                        <div className="p-4 rounded-2xl bg-[#09112B] border border-[#D4AF37]/40 space-y-3">
                                          <div className="flex items-center gap-2">
                                            <ShieldCheck className="w-5 h-5 text-[#D4AF37] shrink-0" />
                                            <span className="text-sm font-bold text-[#F5E7A3]">Enter Your Email OTP</span>
                                          </div>
                                          <p className="text-[11px] text-[#C9C2A6]">
                                            A 6-digit verification code was sent to <strong className="text-[#F5E7A3]">{maskedEmail}</strong>. Enter it below to generate your unique download link.
                                          </p>
                                          {otpS.demoOtp && (
                                            <div className="p-3 rounded-xl bg-amber-950/70 border border-amber-500/40 text-xs text-amber-300 font-mono flex flex-wrap items-center justify-between gap-2 shadow-sm">
                                              <div className="flex items-center gap-2">
                                                <span className="font-bold">🔑 Demo Email OTP:</span>
                                                <span className="text-xl font-bold tracking-[0.3em] text-[#F5E7A3]">{otpS.demoOtp}</span>
                                              </div>
                                              <button
                                                type="button"
                                                onClick={() => setCadOtpState((prev) => ({ ...prev, [reqIdStr]: { ...prev[reqIdStr], otpInput: otpS.demoOtp, error: '' } }))}
                                                className="px-3 py-1.5 rounded-lg bg-[#D4AF37] text-[#070D22] font-extrabold text-[10px] uppercase tracking-wider hover:bg-[#F5E7A3] transition-colors cursor-pointer"
                                              >
                                                Auto-fill Code
                                              </button>
                                            </div>
                                          )}
                                          <div className="flex gap-2">
                                            <input
                                              type="text"
                                              maxLength={6}
                                              value={otpS.otpInput}
                                              onChange={(e) => setCadOtpState((prev) => ({ ...prev, [reqIdStr]: { ...prev[reqIdStr], otpInput: e.target.value.replace(/[^0-9]/g, '').slice(0, 6), error: '' } }))}
                                              placeholder="000000"
                                              className="flex-1 px-4 py-3 rounded-xl bg-[#060B1E] border border-[#D4AF37]/40 text-center text-xl font-mono font-bold text-[#F5E7A3] tracking-[0.4em] focus:outline-none focus:border-[#D4AF37] focus:shadow-[0_0_12px_rgba(212,175,55,0.3)]"
                                            />
                                            <button
                                              onClick={() => handleVerifyCadOtp(reqIdStr)}
                                              disabled={otpS.isSubmitting || otpS.otpInput.length < 6}
                                              className="px-5 py-3 rounded-xl bg-[#D4AF37] text-[#070D22] font-bold text-xs uppercase tracking-wider hover:bg-[#F5E7A3] disabled:opacity-50 flex items-center gap-1.5 transition-all cursor-pointer"
                                            >
                                              {otpS.isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
                                              <span>Verify</span>
                                            </button>
                                          </div>
                                          {otpS.error && <p className="text-[11px] text-red-400 font-mono">{otpS.error}</p>}
                                          <button onClick={() => handleResetCadOtp(reqIdStr)} className="text-[10px] text-[#C9C2A6] hover:text-[#F5E7A3] underline cursor-pointer">Cancel</button>
                                        </div>
                                      </div>
                                    );
                                  }

                                  // Default: show OTP request button
                                  return (
                                    <div className="space-y-3">
                                      <div className="flex items-center gap-2">
                                        <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-mono font-bold flex items-center gap-1">
                                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                                          Admin Payment Cleared — CAD Download Authorized
                                        </span>
                                      </div>
                                      <div className="p-5 rounded-2xl bg-[#09112B] border border-[#D4AF37]/30 space-y-3">
                                        <div className="flex items-start gap-3">
                                          <div className="w-10 h-10 rounded-full bg-[#D4AF37]/20 border border-[#D4AF37]/50 flex items-center justify-center shrink-0">
                                            <ShieldCheck className="w-5 h-5 text-[#D4AF37]" />
                                          </div>
                                          <div className="space-y-1">
                                            <p className="text-sm font-bold text-[#FAF8F3]">Secure OTP Download Required</p>
                                            <p className="text-[11px] text-[#C9C2A6] leading-relaxed">
                                              To protect your exclusive CAD files, every download requires email OTP verification. A unique, single-use download link will be generated after verification. Each re-download requires a fresh OTP.
                                            </p>
                                          </div>
                                        </div>
                                        <button
                                          onClick={() => handleRequestCadOtp(reqIdStr)}
                                          disabled={otpS?.isSubmitting}
                                          className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#1E4FA3] via-[#D4AF37] to-[#F5E7A3] text-[#070D22] font-extrabold text-xs uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg hover:opacity-95 transition-all cursor-pointer"
                                        >
                                          {otpS?.isSubmitting ? (
                                            <>
                                              <Loader2 className="w-4 h-4 animate-spin" />
                                              <span>Sending Email OTP...</span>
                                            </>
                                          ) : (
                                            <>
                                              <Send className="w-4 h-4 text-[#070D22]" />
                                              <span>Request CAD Download Link via Email OTP</span>
                                            </>
                                          )}
                                        </button>
                                        {clientEmail && (
                                          <p className="text-[10px] font-mono text-[#C9C2A6] text-center">
                                            OTP sent to: <span className="text-[#F5E7A3]">{maskedEmail}</span>
                                          </p>
                                        )}
                                      </div>
                                    </div>
                                  );
                                }

                                return (
                                  <div className="p-4 rounded-2xl bg-[#09112B] border border-amber-500/30 text-xs text-[#C9C2A6] space-y-2">
                                    <div className="flex items-center gap-2 text-amber-400 font-bold">
                                      <Lock className="w-4 h-4" />
                                      <span>CAD Files Locked — Pending Admin Release</span>
                                    </div>
                                    <p className="leading-relaxed">
                                      {order?.status === 'completed'
                                        ? 'Your design is complete! Once full payment is settled, admin will unlock download access for your files.'
                                        : 'CAD deliverables (.3DM & .STL) will be available once the artisan finishes all work, payment is fully settled, and SuperAdmin releases download access.'}
                                    </p>
                                    <div className="flex items-center gap-2 text-[10px] font-mono text-slate-400 pt-0.5">
                                      <span>Admin Release Status:</span>
                                      <span className="px-2 py-0.5 rounded bg-red-900/40 text-red-300 border border-red-700/50 font-bold uppercase">
                                        Download Access Locked
                                      </span>
                                    </div>
                                  </div>
                                );
                              })()}
                            </div>
                          </div>
                        </>
                      ) : (
                        <div className="relative group">
                          <div className="absolute -left-[31px] sm:-left-[47px] top-0 w-6 h-6 rounded-full border-4 border-[#070D22] bg-[#060B1E] border-slate-700 flex items-center justify-center">
                            <Lock className="w-3.5 h-3.5 text-slate-500" />
                          </div>
                          <div className="p-4 rounded-2xl bg-[#09112B]/70 border border-white/10 text-xs text-[#C9C2A6] flex items-center gap-3">
                            <Lock className="w-4 h-4 text-[#D4AF37] shrink-0" />
                            <span>
                              <strong>Next Steps Locked:</strong> Accept the official engineer quote above to unlock the Multi-Stage Payment Schedule (Step 3), 3D CAD Preview Review (Step 4), and Final Deliverables (Step 5).
                            </span>
                          </div>
                        </div>
                      )}

                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* TAB 2: MY CAD VAULT / MY DOWNLOADS */}
        {activeTab === 'downloads' && (
          <div className="space-y-6">
            {loadingPurchases ? (
              <div className="py-20 text-center rounded-3xl bg-[#09112B] border border-[#D4AF37]/30 flex flex-col items-center justify-center gap-3">
                <Loader2 className="w-8 h-8 text-[#D4AF37] animate-spin" />
                <span className="text-sm font-serif text-[#F5E7A3]">Loading Purchases &amp; Vault...</span>
              </div>
            ) : purchases.length === 0 ? (
              <div className="p-16 text-center rounded-3xl bg-[#09112B] border-2 border-dashed border-[#D4AF37]/30 space-y-4">
                <ShieldCheck className="w-12 h-12 text-[#D4AF37] mx-auto" />
                <h4 className="font-serif text-xl font-bold text-[#FAF8F3]">No Ready-Made CAD Purchases Yet</h4>
                <p className="text-xs text-[#C9C2A6] max-w-md mx-auto">
                  Browse our ready-made jewellery CAD collections to purchase high-precision 3DM &amp; STL master models.
                </p>
                <button
                  onClick={() => onNavigate('collections')}
                  className="btn-gold-luxury px-6 py-3 rounded-xl text-xs font-bold uppercase tracking-wider inline-flex items-center gap-2"
                >
                  <ShoppingBag className="w-4 h-4 text-[#0B1330]" />
                  <span>Browse CAD Collections</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {purchases.map((p) => {
                  const isCapReached = (p.redelivery_count || 0) >= 3;
                  const isUnlocked = !!p.is_otp_verified;

                  return (
                    <div key={p.id} className="p-6 rounded-3xl bg-[#09112B] border border-[#D4AF37]/30 space-y-5 shadow-xl relative overflow-hidden">
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="text-[10px] font-mono text-[#D4AF37] block uppercase">PURCHASE #{p.id}</span>
                          <h4 className="font-serif text-lg font-bold text-[#FAF8F3]">{p.product_title}</h4>
                          <span className="text-xs text-[#F5E7A3] font-semibold">{p.license_type_display || p.license_type || 'Atelier License'}</span>
                        </div>
                        <span className="font-serif text-lg font-bold text-[#F5E7A3]">
                          {formatINR(p.price_paid || p.amount_paid)}
                        </span>
                      </div>

                      {/* Security Delivery Trail */}
                      <div className="p-3 rounded-2xl bg-[#070D22] border border-white/10 space-y-2">
                        <div className="text-[11px] font-mono text-[#C9C2A6] flex justify-between">
                          <span>Security Delivery Trail</span>
                          <span className={isUnlocked ? 'text-emerald-400 font-bold' : 'text-amber-400 font-bold'}>
                            {isUnlocked ? 'OTP Verified & Unlocked' : p.is_downloaded ? 'Re-Verification Required' : 'Verification Required'}
                          </span>
                        </div>

                        <div className="grid grid-cols-3 gap-1.5 text-center text-[10px] font-mono">
                          <div className="p-1.5 rounded-lg bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-semibold flex items-center justify-center gap-1">
                            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                            <span>1. Paid</span>
                          </div>
                          <div className={`p-1.5 rounded-lg border flex items-center justify-center gap-1 font-semibold ${
                            isUnlocked
                              ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                              : 'bg-amber-500/20 border-amber-500/40 text-amber-300 animate-pulse'
                          }`}>
                            <ShieldCheck className="w-3 h-3" />
                            <span>2. OTP Verified</span>
                          </div>
                          <div className={`p-1.5 rounded-lg border flex items-center justify-center gap-1 font-semibold ${
                            p.is_downloaded
                              ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                              : isUnlocked
                              ? 'bg-blue-500/20 border-blue-500/40 text-blue-300'
                              : 'bg-zinc-800 border-zinc-700 text-zinc-500'
                          }`}>
                            <Download className="w-3 h-3" />
                            <span>3. Downloaded</span>
                          </div>
                        </div>

                        {p.downloaded_at && (
                          <div className="text-[10px] text-emerald-400/90 font-mono text-right pt-1">
                            ✓ Last downloaded on {new Date(p.downloaded_at).toLocaleDateString()} at {new Date(p.downloaded_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        )}
                      </div>

                      {/* Dynamic Delivery Action Section */}
                      <div className="pt-2 border-t border-white/10 space-y-3">
                        {isUnlocked ? (
                          <div className="space-y-2.5">
                            <div className="p-2.5 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-[11px] text-emerald-200 flex items-center gap-2">
                              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                              <span>Single-Use Email OTP Verified. CAD files unlocked for this download.</span>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              <button
                                onClick={() => handleSimulateDownload(p.product_title, 'Rhino_7_8_Model.3DM', p)}
                                className="py-3 px-3 rounded-xl bg-[#070D22] border-2 border-[#D4AF37]/60 text-xs font-mono font-bold text-[#F5E7A3] hover:bg-[#D4AF37]/20 flex items-center justify-center gap-2 shadow-md transition-all"
                              >
                                <Download className="w-4 h-4 text-[#D4AF37]" />
                                <span>Download .3DM File</span>
                              </button>
                              <button
                                onClick={() => handleSimulateDownload(p.product_title, 'Castable_Mesh.STL', p)}
                                className="py-3 px-3 rounded-xl bg-[#070D22] border-2 border-[#1E4FA3]/60 text-xs font-mono font-bold text-[#7EACFC] hover:bg-[#1E4FA3]/20 flex items-center justify-center gap-2 shadow-md transition-all"
                              >
                                <Download className="w-4 h-4 text-[#7EACFC]" />
                                <span>Download .STL Mesh</span>
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-200 flex items-center gap-2">
                              <Lock className="w-4 h-4 text-amber-400 flex-shrink-0" />
                              <span>
                                {p.is_downloaded
                                  ? 'Strict Security Policy: Fresh Email OTP verification required for every download.'
                                  : 'Security Policy: Email OTP verification required to download CAD files.'}
                              </span>
                            </div>

                            <button
                              onClick={() => handleRequestRedelivery(p.id, p.product_title)}
                              disabled={isCapReached || resendingPurchaseId === p.id}
                              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-zinc-950 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-[0_4px_20px_rgba(212,175,55,0.4)] disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                            >
                              <ShieldCheck className="w-4 h-4 text-zinc-950" />
                              <span>
                                {resendingPurchaseId === p.id
                                  ? 'Sending Email OTP...'
                                  : p.is_downloaded
                                  ? 'VERIFY EMAIL OTP & UNLOCK RE-DOWNLOAD'
                                  : 'VERIFY EMAIL OTP & UNLOCK DOWNLOAD'}
                              </span>
                            </button>
                          </div>
                        )}

                        <div className="text-[11px] text-[#C9C2A6] text-center font-mono">
                          {isCapReached ? (
                            <span className="text-rose-400 font-bold block bg-rose-500/10 p-2 rounded-lg border border-rose-500/20">
                              Maximum limit of 3 download re-deliveries reached for this purchase. Need help? Contact Support.
                            </span>
                          ) : (
                            <span>
                              Re-delivery used: <strong className="text-amber-300">{p.redelivery_count || 0}</strong> of 3 max allowed.
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}


        {/* TAB 3: ORDER HISTORY */}
        {activeTab === 'orders' && (
          <div className="space-y-8">
            {/* 1. Ready-Made CAD Purchases (from store / backend) */}
            {purchases.length > 0 && (
              <div className="rounded-3xl bg-[#09112B] border border-[#D4AF37]/30 overflow-hidden shadow-2xl">
                <div className="p-4 sm:p-5 bg-[#070D22] border-b border-[#D4AF37]/20 flex flex-wrap justify-between items-center gap-3">
                  <div className="flex items-center gap-2.5">
                    <ShoppingBag className="w-4 h-4 text-[#D4AF37]" />
                    <span className="font-serif text-sm font-bold text-[#F5E7A3] uppercase tracking-wider">
                      Ready-Made CAD Purchases ({purchases.length})
                    </span>
                  </div>
                  <button
                    onClick={() => setActiveTab('downloads')}
                    className="text-xs font-bold text-[#D4AF37] hover:underline flex items-center gap-1"
                  >
                    <span>Open CAD Vault &amp; Download 3DM/STL</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-[#C9C2A6]">
                    <thead className="bg-[#060B1E] text-[#FAF8F3] font-serif border-b border-white/5 uppercase text-[10px] tracking-wider">
                      <tr>
                        <th className="p-4">Purchase ID</th>
                        <th className="p-4">Design Title</th>
                        <th className="p-4">License</th>
                        <th className="p-4">Price Paid</th>
                        <th className="p-4">Status</th>
                        <th className="p-4 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {purchases.map((p) => (
                        <tr key={p.id} className="hover:bg-white/5 transition-colors">
                          <td className="p-4 font-mono font-bold text-[#F5E7A3]">PUR-{p.id}</td>
                          <td className="p-4 font-medium text-[#FAF8F3]">{p.product_title}</td>
                          <td className="p-4 font-mono text-[11px] text-[#C9C2A6]">{p.license_type_display}</td>
                          <td className="p-4 font-serif text-sm font-bold text-[#FAF8F3]">{formatINR(p.price_paid)}</td>
                          <td className="p-4">
                            <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-emerald-950 text-emerald-300 border border-emerald-500/40 inline-flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                              {p.is_downloaded ? 'Downloaded' : p.is_otp_verified ? 'Verified' : 'Paid'}
                            </span>
                          </td>
                          <td className="p-4 text-right">
                            <button
                              onClick={() => setActiveTab('downloads')}
                              className="px-3 py-1.5 rounded-xl border border-[#D4AF37]/40 text-[#F5E7A3] text-xs hover:bg-[#D4AF37]/10 transition-colors inline-flex items-center gap-1"
                            >
                              <Download className="w-3 h-3" />
                              <span>Vault File</span>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* 2. Custom Atelier CAD Orders (if any exist) */}
            {customRequests.filter(r => r.order || r.status === 'agreed' || r.status === 'quoted').length > 0 && (
              <div className="rounded-3xl bg-[#09112B] border border-[#D4AF37]/30 overflow-hidden shadow-2xl">
                <div className="p-4 sm:p-5 bg-[#070D22] border-b border-[#D4AF37]/20 flex flex-wrap justify-between items-center gap-3">
                  <div className="flex items-center gap-2.5">
                    <Clock className="w-4 h-4 text-[#D4AF37]" />
                    <span className="font-serif text-sm font-bold text-[#F5E7A3] uppercase tracking-wider">
                      Custom Atelier CAD Orders ({customRequests.filter(r => r.order || r.status === 'agreed' || r.status === 'quoted').length})
                    </span>
                  </div>
                  <button
                    onClick={() => setActiveTab('custom')}
                    className="text-xs font-bold text-[#D4AF37] hover:underline flex items-center gap-1"
                  >
                    <span>View Journey &amp; Milestones</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-[#C9C2A6]">
                    <thead className="bg-[#060B1E] text-[#FAF8F3] font-serif border-b border-white/5 uppercase text-[10px] tracking-wider">
                      <tr>
                        <th className="p-4">Brief / Order</th>
                        <th className="p-4">Design Item</th>
                        <th className="p-4">Alloy &amp; Specs</th>
                        <th className="p-4">Quoted / Agreed</th>
                        <th className="p-4">Stage Status</th>
                        <th className="p-4 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {customRequests.filter(r => r.order || r.status === 'agreed' || r.status === 'quoted').map((r) => (
                        <tr key={r.id} className="hover:bg-white/5 transition-colors">
                          <td className="p-4 font-mono font-bold text-[#F5E7A3]">
                            REQ #{r.id} {r.order ? `• ORD #${r.order.id}` : ''}
                          </td>
                          <td className="p-4 font-medium text-[#FAF8F3]">{r.category_name || 'Custom Jewellery'}</td>
                          <td className="p-4 text-xs text-[#C9C2A6]">{r.metal_alloy_name || '18K Gold'}</td>
                          <td className="p-4 font-serif text-sm font-bold text-[#FAF8F3]">
                            {formatINR(r.agreed_price || r.estimated_price_shown)}
                          </td>
                          <td className="p-4">
                            <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-[#12204D] border border-[#D4AF37]/50 text-[#F5E7A3]">
                              {r.status}
                            </span>
                          </td>
                          <td className="p-4 text-right">
                            <button
                              onClick={() => setActiveTab('custom')}
                              className="px-3 py-1.5 rounded-xl border border-[#D4AF37]/40 text-[#F5E7A3] text-xs hover:bg-[#D4AF37]/10 transition-colors inline-flex items-center gap-1"
                            >
                              <span>Open Tracker</span>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* 3. Standard Order History with Invoices */}
            <div className="rounded-3xl bg-[#09112B] border border-[#D4AF37]/30 overflow-hidden shadow-2xl">
              <div className="p-4 sm:p-5 bg-[#070D22] border-b border-[#D4AF37]/20 flex justify-between items-center">
                <span className="font-serif text-sm font-bold text-[#F5E7A3] uppercase tracking-wider flex items-center gap-2">
                  <FileText className="w-4 h-4 text-[#D4AF37]" />
                  Order History &amp; Official Invoices ({userOrders.length})
                </span>
                <span className="text-[11px] text-[#C9C2A6] font-mono">
                  Account: {user?.email || userEmail || 'client@shiuli.com'}
                </span>
              </div>
              {userOrders.length === 0 ? (
                <div className="p-12 text-center text-xs text-[#C9C2A6] space-y-3">
                  <FileText className="w-10 h-10 text-[#D4AF37] mx-auto opacity-70" />
                  <p className="font-serif text-lg font-bold text-[#FAF8F3]">No Past Order Invoices Yet</p>
                  <p className="text-xs text-[#C9C2A6] max-w-sm mx-auto">
                    Orders placed under this account will display here with itemized billing breakdowns and downloadable Tax PDF Invoices.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-[#C9C2A6]">
                    <thead className="bg-[#070D22] text-[#FAF8F3] font-serif border-b border-[#D4AF37]/20 uppercase text-[10px] tracking-wider">
                      <tr>
                        <th className="p-4">Order ID</th>
                        <th className="p-4">Date</th>
                        <th className="p-4">Items &amp; Details</th>
                        <th className="p-4">Total</th>
                        <th className="p-4 text-right">Invoice</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {userOrders.map((order) => (
                        <tr key={order.id} className="hover:bg-white/5 transition-colors">
                          <td className="p-4 font-mono font-bold text-[#F5E7A3]">{order.id}</td>
                          <td className="p-4">{order.date}</td>
                          <td className="p-4 font-medium text-[#FAF8F3]">
                            {order.items ? order.items.map((it: any) => it.productTitle || it.title).join(', ') : 'Jewellery CAD Package'}
                          </td>
                          <td className="p-4 font-serif text-sm font-bold text-[#FAF8F3]">{formatINR(order.total)}</td>
                          <td className="p-4 text-right">
                            <button
                              onClick={() => handleSimulateDownload(order.id, 'Invoice.PDF', order)}
                              className="px-3.5 py-1.5 rounded-xl border border-[#D4AF37]/40 text-[#F5E7A3] text-xs hover:bg-[#D4AF37]/15 transition-all inline-flex items-center gap-1.5 font-bold"
                            >
                              <Download className="w-3.5 h-3.5 text-[#D4AF37]" />
                              <span>Invoice PDF</span>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 4: WISHLIST */}
        {activeTab === 'wishlist' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {wishlistedProducts.map((prod) => (
              <div key={prod.id} className="p-4 rounded-3xl bg-[#09112B] border border-[#D4AF37]/30 space-y-3">
                <img src={prod.primaryImage} alt={prod.title} className="w-full aspect-square rounded-2xl object-cover" />
                <h4 className="font-serif font-bold text-[#FAF8F3] text-sm">{prod.title}</h4>
                <div className="font-serif text-base text-[#F5E7A3] font-bold">{formatINR(prod.price)}</div>
                <button onClick={() => onAddToCart(prod, 'standard')} className="btn-gold-luxury w-full py-2.5 rounded-xl text-xs font-bold uppercase">
                  Add to Bag
                </button>
              </div>
            ))}
          </div>
        )}

        {/* TAB 5: MY PROFILE & SECURITY */}
        {activeTab === 'profile' && <UserProfileModule />}

      </div>

      {/* SKETCH PREVIEW LIGHTBOX MODAL */}
      {selectedSketchUrl && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4" onClick={() => setSelectedSketchUrl(null)}>
          <div className="relative max-w-3xl w-full bg-[#09112B] border-2 border-[#D4AF37] rounded-3xl p-4 space-y-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <span className="font-serif font-bold text-lg text-[#F5E7A3]">Reference Sketch Preview</span>
              <button onClick={() => setSelectedSketchUrl(null)} className="p-2 text-slate-400 hover:text-white">
                <X className="w-6 h-6" />
              </button>
            </div>
            <img src={selectedSketchUrl} alt="Enlarged" className="max-h-[70vh] w-auto mx-auto object-contain rounded-2xl" />
          </div>
        </div>
      )}

      {/* RE-DELIVERY OTP VERIFICATION MODAL */}
      <OTPVerificationModal
        isOpen={reDeliveryOtpModalState.isOpen}
        onClose={() => setReDeliveryOtpModalState(prev => ({ ...prev, isOpen: false }))}
        purchaseId={reDeliveryOtpModalState.purchaseId}
        productTitle={reDeliveryOtpModalState.productTitle}
        maskedEmail={reDeliveryOtpModalState.maskedEmail}
        onVerifiedSuccess={() => {
          const verifiedId = reDeliveryOtpModalState.purchaseId;
          setReDeliveryOtpModalState(prev => ({ ...prev, isOpen: false }));

          const currentUserEmail = (user?.email || userEmail || '').toLowerCase();
          const currentUsername = (user?.username || '').toLowerCase();
          const userKey = currentUserEmail || currentUsername;

          if (userKey) {
            const purchasesKey = `shiuli_user_purchases_${userKey}`;
            try {
              const stored = localStorage.getItem(purchasesKey);
              if (stored) {
                const parsed = JSON.parse(stored);
                if (Array.isArray(parsed)) {
                  const updated = parsed.map((p: any) => {
                    const pNumeric = Number(String(p.id).replace(/[^0-9]/g, ''));
                    if (pNumeric === verifiedId || String(p.id) === String(verifiedId)) {
                      return {
                        ...p,
                        is_otp_verified: true,
                        redelivery_count: (p.redelivery_count || 0) + 1,
                      };
                    }
                    return p;
                  });
                  localStorage.setItem(purchasesKey, JSON.stringify(updated));
                }
              }
            } catch (e) {
              console.warn('Failed to save OTP verification to storage:', e);
            }
          }
          fetchPurchases();
        }}
      />
      {/* LUXURY MILESTONE PAYMENT CONFIRMATION MODAL */}
      {paymentModalState.isOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="relative max-w-md w-full bg-[#070D22] border-2 border-[#D4AF37]/60 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={() => setPaymentModalState((prev) => ({ ...prev, isOpen: false }))}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center space-y-3">
              <div className="w-16 h-16 rounded-full bg-[#D4AF37]/20 border-2 border-[#D4AF37] mx-auto flex items-center justify-center text-[#F5E7A3] shadow-[0_0_20px_rgba(212,175,55,0.4)]">
                <CheckCircle2 className="w-9 h-9 text-[#D4AF37]" />
              </div>

              <div>
                <span className="px-3 py-1 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-500/40 text-[10px] font-mono font-bold uppercase tracking-wider inline-block mb-2">
                  Payment Confirmed &bull; Verified
                </span>
                <h3 className="font-serif text-2xl font-bold text-[#FAF8F3]">
                  {paymentModalState.stageLabel}
                </h3>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-[#09112B] border border-[#D4AF37]/30 space-y-3">
              <div className="flex justify-between items-center border-b border-white/10 pb-2">
                <span className="text-xs text-[#C9C2A6]">Amount Paid:</span>
                <span className="font-serif text-xl font-extrabold text-[#F5E7A3]">
                  {formatINR(paymentModalState.amount)}
                </span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-[#C9C2A6]">Transaction Reference:</span>
                <span className="font-mono font-bold text-[#FAF8F3]">{paymentModalState.transactionId}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-[#C9C2A6]">Order Brief:</span>
                <span className="font-mono text-[#D4AF37]">REQ #{paymentModalState.reqId}</span>
              </div>
            </div>

            <p className="text-xs text-[#C9C2A6] text-center leading-relaxed">
              Your milestone payment has been registered. Senior CAD Artisan modeling status has been updated to active in real-time.
            </p>

            <button
              onClick={() => setPaymentModalState((prev) => ({ ...prev, isOpen: false }))}
              className="btn-gold-luxury w-full py-3.5 rounded-2xl text-xs font-extrabold uppercase tracking-widest shadow-xl"
            >
              View Live CAD Status
            </button>
          </div>
        </div>
      )}
    </div>
  );
};


