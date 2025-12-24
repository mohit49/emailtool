'use client';

import React from 'react';
import { X } from 'lucide-react';

interface EditingElementCss {
  width: string;
  height: string;
  minWidth: string;
  maxWidth: string;
  minHeight: string;
  maxHeight: string;
  padding: string;
  margin: string;
  borderWidth: string;
  borderStyle: string;
  borderColor: string;
  backgroundColor: string;
  backgroundGradient: string;
  color: string;
  fontSize: string;
  fontWeight: string;
  fontStyle: string;
  fontFamily: string;
  borderRadius: string;
  boxShadow: string;
  mobileCss: any;
  tabletCss: any;
  desktopCss: any;
}

interface CssEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingElementCss: EditingElementCss;
  setEditingElementCss: React.Dispatch<React.SetStateAction<EditingElementCss>>;
  applyCssChanges: () => void;
  elementTagName?: string;
}

const CssEditorModal: React.FC<CssEditorModalProps> = ({
  isOpen,
  onClose,
  editingElementCss,
  setEditingElementCss,
  applyCssChanges,
  elementTagName,
}) => {
  if (!isOpen) return null;

  const handleChange = (field: keyof EditingElementCss, value: string) => {
    setEditingElementCss((prev) => ({ ...prev, [field]: value }));
  };

  // Check if element is a text element (P, H1-H6)
  const isTextElement = elementTagName && ['P', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6'].includes(elementTagName.toUpperCase());

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[1000000] p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white z-10">
          <h2 className="text-xl font-semibold text-gray-900">Edit Element CSS</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <div className="px-6 py-6 space-y-6">
          {/* Layout & Dimensions - Only for non-text elements */}
          {!isTextElement && (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Layout & Dimensions</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Width</label>
                <input
                  type="text"
                  value={editingElementCss.width}
                  onChange={(e) => handleChange('width', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                  placeholder="auto, 100px, 50%"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Height</label>
                <input
                  type="text"
                  value={editingElementCss.height}
                  onChange={(e) => handleChange('height', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                  placeholder="auto, 100px, 50%"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Min Width</label>
                <input
                  type="text"
                  value={editingElementCss.minWidth}
                  onChange={(e) => handleChange('minWidth', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                  placeholder="100px, 50%"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Max Width</label>
                <input
                  type="text"
                  value={editingElementCss.maxWidth}
                  onChange={(e) => handleChange('maxWidth', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                  placeholder="1000px, 100%"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Min Height</label>
                <input
                  type="text"
                  value={editingElementCss.minHeight}
                  onChange={(e) => handleChange('minHeight', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                  placeholder="100px, 50vh"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Max Height</label>
                <input
                  type="text"
                  value={editingElementCss.maxHeight}
                  onChange={(e) => handleChange('maxHeight', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                  placeholder="800px, 100vh"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Padding</label>
                <input
                  type="text"
                  value={editingElementCss.padding}
                  onChange={(e) => handleChange('padding', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                  placeholder="10px, 10px 20px"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Margin</label>
                <input
                  type="text"
                  value={editingElementCss.margin}
                  onChange={(e) => handleChange('margin', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                  placeholder="10px, 10px 20px"
                />
              </div>
            </div>
          </div>
          )}

          {/* Border - Only for non-text elements */}
          {!isTextElement && (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Border</h3>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Width</label>
                <input
                  type="text"
                  value={editingElementCss.borderWidth}
                  onChange={(e) => handleChange('borderWidth', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                  placeholder="1px, 2px"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Style</label>
                <select
                  value={editingElementCss.borderStyle}
                  onChange={(e) => handleChange('borderStyle', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                >
                  <option value="solid">Solid</option>
                  <option value="dashed">Dashed</option>
                  <option value="dotted">Dotted</option>
                  <option value="double">Double</option>
                  <option value="none">None</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Color</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={editingElementCss.borderColor}
                    onChange={(e) => handleChange('borderColor', e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                    placeholder="#000000"
                  />
                  <input
                    type="color"
                    value={editingElementCss.borderColor || '#000000'}
                    onChange={(e) => handleChange('borderColor', e.target.value)}
                    className="w-12 h-10 border border-gray-300 rounded-lg cursor-pointer"
                  />
                </div>
              </div>
            </div>
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Border Radius</label>
              <input
                type="text"
                value={editingElementCss.borderRadius}
                onChange={(e) => handleChange('borderRadius', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                placeholder="0px, 8px, 50%"
              />
            </div>
          </div>
          )}

          {/* Background - Only for non-text elements */}
          {!isTextElement && (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Background</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Background Color</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={editingElementCss.backgroundColor}
                    onChange={(e) => handleChange('backgroundColor', e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                    placeholder="#ffffff"
                  />
                  <input
                    type="color"
                    value={editingElementCss.backgroundColor || '#ffffff'}
                    onChange={(e) => handleChange('backgroundColor', e.target.value)}
                    className="w-12 h-10 border border-gray-300 rounded-lg cursor-pointer"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Gradient (overrides color)</label>
                <input
                  type="text"
                  value={editingElementCss.backgroundGradient}
                  onChange={(e) => handleChange('backgroundGradient', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                  placeholder="linear-gradient(90deg, #4f46e5, #0ea5e9)"
                />
              </div>
            </div>
          </div>
          )}

          {/* Box Shadow - Only for non-text elements */}
          {!isTextElement && (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Box Shadow</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Preset Shadows</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => handleChange('boxShadow', 'rgba(149, 157, 165, 0.2) 0px 8px 24px')}
                    className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-left"
                  >
                    Minimum
                  </button>
                  <button
                    type="button"
                    onClick={() => handleChange('boxShadow', 'rgba(100, 100, 111, 0.2) 0px 7px 29px 0px')}
                    className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-left"
                  >
                    Large
                  </button>
                  <button
                    type="button"
                    onClick={() => handleChange('boxShadow', 'rgba(255, 255, 255, 0.1) 0px 1px 1px 0px inset, rgba(50, 50, 93, 0.25) 0px 50px 100px -20px, rgba(0, 0, 0, 0.3) 0px 30px 60px -30px')}
                    className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-left"
                  >
                    Extra Large
                  </button>
                  <button
                    type="button"
                    onClick={() => handleChange('boxShadow', 'rgba(17, 17, 26, 0.1) 0px 8px 24px, rgba(17, 17, 26, 0.1) 0px 16px 56px, rgba(17, 17, 26, 0.1) 0px 24px 80px')}
                    className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-left"
                  >
                    Huge
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Custom Box Shadow</label>
                <input
                  type="text"
                  value={editingElementCss.boxShadow}
                  onChange={(e) => handleChange('boxShadow', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                  placeholder="rgba(0, 0, 0, 0.1) 0px 4px 6px"
                />
              </div>
            </div>
          </div>
          )}

          {/* Typography - Always visible, but more prominent for text elements */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Typography</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Text Color</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={editingElementCss.color}
                    onChange={(e) => handleChange('color', e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                    placeholder="#000000"
                  />
                  <input
                    type="color"
                    value={editingElementCss.color || '#000000'}
                    onChange={(e) => handleChange('color', e.target.value)}
                    className="w-12 h-10 border border-gray-300 rounded-lg cursor-pointer"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Font Size</label>
                <input
                  type="text"
                  value={editingElementCss.fontSize}
                  onChange={(e) => handleChange('fontSize', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                  placeholder="14px, 1rem"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Font Family</label>
                <input
                  type="text"
                  value={editingElementCss.fontFamily}
                  onChange={(e) => handleChange('fontFamily', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                  placeholder="Arial, sans-serif"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Font Weight</label>
                <select
                  value={editingElementCss.fontWeight}
                  onChange={(e) => handleChange('fontWeight', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                >
                  <option value="">Default</option>
                  <option value="300">Light (300)</option>
                  <option value="400">Normal (400)</option>
                  <option value="500">Medium (500)</option>
                  <option value="600">Semi-bold (600)</option>
                  <option value="700">Bold (700)</option>
                  <option value="800">Extra-bold (800)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Font Style</label>
                <select
                  value={editingElementCss.fontStyle}
                  onChange={(e) => handleChange('fontStyle', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                >
                  <option value="">Default</option>
                  <option value="normal">Normal</option>
                  <option value="italic">Italic</option>
                  <option value="oblique">Oblique</option>
                </select>
              </div>
            </div>
          </div>

          {/* Responsive Options Info */}
          <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-indigo-900 mb-2">📱 Responsive Design</h3>
            <p className="text-sm text-indigo-700">
              These styles will apply to all screen sizes. Responsive CSS (mobile, tablet, desktop specific) will be available in the next update.
            </p>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3 sticky bottom-0 bg-white">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={applyCssChanges}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Apply Changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default CssEditorModal;

