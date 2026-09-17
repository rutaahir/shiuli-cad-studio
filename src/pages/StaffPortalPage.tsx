import React, { useState, useEffect } from 'react';
import {
  PageId,
  StaffPortalTab,
  StaffMember,
  AvailableJob,
  StaffActiveJob,
  StaffSubmission,
  StaffEarningsRecord,
  AdminNotification,
  WaxSealState,
} from '../types';
import { appStore } from '../services/store';
import { api } from '../services/api';

import {
  CURRENT_STAFF_MEMBER,
  INITIAL_AVAILABLE_JOBS,
  INITIAL_STAFF_ACTIVE_JOBS,
  INITIAL_STAFF_SUBMISSIONS,
  INITIAL_STAFF_EARNINGS,
  STAFF_NOTIFICATIONS,
} from '../data/staffMockData';

import { StaffLayout } from '../components/staff/StaffLayout';
import { WaxSealStamp } from '../components/staff/WaxSealStamp';

import { StaffWorkbenchTab } from '../components/staff/StaffWorkbenchTab';
import { StaffJobPoolTab } from '../components/staff/StaffJobPoolTab';
import { StaffMyDesignsTab } from '../components/staff/StaffMyDesignsTab';
import { StaffActiveJobWorkspace } from '../components/staff/StaffActiveJobWorkspace';
import { StaffHistoryTab } from '../components/staff/StaffHistoryTab';
import { StaffEarningsTab } from '../components/staff/StaffEarningsTab';
import { StaffProfileTab } from '../components/staff/StaffProfileTab';
import { StaffNotificationsTab } from '../components/staff/StaffNotificationsTab';

interface StaffPortalPageProps {
  onBackToMain: () => void;
  onNavigate?: (page: PageId, extraId?: string) => void;
  initialTab?: StaffPortalTab;
}

