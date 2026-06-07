'use client'

export default function StarRating({ rating = 0, count = 0, size = 'md', interactive = false, onRate }) {
  const stars = [1, 2, 3, 4, 5]
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
      <div className="stars">
        {stars.map(s => (
          <span
            key={s}
            className={`star ${s <= Math.round(rating) ? 'filled' : ''}`}
            style={{ fontSize: size === 'sm' ? '0.85rem' : size === 'lg' ? '1.3rem' : '1rem', cursor: interactive ? 'pointer' : 'default' }}
            onClick={() => interactive && onRate && onRate(s)}
          >★</span>
        ))}
      </div>
      {count > 0 && (
        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginLeft: 4 }}>
          {rating.toFixed(1)} ({count})
        </span>
      )}
    </div>
  )
}
