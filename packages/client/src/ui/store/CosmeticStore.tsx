import { useState, useEffect, useCallback } from 'preact/hooks';
import { api, ApiError } from '../../api/client';
import type { StoreItem, PlayerPurchase } from '../../api/client';
import { usePlayerStore } from '../../stores/usePlayerStore';
import { useStore } from '../hooks/useStore';

const CATEGORIES = [
  { id: '', label: 'All' },
  { id: 'borders', label: 'Borders' },
  { id: 'titles', label: 'Titles' },
  { id: 'avatars', label: 'Avatars' },
] as const;

const OVERLAY_STYLE = {
  position: 'fixed' as const,
  inset: 0,
  background: 'rgba(0, 0, 0, 0.7)',
  zIndex: 50,
};

const MODAL_STYLE = {
  position: 'fixed' as const,
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: '660px',
  maxWidth: '95vw',
  maxHeight: '82vh',
  display: 'flex',
  flexDirection: 'column' as const,
  background: 'linear-gradient(180deg, var(--hud-bg-dark) 0%, var(--hud-bg-slate) 100%)',
  border: '1px solid var(--hud-border)',
  borderRadius: '12px',
  overflow: 'hidden',
  zIndex: 51,
};

interface ItemCardProps {
  item: StoreItem;
  owned: boolean;
  equippedSlot: string | null;
  coins: number;
  onBuy: (item: StoreItem) => void;
  onEquip: (item: StoreItem) => void;
  busy: boolean;
}

function ItemCard({ item, owned, equippedSlot, coins, onBuy, onEquip, busy }: ItemCardProps) {
  const isEquipped = equippedSlot !== null;
  const canAfford = coins >= item.priceCoins;

  return (
    <div
      style={{
        background: owned
          ? 'rgba(196, 160, 98, 0.06)'
          : 'rgba(255, 255, 255, 0.02)',
        border: `1px solid ${owned ? 'rgba(196, 160, 98, 0.3)' : 'var(--hud-border-subtle)'}`,
        borderRadius: '8px',
        padding: '14px',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
      }}
    >
      {/* Preview placeholder */}
      <div
        style={{
          width: '100%',
          aspectRatio: '1',
          background: 'var(--hud-bg-dark)',
          borderRadius: '6px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '28px',
          color: 'var(--hud-muted)',
        }}
      >
        {item.category === 'borders' ? '🖼' : item.category === 'titles' ? '🏅' : '👤'}
      </div>

      <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--hud-text)', lineHeight: 1.3 }}>
        {item.name}
      </div>
      <div style={{ fontSize: '11px', color: 'var(--hud-muted)', lineHeight: 1.4, flex: 1 }}>
        {item.description}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '4px' }}>
        {!owned && (
          <span style={{ fontSize: '12px', color: '#c4a062', fontWeight: '600' }}>
            {item.priceCoins.toLocaleString()} coins
          </span>
        )}
        {owned && (
          <span style={{ fontSize: '11px', color: isEquipped ? '#4ade80' : 'var(--hud-muted)' }}>
            {isEquipped ? 'Equipped' : 'Owned'}
          </span>
        )}

        {!owned && (
          <button
            class="hud-btn hud-interactive"
            style={{
              padding: '5px 12px',
              fontSize: '11px',
              opacity: canAfford && !busy ? 1 : 0.45,
              cursor: canAfford && !busy ? 'pointer' : 'not-allowed',
            }}
            onClick={() => canAfford && !busy && onBuy(item)}
            disabled={!canAfford || busy}
          >
            Buy
          </button>
        )}
        {owned && !isEquipped && (
          <button
            class="hud-btn hud-interactive"
            style={{ padding: '5px 12px', fontSize: '11px', opacity: busy ? 0.45 : 1 }}
            onClick={() => !busy && onEquip(item)}
            disabled={busy}
          >
            Equip
          </button>
        )}
      </div>
    </div>
  );
}