export const StaffPortalPage: React.FC<StaffPortalPageProps> = ({
  onBackToMain,
  onNavigate,
  initialTab,
}) => {
  const [activeTab, setActiveTabState] = useState<StaffPortalTab>(initialTab || 'workbench');
  const [selectedActiveJobId, setSelectedActiveJobId] = useState<string | null>(null);

  // Sync state from URL tab param if initialTab changes
  useEffect(() => {
    if (initialTab && initialTab !== activeTab) {
      setActiveTabState(initialTab);
    }
  }, [initialTab]);

  const handleTabChange = (tab: StaffPortalTab) => {
    setActiveTabState(tab);
    if (onNavigate) {
      onNavigate('staff-portal', tab);
    }
  };

  // Core State from appStore (Persisted!)
  const [staff, setStaff] = useState<StaffMember>(() => {
    const saved = localStorage.getItem('shiuli_user');
    if (saved) {
      try {
        const u = JSON.parse(saved);
        if (u) {
          const fullName = `${u.first_name || ''} ${u.last_name || ''}`.trim() || u.username;
          return {
            id: `STF-${u.id || '102'}`,
            name: fullName || 'Harshil Shah',
            email: u.email || 'shahharshil313@gmail.com',
            phone: u.phone_number || '+91 98201 44829',
            avatar: u.profile_photo || CURRENT_STAFF_MEMBER.avatar,
            role: u.staff_profile?.specialty_tags || 'MatrixGold Specialist',
            status: u.is_active_staff !== false ? 'active' : 'inactive',
            maxJobLimit: u.staff_profile?.max_concurrent_jobs || 3,
            currentLoad: 0,
            jobsCompleted: u.staff_profile?.total_jobs_completed || 0,
            rating: parseFloat(u.staff_profile?.rating_average || '5.0') || 5.0,
            totalEarnings: 0,
            activeJobs: [],
          };
        }
      } catch (e) {
        console.warn('Failed to parse shiuli_user:', e);
      }
    }
    return CURRENT_STAFF_MEMBER;
  });
  const [availableJobs, setAvailableJobs] = useState<AvailableJob[]>([]);
  const [activeJobs, setActiveJobs] = useState<StaffActiveJob[]>(() => {
    try {
      const stored = localStorage.getItem('shiuli_user');
      if (stored) {
        const u = JSON.parse(stored);
        const staffEmail = (u.email || '').toLowerCase().trim();
        const staffName = (u.first_name || u.username || u.name || '').toLowerCase().trim();
        const staffId = String(u.id || '').toLowerCase().trim();
        const allActive = appStore.getActiveJobs();
        return allActive.filter((j: any) => {
          const jobStaff = String(j.assignedStaff || j.staffEmail || j.staff_id || '').toLowerCase();
          return (staffEmail && jobStaff.includes(staffEmail)) || (staffName && jobStaff.includes(staffName)) || (staffId && jobStaff.includes(staffId));
        });
      }
    } catch {}
    return [];
  });
  const [submissions, setSubmissions] = useState<StaffSubmission[]>(() => {
    try {
      const stored = localStorage.getItem('shiuli_user');
      if (stored) {
        const u = JSON.parse(stored);
        const staffEmail = (u.email || '').toLowerCase().trim();
        const staffName = (u.first_name || u.username || u.name || '').toLowerCase().trim();
        const staffId = String(u.id || '').toLowerCase().trim();
        
        const userKey = `shiuli_staff_submissions_${staffId || staffEmail || staffName}`;
        const raw = localStorage.getItem(userKey);
        if (raw) return JSON.parse(raw);

        const allSubs = appStore.getSubmissions();
        return allSubs.filter((s: any) => {
          const subAuthor = String(s.author_email || s.author_name || s.author_id || s.designer || '').toLowerCase();
          return (staffEmail && subAuthor.includes(staffEmail)) || (staffName && subAuthor.includes(staffName));
        });
      }
    } catch {}
    return [];
  });
  const [earnings, setEarnings] = useState<StaffEarningsRecord[]>([]);
  const [notifications, setNotifications] = useState<AdminNotification[]>(STAFF_NOTIFICATIONS);

  // Wax-Seal Animation Overlay state
  const [waxSeal, setWaxSeal] = useState<WaxSealState>({
    active: false,
    title: '',
    subtitle: '',
  });

  const getJobCategory = (req: any): string => {
    if (req?.category_name && typeof req.category_name === 'string') return req.category_name;
    if (req?.category && typeof req.category === 'string') return req.category;
    if (req?.category?.name) return req.category.name;
    if (req?.jewelleryType) return req.jewelleryType;
    if (req?.description) {
      const parts = req.description.split(' - ');
      if (parts[0]) {
        const match = parts[0].match(/^(Rings|Necklaces|Earrings|Bracelets|Pendants|Bangles|Chains|Brooches|Custom Jewellery)/i);
        if (match) return match[1];
      }
    }
    if (req?.special_instructions) {
      const match = req.special_instructions.match(/(Rings|Necklaces|Earrings|Bracelets|Pendants|Bangles|Chains|Brooches)/i);
      if (match) return match[1];
    }
    return 'Custom Jewellery';
  };

  const getJobTitle = (req: any, ordId?: any): string => {
    if (req?.title && !req.title.startsWith('Custom Request #') && !req.title.startsWith('Custom Design #')) return req.title;
    if (req?.category_name) return `Bespoke ${req.category_name}`;
    if (req?.description) {
      const mainDesc = req.description.split(' - ')[0].trim();
      if (mainDesc && mainDesc !== 'Watertight 3D CAD design request.' && !mainDesc.startsWith('Size:')) {
        return mainDesc;
      }
    }
    const cat = getJobCategory(req);
    if (cat && cat !== 'Custom Jewellery') return `Bespoke ${cat}`;
    return ordId ? `Bespoke CAD Design #${ordId}` : `Bespoke CAD Design`;
  };

  const fetchPoolJobs = async () => {
    try {
      let dbPoolJobs: AvailableJob[] = [];
      try {
        const res = await api.request<any>('/orders/pool/');
        if (res && Array.isArray(res.pool_orders)) {
          dbPoolJobs = res.pool_orders.map((ord: any) => {
            const req = ord.custom_request;
            const total = parseFloat(ord.total_price || req?.agreed_price || req?.estimated_price_shown || '200');

            const stonesList = (req?.stones && req.stones.length > 0) ? req.stones : (req?.gemstones || []);
            const stonesCount = stonesList.reduce((acc: number, s: any) => acc + (Number(s.quantity) || 1), 0) || (req?.special_instructions?.includes('Row #1') ? 1 : 0);

            let ringSizeStr = '';
            if (req?.ring_size) {
              const std = (req.ring_size_standard || 'IN').toUpperCase();
              ringSizeStr = `${std} ${req.ring_size}`;
            } else if (req?.special_instructions) {
              const sizeMatch = req.special_instructions.match(/Size:\s*([^\s|]+)/i);
              if (sizeMatch && sizeMatch[1]) ringSizeStr = sizeMatch[1].trim();
            }

            let weightStr = '';
            if (req?.target_weight_grams) {
              weightStr = `${req.target_weight_grams}g`;
            } else if (req?.special_instructions) {
              const wMatch = req.special_instructions.match(/Target Weight:\s*([^\s|]+)/i);
              if (wMatch && wMatch[1]) weightStr = wMatch[1].trim();
            }

            let metalStr = '';
            if (req?.special_instructions) {
              const mMatch = req.special_instructions.match(/Metal Alloy & Purity:\s*([^\n\r]+)/i);
              if (mMatch && mMatch[1]) metalStr = mMatch[1].trim();
            }
            if (!metalStr) {
              const purity = req?.gold_purity || '';
              let alloy = req?.metal_alloy_name || '';
              if (purity && alloy) {
                metalStr = /\b\d{2}K\b/i.test(alloy) ? alloy.replace(/\b\d{2}K\b/i, purity) : `${purity} ${alloy}`;
              } else {
                metalStr = alloy || (purity ? `${purity} Gold` : '18K Gold');
              }
            }

            return {
              id: ord.id.toString(),
              orderNumber: `ORD-${ord.id}`,
              title: getJobTitle(req, ord.id),
              category: getJobCategory(req),
              agreedPayout: 0,
              clientBudget: 'Confidential',
              deadlineHours: ord.deadline_hours || 48,
              releasedTimeAgo: ord.unassigned_since
                ? new Date(ord.unassigned_since).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                : 'Recently',
              referenceImage: req?.sketches?.[0]?.image_url || req?.sketches?.[0]?.image || req?.reference_image || 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&q=80&w=600',
              description: req?.description || req?.special_instructions || 'Watertight 3D CAD design request.',
              metalPreference: metalStr,
              specsSummary: {
                diamondCount: stonesCount,
                weightEst: weightStr ? `${weightStr} (${metalStr})` : `Calibrated ${metalStr}`,
                ringSize: ringSizeStr || undefined,
              },
              status: 'available',
              rawRequest: req,
              gemstones: stonesList,
              sketches: req?.sketches || [],
              special_instructions: req?.special_instructions || '',
              ring_size: ringSizeStr,
              target_weight_grams: weightStr,
              gold_purity: req?.gold_purity || '',
              metal_alloy_name: metalStr,
              aesthetic_style_name: req?.aesthetic_style_name || '',
              catalog_references: req?.catalog_references || [],
              catalog_references_text: req?.catalog_references_text || '',
              custom_specs_text: req?.custom_specs_text || '',
              client_name: req?.contact_name || req?.client_name || 'Valued Client',
            };
          });
        }
      } catch (e) {
        console.warn('Failed to fetch pool jobs from API:', e);
      }

      // 1. Gather all real pool jobs first (DB pool orders + store saved jobs)
      const storeJobs = appStore.getAvailableJobs();
      const realJobs: AvailableJob[] = [];
      const classifyAndAdd = (job: AvailableJob) => {
        if (!job) return;
        const idStr = String(job.id || '');
        const ordStr = String(job.orderNumber || '');
        // Discard old mock items completely
        if (idStr.startsWith('JOB-90') || idStr.includes('901') || idStr.includes('902') || idStr.includes('903') || idStr.includes('904')) {
          return;
        }
        if (!realJobs.some((r) => String(r.id) === idStr || String(r.orderNumber) === ordStr)) {
          realJobs.push(job);
        }
      };

      // Add backend DB pool jobs
      dbPoolJobs.forEach(classifyAndAdd);

      // Add jobs released by SuperAdmin
      storeJobs.forEach(classifyAndAdd);

      // 2. Scan ALL custom requests in localStorage & appStore that are agreed and unassigned!
      try {
        const customReqList: any[] = [];
        
        const isRealStaffAssigned = (staff: any) => {
          if (!staff) return false;
          // If it's just a string ID / number, treat it as assigned
          if (typeof staff === 'string') {
            const lower = staff.toLowerCase();
            // 'admin' username string means it's not a real staff assignment
            if (lower === 'admin' || lower === 'superadmin') return false;
            return staff.trim().length > 0;
          }
          if (typeof staff === 'number') return staff > 0;
          if (typeof staff === 'object') {
            // If the assigned user is an admin/superuser, don't treat as staff assignment
            const role = (staff.role || staff.user_type || '').toLowerCase();
            const uname = (staff.username || '').toLowerCase();
            if (role === 'admin' || role === 'superadmin' || role === 'superuser' || staff.is_superuser || staff.is_staff_admin || uname === 'admin' || uname === 'superadmin') return false;
            return Boolean(staff.id || staff.username || staff.name || staff.first_name || staff.email);
          }
          return false;
        };

        const processItem = (req: any) => {
          if (!req) return;
          const reqIdStr = String(req.id || req.ticket_id || '');
          if (!reqIdStr) return;
          if (['req-901', 'req-902', 'req-903', 'req-904'].includes(reqIdStr.toLowerCase())) return;

          const staffAssigned = isRealStaffAssigned(req.assigned_staff) || isRealStaffAssigned(req.order?.assigned_staff) || isRealStaffAssigned(req.assigned_staff_id);
          const isAgreedOrConfirmed = req.status === 'agreed' || req.status === 'in_progress' || req.status === 'confirmed' || Boolean(req.order);

          // Allow ONLY agreed/confirmed requests or requests explicitly approved for pool
          if (isAgreedOrConfirmed && !staffAssigned && !customReqList.some((c: any) => String(c.id || c.ticket_id || '') === reqIdStr)) {
            customReqList.push(req);
          }
        };

        // 1. Scan appStore custom requests
        try {
          const storeReqs = appStore.getCustomRequests();
          if (Array.isArray(storeReqs)) {
            storeReqs.forEach((r) => processItem(r));
          }
        } catch (e) {}

        // 2. Scan ALL localStorage keys starting with shiuli_
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && (key.startsWith('shiuli_user_custom_requests_') || key === 'shiuli_store_custom_requests' || key.includes('custom_requests'))) {
            const raw = localStorage.getItem(key);
            if (raw) {
              try {
                const parsed = JSON.parse(raw);
                if (Array.isArray(parsed)) {
                  parsed.forEach((r: any) => processItem(r));
                }
              } catch (e) {}
            }
          }
        }

        // Add real custom requests to the FRONT of realJobs if not already present
        customReqList.forEach((req: any) => {
          const reqIdStr = String(req.id || req.ticket_id || '');
          const jobNumId = `JOB-REQ-${reqIdStr.replace(/[^0-9]/g, '') || reqIdStr}`;
          
          const isAlreadyInJobs = realJobs.some((c) => {
            const cId = String(c.id || '');
            const cOrd = String(c.orderNumber || '');
            const cRawReqId = String(c.rawRequest?.id || c.rawRequest?.ticket_id || '');
            return cId === jobNumId || cId === reqIdStr || cRawReqId === reqIdStr || cOrd === `REQ #${reqIdStr}` || cOrd === `ORD-${reqIdStr}`;
          });

          if (!isAlreadyInJobs) {
            const totalVal = parseFloat(req.agreed_price || req.estimated_price_shown || req.offered_price || req.price || '20000') || 20000;
            const payout = 0; // Price hidden from staff for strict confidentiality

            const clientNameStr = req.contact_name || req.client_name || req.clientName || (typeof req.client === 'object' ? req.client?.username : '') || 'Valued Client';
            const catStr = getJobCategory(req);
            const titleStr = getJobTitle(req);

            const stonesList = (req.stones && req.stones.length > 0) ? req.stones : (req.gemstones || []);
            const stonesCount = stonesList.reduce((acc: number, s: any) => acc + (Number(s.quantity) || 1), 0) || (req.special_instructions?.includes('Row #1') ? 1 : 0);

            let ringSizeStr = '';
            if (req.ring_size) {
              const std = (req.ring_size_standard || 'IN').toUpperCase();
              ringSizeStr = `${std} ${req.ring_size}`;
            } else if (req.special_instructions) {
              const sizeMatch = req.special_instructions.match(/Size:\s*([^\s|]+)/i);
              if (sizeMatch && sizeMatch[1]) ringSizeStr = sizeMatch[1].trim();
            }

            let weightStr = '';
            if (req.target_weight_grams) {
              weightStr = `${req.target_weight_grams}g`;
            } else if (req.special_instructions) {
              const wMatch = req.special_instructions.match(/Target Weight:\s*([^\s|]+)/i);
              if (wMatch && wMatch[1]) weightStr = wMatch[1].trim();
            }

            let metalStr = '';
            if (req.special_instructions) {
              const mMatch = req.special_instructions.match(/Metal Alloy & Purity:\s*([^\n\r]+)/i);
              if (mMatch && mMatch[1]) metalStr = mMatch[1].trim();
            }
            if (!metalStr) {
              const purity = req.gold_purity || '';
              let alloy = req.metal_alloy_name || '';
              if (purity && alloy) {
                metalStr = /\b\d{2}K\b/i.test(alloy) ? alloy.replace(/\b\d{2}K\b/i, purity) : `${purity} ${alloy}`;
              } else {
                metalStr = alloy || req.metalPreference || (purity ? `${purity} Gold` : '18K Gold');
              }
            }
            
            let refImg = 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&q=80&w=600';
            if (req.sketches && Array.isArray(req.sketches) && req.sketches.length > 0) {
              refImg = req.sketches[0].image_url || req.sketches[0].image || refImg;
            } else if (req.reference_image) {
              refImg = req.reference_image;
            }

            realJobs.unshift({
              id: jobNumId,
              orderNumber: `REQ #${reqIdStr}`,
              title: titleStr,
              category: catStr,
              metalPreference: metalStr,
              agreedPayout: payout,
              clientBudget: 'Confidential',
              releasedTimeAgo: 'Just now',
              deadlineHours: 48,
              referenceImage: refImg,
              description: req.description || req.special_instructions || 'Watertight 3D CAD design request.',
              specsSummary: {
                diamondCount: stonesCount,
                ringSize: ringSizeStr || undefined,
                dimensions: req.custom_specs_text || 'Bespoke Specs',
                weightEst: weightStr ? `${weightStr} (${metalStr})` : `Calibrated ${metalStr}`,
              },
              status: 'available',
              rawRequest: req,
              gemstones: stonesList,
              sketches: req.sketches || [],
              special_instructions: req.special_instructions || '',
              ring_size: ringSizeStr,
              target_weight_grams: weightStr,
              gold_purity: req.gold_purity || '',
              metal_alloy_name: metalStr,
              aesthetic_style_name: req.aesthetic_style_name || '',
              catalog_references: req.catalog_references || [],
              catalog_references_text: req.catalog_references_text || '',
              custom_specs_text: req.custom_specs_text || '',
              client_name: clientNameStr,
            });
          }
        });
      } catch (e) {
        console.warn('Failed to scan custom requests for staff job pool:', e);
      }

      // Only real customer jobs are displayed in the broadcast pool - no dummy mock data
      setAvailableJobs(realJobs);
    } catch (e) {
      console.warn('Error in fetchPoolJobs:', e);
    }
  };

  const fetchMyActiveJobs = async () => {
    try {
      const res = await api.request<any>('/orders/');
      const ensureArray = (r: any) => {
        if (Array.isArray(r)) return r;
        if (r && Array.isArray(r.results)) return r.results;
        return [];
      };
      const orderList = ensureArray(res);
      const activeOrders = orderList.filter(
        (ord: any) => ord.status !== 'completed' && ord.status !== 'delivered' && ord.status !== 'preview_ready'
      );
      const completedOrders = orderList.filter(
        (ord: any) => ord.status === 'completed' || ord.status === 'delivered' || ord.status === 'preview_ready'
      );

      const mappedActive: StaffActiveJob[] = activeOrders.map((ord: any) => {
        const req = ord.custom_request;
        const total = parseFloat(ord.total_price || '200');
        return {
          id: ord.id.toString(),
          orderNumber: `ORD-${ord.id}`,
          title: getJobTitle(req, ord.id),
          category: getJobCategory(req),
          referenceImage: req?.sketches?.[0]?.image_url || req?.sketches?.[0]?.image || req?.reference_image || 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&q=80&w=600',
          acceptedAt: ord.assigned_at ? new Date(ord.assigned_at).toLocaleDateString() : 'Active',
          deadline: 'In 48 Hours',
          hoursRemaining: 48,
          payoutAmount: Math.round(total * 0.4),
          clientName: req?.contact_name || ord.client?.first_name || 'Jewellery Atelier',
          clientNotes: req?.description || 'Watertight 3D CAD design request.',
          currentMilestone: ord.status === 'pending_review' ? 'Pending Review' : 'Modeling',
          progressPercentage: ord.status === 'pending_review' ? 100 : 50,
          status: ord.status === 'pending_review' ? 'Pending Admin QC Review' : 'With CAD Designer',
        };
      });

      setActiveJobs(mappedActive);
      setStaff((prev) => ({
        ...prev,
        currentLoad: mappedActive.length,
        jobsCompleted: Math.max(0, completedOrders.length),
        maxJobLimit: Math.max(mappedActive.length, prev.maxJobLimit || 4),
      }));
    } catch (e) {
      console.warn('Failed to fetch my active jobs:', e);
    }
  };

  useEffect(() => {
    fetchPoolJobs();
    fetchMyActiveJobs();

    const handleSync = () => {
      fetchPoolJobs();
      fetchMyActiveJobs();
    };

    window.addEventListener('storage', handleSync);
    window.addEventListener('shiuli_custom_requests_changed', handleSync);

    return () => {
      window.removeEventListener('storage', handleSync);
      window.removeEventListener('shiuli_custom_requests_changed', handleSync);
    };
  }, [activeTab]);

  // Action 1: Accept Job from Job Pool (First-Accept-Wins Race Mechanic)
  const handleAcceptJob = async (jobId: string) => {
    try {
      try {
        await api.request(`/orders/${jobId}/accept/`, { method: 'POST' });
      } catch (err) {
        console.warn('Backend job accept fallback to local:', err);
      }

      const targetJob = availableJobs.find((j) => j.id === jobId);
      if (targetJob) {
        const newActiveJob: StaffActiveJob = {
          id: targetJob.id,
          orderNumber: targetJob.orderNumber,
          title: targetJob.title,
          category: targetJob.category,
          referenceImage: targetJob.referenceImage,
          acceptedAt: new Date().toLocaleDateString(),
          deadline: `In ${targetJob.deadlineHours || 48} Hours`,
          hoursRemaining: targetJob.deadlineHours || 48,
          payoutAmount: targetJob.agreedPayout,
          clientName: targetJob.title.includes('(') ? targetJob.title.split('(')[1].replace(')', '') : 'Valued Client',
          clientNotes: targetJob.description,
          currentMilestone: 'Started',
          progressPercentage: 25,
          status: 'With CAD Designer',
        };

        const updatedActive = [newActiveJob, ...activeJobs];
        setActiveJobs(updatedActive);
        appStore.saveActiveJobs(updatedActive);

        const updatedAvailable = availableJobs.filter((j) => j.id !== jobId);
        setAvailableJobs(updatedAvailable);
        appStore.saveAvailableJobs(updatedAvailable);

        const targetReqIds = [
          String(jobId),
          jobId.replace('JOB-REQ-', ''),
          targetJob?.rawRequest?.id ? String(targetJob.rawRequest.id) : '',
          targetJob?.rawRequest?.ticket_id ? String(targetJob.rawRequest.ticket_id) : '',
          targetJob?.orderNumber?.replace('ORD-', '') || '',
        ].filter(Boolean);

        const staffObj = {
          id: staff.id,
          username: staff.name,
          first_name: staff.name.split(' ')[0],
          last_name: staff.name.split(' ').slice(1).join(' '),
          role: staff.role,
          rating: staff.rating,
          jobs_completed: staff.jobsCompleted,
          profile_photo: staff.avatar,
        };

        const assignStaffInStorage = (key: string) => {
          const raw = localStorage.getItem(key);
          if (!raw) return;
          try {
            const parsed = JSON.parse(raw);
            if (Array.isArray(parsed)) {
              const updated = parsed.map((item: any) => {
                const itemIdStr = String(item.id || item.ticket_id || '');
                const itemOrdIdStr = String(item.order?.id || '');
                const matches = targetReqIds.some(
                  (idStr) => itemIdStr === idStr || itemOrdIdStr === idStr || String(item.id) === idStr
                );
                if (matches) {
                  return {
                    ...item,
                    assigned_staff: staffObj,
                    status: 'in_progress',
                    order: {
                      ...(item.order || {}),
                      id: item.order?.id || (jobId.startsWith('JOB-REQ') ? Math.floor(1000 + Math.random() * 9000) : Number(jobId)),
                      assigned_staff: staffObj,
                      status: 'in_progress',
                      milestones: [
                        { id: Date.now(), stage: 'Work Started', progress: 25, reached_at: new Date().toISOString() }
                      ]
                    },
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
            assignStaffInStorage(key);
          }
        }

        // Live cross-tab sync
        window.dispatchEvent(new CustomEvent('shiuli_custom_requests_changed'));
      }

      setWaxSeal({
        active: true,
        title: 'SEAL OF ASSIGNMENT',
        subtitle: `Order ${targetJob?.orderNumber || jobId} has been accepted and locked on your velvet workbench tray!`,
      });
      fetchPoolJobs();
      fetchMyActiveJobs();
    } catch (err: any) {
      alert(err?.message || 'Failed to claim order from pool.');
    }
  };

  // Action 2: Open active job workspace
  const handleOpenActiveWorkspace = (jobId: string) => {
    setSelectedActiveJobId(jobId);
    handleTabChange('active-job');
  };

  // Action 3: Update Milestone Stepper
  const handleUpdateMilestone = (
    jobId: string,
    milestone: StaffActiveJob['currentMilestone'],
    progress: number
  ) => {
    const updatedActive = activeJobs.map((job) =>
      job.id === jobId
        ? {
            ...job,
            currentMilestone: milestone,
            progressPercentage: progress,
          }
        : job
    );
    setActiveJobs(updatedActive);
    appStore.saveActiveJobs(updatedActive);
  };

  // Action 4: Submit Deliverables & Complete Job
  const handleCompleteJob = (jobId: string) => {
    const targetJob = activeJobs.find((j) => j.id === jobId);
    if (!targetJob) return;

    // Remove from active jobs
    const updatedActive = activeJobs.filter((j) => j.id !== jobId);
    setActiveJobs(updatedActive);
    appStore.saveActiveJobs(updatedActive);

    // Update staff load & jobs completed
    setStaff((prev) => ({
      ...prev,
      currentLoad: Math.max(0, prev.currentLoad - 1),
      jobsCompleted: prev.jobsCompleted + 1,
      totalEarnings: prev.totalEarnings + targetJob.payoutAmount,
    }));

    // Add to earnings history
    const newEarnRecord: StaffEarningsRecord = {
      id: `EARN-${Date.now().toString().slice(-4)}`,
      orderNumber: targetJob.orderNumber,
      title: targetJob.title,
      completedDate: new Date().toISOString().split('T')[0],
      amount: targetJob.payoutAmount,
      status: 'Pending Settlement',
    };
    setEarnings((prev) => [newEarnRecord, ...prev]);

    // Add to staff submissions history so it appears in My CAD Submissions & Commissions Log
    const newSubmission: StaffSubmission = {
      id: targetJob.id,
      title: targetJob.title,
      category: targetJob.category,
      submittedAt: new Date().toISOString().split('T')[0],
      status: 'pending',
      thumbnail: targetJob.referenceImage,
      fileFormats: ['3DM', 'STL', 'Render'],
      suggestedPrice: targetJob.agreedPayout || 200,
      specs: {
        metalWeight18k: targetJob.metalPreference || '18K Gold',
        diamondCount: Number(targetJob.specsSummary.diamondCount) || 1,
        dimensions: 'Watertight SOW',
      },
    };
    const updatedSubmissions = [newSubmission, ...submissions.filter((s) => s.id !== targetJob.id)];
    setSubmissions(updatedSubmissions);
    appStore.saveSubmissions(updatedSubmissions);

    // Trigger Completion Wax-Seal Ceremony
    setWaxSeal({
      active: true,
      title: 'SEAL OF COMPLETION',
      subtitle: `CAD Deliverables for "${targetJob.title}" have been officially delivered to Super Admin for QC Review. Your workbench slot is now open!`,
      onComplete: () => {
        handleTabChange('workbench');
      },
    });
  };

  // Action 5: Upload Independent Design
  const handleUploadDesign = (newSub: StaffSubmission) => {
    const updatedSubmissions = [newSub, ...submissions];
    setSubmissions(updatedSubmissions);
    appStore.saveSubmissions(updatedSubmissions);

    // Trigger Approval Ceremony preview
    setWaxSeal({
      active: true,
      title: 'STAMPED FOR ADMIN REVIEW',
      subtitle: `Your custom design "${newSub.title}" has been submitted to the Super Admin review queue.`,
    });
  };

  const selectedJobObject = activeJobs.find((j) => j.id === selectedActiveJobId) || activeJobs[0];

  return (
    <StaffLayout
      activeTab={activeTab}
      onTabChange={handleTabChange}
      staff={staff}
      availableJobsCount={availableJobs.length}
      activeJobsCount={activeJobs.length}
      notifications={notifications}
      onBackToMain={onBackToMain}
    >
      {/* Wax Seal Ceremony Animation Modal */}
      <WaxSealStamp
        active={waxSeal.active}
        title={waxSeal.title}
        subtitle={waxSeal.subtitle}
        onClose={() => {
          setWaxSeal({ active: false });
          if (waxSeal.onComplete) waxSeal.onComplete();
        }}
      />

      {/* Tab Contents */}
      {activeTab === 'workbench' && (
        <StaffWorkbenchTab
          staff={staff}
          activeJobs={activeJobs}
          onOpenActiveWorkspace={handleOpenActiveWorkspace}
          onNavigateToTab={handleTabChange}
        />
      )}

      {activeTab === 'job-pool' && (
        <StaffJobPoolTab
          availableJobs={availableJobs}
          staff={staff}
          activeJobsCount={activeJobs.length}
          onAcceptJob={handleAcceptJob}
        />
      )}

      {activeTab === 'my-designs' && (
        <StaffMyDesignsTab submissions={submissions} onUploadDesign={handleUploadDesign} />
      )}

      {activeTab === 'active-job' && selectedJobObject && (
        <StaffActiveJobWorkspace
          job={selectedJobObject}
          onBack={() => handleTabChange('workbench')}
          onUpdateMilestone={handleUpdateMilestone}
          onCompleteJob={(jobId) => {
            fetchMyActiveJobs();
            handleCompleteJob(jobId);
          }}
        />
      )}

      {activeTab === 'history' && <StaffHistoryTab earnings={earnings} />}

      {activeTab === 'earnings' && (
        <StaffEarningsTab staff={staff} earnings={earnings} />
      )}

      {activeTab === 'profile' && <StaffProfileTab staff={staff} onUpdateProfile={setStaff} />}

      {activeTab === 'notifications' && (
        <StaffNotificationsTab
          notifications={notifications}
          onMarkAllRead={() =>
            setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
          }
        />
      )}
    </StaffLayout>
  );
};
