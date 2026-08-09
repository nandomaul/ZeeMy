"use client";

import {
  ArrowDown,
  ArrowLeft,
  ArrowUp,
  Bell,
  Camera,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock3,
  CreditCard,
  Gift,
  Heart,
  Home,
  ImagePlus,
  LogOut,
  MapPin,
  Menu,
  MessageCircle,
  Minus,
  Package,
  Pencil,
  Pin,
  PinOff,
  Plus,
  RotateCcw,
  Search,
  Send,
  Settings,
  ShieldCheck,
  Share2,
  ShoppingBag,
  ShoppingCart,
  SlidersHorizontal,
  Sparkles,
  Star,
  Store,
  Trash2,
  Truck,
  Upload,
  UserRound,
  Users,
  Phone,
  X,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ADMIN_ACCOUNTS, ADMIN_WHATSAPP, formatRupiah, PRODUCTS, SHIPPING_RATES } from "./data";
import type {
  AdminAccount,
  CartLine,
  Order,
  OrderStatus,
  Product,
  ProductAvailability,
  Profile,
  Role,
  Screen,
  ShippingRates,
} from "./types";

const PUBLIC_BASE_PATH = (process.env.NEXT_PUBLIC_BASE_PATH ?? "").replace(/\/$/, "");
const publicAsset = (path: string) => `${PUBLIC_BASE_PATH}${path}`;

const DEFAULT_PROFILE: Profile = {
  nickname: "",
  phone: "",
  avatarIndex: 0,
  address: "",
  region: "Jabodetabek",
};

const AVAILABILITY_META: Record<ProductAvailability, { label: string; short: string; disabled: boolean }> = {
  ready: { label: "Tersedia", short: "READY", disabled: false },
  preorder: { label: "Pre Order", short: "PRE ORDER", disabled: false },
  po_open: { label: "PO Dibuka", short: "OPEN PO", disabled: false },
  po_closed: { label: "PO Ditutup", short: "PO CLOSED", disabled: true },
  sold_out: { label: "Sold Out", short: "SOLD OUT", disabled: true },
};

type AdminTab = "products" | "orders" | "shipping" | "settings";
type DeleteTarget =
  | { kind: "products"; ids: string[]; label: string }
  | { kind: "orders"; ids: string[]; label: string }
  | { kind: "shipping"; ids: string[]; label: string };

const productAvailability = (product: Product): ProductAvailability =>
  product.availability ?? (product.soldOut ? "sold_out" : "ready");

const isProductDisabled = (product: Product) =>
  AVAILABILITY_META[productAvailability(product)].disabled;

const halfDaySlot = () => Math.floor(Date.now() / 43_200_000);

const timestamp = () => Date.now();

const STATUS_META: Record<OrderStatus, { label: string; detail: string }> = {
  payment: { label: "Menunggu pembayaran", detail: "Konfirmasi pembayaran ke tim ZeeMy lewat WhatsApp." },
  accepted: { label: "Pesanan diterima", detail: "Pesananmu sudah diterima dan segera disiapkan." },
  process: { label: "Sedang diproses", detail: "Barang sedang dibelanjakan dan dipacking." },
  shipping: { label: "Dalam pengiriman", detail: "Paket sudah dikirim menuju alamatmu." },
  received: { label: "Sudah diterima", detail: "Pesanan selesai. Kamu mendapat satu stamp." },
  canceled: { label: "Dibatalkan", detail: "Pesanan dibatalkan oleh admin." },
};

const ONBOARDING = [
  {
    eyebrow: "Jastip lebih mudah",
    title: "Temukan titipan lucu tanpa tenggelam di chat.",
    copy: "ZeeMy upload barang yang lagi available. Kamu tinggal pilih, simpan, atau masukkan ke keranjang.",
    art: "browse",
  },
  {
    eyebrow: "Harga lebih jelas",
    title: "Barang, fee, dan estimasi kirim langsung kelihatan.",
    copy: "Sebelum lanjut ke WhatsApp, semua pilihan dan estimasi total sudah diringkas rapi.",
    art: "total",
  },
  {
    eyebrow: "Tetap manusiawi",
    title: "Finalisasi transaksi langsung bareng tim ZeeMy.",
    copy: "Pesanan otomatis ditulis ke chat WhatsApp, lengkap dengan jumlah barang dan alamat kirim.",
    art: "chat",
  },
];

const GUIDE = [
  { title: "Cari yang kamu suka", copy: "Pakai pencarian, filter harga, atau urutkan produk terbaru dan terlaris.", icon: Search },
  { title: "Simpan atau masukkan keranjang", copy: "Pilihanmu tersimpan di perangkat ini sampai kamu siap checkout.", icon: Heart },
  { title: "Lanjut langsung ke WhatsApp", copy: "Ringkasan produk, nomor, dan alamat akan terbentuk otomatis untuk ZeeMy.", icon: MessageCircle },
];

function usePersistedState<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(initial);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(key);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (saved) setValue(JSON.parse(saved) as T);
    } catch {
      // Tetap gunakan data awal jika penyimpanan browser rusak.
    } finally {
      setHydrated(true);
    }
  }, [key]);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // Foto preview besar dapat memenuhi localStorage; UI tetap berjalan di memori.
    }
  }, [hydrated, key, value]);

  return [value, setValue, hydrated] as const;
}

function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <img
      src={publicAsset("/brand/jastip-di-zeem-logo-hd.png")}
      alt="Jastip di Zeem"
      className={compact ? "brand-logo compact" : "brand-logo"}
    />
  );
}

function GoogleMark() {
  return (
    <svg className="google-logo" viewBox="0 0 48 48" aria-hidden="true">
      <path fill="#FFC107" d="M43.6 20.1H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 8 3l5.6-5.6C34 6.1 29.3 4 24 4 13 4 4 13 4 24s9 20 20 20 20-9 20-20c0-1.3-.1-2.6-.4-3.9Z" />
      <path fill="#FF3D00" d="m6.3 14.7 6.6 4.8C14.6 15.1 19 12 24 12c3.1 0 5.8 1.2 8 3l5.6-5.6C34 6.1 29.3 4 24 4c-7.7 0-14.4 4.4-17.7 10.7Z" />
      <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2A12 12 0 0 1 12.9 28.5l-6.5 5A20 20 0 0 0 24 44Z" />
      <path fill="#1976D2" d="M43.6 20.1H42V20H24v8h11.3a12 12 0 0 1-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.6-.4-3.9Z" />
    </svg>
  );
}

function PixelAvatar({ index, image, size = "md" }: { index: number; image?: string; size?: "sm" | "md" | "lg" }) {
  if (image) return <img src={image} alt="Foto profil" className={`pixel-avatar uploaded ${size}`} />;
  const col = index % 3;
  const row = Math.floor(index / 3);
  return (
    <span
      className={`pixel-avatar ${size}`}
      aria-label={`Avatar pixel ${index + 1}`}
      style={{
        backgroundImage: `url(${publicAsset("/brand/jastip-pixel-icons-sprite.png")})`,
        backgroundPosition: `${col * 50}% ${row * 50}%`,
      }}
    />
  );
}

function ProductVisual({ product, index = 0, className = "" }: { product: Product; index?: number; className?: string }) {
  const image = product.images[index] ?? product.images[0];
  return (
    <div className={`product-visual visual-${product.id} ${className}`}>
      {image ? <img src={image} alt={product.title} /> : <span>{product.visual}</span>}
    </div>
  );
}

function EmptyState({ icon: Icon, title, copy, action }: { icon: typeof Heart; title: string; copy: string; action?: React.ReactNode }) {
  return (
    <div className="empty-state">
      <span className="empty-icon"><Icon size={26} /></span>
      <h3>{title}</h3>
      <p>{copy}</p>
      {action}
    </div>
  );
}

async function filesToDataUrls(files: FileList | null, maxCount: number, maxBytes = 2_500_000) {
  if (!files) return [];
  const picked = Array.from(files).slice(0, maxCount);
  const valid = picked.filter((file) => file.type.startsWith("image/") && file.size <= maxBytes);
  return Promise.all(
    valid.map(
      (file) =>
        new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(String(reader.result));
          reader.onerror = reject;
          reader.readAsDataURL(file);
        }),
    ),
  );
}

