// =====================================================
// SizeGuide.jsx  —  modal popup for size chart
// =====================================================
// Usage in ProductView.jsx:
//   import SizeGuide from '../components/SizeGuide';
//   const [showSizeGuide, setShowSizeGuide] = useState(false);
//   <button onClick={() => setShowSizeGuide(true)}>Size Chart</button>
//   <SizeGuide isOpen={showSizeGuide} onClose={() => setShowSizeGuide(false)} />

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Ruler } from 'lucide-react';

const sizes = [
  { size: 'XS',  bust: '32"', waist: '26"', hip: '36"', length: '40"' },
  { size: 'S',   bust: '34"', waist: '28"', hip: '38"', length: '41"' },
  { size: 'M',   bust: '36"', waist: '30"', hip: '40"', length: '42"' },
  { size: 'L',   bust: '38"', waist: '32"', hip: '42"', length: '43"' },
  { size: 'XL',  bust: '40"', waist: '34"', hip: '44"', length: '44"' },
  { size: 'XXL', bust: '42"', waist: '36"', hip: '46"', length: '45"' },
];

const tips = [
  'Measure over light clothing or directly on skin.',
  'Bust: measure around the fullest part of your chest.',
  'Waist: measure around the narrowest part of your waist.',
  'Hip: measure around the fullest part of your hips.',
  'If between sizes, order the larger size for comfort.',
];

const SizeGuide = ({ isOpen, onClose }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black/50 z-[100] backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            className="fixed inset-x-4 top-1/2 -translate-y-1/2 z-[101] bg-white rounded-3xl shadow-2xl max-w-2xl mx-auto overflow-hidden"
            initial={{ opacity: 0, scale: 0.92, y: '-48%' }}
            animate={{ opacity: 1, scale: 1,    y: '-50%' }}
            exit={{   opacity: 0, scale: 0.92, y: '-48%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 28 }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-border-color bg-bg-main">
              <div className="flex items-center gap-3">
                <Ruler size={20} className="text-primary" />
                <h2 className="text-xl font-black font-serif text-text-main">Size Guide</h2>
              </div>
              <button
                onClick={onClose}
                className="w-9 h-9 rounded-full bg-white border border-border-color flex items-center justify-center text-text-muted hover:text-text-main transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Table */}
            <div className="overflow-x-auto px-6 py-5">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-primary text-white rounded-xl overflow-hidden">
                    {['Size', 'Bust', 'Waist', 'Hip', 'Length'].map(h => (
                      <th key={h} className="px-4 py-3 font-bold text-center first:rounded-l-xl last:rounded-r-xl">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {sizes.map((row, i) => (
                    <tr
                      key={row.size}
                      className={`text-center transition-colors ${i % 2 === 0 ? 'bg-bg-main' : 'bg-white'}`}
                    >
                      <td className="px-4 py-3 font-black text-primary">{row.size}</td>
                      <td className="px-4 py-3 text-text-main font-medium">{row.bust}</td>
                      <td className="px-4 py-3 text-text-main font-medium">{row.waist}</td>
                      <td className="px-4 py-3 text-text-main font-medium">{row.hip}</td>
                      <td className="px-4 py-3 text-text-main font-medium">{row.length}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Tips */}
            <div className="px-6 pb-6">
              <h3 className="font-bold text-text-main mb-3 text-sm">Measurement Tips</h3>
              <ul className="space-y-2">
                {tips.map((tip, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-text-muted">
                    <span className="text-primary font-black mt-0.5">•</span> {tip}
                  </li>
                ))}
              </ul>
            </div>

            {/* Close Button */}
            <div className="px-6 pb-6">
              <button
                onClick={onClose}
                className="w-full bg-primary text-white py-3 rounded-xl font-bold hover:bg-primary-hover transition-colors"
              >
                Got it!
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default SizeGuide;
