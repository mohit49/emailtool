'use client';

import React from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import CustomDropdown from './CustomDropdown';

interface UrlCondition {
  type: 'contains' | 'equals' | 'landing' | 'startsWith' | 'doesNotContain';
  value: string;
  domain?: string;
}

interface FormData {
  name: string;
  domain: string;
  urlConditions: UrlCondition[];
  logicOperators: ('AND' | 'OR')[];
  html: string;
  status: 'draft' | 'deactivated' | 'activated';
  position: 'left-top' | 'right-top' | 'left-bottom' | 'right-bottom' | 'center-top' | 'center' | 'center-bottom';
}

interface PopupSidebarProps {
  formData: FormData;
  setFormData: React.Dispatch<React.SetStateAction<FormData>>;
  isBasicSettingsCollapsed: boolean;
  setIsBasicSettingsCollapsed: (val: boolean) => void;
  previewUrl: string;
  setPreviewUrl: (val: string) => void;
  addUrlCondition: () => void;
  updateUrlCondition: (index: number, field: keyof UrlCondition, value: string) => void;
  removeUrlCondition: (index: number) => void;
  updateLogicOperator: (index: number, operator: 'AND' | 'OR') => void;
}

const PopupSidebar: React.FC<PopupSidebarProps> = ({
  formData,
  setFormData,
  isBasicSettingsCollapsed,
  setIsBasicSettingsCollapsed,
  previewUrl,
  setPreviewUrl,
  addUrlCondition,
  updateUrlCondition,
  removeUrlCondition,
  updateLogicOperator,
}) => {
  return (
    <div className="w-64 overflow-y-auto bg-white border-r border-gray-200 p-3 space-y-3 flex-shrink-0">
      {/* Popup Name */}
      <div>
        <button
          onClick={() => setIsBasicSettingsCollapsed(!isBasicSettingsCollapsed)}
          className="w-full flex items-center justify-between text-sm font-semibold text-gray-900 mb-2 hover:text-indigo-600 transition-colors"
        >
          <span>Basic Settings</span>
          {isBasicSettingsCollapsed ? (
            <ChevronDown className="w-4 h-4" />
          ) : (
            <ChevronUp className="w-4 h-4" />
          )}
        </button>
        {!isBasicSettingsCollapsed && (
          <>
            <div className="mb-2">
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Popup Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                placeholder="Enter name"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Status
              </label>
              <CustomDropdown
                value={formData.status}
                onChange={(value) => setFormData({ ...formData, status: value as any })}
                options={[
                  { value: 'draft', label: 'Draft' },
                  { value: 'deactivated', label: 'Deactivated' },
                  { value: 'activated', label: 'Activated' },
                ]}
                className="w-full"
              />
            </div>
          </>
        )}
      </div>

      {/* URL Conditions */}
      <div>
        <h2 className="text-sm font-semibold text-gray-900 mb-2">Enable Popup on Page</h2>

        {/* Domain Name - Single field at top */}
        <div className="mb-3">
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Domain Name *
          </label>
          <input
            type="text"
            value={formData.domain}
            onChange={(e) => {
              const domain = e.target.value;
              setFormData({ ...formData, domain });
              // Update preview URL if it's empty or matches the old domain pattern
              if (!previewUrl || previewUrl.includes(formData.domain)) {
                const newUrl = domain 
                  ? (domain.startsWith('http://') || domain.startsWith('https://') 
                      ? domain 
                      : `https://${domain}`)
                  : '';
                setPreviewUrl(newUrl);
              }
            }}
            className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
            placeholder="example.com"
            required
          />
        </div>

        {/* URL Conditions */}
        <div className="space-y-2">
          {formData.urlConditions.map((condition, index) => (
            <div key={index}>
              {/* AND/OR Selector - Show between conditions */}
              {index > 0 && (
                <div className="mb-2 flex items-center justify-center">
                  <CustomDropdown
                    value={formData.logicOperators[index - 1] || 'OR'}
                    onChange={(value: string) => updateLogicOperator(index - 1, value as 'AND' | 'OR')}
                    options={[
                      { value: 'OR', label: 'OR' },
                      { value: 'AND', label: 'AND' },
                    ]}
                    className="px-2"
                  />
                </div>
              )}

              <div className="border border-gray-200 rounded p-2 bg-gray-50">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-gray-700">#{index + 1}</span>
                  <button
                    onClick={() => removeUrlCondition(index)}
                    className="text-red-600 hover:text-red-700 text-xs font-medium"
                  >
                    ×
                  </button>
                </div>

                {/* Condition Type - Enhanced Select */}
                <div className="mb-2">
                  <label className="block text-xs font-medium text-gray-600 mb-0.5">
                    Type
                  </label>
                  <CustomDropdown
                    value={condition.type}
                    onChange={(value: string) => updateUrlCondition(index, 'type', value as any)}
                    options={[
                      { value: 'contains', label: 'Contains' },
                      { value: 'equals', label: 'Equals' },
                      { value: 'landing', label: 'Landing Page' },
                      { value: 'startsWith', label: 'Starts With' },
                      { value: 'doesNotContain', label: 'Does Not Contain' },
                    ]}
                    className="w-full"
                  />
                </div>

                {/* URL Value (hidden for landing page) */}
                {condition.type !== 'landing' && (
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-0.5">
                      URL Value *
                    </label>
                    <input
                      type="text"
                      value={condition.value}
                      onChange={(e) => updateUrlCondition(index, 'value', e.target.value)}
                      className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                      placeholder={
                        condition.type === 'contains' ? '/products' :
                        condition.type === 'equals' ? 'https://example.com/page' :
                        condition.type === 'startsWith' ? '/blog' :
                        '/exclude'
                      }
                      required
                    />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={addUrlCondition}
          className="mt-2 w-full px-2 py-1.5 text-xs text-indigo-600 border border-indigo-300 rounded hover:bg-indigo-50 transition-colors font-medium"
        >
          + Add Condition
        </button>
      </div>
    </div>
  );
};

export default PopupSidebar;

