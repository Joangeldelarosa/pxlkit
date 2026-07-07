'use client';

import { useMemo, useState, type ReactNode } from 'react';
import Image from 'next/image';
import {
  PixelButton,
  PixelCard,
  PixelCenter,
  PixelChip,
  PixelChipGroup,
  PixelContainer,
  PixelGrid,
  PixelInput,
  PixelNumberInput,
  PixelPagination,
  PixelRibbon,
  PixelSheet,
  PixelSlider,
  PixelStack,
  PixelStarRating,
  PixelToggle,
  PixelToggleGroup,
  PixelTwoColumn,
} from '@pxlkit/ui-kit';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  rating: number;
  category: 'audio' | 'wearables' | 'desk' | 'lighting';
  image: string;
  tag?: 'NEW' | 'SALE';
}

const CATEGORIES: { value: Product['category']; label: string }[] = [
  { value: 'audio', label: 'Audio' },
  { value: 'wearables', label: 'Wearables' },
  { value: 'desk', label: 'Desk Setup' },
  { value: 'lighting', label: 'Lighting' },
];

const PRODUCTS: Product[] = [
  {
    id: 'p01',
    name: 'Lo-Fi Studio Headphones',
    description: 'Closed-back monitors tuned for late-night mixing sessions and long edits.',
    price: 149,
    rating: 5,
    category: 'audio',
    image:
      'https://images.unsplash.com/photo-1583394838336-acd977736f90?auto=format&fit=crop&w=640&q=60',
    tag: 'NEW',
  },
  {
    id: 'p02',
    name: 'Pixel Field Recorder',
    description: 'Pocket-sized 32-bit float recorder for capturing ambient textures in the wild.',
    price: 329,
    rating: 4,
    category: 'audio',
    image:
      'https://images.unsplash.com/photo-1485579149621-3123dd979885?auto=format&fit=crop&w=640&q=60',
  },
  {
    id: 'p03',
    name: 'Retro Smartwatch',
    description: 'Monochrome OLED face, week-long battery, and pixel-perfect haptics.',
    price: 219,
    rating: 4,
    category: 'wearables',
    image:
      'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=640&q=60',
    tag: 'SALE',
  },
  {
    id: 'p04',
    name: 'CRT Bit Goggles',
    description: 'AR glasses with phosphor-emulated overlays for the analog-curious developer.',
    price: 489,
    rating: 5,
    category: 'wearables',
    image:
      'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=640&q=60',
  },
  {
    id: 'p05',
    name: 'Tactile Switch Keyboard',
    description: '65% layout, lubed linears, and PBT dye-sub keycaps in a CRT colorway.',
    price: 179,
    rating: 5,
    category: 'desk',
    image:
      'https://images.unsplash.com/photo-1561112078-7d24e04c3407?auto=format&fit=crop&w=640&q=60',
    tag: 'NEW',
  },
  {
    id: 'p06',
    name: 'Cable-Free Mouse Mat',
    description: 'Wireless charging surface that also looks like a CRT mod kit on your desk.',
    price: 59,
    rating: 4,
    category: 'desk',
    image:
      'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=640&q=60',
  },
  {
    id: 'p07',
    name: 'Modular Monitor Arm',
    description: 'VESA-mount arm with cable channels and a counter-balanced micro-adjust head.',
    price: 139,
    rating: 4,
    category: 'desk',
    image:
      'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=640&q=60',
  },
  {
    id: 'p08',
    name: 'CRT Glow Bias Lamp',
    description: 'Bias lighting strip that softens late-night staring contests with your monitor.',
    price: 39,
    rating: 3,
    category: 'lighting',
    image:
      'https://images.unsplash.com/photo-1558002038-1055907df827?auto=format&fit=crop&w=640&q=60',
    tag: 'SALE',
  },
  {
    id: 'p09',
    name: 'Hexcell Wall Tiles',
    description: 'Sound-reactive RGB hex tiles you can chain along a streaming backdrop.',
    price: 249,
    rating: 4,
    category: 'lighting',
    image:
      'https://images.unsplash.com/photo-1551739440-5dd934d3a94a?auto=format&fit=crop&w=640&q=60',
  },
  {
    id: 'p10',
    name: 'Pomodoro Tabletop Lamp',
    description: 'Warm-cool tunable lamp with a built-in 25/5 timer ring on the base.',
    price: 89,
    rating: 5,
    category: 'lighting',
    image:
      'https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?auto=format&fit=crop&w=640&q=60',
    tag: 'NEW',
  },
  {
    id: 'p11',
    name: 'Ergonomic Mesh Chair',
    description: 'Breathable lumbar support tuned for marathon ship-mode sprints.',
    price: 469,
    rating: 4,
    category: 'desk',
    image:
      'https://images.unsplash.com/photo-1592078615290-033ee584e267?auto=format&fit=crop&w=640&q=60',
  },
  {
    id: 'p12',
    name: 'Pixel Fitness Band',
    description: 'Step + sleep tracker with a chunky 8-bit display and 21-day battery life.',
    price: 79,
    rating: 4,
    category: 'wearables',
    image:
      'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=640&q=60',
  },
];

