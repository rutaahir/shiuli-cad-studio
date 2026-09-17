import React, { useState } from 'react';
import { CartItem, PageId } from '../types';
import { X, Trash2, ShieldCheck, Download, Sparkles, ArrowRight, CheckCircle2, Lock, Plus, Minus } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { OTPVerificationModal } from './delivery/OTPVerificationModal';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onRemoveItem: (index: number) => void;
  onUpdateLicense: (index: number, license: 'standard' | 'commercial') => void;
  onUpdateQuantity?: (index: number, quantity: number) => void;
  onClearCart: () => void;
  onNavigate: (page: PageId) => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  items,
  onRemoveItem,
  onUpdateLicense,
  onUpdateQuantity,
  onClearCart,
  onNavigate,
}) => {
  const { user, requireAuth } = useAuth();
  const [promoCode, setPromoCode] = useState('');
  const [discountPercent, setDiscountPercent] = useState(0);
  const [promoMessage, setPromoMessage] = useState('');
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [orderCompleted, setOrderCompleted] = useState(false);

  // OTP Verification Modal State
  const [otpModalState, setOtpModalState] = useState<{
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

  if (!isOpen) return null;

  const totalQuantity = items.reduce((acc, item) => acc + (item.quantity || 1), 0);

  const subtotal = items.reduce((acc, item) => {
    const unitPrice = item.license === 'commercial' ? item.product.price * 1.8 : item.product.price;
    return acc + unitPrice * (item.quantity || 1);
  }, 0);

  const discountAmount = (subtotal * discountPercent) / 100;
  const total = Math.max(0, subtotal - discountAmount);
  const totalINR = Math.round(total * 83);

  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    if (promoCode.trim().toUpperCase() === 'ROYAL10' || promoCode.trim().toUpperCase() === 'SHIULI') {
      setDiscountPercent(10);
      setPromoMessage('10% Royal Atelier Discount applied!');
    } else {
      setPromoMessage('Invalid code. Try "ROYAL10"');
    }
  };

  const handleCheckout = () => {
    requireAuth(async () => {
      setIsCheckingOut(true);
      const orderIdNum = Math.floor(100000 + Math.random() * 900000);
      let purchaseId = orderIdNum;
      let maskedEmail = 'c***r@gmail.com';

      const rawEmail = user?.email || 'customer@shiulicadstudio.com';
      const emailParts = rawEmail.split('@');
      maskedEmail = emailParts[0].length > 2
        ? `${emailParts[0][0]}***${emailParts[0].slice(-1)}@${emailParts[1] || 'gmail.com'}`
        : `c***r@${emailParts[1] || 'gmail.com'}`;

      try {
        const firstItem = items[0];
        if (firstItem) {
          const res = await api.post<any>('/payments/purchases/', {
            product_id: firstItem.product.dbId || firstItem.product.id,
            license_type: firstItem.license === 'commercial' ? 'commercial' : 'atelier',
          });
          if (res && res.purchase_id) {
            purchaseId = res.purchase_id;
            if (res.masked_email) maskedEmail = res.masked_email;
          }
        }
      } catch (e) {
        console.warn('Backend purchases endpoint fallback:', e);
      }

      setOtpModalState({
        isOpen: true,
        purchaseId: purchaseId,
        productTitle: items.map(i => i.product.title).join(' & '),
        maskedEmail: maskedEmail,
      });
      setIsCheckingOut(false);
    }, {
      intent: 'purchase',
      message: 'Sign in to complete CAD File Bag purchase & verify email OTP',
    });
  };

  const handleOTPVerifiedSuccess = () => {
    setOtpModalState(prev => ({ ...prev, isOpen: false }));

    const userKey = (user?.email || user?.username || 'anonymous').toLowerCase();
    const ordersKey = `shiuli_user_orders_${userKey}`;
    const purchasesKey = `shiuli_user_purchases_${userKey}`;

    const orderIdNum = otpModalState.purchaseId || Math.floor(100000 + Math.random() * 900000);
    const orderId = `ord-${orderIdNum}`;
    const orderNum = `SCS-2026-${orderIdNum}`;
    const currentDateStr = new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });

    const newOrder = {
      id: orderId,
      orderNumber: orderNum,
      date: currentDateStr,
      items: items.map(it => ({
        product: it.product,
        license: it.license,
        price: it.license === 'commercial' ? it.product.price * 1.8 : it.product.price
      })),
      total: total,
      status: 'completed',
      statusLabel: 'Email OTP Verified • Files Ready',
      downloadName: `Shiuli_CAD_Pack_${orderIdNum}.zip`,
      downloadSize: `${(items.length * 35.4).toFixed(1)} MB`
    };

    // 1. Save Order
    let existingOrders: any[] = [];
    try {
      const stored = localStorage.getItem(ordersKey);
      if (stored) existingOrders = JSON.parse(stored);
    } catch {}
    existingOrders.unshift(newOrder);
    localStorage.setItem(ordersKey, JSON.stringify(existingOrders));

    // 2. Save Purchases for My CAD Vault
    let existingPurchases: any[] = [];
    try {
      const storedP = localStorage.getItem(purchasesKey);
      if (storedP) existingPurchases = JSON.parse(storedP);
    } catch {}

    items.forEach(it => {
      existingPurchases.unshift({
        id: `pur-${Date.now()}-${it.product.id}`,
        product_id: it.product.id,
        product_title: it.product.title,
        product_sku: `SKU-${it.product.id}`,
        license_type: it.license,
        amount_paid: it.license === 'commercial' ? it.product.price * 1.8 : it.product.price,
        purchase_date: currentDateStr,
        is_otp_verified: true,
        is_downloaded: false,
        download_url: '#',
        thumbnail: it.product.image || it.product.images?.[0] || '/placeholder.png'
      });
    });
    localStorage.setItem(purchasesKey, JSON.stringify(existingPurchases));

    setOrderCompleted(true);
    onClearCart();

    try {
      confetti({
        particleCount: 100,
        spread: 80,
        origin: { y: 0.5 },
        colors: ['#D4AF37', '#1E4FA3', '#F5E7A3', '#FAF8F3'],
      });
    } catch {}
  };

  const handleSimulateDownload = () => {
    // Generate sample CAD package text file download
    const manifest = `SHIULI CAD STUDIO — INSTANT DOWNLOAD PACKAGE
Order ID: SCS-ORD-${Math.floor(100000 + Math.random() * 900000)}
Files included:
${items.map((it, i) => `  ${i + 1}. ${it.product.title}
     - Format: .3DM (Rhino 7/8 Native Layered Model)
     - Format: .STL (Watertight High-Res Mesh, 1.25% Casting Shrinkage Applied)
     - Format: .OBJ (Universal Quad Mesh)
     - 4K Studio Ray-traced Renders
     - License: ${it.license.toUpperCase()} PRODUCTION`).join('\n\n')}

Manufacturing Guarantee: 100% Watertight Solid Geometry. Zero non-manifold edges.
Support: info@shiulicadstudio.com | Phone: +91 9662159084`;

    const blob = new Blob([manifest], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Shiuli_CAD_Files_Pack.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
      />

      {/* Drawer */}
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-[#0B1330] border-l border-[#D4AF37]/30 shadow-2xl flex flex-col">
          {/* Header */}
          <div className="p-5 border-b border-[#D4AF37]/20 flex items-center justify-between bg-[#080E24]">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#D4AF37]" />
              <h2 className="font-serif text-lg tracking-wider text-[#FAF8F3]">
                Your CAD File Bag ({totalQuantity})
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 text-[#C9C2A6] hover:text-[#FAF8F3] hover:bg-white/5 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {orderCompleted ? (
              /* Success confirmation state */
              <div className="text-center py-10 space-y-5">
                <div className="w-16 h-16 mx-auto rounded-full bg-[#D4AF37]/20 border-2 border-[#D4AF37] flex items-center justify-center animate-bounce">
                  <CheckCircle2 className="w-8 h-8 text-[#F5E7A3]" />
                </div>
                <div className="space-y-2">
                  <h3 className="font-serif text-2xl text-[#FAF8F3]">
                    Your CAD Files Are Ready!
                  </h3>
                  <p className="text-xs text-[#C9C2A6] max-w-xs mx-auto">
                    Payment confirmed. Instant download unlocked for Rhino .3DM, castable .STL meshes, and 4K renders.
                  </p>
                </div>

                {/* Download Simulator Button */}
                <button
                  onClick={handleSimulateDownload}
                  className="btn-gold-luxury w-full py-3.5 rounded-xl font-medium tracking-wider uppercase text-xs flex items-center justify-center gap-2 shadow-lg"
                >
                  <Download className="w-4 h-4 text-[#0B1330]" />
                  Download CAD Package (.ZIP)
                </button>

                <div className="p-4 rounded-xl bg-[#121F4D]/40 border border-[#D4AF37]/20 text-left text-xs space-y-2 text-[#C9C2A6]">
                  <p className="font-medium text-[#FAF8F3]">What’s Inside Your Download:</p>
                  <p>• Layered Rhino .3DM (Stone prongs, cutters, metal body)</p>
                  <p>• Watertight .STL (1.25% Shrinkage pre-compensated)</p>
                  <p>• Production Spec Sheet &amp; Stone Count PDF</p>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      onClearCart();
                      setOrderCompleted(false);
                      onClose();
                      onNavigate('account');
                    }}
                    className="flex-1 py-2.5 rounded-xl border border-[#D4AF37]/30 text-xs text-[#FAF8F3] hover:bg-[#121F4D]"
                  >
                    View In My Account
                  </button>
                  <button
                    onClick={() => {
                      onClearCart();
                      setOrderCompleted(false);
                      onClose();
                      onNavigate('collections');
                    }}
                    className="flex-1 py-2.5 rounded-xl bg-[#D4AF37]/20 text-xs text-[#F5E7A3] hover:bg-[#D4AF37]/30"
                  >
                    Browse More CAD
                  </button>
                </div>
              </div>
            ) : items.length === 0 ? (
              <div className="text-center py-16 space-y-4">
                <div className="w-14 h-14 mx-auto rounded-full bg-[#121F4D]/50 border border-[#D4AF37]/20 flex items-center justify-center text-[#C9C2A6]">
                  <Sparkles className="w-6 h-6 text-[#D4AF37]/60" />
                </div>
                <div className="space-y-1">
                  <p className="font-serif text-lg text-[#FAF8F3]">Your CAD bag is empty</p>
                  <p className="text-xs text-[#C9C2A6]">
                    Explore our ready-to-cast collections and bespoke files.
                  </p>
                </div>
                <button
                  onClick={() => {
                    onClose();
                    onNavigate('collections');
                  }}
                  className="btn-gold-luxury px-5 py-2.5 rounded-full text-xs font-semibold uppercase tracking-wider"
                >
                  Explore Collections
                </button>
              </div>
            ) : (
              items.map((item, idx) => {
                const currentPrice =
                  item.license === 'commercial' ? item.product.price * 1.8 : item.product.price;

                return (
                  <div
                    key={`${item.product.id}-${idx}`}
                    className="p-3.5 rounded-xl bg-[#0E183D] border border-[#D4AF37]/20 space-y-3"
                  >
                    <div className="flex gap-3">
                      <img
                        src={item.product.primaryImage}
                        alt={item.product.title}
                        referrerPolicy="no-referrer"
                        className="w-16 h-16 rounded-lg object-cover border border-[#D4AF37]/20 flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="text-xs font-medium text-[#FAF8F3] line-clamp-1">
                          {item.product.title}
                        </h4>
                        <p className="text-[11px] text-[#C9C2A6] capitalize">
                          {item.product.category} • {item.product.specs.diamondCount} Stones
                        </p>
                        <div className="flex items-center gap-1.5 mt-1">
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#121F4D] text-[#D4AF37] border border-[#D4AF37]/20">
                            3DM + STL
                          </span>
                          <span className="text-xs font-semibold text-[#F5E7A3]">
                            ${(currentPrice * (item.quantity || 1)).toFixed(0)}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => onRemoveItem(idx)}
                        className="text-[#C9C2A6] hover:text-red-400 p-1 transition-colors"
                        title="Remove"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* License selector & Quantity controls */}
                    <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[11px] gap-2">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[#C9C2A6]">Qty:</span>
                        <div className="flex items-center border border-[#D4AF37]/30 rounded-lg overflow-hidden bg-[#070D22]">
                          <button
                            type="button"
                            onClick={() => onUpdateQuantity ? onUpdateQuantity(idx, (item.quantity || 1) - 1) : onRemoveItem(idx)}
                            className="px-2 py-1 bg-[#12204D] hover:bg-[#1A2E60] text-[#F5E7A3] font-bold text-xs transition-colors flex items-center justify-center"
                            title="Decrease quantity"
                          >
                            <Minus className="w-3 h-3 text-[#D4AF37]" />
                          </button>
                          <span className="px-2.5 py-0.5 font-mono font-bold text-xs text-[#FAF8F3]">
                            {item.quantity || 1}
                          </span>
                          <button
                            type="button"
                            onClick={() => onUpdateQuantity ? onUpdateQuantity(idx, (item.quantity || 1) + 1) : null}
                            className="px-2 py-1 bg-[#12204D] hover:bg-[#1A2E60] text-[#F5E7A3] font-bold text-xs transition-colors flex items-center justify-center"
                            title="Increase quantity"
                          >
                            <Plus className="w-3 h-3 text-[#D4AF37]" />
                          </button>
                        </div>
                      </div>

                      <div className="flex rounded-lg overflow-hidden border border-[#D4AF37]/20 bg-[#0B1330]">
                        <button
                          onClick={() => onUpdateLicense(idx, 'standard')}
                          className={`px-2 py-0.5 transition-colors ${
                            item.license === 'standard'
                              ? 'bg-[#D4AF37] text-[#0B1330] font-semibold'
                              : 'text-[#C9C2A6] hover:text-white'
                          }`}
                        >
                          Atelier (1x)
                        </button>
                        <button
                          onClick={() => onUpdateLicense(idx, 'commercial')}
                          className={`px-2 py-0.5 transition-colors ${
                            item.license === 'commercial'
                              ? 'bg-[#1E4FA3] text-white font-semibold'
                              : 'text-[#C9C2A6] hover:text-white'
                          }`}
                        >
                          Mass Mfg (+80%)
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer / Summary */}
          {items.length > 0 && !orderCompleted && (
            <div className="p-5 border-t border-[#D4AF37]/20 bg-[#080E24] space-y-4">
              {/* Promo code */}
              <form onSubmit={handleApplyPromo} className="flex gap-2">
                <input
                  type="text"
                  placeholder="Promo (use ROYAL10)"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value)}
                  className="flex-1 px-3 py-1.5 text-xs rounded-lg bg-[#0B1330] border border-[#D4AF37]/30 text-[#FAF8F3] uppercase placeholder-[#C9C2A6]/40 focus:outline-none focus:border-[#D4AF37]"
                />
                <button
                  type="submit"
                  className="px-3 py-1.5 rounded-lg border border-[#D4AF37]/40 text-xs text-[#F5E7A3] hover:bg-[#D4AF37]/10"
                >
                  Apply
                </button>
              </form>
              {promoMessage && (
                <p className="text-[11px] text-[#D4AF37] -mt-2">{promoMessage}</p>
              )}

              {/* Price Calculation */}
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between text-[#C9C2A6]">
                  <span>Subtotal:</span>
                  <span>${subtotal.toFixed(0)}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-400">
                    <span>Discount (10%):</span>
                    <span>-${discountAmount.toFixed(0)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm font-semibold text-[#FAF8F3] pt-2 border-t border-white/5">
                  <span className="font-serif">Total Payable:</span>
                  <span className="text-[#F5E7A3]">${total.toFixed(0)}</span>
                </div>
              </div>

              {/* Checkout Button */}
              <button
                onClick={handleCheckout}
                disabled={isCheckingOut}
                className="w-full py-4 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-zinc-950 font-bold tracking-wider uppercase text-xs flex items-center justify-center gap-2 shadow-[0_8px_32px_rgba(212,175,55,0.35)] hover:shadow-[0_8px_40px_rgba(212,175,55,0.5)] transition-all disabled:opacity-50"
              >
                {isCheckingOut ? (
                  <span className="flex items-center gap-2">
                    <span className="w-3.5 h-3.5 border-2 border-[#0B1330] border-t-transparent rounded-full animate-spin" />
                    Initiating Secure Checkout...
                  </span>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4 text-zinc-950" />
                    <span>Buy Now &amp; Verify OTP — ₹{totalINR.toLocaleString('en-IN')} INR</span>
                  </>
                )}
              </button>

              <div className="flex items-center justify-center gap-2 text-[10px] text-[#C9C2A6]">
                <ShieldCheck className="w-3.5 h-3.5 text-[#D4AF37]" />
                <span>Instant Digital Delivery • Watertight Mesh Guarantee</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* RE-DELIVERY / CHECKOUT OTP VERIFICATION MODAL */}
      <OTPVerificationModal
        isOpen={otpModalState.isOpen}
        onClose={() => setOtpModalState(prev => ({ ...prev, isOpen: false }))}
        purchaseId={otpModalState.purchaseId}
        productTitle={otpModalState.productTitle}
        maskedEmail={otpModalState.maskedEmail}
        onVerifiedSuccess={handleOTPVerifiedSuccess}
      />
    </div>
  );
};