export function CosmeticStore({ onClose }: { onClose: () => void }) {
  const isLoggedIn = useStore(usePlayerStore, (s) => s.isLoggedIn);
  const playerId = useStore(usePlayerStore, (s) => s.playerId);

  const [category, setCategory] = useState('');
  const [items, setItems] = useState<StoreItem[]>([]);
  const [ownedItemIds, setOwnedItemIds] = useState<Set<string>>(new Set());
  const [equippedBySlot, setEquippedBySlot] = useState<Map<string, string>>(new Map()); // slot -> itemId
  const [coins, setCoins] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [flashMsg, setFlashMsg] = useState<string | null>(null);

  const showFlash = useCallback((msg: string) => {
    setFlashMsg(msg);
    setTimeout(() => setFlashMsg(null), 3000);
  }, []);

  // Load items + owned purchases
  useEffect(() => {
    setLoading(true);
    setError(null);

    const requests: [Promise<{ items: StoreItem[] }>, Promise<{ purchases: PlayerPurchase[] }> | null] = [
      api.getStoreItems(category || undefined),
      isLoggedIn ? api.getMyItems() : null,
    ];

    Promise.all(requests)
      .then(([itemsRes, myItemsRes]) => {
        setItems(itemsRes.items);
        if (myItemsRes) {
          setOwnedItemIds(new Set(myItemsRes.purchases.map((p) => p.itemId)));
        }
      })
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : 'Failed to load store');
      })
      .finally(() => setLoading(false));
  }, [category, isLoggedIn]);

  // Load player coins
  useEffect(() => {
    if (!isLoggedIn) return;
    api.getProfile()
      .then((res) => setCoins(res.player.coins ?? 0))
      .catch(() => { /* ignore */ });
  }, [isLoggedIn, playerId]);

  const handleBuy = useCallback(async (item: StoreItem) => {
    if (busy) return;
    setBusy(true);
    try {
      const res = await api.purchaseItem(item.id);
      setCoins(res.remaining_coins);
      setOwnedItemIds((prev) => new Set([...prev, item.id]));
      showFlash(`Purchased "${item.name}"!`);
    } catch (err: unknown) {
      const msg = err instanceof ApiError ? err.message : 'Purchase failed';
      showFlash(msg);
    } finally {
      setBusy(false);
    }
  }, [busy, showFlash]);

  const handleEquip = useCallback(async (item: StoreItem) => {
    if (busy) return;
    setBusy(true);
    const slot = item.category === 'borders' ? 'border'
      : item.category === 'titles' ? 'title'
      : item.category === 'avatars' ? 'avatar'
      : item.category;
    try {
      await api.equipItem(slot, item.id);
      setEquippedBySlot((prev) => {
        const next = new Map(prev);
        next.set(slot, item.id);
        return next;
      });
      showFlash(`Equipped "${item.name}"!`);
    } catch (err: unknown) {
      const msg = err instanceof ApiError ? err.message : 'Equip failed';
      showFlash(msg);
    } finally {
      setBusy(false);
    }
  }, [busy, showFlash]);

  // Determine which slot an item occupies (if any equipped mapping hits this item)
  const getEquippedSlotForItem = (itemId: string): string | null => {
    for (const [slot, id] of equippedBySlot.entries()) {
      if (id === itemId) return slot;
    }
    return null;
  };

  return (
    <>
      <div class="hud-interactive" style={OVERLAY_STYLE} onClick={onClose} />
      <div class="hud-interactive" style={MODAL_STYLE}>
        {/* Header */}
        <div
          style={{
            padding: '16px 20px',
            borderBottom: '1px solid var(--hud-border-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexShrink: 0,
          }}
        >
          <div style={{ fontSize: '16px', fontWeight: '700', color: '#c4a062' }}>
            Cosmetic Store
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {isLoggedIn && (
              <span style={{ fontSize: '13px', color: '#c4a062', fontWeight: '600' }}>
                {coins.toLocaleString()} coins
              </span>
            )}
            <button
              class="hud-btn hud-interactive"
              style={{ padding: '4px 12px', fontSize: '12px', color: 'var(--hud-muted)' }}
              onClick={onClose}
            >
              Close
            </button>
          </div>
        </div>

        {/* Category filters */}
        <div
          style={{
            padding: '10px 20px',
            borderBottom: '1px solid var(--hud-border-subtle)',
            display: 'flex',
            gap: '8px',
            flexShrink: 0,
          }}
        >
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              class={`hud-btn${category === cat.id ? ' hud-btn-active' : ''} hud-interactive`}
              style={{ padding: '5px 12px', fontSize: '12px' }}
              onClick={() => setCategory(cat.id)}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Flash message */}
        {flashMsg && (
          <div
            style={{
              padding: '8px 20px',
              background: 'rgba(196, 160, 98, 0.12)',
              borderBottom: '1px solid var(--hud-border-subtle)',
              fontSize: '12px',
              color: '#c4a062',
              flexShrink: 0,
            }}
          >
            {flashMsg}
          </div>
        )}

        {/* Not logged in notice */}
        {!isLoggedIn && (
          <div
            style={{
              padding: '8px 20px',
              background: 'rgba(255, 255, 255, 0.04)',
              borderBottom: '1px solid var(--hud-border-subtle)',
              fontSize: '12px',
              color: 'var(--hud-muted)',
              fontStyle: 'italic',
              flexShrink: 0,
            }}
          >
            Log in to purchase and equip cosmetics.
          </div>
        )}

        {/* Content grid */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px' }}>
          {loading && (
            <div style={{ textAlign: 'center', padding: '32px', color: 'var(--hud-muted)', fontSize: '13px' }}>
              Loading…
            </div>
          )}
          {!loading && error && (
            <div style={{ textAlign: 'center', padding: '32px', color: '#f87171', fontSize: '13px' }}>
              {error}
            </div>
          )}
          {!loading && !error && items.length === 0 && (
            <div style={{ textAlign: 'center', padding: '32px', color: 'var(--hud-muted)', fontSize: '13px', fontStyle: 'italic' }}>
              No items available.
            </div>
          )}
          {!loading && !error && items.length > 0 && (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
                gap: '12px',
              }}
            >
              {items.map((item) => (
                <ItemCard
                  key={item.id}
                  item={item}
                  owned={ownedItemIds.has(item.id)}
                  equippedSlot={getEquippedSlotForItem(item.id)}
                  coins={coins}
                  onBuy={handleBuy}
                  onEquip={handleEquip}
                  busy={busy}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