const PAGE_SIZE = 6;

interface CartLine {
  product: Product;
  qty: number;
}

function formatPrice(n: number) {
  return `$${n.toFixed(2)}`;
}

function ProductCard({
  product,
  onAddToCart,
}: {
  product: Product;
  onAddToCart: (p: Product) => void;
}) {
  return (
    <PixelCard
      title={product.name}
      description={product.description}
      descriptionLines={2}
      padding="md"
      media={
        <div className="relative aspect-[4/3] overflow-hidden bg-retro-surface">
          {product.tag && (
            <PixelRibbon
              position="top-right"
              tone={product.tag === 'SALE' ? 'red' : 'cyan'}
              offset="md"
            >
              {product.tag}
            </PixelRibbon>
          )}
          <Image
            src={product.image}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover"
          />
        </div>
      }
      footer={
        <div className="flex items-center justify-between gap-3">
          <div className="flex flex-col">
            <span className="font-pixel text-sm text-retro-text">
              {formatPrice(product.price)}
            </span>
            <PixelStarRating value={product.rating} size="sm" tone="gold" />
          </div>
          <PixelButton
            tone="green"
            size="sm"
            variant="solid"
            onClick={() => onAddToCart(product)}
            aria-label={`Add ${product.name} to cart`}
          >
            Add
          </PixelButton>
        </div>
      }
    />
  );
}

function FiltersSidebar({
  selectedCategories,
  onCategoriesChange,
  priceRange,
  onPriceChange,
  ratingFilter,
  onRatingChange,
  onClearAll,
}: {
  selectedCategories: string[];
  onCategoriesChange: (next: string[]) => void;
  priceRange: [number, number];
  onPriceChange: (next: [number, number]) => void;
  ratingFilter: string;
  onRatingChange: (next: string) => void;
  onClearAll: () => void;
}) {
  return (
    <aside aria-label="Product filters" className="space-y-6">
      <header className="flex items-center justify-between gap-2 border-b border-retro-border/40 pb-3">
        <h3 className="font-pixel text-xs text-retro-text">Filters</h3>
        <button
          type="button"
          onClick={onClearAll}
          className="py-1 -my-1 font-mono text-[11px] uppercase tracking-wider text-retro-muted hover:text-retro-cyan transition-colors"
        >
          Reset
        </button>
      </header>

      <section aria-labelledby="filter-categories-title">
        <h4
          id="filter-categories-title"
          className="font-pixel text-[11px] uppercase tracking-[0.18em] text-retro-muted mb-3"
        >
          Categories
        </h4>
        <PixelChipGroup
          multiple
          value={selectedCategories}
          onChange={onCategoriesChange}
          aria-label="Filter by category"
        >
          {CATEGORIES.map((c) => (
            <PixelChip
              key={c.value}
              value={c.value}
              label={c.label}
              tone="cyan"
              variant="soft"
              size="sm"
            />
          ))}
        </PixelChipGroup>
      </section>

      <section aria-labelledby="filter-price-title">
        <div className="flex items-center justify-between mb-3">
          <h4
            id="filter-price-title"
            className="font-pixel text-[11px] uppercase tracking-[0.18em] text-retro-muted"
          >
            Price
          </h4>
          <span className="font-mono text-xs text-retro-text">
            ${priceRange[0]} – ${priceRange[1]}
          </span>
        </div>
        <PixelSlider
          label="Price range"
          min={10}
          max={500}
          step={10}
          value={priceRange}
          onChange={onPriceChange}
          tone="cyan"
          showMinMax
        />
      </section>

      <section aria-labelledby="filter-rating-title">
        <h4
          id="filter-rating-title"
          className="font-pixel text-[11px] uppercase tracking-[0.18em] text-retro-muted mb-3"
        >
          Minimum rating
        </h4>
        <PixelToggleGroup
          type="single"
          value={ratingFilter}
          onChange={onRatingChange}
          variant="outline"
          size="sm"
          aria-label="Filter by minimum rating"
        >
          <PixelToggle value="3">3+</PixelToggle>
          <PixelToggle value="4">4+</PixelToggle>
          <PixelToggle value="5">5</PixelToggle>
        </PixelToggleGroup>
      </section>
    </aside>
  );
}