export default function JastipApp() {
  const [role, setRole, roleHydrated] = usePersistedState<Role>("zeem-role", "guest");
  const [profile, setProfile, profileHydrated] = usePersistedState<Profile>("zeem-profile", DEFAULT_PROFILE);
  const [products, setProducts, productsHydrated] = usePersistedState<Product[]>("zeem-products", PRODUCTS);
  const [cart, setCart] = usePersistedState<CartLine[]>("zeem-cart", []);
  const [wishlist, setWishlist] = usePersistedState<string[]>("zeem-wishlist", []);
  const [orders, setOrders] = usePersistedState<Order[]>("zeem-orders", []);
  const [shippingRates, setShippingRates] = usePersistedState<ShippingRates>("zeem-rates", SHIPPING_RATES);
  const [adminAccounts, setAdminAccounts] = usePersistedState<AdminAccount[]>("zeem-admin-accounts", ADMIN_ACCOUNTS);
  const [activeAdminId, setActiveAdminId] = usePersistedState("zeem-active-admin", ADMIN_ACCOUNTS[0].id);
  const [onboardingDone, setOnboardingDone, onboardingHydrated] = usePersistedState("zeem-onboarding-done", false);
  const [guideDone, setGuideDone] = usePersistedState("zeem-guide-done", false);

  const [screen, setScreen] = useState<Screen>("welcome");
  const [onboardingIndex, setOnboardingIndex] = useState(0);
  const [guideIndex, setGuideIndex] = useState(0);
  const [selectedProductId, setSelectedProductId] = useState<string>(PRODUCTS[0].id);
  const [productImageIndex, setProductImageIndex] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortMode, setSortMode] = useState("featured");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [showFilter, setShowFilter] = useState(false);
  const [showAddress, setShowAddress] = useState(false);
  const [showEditor, setShowEditor] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editorImages, setEditorImages] = useState<string[]>([]);
  const [adminTab, setAdminTab] = useState<AdminTab>("products");
  const [manageProducts, setManageProducts] = useState(false);
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);
  const [manageOrders, setManageOrders] = useState(false);
  const [selectedOrderIds, setSelectedOrderIds] = useState<string[]>([]);
  const [manageShipping, setManageShipping] = useState(false);
  const [selectedShippingRegions, setSelectedShippingRegions] = useState<string[]>([]);
  const [bulkProductStatus, setBulkProductStatus] = useState<ProductAvailability>("ready");
  const [bulkOrderStatus, setBulkOrderStatus] = useState<OrderStatus>("accepted");
  const [deleteTarget, setDeleteTarget] = useState<DeleteTarget | null>(null);
  const [deleteStep, setDeleteStep] = useState<"confirm" | "pin">("confirm");
  const [deletePin, setDeletePin] = useState("");
  const [toast, setToast] = useState("");
  const [reviewingOrder, setReviewingOrder] = useState<Order | null>(null);
  const [reviewNote, setReviewNote] = useState("");
  const [reviewPhoto, setReviewPhoto] = useState<string | undefined>();
  const [lastFee, setLastFee] = usePersistedState("zeem-last-fee", 20000);
  const [lastShippingOverride, setLastShippingOverride] = usePersistedState<number | undefined>("zeem-last-shipping", undefined);
  const [featuredSlot] = useState(halfDaySlot);
  const initialRouteDone = useRef(false);
  const productSwipeStart = useRef<{ x: number; y: number } | null>(null);

  const flash = useCallback((message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(""), 2400);
  }, []);

  const navigate = useCallback((next: Screen, state?: { productId?: string }) => {
    if (state?.productId) {
      setSelectedProductId(state.productId);
      setProductImageIndex(0);
    }
    setScreen(next);
    window.history.pushState({ screen: next, ...state }, "", state?.productId ? `?product=${state.productId}` : window.location.pathname);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  useEffect(() => {
    const onPopState = (event: PopStateEvent) => {
      const next = event.state?.screen as Screen | undefined;
      if (event.state?.productId) setSelectedProductId(event.state.productId);
      if (next) setScreen(next);
      else setScreen(role === "admin" ? "admin" : role === "consumer" ? "home" : "welcome");
    };
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, [role]);

  useEffect(() => {
    if (!roleHydrated || !profileHydrated || !productsHydrated || !onboardingHydrated || initialRouteDone.current) return;
    initialRouteDone.current = true;
    const productFromUrl = new URLSearchParams(window.location.search).get("product");
    if (productFromUrl && products.some((p) => p.id === productFromUrl)) {
      // Initial routing is synchronized from the browser URL and local session.
      /* eslint-disable react-hooks/set-state-in-effect */
      setSelectedProductId(productFromUrl);
      setScreen(role === "guest" ? "login" : "product");
      /* eslint-enable react-hooks/set-state-in-effect */
      return;
    }
    if (role === "admin") setScreen("admin");
    else if (role === "consumer") setScreen(profile.nickname ? "home" : "profileSetup");
    else if (onboardingDone) setScreen("login");
  }, [onboardingDone, onboardingHydrated, products, productsHydrated, profile.nickname, profileHydrated, role, roleHydrated]);

  const visibleProducts = useMemo(() => {
    const lower = searchQuery.trim().toLowerCase();
    const min = Number(minPrice) || 0;
    const max = Number(maxPrice) || Number.POSITIVE_INFINITY;
    const list = products.filter((product) => {
      const totalPrice = product.price + product.fee;
      return (
        (!lower || `${product.title} ${product.note} ${product.category}`.toLowerCase().includes(lower)) &&
        totalPrice >= min &&
        totalPrice <= max
      );
    });
    return [...list].sort((a, b) => {
      if (isProductDisabled(a) !== isProductDisabled(b)) return isProductDisabled(a) ? 1 : -1;
      if (sortMode === "newest") return b.createdAt - a.createdAt;
      if (sortMode === "most") return b.sold - a.sold;
      if (sortMode === "low") return a.price + a.fee - (b.price + b.fee);
      if (sortMode === "high") return b.price + b.fee - (a.price + a.fee);
      if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
      return a.order - b.order;
    });
  }, [maxPrice, minPrice, products, searchQuery, sortMode]);

  const selectedProduct = products.find((product) => product.id === selectedProductId) ?? products[0];
  const cartCount = cart.reduce((total, line) => total + line.qty, 0);
  const cartDetails = cart
    .map((line) => ({ ...line, product: products.find((product) => product.id === line.productId) }))
    .filter((line): line is CartLine & { product: Product } => Boolean(line.product));
  const itemTotal = cartDetails.reduce((total, line) => total + line.product.price * line.qty, 0);
  const feeTotal = cartDetails.reduce((total, line) => total + line.product.fee * line.qty, 0);
  const customShipping = cartDetails.find((line) => line.product.shippingOverride)?.product.shippingOverride;
  const shipping = customShipping ?? shippingRates[profile.region] ?? Object.values(shippingRates)[0] ?? 0;
  const grandTotal = itemTotal + feeTotal + shipping;
  const completeOrders = orders.filter((order) => order.status === "received").length;
  const stamps = Math.min(completeOrders, 5);
  const consumerOrders = orders.filter((order) => order.status !== "canceled");
  const acceptedUnread = consumerOrders.filter((order) => order.status === "accepted").length;
  const safeAdminAccounts = adminAccounts.length ? adminAccounts : ADMIN_ACCOUNTS;
  const activeAdmin = safeAdminAccounts.find((account) => account.id === activeAdminId) ?? safeAdminAccounts[0];
  const featuredAdmin = safeAdminAccounts[(featuredSlot * 7 + 1) % safeAdminAccounts.length];
  const adminProducts = [...products].sort((a, b) => {
    if (isProductDisabled(a) !== isProductDisabled(b)) return isProductDisabled(a) ? 1 : -1;
    return a.order - b.order;
  });
  const adminTitle = adminTab === "products"
    ? "Kelola produk"
    : adminTab === "orders"
      ? "Kelola pesanan"
      : adminTab === "shipping"
        ? "Estimasi pengiriman"
        : "Profil admin";

  const addToCart = (productId: string) => {
    const product = products.find((item) => item.id === productId);
    if (!product || isProductDisabled(product)) return;
    setCart((current) => {
      const found = current.find((line) => line.productId === productId);
      if (found) return current.map((line) => (line.productId === productId ? { ...line, qty: Math.min(line.qty + 1, product.stock) } : line));
      return [...current, { productId, qty: 1 }];
    });
    flash("Masuk keranjang ✦");
  };

  const shiftProductImage = (direction: -1 | 1) => {
    const imageCount = selectedProduct?.images.length ?? 0;
    if (imageCount < 2) return;
    setProductImageIndex((current) => (current + direction + imageCount) % imageCount);
  };

  const startProductSwipe = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.pointerType === "mouse" || (selectedProduct?.images.length ?? 0) < 2) return;
    productSwipeStart.current = { x: event.clientX, y: event.clientY };
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const endProductSwipe = (event: React.PointerEvent<HTMLDivElement>) => {
    const start = productSwipeStart.current;
    productSwipeStart.current = null;
    if (!start) return;
    const distanceX = event.clientX - start.x;
    const distanceY = event.clientY - start.y;
    if (Math.abs(distanceX) < 42 || Math.abs(distanceX) <= Math.abs(distanceY)) return;
    shiftProductImage(distanceX < 0 ? 1 : -1);
  };

  const changeQty = (productId: string, delta: number) => {
    const stock = products.find((product) => product.id === productId)?.stock ?? 1;
    setCart((current) =>
      current
        .map((line) => (line.productId === productId ? { ...line, qty: Math.min(stock, line.qty + delta) } : line))
        .filter((line) => line.qty > 0),
    );
  };

  const toggleWishlist = (productId: string) => {
    setWishlist((current) => (current.includes(productId) ? current.filter((id) => id !== productId) : [...current, productId]));
    flash(wishlist.includes(productId) ? "Dihapus dari wishlist" : "Disimpan ke wishlist");
  };

  const shareProduct = async (product: Product) => {
    const url = `${window.location.origin}${window.location.pathname}?product=${product.id}`;
    try {
      if (navigator.share) await navigator.share({ title: `${product.title} — Jastip di Zeem`, text: `Cek ${product.title} di Jastip di Zeem`, url });
      else {
        await navigator.clipboard.writeText(url);
        flash("Link produk disalin");
      }
    } catch {
      // Pengguna membatalkan share sheet.
    }
  };

  const sendToWhatsApp = () => {
    if (!profile.nickname || !profile.phone?.trim() || !profile.address.trim()) {
      setShowAddress(true);
      flash("Lengkapi nama, nomor WhatsApp, dan alamat dulu ya");
      return;
    }
    if (!cartDetails.length) return;
    const createdAt = timestamp();
    const id = `JZ-${createdAt.toString().slice(-6)}`;
    const order: Order = {
      id,
      createdAt,
      customerName: profile.nickname,
      customerPhone: profile.phone,
      address: profile.address,
      region: profile.region,
      lines: cartDetails.map((line) => ({
        productId: line.product.id,
        title: line.product.title,
        qty: line.qty,
        price: line.product.price,
        fee: line.product.fee,
      })),
      itemTotal,
      feeTotal,
      shipping,
      total: grandTotal,
      status: "payment",
    };
    const productText = order.lines.map((line, index) => `${index + 1}. ${line.title} — ${line.qty}x`).join("\n");
    const message = [
      "Halo tim ZeeMy! Aku mau jastip ya 🎀",
      "",
      `Kode: ${id}`,
      `Nama: ${profile.nickname}`,
      `No. WhatsApp: ${profile.phone}`,
      `Alamat: ${profile.address}`,
      `Wilayah: ${profile.region}`,
      "",
      "Produk:",
      productText,
      "",
      `Total barang: ${formatRupiah(itemTotal)}`,
      `Fee jastip: ${formatRupiah(feeTotal)}`,
      `Estimasi kirim: ${formatRupiah(shipping)}`,
      `Estimasi total: ${formatRupiah(grandTotal)}`,
      "",
      "Mohon konfirmasi stok dan pembayarannya ya. Terima kasih!",
    ].join("\n");
    window.open(`https://wa.me/${ADMIN_WHATSAPP}?text=${encodeURIComponent(message)}`, "_blank", "noopener,noreferrer");
    setOrders((current) => [order, ...current]);
    setCart([]);
    navigate("orders");
    flash("Pesanan dibuat dan keranjang dikosongkan");
  };

  const loginConsumer = () => {
    setRole("consumer");
    navigate(guideDone ? (profile.nickname ? "home" : "profileSetup") : "guide");
  };

  const loginAdmin = () => {
    setRole("admin");
    navigate("admin");
  };

  const logout = () => {
    setRole("guest");
    setScreen("login");
    window.history.pushState({ screen: "login" }, "", window.location.pathname);
  };

  const saveProfile = () => {
    if (!profile.nickname.trim()) {
      flash("Nickname belum diisi");
      return;
    }
    if (!profile.phone?.trim()) {
      flash("Nomor WhatsApp belum diisi");
      return;
    }
    setGuideDone(true);
    setShowAddress(false);
    navigate("home");
    flash("Profil kamu siap ✦");
  };

  const updateOrderStatus = (id: string, status: OrderStatus) => {
    setOrders((current) => current.map((order) => (order.id === id ? { ...order, status, handledBy: activeAdmin } : order)));
    flash(status === "canceled" ? "Pesanan dibatalkan" : `Status: ${STATUS_META[status].label}`);
  };

  const toggleSelected = (id: string, current: string[], setter: React.Dispatch<React.SetStateAction<string[]>>) => {
    setter(current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);
  };

  const applyProductStatus = (ids: string[], availability: ProductAvailability) => {
    if (!ids.length) return;
    setProducts((current) => current.map((product) => ids.includes(product.id)
      ? { ...product, availability, soldOut: availability === "sold_out", stock: availability === "sold_out" ? 0 : Math.max(product.stock, 1) }
      : product));
    setSelectedProductIds([]);
    flash(`${ids.length} produk diubah ke ${AVAILABILITY_META[availability].label}`);
  };

  const applyOrderStatus = (ids: string[], status: OrderStatus) => {
    if (!ids.length) return;
    setOrders((current) => current.map((order) => ids.includes(order.id) ? { ...order, status, handledBy: activeAdmin } : order));
    setSelectedOrderIds([]);
    flash(`${ids.length} pesanan diperbarui oleh ${activeAdmin.name}`);
  };

  const requestDelete = (target: DeleteTarget) => {
    if (!target.ids.length) {
      flash("Pilih data yang mau dihapus dulu");
      return;
    }
    setDeleteTarget(target);
    setDeleteStep("confirm");
    setDeletePin("");
  };

  const performProtectedDelete = () => {
    if (!deleteTarget || deletePin !== "000000") {
      flash("PIN salah");
      return;
    }
    if (deleteTarget.kind === "products") {
      setProducts((current) => current.filter((product) => !deleteTarget.ids.includes(product.id)));
      setCart((current) => current.filter((line) => !deleteTarget.ids.includes(line.productId)));
      setWishlist((current) => current.filter((id) => !deleteTarget.ids.includes(id)));
      setSelectedProductIds([]);
    } else if (deleteTarget.kind === "orders") {
      setOrders((current) => current.filter((order) => !deleteTarget.ids.includes(order.id)));
      setSelectedOrderIds([]);
    } else {
      setShippingRates((current) => Object.fromEntries(Object.entries(current).filter(([region]) => !deleteTarget.ids.includes(region))));
      setSelectedShippingRegions([]);
    }
    flash(`${deleteTarget.ids.length} data berhasil dihapus`);
    setDeleteTarget(null);
    setDeletePin("");
  };

  const openEditor = (product?: Product) => {
    setEditingProduct(product ?? null);
    setEditorImages(product?.images ?? []);
    setShowEditor(true);
  };

  const saveProduct = (form: HTMLFormElement) => {
    const values = new FormData(form);
    const title = String(values.get("title") ?? "").trim();
    if (!title) {
      flash("Judul produk wajib diisi");
      return;
    }
    const fee = Number(values.get("fee")) || lastFee;
    const shippingOverrideRaw = String(values.get("shippingOverride") ?? "");
    const shippingOverride = shippingOverrideRaw ? Number(shippingOverrideRaw) : undefined;
    setLastFee(fee);
    setLastShippingOverride(shippingOverride);
    const record: Product = {
      id: editingProduct?.id ?? `product-${timestamp()}`,
      title,
      note: String(values.get("note") ?? ""),
      price: Number(values.get("price")) || 0,
      fee,
      stock: Number(values.get("stock")) || 0,
      shippingOverride,
      images: editorImages.slice(0, 5),
      visual: editingProduct?.visual ?? "🎁",
      category: String(values.get("category") ?? "Pilihan ZeeMy"),
      sold: editingProduct?.sold ?? 0,
      createdAt: editingProduct?.createdAt ?? timestamp(),
      pinned: editingProduct?.pinned ?? false,
      availability: (String(values.get("availability") ?? productAvailability(editingProduct ?? PRODUCTS[0])) as ProductAvailability),
      soldOut: String(values.get("availability") ?? "ready") === "sold_out",
      order: editingProduct?.order ?? products.length,
    };
    setProducts((current) => (editingProduct ? current.map((product) => (product.id === record.id ? record : product)) : [record, ...current]));
    setShowEditor(false);
    flash(editingProduct ? "Produk diperbarui" : "Produk ditambahkan");
  };

  const moveProduct = (id: string, direction: -1 | 1) => {
    const ordered = [...products].sort((a, b) => a.order - b.order);
    const index = ordered.findIndex((product) => product.id === id);
    const targetIndex = index + direction;
    if (index < 0 || targetIndex < 0 || targetIndex >= ordered.length) return;
    [ordered[index], ordered[targetIndex]] = [ordered[targetIndex], ordered[index]];
    setProducts(ordered.map((product, order) => ({ ...product, order })));
  };

  const submitReview = () => {
    if (!reviewingOrder || !reviewNote.trim()) {
      flash("Tulis review singkat dulu ya");
      return;
    }
    setOrders((current) =>
      current.map((order) =>
        order.id === reviewingOrder.id
          ? { ...order, review: { note: reviewNote.trim(), photo: reviewPhoto, createdAt: timestamp() } }
          : order,
      ),
    );
    setReviewingOrder(null);
    setReviewNote("");
    setReviewPhoto(undefined);
    flash("Review berhasil dikirim ✦");
  };

  if (screen === "welcome") {
    const slide = ONBOARDING[onboardingIndex];
    return (
      <main className="welcome-shell">
        <section className="welcome-copy">
          <Logo />
          <div className="welcome-text" key={onboardingIndex}>
            <span className="eyebrow"><Sparkles size={15} /> {slide.eyebrow}</span>
            <h1>{slide.title}</h1>
            <p>{slide.copy}</p>
          </div>
          <div className="welcome-dots" aria-label="Progress onboarding">
            {ONBOARDING.map((_, index) => <button key={index} className={index === onboardingIndex ? "active" : ""} onClick={() => setOnboardingIndex(index)} aria-label={`Slide ${index + 1}`} />)}
          </div>
          <div className="welcome-actions">
            {onboardingIndex > 0 && <button className="button ghost" onClick={() => setOnboardingIndex((current) => current - 1)}><ChevronLeft size={19} /> Kembali</button>}
            <button
              className="button primary grow"
              onClick={() => {
                if (onboardingIndex < ONBOARDING.length - 1) setOnboardingIndex((current) => current + 1);
                else {
                  setOnboardingDone(true);
                  navigate("login");
                }
              }}
            >
              {onboardingIndex === ONBOARDING.length - 1 ? "Mulai sekarang" : "Lanjut"}<ChevronRight size={19} />
            </button>
          </div>
        </section>
        <section className="welcome-motion" aria-hidden="true">
          <div className={`motion-phone art-${slide.art}`}>
            <div className="motion-notch" />
            <div className="motion-header"><Menu size={18} /><span>Jastip di Zeem</span><Heart size={18} /></div>
            <div className="motion-search"><Search size={16} /> Cari titipan lucu...</div>
            <div className="motion-hero"><span>{slide.art === "chat" ? "💬" : slide.art === "total" ? "🧾" : "🎀"}</span><b>{slide.art === "chat" ? "Siap lanjut ke ZeeMy" : slide.art === "total" ? "Totalnya sudah jelas" : "Miniso Bandung"}</b></div>
            <div className="motion-grid"><i>🐻</i><i>🧋</i><i>👜</i><i>🌸</i></div>
            <div className="motion-cta">{slide.art === "chat" ? "Buka WhatsApp" : slide.art === "total" ? "Lihat ringkasan" : "Pilih produk"}<ChevronRight size={16} /></div>
          </div>
          <PixelAvatar index={1} size="lg" />
          <span className="floating-heart"><Heart fill="currentColor" size={28} /></span>
        </section>
      </main>
    );
  }

  if (screen === "login") {
    return (
      <main className="auth-shell">
        <section className="auth-card">
          <Logo />
          <div>
            <span className="eyebrow"><Sparkles size={15} /> Welcome, bestie</span>
            <h1>Masuk dulu, titipannya sudah menunggu.</h1>
            <p>Untuk versi ini login masih preview lokal. Nanti tombol Google yang sama tinggal disambungkan ke Supabase.</p>
          </div>
          <button className="button google" onClick={loginConsumer}><GoogleMark /> Masuk dengan Google</button>
          <div className="auth-divider"><span>area pengelola</span></div>
          <button className="button secondary" onClick={loginAdmin}><ShieldCheck size={18} /> Login Admin</button>
          <p className="tiny-copy">Dengan melanjutkan, kamu menyetujui penggunaan data lokal untuk mencoba aplikasi.</p>
        </section>
        <section className="auth-showcase" aria-hidden="true">
          <div className="showcase-glow" />
          <div className="showcase-card card-one"><span>Pesanan aktif</span><b>2 titipan sedang diproses</b><Truck size={20} /></div>
          <div className="showcase-card card-two"><span>New drop</span><b>Sakura Collection</b><PixelAvatar index={1} size="sm" /></div>
          <div className="showcase-card card-three"><span>Membership</span><b>3 / 5 stamp</b><div className="mini-progress"><i /></div></div>
          <PixelAvatar index={3} size="lg" />
        </section>
      </main>
    );
  }

  if (screen === "guide") {
    const item = GUIDE[guideIndex];
    const GuideIcon = item.icon;
    return (
      <main className="guide-shell">
        <button className="skip-button" onClick={() => { setGuideDone(true); navigate(profile.nickname ? "home" : "profileSetup"); }}>Lewati</button>
        <div className="guide-art">
          <span className="guide-icon"><GuideIcon size={38} /></span>
          <div className="guide-pointer"><span>tap</span></div>
        </div>
        <section className="guide-copy" key={guideIndex}>
          <span className="step-label">Petunjuk {guideIndex + 1} dari {GUIDE.length}</span>
          <h1>{item.title}</h1>
          <p>{item.copy}</p>
        </section>
        <div className="guide-dots">{GUIDE.map((_, index) => <i key={index} className={index === guideIndex ? "active" : ""} />)}</div>
        <button className="button primary wide" onClick={() => {
          if (guideIndex < GUIDE.length - 1) setGuideIndex((current) => current + 1);
          else { setGuideDone(true); navigate(profile.nickname ? "home" : "profileSetup"); }
        }}>{guideIndex === GUIDE.length - 1 ? "Buat profilku" : "Mengerti, lanjut"}<ChevronRight size={19} /></button>
      </main>
    );
  }

  if (screen === "profileSetup") {
    return (
      <main className="profile-setup-shell">
        <section className="profile-setup-card">
          <div className="setup-top"><Logo compact /><span>1 menit aja</span></div>
          <h1>Bikin profil yang terasa kamu.</h1>
          <p>Nickname tampil di ringkasan pesanan. Pilih icon pixel atau upload foto sendiri.</p>
          <div className="avatar-grid">
            {Array.from({ length: 9 }, (_, index) => (
              <button key={index} className={profile.avatarIndex === index && !profile.avatarUpload ? "selected" : ""} onClick={() => setProfile((current) => ({ ...current, avatarIndex: index, avatarUpload: undefined }))}>
                <PixelAvatar index={index} />
                {profile.avatarIndex === index && !profile.avatarUpload && <Check size={15} />}
              </button>
            ))}
          </div>
          <label className="upload-avatar"><Camera size={18} /> Upload foto sendiri<input type="file" accept="image/*" onChange={async (event) => {
            const [image] = await filesToDataUrls(event.target.files, 1, 1_000_000);
            if (image) setProfile((current) => ({ ...current, avatarUpload: image }));
            else flash("Foto maksimal 1 MB ya");
          }} /></label>
          <label className="field"><span>Nickname</span><input value={profile.nickname} maxLength={24} placeholder="Contoh: ZeeMy" onChange={(event) => setProfile((current) => ({ ...current, nickname: event.target.value }))} /></label>
          <label className="field"><span>Nomor WhatsApp</span><input type="tel" inputMode="tel" value={profile.phone ?? ""} maxLength={16} placeholder="Contoh: 0812 3456 7890" onChange={(event) => setProfile((current) => ({ ...current, phone: event.target.value.replace(/[^0-9+ ]/g, "") }))} /></label>
          <button className="button primary wide" onClick={saveProfile}>Simpan dan masuk <ChevronRight size={19} /></button>
        </section>
      </main>
    );
  }

  const isConsumerScreen = ["home", "search", "product", "cart", "orders", "wishlist", "profile"].includes(screen);

  return (
    <main className={`app-shell ${role === "admin" ? "admin-mode" : ""}`}>
      {toast && <div className="toast"><CheckCircle2 size={17} /> {toast}</div>}

      {role === "consumer" && isConsumerScreen && (
        <header className="app-header">
          <button className="header-profile" onClick={() => navigate("profile")}><PixelAvatar index={profile.avatarIndex} image={profile.avatarUpload} size="sm" /><span><small>Halo,</small><b>{profile.nickname || "Bestie"}</b></span></button>
          <Logo compact />
          <button className="icon-button notification-button" onClick={() => navigate("orders")} aria-label="Notifikasi"><Bell size={20} />{acceptedUnread > 0 && <i>{acceptedUnread}</i>}</button>
        </header>
      )}

      {screen === "home" && (
        <div className="screen home-screen">
          <section className="home-greeting"><span className="eyebrow"><Sparkles size={14} /> Pilihan terbaik {featuredAdmin.name} hari ini</span><h1>Mau titip apa<br />hari ini?</h1></section>
          <button className="search-trigger" onClick={() => navigate("search")}><Search size={18} /><span>Cari produk jastip...</span><SlidersHorizontal size={18} /></button>
          <section className="event-card">
            <div className="event-copy"><span className="live-pill"><i /> Jastip aktif</span><h2>Miniso Bandung</h2><p>Temuan lucu yang bisa dititip sampai <b>12 Agustus</b>.</p><div className="event-stats"><span><Package size={15} /> {products.filter((p) => !isProductDisabled(p)).length} tersedia</span><span><Clock3 size={15} /> Tutup 21.00</span></div></div>
            <div className="event-art"><span>🐻</span><span>🎀</span><span>🧋</span></div>
            <button onClick={() => { setSearchQuery(""); navigate("search"); }}>Lihat semua produk <ChevronRight size={17} /></button>
          </section>
          <section className="section-block">
            <div className="section-heading"><div><span className="eyebrow">Favorit minggu ini</span><h2>Lagi banyak dititip</h2></div><button onClick={() => { setSortMode("most"); navigate("search"); }}>Lihat semua</button></div>
            <div className="horizontal-products">
              {[...products].filter((p) => !isProductDisabled(p)).sort((a, b) => b.sold - a.sold).slice(0, 4).map((product) => (
                <ProductCard key={product.id} product={product} wished={wishlist.includes(product.id)} onOpen={() => navigate("product", { productId: product.id })} onWish={() => toggleWishlist(product.id)} onAdd={() => addToCart(product.id)} />
              ))}
            </div>
          </section>
          <section className="membership-card">
            <div><span className="eyebrow"><Gift size={14} /> Membership</span><h2>{stamps === 5 ? "Sticker pack sudah terbuka!" : `${5 - stamps} stamp lagi menuju hadiah`}</h2><p>Setiap pesanan selesai = 1 stamp.</p></div>
            <PixelAvatar index={3} size="lg" />
            <div className="stamp-row">{Array.from({ length: 5 }, (_, index) => <i key={index} className={index < stamps ? "filled" : ""}>{index < stamps ? <Check size={14} /> : index + 1}</i>)}</div>
          </section>
          <section className="section-block upcoming"><div className="section-heading"><div><span className="eyebrow">Segera hadir</span><h2>Jastip berikutnya</h2></div></div><div className="upcoming-grid"><article><span>🧴</span><b>K-Beauty Store</b><small>Coming soon</small></article><article><span>✏️</span><b>Stationery Hunt</b><small>Coming soon</small></article></div></section>
        </div>
      )}

      {screen === "search" && (
        <div className="screen search-screen">
          <PageTitle title="Jelajahi produk" onBack={() => window.history.back()} right={<button className="icon-button" onClick={() => setShowFilter(true)}><SlidersHorizontal size={19} /></button>} />
          <div className="search-input"><Search size={18} /><input autoFocus value={searchQuery} placeholder="Cari nama atau kategori..." onChange={(event) => setSearchQuery(event.target.value)} />{searchQuery && <button onClick={() => setSearchQuery("")}><X size={17} /></button>}</div>
          <div className="sort-chips">
            {[{ id: "featured", label: "Pilihan" }, { id: "newest", label: "Terbaru" }, { id: "most", label: "Terlaris" }, { id: "low", label: "Harga terendah" }].map((item) => <button key={item.id} className={sortMode === item.id ? "active" : ""} onClick={() => setSortMode(item.id)}>{item.label}</button>)}
          </div>
          <div className="results-line"><span>{visibleProducts.length} produk</span>{(minPrice || maxPrice) && <button onClick={() => { setMinPrice(""); setMaxPrice(""); }}>Reset harga</button>}</div>
          {visibleProducts.length ? <div className="product-grid">{visibleProducts.map((product) => <ProductCard key={product.id} product={product} wished={wishlist.includes(product.id)} onOpen={() => navigate("product", { productId: product.id })} onWish={() => toggleWishlist(product.id)} onAdd={() => addToCart(product.id)} />)}</div> : <EmptyState icon={Search} title="Belum ketemu" copy="Coba kata kunci atau rentang harga lain." />}
        </div>
      )}

      {screen === "product" && selectedProduct && (
        <div className="screen product-detail-screen">
          <div className="product-detail-hero" onPointerDown={startProductSwipe} onPointerUp={endProductSwipe} onPointerCancel={() => { productSwipeStart.current = null; }}>
            <ProductVisual key={`${selectedProduct.id}-${productImageIndex}`} product={selectedProduct} index={productImageIndex} />
            <button className="floating-control back" onClick={() => window.history.back()}><ArrowLeft size={20} /></button>
            <div className="floating-actions"><button className="floating-control" onClick={() => shareProduct(selectedProduct)}><Share2 size={19} /></button><button className={`floating-control ${wishlist.includes(selectedProduct.id) ? "active" : ""}`} onClick={() => toggleWishlist(selectedProduct.id)}><Heart size={19} fill={wishlist.includes(selectedProduct.id) ? "currentColor" : "none"} /></button></div>
            {(selectedProduct.images.length || 1) > 1 && <><button className="carousel-arrow left" aria-label="Foto sebelumnya" onClick={() => shiftProductImage(-1)}><ChevronLeft size={20} /></button><button className="carousel-arrow right" aria-label="Foto berikutnya" onClick={() => shiftProductImage(1)}><ChevronRight size={20} /></button><div className="carousel-dots" aria-label={`${productImageIndex + 1} dari ${selectedProduct.images.length} foto`}>{selectedProduct.images.map((_, index) => <button key={index} className={index === productImageIndex ? "active" : ""} aria-label={`Lihat foto ${index + 1}`} onClick={() => setProductImageIndex(index)} />)}</div></>}
            {selectedProduct.images.length > 1 && <div className="image-count">{productImageIndex + 1}/{selectedProduct.images.length}</div>}
            {isProductDisabled(selectedProduct) && <div className="soldout-hero"><span>{AVAILABILITY_META[productAvailability(selectedProduct)].short}</span></div>}
          </div>
          <section className="product-detail-copy">
            <span className="category-pill">{selectedProduct.category}</span>
            <h1>{selectedProduct.title}</h1>
            <p className="product-note">{selectedProduct.note}</p>
            <div className="price-stack"><strong>{formatRupiah(selectedProduct.price)}</strong><span>Fee jastip {formatRupiah(selectedProduct.fee)}</span></div>
            <div className="product-info-row"><span><Package size={18} /><b>{isProductDisabled(selectedProduct) ? AVAILABILITY_META[productAvailability(selectedProduct)].label : `${selectedProduct.stock} stok tersedia`}</b></span><span><Star size={18} /><b>{selectedProduct.sold}x dititip</b></span></div>
            <div className="service-note"><Sparkles size={18} /><div><b>Belanja lebih tenang</b><p>Stok dan warna final akan dikonfirmasi tim ZeeMy lewat WhatsApp sebelum pembayaran.</p></div></div>
          </section>
          <div className="sticky-product-action"><button className={`save-square ${wishlist.includes(selectedProduct.id) ? "active" : ""}`} onClick={() => toggleWishlist(selectedProduct.id)}><Heart size={21} fill={wishlist.includes(selectedProduct.id) ? "currentColor" : "none"} /></button><button className="button primary grow" disabled={isProductDisabled(selectedProduct)} onClick={() => addToCart(selectedProduct.id)}>{isProductDisabled(selectedProduct) ? AVAILABILITY_META[productAvailability(selectedProduct)].label : productAvailability(selectedProduct) === "preorder" ? "Tambah pre order" : productAvailability(selectedProduct) === "po_open" ? "Ikut PO" : "Tambah ke keranjang"}<ShoppingCart size={19} /></button></div>
        </div>
      )}

      {screen === "cart" && (
        <div className="screen cart-screen">
          <PageTitle title="Keranjang" onBack={() => window.history.back()} right={cart.length ? <button className="text-button danger" onClick={() => setCart([])}>Kosongkan</button> : undefined} />
          {cartDetails.length ? <>
            <div className="cart-list">{cartDetails.map((line) => <article className="cart-line" key={line.productId}><ProductVisual product={line.product} /><div className="cart-line-copy"><h3>{line.product.title}</h3><p>{formatRupiah(line.product.price)} <span>+ fee {formatRupiah(line.product.fee)}</span></p><div className="qty-control"><button onClick={() => changeQty(line.productId, -1)}><Minus size={15} /></button><b>{line.qty}</b><button onClick={() => changeQty(line.productId, 1)}><Plus size={15} /></button></div></div></article>)}</div>
            <button className="address-card" onClick={() => setShowAddress(true)}><span className="address-icon"><MapPin size={20} /></span><span><small>Alamat pengiriman</small><b>{profile.address || "Belum ada alamat"}</b><em>{profile.region}</em></span><Pencil size={17} /></button>
            <section className="summary-card"><h2>Ringkasan pesanan</h2><div><span>Total barang</span><b>{formatRupiah(itemTotal)}</b></div><div><span>Fee jastip</span><b>{formatRupiah(feeTotal)}</b></div><div><span>Estimasi pengiriman</span><b>{formatRupiah(shipping)}</b></div><div className="summary-total"><span>Estimasi total</span><strong>{formatRupiah(grandTotal)}</strong></div><p>Nominal final dikonfirmasi tim ZeeMy sebelum pembayaran.</p></section>
            <button className="button whatsapp wide" onClick={sendToWhatsApp}><MessageCircle size={21} /> Lanjut via WhatsApp</button>
          </> : <EmptyState icon={ShoppingBag} title="Keranjang masih kosong" copy="Pilih titipan lucu dulu, nanti semuanya terkumpul di sini." action={<button className="button primary" onClick={() => navigate("search")}>Cari produk</button>} />}
        </div>
      )}

      {screen === "wishlist" && (
        <div className="screen wishlist-screen">
          <PageTitle title="Wishlist" onBack={() => window.history.back()} />
          {wishlist.length ? <div className="product-grid">{products.filter((product) => wishlist.includes(product.id)).map((product) => <ProductCard key={product.id} product={product} wished onOpen={() => navigate("product", { productId: product.id })} onWish={() => toggleWishlist(product.id)} onAdd={() => addToCart(product.id)} />)}</div> : <EmptyState icon={Heart} title="Belum ada yang disimpan" copy="Tekan icon hati di produk yang ingin kamu ingat." action={<button className="button primary" onClick={() => navigate("search")}>Jelajahi produk</button>} />}
        </div>
      )}

      {screen === "orders" && (
        <div className="screen orders-screen">
          <PageTitle title="Pesanan" onBack={() => window.history.back()} />
          {consumerOrders.length ? <div className="order-list">{consumerOrders.map((order) => <OrderCard key={order.id} order={order} admin={false} onStatus={() => undefined} onReview={() => { setReviewingOrder(order); setReviewNote(""); setReviewPhoto(undefined); }} />)}</div> : <EmptyState icon={Package} title="Belum ada pesanan" copy="Pesanan yang sudah dilanjutkan ke WhatsApp akan muncul di sini." action={<button className="button primary" onClick={() => navigate("search")}>Mulai jastip</button>} />}
        </div>
      )}

      {screen === "profile" && (
        <div className="screen profile-screen">
          <PageTitle title="Profil" onBack={() => window.history.back()} />
          <section className="profile-hero"><PixelAvatar index={profile.avatarIndex} image={profile.avatarUpload} size="lg" /><div><h1>{profile.nickname}</h1><span>Member Jastip di Zeem</span></div><button onClick={() => navigate("profileSetup")}><Pencil size={17} /></button></section>
          <section className="membership-panel"><div className="membership-title"><span><Gift size={18} /></span><div><small>Membership progress</small><h2>{stamps} dari 5 stamp</h2></div></div><div className="progress-track"><i style={{ width: `${(stamps / 5) * 100}%` }} /></div><p>{stamps === 5 ? "Sticker pack WhatsApp sudah siap diklaim ke tim ZeeMy." : "Selesaikan pesanan untuk membuka sticker pack WhatsApp."}</p></section>
          <div className="settings-list"><button onClick={() => setShowAddress(true)}><span><MapPin size={19} /></span><div><b>Alamat pengiriman</b><small>{profile.address || "Belum diatur"}</small></div><ChevronRight size={18} /></button><button onClick={() => navigate("wishlist")}><span><Heart size={19} /></span><div><b>Wishlist</b><small>{wishlist.length} produk disimpan</small></div><ChevronRight size={18} /></button><button onClick={() => navigate("orders")}><span><Package size={19} /></span><div><b>Riwayat pesanan</b><small>{consumerOrders.length} pesanan</small></div><ChevronRight size={18} /></button></div>
          <button className="button ghost wide logout-button" onClick={logout}><LogOut size={18} /> Log out</button>
        </div>
      )}

      {screen === "admin" && (
        <div className="admin-shell">
          <aside className="admin-sidebar">
            <Logo compact />
            <nav>
              <button className={adminTab === "products" ? "active" : ""} onClick={() => setAdminTab("products")}><Store size={19} /> Produk</button>
              <button className={adminTab === "orders" ? "active" : ""} onClick={() => setAdminTab("orders")}><Package size={19} /> Pesanan{orders.length > 0 && <i>{orders.length}</i>}</button>
              <button className={adminTab === "shipping" ? "active" : ""} onClick={() => setAdminTab("shipping")}><Truck size={19} /> Ongkir</button>
              <button className={adminTab === "settings" ? "active" : ""} onClick={() => setAdminTab("settings")}><Users size={19} /> Profil admin</button>
            </nav>
            <div className="admin-user"><PixelAvatar index={activeAdmin.avatarIndex} size="sm" /><span><small>Admin aktif</small><b>{activeAdmin.name}</b></span><button onClick={logout} title="Log out"><LogOut size={18} /></button></div>
          </aside>
          <section className="admin-content">
            <header className="admin-header">
              <div><span className="eyebrow">Admin lokal · {activeAdmin.name}</span><h1>{adminTitle}</h1></div>
              <div className="admin-top-actions">
                {adminTab === "products" && <button className={`button ghost manage-button ${manageProducts ? "active" : ""}`} onClick={() => { setManageProducts((value) => !value); setSelectedProductIds([]); }}><Settings size={17} /> Manage</button>}
                {adminTab === "orders" && <button className={`button ghost manage-button ${manageOrders ? "active" : ""}`} onClick={() => { setManageOrders((value) => !value); setSelectedOrderIds([]); }}><Settings size={17} /> Manage</button>}
                {adminTab === "shipping" && <button className={`button ghost manage-button ${manageShipping ? "active" : ""}`} onClick={() => { setManageShipping((value) => !value); setSelectedShippingRegions([]); }}><Settings size={17} /> Manage</button>}
                {adminTab === "products" && <button className="button primary add-product-button" onClick={() => openEditor()}><Plus size={18} /> Tambah produk</button>}
                <button className="icon-button admin-mobile-logout" onClick={logout} title="Log out"><LogOut size={19} /></button>
              </div>
            </header>
            <div className="admin-mobile-tabs">
              <button className={adminTab === "products" ? "active" : ""} onClick={() => setAdminTab("products")}>Produk</button>
              <button className={adminTab === "orders" ? "active" : ""} onClick={() => setAdminTab("orders")}>Pesanan</button>
              <button className={adminTab === "shipping" ? "active" : ""} onClick={() => setAdminTab("shipping")}>Ongkir</button>
              <button className={adminTab === "settings" ? "active" : ""} onClick={() => setAdminTab("settings")}>Profil</button>
            </div>

            {adminTab === "products" && <>
              {manageProducts && <div className="bulk-toolbar">
                <label className="select-all"><input type="checkbox" checked={products.length > 0 && selectedProductIds.length === products.length} onChange={(event) => setSelectedProductIds(event.target.checked ? products.map((product) => product.id) : [])} /><span>{selectedProductIds.length || "Pilih"}</span></label>
                <select value={bulkProductStatus} onChange={(event) => setBulkProductStatus(event.target.value as ProductAvailability)}>{Object.entries(AVAILABILITY_META).map(([value, meta]) => <option key={value} value={value}>{meta.label}</option>)}</select>
                <button className="button secondary compact-button" disabled={!selectedProductIds.length} onClick={() => applyProductStatus(selectedProductIds, bulkProductStatus)}>Terapkan</button>
                <button className="button danger-button compact-button" disabled={!selectedProductIds.length} onClick={() => requestDelete({ kind: "products", ids: selectedProductIds, label: `${selectedProductIds.length} produk` })}><Trash2 size={16} /> Hapus</button>
              </div>}
              <div className="admin-product-list">{adminProducts.map((product, index) => {
                const availability = productAvailability(product);
                return <article key={product.id} className={`${isProductDisabled(product) ? "sold-out" : ""} ${manageProducts ? "manage-mode" : ""}`}>
                  {manageProducts && <label className="manage-checkbox"><input type="checkbox" checked={selectedProductIds.includes(product.id)} onChange={() => toggleSelected(product.id, selectedProductIds, setSelectedProductIds)} /><span /></label>}
                  <ProductVisual product={product} />
                  <div className="admin-product-copy"><div className="admin-product-title"><h3>{product.title}</h3>{product.pinned && <Pin size={14} />}<span className={`availability-badge availability-${availability}`}>{AVAILABILITY_META[availability].short}</span></div><p>{formatRupiah(product.price)} · Fee {formatRupiah(product.fee)}</p><small>Stok {product.stock} · {product.images.length || 1} foto</small></div>
                  {!manageProducts && <div className="admin-row-actions"><button onClick={() => setProducts((current) => current.map((item) => item.id === product.id ? { ...item, pinned: !item.pinned } : item))} title="Pin">{product.pinned ? <PinOff size={17} /> : <Pin size={17} />}</button><button disabled={index === 0} onClick={() => moveProduct(product.id, -1)} title="Naik"><ArrowUp size={17} /></button><button disabled={index === adminProducts.length - 1} onClick={() => moveProduct(product.id, 1)} title="Turun"><ArrowDown size={17} /></button><button onClick={() => openEditor(product)} title="Edit"><Pencil size={17} /></button><button className={isProductDisabled(product) ? "active" : ""} onClick={() => applyProductStatus([product.id], isProductDisabled(product) ? "ready" : "sold_out")} title="Ubah ketersediaan"><Store size={17} /></button></div>}
                </article>;
              })}</div>
            </>}

            {adminTab === "orders" && <>
              {manageOrders && orders.length > 0 && <div className="bulk-toolbar">
                <label className="select-all"><input type="checkbox" checked={selectedOrderIds.length === orders.length} onChange={(event) => setSelectedOrderIds(event.target.checked ? orders.map((order) => order.id) : [])} /><span>{selectedOrderIds.length || "Pilih"}</span></label>
                <select value={bulkOrderStatus} onChange={(event) => setBulkOrderStatus(event.target.value as OrderStatus)}>{Object.entries(STATUS_META).map(([value, meta]) => <option key={value} value={value}>{meta.label}</option>)}</select>
                <button className="button secondary compact-button" disabled={!selectedOrderIds.length} onClick={() => applyOrderStatus(selectedOrderIds, bulkOrderStatus)}>Terapkan</button>
                <button className="button danger-button compact-button" disabled={!selectedOrderIds.length} onClick={() => requestDelete({ kind: "orders", ids: selectedOrderIds, label: `${selectedOrderIds.length} pesanan` })}><Trash2 size={16} /> Hapus</button>
              </div>}
              {orders.length ? <div className="order-list admin-orders">{orders.map((order) => <div className={`managed-order ${manageOrders ? "manage-mode" : ""}`} key={order.id}>{manageOrders && <label className="manage-checkbox"><input type="checkbox" checked={selectedOrderIds.includes(order.id)} onChange={() => toggleSelected(order.id, selectedOrderIds, setSelectedOrderIds)} /><span /></label>}<OrderCard order={order} admin onStatus={(status) => updateOrderStatus(order.id, status)} onReview={() => undefined} /></div>)}</div> : <EmptyState icon={Package} title="Belum ada pesanan" copy="Order preview dari konsumen akan masuk ke sini." />}
            </>}

            {adminTab === "shipping" && <section className="shipping-admin">
              <div className="info-banner"><Truck size={20} /><div><b>Estimasi default per wilayah</b><p>Nilai otomatis dipakai saat produk tidak memiliki ongkir khusus.</p></div></div>
              {manageShipping && Object.keys(shippingRates).length > 0 && <div className="bulk-toolbar shipping-toolbar"><label className="select-all"><input type="checkbox" checked={selectedShippingRegions.length === Object.keys(shippingRates).length} onChange={(event) => setSelectedShippingRegions(event.target.checked ? Object.keys(shippingRates) : [])} /><span>{selectedShippingRegions.length || "Pilih"}</span></label><button className="button danger-button compact-button" disabled={!selectedShippingRegions.length} onClick={() => requestDelete({ kind: "shipping", ids: selectedShippingRegions, label: `${selectedShippingRegions.length} wilayah ongkir` })}><Trash2 size={16} /> Hapus</button></div>}
              {Object.entries(shippingRates).map(([region, rate]) => <div className={`shipping-row ${manageShipping ? "manage-mode" : ""}`} key={region}>{manageShipping && <label className="manage-checkbox"><input type="checkbox" checked={selectedShippingRegions.includes(region)} onChange={() => toggleSelected(region, selectedShippingRegions, setSelectedShippingRegions)} /><span /></label>}<span className="shipping-name"><b>{region}</b><small>Ditampilkan sebagai estimasi</small></span><div className="shipping-input"><span>Rp</span><input type="number" value={rate} onChange={(event) => setShippingRates((current) => ({ ...current, [region]: Number(event.target.value) }))} /></div></div>)}
              {!Object.keys(shippingRates).length && <EmptyState icon={Truck} title="Belum ada wilayah" copy="Kembalikan ongkir default untuk memakai daftar awal." />}
              <button className="button secondary" onClick={() => { setShippingRates(SHIPPING_RATES); setSelectedShippingRegions([]); flash("Ongkir default dipulihkan"); }}><RotateCcw size={17} /> Kembalikan default</button>
            </section>}

            {adminTab === "settings" && <section className="admin-settings">
              <div className="info-banner"><Users size={20} /><div><b>Tiga profil pengelola</b><p>Pilih siapa yang sedang bertugas. Nama pengelola hanya terlihat di admin dan dicatat saat status pesanan diubah.</p></div></div>
              <div className="admin-profile-grid">{safeAdminAccounts.map((account) => <article key={account.id} className={`admin-profile-card ${account.id === activeAdmin.id ? "active" : ""}`}><button onClick={() => { setActiveAdminId(account.id); flash(`${account.name} sekarang admin aktif`); }}><PixelAvatar index={account.avatarIndex} size="md" /><span><small>{account.id === activeAdmin.id ? "Sedang aktif" : "Pilih profil"}</small><b>{account.name}</b></span>{account.id === activeAdmin.id && <CheckCircle2 size={19} />}</button><label><span>Nama admin</span><input maxLength={18} value={account.name} onChange={(event) => setAdminAccounts((current) => current.map((item) => item.id === account.id ? { ...item, name: event.target.value || "Admin" } : item))} /></label></article>)}</div>
              <div className="admin-security-card"><ShieldCheck size={21} /><div><b>Keamanan manage lokal</b><p>Penghapusan data meminta konfirmasi Y/N dan PIN 6 digit.</p></div><code>PIN preview: 000000</code></div>
              <button className="button ghost logout-button admin-settings-logout" onClick={logout}><LogOut size={18} /> Log out admin</button>
            </section>}
          </section>
        </div>
      )}

      {role === "consumer" && isConsumerScreen && screen !== "product" && (
        <nav className="bottom-nav" aria-label="Navigasi utama"><button className={screen === "home" ? "active" : ""} onClick={() => navigate("home")}><span className="nav-icon"><Home size={21} /></span><span className="nav-label">Beranda</span></button><button className={screen === "search" || screen === "wishlist" ? "active" : ""} onClick={() => navigate("search")}><span className="nav-icon"><Search size={21} /></span><span className="nav-label">Jelajahi</span></button><button className={`cart-nav ${screen === "cart" ? "active" : ""}`} onClick={() => navigate("cart")}><span className="nav-icon cart-icon"><ShoppingBag size={21} />{cartCount > 0 && <i>{cartCount}</i>}</span><span className="nav-label">Keranjang</span></button><button className={screen === "orders" ? "active" : ""} onClick={() => navigate("orders")}><span className="nav-icon"><Package size={21} /></span><span className="nav-label">Pesanan</span></button><button className={screen === "profile" ? "active" : ""} onClick={() => navigate("profile")}><span className="nav-icon"><UserRound size={21} /></span><span className="nav-label">Profil</span></button></nav>
      )}

      {showFilter && <div className="modal-backdrop" onMouseDown={() => setShowFilter(false)}><section className="sheet" onMouseDown={(event) => event.stopPropagation()}><div className="sheet-handle" /><header><h2>Filter produk</h2><button onClick={() => setShowFilter(false)}><X size={19} /></button></header><label className="field"><span>Urutkan</span><select value={sortMode} onChange={(event) => setSortMode(event.target.value)}><option value="featured">Pilihan ZeeMy</option><option value="newest">Terbaru</option><option value="most">Paling banyak dibeli</option><option value="low">Harga terendah</option><option value="high">Harga tertinggi</option></select></label><div className="price-fields"><label className="field"><span>Harga minimum</span><input type="number" value={minPrice} placeholder="Rp 0" onChange={(event) => setMinPrice(event.target.value)} /></label><label className="field"><span>Harga maksimum</span><input type="number" value={maxPrice} placeholder="Bebas" onChange={(event) => setMaxPrice(event.target.value)} /></label></div><button className="button primary wide" onClick={() => setShowFilter(false)}>Tampilkan {visibleProducts.length} produk</button></section></div>}

      {showAddress && <div className="modal-backdrop" onMouseDown={() => setShowAddress(false)}><section className="sheet address-sheet" onMouseDown={(event) => event.stopPropagation()}><div className="sheet-handle" /><header><h2>Alamat pengiriman</h2><button onClick={() => setShowAddress(false)}><X size={19} /></button></header><label className="field"><span>Nama penerima</span><input value={profile.nickname} placeholder="Nama atau nickname" onChange={(event) => setProfile((current) => ({ ...current, nickname: event.target.value }))} /></label><label className="field"><span>Nomor WhatsApp</span><div className="input-with-icon"><Phone size={17} /><input type="tel" inputMode="tel" maxLength={16} value={profile.phone ?? ""} placeholder="0812 3456 7890" onChange={(event) => setProfile((current) => ({ ...current, phone: event.target.value.replace(/[^0-9+ ]/g, "") }))} /></div></label><label className="field"><span>Wilayah</span><select value={profile.region} onChange={(event) => setProfile((current) => ({ ...current, region: event.target.value }))}>{Object.keys(shippingRates).map((region) => <option key={region}>{region}</option>)}</select></label><label className="field"><span>Alamat lengkap</span><textarea value={profile.address} rows={4} placeholder="Nama jalan, nomor rumah, kecamatan, kota, kode pos" onChange={(event) => setProfile((current) => ({ ...current, address: event.target.value }))} /></label><button className="button primary wide" onClick={() => { if (!profile.nickname || !profile.phone?.trim() || !profile.address) flash("Nama, nomor WhatsApp, dan alamat belum lengkap"); else { setShowAddress(false); flash("Alamat disimpan"); } }}><MapPin size={18} /> Simpan alamat</button></section></div>}

      {showEditor && <div className="modal-backdrop admin-modal" onMouseDown={() => setShowEditor(false)}><section className="sheet product-editor" onMouseDown={(event) => event.stopPropagation()}><header><div><span className="eyebrow">Admin {activeAdmin.name}</span><h2>{editingProduct ? "Edit produk" : "Tambah produk"}</h2></div><button onClick={() => setShowEditor(false)}><X size={19} /></button></header><form onSubmit={(event) => { event.preventDefault(); saveProduct(event.currentTarget); }}><div className="image-uploader"><div className="editor-image-strip">{editorImages.map((image, index) => <div key={`${image.slice(0, 20)}-${index}`}><img src={image} alt={`Upload ${index + 1}`} /><button type="button" onClick={() => setEditorImages((current) => current.filter((_, itemIndex) => itemIndex !== index))}><X size={14} /></button></div>)}{editorImages.length < 5 && <label><ImagePlus size={24} /><span>Tambah foto</span><small>{editorImages.length}/5</small><input type="file" multiple accept="image/*" onChange={async (event) => { const images = await filesToDataUrls(event.target.files, 5 - editorImages.length); setEditorImages((current) => [...current, ...images].slice(0, 5)); if (event.target.files && images.length < event.target.files.length) flash("Sebagian foto terlalu besar"); }} /></label>}</div><p>Foto pertama menjadi cover. Maksimal 5 foto, masing-masing 2.5 MB.</p></div><label className="field"><span>Judul produk</span><input name="title" defaultValue={editingProduct?.title} placeholder="Contoh: Sakura Tumbler" /></label><label className="field"><span>Catatan produk</span><textarea name="note" rows={3} defaultValue={editingProduct?.note} placeholder="Ukuran, warna, material, atau catatan penting..." /></label><div className="form-grid"><label className="field"><span>Harga barang</span><input name="price" type="number" defaultValue={editingProduct?.price} placeholder="89000" /></label><label className="field memory-field"><span>Fee jastip <em><Pencil size={12} /> diingat</em></span><input name="fee" type="number" defaultValue={editingProduct?.fee ?? lastFee} /></label><label className="field"><span>Stok</span><input name="stock" type="number" defaultValue={editingProduct?.stock ?? 1} /></label><label className="field"><span>Kategori</span><input name="category" defaultValue={editingProduct?.category ?? "Pilihan ZeeMy"} /></label><label className="field"><span>Status produk</span><select name="availability" defaultValue={productAvailability(editingProduct ?? PRODUCTS[0])}>{Object.entries(AVAILABILITY_META).map(([value, meta]) => <option key={value} value={value}>{meta.label}</option>)}</select></label></div><label className="field memory-field"><span>Ongkir khusus produk <em><Pencil size={12} /> opsional</em></span><input name="shippingOverride" type="number" defaultValue={editingProduct?.shippingOverride ?? lastShippingOverride} placeholder="Kosong = pakai default wilayah" /></label><button className="button primary wide" type="submit"><Upload size={18} /> Simpan produk</button></form></section></div>}

      {deleteTarget && <div className="modal-backdrop admin-modal" onMouseDown={() => setDeleteTarget(null)}><section className="sheet delete-dialog" onMouseDown={(event) => event.stopPropagation()}><header><div><span className="eyebrow"><Trash2 size={14} /> Manage delete</span><h2>Hapus {deleteTarget.label}?</h2></div><button onClick={() => setDeleteTarget(null)}><X size={19} /></button></header>{deleteStep === "confirm" ? <><p>Data yang dihapus dari preview lokal tidak bisa dikembalikan. Lanjutkan?</p><div className="yn-actions"><button className="button ghost" onClick={() => setDeleteTarget(null)}>N · Tidak</button><button className="button danger-button" onClick={() => setDeleteStep("pin")}>Y · Ya, lanjut</button></div></> : <><div className="pin-copy"><ShieldCheck size={22} /><div><b>Masukkan PIN admin</b><p>PIN harus tepat 6 digit.</p></div></div><label className="field pin-field"><span>PIN keamanan</span><input autoFocus type="password" inputMode="numeric" maxLength={6} value={deletePin} placeholder="••••••" onChange={(event) => setDeletePin(event.target.value.replace(/\D/g, "").slice(0, 6))} /></label><div className="pin-dots">{Array.from({ length: 6 }, (_, index) => <i key={index} className={index < deletePin.length ? "filled" : ""} />)}</div><button className="button danger-button wide" disabled={deletePin.length !== 6} onClick={performProtectedDelete}><Trash2 size={18} /> Hapus permanen</button></>}</section></div>}

      {reviewingOrder && <div className="modal-backdrop" onMouseDown={() => setReviewingOrder(null)}><section className="sheet review-sheet" onMouseDown={(event) => event.stopPropagation()}><div className="sheet-handle" /><header><h2>Review pesanan</h2><button onClick={() => setReviewingOrder(null)}><X size={19} /></button></header><div className="review-stars">{Array.from({ length: 5 }, (_, index) => <Star key={index} fill="currentColor" />)}</div><label className="field"><span>Ceritain pengalamanmu</span><textarea rows={4} value={reviewNote} onChange={(event) => setReviewNote(event.target.value)} placeholder="Barangnya sesuai? Proses jastipnya gimana?" /></label><label className="review-photo"><Camera size={21} /><span>{reviewPhoto ? "Ganti foto review" : "Tambah foto review"}</span><small>Maks. 1 MB</small><input type="file" accept="image/*" onChange={async (event) => { const [image] = await filesToDataUrls(event.target.files, 1, 1_000_000); if (image) setReviewPhoto(image); else flash("Foto review maksimal 1 MB"); }} /></label>{reviewPhoto && <img className="review-preview" src={reviewPhoto} alt="Preview review" />}<button className="button primary wide" onClick={submitReview}><Send size={18} /> Kirim review</button></section></div>}
    </main>
  );
}

function PageTitle({ title, onBack, right }: { title: string; onBack: () => void; right?: React.ReactNode }) {
  return <header className="page-title"><button className="icon-button" onClick={onBack}><ArrowLeft size={20} /></button><h1>{title}</h1><div>{right}</div></header>;
}

function ProductCard({ product, wished, onOpen, onWish, onAdd }: { product: Product; wished: boolean; onOpen: () => void; onWish: () => void; onAdd: () => void }) {
  const availability = productAvailability(product);
  const disabled = isProductDisabled(product);
  const actionLabel = disabled ? AVAILABILITY_META[availability].short : availability === "preorder" ? "Pre order" : availability === "po_open" ? "Ikut PO" : "Tambah";
  return (
    <article className={`product-card ${disabled ? "sold-out" : ""}`}>
      <button className="product-card-main" onClick={onOpen}>
        <ProductVisual product={product} />
        {disabled && <span className="soldout-label">{AVAILABILITY_META[availability].short}</span>}
        {availability !== "ready" && !disabled && <span className={`card-status availability-${availability}`}>{AVAILABILITY_META[availability].short}</span>}
        <span className="product-category">{product.category}</span>
        <h3>{product.title}</h3>
        <strong>{formatRupiah(product.price)}</strong>
        <small>Fee {formatRupiah(product.fee)}</small>
      </button>
      <button className={`card-heart ${wished ? "active" : ""}`} onClick={onWish} aria-label="Simpan produk"><Heart size={17} fill={wished ? "currentColor" : "none"} /></button>
      <button className="card-add" disabled={disabled} onClick={onAdd}>{actionLabel}{!disabled && <Plus size={16} />}</button>
    </article>
  );
}

function OrderCard({ order, admin, onStatus, onReview }: { order: Order; admin: boolean; onStatus: (status: OrderStatus) => void; onReview: () => void }) {
  const meta = STATUS_META[order.status];
  const statuses: OrderStatus[] = ["payment", "accepted", "process", "shipping", "received"];
  const currentIndex = statuses.indexOf(order.status);
  return (
    <article className={`order-card status-${order.status}`}>
      <header><div><span className="order-id">{order.id}</span><small>{new Date(order.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}</small></div><span className="status-pill">{meta.label}</span></header>
      <div className="order-products">{order.lines.slice(0, 2).map((line) => <p key={line.productId}><span>{line.qty}x</span>{line.title}</p>)}{order.lines.length > 2 && <small>+{order.lines.length - 2} produk lainnya</small>}</div>
      {order.status !== "canceled" && <div className="order-progress">{statuses.map((status, index) => <i key={status} className={index <= currentIndex ? "active" : ""}><span>{index < currentIndex ? <Check size={11} /> : index + 1}</span></i>)}</div>}
      <div className="order-status-copy"><span>{order.status === "payment" ? <CreditCard size={18} /> : order.status === "accepted" ? <CheckCircle2 size={18} /> : order.status === "process" ? <Package size={18} /> : order.status === "shipping" ? <Truck size={18} /> : order.status === "received" ? <Gift size={18} /> : <X size={18} />}</span><div><b>{meta.label}</b><p>{meta.detail}</p></div></div>
      <footer><span><small>Total</small><b>{formatRupiah(order.total)}</b></span>{!admin && order.status === "payment" && <a href={`https://wa.me/${ADMIN_WHATSAPP}`} target="_blank" rel="noreferrer"><MessageCircle size={16} /> Hubungi ZeeMy</a>}{!admin && order.status === "received" && !order.review && <button onClick={onReview}><Star size={16} /> Beri review</button>}{!admin && order.review && <span className="reviewed"><Check size={15} /> Sudah direview</span>}</footer>
      {admin && <div className="admin-status-actions"><label><span>Ubah status</span><select value={order.status} onChange={(event) => onStatus(event.target.value as OrderStatus)}>{statuses.map((status) => <option key={status} value={status}>{STATUS_META[status].label}</option>)}<option value="canceled">Batalkan pesanan</option></select></label><div className="customer-mini"><UserRound size={16} /><span>{order.customerName}<small>{order.customerPhone || "Nomor belum ada"} · {order.region}</small>{order.handledBy && <em>Diproses {order.handledBy.name}</em>}</span></div></div>}
    </article>
  );
}
