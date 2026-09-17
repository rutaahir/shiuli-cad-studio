import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { appStore } from '../../services/store';
import {
  MessageSquare,
  CheckCircle2,
  Send,
  User,
  Clock,
  Gem,
  Layers,
  FileText,
  Loader2,
  Sparkles,
  Search,
  RefreshCw,
  Phone,
  Eye,
  X,
  ArrowLeft,
  Zap,
  ShieldCheck,
  Lock
} from 'lucide-react';

interface CustomRequestItem {
  id: number;
  client_name: string;
  client_email?: string;
  contact_email?: string;
  category_name?: string;
  aesthetic_style_name?: string;
  metal_alloy_name?: string;
  metal_swatch_color?: string;
  gold_purity?: string;
  is_metal_only?: boolean;
  ring_size?: string;
  ring_size_standard?: string;
  target_weight_grams?: string | number;
  needed_by_date?: string;
  engraving_text?: string;
  engraving_font?: string;
  engraving_placement?: string;
  has_logo?: boolean;
  custom_specs_text?: string;
  catalog_references_text?: string;
  special_instructions?: string;
  gemstone_preference_open?: boolean;
  estimated_price_shown?: string | number;
  timeline?: string;
  description: string;
  contact_name: string;
  contact_phone: string;
  status: string;
  agreed_price?: string | number;
  created_at: string;
  gemstones?: Array<{ stone_type: string; cut_type?: string; carat_size?: string; quantity: number }>;
  stones?: Array<any>;
  selections?: Array<any>;
  sketches?: Array<{ id: number; image_url: string; image: string; title?: string }>;
  messages?: Array<{ id: number; sender_type: string; message: string; offered_price?: number; created_at: string }>;
  order?: any;
  download_unlocked?: boolean;
  paid_stages?: any[];
  payment_stages?: any[];
  stage1_paid?: boolean;
  stage2_paid?: boolean;
  stage3_paid?: boolean;
}