function EmptyState({ children }: { children: ReactNode }) {
  return (
    <PixelCard padding="lg">
      <p className="py-8 text-center font-mono text-sm text-retro-muted">{children}</p>
    </PixelCard>
  );
}

function CartSheetBody({
  lines,
  onQtyChange,
  onRemove,
  total,
}: {
  lines: CartLine[];
  onQtyChange: (id: string, qty: number) => void;
  onRemove: (id: string) => void;
  total: number;
}) {
  if (lines.length === 0) {
    return (
      <EmptyState>
        Your cart is empty. Browse products and add a few to get started.
      </EmptyState>
    );
  }
  return (
    <PixelStack gap={4}>
      {lines.map((line) => (
        <PixelCard key={line.product.id} padding="md">
          <div className="flex items-center gap-3">
            <Image
              src={line.product.image}
              alt={line.product.name}
              width={56}
              height={56}
              sizes="56px"
              className="h-14 w-14 object-cover rounded-sm border border-retro-border/40"
            />
            <div className="min-w-0 flex-1">
              <p className="text-sm text-retro-text truncate">{line.product.name}</p>
              <p className="font-mono text-xs text-retro-muted">
                {formatPrice(line.product.price)} × {line.qty}
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-1">
              <div className="w-24">
                <PixelNumberInput
                  size="sm"
                  min={1}
                  max={99}
                  clampBehavior="strict"
                  value={line.qty}
                  onChange={(next) => onQtyChange(line.product.id, next)}
                  aria-label={`Quantity for ${line.product.name}`}
                />
              </div>
              <PixelButton
                size="sm"
                variant="ghost"
                tone="red"
                onClick={() => onRemove(line.product.id)}
                aria-label={`Remove ${line.product.name}`}
              >
                ✕
              </PixelButton>
            </div>
          </div>
        </PixelCard>
      ))}
      <div className="flex items-center justify-between border-t border-retro-border pt-4">
        <span className="font-mono text-xs uppercase tracking-wider text-retro-muted">
          Subtotal
        </span>
        <span className="font-pixel text-sm text-retro-text">{formatPrice(total)}</span>
      </div>
      <PixelButton tone="green" variant="solid" fullWidth>
        Checkout
      </PixelButton>
    </PixelStack>
  );
}

function SearchIcon() {
  return (
    <svg
      aria-hidden
      viewBox="0 0 16 16"
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
    >
      <circle cx="7" cy="7" r="4.5" />
      <line x1="10.5" y1="10.5" x2="14" y2="14" />
    </svg>
  );
}

function CartIcon() {
  return (
    <svg
      aria-hidden
      viewBox="0 0 16 16"
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
    >
      <path d="M2 3h2l1.5 8h7l1.5-6H4.5" />
      <circle cx="6" cy="13.5" r="1" fill="currentColor" />
      <circle cx="12" cy="13.5" r="1" fill="currentColor" />
    </svg>
  );
}

