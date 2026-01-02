'use client';

import React, { useState } from 'react';
import { X, ChevronDown, ChevronUp } from 'lucide-react';
import Editor from '@monaco-editor/react';

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
  objectFit: string;
  // Flexbox properties
  display: string;
  flexDirection: string;
  flexWrap: string;
  justifyContent: string;
  alignItems: string;
  alignContent: string;
  gap: string;
  flexGrow: string;
  flexShrink: string;
  flexBasis: string;
  alignSelf: string;
  mobileCss: any;
  tabletCss: any;
  desktopCss: any;
  customCss: string;
  mobileCustomCss: string;
  tabletCustomCss: string;
  desktopCustomCss: string;
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
  const [openAccordions, setOpenAccordions] = useState({
    mobile: false,
    tablet: false,
    desktop: false,
  });

  const toggleAccordion = (key: 'mobile' | 'tablet' | 'desktop') => {
    setOpenAccordions(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleChange = (field: keyof EditingElementCss, value: string | any) => {
    setEditingElementCss((prev) => ({ ...prev, [field]: value }));
  };

  // Check if element is a text element (P, H1-H6)
  const isTextElement = elementTagName && ['P', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6'].includes(elementTagName.toUpperCase());
  
  // Check if element is an image element
  const isImageElement = elementTagName && elementTagName.toUpperCase() === 'IMG';

  if (!isOpen) {
    return null;
  }

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
          {/* Flexbox - Only for non-text elements */}
          {!isTextElement && (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Flexbox</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Display</label>
                <select
                  value={editingElementCss.display || ''}
                  onChange={(e) => handleChange('display', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                >
                  <option value="">Default</option>
                  <option value="flex">Flex</option>
                  <option value="inline-flex">Inline Flex</option>
                  <option value="block">Block</option>
                  <option value="inline-block">Inline Block</option>
                  <option value="grid">Grid</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Flex Direction</label>
                <select
                  value={editingElementCss.flexDirection || ''}
                  onChange={(e) => handleChange('flexDirection', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                >
                  <option value="">Default</option>
                  <option value="row">Row</option>
                  <option value="column">Column</option>
                  <option value="row-reverse">Row Reverse</option>
                  <option value="column-reverse">Column Reverse</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Flex Wrap</label>
                <select
                  value={editingElementCss.flexWrap || ''}
                  onChange={(e) => handleChange('flexWrap', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                >
                  <option value="">Default</option>
                  <option value="nowrap">No Wrap</option>
                  <option value="wrap">Wrap</option>
                  <option value="wrap-reverse">Wrap Reverse</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Justify Content</label>
                <select
                  value={editingElementCss.justifyContent || ''}
                  onChange={(e) => handleChange('justifyContent', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                >
                  <option value="">Default</option>
                  <option value="flex-start">Flex Start</option>
                  <option value="flex-end">Flex End</option>
                  <option value="center">Center</option>
                  <option value="space-between">Space Between</option>
                  <option value="space-around">Space Around</option>
                  <option value="space-evenly">Space Evenly</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Align Items</label>
                <select
                  value={editingElementCss.alignItems || ''}
                  onChange={(e) => handleChange('alignItems', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                >
                  <option value="">Default</option>
                  <option value="flex-start">Flex Start</option>
                  <option value="flex-end">Flex End</option>
                  <option value="center">Center</option>
                  <option value="baseline">Baseline</option>
                  <option value="stretch">Stretch</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Align Content</label>
                <select
                  value={editingElementCss.alignContent || ''}
                  onChange={(e) => handleChange('alignContent', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                >
                  <option value="">Default</option>
                  <option value="flex-start">Flex Start</option>
                  <option value="flex-end">Flex End</option>
                  <option value="center">Center</option>
                  <option value="space-between">Space Between</option>
                  <option value="space-around">Space Around</option>
                  <option value="stretch">Stretch</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Gap</label>
                <input
                  type="text"
                  value={editingElementCss.gap || ''}
                  onChange={(e) => handleChange('gap', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                  placeholder="10px, 1rem"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Flex Grow</label>
                <input
                  type="text"
                  value={editingElementCss.flexGrow || ''}
                  onChange={(e) => handleChange('flexGrow', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                  placeholder="0, 1, 2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Flex Shrink</label>
                <input
                  type="text"
                  value={editingElementCss.flexShrink || ''}
                  onChange={(e) => handleChange('flexShrink', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                  placeholder="0, 1"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Flex Basis</label>
                <input
                  type="text"
                  value={editingElementCss.flexBasis || ''}
                  onChange={(e) => handleChange('flexBasis', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                  placeholder="auto, 200px, 50%"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Align Self</label>
                <select
                  value={editingElementCss.alignSelf || ''}
                  onChange={(e) => handleChange('alignSelf', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                >
                  <option value="">Default</option>
                  <option value="auto">Auto</option>
                  <option value="flex-start">Flex Start</option>
                  <option value="flex-end">Flex End</option>
                  <option value="center">Center</option>
                  <option value="baseline">Baseline</option>
                  <option value="stretch">Stretch</option>
                </select>
              </div>
            </div>
          </div>
          )}

          {/* Layout & Dimensions - Only for non-text elements */}
          {!isTextElement && (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Layout & Dimensions</h3>
            
            {/* Default (All Devices) */}
            <div className="mb-6">
              <h4 className="text-sm font-semibold text-gray-800 mb-3">Default (All Devices)</h4>
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

            {/* Mobile Responsive */}
            <div className="mb-4 border-t border-gray-200 pt-4">
              <button
                type="button"
                onClick={() => toggleAccordion('mobile')}
                className="w-full flex items-center justify-between text-sm font-semibold text-gray-800 mb-3 hover:text-indigo-600 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                  Mobile (max-width: 767px)
                </div>
                {openAccordions.mobile ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
              </button>
              {openAccordions.mobile && (
              <>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Width</label>
                  <input
                    type="text"
                    value={typeof editingElementCss.mobileCss === 'object' && editingElementCss.mobileCss?.width ? editingElementCss.mobileCss.width : ''}
                    onChange={(e) => {
                      const mobileCss = typeof editingElementCss.mobileCss === 'object' ? (editingElementCss.mobileCss || {}) : {};
                      handleChange('mobileCss', { ...mobileCss, width: e.target.value });
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                    placeholder="100%, 320px"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Height</label>
                  <input
                    type="text"
                    value={typeof editingElementCss.mobileCss === 'object' && editingElementCss.mobileCss?.height ? editingElementCss.mobileCss.height : ''}
                    onChange={(e) => {
                      const mobileCss = typeof editingElementCss.mobileCss === 'object' ? (editingElementCss.mobileCss || {}) : {};
                      handleChange('mobileCss', { ...mobileCss, height: e.target.value });
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                    placeholder="auto, 200px"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Min Width</label>
                  <input
                    type="text"
                    value={typeof editingElementCss.mobileCss === 'object' && editingElementCss.mobileCss?.minWidth ? editingElementCss.mobileCss.minWidth : ''}
                    onChange={(e) => {
                      const mobileCss = typeof editingElementCss.mobileCss === 'object' ? (editingElementCss.mobileCss || {}) : {};
                      handleChange('mobileCss', { ...mobileCss, minWidth: e.target.value });
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                    placeholder="100px"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Max Width</label>
                  <input
                    type="text"
                    value={typeof editingElementCss.mobileCss === 'object' && editingElementCss.mobileCss?.maxWidth ? editingElementCss.mobileCss.maxWidth : ''}
                    onChange={(e) => {
                      const mobileCss = typeof editingElementCss.mobileCss === 'object' ? (editingElementCss.mobileCss || {}) : {};
                      handleChange('mobileCss', { ...mobileCss, maxWidth: e.target.value });
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                    placeholder="100%"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Min Height</label>
                  <input
                    type="text"
                    value={typeof editingElementCss.mobileCss === 'object' && editingElementCss.mobileCss?.minHeight ? editingElementCss.mobileCss.minHeight : ''}
                    onChange={(e) => {
                      const mobileCss = typeof editingElementCss.mobileCss === 'object' ? (editingElementCss.mobileCss || {}) : {};
                      handleChange('mobileCss', { ...mobileCss, minHeight: e.target.value });
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                    placeholder="100px"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Max Height</label>
                  <input
                    type="text"
                    value={typeof editingElementCss.mobileCss === 'object' && editingElementCss.mobileCss?.maxHeight ? editingElementCss.mobileCss.maxHeight : ''}
                    onChange={(e) => {
                      const mobileCss = typeof editingElementCss.mobileCss === 'object' ? (editingElementCss.mobileCss || {}) : {};
                      handleChange('mobileCss', { ...mobileCss, maxHeight: e.target.value });
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                    placeholder="500px"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Padding</label>
                  <input
                    type="text"
                    value={typeof editingElementCss.mobileCss === 'object' && editingElementCss.mobileCss?.padding ? editingElementCss.mobileCss.padding : ''}
                    onChange={(e) => {
                      const mobileCss = typeof editingElementCss.mobileCss === 'object' ? (editingElementCss.mobileCss || {}) : {};
                      handleChange('mobileCss', { ...mobileCss, padding: e.target.value });
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                    placeholder="10px, 10px 20px"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Margin</label>
                  <input
                    type="text"
                    value={typeof editingElementCss.mobileCss === 'object' && editingElementCss.mobileCss?.margin ? editingElementCss.mobileCss.margin : ''}
                    onChange={(e) => {
                      const mobileCss = typeof editingElementCss.mobileCss === 'object' ? (editingElementCss.mobileCss || {}) : {};
                      handleChange('mobileCss', { ...mobileCss, margin: e.target.value });
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                    placeholder="10px, 10px 20px"
                  />
                </div>
              </div>
              
              {/* Mobile Flexbox */}
              <div className="mt-4 pt-4 border-t border-gray-200">
                <h4 className="text-sm font-semibold text-gray-800 mb-3">Flexbox Options</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Display</label>
                    <select
                      value={typeof editingElementCss.mobileCss === 'object' && editingElementCss.mobileCss?.display ? editingElementCss.mobileCss.display : ''}
                      onChange={(e) => {
                        const mobileCss = typeof editingElementCss.mobileCss === 'object' ? (editingElementCss.mobileCss || {}) : {};
                        handleChange('mobileCss', { ...mobileCss, display: e.target.value });
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                    >
                      <option value="">Default</option>
                      <option value="flex">Flex</option>
                      <option value="inline-flex">Inline Flex</option>
                      <option value="block">Block</option>
                      <option value="inline-block">Inline Block</option>
                      <option value="grid">Grid</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Flex Direction</label>
                    <select
                      value={typeof editingElementCss.mobileCss === 'object' && editingElementCss.mobileCss?.flexDirection ? editingElementCss.mobileCss.flexDirection : ''}
                      onChange={(e) => {
                        const mobileCss = typeof editingElementCss.mobileCss === 'object' ? (editingElementCss.mobileCss || {}) : {};
                        handleChange('mobileCss', { ...mobileCss, flexDirection: e.target.value });
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                    >
                      <option value="">Default</option>
                      <option value="row">Row</option>
                      <option value="column">Column</option>
                      <option value="row-reverse">Row Reverse</option>
                      <option value="column-reverse">Column Reverse</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Flex Wrap</label>
                    <select
                      value={typeof editingElementCss.mobileCss === 'object' && editingElementCss.mobileCss?.flexWrap ? editingElementCss.mobileCss.flexWrap : ''}
                      onChange={(e) => {
                        const mobileCss = typeof editingElementCss.mobileCss === 'object' ? (editingElementCss.mobileCss || {}) : {};
                        handleChange('mobileCss', { ...mobileCss, flexWrap: e.target.value });
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                    >
                      <option value="">Default</option>
                      <option value="nowrap">No Wrap</option>
                      <option value="wrap">Wrap</option>
                      <option value="wrap-reverse">Wrap Reverse</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Justify Content</label>
                    <select
                      value={typeof editingElementCss.mobileCss === 'object' && editingElementCss.mobileCss?.justifyContent ? editingElementCss.mobileCss.justifyContent : ''}
                      onChange={(e) => {
                        const mobileCss = typeof editingElementCss.mobileCss === 'object' ? (editingElementCss.mobileCss || {}) : {};
                        handleChange('mobileCss', { ...mobileCss, justifyContent: e.target.value });
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                    >
                      <option value="">Default</option>
                      <option value="flex-start">Flex Start</option>
                      <option value="flex-end">Flex End</option>
                      <option value="center">Center</option>
                      <option value="space-between">Space Between</option>
                      <option value="space-around">Space Around</option>
                      <option value="space-evenly">Space Evenly</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Align Items</label>
                    <select
                      value={typeof editingElementCss.mobileCss === 'object' && editingElementCss.mobileCss?.alignItems ? editingElementCss.mobileCss.alignItems : ''}
                      onChange={(e) => {
                        const mobileCss = typeof editingElementCss.mobileCss === 'object' ? (editingElementCss.mobileCss || {}) : {};
                        handleChange('mobileCss', { ...mobileCss, alignItems: e.target.value });
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                    >
                      <option value="">Default</option>
                      <option value="flex-start">Flex Start</option>
                      <option value="flex-end">Flex End</option>
                      <option value="center">Center</option>
                      <option value="baseline">Baseline</option>
                      <option value="stretch">Stretch</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Align Content</label>
                    <select
                      value={typeof editingElementCss.mobileCss === 'object' && editingElementCss.mobileCss?.alignContent ? editingElementCss.mobileCss.alignContent : ''}
                      onChange={(e) => {
                        const mobileCss = typeof editingElementCss.mobileCss === 'object' ? (editingElementCss.mobileCss || {}) : {};
                        handleChange('mobileCss', { ...mobileCss, alignContent: e.target.value });
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                    >
                      <option value="">Default</option>
                      <option value="flex-start">Flex Start</option>
                      <option value="flex-end">Flex End</option>
                      <option value="center">Center</option>
                      <option value="space-between">Space Between</option>
                      <option value="space-around">Space Around</option>
                      <option value="stretch">Stretch</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Gap</label>
                    <input
                      type="text"
                      value={typeof editingElementCss.mobileCss === 'object' && editingElementCss.mobileCss?.gap ? editingElementCss.mobileCss.gap : ''}
                      onChange={(e) => {
                        const mobileCss = typeof editingElementCss.mobileCss === 'object' ? (editingElementCss.mobileCss || {}) : {};
                        handleChange('mobileCss', { ...mobileCss, gap: e.target.value });
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                      placeholder="10px, 1rem"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Flex Grow</label>
                    <input
                      type="text"
                      value={typeof editingElementCss.mobileCss === 'object' && editingElementCss.mobileCss?.flexGrow ? editingElementCss.mobileCss.flexGrow : ''}
                      onChange={(e) => {
                        const mobileCss = typeof editingElementCss.mobileCss === 'object' ? (editingElementCss.mobileCss || {}) : {};
                        handleChange('mobileCss', { ...mobileCss, flexGrow: e.target.value });
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                      placeholder="0, 1, 2"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Flex Shrink</label>
                    <input
                      type="text"
                      value={typeof editingElementCss.mobileCss === 'object' && editingElementCss.mobileCss?.flexShrink ? editingElementCss.mobileCss.flexShrink : ''}
                      onChange={(e) => {
                        const mobileCss = typeof editingElementCss.mobileCss === 'object' ? (editingElementCss.mobileCss || {}) : {};
                        handleChange('mobileCss', { ...mobileCss, flexShrink: e.target.value });
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                      placeholder="0, 1"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Flex Basis</label>
                    <input
                      type="text"
                      value={typeof editingElementCss.mobileCss === 'object' && editingElementCss.mobileCss?.flexBasis ? editingElementCss.mobileCss.flexBasis : ''}
                      onChange={(e) => {
                        const mobileCss = typeof editingElementCss.mobileCss === 'object' ? (editingElementCss.mobileCss || {}) : {};
                        handleChange('mobileCss', { ...mobileCss, flexBasis: e.target.value });
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                      placeholder="auto, 200px, 50%"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Align Self</label>
                    <select
                      value={typeof editingElementCss.mobileCss === 'object' && editingElementCss.mobileCss?.alignSelf ? editingElementCss.mobileCss.alignSelf : ''}
                      onChange={(e) => {
                        const mobileCss = typeof editingElementCss.mobileCss === 'object' ? (editingElementCss.mobileCss || {}) : {};
                        handleChange('mobileCss', { ...mobileCss, alignSelf: e.target.value });
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                    >
                      <option value="">Default</option>
                      <option value="auto">Auto</option>
                      <option value="flex-start">Flex Start</option>
                      <option value="flex-end">Flex End</option>
                      <option value="center">Center</option>
                      <option value="baseline">Baseline</option>
                      <option value="stretch">Stretch</option>
                    </select>
                  </div>
                </div>
              </div>
              </>
              )}
            </div>

            {/* Tablet Responsive */}
            <div className="mb-4 border-t border-gray-200 pt-4">
              <button
                type="button"
                onClick={() => toggleAccordion('tablet')}
                className="w-full flex items-center justify-between text-sm font-semibold text-gray-800 mb-3 hover:text-indigo-600 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                  Tablet (768px - 1023px)
                </div>
                {openAccordions.tablet ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
              </button>
              {openAccordions.tablet && (
              <>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Width</label>
                  <input
                    type="text"
                    value={typeof editingElementCss.tabletCss === 'object' && editingElementCss.tabletCss?.width ? editingElementCss.tabletCss.width : ''}
                    onChange={(e) => {
                      const tabletCss = typeof editingElementCss.tabletCss === 'object' ? (editingElementCss.tabletCss || {}) : {};
                      handleChange('tabletCss', { ...tabletCss, width: e.target.value });
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                    placeholder="80%, 600px"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Height</label>
                  <input
                    type="text"
                    value={typeof editingElementCss.tabletCss === 'object' && editingElementCss.tabletCss?.height ? editingElementCss.tabletCss.height : ''}
                    onChange={(e) => {
                      const tabletCss = typeof editingElementCss.tabletCss === 'object' ? (editingElementCss.tabletCss || {}) : {};
                      handleChange('tabletCss', { ...tabletCss, height: e.target.value });
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                    placeholder="auto, 300px"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Min Width</label>
                  <input
                    type="text"
                    value={typeof editingElementCss.tabletCss === 'object' && editingElementCss.tabletCss?.minWidth ? editingElementCss.tabletCss.minWidth : ''}
                    onChange={(e) => {
                      const tabletCss = typeof editingElementCss.tabletCss === 'object' ? (editingElementCss.tabletCss || {}) : {};
                      handleChange('tabletCss', { ...tabletCss, minWidth: e.target.value });
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                    placeholder="300px"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Max Width</label>
                  <input
                    type="text"
                    value={typeof editingElementCss.tabletCss === 'object' && editingElementCss.tabletCss?.maxWidth ? editingElementCss.tabletCss.maxWidth : ''}
                    onChange={(e) => {
                      const tabletCss = typeof editingElementCss.tabletCss === 'object' ? (editingElementCss.tabletCss || {}) : {};
                      handleChange('tabletCss', { ...tabletCss, maxWidth: e.target.value });
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                    placeholder="800px"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Min Height</label>
                  <input
                    type="text"
                    value={typeof editingElementCss.tabletCss === 'object' && editingElementCss.tabletCss?.minHeight ? editingElementCss.tabletCss.minHeight : ''}
                    onChange={(e) => {
                      const tabletCss = typeof editingElementCss.tabletCss === 'object' ? (editingElementCss.tabletCss || {}) : {};
                      handleChange('tabletCss', { ...tabletCss, minHeight: e.target.value });
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                    placeholder="200px"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Max Height</label>
                  <input
                    type="text"
                    value={typeof editingElementCss.tabletCss === 'object' && editingElementCss.tabletCss?.maxHeight ? editingElementCss.tabletCss.maxHeight : ''}
                    onChange={(e) => {
                      const tabletCss = typeof editingElementCss.tabletCss === 'object' ? (editingElementCss.tabletCss || {}) : {};
                      handleChange('tabletCss', { ...tabletCss, maxHeight: e.target.value });
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                    placeholder="600px"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Padding</label>
                  <input
                    type="text"
                    value={typeof editingElementCss.tabletCss === 'object' && editingElementCss.tabletCss?.padding ? editingElementCss.tabletCss.padding : ''}
                    onChange={(e) => {
                      const tabletCss = typeof editingElementCss.tabletCss === 'object' ? (editingElementCss.tabletCss || {}) : {};
                      handleChange('tabletCss', { ...tabletCss, padding: e.target.value });
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                    placeholder="20px, 20px 30px"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Margin</label>
                  <input
                    type="text"
                    value={typeof editingElementCss.tabletCss === 'object' && editingElementCss.tabletCss?.margin ? editingElementCss.tabletCss.margin : ''}
                    onChange={(e) => {
                      const tabletCss = typeof editingElementCss.tabletCss === 'object' ? (editingElementCss.tabletCss || {}) : {};
                      handleChange('tabletCss', { ...tabletCss, margin: e.target.value });
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                    placeholder="20px, 20px 30px"
                  />
                </div>
              </div>
              
              {/* Tablet Flexbox */}
              <div className="mt-4 pt-4 border-t border-gray-200">
                <h4 className="text-sm font-semibold text-gray-800 mb-3">Flexbox Options</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Display</label>
                    <select
                      value={typeof editingElementCss.tabletCss === 'object' && editingElementCss.tabletCss?.display ? editingElementCss.tabletCss.display : ''}
                      onChange={(e) => {
                        const tabletCss = typeof editingElementCss.tabletCss === 'object' ? (editingElementCss.tabletCss || {}) : {};
                        handleChange('tabletCss', { ...tabletCss, display: e.target.value });
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                    >
                      <option value="">Default</option>
                      <option value="flex">Flex</option>
                      <option value="inline-flex">Inline Flex</option>
                      <option value="block">Block</option>
                      <option value="inline-block">Inline Block</option>
                      <option value="grid">Grid</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Flex Direction</label>
                    <select
                      value={typeof editingElementCss.tabletCss === 'object' && editingElementCss.tabletCss?.flexDirection ? editingElementCss.tabletCss.flexDirection : ''}
                      onChange={(e) => {
                        const tabletCss = typeof editingElementCss.tabletCss === 'object' ? (editingElementCss.tabletCss || {}) : {};
                        handleChange('tabletCss', { ...tabletCss, flexDirection: e.target.value });
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                    >
                      <option value="">Default</option>
                      <option value="row">Row</option>
                      <option value="column">Column</option>
                      <option value="row-reverse">Row Reverse</option>
                      <option value="column-reverse">Column Reverse</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Flex Wrap</label>
                    <select
                      value={typeof editingElementCss.tabletCss === 'object' && editingElementCss.tabletCss?.flexWrap ? editingElementCss.tabletCss.flexWrap : ''}
                      onChange={(e) => {
                        const tabletCss = typeof editingElementCss.tabletCss === 'object' ? (editingElementCss.tabletCss || {}) : {};
                        handleChange('tabletCss', { ...tabletCss, flexWrap: e.target.value });
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                    >
                      <option value="">Default</option>
                      <option value="nowrap">No Wrap</option>
                      <option value="wrap">Wrap</option>
                      <option value="wrap-reverse">Wrap Reverse</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Justify Content</label>
                    <select
                      value={typeof editingElementCss.tabletCss === 'object' && editingElementCss.tabletCss?.justifyContent ? editingElementCss.tabletCss.justifyContent : ''}
                      onChange={(e) => {
                        const tabletCss = typeof editingElementCss.tabletCss === 'object' ? (editingElementCss.tabletCss || {}) : {};
                        handleChange('tabletCss', { ...tabletCss, justifyContent: e.target.value });
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                    >
                      <option value="">Default</option>
                      <option value="flex-start">Flex Start</option>
                      <option value="flex-end">Flex End</option>
                      <option value="center">Center</option>
                      <option value="space-between">Space Between</option>
                      <option value="space-around">Space Around</option>
                      <option value="space-evenly">Space Evenly</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Align Items</label>
                    <select
                      value={typeof editingElementCss.tabletCss === 'object' && editingElementCss.tabletCss?.alignItems ? editingElementCss.tabletCss.alignItems : ''}
                      onChange={(e) => {
                        const tabletCss = typeof editingElementCss.tabletCss === 'object' ? (editingElementCss.tabletCss || {}) : {};
                        handleChange('tabletCss', { ...tabletCss, alignItems: e.target.value });
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                    >
                      <option value="">Default</option>
                      <option value="flex-start">Flex Start</option>
                      <option value="flex-end">Flex End</option>
                      <option value="center">Center</option>
                      <option value="baseline">Baseline</option>
                      <option value="stretch">Stretch</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Align Content</label>
                    <select
                      value={typeof editingElementCss.tabletCss === 'object' && editingElementCss.tabletCss?.alignContent ? editingElementCss.tabletCss.alignContent : ''}
                      onChange={(e) => {
                        const tabletCss = typeof editingElementCss.tabletCss === 'object' ? (editingElementCss.tabletCss || {}) : {};
                        handleChange('tabletCss', { ...tabletCss, alignContent: e.target.value });
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                    >
                      <option value="">Default</option>
                      <option value="flex-start">Flex Start</option>
                      <option value="flex-end">Flex End</option>
                      <option value="center">Center</option>
                      <option value="space-between">Space Between</option>
                      <option value="space-around">Space Around</option>
                      <option value="stretch">Stretch</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Gap</label>
                    <input
                      type="text"
                      value={typeof editingElementCss.tabletCss === 'object' && editingElementCss.tabletCss?.gap ? editingElementCss.tabletCss.gap : ''}
                      onChange={(e) => {
                        const tabletCss = typeof editingElementCss.tabletCss === 'object' ? (editingElementCss.tabletCss || {}) : {};
                        handleChange('tabletCss', { ...tabletCss, gap: e.target.value });
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                      placeholder="10px, 1rem"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Flex Grow</label>
                    <input
                      type="text"
                      value={typeof editingElementCss.tabletCss === 'object' && editingElementCss.tabletCss?.flexGrow ? editingElementCss.tabletCss.flexGrow : ''}
                      onChange={(e) => {
                        const tabletCss = typeof editingElementCss.tabletCss === 'object' ? (editingElementCss.tabletCss || {}) : {};
                        handleChange('tabletCss', { ...tabletCss, flexGrow: e.target.value });
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                      placeholder="0, 1, 2"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Flex Shrink</label>
                    <input
                      type="text"
                      value={typeof editingElementCss.tabletCss === 'object' && editingElementCss.tabletCss?.flexShrink ? editingElementCss.tabletCss.flexShrink : ''}
                      onChange={(e) => {
                        const tabletCss = typeof editingElementCss.tabletCss === 'object' ? (editingElementCss.tabletCss || {}) : {};
                        handleChange('tabletCss', { ...tabletCss, flexShrink: e.target.value });
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                      placeholder="0, 1"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Flex Basis</label>
                    <input
                      type="text"
                      value={typeof editingElementCss.tabletCss === 'object' && editingElementCss.tabletCss?.flexBasis ? editingElementCss.tabletCss.flexBasis : ''}
                      onChange={(e) => {
                        const tabletCss = typeof editingElementCss.tabletCss === 'object' ? (editingElementCss.tabletCss || {}) : {};
                        handleChange('tabletCss', { ...tabletCss, flexBasis: e.target.value });
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                      placeholder="auto, 200px, 50%"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Align Self</label>
                    <select
                      value={typeof editingElementCss.tabletCss === 'object' && editingElementCss.tabletCss?.alignSelf ? editingElementCss.tabletCss.alignSelf : ''}
                      onChange={(e) => {
                        const tabletCss = typeof editingElementCss.tabletCss === 'object' ? (editingElementCss.tabletCss || {}) : {};
                        handleChange('tabletCss', { ...tabletCss, alignSelf: e.target.value });
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                    >
                      <option value="">Default</option>
                      <option value="auto">Auto</option>
                      <option value="flex-start">Flex Start</option>
                      <option value="flex-end">Flex End</option>
                      <option value="center">Center</option>
                      <option value="baseline">Baseline</option>
                      <option value="stretch">Stretch</option>
                    </select>
                  </div>
                </div>
              </div>
              </>
              )}
            </div>

            {/* Desktop Responsive */}
            <div className="mb-4 border-t border-gray-200 pt-4">
              <button
                type="button"
                onClick={() => toggleAccordion('desktop')}
                className="w-full flex items-center justify-between text-sm font-semibold text-gray-800 mb-3 hover:text-indigo-600 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  Desktop (min-width: 1024px)
                </div>
                {openAccordions.desktop ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
              </button>
              {openAccordions.desktop && (
              <>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Width</label>
                  <input
                    type="text"
                    value={typeof editingElementCss.desktopCss === 'object' && editingElementCss.desktopCss?.width ? editingElementCss.desktopCss.width : ''}
                    onChange={(e) => {
                      const desktopCss = typeof editingElementCss.desktopCss === 'object' ? (editingElementCss.desktopCss || {}) : {};
                      handleChange('desktopCss', { ...desktopCss, width: e.target.value });
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                    placeholder="600px, 50%"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Height</label>
                  <input
                    type="text"
                    value={typeof editingElementCss.desktopCss === 'object' && editingElementCss.desktopCss?.height ? editingElementCss.desktopCss.height : ''}
                    onChange={(e) => {
                      const desktopCss = typeof editingElementCss.desktopCss === 'object' ? (editingElementCss.desktopCss || {}) : {};
                      handleChange('desktopCss', { ...desktopCss, height: e.target.value });
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                    placeholder="auto, 400px"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Min Width</label>
                  <input
                    type="text"
                    value={typeof editingElementCss.desktopCss === 'object' && editingElementCss.desktopCss?.minWidth ? editingElementCss.desktopCss.minWidth : ''}
                    onChange={(e) => {
                      const desktopCss = typeof editingElementCss.desktopCss === 'object' ? (editingElementCss.desktopCss || {}) : {};
                      handleChange('desktopCss', { ...desktopCss, minWidth: e.target.value });
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                    placeholder="400px"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Max Width</label>
                  <input
                    type="text"
                    value={typeof editingElementCss.desktopCss === 'object' && editingElementCss.desktopCss?.maxWidth ? editingElementCss.desktopCss.maxWidth : ''}
                    onChange={(e) => {
                      const desktopCss = typeof editingElementCss.desktopCss === 'object' ? (editingElementCss.desktopCss || {}) : {};
                      handleChange('desktopCss', { ...desktopCss, maxWidth: e.target.value });
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                    placeholder="1200px"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Min Height</label>
                  <input
                    type="text"
                    value={typeof editingElementCss.desktopCss === 'object' && editingElementCss.desktopCss?.minHeight ? editingElementCss.desktopCss.minHeight : ''}
                    onChange={(e) => {
                      const desktopCss = typeof editingElementCss.desktopCss === 'object' ? (editingElementCss.desktopCss || {}) : {};
                      handleChange('desktopCss', { ...desktopCss, minHeight: e.target.value });
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                    placeholder="300px"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Max Height</label>
                  <input
                    type="text"
                    value={typeof editingElementCss.desktopCss === 'object' && editingElementCss.desktopCss?.maxHeight ? editingElementCss.desktopCss.maxHeight : ''}
                    onChange={(e) => {
                      const desktopCss = typeof editingElementCss.desktopCss === 'object' ? (editingElementCss.desktopCss || {}) : {};
                      handleChange('desktopCss', { ...desktopCss, maxHeight: e.target.value });
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                    placeholder="800px"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Padding</label>
                  <input
                    type="text"
                    value={typeof editingElementCss.desktopCss === 'object' && editingElementCss.desktopCss?.padding ? editingElementCss.desktopCss.padding : ''}
                    onChange={(e) => {
                      const desktopCss = typeof editingElementCss.desktopCss === 'object' ? (editingElementCss.desktopCss || {}) : {};
                      handleChange('desktopCss', { ...desktopCss, padding: e.target.value });
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                    placeholder="40px, 40px 60px"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Margin</label>
                  <input
                    type="text"
                    value={typeof editingElementCss.desktopCss === 'object' && editingElementCss.desktopCss?.margin ? editingElementCss.desktopCss.margin : ''}
                    onChange={(e) => {
                      const desktopCss = typeof editingElementCss.desktopCss === 'object' ? (editingElementCss.desktopCss || {}) : {};
                      handleChange('desktopCss', { ...desktopCss, margin: e.target.value });
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                    placeholder="40px, 40px 60px"
                  />
                </div>
              </div>
              
              {/* Desktop Flexbox */}
              <div className="mt-4 pt-4 border-t border-gray-200">
                <h4 className="text-sm font-semibold text-gray-800 mb-3">Flexbox Options</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Display</label>
                    <select
                      value={typeof editingElementCss.desktopCss === 'object' && editingElementCss.desktopCss?.display ? editingElementCss.desktopCss.display : ''}
                      onChange={(e) => {
                        const desktopCss = typeof editingElementCss.desktopCss === 'object' ? (editingElementCss.desktopCss || {}) : {};
                        handleChange('desktopCss', { ...desktopCss, display: e.target.value });
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                    >
                      <option value="">Default</option>
                      <option value="flex">Flex</option>
                      <option value="inline-flex">Inline Flex</option>
                      <option value="block">Block</option>
                      <option value="inline-block">Inline Block</option>
                      <option value="grid">Grid</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Flex Direction</label>
                    <select
                      value={typeof editingElementCss.desktopCss === 'object' && editingElementCss.desktopCss?.flexDirection ? editingElementCss.desktopCss.flexDirection : ''}
                      onChange={(e) => {
                        const desktopCss = typeof editingElementCss.desktopCss === 'object' ? (editingElementCss.desktopCss || {}) : {};
                        handleChange('desktopCss', { ...desktopCss, flexDirection: e.target.value });
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                    >
                      <option value="">Default</option>
                      <option value="row">Row</option>
                      <option value="column">Column</option>
                      <option value="row-reverse">Row Reverse</option>
                      <option value="column-reverse">Column Reverse</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Flex Wrap</label>
                    <select
                      value={typeof editingElementCss.desktopCss === 'object' && editingElementCss.desktopCss?.flexWrap ? editingElementCss.desktopCss.flexWrap : ''}
                      onChange={(e) => {
                        const desktopCss = typeof editingElementCss.desktopCss === 'object' ? (editingElementCss.desktopCss || {}) : {};
                        handleChange('desktopCss', { ...desktopCss, flexWrap: e.target.value });
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                    >
                      <option value="">Default</option>
                      <option value="nowrap">No Wrap</option>
                      <option value="wrap">Wrap</option>
                      <option value="wrap-reverse">Wrap Reverse</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Justify Content</label>
                    <select
                      value={typeof editingElementCss.desktopCss === 'object' && editingElementCss.desktopCss?.justifyContent ? editingElementCss.desktopCss.justifyContent : ''}
                      onChange={(e) => {
                        const desktopCss = typeof editingElementCss.desktopCss === 'object' ? (editingElementCss.desktopCss || {}) : {};
                        handleChange('desktopCss', { ...desktopCss, justifyContent: e.target.value });
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                    >
                      <option value="">Default</option>
                      <option value="flex-start">Flex Start</option>
                      <option value="flex-end">Flex End</option>
                      <option value="center">Center</option>
                      <option value="space-between">Space Between</option>
                      <option value="space-around">Space Around</option>
                      <option value="space-evenly">Space Evenly</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Align Items</label>
                    <select
                      value={typeof editingElementCss.desktopCss === 'object' && editingElementCss.desktopCss?.alignItems ? editingElementCss.desktopCss.alignItems : ''}
                      onChange={(e) => {
                        const desktopCss = typeof editingElementCss.desktopCss === 'object' ? (editingElementCss.desktopCss || {}) : {};
                        handleChange('desktopCss', { ...desktopCss, alignItems: e.target.value });
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                    >
                      <option value="">Default</option>
                      <option value="flex-start">Flex Start</option>
                      <option value="flex-end">Flex End</option>
                      <option value="center">Center</option>
                      <option value="baseline">Baseline</option>
                      <option value="stretch">Stretch</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Align Content</label>
                    <select
                      value={typeof editingElementCss.desktopCss === 'object' && editingElementCss.desktopCss?.alignContent ? editingElementCss.desktopCss.alignContent : ''}
                      onChange={(e) => {
                        const desktopCss = typeof editingElementCss.desktopCss === 'object' ? (editingElementCss.desktopCss || {}) : {};
                        handleChange('desktopCss', { ...desktopCss, alignContent: e.target.value });
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                    >
                      <option value="">Default</option>
                      <option value="flex-start">Flex Start</option>
                      <option value="flex-end">Flex End</option>
                      <option value="center">Center</option>
                      <option value="space-between">Space Between</option>
                      <option value="space-around">Space Around</option>
                      <option value="stretch">Stretch</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Gap</label>
                    <input
                      type="text"
                      value={typeof editingElementCss.desktopCss === 'object' && editingElementCss.desktopCss?.gap ? editingElementCss.desktopCss.gap : ''}
                      onChange={(e) => {
                        const desktopCss = typeof editingElementCss.desktopCss === 'object' ? (editingElementCss.desktopCss || {}) : {};
                        handleChange('desktopCss', { ...desktopCss, gap: e.target.value });
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                      placeholder="10px, 1rem"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Flex Grow</label>
                    <input
                      type="text"
                      value={typeof editingElementCss.desktopCss === 'object' && editingElementCss.desktopCss?.flexGrow ? editingElementCss.desktopCss.flexGrow : ''}
                      onChange={(e) => {
                        const desktopCss = typeof editingElementCss.desktopCss === 'object' ? (editingElementCss.desktopCss || {}) : {};
                        handleChange('desktopCss', { ...desktopCss, flexGrow: e.target.value });
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                      placeholder="0, 1, 2"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Flex Shrink</label>
                    <input
                      type="text"
                      value={typeof editingElementCss.desktopCss === 'object' && editingElementCss.desktopCss?.flexShrink ? editingElementCss.desktopCss.flexShrink : ''}
                      onChange={(e) => {
                        const desktopCss = typeof editingElementCss.desktopCss === 'object' ? (editingElementCss.desktopCss || {}) : {};
                        handleChange('desktopCss', { ...desktopCss, flexShrink: e.target.value });
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                      placeholder="0, 1"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Flex Basis</label>
                    <input
                      type="text"
                      value={typeof editingElementCss.desktopCss === 'object' && editingElementCss.desktopCss?.flexBasis ? editingElementCss.desktopCss.flexBasis : ''}
                      onChange={(e) => {
                        const desktopCss = typeof editingElementCss.desktopCss === 'object' ? (editingElementCss.desktopCss || {}) : {};
                        handleChange('desktopCss', { ...desktopCss, flexBasis: e.target.value });
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                      placeholder="auto, 200px, 50%"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Align Self</label>
                    <select
                      value={typeof editingElementCss.desktopCss === 'object' && editingElementCss.desktopCss?.alignSelf ? editingElementCss.desktopCss.alignSelf : ''}
                      onChange={(e) => {
                        const desktopCss = typeof editingElementCss.desktopCss === 'object' ? (editingElementCss.desktopCss || {}) : {};
                        handleChange('desktopCss', { ...desktopCss, alignSelf: e.target.value });
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                    >
                      <option value="">Default</option>
                      <option value="auto">Auto</option>
                      <option value="flex-start">Flex Start</option>
                      <option value="flex-end">Flex End</option>
                      <option value="center">Center</option>
                      <option value="baseline">Baseline</option>
                      <option value="stretch">Stretch</option>
                    </select>
                  </div>
                </div>
              </div>
              </>
              )}
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

          {/* Image Properties - Only for image elements */}
          {isImageElement && (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Image Properties</h3>
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Object Fit</label>
                <select
                  value={editingElementCss.objectFit || ''}
                  onChange={(e) => handleChange('objectFit', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                >
                  <option value="">Default (fill)</option>
                  <option value="fill">Fill</option>
                  <option value="contain">Contain</option>
                  <option value="cover">Cover</option>
                  <option value="none">None</option>
                  <option value="scale-down">Scale Down</option>
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  Controls how the image should be resized to fit its container
                </p>
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

          {/* Custom CSS */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Custom CSS</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Default (All Devices)</label>
                <div className="border border-gray-300 rounded-lg overflow-hidden">
                  <Editor
                    height="200px"
                    defaultLanguage="css"
                    value={editingElementCss.customCss || ''}
                    onChange={(value) => handleChange('customCss', value || '')}
                    theme="vs-light"
                    options={{
                      minimap: { enabled: false },
                      fontSize: 14,
                      lineNumbers: 'on',
                      scrollBeyondLastLine: false,
                      wordWrap: 'on',
                      automaticLayout: true,
                      tabSize: 2,
                      formatOnPaste: true,
                      formatOnType: true,
                    }}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">Add any custom CSS properties. These will be applied to the element.</p>
              </div>

              {/* Mobile Custom CSS */}
              <div className="border-t border-gray-200 pt-4">
                <button
                  type="button"
                  onClick={() => toggleAccordion('mobile')}
                  className="w-full flex items-center justify-between text-sm font-semibold text-gray-800 mb-3 hover:text-indigo-600 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                    Mobile Custom CSS (max-width: 767px)
                  </div>
                  {openAccordions.mobile ? (
                    <ChevronUp className="w-4 h-4" />
                  ) : (
                    <ChevronDown className="w-4 h-4" />
                  )}
                </button>
                {openAccordions.mobile && (
                  <div className="border border-gray-300 rounded-lg overflow-hidden">
                    <Editor
                      height="200px"
                      defaultLanguage="css"
                      value={editingElementCss.mobileCustomCss || ''}
                      onChange={(value) => handleChange('mobileCustomCss', value || '')}
                      theme="vs-light"
                      options={{
                        minimap: { enabled: false },
                        fontSize: 14,
                        lineNumbers: 'on',
                        scrollBeyondLastLine: false,
                        wordWrap: 'on',
                        automaticLayout: true,
                        tabSize: 2,
                        formatOnPaste: true,
                        formatOnType: true,
                      }}
                    />
                  </div>
                )}
              </div>

              {/* Tablet Custom CSS */}
              <div className="border-t border-gray-200 pt-4">
                <button
                  type="button"
                  onClick={() => toggleAccordion('tablet')}
                  className="w-full flex items-center justify-between text-sm font-semibold text-gray-800 mb-3 hover:text-indigo-600 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                    Tablet Custom CSS (768px - 1023px)
                  </div>
                  {openAccordions.tablet ? (
                    <ChevronUp className="w-4 h-4" />
                  ) : (
                    <ChevronDown className="w-4 h-4" />
                  )}
                </button>
                {openAccordions.tablet && (
                  <div className="border border-gray-300 rounded-lg overflow-hidden">
                    <Editor
                      height="200px"
                      defaultLanguage="css"
                      value={editingElementCss.tabletCustomCss || ''}
                      onChange={(value) => handleChange('tabletCustomCss', value || '')}
                      theme="vs-light"
                      options={{
                        minimap: { enabled: false },
                        fontSize: 14,
                        lineNumbers: 'on',
                        scrollBeyondLastLine: false,
                        wordWrap: 'on',
                        automaticLayout: true,
                        tabSize: 2,
                        formatOnPaste: true,
                        formatOnType: true,
                      }}
                    />
                  </div>
                )}
              </div>

              {/* Desktop Custom CSS */}
              <div className="border-t border-gray-200 pt-4">
                <button
                  type="button"
                  onClick={() => toggleAccordion('desktop')}
                  className="w-full flex items-center justify-between text-sm font-semibold text-gray-800 mb-3 hover:text-indigo-600 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    Desktop Custom CSS (min-width: 1024px)
                  </div>
                  {openAccordions.desktop ? (
                    <ChevronUp className="w-4 h-4" />
                  ) : (
                    <ChevronDown className="w-4 h-4" />
                  )}
                </button>
                {openAccordions.desktop && (
                  <div className="border border-gray-300 rounded-lg overflow-hidden">
                    <Editor
                      height="200px"
                      defaultLanguage="css"
                      value={editingElementCss.desktopCustomCss || ''}
                      onChange={(value) => handleChange('desktopCustomCss', value || '')}
                      theme="vs-light"
                      options={{
                        minimap: { enabled: false },
                        fontSize: 14,
                        lineNumbers: 'on',
                        scrollBeyondLastLine: false,
                        wordWrap: 'on',
                        automaticLayout: true,
                        tabSize: 2,
                        formatOnPaste: true,
                        formatOnType: true,
                      }}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

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

