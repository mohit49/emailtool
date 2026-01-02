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
  mobileWidth: string;
  desktopWidth: string;
  zIndex: string;
  position: string;
  overflow: string;
}

interface BackdropSettings {
  backdropEnabled: boolean;
  backdropColor: string;
  backdropOpacity: number;
}

interface TriggerSettings {
  closeOnSuccessfulSubmit: boolean;
}

interface PopupSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  popupCssSettings: PopupCssSettings;
  setPopupCssSettings: React.Dispatch<React.SetStateAction<PopupCssSettings>>;
  backdropSettings: BackdropSettings;
  setBackdropSettings: React.Dispatch<React.SetStateAction<BackdropSettings>>;
  triggerSettings: TriggerSettings;
  setTriggerSettings: React.Dispatch<React.SetStateAction<TriggerSettings>>;
}

const PopupSettingsModal: React.FC<PopupSettingsModalProps> = ({
  isOpen,
  onClose,
  popupCssSettings,
  setPopupCssSettings,
  backdropSettings,
  setBackdropSettings,
  triggerSettings,
  setTriggerSettings,
}) => {
  if (!isOpen) return null;

  const handleChange = (field: keyof PopupCssSettings, value: string) => {
    setPopupCssSettings((prev) => ({ ...prev, [field]: value }));
  };

  const handleBackdropChange = (field: keyof BackdropSettings, value: boolean | string | number) => {
    setBackdropSettings((prev) => ({ ...prev, [field]: value }));
  };

  const handleTriggerChange = (field: keyof TriggerSettings, value: boolean) => {
    setTriggerSettings((prev) => ({ ...prev, [field]: value }));
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
          {/* Backdrop Settings Section - Moved to top for visibility */}
          <div className="pb-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Backdrop Overlay</h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="block text-sm font-medium text-gray-700">
                  Enable Backdrop
                </label>
                <button
                  type="button"
                  onClick={() => handleBackdropChange('backdropEnabled', !backdropSettings.backdropEnabled)}
                  className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${
                    backdropSettings.backdropEnabled ? 'bg-indigo-600' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      backdropSettings.backdropEnabled ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {backdropSettings.backdropEnabled && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Background Color
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={backdropSettings.backdropColor}
                        onChange={(e) => handleBackdropChange('backdropColor', e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                        placeholder="#000000"
                      />
                      <input
                        type="color"
                        value={backdropSettings.backdropColor || '#000000'}
                        onChange={(e) => handleBackdropChange('backdropColor', e.target.value)}
                        className="w-12 h-10 border border-gray-300 rounded-lg cursor-pointer"
                      />
                    </div>
                    <p className="mt-1 text-xs text-gray-500">e.g., #000000 or rgba(0, 0, 0, 0.5)</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Opacity: {Math.round(backdropSettings.backdropOpacity * 100)}%
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.01"
                      value={backdropSettings.backdropOpacity}
                      onChange={(e) => handleBackdropChange('backdropOpacity', parseFloat(e.target.value))}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>0%</span>
                      <span>50%</span>
                      <span>100%</span>
                    </div>
                    <p className="mt-1 text-xs text-gray-500">Adjust the transparency of the backdrop overlay</p>
                  </div>
                </>
              )}
            </div>
          </div>

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

          {/* Responsive Width Settings */}
          <div className="pt-6 border-t border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Responsive Width</h3>
            <p className="text-sm text-gray-500 mb-4">
              Set different widths for mobile and desktop devices. The popup will automatically adjust based on screen size.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                    Mobile Width
                  </div>
                </label>
                <input
                  type="text"
                  value={popupCssSettings.mobileWidth}
                  onChange={(e) => handleChange('mobileWidth', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                  placeholder="90% or 320px"
                />
                <p className="mt-1 text-xs text-gray-500">Applied on screens &lt; 768px. e.g., 90%, 320px, 100vw</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    Desktop Width
                  </div>
                </label>
                <input
                  type="text"
                  value={popupCssSettings.desktopWidth}
                  onChange={(e) => handleChange('desktopWidth', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                  placeholder="500px or 50%"
                />
                <p className="mt-1 text-xs text-gray-500">Applied on screens ≥ 768px. e.g., 500px, 50%, 600px</p>
              </div>
            </div>
          </div>

          {/* Submit Trigger Settings */}
          <div className="pt-6 border-t border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Submit Trigger</h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Close Popup on Successful Submit
                  </label>
                  <p className="text-xs text-gray-500">
                    If enabled, the popup will automatically close when a form is successfully submitted. If submission fails, the popup will remain open.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleTriggerChange('closeOnSuccessfulSubmit', !triggerSettings.closeOnSuccessfulSubmit)}
                  className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ml-4 ${
                    triggerSettings.closeOnSuccessfulSubmit ? 'bg-indigo-600' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      triggerSettings.closeOnSuccessfulSubmit ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>
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