export function PixelEcommerceTemplate() {
  const [query, setQuery] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<[number, number]>([10, 500]);
  const [ratingFilter, setRatingFilter] = useState<string>('');
  const [page, setPage] = useState(1);
  const [cart, setCart] = useState<CartLine[]>([]);
  const [cartOpen, setCartOpen] = useState(false);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const minRating = ratingFilter ? Number(ratingFilter) : 0;
    return PRODUCTS.filter((p) => {
      if (q && !p.name.toLowerCase().includes(q) && !p.description.toLowerCase().includes(q)) {
        return false;
      }
      if (selectedCategories.length > 0 && !selectedCategories.includes(p.category)) {
        return false;
      }
      if (p.price < priceRange[0] || p.price > priceRange[1]) return false;
      if (minRating && p.rating < minRating) return false;
      return true;
    });
  }, [query, selectedCategories, priceRange, ratingFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const paginated = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const cartCount = cart.reduce((sum, l) => sum + l.qty, 0);
  const cartTotal = cart.reduce((sum, l) => sum + l.qty * l.product.price, 0);

  const handleAddToCart = (product: Product) => {
    setCart((prev) => {
      const existing = prev.find((l) => l.product.id === product.id);
      if (existing) {
        return prev.map((l) =>
          l.product.id === product.id ? { ...l, qty: l.qty + 1 } : l,
        );
      }
      return [...prev, { product, qty: 1 }];
    });
  };

  const handleQtyChange = (id: string, qty: number) =>
    setCart((prev) =>
      prev
        .map((l) => (l.product.id === id ? { ...l, qty } : l))
        .filter((l) => l.qty > 0),
    );

  const handleRemove = (id: string) =>
    setCart((prev) => prev.filter((l) => l.product.id !== id));

  const handleClearAll = () => {
    setSelectedCategories([]);
    setPriceRange([10, 500]);
    setRatingFilter('');
    setQuery('');
    setPage(1);
  };

  return (
    <div className="min-h-screen bg-retro-bg text-retro-text">
      <header className="sticky top-0 z-40 border-b border-retro-border/60 bg-retro-bg/95 backdrop-blur">
        <PixelCenter maxWidth="3xl" gutter="lg" className="py-3">
          <div className="flex items-center gap-3">
            <span className="font-pixel text-xs sm:text-sm text-retro-text shrink-0">
              PXL/Shop
            </span>
            <div className="min-w-0 flex-1 max-w-xl">
              <PixelInput
                aria-label="Search products"
                placeholder="Search the catalog…"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setPage(1);
                }}
                suffix={<SearchIcon />}
                size="md"
              />
            </div>
            <PixelButton
              tone="cyan"
              variant="outline"
              size="md"
              iconLeft={<CartIcon />}
              onClick={() => setCartOpen(true)}
              aria-label={`Open cart, ${cartCount} item${cartCount === 1 ? '' : 's'}`}
            >
              Cart ({cartCount})
            </PixelButton>
          </div>
        </PixelCenter>
      </header>

      <PixelContainer maxWidth="2xl" padding={{ x: 'lg', y: 'md' }}>
        <div>
          <h1 className="font-pixel text-base sm:text-lg text-retro-text leading-loose">
            Featured Catalog
          </h1>
          <p className="font-mono text-xs sm:text-sm text-retro-muted mt-1">
            {filtered.length} product{filtered.length === 1 ? '' : 's'} matching your filters.
          </p>
        </div>

        <PixelTwoColumn
          className="mt-10"
          ratio="30/70"
          stackBelow="md"
          gap={8}
          align="start"
          left={
            <FiltersSidebar
              selectedCategories={selectedCategories}
              onCategoriesChange={(next) => {
                setSelectedCategories(next);
                setPage(1);
              }}
              priceRange={priceRange}
              onPriceChange={(next) => {
                setPriceRange(next);
                setPage(1);
              }}
              ratingFilter={ratingFilter}
              onRatingChange={(next) => {
                setRatingFilter(next);
                setPage(1);
              }}
              onClearAll={handleClearAll}
            />
          }
          right={
            <PixelStack gap={6}>
              {paginated.length === 0 ? (
                <EmptyState>
                  No products match your filters. Loosen them up and try again.
                </EmptyState>
              ) : (
                <PixelGrid cols={{ base: 1, sm: 2, lg: 3 }} gap={6}>
                  {paginated.map((p) => (
                    <ProductCard
                      key={p.id}
                      product={p}
                      onAddToCart={handleAddToCart}
                    />
                  ))}
                </PixelGrid>
              )}

              {totalPages > 1 && (
                <div className="flex justify-center pt-2">
                  <PixelPagination
                    page={safePage}
                    total={totalPages}
                    onChange={setPage}
                    ariaLabel="Catalog pagination"
                  />
                </div>
              )}
            </PixelStack>
          }
        />
      </PixelContainer>

      <PixelSheet
        open={cartOpen}
        onOpenChange={setCartOpen}
        side="bottom"
        size="lg"
        dragHandle
        title={`Your cart (${cartCount})`}
        description="Review your selections before checkout."
      >
        <CartSheetBody
          lines={cart}
          onQtyChange={handleQtyChange}
          onRemove={handleRemove}
          total={cartTotal}
        />
      </PixelSheet>
    </div>
  );
}

export default PixelEcommerceTemplate;
