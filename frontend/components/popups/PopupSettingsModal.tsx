'use client';

import React from 'react';
import { X } from 'lucide-react';
import CustomDropdown from './CustomDropdown';

interface PopupCssSettings {
  padding: string;
  border: string;
  borderRadius: string;
  backgroundColor: string;
  textAlign: string;
}

interface PopupSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  popupCssSettings: PopupCssSettings;
  setPopupCssSettings: React.Dispatch<React.SetStateAction<PopupCssSettings>>;
}

const PopupSettingsModal: React.FC<PopupSettingsModalProps> = ({
  isOpen,
  onClose,
  popupCssSettings,
  setPopupCssSettings,
}) => {
  if (!isOpen) return null;

  const handleChange = (field: keyof PopupCssSettings, value: string) => {
    setPopupCssSettings((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[1000000] p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white z-10">
          <h2 className="text-xl font-semibold text-gray-900">Popup CSS Settings</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        <div className="px-6 py-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Padding
            </label>
            <input
              type="text"
              value={popupCssSettings.padding}
              onChange={(e) => handleChange('padding', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
              placeholder="40px 20px"
            />
            <p className="mt-1 text-xs text-gray-500">e.g., 40px 20px or 20px</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Border
            </label>
            <input
              type="text"
              value={popupCssSettings.border}
              onChange={(e) => handleChange('border', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
              placeholder="2px dashed #cbd5e1"
            />
            <p className="mt-1 text-xs text-gray-500">e.g., 2px dashed #cbd5e1 or 1px solid #000</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Border Radius
            </label>
            <input
              type="text"
              value={popupCssSettings.borderRadius}
              onChange={(e) => handleChange('borderRadius', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
              placeholder="8px"
            />
            <p className="mt-1 text-xs text-gray-500">e.g., 8px or 12px</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Background Color
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={popupCssSettings.backgroundColor}
                onChange={(e) => handleChange('backgroundColor', e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                placeholder="#f9fafb"
              />
              <input
                type="color"
                value={popupCssSettings.backgroundColor || '#f9fafb'}
                onChange={(e) => handleChange('backgroundColor', e.target.value)}
                className="w-12 h-10 border border-gray-300 rounded-lg cursor-pointer"
              />
            </div>
            <p className="mt-1 text-xs text-gray-500">e.g., #f9fafb or rgb(249, 250, 251)</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Text Align
            </label>
            <CustomDropdown
              value={popupCssSettings.textAlign}
              onChange={(value: string) => handleChange('textAlign', value)}
              options={[
                { value: 'left', label: 'Left' },
                { value: 'center', label: 'Center' },
                { value: 'right', label: 'Right' },
                { value: 'justify', label: 'Justify' },
              ]}
              className="w-full"
            />
          </div>
        </div>
        <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Apply
          </button>
        </div>
      </div>
    </div>
  );
};

export default PopupSettingsModal;