export const AdminCustomRequestsModule: React.FC = () => {
  const [requests, setRequests] = useState<CustomRequestItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReqId, setSelectedReqId] = useState<number | null>(null);
  const [quoteInput, setQuoteInput] = useState<number | ''>('');
  const [textMessageInput, setTextMessageInput] = useState<string>('');
  const [isSending, setIsSending] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'new' | 'negotiating' | 'agreed'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);
  // Prevent sync events fired by this component from triggering a re-fetch that reverts optimistic state
  const suppressSyncRef = React.useRef(false);
  const [mobileViewDetail, setMobileViewDetail] = useState(false);

  const fetchRequests = async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    try {
      let list: CustomRequestItem[] = [];

      const getOverrideMap = (): Record<string, boolean> => {
        try {
          return JSON.parse(localStorage.getItem('shiuli_admin_download_unlocked_map') || '{}');
        } catch {
          return {};
        }
      };

      const parseTime = (dateStr: any) => {
        if (!dateStr) return Date.now();
        const t = new Date(dateStr).getTime();
        return isNaN(t) || t === 0 ? Date.now() : t;
      };

      const addItemToList = (sr: any) => {
        if (!sr) return;
        const rawId = String(sr.id || sr.ticket_id || '');
        const numId = parseInt(rawId.replace(/[^0-9]/g, '')) || Math.floor(100 + Math.random() * 900);
        if (['req-901', 'req-902', 'req-903', 'req-904'].includes(rawId.toLowerCase())) return;

        // Check persistent override map
        const overrideMap = getOverrideMap();
        const hasOverride = overrideMap[String(numId)] !== undefined
          ? overrideMap[String(numId)]
          : (overrideMap[rawId] !== undefined ? overrideMap[rawId] : (sr.order?.id && overrideMap[String(sr.order.id)] !== undefined ? overrideMap[String(sr.order.id)] : undefined));

        const baseUnlocked = Boolean(sr.download_unlocked ?? sr.order?.download_unlocked ?? false);
        const resolvedUnlocked = hasOverride !== undefined ? Boolean(hasOverride) : baseUnlocked;

        // Extract price from any available property or messages array
        let priceVal = Number(sr.agreed_price || sr.estimated_price_shown || sr.offered_price || sr.price || 0);
        if (!priceVal && sr.messages && Array.isArray(sr.messages)) {
          for (let i = sr.messages.length - 1; i >= 0; i--) {
            if (sr.messages[i].offered_price) {
              priceVal = Number(sr.messages[i].offered_price);
              break;
            }
          }
        }

        const existingIdx = list.findIndex(
          (l) => String(l.id) === String(numId) || String(l.id) === rawId || (sr.ticket_id && String(l.id) === String(sr.ticket_id))
        );

        const safeCreatedAt = sr.created_at || sr.createdAt || new Date().toISOString();

        const reqItem: CustomRequestItem = {
          id: numId,
          client_name: sr.client_name || sr.clientName || sr.contact_name || 'Valued Client',
          contact_name: sr.contact_name || sr.client_name || sr.clientName || 'Valued Client',
          contact_phone: sr.contact_phone || sr.clientPhone || sr.phone || '',
          client_email: sr.client_email || sr.contact_email || '',
          contact_email: sr.contact_email || sr.client_email || '',
          category_name: sr.category_name || sr.jewelleryType || 'Custom Jewellery',
          aesthetic_style_name: sr.aesthetic_style_name || sr.targetBudget || 'Bespoke',
          metal_alloy_name: sr.metal_alloy_name || sr.metalPreference || '18K Yellow Gold',
          metal_swatch_color: sr.metal_swatch_color || '#E5C158',
          gold_purity: sr.gold_purity || '',
          is_metal_only: Boolean(sr.is_metal_only),
          ring_size: sr.ring_size || '',
          ring_size_standard: sr.ring_size_standard || '',
          target_weight_grams: sr.target_weight_grams || '',
          needed_by_date: sr.needed_by_date || '',
          engraving_text: sr.engraving_text || '',
          engraving_font: sr.engraving_font || '',
          engraving_placement: sr.engraving_placement || '',
          has_logo: Boolean(sr.has_logo),
          custom_specs_text: sr.custom_specs_text || '',
          catalog_references_text: sr.catalog_references_text || '',
          special_instructions: sr.special_instructions || '',
          description: sr.description || '',
          status: sr.status || 'new',
          agreed_price: priceVal,
          estimated_price_shown: priceVal,
          created_at: safeCreatedAt,
          gemstones: sr.gemstones || [],
          stones: sr.stones || [],
          selections: sr.selections || [],
          sketches: sr.sketches || [],
          messages: sr.messages || [],
          order: sr.order || null,
          download_unlocked: resolvedUnlocked,
          paid_stages: sr.paid_stages || [],
          payment_stages: sr.payment_stages || [],
          stage1_paid: sr.stage1_paid,
          stage2_paid: sr.stage2_paid,
          stage3_paid: sr.stage3_paid,
        };

        if (existingIdx >= 0) {
          const existing = list[existingIdx];
          const mergedPrice = priceVal || Number(existing.agreed_price || existing.estimated_price_shown || 0);
          const mergedMessages = (reqItem.messages && reqItem.messages.length >= (existing.messages?.length || 0))
            ? reqItem.messages
            : existing.messages;
          const mergedStatus = reqItem.status !== 'new' ? reqItem.status : existing.status;
          const mergedUnlocked = resolvedUnlocked || Boolean(existing.download_unlocked || existing.order?.download_unlocked);

          list[existingIdx] = {
            ...existing,
            ...reqItem,
            download_unlocked: mergedUnlocked,
            order: reqItem.order ? { ...reqItem.order, download_unlocked: mergedUnlocked } : (existing.order ? { ...existing.order, download_unlocked: mergedUnlocked } : null),
            agreed_price: mergedPrice,
            estimated_price_shown: mergedPrice,
            messages: mergedMessages,
            status: mergedStatus,
          };
        } else {
          list.unshift(reqItem);
        }
      };

      // 1. Process backend requests through addItemToList
      try {
        const res = await api.request<any>('/custom-requests/?all=true');
        const ensureArray = <T,>(r: any): T[] => {
          if (Array.isArray(r)) return r;
          if (r && Array.isArray(r.results)) return r.results;
          if (r && Array.isArray(r.data)) return r.data;
          return [];
        };
        const backendItems = ensureArray<any>(res);
        backendItems.forEach((bi: any) => addItemToList(bi));
      } catch (err) {
        console.warn('Backend custom requests fetch fallback:', err);
      }

      // 2. Merge appStore custom requests
      try {
        const storeReqs = appStore.getCustomRequests();
        if (Array.isArray(storeReqs)) {
          storeReqs.forEach((sr: any) => addItemToList(sr));
        }
      } catch (e) {
        console.warn('Failed to merge appStore requests:', e);
      }

      // 2. Scan ALL custom requests stored in localStorage (user-scoped and global store)
      try {
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && (key.startsWith('shiuli_user_custom_requests_') || key === 'shiuli_store_custom_requests' || key.includes('custom_requests') || key.includes('custom_req'))) {
            const raw = localStorage.getItem(key);
            if (raw) {
              try {
                const parsed = JSON.parse(raw);
                if (Array.isArray(parsed)) {
                  parsed.forEach((ur: any) => addItemToList(ur));
                } else if (parsed && typeof parsed === 'object') {
                  addItemToList(parsed);
                }
              } catch (e) {}
            }
          }
        }
      } catch (e) {
        console.warn('Failed to scan localStorage requests:', e);
      }

      // Sort list newest first with safe timestamp parsing
      list.sort((a, b) => {
        const timeA = parseTime(a.created_at);
        const timeB = parseTime(b.created_at);
        if (timeA !== timeB) return timeB - timeA;
        return (Number(b.id) || 0) - (Number(a.id) || 0);
      });

      setRequests(list);
      if (list.length > 0 && (!selectedReqId || !list.some((r) => r.id === selectedReqId))) {
        setSelectedReqId(list[0].id);
      }
    } catch (err) {
      console.warn('Error fetching custom requests:', err);
    } finally {
      if (!isSilent) setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();

    const handleSync = () => {
      // Skip if this component itself just fired the event (prevents optimistic state from being overwritten)
      if (suppressSyncRef.current) return;
      fetchRequests(true);
    };

    window.addEventListener('storage', handleSync);
    window.addEventListener('shiuli_custom_requests_changed', handleSync);

    return () => {
      window.removeEventListener('storage', handleSync);
      window.removeEventListener('shiuli_custom_requests_changed', handleSync);
    };
  }, []);

  const activeReq = requests.find((r) => r.id === selectedReqId) || requests[0];

  // Filtering requests
  const filteredRequests = requests.filter((req) => {
    const matchesTab =
      activeTab === 'all'
        ? true
        : activeTab === 'new'
        ? req.status === 'new'
        : activeTab === 'negotiating'
        ? req.status === 'negotiating' || req.status === 'quoted'
        : req.status === 'agreed' || req.status === 'in_progress';

    const query = searchQuery.toLowerCase();
    const nameMatch = (req.contact_name || req.client_name || '').toLowerCase().includes(query);
    const catMatch = (req.category_name || '').toLowerCase().includes(query);
    const idMatch = `req-${req.id}`.includes(query) || `#${req.id}`.includes(query);

    return matchesTab && (nameMatch || catMatch || idMatch);
  });

  // Executive Stats
  const totalCount = requests.length;
  const newCount = requests.filter((r) => r.status === 'new').length;
  const negotiatingCount = requests.filter((r) => r.status === 'negotiating' || r.status === 'quoted').length;
  const agreedCount = requests.filter((r) => r.status === 'agreed' || r.status === 'in_progress').length;
  const totalAgreedValue = requests
    .filter((r) => r.status === 'agreed' || r.status === 'in_progress')
    .reduce((sum, r) => sum + Number(r.agreed_price || r.estimated_price_shown || 0), 0);

  const handleSendQuote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeReq || (!quoteInput && !textMessageInput)) return;

    setIsSending(true);
    try {
      try {
        await api.ensureAdminToken();
        const updated = await api.request<CustomRequestItem>(`/custom-requests/${activeReq.id}/quote/`, {
          method: 'POST',
          body: JSON.stringify({
            price: quoteInput ? Number(quoteInput) : undefined,
            message: textMessageInput,
          }),
        });
        setRequests((prev) => prev.map((r) => (r.id === activeReq.id ? updated : r)));
      } catch (backendErr) {
        console.warn('Backend quote endpoint fallback:', backendErr);
      }

      // Update local state and sync across localStorage keys
      const newMsg = {
        id: Date.now(),
        sender_type: 'admin',
        message: textMessageInput || `Quoted price: ₹${Number(quoteInput).toLocaleString('en-IN')}`,
        offered_price: quoteInput ? Number(quoteInput) : undefined,
        created_at: new Date().toISOString()
      };

      setRequests((prev) =>
        prev.map((r) => {
          if (r.id === activeReq.id) {
            return {
              ...r,
              status: 'quoted',
              agreed_price: quoteInput ? Number(quoteInput) : r.agreed_price,
              estimated_price_shown: quoteInput ? Number(quoteInput) : r.estimated_price_shown,
              messages: [...(r.messages || []), newMsg]
            };
          }
          return r;
        })
      );

      // Sync into localStorage for client view
      try {
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && (key.startsWith('shiuli_user_custom_requests_') || key === 'shiuli_store_custom_requests' || key.includes('custom_requests'))) {
            const raw = localStorage.getItem(key);
            if (raw) {
              const parsed = JSON.parse(raw);
              if (Array.isArray(parsed)) {
                const updatedParsed = parsed.map((item: any) => {
                  const itemNumId = parseInt(String(item.id || '').replace(/[^0-9]/g, ''));
                  if (itemNumId === activeReq.id || String(item.id) === String(activeReq.id)) {
                    return {
                      ...item,
                      status: 'quoted',
                      agreed_price: quoteInput ? Number(quoteInput) : item.agreed_price,
                      estimated_price_shown: quoteInput ? Number(quoteInput) : item.estimated_price_shown,
                      messages: [...(item.messages || []), newMsg]
                    };
                  }
                  return item;
                });
                localStorage.setItem(key, JSON.stringify(updatedParsed));
              }
            }
          }
        }
      } catch (e) {}

      try {
        createAvailableJobForStaffPool(activeReq, quoteInput ? Number(quoteInput) : undefined);
        window.dispatchEvent(new Event('storage'));
        window.dispatchEvent(new CustomEvent('shiuli_custom_requests_changed'));
      } catch (e) {}

      setQuoteInput('');
      setTextMessageInput('');
    } catch (err: any) {
      alert(err?.message || 'Failed to send quote');
    } finally {
      setIsSending(false);
    }
  };

  const createAvailableJobForStaffPool = (reqItem: any, _price?: number) => {
    const reqIdStr = String(reqItem.id || reqItem.ticket_id || '');
    const jobNumId = `JOB-REQ-${reqIdStr.replace(/[^0-9]/g, '') || reqIdStr}`;

    const clientNameStr = reqItem.contact_name || reqItem.client_name || 'Valued Client';
    const catStr = reqItem.category_name || 'Custom Jewellery';
    const metalStr = reqItem.metal_alloy_name || '18K Yellow Gold';

    let refImg = 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&q=80&w=600';
    if (reqItem.sketches && Array.isArray(reqItem.sketches) && reqItem.sketches.length > 0) {
      refImg = reqItem.sketches[0].image_url || reqItem.sketches[0].image || refImg;
    }

    // STRICT CONFIDENTIALITY: Absolutely no price, payout, or client financial data passed to staff
    const stonesList = (reqItem.stones && reqItem.stones.length > 0) ? reqItem.stones : (reqItem.gemstones || []);
    const ringSizeStr = reqItem.ring_size ? `${reqItem.ring_size_standard?.toUpperCase() || 'IN'} ${reqItem.ring_size}` : undefined;
    const weightStr = reqItem.target_weight_grams ? `${reqItem.target_weight_grams}g` : `Calibrated ${metalStr}`;

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
        diamondCount: stonesList.length || (reqItem.special_instructions?.includes('Row #1') ? 1 : 0),
        ringSize: ringSizeStr,
        dimensions: reqItem.custom_specs_text || 'Bespoke Master Specs',
        weightEst: weightStr,
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

  const handleToggleDownload = async (reqId: number, currentUnlocked: boolean) => {
    setIsSending(true);
    try {
      const targetReq = requests.find(r => r.id === reqId);
      const orderId = targetReq?.order?.id || reqId;
      const newStatus = !currentUnlocked;

      // Optimistically update React state FIRST before anything else
      setRequests(prev => prev.map(r => {
        if (r.id === reqId) {
          return {
            ...r,
            download_unlocked: newStatus,
            order: r.order ? { ...r.order, download_unlocked: newStatus } : { id: orderId, download_unlocked: newStatus }
          };
        }
        return r;
      }));

      // Update persistent override map in localStorage immediately
      try {
        const map = JSON.parse(localStorage.getItem('shiuli_admin_download_unlocked_map') || '{}');
        map[String(reqId)] = newStatus;
        if (orderId) map[String(orderId)] = newStatus;
        localStorage.setItem('shiuli_admin_download_unlocked_map', JSON.stringify(map));
      } catch (e) {}

      // Call backend endpoints (order and custom-request)
      try {
        await api.ensureAdminToken();
        await api.toggleOrderDownload(orderId, newStatus);
      } catch (backendErr) {
        console.warn('Backend toggle download on order fallback:', backendErr);
      }
      try {
        await api.request(`/custom-requests/${reqId}/toggle-download/`, {
          method: 'POST',
          body: JSON.stringify({ unlocked: newStatus }),
        });
      } catch (backendErr) {
        console.warn('Backend toggle download on custom-request fallback:', backendErr);
      }

      // Persist to appStore
      try {
        const storeReqs = appStore.getCustomRequests();
        if (Array.isArray(storeReqs)) {
          const updatedStore = storeReqs.map((sr: any) => {
            const srNumId = parseInt(String(sr.id || '').replace(/[^0-9]/g, ''));
            if (srNumId === reqId || String(sr.id) === String(reqId) || sr.order?.id === orderId) {
              return {
                ...sr,
                download_unlocked: newStatus,
                order: sr.order ? { ...sr.order, download_unlocked: newStatus } : { id: orderId, download_unlocked: newStatus }
              };
            }
            return sr;
          });
          appStore.saveCustomRequests(updatedStore as any);
        }
      } catch (e) {}

      // Persist to localStorage across ALL user & store keys
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (key.startsWith('shiuli_') || key.includes('custom'))) {
          const raw = localStorage.getItem(key);
          if (raw) {
            try {
              const parsed = JSON.parse(raw);
              if (Array.isArray(parsed)) {
                const updated = parsed.map((item: any) => {
                  const itemNumId = parseInt(String(item.id || '').replace(/[^0-9]/g, ''));
                  if (itemNumId === reqId || String(item.id) === String(reqId) || item.order?.id === orderId) {
                    return {
                      ...item,
                      download_unlocked: newStatus,
                      order: item.order ? { ...item.order, download_unlocked: newStatus } : { id: orderId, download_unlocked: newStatus }
                    };
                  }
                  return item;
                });
                localStorage.setItem(key, JSON.stringify(updated));
              } else if (parsed && typeof parsed === 'object') {
                const itemNumId = parseInt(String(parsed.id || '').replace(/[^0-9]/g, ''));
                if (itemNumId === reqId || String(parsed.id) === String(reqId) || parsed.order?.id === orderId) {
                  parsed.download_unlocked = newStatus;
                  if (parsed.order) parsed.order.download_unlocked = newStatus;
                  localStorage.setItem(key, JSON.stringify(parsed));
                }
              }
            } catch (e) {}
          }
        }
      }

      // Suppress the sync handler for 500ms so the re-fetch triggered by the storage event
      // doesn't overwrite our optimistic state with stale data
      suppressSyncRef.current = true;
      window.dispatchEvent(new Event('storage'));
      window.dispatchEvent(new CustomEvent('shiuli_custom_requests_changed'));
      setTimeout(() => { suppressSyncRef.current = false; }, 500);
    } catch (err: any) {
      alert(err?.message || 'Failed to toggle client CAD download permission.');
    } finally {
      setIsSending(false);
    }
  };

  const handleAdminReviewOrder = async (reqId: number, orderId: number, decision: 'approve' | 'reject', notes: string = '') => {
    setIsSending(true);
    try {
      try {
        await api.ensureAdminToken();
        await api.request(`/orders/${orderId}/admin-review/`, {
          method: 'POST',
          body: JSON.stringify({ decision, notes }),
        });
      } catch (backendErr) {
        console.warn('Backend admin-review fallback:', backendErr);
      }

      const nextStatus = decision === 'approve' ? 'completed' : 'in_progress';
      const isQualityApproved = decision === 'approve';

      // Update state
      setRequests(prev => prev.map(r => {
        if (r.id === reqId) {
          return {
            ...r,
            status: decision === 'approve' ? 'completed' : r.status,
            download_unlocked: decision === 'approve' ? true : r.download_unlocked,
            order: r.order ? {
              ...r.order,
              status: nextStatus,
              quality_approved: isQualityApproved,
              download_unlocked: decision === 'approve' ? true : r.order.download_unlocked,
              admin_review_notes: notes
            } : null
          };
        }
        return r;
      }));

      // Update localStorage
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (key.startsWith('shiuli_user_custom_requests_') || key === 'shiuli_store_custom_requests' || key.includes('custom_requests'))) {
          const raw = localStorage.getItem(key);
          if (raw) {
            try {
              const parsed = JSON.parse(raw);
              if (Array.isArray(parsed)) {
                const updated = parsed.map((item: any) => {
                  const itemNumId = parseInt(String(item.id || '').replace(/[^0-9]/g, ''));
                  if (itemNumId === reqId || String(item.id) === String(reqId)) {
                    return {
                      ...item,
                      status: decision === 'approve' ? 'completed' : item.status,
                      download_unlocked: decision === 'approve' ? true : item.download_unlocked,
                      order: item.order ? {
                        ...item.order,
                        status: nextStatus,
                        quality_approved: isQualityApproved,
                        download_unlocked: decision === 'approve' ? true : item.order.download_unlocked,
                        admin_review_notes: notes
                      } : null
                    };
                  }
                  return item;
                });
                localStorage.setItem(key, JSON.stringify(updated));
              }
            } catch (e) {}
          }
        }
      }

      window.dispatchEvent(new Event('storage'));
      window.dispatchEvent(new CustomEvent('shiuli_custom_requests_changed'));
      fetchRequests(true);
    } catch (err: any) {
      alert(err?.message || `Failed to ${decision} order.`);
    } finally {
      setIsSending(false);
    }
  };

  const handleApproveAndReleaseToStaffPool = async (reqId: number, targetPrice?: number) => {
    setIsSending(true);
    try {
      const targetReq = requests.find((r) => r.id === reqId) || activeReq;
      const finalPrice = targetPrice || (quoteInput ? Number(quoteInput) : undefined) || Number(targetReq.estimated_price_shown) || Number(targetReq.agreed_price) || 25000;

      try {
        await api.ensureAdminToken();
        await api.request(`/custom-requests/${reqId}/accept-quote/`, {
          method: 'POST',
          body: JSON.stringify({ price: finalPrice }),
        });
      } catch (backendErr) {
        console.warn('Backend approve fallback:', backendErr);
      }

      // Update React state immediately
      setRequests((prev) =>
        prev.map((r) =>
          r.id === reqId
            ? {
                ...r,
                status: 'agreed',
                agreed_price: finalPrice,
                estimated_price_shown: finalPrice,
                messages: [
                  ...(r.messages || []),
                  {
                    id: Date.now(),
                    sender_type: 'admin',
                    message: `Order approved by SuperAdmin for ₹${finalPrice.toLocaleString('en-IN')} and released to the Senior CAD Artisan Job Pool.`,
                    created_at: new Date().toISOString()
                  }
                ]
              }
            : r
        )
      );

      const updateInStorage = (key: string) => {
        const raw = localStorage.getItem(key);
        if (!raw) return;
        try {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed)) {
            const updated = parsed.map((item: any) => {
              const itemNumId = parseInt(String(item.id || '').replace(/[^0-9]/g, ''));
              if (itemNumId === reqId || String(item.id) === String(reqId)) {
                return {
                  ...item,
                  status: 'agreed',
                  agreed_price: finalPrice,
                  estimated_price_shown: finalPrice,
                  messages: [
                    ...(item.messages || []),
                    {
                      id: Date.now(),
                      sender_type: 'admin',
                      message: `Order approved by SuperAdmin for ₹${finalPrice.toLocaleString('en-IN')} and released to the Senior CAD Artisan Job Pool.`,
                      created_at: new Date().toISOString()
                    }
                  ]
                };
              }
              return item;
            });
            localStorage.setItem(key, JSON.stringify(updated));
          }
        } catch (e) {}
      };

      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (key.startsWith('shiuli_user_custom_requests_') || key === 'shiuli_store_custom_requests' || key.includes('custom_requests'))) {
          updateInStorage(key);
        }
      }

      // Add to Staff Available Job Pool directly!
      createAvailableJobForStaffPool(targetReq, finalPrice);

      // Dispatch real-time events for other open tabs
      window.dispatchEvent(new Event('storage'));
      window.dispatchEvent(new CustomEvent('shiuli_custom_requests_changed'));

      fetchRequests();
    } catch (err: any) {
      alert(err?.message || 'Failed to approve and release to staff pool');
    } finally {
      setIsSending(false);
    }
  };

  const handleAcceptClientOffer = async (reqId: number) => {
    setIsSending(true);
    try {
      const targetReq = requests.find((r) => r.id === reqId) || activeReq;
      let capturedOffer = 0;

      if (targetReq && targetReq.messages && Array.isArray(targetReq.messages)) {
        for (let i = targetReq.messages.length - 1; i >= 0; i--) {
          if (targetReq.messages[i].offered_price) {
            capturedOffer = Number(targetReq.messages[i].offered_price);
            break;
          }
        }
      }
      if (!capturedOffer && targetReq) {
        capturedOffer = Number(targetReq.agreed_price || targetReq.estimated_price_shown || 0);
      }
      if (!capturedOffer) capturedOffer = 25000;

      try {
        await api.ensureAdminToken();
        await api.request(`/custom-requests/${reqId}/accept-quote/`, {
          method: 'POST',
          body: JSON.stringify({ price: capturedOffer, agreed_price: capturedOffer }),
        });
      } catch (err) {
        console.warn('Backend accept-quote fallback:', err);
      }

      // Update React state immediately
      setRequests((prev) =>
        prev.map((r) =>
          r.id === reqId
            ? {
                ...r,
                status: 'agreed',
                agreed_price: capturedOffer,
                estimated_price_shown: capturedOffer,
                messages: [
                  ...(r.messages || []),
                  {
                    id: Date.now(),
                    sender_type: 'admin',
                    message: `Client counter-offer of ₹${capturedOffer.toLocaleString('en-IN')} accepted by SuperAdmin. Status set to AGREED.`,
                    created_at: new Date().toISOString()
                  }
                ]
              }
            : r
        )
      );

      let matchedItem: any = targetReq;

      const updateAcceptanceInStorage = (key: string) => {
        const raw = localStorage.getItem(key);
        if (!raw) return;
        try {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed)) {
            const updated = parsed.map((item: any) => {
              const itemNumId = parseInt(String(item.id || '').replace(/[^0-9]/g, ''));
              if (itemNumId === reqId || String(item.id) === String(reqId)) {
                matchedItem = item;
                return {
                  ...item,
                  status: 'agreed',
                  agreed_price: capturedOffer,
                  estimated_price_shown: capturedOffer,
                  messages: [
                    ...(item.messages || []),
                    {
                      id: Date.now(),
                      sender_type: 'admin',
                      message: `Client counter-offer of ₹${capturedOffer.toLocaleString('en-IN')} accepted by SuperAdmin. Status set to AGREED.`,
                      created_at: new Date().toISOString()
                    }
                  ]
                };
              }
              return item;
            });
            localStorage.setItem(key, JSON.stringify(updated));
          }
        } catch (e) {}
      };

      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (key.startsWith('shiuli_user_custom_requests_') || key === 'shiuli_store_custom_requests' || key.includes('custom_requests'))) {
          updateAcceptanceInStorage(key);
        }
      }

      // Add to Staff Job Pool with strict confidentiality
      if (matchedItem || targetReq) {
        createAvailableJobForStaffPool(matchedItem || targetReq, capturedOffer);
      }

      window.dispatchEvent(new Event('storage'));
      window.dispatchEvent(new CustomEvent('shiuli_custom_requests_changed'));

      fetchRequests();
    } catch (err: any) {
      alert(err?.message || 'Failed to accept client counter offer');
    } finally {
      setIsSending(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'new':
        return {
          label: 'New',
          bg: 'bg-blue-100 text-blue-800 border-blue-200',
          dot: 'bg-blue-500 animate-pulse',
        };
      case 'negotiating':
      case 'quoted':
        return {
          label: 'Negotiating',
          bg: 'bg-amber-100 text-amber-900 border-amber-300',
          dot: 'bg-amber-500',
        };
      case 'agreed':
      case 'in_progress':
        return {
          label: 'Agreed & Accepted',
          bg: 'bg-emerald-100 text-emerald-900 border-emerald-300',
          dot: 'bg-emerald-500',
        };
      default:
        return {
          label: status.toUpperCase(),
          bg: 'bg-slate-100 text-slate-700 border-slate-200',
          dot: 'bg-slate-400',
        };
    }
  };

  return (
    <div className="space-y-4">
      {/* COMPACT SAAS HEADER & TOOLBAR */}
      <div className="bg-white p-3.5 rounded-2xl border border-[#E5E7EF] shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Title + Stats Strip */}
        <div className="flex items-center gap-3 flex-wrap">
          <h1 className="font-serif text-lg font-bold text-[#1E2230] tracking-tight">
            Custom Requests Pipeline
          </h1>

          {/* Quick Metrics Chips */}
          <div className="flex items-center gap-1.5 text-[11px] font-mono">
            <span className="px-2.5 py-0.5 rounded-lg bg-slate-100 text-[#1E2230] font-bold border border-slate-200">
              Total: {totalCount}
            </span>
            <span className="px-2.5 py-0.5 rounded-lg bg-blue-50 text-blue-700 font-bold border border-blue-200">
              New: {newCount}
            </span>
            <span className="px-2.5 py-0.5 rounded-lg bg-amber-50 text-amber-800 font-bold border border-amber-200">
              Active: {negotiatingCount}
            </span>
            <span className="px-2.5 py-0.5 rounded-lg bg-emerald-50 text-emerald-800 font-bold border border-emerald-200">
              Agreed: {agreedCount} (₹{totalAgreedValue.toLocaleString('en-IN')})
            </span>
          </div>
        </div>

        {/* Action controls: Filter tabs + Search + Refresh */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Filter Tabs */}
          <div className="flex items-center bg-slate-100 p-0.5 rounded-xl border border-slate-200 text-[11px] font-bold">
            {(['all', 'new', 'negotiating', 'agreed'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-2.5 py-1 rounded-lg capitalize transition-all cursor-pointer ${
                  activeTab === tab ? 'bg-white text-[#09112B] shadow-xs font-bold' : 'text-[#6B7280] hover:text-[#1E2230]'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-[#9CA3AF] absolute left-2.5 top-2" />
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-36 sm:w-44 pl-7 pr-6 py-1 text-xs rounded-xl bg-slate-50 border border-[#E5E7EF] text-[#1E2230] focus:outline-none focus:border-[#C9A227]"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2 top-1.5 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          <button
            onClick={fetchRequests}
            title="Refresh List"
            className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-[#1E2230] transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-[#C9A227] ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* MAIN WORKSTATION GRID */}
      {loading ? (
        <div className="py-16 bg-white rounded-2xl border border-[#E5E7EF] flex flex-col items-center justify-center gap-2 text-xs text-[#6B7280]">
          <Loader2 className="w-6 h-6 text-[#C9A227] animate-spin" />
          <span className="font-mono">Syncing Pipeline...</span>
        </div>
      ) : filteredRequests.length === 0 ? (
        <div className="p-10 bg-white rounded-2xl border border-[#E5E7EF] text-center space-y-2 text-xs text-[#6B7280]">
          <Sparkles className="w-6 h-6 text-[#C9A227] mx-auto opacity-60" />
          <p className="font-semibold text-[#1E2230]">No Custom Requests</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
          {/* LEFT COLUMN: QUEUE LIST (Compact Fixed Height) */}
          <div
            className={`lg:col-span-4 bg-white rounded-2xl border border-[#E5E7EF] p-3 shadow-sm space-y-2 ${
              mobileViewDetail ? 'hidden lg:block' : 'block'
            }`}
          >
            <div className="text-[10px] font-mono font-bold text-[#6B7280] uppercase tracking-wider flex justify-between items-center px-1 pb-1.5 border-b border-[#E5E7EF]">
              <span>Requests ({filteredRequests.length})</span>
              <span>Select to view</span>
            </div>

            <div className="space-y-1.5 max-h-[580px] overflow-y-auto pr-0.5">
              {filteredRequests.map((req) => {
                const isSelected = req.id === activeReq?.id;
                const statusInfo = getStatusBadge(req.status);
                const hasCounterOffer =
                  req.messages &&
                  req.messages.length > 0 &&
                  req.messages[req.messages.length - 1].sender_type === 'client';

                return (
                  <div
                    key={req.id}
                    onClick={() => {
                      setSelectedReqId(req.id);
                      setMobileViewDetail(true);
                    }}
                    className={`p-3 rounded-xl border transition-all cursor-pointer relative overflow-hidden ${
                      isSelected
                        ? 'bg-[#FFFDF5] text-[#1E2230] border-[#D4AF37] shadow-sm border-l-4 border-l-[#C9A227]'
                        : 'bg-slate-50 hover:bg-white border-[#E5E7EF] hover:border-[#C9A227]/50 text-[#1E2230]'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs mb-1">
                      <div className="flex items-center gap-1.5 font-mono font-bold text-[10px]">
                        <span className="text-[#09112B]">REQ #{req.id}</span>
                        {req.metal_swatch_color && (
                          <div
                            className="w-2.5 h-2.5 rounded-full border border-black/20"
                            style={{ backgroundColor: req.metal_swatch_color }}
                          />
                        )}
                      </div>

                      <span
                        className={`px-2 py-0.5 rounded-md text-[9px] font-mono font-bold uppercase border flex items-center gap-1 ${statusInfo.bg}`}
                      >
                        {statusInfo.label}
                      </span>
                    </div>

                    <div className="font-serif font-bold text-xs truncate">
                      {req.contact_name || req.client_name}
                    </div>

                    <div className="flex items-center justify-between text-[10px] font-mono mt-1 pt-1 border-t border-slate-200/40 opacity-90">
                      <span className="truncate max-w-[130px] text-[#6B7280]">{req.category_name || 'Bespoke Item'}</span>
                      <span className="font-bold text-[#1E2230]">
                        Est: ₹{req.estimated_price_shown ? Number(req.estimated_price_shown).toLocaleString('en-IN') : '--'}
                      </span>
                    </div>

                    {hasCounterOffer && (
                      <span className="mt-1.5 px-2 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-300 font-bold text-[9px] flex items-center gap-1 w-fit">
                        <MessageSquare className="w-2.5 h-2.5" /> Counter Offer Received
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* RIGHT COLUMN: SAAS ACTIVE WORKSPACE (Light & Space-Efficient) */}
          {activeReq && (
            <div
              className={`lg:col-span-8 bg-white rounded-2xl border border-[#E5E7EF] p-4.5 shadow-sm space-y-4 ${
                mobileViewDetail ? 'block' : 'hidden lg:block'
              }`}
            >
              {/* Mobile Back Button */}
              <button
                onClick={() => setMobileViewDetail(false)}
                className="lg:hidden flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 text-[#1E2230] font-bold text-xs mb-2"
              >
                <ArrowLeft className="w-3.5 h-3.5 text-[#C9A227]" /> Back to Queue
              </button>

              {/* 1. COMPACT LIGHT SPEC HEADER BANNER */}
              <div className="p-3.5 rounded-xl bg-gradient-to-r from-amber-50/90 via-white to-amber-50/50 border border-amber-200/80 shadow-xs border-l-4 border-l-[#C9A227] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-[#1E2230]">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-2 py-0.5 rounded bg-[#C9A227] text-white font-mono font-extrabold text-[10px]">
                      REQ #{activeReq.id}
                    </span>
                    <h2 className="font-serif text-base font-bold text-[#1E2230]">
                      {activeReq.category_name || 'Bespoke Request'}
                    </h2>
                    <span className="px-2 py-0.5 rounded bg-amber-100/80 text-amber-950 border border-amber-300 text-[10px] font-mono font-bold flex items-center gap-1">
                      {activeReq.metal_swatch_color && (
                        <span className="w-2 h-2 rounded-full border border-black/20 inline-block" style={{ backgroundColor: activeReq.metal_swatch_color }} />
                      )}
                      {activeReq.metal_alloy_name || '18K Gold'}
                    </span>
                    {activeReq.gold_purity && (
                      <span className="px-2 py-0.5 rounded bg-amber-200 text-amber-950 border border-amber-400 font-mono font-bold text-[10px]">
                        {activeReq.gold_purity} Purity
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 text-[11px] text-[#6B7280] font-mono">
                    <span>Client: <strong className="text-[#1E2230]">{activeReq.contact_name || activeReq.client_name}</strong></span>
                    {activeReq.contact_phone && <span>• Phone: {activeReq.contact_phone}</span>}
                    {(activeReq.contact_email || activeReq.client_email) && <span>• Email: {activeReq.contact_email || activeReq.client_email}</span>}
                  </div>
                </div>

                <div className="flex items-center gap-3 self-end sm:self-auto">
                  <div className="text-right">
                    <span className="text-[9px] uppercase text-[#6B7280] block font-mono">Target Est</span>
                    <span className="font-serif text-base font-bold text-[#1E2230]">
                      ₹{activeReq.estimated_price_shown ? Number(activeReq.estimated_price_shown).toLocaleString('en-IN') : '--'}
                    </span>
                  </div>
                  <span
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold uppercase border ${
                      getStatusBadge(activeReq.status).bg
                    }`}
                  >
                    {getStatusBadge(activeReq.status).label}
                  </span>
                </div>
              </div>

              {/* 2. DENSE 2-COLUMN BRIEF & ARTWORK GRID */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                {/* Gemstones & Dimensional Specs */}
                <div className="bg-slate-50 border border-[#E5E7EF] p-3 rounded-xl space-y-2">
                  <div className="flex items-center gap-1.5 font-bold text-[#1E2230] uppercase text-[10px] tracking-wider border-b border-[#E5E7EF] pb-1">
                    <Gem className="w-3.5 h-3.5 text-[#C9A227]" />
                    <span>Gemstone &amp; Structural Sizing</span>
                  </div>

                  {/* Sizing & Weight Badges */}
                  <div className="flex flex-wrap gap-1.5 pt-0.5">
                    {activeReq.ring_size && (
                      <span className="px-2 py-0.5 rounded bg-white border border-slate-200 text-[10px] font-mono text-slate-800">
                        Size: <strong>{activeReq.ring_size_standard?.toUpperCase() || 'US'} {activeReq.ring_size}</strong>
                      </span>
                    )}
                    {activeReq.target_weight_grams && (
                      <span className="px-2 py-0.5 rounded bg-white border border-slate-200 text-[10px] font-mono text-slate-800">
                        Weight: <strong>{activeReq.target_weight_grams}g</strong>
                      </span>
                    )}
                    {activeReq.engraving_text && (
                      <span className="px-2 py-0.5 rounded bg-amber-50 border border-amber-200 text-[10px] font-mono text-amber-900">
                        Engraving: "{activeReq.engraving_text}" ({activeReq.engraving_font || 'Script'})
                      </span>
                    )}
                    {activeReq.has_logo && (
                      <span className="px-2 py-0.5 rounded bg-purple-50 border border-purple-200 text-[10px] font-mono text-purple-900 font-bold">
                        Vector Hallmark Stamp: Required
                      </span>
                    )}
                  </div>

                  {activeReq.is_metal_only ? (
                    <div className="p-2 rounded-lg bg-slate-100 text-slate-700 text-[11px] border border-slate-200 font-semibold">
                      Solid Metal Design (No Gemstones Configured).
                    </div>
                  ) : activeReq.gemstone_preference_open ? (
                    <div className="p-2 rounded-lg bg-emerald-50 text-emerald-800 text-[11px] border border-emerald-200">
                      ✓ Client specified "Let Modeller Decide" (Open Preference).
                    </div>
                  ) : ((activeReq.stones && activeReq.stones.length > 0) || (activeReq.gemstones && activeReq.gemstones.length > 0)) ? (
                    <div className="space-y-1 max-h-36 overflow-y-auto">
                      {(activeReq.stones && activeReq.stones.length > 0 ? activeReq.stones : activeReq.gemstones).map((g: any, idx: number) => (
                        <div key={idx} className="p-1.5 rounded-lg bg-white border border-[#E5E7EF] flex justify-between items-center text-[11px]">
                          <span className="font-bold text-[#1E2230] flex items-center gap-1">
                            <span>{g.quantity || 1}x {g.stone_type} ({g.cut_type || g.shape || 'Round Brilliant'})</span>
                            {g.is_center_stone && (
                              <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-100 text-amber-900 border border-amber-300 font-bold">Center</span>
                            )}
                          </span>
                          <span className="text-[10px] font-mono text-slate-500">
                            {g.carat_size || (g.size_value ? `${g.size_value} ${g.size_unit || 'ct'}` : 'Calibrated')} {g.clarity ? `• ${g.clarity}` : ''}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-[11px] text-slate-500 italic">No specific gemstone rows required (Solid metal or detailed in brief notes).</p>
                  )}

                  {activeReq.custom_specs_text && (
                    <div className="p-2 rounded-lg bg-white border border-slate-200 text-[11px] text-slate-800 space-y-0.5">
                      <span className="text-[9px] font-bold uppercase text-slate-400 block font-mono">Custom Specs:</span>
                      <p>{activeReq.custom_specs_text}</p>
                    </div>
                  )}
                </div>

                {/* Client Instruction & Reference Sketches */}
                <div className="bg-slate-50 border border-[#E5E7EF] p-3 rounded-xl space-y-2">
                  <div className="flex items-center justify-between border-b border-[#E5E7EF] pb-1 text-[10px] font-bold text-[#1E2230] uppercase tracking-wider">
                    <div className="flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5 text-[#C9A227]" />
                      <span>Master Specification Brief &amp; Artwork</span>
                    </div>
                    {activeReq.sketches && activeReq.sketches.length > 0 && (
                      <span className="text-slate-400 font-mono text-[9px]">{activeReq.sketches.length} Artwork / Ref File(s)</span>
                    )}
                  </div>

                  {/* Written Brief */}
                  <pre className="text-[11px] text-[#1E2230] bg-white p-2.5 rounded-lg border border-[#E5E7EF] max-h-40 overflow-y-auto whitespace-pre-wrap font-sans leading-relaxed">
                    {activeReq.description || 'No specific written notes.'}
                  </pre>

                  {/* Catalog References Text */}
                  {activeReq.catalog_references_text && (
                    <div className="p-2 rounded-lg bg-amber-50/70 border border-amber-200 text-[10px] text-amber-950 font-mono">
                      <strong>Referenced Catalog Items:</strong> {activeReq.catalog_references_text}
                    </div>
                  )}

                  {/* Sketches & Catalog Reference Thumbnails */}
                  {activeReq.sketches && activeReq.sketches.length > 0 && (
                    <div className="flex items-center gap-2 pt-1 overflow-x-auto">
                      {activeReq.sketches.map((sk: any, idx: number) => {
                        const imgUrl = sk.image_url || sk.image;
                        return (
                          <div
                            key={sk.id || idx}
                            onClick={() => setLightboxImage(imgUrl)}
                            className="w-12 h-12 rounded-lg overflow-hidden border border-[#E5E7EF] cursor-pointer shrink-0 hover:border-[#C9A227] relative group"
                            title={sk.title || 'Click to view reference image'}
                          >
                            <img src={imgUrl} alt="Reference" className="w-full h-full object-cover" />
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              {/* 3. LIGHT NEGOTIATION LOG */}
              {activeReq.messages && activeReq.messages.length > 0 && (
                <div className="bg-slate-50 border border-[#E5E7EF] p-3 rounded-xl space-y-2">
                  <div className="flex items-center gap-1.5 text-[10px] font-bold text-[#1E2230] uppercase tracking-wider border-b border-[#E5E7EF] pb-1">
                    <MessageSquare className="w-3.5 h-3.5 text-[#C9A227]" />
                    <span>Negotiation Log</span>
                  </div>

                  <div className="space-y-2 max-h-36 overflow-y-auto pr-1">
                    {activeReq.messages.map((m) => {
                      const isAdmin = m.sender_type === 'admin';
                      return (
                        <div
                          key={m.id}
                          className={`p-2.5 rounded-xl text-[11px] space-y-1 max-w-[88%] ${
                            isAdmin
                              ? 'bg-amber-50/90 text-[#1E2230] border border-amber-200 ml-auto'
                              : 'bg-white text-[#1E2230] border border-[#E5E7EF]'
                          }`}
                        >
                          <div className="flex items-center justify-between text-[9px] text-[#6B7280] font-mono font-bold">
                            <span>{isAdmin ? 'Super Admin' : activeReq.contact_name || 'Client'}</span>
                            <span>{new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                          </div>
                          <p>{m.message}</p>
                          {m.offered_price && (
                            <span
                              className={`inline-block px-2 py-0.5 rounded font-mono font-bold text-[10px] ${
                                isAdmin ? 'bg-[#C9A227] text-white' : 'bg-emerald-100 text-emerald-900'
                              }`}
                            >
                              Offer: ₹{Number(m.offered_price).toLocaleString('en-IN')}
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* 4. COMPACT ACTION DOCK (Send Quote or Accept Offer) */}
              {(() => {
                if (activeReq.status === 'agreed' || activeReq.status === 'in_progress') {
                  return (
                    <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-950 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                        <span className="font-bold">Agreed &amp; Contract Locked</span>
                      </div>
                      <div className="font-mono font-bold text-xs bg-white px-3 py-1 rounded-lg border border-emerald-300">
                        Final Price: ₹{Number(activeReq.agreed_price || activeReq.estimated_price_shown).toLocaleString('en-IN')}
                      </div>
                    </div>
                  );
                }

                const latestClientOfferMsg =
                  activeReq.messages && Array.isArray(activeReq.messages)
                    ? [...activeReq.messages].reverse().find((m) => m.sender_type === 'client' && m.offered_price)
                    : null;
                const isClientOffer = !!latestClientOfferMsg && activeReq.status !== 'agreed';
                const clientOfferPrice = latestClientOfferMsg ? Number(latestClientOfferMsg.offered_price) : 0;

                return (
                  <div className="bg-slate-50 border border-[#E5E7EF] p-3 rounded-xl space-y-2.5">
                    {/* Client Counter Offer Banner */}
                    {isClientOffer && clientOfferPrice > 0 && (
                      <div className="p-2.5 rounded-lg bg-amber-50 border border-amber-300 flex items-center justify-between gap-2 text-xs">
                        <div className="flex items-center gap-1.5 text-amber-950">
                          <MessageSquare className="w-4 h-4 text-amber-700 shrink-0" />
                          <span>Client Counter-Offer: <strong>₹{clientOfferPrice.toLocaleString('en-IN')}</strong></span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleAcceptClientOffer(activeReq.id)}
                          disabled={isSending}
                          className="px-3 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-[11px] font-bold flex items-center gap-1 cursor-pointer transition-colors shadow-sm"
                        >
                          {isSending ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                          <span>Accept Offer (₹{clientOfferPrice.toLocaleString('en-IN')})</span>
                        </button>
                      </div>
                    )}

                    {/* Form */}
                    <form onSubmit={handleSendQuote} className="flex flex-col sm:flex-row items-center gap-2">
                      <div className="relative w-full sm:w-36 shrink-0">
                        <span className="absolute left-2.5 top-2 text-slate-400 text-xs">₹</span>
                        <input
                          type="number"
                          value={quoteInput}
                          onChange={(e) => setQuoteInput(e.target.value ? Number(e.target.value) : '')}
                          placeholder={String(activeReq.estimated_price_shown || 25000)}
                          className="w-full pl-6 pr-2 py-1.5 text-xs rounded-xl bg-white border border-[#E5E7EF] font-mono font-bold text-[#1E2230] focus:outline-none focus:border-[#C9A227]"
                        />
                      </div>

                      <input
                        type="text"
                        value={textMessageInput}
                        onChange={(e) => setTextMessageInput(e.target.value)}
                        placeholder="Add turnaround notes or terms..."
                        className="w-full px-3 py-1.5 text-xs rounded-xl bg-white border border-[#E5E7EF] text-[#1E2230] focus:outline-none focus:border-[#C9A227]"
                      />

                      <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
                        <button
                          type="submit"
                          disabled={isSending}
                          className="btn-gold-luxury px-3.5 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-sm whitespace-nowrap cursor-pointer shrink-0 w-full sm:w-auto justify-center"
                        >
                          {isSending ? (
                            <Loader2 className="w-3.5 h-3.5 text-[#09112B] animate-spin" />
                          ) : (
                            <>
                              <Send className="w-3 h-3 text-[#09112B]" />
                              <span>{isClientOffer ? 'Send Counter' : 'Send Quote'}</span>
                            </>
                          )}
                        </button>

                        <button
                          type="button"
                          onClick={() => handleApproveAndReleaseToStaffPool(activeReq.id)}
                          disabled={isSending}
                          className="px-3.5 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-sm whitespace-nowrap cursor-pointer shrink-0 w-full sm:w-auto justify-center"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                          <span>Approve &amp; Release to Pool</span>
                        </button>
                      </div>
                    </form>
                    </div>
                  );
                })()}

              {/* 5. ADMIN CAD DOWNLOAD DELIVERY & SETTLEMENT CONTROLS */}
              {(activeReq.status === 'agreed' || activeReq.status === 'in_progress' || activeReq.order) && (
                <div className="p-4 rounded-2xl bg-[#09112B] text-white border border-[#D4AF37]/40 shadow-md space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-2">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-5 h-5 text-[#C9A227]" />
                      <div>
                        <h4 className="font-serif font-bold text-sm text-[#FAF8F3]">Client CAD Deliverable Download Release</h4>
                        <p className="text-[10px] text-slate-300">Admin Quality &amp; Payment Gatekeeper</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-mono text-slate-300">Payment Status:</span>
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                        activeReq.stage3_paid || (activeReq.order && activeReq.order.balance_paid)
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                          : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                      }`}>
                        {activeReq.stage3_paid || (activeReq.order && activeReq.order.balance_paid) ? '100% Fully Settled' : 'Payment In Progress'}
                      </span>
                    </div>
                  </div>

                  {/* 5A. STAFF ARTISAN PRODUCTION & DELIVERABLES REVIEW */}
                  {activeReq.order && (
                    <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 space-y-3">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <Layers className="w-4 h-4 text-[#D4AF37]" />
                          <span className="text-xs font-bold text-[#F5E7A3]">
                            Artisan CAD Progress:
                          </span>
                          <span className="font-mono text-xs text-white">
                            {activeReq.order.assigned_staff ? (
                              <span className="text-emerald-300 font-bold">
                                Assigned to {activeReq.order.assigned_staff.first_name || activeReq.order.assigned_staff.username || 'CAD Artisan'}
                              </span>
                            ) : (
                              <span className="text-amber-400">Waiting in Job Pool for Staff Claim</span>
                            )}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] uppercase font-mono text-slate-400">Order Status:</span>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                            activeReq.order.status === 'pending_review'
                              ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40 animate-pulse'
                              : activeReq.order.status === 'preview_ready' || activeReq.order.quality_approved
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                              : 'bg-blue-500/20 text-blue-300 border border-blue-500/40'
                          }`}>
                            {activeReq.order.status === 'pending_review' 
                              ? 'Deliverables Submitted — QC Review Required' 
                              : activeReq.order.quality_approved || activeReq.order.status === 'preview_ready'
                              ? 'Quality Approved & Client Preview Ready'
                              : activeReq.order.status?.replace('_', ' ') || 'In Production'}
                          </span>
                        </div>
                      </div>

                      {/* Deliverables files list */}
                      {activeReq.order.deliverables && activeReq.order.deliverables.length > 0 ? (
                        <div className="space-y-1.5">
                          <span className="text-[11px] font-medium text-slate-300 block">
                            Submitted CAD Deliverables:
                          </span>
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                            {activeReq.order.deliverables.map((deliv: any) => (
                              <div
                                key={deliv.id || deliv.filename}
                                className="p-2 rounded-lg bg-black/40 border border-white/10 flex items-center justify-between text-[11px]"
                              >
                                <div className="truncate mr-2">
                                  <span className="font-bold text-[#F5E7A3] block uppercase text-[9px] font-mono">
                                    {deliv.file_type}
                                  </span>
                                  <span className="text-slate-300 truncate font-mono text-[10px]">
                                    {deliv.filename || `${deliv.file_type.toUpperCase()} file`}
                                  </span>
                                </div>
                                {deliv.file_url ? (
                                  <a
                                    href={deliv.file_url}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="px-2 py-1 bg-white/10 hover:bg-white/20 text-white rounded text-[10px] font-mono font-bold shrink-0 transition-colors"
                                  >
                                    View
                                  </a>
                                ) : (
                                  <span className="text-emerald-400 font-bold text-[10px]">✓ Ready</span>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <div className="text-[11px] text-slate-400 italic">
                          No deliverable files (.3DM, .STL, Renders) uploaded by artisan yet.
                        </div>
                      )}

                      {/* Admin Quality Approval Decision CTA */}
                      {activeReq.order.status === 'pending_review' && (
                        <div className="p-3 rounded-lg bg-purple-950/60 border border-purple-500/40 flex flex-col sm:flex-row items-center justify-between gap-3">
                          <div className="text-xs">
                            <span className="font-bold text-purple-200 block">
                              Artisan has submitted completed CAD files for Quality Check.
                            </span>
                            <span className="text-[11px] text-purple-300">
                              Approve the CAD quality to make the 3D preview visible to the client.
                            </span>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <button
                              type="button"
                              onClick={() => handleAdminReviewOrder(activeReq.id, activeReq.order.id, 'reject', 'Revisions needed')}
                              disabled={isSending}
                              className="px-3 py-1.5 rounded-lg bg-rose-600/80 hover:bg-rose-700 text-white text-xs font-bold transition-colors cursor-pointer"
                            >
                              Request Revision
                            </button>
                            <button
                              type="button"
                              onClick={() => handleAdminReviewOrder(activeReq.id, activeReq.order.id, 'approve', 'Approved by SuperAdmin QC')}
                              disabled={isSending}
                              className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-md transition-colors cursor-pointer"
                            >
                              <CheckCircle2 className="w-4 h-4" />
                              <span>Approve CAD Quality</span>
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white/5 p-3 rounded-xl border border-white/10">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-[#F5E7A3]">Download Authorization:</span>
                        <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-mono font-extrabold uppercase ${
                          activeReq.download_unlocked
                            ? 'bg-emerald-500 text-white shadow-[0_0_8px_rgba(16,185,129,0.5)]'
                            : 'bg-red-500/30 text-red-300 border border-red-500/50'
                        }`}>
                          {activeReq.download_unlocked ? 'UNLOCKED / ACTIVE' : 'LOCKED (Protected)'}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-300">
                        {activeReq.download_unlocked 
                          ? 'Client is permitted to generate their secure 6-digit OTP and download final Rhino 3DM & Solid STL source deliverables.'
                          : 'Download button remains disabled for client until Admin confirms full payment and turns this toggle ON.'}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleToggleDownload(activeReq.id, !!activeReq.download_unlocked)}
                      disabled={isSending}
                      className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer shrink-0 flex items-center gap-2 ${
                        activeReq.download_unlocked
                          ? 'bg-amber-600 hover:bg-amber-700 text-white'
                          : 'btn-gold-luxury shadow-lg hover:scale-105'
                      }`}
                    >
                      {isSending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : activeReq.download_unlocked ? <Lock className="w-3.5 h-3.5" /> : <ShieldCheck className="w-3.5 h-3.5" />}
                      <span>{activeReq.download_unlocked ? 'Lock Download' : 'Unlock Client CAD Download'}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* LIGHTBOX MODAL */}
      {lightboxImage && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-6 animate-fadeIn"
          onClick={() => setLightboxImage(null)}
        >
          <div className="relative max-w-3xl max-h-[80vh] rounded-2xl overflow-hidden border-2 border-[#D4AF37] bg-black">
            <button
              onClick={() => setLightboxImage(null)}
              className="absolute top-3 right-3 p-1.5 rounded-full bg-black/60 text-white hover:bg-black cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
            <img src={lightboxImage} alt="Sketch" className="w-full h-full object-contain" />
          </div>
        </div>
      )}
    </div>
  );
};

