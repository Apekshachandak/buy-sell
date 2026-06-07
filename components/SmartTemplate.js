'use client'
import { useState, useEffect } from 'react'

const TEMPLATES = {
  electronics: [
    { label: 'Brand', key: 'brand', placeholder: 'e.g. Sony' },
    { label: 'Model', key: 'model', placeholder: 'e.g. WH-1000XM4' },
    { label: 'Age', key: 'age', placeholder: 'e.g. 2 years' },
    { label: 'Condition details', key: 'conditionDetails', placeholder: 'e.g. minor scratch on back' },
    { label: "What's included", key: 'includes', placeholder: 'e.g. Original box, charger' },
    { label: 'Reason for selling', key: 'reason', placeholder: 'e.g. Upgrading' },
  ],
  clothing: [
    { label: 'Brand', key: 'brand', placeholder: 'e.g. Zara' },
    { label: 'Size', key: 'size', placeholder: 'e.g. M / 32 / UK8' },
    { label: 'Color', key: 'color', placeholder: 'e.g. Navy blue' },
    { label: 'Condition details', key: 'conditionDetails', placeholder: 'e.g. No stains, slight fade' },
    { label: 'Times worn', key: 'timesWorn', placeholder: 'e.g. 3–4 times' },
  ],
  furniture: [
    { label: 'Item type', key: 'itemType', placeholder: 'e.g. 3-seater sofa' },
    { label: 'Dimensions', key: 'dimensions', placeholder: 'e.g. 180cm x 85cm' },
    { label: 'Material', key: 'material', placeholder: 'e.g. Solid wood' },
    { label: 'Color', key: 'color', placeholder: 'e.g. Walnut brown' },
    { label: 'Age', key: 'age', placeholder: 'e.g. 3 years' },
    { label: 'Assembly required', key: 'assembly', placeholder: 'Yes / No' },
  ],
  books: [
    { label: 'Title', key: 'bookTitle', placeholder: 'e.g. Atomic Habits' },
    { label: 'Author', key: 'author', placeholder: 'e.g. James Clear' },
    { label: 'Edition / Year', key: 'edition', placeholder: 'e.g. 2nd edition, 2021' },
    { label: 'Condition details', key: 'conditionDetails', placeholder: 'e.g. No highlights, spine intact' },
  ],
  vehicles: [
    { label: 'Make', key: 'make', placeholder: 'e.g. Honda' },
    { label: 'Model', key: 'model', placeholder: 'e.g. Activa 6G' },
    { label: 'Year', key: 'year', placeholder: 'e.g. 2020' },
    { label: 'KMs driven', key: 'kms', placeholder: 'e.g. 12,000 km' },
    { label: 'Fuel type', key: 'fuel', placeholder: 'e.g. Petrol' },
    { label: 'Condition details', key: 'conditionDetails', placeholder: 'e.g. No accidents, serviced recently' },
  ],
  sports: [
    { label: 'Item', key: 'item', placeholder: 'e.g. Cricket bat' },
    { label: 'Brand', key: 'brand', placeholder: 'e.g. MRF' },
    { label: 'Size / Weight', key: 'size', placeholder: 'e.g. Full size, 1.2kg' },
    { label: 'Condition details', key: 'conditionDetails', placeholder: 'e.g. Light use, no cracks' },
    { label: 'Age', key: 'age', placeholder: 'e.g. 1 year' },
  ],
  appliances: [
    { label: 'Brand', key: 'brand', placeholder: 'e.g. Samsung' },
    { label: 'Model', key: 'model', placeholder: 'e.g. WA70T4262BW' },
    { label: 'Type', key: 'type', placeholder: 'e.g. Washing machine, AC, Refrigerator' },
    { label: 'Age', key: 'age', placeholder: 'e.g. 3 years' },
    { label: 'Condition details', key: 'conditionDetails', placeholder: 'e.g. Fully functional, no issues' },
    { label: 'Reason for selling', key: 'reason', placeholder: 'e.g. Moving house' },
  ],
  music: [
    { label: 'Instrument / Item', key: 'item', placeholder: 'e.g. Acoustic guitar' },
    { label: 'Brand', key: 'brand', placeholder: 'e.g. Yamaha' },
    { label: 'Age', key: 'age', placeholder: 'e.g. 2 years' },
    { label: 'Condition details', key: 'conditionDetails', placeholder: 'e.g. No scratches, plays well' },
    { label: "What's included", key: 'includes', placeholder: 'e.g. Case, picks, tuner' },
  ],
  'toys & games': [
    { label: 'Item', key: 'item', placeholder: 'e.g. LEGO City set' },
    { label: 'Brand', key: 'brand', placeholder: 'e.g. LEGO' },
    { label: 'Age group', key: 'ageGroup', placeholder: 'e.g. 6+ years' },
    { label: 'Condition details', key: 'conditionDetails', placeholder: 'e.g. Complete, all pieces intact' },
    { label: 'Includes original box', key: 'box', placeholder: 'Yes / No' },
  ],
  jewelry: [
    { label: 'Type', key: 'type', placeholder: 'e.g. Necklace, ring, earrings' },
    { label: 'Material', key: 'material', placeholder: 'e.g. 18K gold, silver, stainless steel' },
    { label: 'Brand', key: 'brand', placeholder: 'e.g. Tanishq (or handmade)' },
    { label: 'Condition details', key: 'conditionDetails', placeholder: 'e.g. No scratches, clasp works fine' },
    { label: 'Certificate / hallmark', key: 'cert', placeholder: 'e.g. BIS hallmarked, with certificate' },
  ],
  'art & collectibles': [
    { label: 'Item', key: 'item', placeholder: 'e.g. Watercolor painting, vintage coin' },
    { label: 'Artist / Origin', key: 'artist', placeholder: 'e.g. Self-made, local artist' },
    { label: 'Size / Dimensions', key: 'size', placeholder: 'e.g. 12x16 inches' },
    { label: 'Medium / Material', key: 'medium', placeholder: 'e.g. Oil on canvas' },
    { label: 'Condition details', key: 'conditionDetails', placeholder: 'e.g. No tears, vibrant colors' },
  ],
  kitchen: [
    { label: 'Item', key: 'item', placeholder: 'e.g. Instant Pot, stand mixer' },
    { label: 'Brand', key: 'brand', placeholder: 'e.g. Prestige, Borosil' },
    { label: 'Age', key: 'age', placeholder: 'e.g. 1 year' },
    { label: 'Condition details', key: 'conditionDetails', placeholder: 'e.g. Rarely used, no stains' },
    { label: "What's included", key: 'includes', placeholder: 'e.g. All accessories' },
  ],
  'stationery & office': [
    { label: 'Item', key: 'item', placeholder: 'e.g. Mechanical keyboard, desk lamp' },
    { label: 'Brand', key: 'brand', placeholder: 'e.g. Logitech, Staples' },
    { label: 'Condition details', key: 'conditionDetails', placeholder: 'e.g. Barely used, working' },
    { label: 'Age', key: 'age', placeholder: 'e.g. 6 months' },
  ],
  'baby & kids': [
    { label: 'Item', key: 'item', placeholder: 'e.g. Baby stroller, crib' },
    { label: 'Brand', key: 'brand', placeholder: 'e.g. Chicco, R for Rabbit' },
    { label: 'Age group', key: 'ageGroup', placeholder: 'e.g. 0–3 months, 2–4 years' },
    { label: 'Condition details', key: 'conditionDetails', placeholder: 'e.g. Gently used, sanitised' },
    { label: 'Reason for selling', key: 'reason', placeholder: 'e.g. Baby outgrew it' },
  ],
  other: [],
}

function assembleDescription(fields, values) {
  return fields
    .filter(f => values[f.key]?.trim())
    .map(f => `${f.label}: ${values[f.key].trim()}`)
    .join('\n')
}

export default function SmartTemplate({ category, onChange }) {
  const [values, setValues] = useState({})
  const fields = TEMPLATES[category] || []

  useEffect(() => {
    setValues({})
    onChange('', {})
  }, [category])

  function handleChange(key, val) {
    const updated = { ...values, [key]: val }
    setValues(updated)
    const description = assembleDescription(fields, updated)
    onChange(description, updated)
  }

  if (!category || fields.length === 0) {
    return (
      <div className="form-group">
        <label className="form-label">Description</label>
        <textarea
          className="form-input form-textarea"
          placeholder="Describe your item in detail..."
          onChange={e => onChange(e.target.value, {})}
          rows={5}
        />
      </div>
    )
  }

  const description = assembleDescription(fields, values)

  return (
    <div>
      <div style={{ marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
        <span className="badge badge-accent">✨ Smart Template</span>
        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          Fill in the fields — your description auto-generates
        </span>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px 16px', marginBottom: 16 }}>
        {fields.map(f => (
          <div key={f.key} className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">{f.label}</label>
            <input
              type="text"
              className="form-input"
              placeholder={f.placeholder}
              value={values[f.key] || ''}
              onChange={e => handleChange(f.key, e.target.value)}
            />
          </div>
        ))}
      </div>
      <div>
        <label className="form-label">Preview — how buyers will see your description</label>
        <div className={`template-preview ${description ? 'has-content' : ''}`}>
          {description || 'Start filling in the fields above to see your description...'}
        </div>
      </div>
    </div>
  )
}
