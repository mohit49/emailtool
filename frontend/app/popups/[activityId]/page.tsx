'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../../providers/AuthProvider';
import { useRouter, useSearchParams, useParams } from 'next/navigation';
import axios from 'axios';
import Link from 'next/link';
import AuthHeader from '../../../components/AuthHeader';
import Alert from '../../../components/Alert';
import { ChevronLeft, Save, Trash2, ChevronDown, ChevronUp, Table, Rows3, Square, LayoutGrid, Type, Heading1, Heading2, Heading3, Heading4, Heading5, Heading6, Bold, Italic, Link2, MousePointerClick, Image as ImageIcon, MoreHorizontal, X, Settings, Smartphone, Tablet, Monitor } from 'lucide-react';
import HTMLEditor, { HTMLEditorRef } from '../../../components/HTMLEditor';

const API_URL = '/api';

interface UrlCondition {
  type: 'contains' | 'equals' | 'landing' | 'startsWith' | 'doesNotContain';
  value: string;
  domain?: string;
}

interface PopupActivity {
  _id: string;
  name: string;
  projectId: string;
  userId: string;
  urlConditions: UrlCondition[];
  logicOperator: 'AND' | 'OR';
  html: string;
  status: 'draft' | 'deactivated' | 'activated';
  createdAt: string;
  updatedAt: string;
}

// Custom Dropdown Component
const CustomDropdown = ({ value, onChange, options, className = '' }: {
  value: string;
  onChange: (value: string) => void;
  options: Array<{ value: string; label: string }>;
  className?: string;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const selectedOption = options.find(opt => opt.value === value) || options[0];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  return (
    <div ref={dropdownRef} className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-3 py-2 text-sm text-left bg-white border border-gray-300 rounded-lg hover:border-indigo-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none flex items-center justify-between"
      >
        <span>{selectedOption.label}</span>
        <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-auto">
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => {
                onChange(option.value);
                setIsOpen(false);
              }}
              className={`w-full px-3 py-2 text-sm text-left hover:bg-indigo-50 hover:text-indigo-700 transition-colors ${
                value === option.value ? 'bg-indigo-100 text-indigo-700' : 'text-gray-700'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

// Helper function to wrap HTML fragment for parsing
const wrapForParsing = (html: string): string => {
  // If it already has DOCTYPE, return as is
  if (html.trim().startsWith('<!DOCTYPE') || html.trim().startsWith('<!doctype')) {
    return html;
  }
  // Otherwise wrap in minimal HTML structure
  return `<!doctype html><html><head></head><body>${html}</body></html>`;
};

// Helper function to extract only style and popup div from HTML
const extractPopupContent = (html: string): string => {
  const parser = new DOMParser();
  const wrapped = wrapForParsing(html);
  const doc = parser.parseFromString(wrapped, 'text/html');
  
  const styleEl = doc.querySelector('style');
  const popupEl = doc.querySelector('.przio-popup');
  
  let result = '';
  if (styleEl) {
    result += styleEl.outerHTML + '\n    ';
  }
  if (popupEl) {
    result += popupEl.outerHTML;
  }
  
  return result.trim();
};

export default function PopupActivityPage() {
  const { user, token, loading: authLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const activityId = params?.activityId as string;
  const projectId = searchParams.get('projectId');

  const [projectInfo, setProjectInfo] = useState<{ name: string; role: 'owner' | 'ProjectAdmin' | 'emailDeveloper' } | null>(null);
  const [activity, setActivity] = useState<PopupActivity | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    domain: '', // Single domain for the entire popup
    urlConditions: [] as UrlCondition[],
    logicOperators: [] as ('AND' | 'OR')[], // One operator between each pair of conditions
    html: '',
    status: 'draft' as 'draft' | 'deactivated' | 'activated',
    position: 'center' as 'left-top' | 'right-top' | 'left-bottom' | 'right-bottom' | 'center-top' | 'center' | 'center-bottom',
  });
  const [alert, setAlert] = useState({
    isOpen: false,
    message: '',
    type: 'success' as 'success' | 'error' | 'info',
  });
  const [isBasicSettingsCollapsed, setIsBasicSettingsCollapsed] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState<'editor' | 'preview' | 'split'>('split');
  console.log('🎬 Component rendering - activeTab:', activeTab);
  const [previewMode, setPreviewMode] = useState<'mobile' | 'tablet' | 'desktop'>('desktop');
  const [splitPosition, setSplitPosition] = useState(50); // Percentage
  const [isResizing, setIsResizing] = useState(false);
  const [previewUrl, setPreviewUrl] = useState('');
  const [draggingSnippet, setDraggingSnippet] = useState<string | null>(null);
  const [isOverCanvas, setIsOverCanvas] = useState(false);
  const draggingSnippetRef = useRef<string | null>(null);
  const [selectedElement, setSelectedElement] = useState<{ id: string; element: HTMLElement | null }>({ id: '', element: null });
  const [showElementToolbar, setShowElementToolbar] = useState(false);
  const [toolbarPosition, setToolbarPosition] = useState({ top: 0, left: 0 });
  const [uploadingImage, setUploadingImage] = useState(false);
  const [showPopupSettings, setShowPopupSettings] = useState(false);
  const [showCssEditor, setShowCssEditor] = useState(false);
  const [elementCounter, setElementCounter] = useState(0);
  const [popupCssSettings, setPopupCssSettings] = useState({
    padding: '40px 20px',
    border: '2px dashed #cbd5e1',
    borderRadius: '8px',
    backgroundColor: '#f9fafb',
    textAlign: 'center',
  });
  const [editingElementCss, setEditingElementCss] = useState({
    width: '',
    height: '',
    padding: '',
    margin: '',
    borderWidth: '',
    borderStyle: 'solid',
    borderColor: '',
    backgroundColor: '',
    color: '',
    fontSize: '',
    fontWeight: '',
    // Responsive CSS
    mobileCss: {},
    tabletCss: {},
    desktopCss: {},
  });
  const previewIframeRef = useRef<HTMLIFrameElement>(null);
  const visualEditorRef = useRef<HTMLDivElement>(null);
  const htmlEditorRef = useRef<HTMLEditorRef>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Drag items for toolbar
  const DRAG_ITEMS: Array<{
    key: string;
    label: string;
    snippet: string;
    icon: React.ReactNode;
    primary?: boolean;
  }> = [
    { key: 'div', label: 'Container', snippet: '<div style="padding:16px;background:#f9fafb;border:1px solid #e5e7eb;border-radius:8px;min-height:100px;"></div>', icon: <LayoutGrid size={16} />, primary: true },
    { key: 'p', label: 'Paragraph', snippet: '<p style="margin:0 0 12px 0;font-size:14px;line-height:1.6;color:#111827;">Your paragraph text here</p>', icon: <Type size={16} />, primary: true },
    { key: 'h1', label: 'H1', snippet: '<h1 style="margin:0 0 16px 0;font-size:32px;font-weight:700;color:#111827;">Heading 1</h1>', icon: <Heading1 size={16} />, primary: true },
    { key: 'h2', label: 'H2', snippet: '<h2 style="margin:0 0 14px 0;font-size:24px;font-weight:700;color:#111827;">Heading 2</h2>', icon: <Heading2 size={16} />, primary: true },
    { key: 'button', label: 'Button', snippet: '<p style="margin:0 0 12px 0;text-align:center;"><a href="#" style="display:inline-block;padding:12px 24px;background:linear-gradient(90deg,#4f46e5,#0ea5e9);color:#ffffff;text-decoration:none;border-radius:6px;font-weight:600;font-size:14px;">Button Text</a></p>', icon: <MousePointerClick size={16} />, primary: true },
    { key: 'image', label: 'Image', snippet: '<img src="https://via.placeholder.com/300x200" alt="Image" style="max-width:100%;height:auto;border-radius:8px;" />', icon: <ImageIcon size={16} />, primary: true },
    { key: 'link', label: 'Link', snippet: '<p style="margin:0 0 12px 0;"><a href="#" style="color:#4f46e5;text-decoration:underline;font-weight:500;">Click here</a></p>', icon: <Link2 size={16} /> },
    { key: 'h3', label: 'H3', snippet: '<h3 style="margin:0 0 12px 0;font-size:20px;font-weight:600;color:#111827;">Heading 3</h3>', icon: <Heading3 size={16} /> },
    { key: 'h4', label: 'H4', snippet: '<h4 style="margin:0 0 10px 0;font-size:18px;font-weight:600;color:#111827;">Heading 4</h4>', icon: <Heading4 size={16} /> },
  ];

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    const fetchData = async () => {
      if (!user || !token || !activityId || !projectId) {
        setLoading(false);
        return;
      }

      try {
        // Verify project access
        const projectResponse = await axios.get(`${API_URL}/projects/${projectId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setProjectInfo({
          name: projectResponse.data.project.name,
          role: projectResponse.data.project.role,
        });

        // Fetch popup activity
        const activityResponse = await axios.get(`${API_URL}/popup-activities/${activityId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const fetchedActivity = activityResponse.data.activity;
        setActivity(fetchedActivity);
        // Convert single logicOperator to array of operators (defaulting all to the same operator)
        const logicOperator = fetchedActivity.logicOperator || 'OR';
        const logicOperators = (fetchedActivity.urlConditions || []).length > 1
          ? Array((fetchedActivity.urlConditions || []).length - 1).fill(logicOperator)
          : [];
        
        // Extract domain from first condition if exists (for backward compatibility)
        const domain = (fetchedActivity.urlConditions || [])[0]?.domain || '';
        
        // Set preview URL from domain (default to https:// if no protocol)
        const defaultPreviewUrl = domain 
          ? (domain.startsWith('http://') || domain.startsWith('https://') 
              ? domain 
              : `https://${domain}`)
          : '';
        
        // Load popup CSS settings from popupSettings
        const savedCssSettings = (fetchedActivity.popupSettings as any)?.placeholderCss || {};
        const currentCssSettings = Object.keys(savedCssSettings).length > 0 ? savedCssSettings : {
          padding: '40px 20px',
          border: '2px dashed #cbd5e1',
          borderRadius: '8px',
          backgroundColor: '#f9fafb',
          textAlign: 'center',
        };
        
        // Set the CSS settings state
        setPopupCssSettings({
          padding: currentCssSettings.padding || '40px 20px',
          border: currentCssSettings.border || '2px dashed #cbd5e1',
          borderRadius: currentCssSettings.borderRadius || '8px',
          backgroundColor: currentCssSettings.backgroundColor || '#f9fafb',
          textAlign: currentCssSettings.textAlign || 'center',
        });
        
        // Ensure HTML has przio-popup wrapper if it doesn't exist
        let popupHtml = fetchedActivity.html || '';
        const popupId = `popup-${fetchedActivity._id}`;
        
        // Get position from popupSettings or default to center
        const savedPosition = (fetchedActivity.popupSettings as any)?.position || 'center';
        
        // Generate position styles
        let positionStyles = '';
        if (savedPosition === 'center') {
          positionStyles = 'position:fixed; top:50%; left:50%; transform:translate(-50%, -50%); margin:0;';
        } else if (savedPosition === 'center-top') {
          positionStyles = 'position:fixed; top:20px; left:50%; transform:translateX(-50%); margin:0;';
        } else if (savedPosition === 'center-bottom') {
          positionStyles = 'position:fixed; bottom:20px; left:50%; transform:translateX(-50%); margin:0;';
        } else if (savedPosition === 'left-top') {
          positionStyles = 'position:fixed; top:20px; left:20px; margin:0;';
        } else if (savedPosition === 'right-top') {
          positionStyles = 'position:fixed; top:20px; right:20px; margin:0;';
        } else if (savedPosition === 'left-bottom') {
          positionStyles = 'position:fixed; bottom:20px; left:20px; margin:0;';
        } else if (savedPosition === 'right-bottom') {
          positionStyles = 'position:fixed; bottom:20px; right:20px; margin:0;';
        }
        
        if (!popupHtml || !popupHtml.includes('przio-popup')) {
          // Create default popup template with embedded CSS (only style and main div)
          popupHtml = `<style>
        #${popupId} {
            ${positionStyles}
            padding: 40px;
            background-color: #ffffff;
            border-radius: 12px;
            max-width: 500px;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            z-index: 9999;
        }
    </style>
    <div class="przio-popup" id="${popupId}">
    </div>`;
        } else {
          // Ensure the popup has the correct ID and embedded CSS styles
          const parser = new DOMParser();
          const doc = parser.parseFromString(popupHtml, 'text/html');
          const popupEl = doc.querySelector('.przio-popup');
          if (popupEl) {
            if (!popupEl.id) {
              popupEl.id = popupId;
            }
            
            // Get or create style element
            let styleEl = doc.querySelector('style');
            if (!styleEl) {
              styleEl = doc.createElement('style');
              const head = doc.querySelector('head');
              if (head) {
                head.appendChild(styleEl);
              } else {
                const newHead = doc.createElement('head');
                newHead.appendChild(styleEl);
                doc.documentElement.insertBefore(newHead, doc.documentElement.firstChild);
              }
            }
            
            // Check if position styles are already in CSS
            const styleContent = styleEl.textContent || '';
            const hasPositionInCSS = styleContent.includes(`#${popupId}`) && 
                                     (styleContent.includes('position: fixed') || styleContent.includes('position:fixed'));
            
            if (!hasPositionInCSS) {
              // Add position styles to embedded CSS
              let positionCss = '';
              if (savedPosition === 'center') {
                positionCss = 'position: fixed;\n            top: 50%;\n            left: 50%;\n            transform: translate(-50%, -50%);\n            margin: 0;';
              } else if (savedPosition === 'center-top') {
                positionCss = 'position: fixed;\n            top: 20px;\n            left: 50%;\n            transform: translateX(-50%);\n            margin: 0;';
              } else if (savedPosition === 'center-bottom') {
                positionCss = 'position: fixed;\n            bottom: 20px;\n            left: 50%;\n            transform: translateX(-50%);\n            margin: 0;';
              } else if (savedPosition === 'left-top') {
                positionCss = 'position: fixed;\n            top: 20px;\n            left: 20px;\n            margin: 0;';
              } else if (savedPosition === 'right-top') {
                positionCss = 'position: fixed;\n            top: 20px;\n            right: 20px;\n            margin: 0;';
              } else if (savedPosition === 'left-bottom') {
                positionCss = 'position: fixed;\n            bottom: 20px;\n            left: 20px;\n            margin: 0;';
              } else if (savedPosition === 'right-bottom') {
                positionCss = 'position: fixed;\n            bottom: 20px;\n            right: 20px;\n            margin: 0;';
              }
              
              // Check if popup rule exists
              const popupRuleRegex = new RegExp(`#${popupId.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*\\{[^}]*\\}`, 's');
              const existingRule = styleContent.match(popupRuleRegex);
              
              if (existingRule) {
                // Update existing rule
                const updatedRule = `#${popupId} {
            ${positionCss}
            padding: 40px;
            background-color: #ffffff;
            border-radius: 12px;
            max-width: 500px;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            z-index: 9999;
        }`;
                styleEl.textContent = styleContent.replace(popupRuleRegex, updatedRule);
              } else {
                // Add new rule
                const newRule = `#${popupId} {
            ${positionCss}
            padding: 40px;
            background-color: #ffffff;
            border-radius: 12px;
            max-width: 500px;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            z-index: 9999;
        }`;
                styleEl.textContent = (styleContent.trim() ? styleContent + '\n' : '') + newRule;
              }
              
              // Remove inline styles from popup element
              popupEl.removeAttribute('style');
            }
            
            popupHtml = extractPopupContent('<!DOCTYPE html>' + doc.documentElement.outerHTML);
          }
        }
        
        // Ensure we only have style and popup div
        popupHtml = extractPopupContent(popupHtml);
        
        setFormData({
          name: fetchedActivity.name,
          domain: domain,
          urlConditions: fetchedActivity.urlConditions || [],
          logicOperators: logicOperators,
          html: popupHtml,
          status: fetchedActivity.status || 'draft',
          position: (fetchedActivity.popupSettings as any)?.position || 'center',
        });
        
        // Set preview URL from domain
        setPreviewUrl(defaultPreviewUrl);
      } catch (error: any) {
        console.error('Fetch error:', error);
        if (error.response?.status === 403 || error.response?.status === 404) {
          router.push('/projects');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user, token, activityId, projectId, router]);

  const addUrlCondition = () => {
    setFormData({
      ...formData,
      urlConditions: [
        ...formData.urlConditions,
        { type: 'contains', value: '', domain: '' }
      ],
      // Add default 'OR' operator when adding a new condition (if there are existing conditions)
      logicOperators: formData.urlConditions.length > 0 
        ? [...formData.logicOperators, 'OR']
        : formData.logicOperators,
    });
  };

  const updateUrlCondition = (index: number, field: keyof UrlCondition, value: string) => {
    const updated = [...formData.urlConditions];
    updated[index] = { ...updated[index], [field]: value };
    setFormData({ ...formData, urlConditions: updated });
  };

  const removeUrlCondition = (index: number) => {
    const updated = formData.urlConditions.filter((_, i) => i !== index);
    // Remove the corresponding logic operator
    const updatedOperators = formData.logicOperators.filter((_, i) => {
      // If removing first condition, remove first operator
      // If removing any other, remove the operator before it
      return index === 0 ? i !== 0 : i !== index - 1;
    });
    setFormData({ ...formData, urlConditions: updated, logicOperators: updatedOperators });
  };

  const updateLogicOperator = (index: number, operator: 'AND' | 'OR') => {
    const updated = [...formData.logicOperators];
    updated[index] = operator;
    setFormData({ ...formData, logicOperators: updated });
  };

  // Update HTML from visual editor DOM
  const updateHtmlFromVisualEditor = useCallback(() => {
    if (!visualEditorRef.current) return;
    
    const html = visualEditorRef.current.innerHTML;
    setFormData(prev => ({ ...prev, html }));
  }, []);

  // Load element CSS into editor
  const loadElementCss = useCallback((element: HTMLElement) => {
    const elementClass = element.getAttribute('data-przio-class') || element.id;
    const computedStyle = window.getComputedStyle(element);
    
    // Try to find the CSS rule in the style tag
    const styleTag = visualEditorRef.current?.querySelector('style');
    let cssFromStyleTag: Record<string, string> = {};
    
    if (styleTag && elementClass) {
      const styleContent = styleTag.textContent || '';
      const classSelector = elementClass.startsWith('przio-el-') ? `.${elementClass}` : `#${elementClass}`;
      const ruleRegex = new RegExp(`${classSelector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*\\{([^}]*)\\}`, 's');
      const match = styleContent.match(ruleRegex);
      
      if (match && match[1]) {
        // Parse CSS properties from the rule
        const properties = match[1].split(';').filter(p => p.trim());
        properties.forEach(prop => {
          const [key, value] = prop.split(':').map(s => s.trim());
          if (key && value) {
            cssFromStyleTag[key] = value;
          }
        });
        console.log('📖 Loaded CSS from style tag:', cssFromStyleTag);
      }
    }
    
    setEditingElementCss({
      width: cssFromStyleTag['width'] || element.style.width || computedStyle.width,
      height: cssFromStyleTag['height'] || element.style.height || computedStyle.height,
      padding: cssFromStyleTag['padding'] || element.style.padding || computedStyle.padding,
      margin: cssFromStyleTag['margin'] || element.style.margin || computedStyle.margin,
      borderWidth: cssFromStyleTag['border-width'] || element.style.borderWidth || computedStyle.borderWidth,
      borderStyle: cssFromStyleTag['border-style'] || element.style.borderStyle || computedStyle.borderStyle,
      borderColor: cssFromStyleTag['border-color'] || element.style.borderColor || computedStyle.borderColor,
      backgroundColor: cssFromStyleTag['background-color'] || element.style.backgroundColor || computedStyle.backgroundColor,
      color: cssFromStyleTag['color'] || element.style.color || computedStyle.color,
      fontSize: cssFromStyleTag['font-size'] || element.style.fontSize || computedStyle.fontSize,
      fontWeight: cssFromStyleTag['font-weight'] || element.style.fontWeight || computedStyle.fontWeight,
      mobileCss: {},
      tabletCss: {},
      desktopCss: {},
    });
  }, []);

  // Handle element click for selection
  const handleElementClick = useCallback((element: HTMLElement, id: string) => {
    // Remove previous selection
    document.querySelectorAll('.przio-selected').forEach(el => {
      el.classList.remove('przio-selected');
    });

    // Add selection to clicked element
    element.classList.add('przio-selected');
    setSelectedElement({ id, element });

    // Show toolbar near element
    const rect = element.getBoundingClientRect();
    setToolbarPosition({
      top: rect.top - 50,
      left: rect.left,
    });
    setShowElementToolbar(true);

    // Load element CSS for editing
    loadElementCss(element);
  }, [loadElementCss]);

  // Helper function to add element to popup
  const addElementToPopup = useCallback((popupEl: Element, snippet: string) => {
    // Generate unique ID and class for new element
    const newId = `przio-el-${elementCounter}`;
    const newClass = `przio-el-${elementCounter}`;
    setElementCounter(prev => prev + 1);

    // Create new element from snippet
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = snippet;
    const newElement = tempDiv.firstElementChild as HTMLElement;
    
    if (!newElement) {
      console.error('Failed to create element from snippet');
      return;
    }

    // Remove any existing placeholders before adding new element
    const placeholders = popupEl.querySelectorAll('.przio-placeholder');
    placeholders.forEach(placeholder => placeholder.remove());

    // Add unique ID and class
    newElement.id = newId;
    newElement.classList.add('przio-element', newClass);
    newElement.setAttribute('data-przio-id', newId);
    newElement.setAttribute('data-przio-class', newClass);
    
    // Extract inline styles and convert to embedded CSS
    const inlineStyle = newElement.getAttribute('style') || '';
    if (inlineStyle) {
      // Add CSS rule to the style tag
      const styleTag = visualEditorRef.current?.querySelector('style');
      if (styleTag) {
        const cssRule = `.${newClass} { ${inlineStyle} }`;
        styleTag.textContent = (styleTag.textContent || '') + '\n        ' + cssRule;
        console.log('📝 Added embedded CSS for', newClass);
      }
      // Remove inline style
      newElement.removeAttribute('style');
    }
    
    // Make element clickable for selection
    newElement.style.cursor = 'pointer';
    newElement.addEventListener('click', (clickEvent) => {
      clickEvent.stopPropagation();
      handleElementClick(newElement, newId);
    });

    // Append to popup
    popupEl.appendChild(newElement);

    // Update HTML state
    updateHtmlFromVisualEditor();
    
    console.log('✅ Element added successfully:', newId, 'with class:', newClass);
  }, [elementCounter, handleElementClick, updateHtmlFromVisualEditor]);

  // Direct drop handler for visual editor
  const handleDirectDrop = useCallback((e: React.DragEvent) => {
    const snippet = draggingSnippetRef.current;
    console.log('handleDirectDrop called, snippet:', snippet?.substring(0, 50));
    
    if (!snippet) {
      console.log('No snippet found');
      return;
    }

    // Get the .przio-popup element from visual editor
    const popupEl = visualEditorRef.current?.querySelector('.przio-popup');
    console.log('Found popup element:', !!popupEl);
    
    if (!popupEl) {
      console.log('No .przio-popup element found, creating initial popup structure');
      
      // Create initial popup structure
      const popupId = `popup-${activityId}`;
      const initialHtml = `<style>
        #${popupId} {
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            margin: 0;
            padding: 40px;
            background-color: #ffffff;
            border-radius: 12px;
            max-width: 500px;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            z-index: 9999;
        }
      </style>
      <div class="przio-popup" id="${popupId}"></div>`;
      
      setFormData(prev => ({ ...prev, html: initialHtml }));
      
      // Wait for next render to add element
      setTimeout(() => {
        const newPopupEl = visualEditorRef.current?.querySelector('.przio-popup');
        console.log('After timeout, found popup:', !!newPopupEl);
        if (newPopupEl) {
          addElementToPopup(newPopupEl, snippet);
        }
      }, 100);
      return;
    }

    console.log('Adding element to existing popup');
    // Add element to existing popup
    addElementToPopup(popupEl, snippet);
    
    setDraggingSnippet(null);
    draggingSnippetRef.current = null;
  }, [activityId, addElementToPopup]);

  // Delete selected element
  const deleteSelectedElement = useCallback(() => {
    if (!selectedElement.element) return;
    
    selectedElement.element.remove();
    setSelectedElement({ id: '', element: null });
    setShowElementToolbar(false);
    updateHtmlFromVisualEditor();
  }, [selectedElement, updateHtmlFromVisualEditor]);

  // Open CSS editor
  const openCssEditor = useCallback(() => {
    if (!selectedElement.element) return;
    setShowCssEditor(true);
  }, [selectedElement]);

  // Apply CSS changes to element
  const applyCssChanges = useCallback(() => {
    if (!selectedElement.element) return;

    const element = selectedElement.element;
    const elementClass = element.getAttribute('data-przio-class') || element.id;
    
    if (!elementClass) {
      console.error('No class or ID found for element');
      return;
    }

    // Build CSS string from editing state
    let cssProperties = '';
    if (editingElementCss.width) cssProperties += `width: ${editingElementCss.width}; `;
    if (editingElementCss.height) cssProperties += `height: ${editingElementCss.height}; `;
    if (editingElementCss.padding) cssProperties += `padding: ${editingElementCss.padding}; `;
    if (editingElementCss.margin) cssProperties += `margin: ${editingElementCss.margin}; `;
    if (editingElementCss.borderWidth) cssProperties += `border-width: ${editingElementCss.borderWidth}; `;
    if (editingElementCss.borderStyle) cssProperties += `border-style: ${editingElementCss.borderStyle}; `;
    if (editingElementCss.borderColor) cssProperties += `border-color: ${editingElementCss.borderColor}; `;
    if (editingElementCss.backgroundColor) cssProperties += `background-color: ${editingElementCss.backgroundColor}; `;
    if (editingElementCss.color) cssProperties += `color: ${editingElementCss.color}; `;
    if (editingElementCss.fontSize) cssProperties += `font-size: ${editingElementCss.fontSize}; `;
    if (editingElementCss.fontWeight) cssProperties += `font-weight: ${editingElementCss.fontWeight}; `;

    // Find or create the style tag
    const styleTag = visualEditorRef.current?.querySelector('style');
    if (styleTag) {
      let styleContent = styleTag.textContent || '';
      
      // Check if rule for this class already exists
      const classSelector = elementClass.startsWith('przio-el-') ? `.${elementClass}` : `#${elementClass}`;
      const ruleRegex = new RegExp(`${classSelector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*\\{[^}]*\\}`, 'gs');
      
      if (styleContent.match(ruleRegex)) {
        // Update existing rule
        styleContent = styleContent.replace(ruleRegex, `${classSelector} { ${cssProperties} }`);
      } else {
        // Add new rule
        styleContent += `\n        ${classSelector} { ${cssProperties} }`;
      }
      
      styleTag.textContent = styleContent;
      console.log('📝 Updated embedded CSS for', classSelector);
    }

    // Remove inline styles from element
    element.removeAttribute('style');
    // Keep cursor pointer
    element.style.cursor = 'pointer';

    updateHtmlFromVisualEditor();
    setShowCssEditor(false);
  }, [selectedElement, editingElementCss, updateHtmlFromVisualEditor]);

  // Re-attach event listeners to elements after HTML changes
  useEffect(() => {
    console.log('🔄 useEffect running - activeTab:', activeTab, 'has visualEditorRef:', !!visualEditorRef.current);
    console.log('📄 formData.html exists:', !!formData.html, 'length:', formData.html?.length);
    
    if (!visualEditorRef.current || activeTab !== 'preview') {
      console.warn('⚠️ Exiting useEffect - no ref or wrong tab');
      return;
    }

    let cleanupFn: (() => void) | null = null;

    // Small delay to ensure dangerouslySetInnerHTML has rendered
    const timer = setTimeout(() => {
      console.log('⏰ Timer fired, looking for popup...');
      const popupEl = visualEditorRef.current?.querySelector('.przio-popup');
      console.log('🔍 Found popup element in useEffect:', !!popupEl);
      
      if (popupEl) {
        console.log('✅ Popup element found! ID:', popupEl.id);
      } else {
        console.error('❌ Popup element NOT found! HTML:', visualEditorRef.current?.innerHTML.substring(0, 200));
        return;
      }

      // Add drag and drop handlers to the popup element
      const handlePopupDragOver = (e: DragEvent) => {
        console.log('🎯 Drag over popup!');
        e.preventDefault();
        e.stopPropagation();
        popupEl.classList.add('przio-drag-over');
      };

      const handlePopupDragLeave = (e: DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        popupEl.classList.remove('przio-drag-over');
      };

      const handlePopupDrop = (e: DragEvent) => {
        console.log('🎉 Drop on popup!');
        e.preventDefault();
        e.stopPropagation();
        popupEl.classList.remove('przio-drag-over');
        
        // Create synthetic React event
        const syntheticEvent = {
          preventDefault: () => {},
          stopPropagation: () => {},
        } as React.DragEvent;
        
        handleDirectDrop(syntheticEvent);
      };

      // Make popup itself selectable and interactive
      const handlePopupClick = (e: MouseEvent) => {
        const target = e.target as HTMLElement;
        
        // If clicking directly on the popup (not on a child element)
        if (target === popupEl) {
          // Remove previous selection
          document.querySelectorAll('.przio-selected').forEach(el => {
            el.classList.remove('przio-selected');
          });
          
          // Select the popup
          popupEl.classList.add('przio-selected');
          setSelectedElement({ id: popupEl.id, element: popupEl as HTMLElement });
          
          // Show visual feedback
          const rect = popupEl.getBoundingClientRect();
          setToolbarPosition({
            top: rect.top - 50,
            left: rect.left,
          });
          setShowElementToolbar(true);
          
          // Load popup CSS
          loadElementCss(popupEl as HTMLElement);
        }
      };

      console.log('🔗 Attaching event listeners to popup');
      // Attach handlers
      (popupEl as HTMLElement).addEventListener('dragover', handlePopupDragOver);
      (popupEl as HTMLElement).addEventListener('dragleave', handlePopupDragLeave);
      (popupEl as HTMLElement).addEventListener('drop', handlePopupDrop);
      (popupEl as HTMLElement).addEventListener('click', handlePopupClick);
      
      // Make popup look interactive and ensure it can receive events
      (popupEl as HTMLElement).style.cursor = 'pointer';
      (popupEl as HTMLElement).style.pointerEvents = 'auto';
      
      // Log popup dimensions and position
      const rect = popupEl.getBoundingClientRect();
      console.log('📐 Popup dimensions:', {
        width: rect.width,
        height: rect.height,
        top: rect.top,
        left: rect.left,
        visible: rect.width > 0 && rect.height > 0
      });

      // Find all przio-element elements and attach click handlers
      const elements = popupEl.querySelectorAll('.przio-element');
      console.log('🎨 Found elements to attach handlers:', elements.length);
      
      elements.forEach((el) => {
        const htmlEl = el as HTMLElement;
        const id = htmlEl.getAttribute('data-przio-id') || htmlEl.id;
        
        // Remove existing listener if any
        const newEl = htmlEl.cloneNode(true) as HTMLElement;
        htmlEl.parentNode?.replaceChild(newEl, htmlEl);
        
        // Add click handler
        newEl.style.cursor = 'pointer';
        newEl.addEventListener('click', (clickEvent) => {
          clickEvent.stopPropagation();
          handleElementClick(newEl, id);
        });
      });

      console.log('✨ Event listeners attached successfully');

      // Store cleanup function
      cleanupFn = () => {
        console.log('🧹 Cleaning up event listeners');
        (popupEl as HTMLElement).removeEventListener('dragover', handlePopupDragOver);
        (popupEl as HTMLElement).removeEventListener('dragleave', handlePopupDragLeave);
        (popupEl as HTMLElement).removeEventListener('drop', handlePopupDrop);
        (popupEl as HTMLElement).removeEventListener('click', handlePopupClick);
      };
    }, 50);
    
    return () => {
      clearTimeout(timer);
      if (cleanupFn) cleanupFn();
    };
  }, [formData.html, activeTab, handleElementClick, handleDirectDrop, loadElementCss]);

  // Inject snippet into popup HTML (only inside przio-popup wrapper)
  const injectSnippet = useCallback((snippet: string, targetSelector?: string, insertPosition?: 'before' | 'after' | 'inside') => {
    try {
      setFormData((prev) => {
        const parser = new DOMParser();
        const doc = parser.parseFromString(wrapForParsing(prev.html || ''), 'text/html');
        const wrapper = doc.createElement('div');
        wrapper.innerHTML = snippet.trim();
        const node = wrapper.firstElementChild || wrapper;
        
        // Find the przio-popup element - all content must be inside this
        const popupEl = doc.querySelector('.przio-popup');
        if (!popupEl) {
          console.error('przio-popup element not found');
          return prev;
        }
        
        // Helper to check if an element is inside przio-popup
        const isInsidePopup = (el: Element | null): boolean => {
          if (!el) return false;
          return popupEl.contains(el) || el === popupEl;
        };
        
        let targetEl: Element | null = null;
        if (targetSelector) {
          try {
            targetEl = doc.querySelector(targetSelector);
            // Only allow target if it's inside przio-popup
            if (targetEl && !isInsidePopup(targetEl)) {
              targetEl = null;
            }
          } catch {
            targetEl = null;
          }
        }
        
        // If no specific target, insert into popup
        if (!targetSelector || !targetEl) {
          popupEl.appendChild(node.cloneNode(true));
          const nextHtml = extractPopupContent('<!doctype html>' + doc.documentElement.outerHTML);
          return { ...prev, html: nextHtml };
        }
        
        // Insert relative to target element (only if inside przio-popup)
        if (targetEl && insertPosition && isInsidePopup(targetEl)) {
          if (insertPosition === 'before') {
            targetEl.parentElement?.insertBefore(node.cloneNode(true), targetEl);
          } else if (insertPosition === 'after') {
            targetEl.parentElement?.insertBefore(node.cloneNode(true), targetEl.nextSibling);
          } else {
            targetEl.appendChild(node.cloneNode(true));
          }
          const nextHtml = extractPopupContent('<!doctype html>' + doc.documentElement.outerHTML);
          return { ...prev, html: nextHtml };
        }
        
        return prev;
      });
    } catch (error) {
      console.error('Failed to inject snippet:', error);
    }
  }, []);

  // Remove an element from the HTML by selector
  const removeElement = useCallback((selector: string) => {
    try {
      setFormData((prev) => {
        const parser = new DOMParser();
        const doc = parser.parseFromString(wrapForParsing(prev.html || ''), 'text/html');
        const popupEl = doc.querySelector('.przio-popup');
        const targetEl = doc.querySelector(selector);
        
        // Only allow removal if target is inside przio-popup and not the popup itself
        if (targetEl && popupEl && popupEl.contains(targetEl) && targetEl !== popupEl) {
          targetEl.remove();
          const nextHtml = '<!doctype html>' + doc.documentElement.outerHTML;
          setSelectedElement({ id: '', element: null });
          return { ...prev, html: nextHtml };
        }
        return prev;
      });
    } catch (error) {
      console.error('Failed to remove element:', error);
    }
  }, []);

  // Setup iframe drag-drop handlers
  const setupIframeDragDrop = useCallback((iframe: HTMLIFrameElement | null) => {
    if (!iframe) return;
    
    const setupDragHandlers = () => {
      const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
      if (!iframeDoc || !iframeDoc.body) return;

      const parentWindow = iframe.contentWindow?.parent || window;

      // Inject styles for drag-drop
      let styleEl = iframeDoc.getElementById('przio-drag-styles');
      if (!styleEl) {
        styleEl = iframeDoc.createElement('style');
        styleEl.id = 'przio-drag-styles';
        styleEl.textContent = `
          .przio-editable:hover { outline: 2px dashed #94a3b8 !important; outline-offset: 2px; cursor: pointer; }
          .przio-selected { outline: 2px solid #4f46e5 !important; outline-offset: 2px; position: relative; }
          .przio-drop-zone { position: relative; }
          .przio-drop-zone::after { content: ''; position: absolute; inset: 0; background: rgba(79, 70, 229, 0.1); border: 2px dashed #4f46e5; border-radius: 4px; pointer-events: none; opacity: 0; transition: opacity 0.15s ease; }
          .przio-drop-zone.przio-drag-over::after { opacity: 1; }
          .przio-popup.przio-drag-over { outline: 2px dashed #4f46e5; outline-offset: 4px; background-color: rgba(79, 70, 229, 0.05) !important; }
          .przio-popup > *:not(.przio-placeholder).przio-drag-over { outline: 2px dashed #4f46e5; outline-offset: 2px; background-color: rgba(79, 70, 229, 0.1) !important; }
        `;
        iframeDoc.head.appendChild(styleEl);
      }

      // Mark editable elements (only inside przio-popup)
      const markEditableElements = () => {
        const popupEl = iframeDoc.querySelector('.przio-popup');
        if (!popupEl) return;
        
        popupEl.querySelectorAll('*').forEach(el => {
          if (['DIV', 'P', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'A', 'BUTTON', 'IMG'].includes(el.tagName)) {
            el.classList.add('przio-editable');
            if (['P', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6'].includes(el.tagName)) {
              (el as HTMLElement).contentEditable = 'true';
            }
          }
        });
      };

      // Setup drop handlers
      const setupDropHandlers = () => {
        const popupEl = iframeDoc.querySelector('.przio-popup');
        if (!popupEl) return;

        // Allow drops on the popup element itself
        popupEl.addEventListener('dragover', (e) => {
          e.preventDefault();
          e.stopPropagation();
          const target = e.target as Element;
          
          // Allow drop on popup itself or any child
          if (target === popupEl || popupEl.contains(target)) {
            // Add visual feedback
            if (target !== popupEl) {
              target.classList.add('przio-drag-over');
            } else {
              popupEl.classList.add('przio-drag-over');
            }
          }
        }, false);

        popupEl.addEventListener('dragleave', (e) => {
          const target = e.target as Element;
          if (target) {
            target.classList.remove('przio-drag-over');
          }
          popupEl.classList.remove('przio-drag-over');
        }, false);

        popupEl.addEventListener('drop', (e) => {
          e.preventDefault();
          e.stopPropagation();
          const target = e.target as Element;
          
          // Remove all drag-over classes
          popupEl.querySelectorAll('.przio-drag-over').forEach(el => el.classList.remove('przio-drag-over'));
          popupEl.classList.remove('przio-drag-over');
          
          // Try to get snippet from dataTransfer (may not work across iframe boundary)
          let snippet = '';
          try {
            snippet = (e as any).dataTransfer?.getData('text/plain') || '';
            // Also try JSON format
            if (!snippet) {
              const jsonData = (e as any).dataTransfer?.getData('application/json');
              if (jsonData) {
                try {
                  const parsed = JSON.parse(jsonData);
                  snippet = parsed.snippet || '';
                } catch (err) {
                  // Ignore parse errors
                }
              }
            }
          } catch (err) {
            // dataTransfer might not be accessible, request from parent
            console.log('dataTransfer not accessible, requesting from parent');
          }
          
          // If dropping directly on popup or any child, send message to parent
          // Parent will use draggingSnippetRef if snippet is empty
          if (target === popupEl || popupEl.contains(target)) {
            // If dropping on popup itself, use empty selector
            // If dropping on a child, use that child's selector
            let selector = '';
            let position: 'inside' | 'before' | 'after' = 'inside';
            
            if (target && target !== popupEl && popupEl.contains(target)) {
              selector = generateSelector(target);
              position = 'inside';
            } else {
              // Dropping directly on popup
              selector = '.przio-popup';
              position = 'inside';
            }
            
            parentWindow.postMessage({ 
              type: 'przio-iframe-drop', 
              snippet: snippet || null, // Send null if not available, parent will use ref
              selector, 
              position 
            }, '*');
          }
        }, false);

        // Click to select
        popupEl.addEventListener('click', (e) => {
          const target = e.target as Element;
          
          if (target && target !== popupEl && popupEl.contains(target) && target.classList.contains('przio-editable')) {
            iframeDoc.querySelectorAll('.przio-selected').forEach(el => el.classList.remove('przio-selected'));
            target.classList.add('przio-selected');
            const selector = generateSelector(target);
            parentWindow.postMessage({ 
              type: 'przio-element-selected', 
              selector, 
              tagName: target.tagName 
            }, '*');
          }
        });
      };

      const generateSelector = (el: Element): string => {
        const path: string[] = [];
        let current: Element | null = el;
        while (current && current !== iframeDoc.body) {
          let selector = current.tagName.toLowerCase();
          if (current.id) {
            selector = `#${current.id}`;
            path.unshift(selector);
            break;
          }
          const parent = current.parentElement;
          if (parent) {
            const siblings = Array.from(parent.children).filter(c => c.tagName === current!.tagName);
            if (siblings.length > 1) {
              const idx = siblings.indexOf(current) + 1;
              selector += `:nth-of-type(${idx})`;
            }
          }
          path.unshift(selector);
          current = current.parentElement;
        }
        return path.length ? 'body > ' + path.join(' > ') : 'body';
      };

      markEditableElements();
      setupDropHandlers();
    };

    if (iframe.contentDocument?.readyState === 'complete') {
      setupDragHandlers();
    } else {
      iframe.addEventListener('load', setupDragHandlers);
    }

    return () => {
      iframe.removeEventListener('load', setupDragHandlers);
    };
  }, []);

  // Listen for messages from iframe
  useEffect(() => {
    const handleMessage = (e: MessageEvent) => {
      if (e.data?.type === 'przio-iframe-drop') {
        let { snippet, selector, position } = e.data;
        // If snippet is not provided (iframe dataTransfer issue), use the ref value
        if (!snippet && draggingSnippetRef.current) {
          snippet = draggingSnippetRef.current;
        }
        if (!snippet) {
          console.warn('No snippet available for drop');
          return;
        }
        injectSnippet(snippet, selector, position);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [injectSnippet]);

  // Setup iframe when HTML changes
  useEffect(() => {
    const cleanup = setupIframeDragDrop(previewIframeRef.current);
    return () => cleanup?.();
  }, [formData.html, setupIframeDragDrop]);

  // Handle split view resizing
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return;
      
      const container = document.querySelector('.split-container');
      if (!container) return;
      
      const rect = container.getBoundingClientRect();
      const newPosition = ((e.clientX - rect.left) / rect.width) * 100;
      
      // Limit between 20% and 80%
      const clampedPosition = Math.max(20, Math.min(80, newPosition));
      setSplitPosition(clampedPosition);
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [isResizing]);

  // Get preview width based on device mode
  const getPreviewWidth = () => {
    if (previewMode === 'mobile') return '375px';
    if (previewMode === 'tablet') return '768px';
    return '100%';
  };

  // Create preview HTML that loads external URL and injects popup
  const getPreviewHTML = useCallback(() => {
    if (!previewUrl) {
      // If no URL, just show the popup
      return formData.html;
    }

    const parser = new DOMParser();
    const popupDoc = parser.parseFromString(wrapForParsing(formData.html || ''), 'text/html');
    const styleEl = popupDoc.querySelector('style');
    const popupElement = popupDoc.querySelector('.przio-popup');
    
    // Extract style and popup HTML
    let popupHTML = '';
    if (styleEl) {
      popupHTML += styleEl.outerHTML + '\n    ';
    }
    if (popupElement) {
      popupHTML += popupElement.outerHTML;
    }
    
    // Create wrapper HTML that loads the external site in an iframe and overlays the popup
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Popup Preview</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        body {
            overflow: hidden;
            position: relative;
            width: 100vw;
            height: 100vh;
        }
        .site-iframe {
            width: 100%;
            height: 100%;
            border: none;
            position: absolute;
            top: 0;
            left: 0;
        }
        /* Popup styles - ensure it appears on top */
        .przio-popup {
            z-index: 99999 !important;
            position: fixed !important;
        }
    </style>
</head>
<body>
    <!-- External website iframe -->
    <iframe 
        class="site-iframe" 
        src="${previewUrl}" 
        frameborder="0"
        allow="same-origin"
        sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-popups-to-escape-sandbox"
    ></iframe>
    
    <!-- Popup overlay -->
    ${popupHTML}
</body>
</html>`;
  }, [formData.html, previewUrl]);

  // Placeholder CSS is not saved in HTML - it's only applied dynamically in preview
  // This useEffect is removed as placeholder is not part of saved HTML

  // Apply position styling to HTML
  const applyPositionToHTML = useCallback((position: 'left-top' | 'right-top' | 'left-bottom' | 'right-bottom' | 'center-top' | 'center' | 'center-bottom') => {
    setFormData((prev) => {
      const parser = new DOMParser();
      const doc = parser.parseFromString(wrapForParsing(prev.html || ''), 'text/html');
      const popupEl = doc.querySelector('.przio-popup');
      
      if (!popupEl) return prev;
      
      // Get current style attribute
      const currentStyle = popupEl.getAttribute('style') || '';
      
      // Remove existing position-related styles
      const styleWithoutPosition = currentStyle
        .replace(/position\s*:\s*[^;]+;?/gi, '')
        .replace(/top\s*:\s*[^;]+;?/gi, '')
        .replace(/right\s*:\s*[^;]+;?/gi, '')
        .replace(/bottom\s*:\s*[^;]+;?/gi, '')
        .replace(/left\s*:\s*[^;]+;?/gi, '')
        .replace(/transform\s*:\s*[^;]+;?/gi, '')
        .replace(/margin\s*:\s*[^;]+;?/gi, '');
      
      // Build new position styles
      let positionStyles = '';
      if (position === 'center') {
        positionStyles = 'position:fixed; top:50%; left:50%; transform:translate(-50%, -50%); margin:0;';
      } else if (position === 'center-top') {
        positionStyles = 'position:fixed; top:20px; left:50%; transform:translateX(-50%); margin:0;';
      } else if (position === 'center-bottom') {
        positionStyles = 'position:fixed; bottom:20px; left:50%; transform:translateX(-50%); margin:0;';
      } else if (position === 'left-top') {
        positionStyles = 'position:fixed; top:20px; left:20px; margin:0;';
      } else if (position === 'right-top') {
        positionStyles = 'position:fixed; top:20px; right:20px; margin:0;';
      } else if (position === 'left-bottom') {
        positionStyles = 'position:fixed; bottom:20px; left:20px; margin:0;';
      } else if (position === 'right-bottom') {
        positionStyles = 'position:fixed; bottom:20px; right:20px; margin:0;';
      }
      
      // Combine styles
      const newStyle = `${styleWithoutPosition.trim()}${styleWithoutPosition.trim() ? ' ' : ''}${positionStyles}`.trim();
      popupEl.setAttribute('style', newStyle);
      
      const nextHtml = '<!doctype html>' + doc.documentElement.outerHTML;
      return { ...prev, html: nextHtml };
    });
  }, []);

  const handleSave = async () => {
    if (!activityId || !formData.name.trim()) {
      setAlert({
        isOpen: true,
        message: 'Popup name is required',
        type: 'error',
      });
      return;
    }

    // Validate URL conditions
    const validConditions = formData.urlConditions.filter(
      cond => cond.value.trim() || cond.type === 'landing'
    );

    // Apply single domain to all conditions
    const conditionsWithDomain = validConditions.map(cond => ({
      ...cond,
      domain: formData.domain.trim() || undefined,
    }));

    // Use the first logic operator, or default to 'OR' if none
    const logicOperator = formData.logicOperators.length > 0 
      ? formData.logicOperators[0] 
      : 'OR';

    // Clean HTML before saving - remove any placeholder elements
    let htmlToSave = formData.html;
    const parser = new DOMParser();
    const doc = parser.parseFromString(wrapForParsing(htmlToSave || ''), 'text/html');
    const placeholderEl = doc.querySelector('.przio-placeholder');
    if (placeholderEl) {
      placeholderEl.remove();
    }
    htmlToSave = extractPopupContent('<!doctype html>' + doc.documentElement.outerHTML);

    setSaving(true);
    try {
      const response = await axios.put(
        `${API_URL}/popup-activities/${activityId}`,
        {
          name: formData.name.trim(),
          urlConditions: conditionsWithDomain,
          logicOperator: logicOperator,
          html: htmlToSave,
          status: formData.status,
          popupSettings: {
            position: formData.position,
            placeholderCss: popupCssSettings,
          },
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setActivity(response.data.activity);
      setAlert({
        isOpen: true,
        message: 'Popup activity updated successfully',
        type: 'success',
      });
    } catch (error: any) {
      setAlert({
        isOpen: true,
        message: error.response?.data?.error || 'Failed to update popup activity',
        type: 'error',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this popup activity? This action cannot be undone.')) {
      return;
    }

    try {
      await axios.delete(`${API_URL}/popup-activities/${activityId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      router.push(`/popups?projectId=${projectId}`);
    } catch (error: any) {
      setAlert({
        isOpen: true,
        message: error.response?.data?.error || 'Failed to delete popup activity',
        type: 'error',
      });
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!activity || !projectInfo) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center p-8 bg-white shadow-lg rounded-lg">
          <h2 className="text-xl font-semibold text-red-600 mb-4">Popup Activity Not Found</h2>
          <Link href={`/popups?projectId=${projectId}`} className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
            Go Back
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <AuthHeader showProjectInfo={projectInfo} projectId={projectId || ''} />

      <div className="flex-1 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex-shrink-0 px-6 py-4 bg-white border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href={`/popups?projectId=${projectId}`}
              className="text-gray-500 hover:text-gray-700"
            >
              <ChevronLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Edit Popup Activity</h1>
              <p className="text-sm text-gray-500 mt-1">{activity.name}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleDelete}
              className="px-4 py-2 text-red-600 border border-red-300 rounded-lg hover:bg-red-50 transition-colors flex items-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              Delete
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>

        {/* Main Content - Full Screen */}
        <div className="flex-1 overflow-hidden flex">
          {/* Left Column - Settings */}
          {!isSidebarCollapsed && (
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
                      onChange={(value) => setFormData({ ...formData, status: value as 'draft' | 'deactivated' | 'activated' })}
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
                            onChange={(value: string) => updateUrlCondition(index, 'type', value)}
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
          )}

          {/* Collapse/Expand Button */}
          <button
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            className="flex-shrink-0 w-6 bg-gray-100 hover:bg-gray-200 border-r border-gray-200 flex items-center justify-center transition-colors"
            title={isSidebarCollapsed ? "Show sidebar" : "Hide sidebar"}
          >
            {isSidebarCollapsed ? (
              <ChevronDown className="w-4 h-4 text-gray-600 rotate-[-90deg]" />
            ) : (
              <ChevronDown className="w-4 h-4 text-gray-600 rotate-90" />
            )}
          </button>

          {/* Right Column - Visual Editor */}
          <div className="flex-1 overflow-hidden flex flex-col bg-white">
            {/* Toolbar */}
            <div className="flex-shrink-0 border-b border-gray-200 bg-gray-50 p-2">
              <div className="flex items-center gap-2 overflow-x-auto">
                {DRAG_ITEMS.filter(item => item.primary).map((item) => (
                  <button
                    key={item.key}
                    draggable
                    onDragStart={(e) => {
                      console.log('🚀 Drag started:', item.label);
                      setDraggingSnippet(item.snippet);
                      draggingSnippetRef.current = item.snippet;
                      e.dataTransfer.setData('text/plain', item.snippet);
                      e.dataTransfer.effectAllowed = 'copy';
                      // Also store in a way accessible to iframe
                      try {
                        e.dataTransfer.setData('application/json', JSON.stringify({ snippet: item.snippet }));
                      } catch (err) {
                        // Fallback if setData fails
                      }
                      console.log('✅ draggingSnippetRef set to:', item.snippet.substring(0, 50));
                    }}
                    onDragEnd={() => {
                      console.log('🛑 Drag ended');
                      setDraggingSnippet(null);
                      draggingSnippetRef.current = null;
                      setIsOverCanvas(false);
                    }}
                    className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-indigo-50 hover:border-indigo-300 hover:text-indigo-700 transition-colors whitespace-nowrap"
                    title={item.label}
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </button>
                ))}
                <div className="border-l border-gray-300 mx-2 h-6"></div>
                
                {/* Position Dropdown */}
                <div className="flex items-center gap-2">
                  <label className="text-xs text-gray-600 whitespace-nowrap">Position:</label>
                  <CustomDropdown
                    value={formData.position}
                    onChange={(value: string) => {
                      const newPosition = value as typeof formData.position;
                      setFormData({ ...formData, position: newPosition });
                      applyPositionToHTML(newPosition);
                    }}
                    options={[
                      { value: 'center', label: 'Center' },
                      { value: 'center-top', label: 'Center Top' },
                      { value: 'center-bottom', label: 'Center Bottom' },
                      { value: 'left-top', label: 'Left Top' },
                      { value: 'right-top', label: 'Right Top' },
                      { value: 'left-bottom', label: 'Left Bottom' },
                      { value: 'right-bottom', label: 'Right Bottom' },
                    ]}
                    className="min-w-[150px]"
                  />
                </div>

                <div className="border-l border-gray-300 mx-2 h-6"></div>

                {/* Device Icons */}
                <div className="flex items-center gap-1 bg-white border border-gray-300 rounded-lg p-1">
                  <button
                    onClick={() => setPreviewMode('mobile')}
                    className={`p-2 rounded transition-colors ${
                      previewMode === 'mobile'
                        ? 'bg-indigo-100 text-indigo-700'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                    title="Mobile View"
                  >
                    <Smartphone size={18} />
                  </button>
                  <button
                    onClick={() => setPreviewMode('tablet')}
                    className={`p-2 rounded transition-colors ${
                      previewMode === 'tablet'
                        ? 'bg-indigo-100 text-indigo-700'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                    title="Tablet View"
                  >
                    <Tablet size={18} />
                  </button>
                  <button
                    onClick={() => setPreviewMode('desktop')}
                    className={`p-2 rounded transition-colors ${
                      previewMode === 'desktop'
                        ? 'bg-indigo-100 text-indigo-700'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                    title="Desktop View"
                  >
                    <Monitor size={18} />
                  </button>
                </div>

                <div className="border-l border-gray-300 mx-2 h-6"></div>
                <div className="relative">
                  <button
                    onClick={() => setShowPopupSettings(true)}
                    className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-indigo-50 hover:border-indigo-300 hover:text-indigo-700 transition-colors"
                  >
                    <Settings size={16} />
                    <span>Popup Settings</span>
                  </button>
                </div>
                <div className="border-l border-gray-300 mx-2 h-6"></div>
                <div className="relative">
                  <button
                    className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-indigo-50 hover:border-indigo-300 hover:text-indigo-700 transition-colors"
                  >
                    <MoreHorizontal size={16} />
                    <span>More</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Tab Switcher */}
            <div className="flex-shrink-0 border-b border-gray-200 bg-white">
              <div className="flex items-center gap-1 px-4 py-2">
                <button
                  onClick={() => setActiveTab('editor')}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                    activeTab === 'editor'
                      ? 'bg-indigo-100 text-indigo-700'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Code Editor
                </button>
                <button
                  onClick={() => setActiveTab('preview')}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                    activeTab === 'preview'
                      ? 'bg-indigo-100 text-indigo-700'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Visual Editor
                </button>
                <button
                  onClick={() => setActiveTab('split')}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                    activeTab === 'split'
                      ? 'bg-indigo-100 text-indigo-700'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Split View
                </button>
              </div>
            </div>

            {/* Editor/Preview Content */}
            <div className="flex-1 overflow-hidden relative">
              {activeTab === 'editor' && (
                <div className="absolute inset-0">
                  <HTMLEditor
                    ref={htmlEditorRef}
                    value={formData.html}
                    onChange={(value) => setFormData({ ...formData, html: value || '' })}
                    isFullscreen={false}
                    onFullscreenChange={() => {}}
                  />
                </div>
              )}

              {activeTab === 'preview' && (
                <div className="absolute inset-0 overflow-auto bg-gray-100 p-4">
                  {/* Show instruction if empty, otherwise show visual editor */}
                  {!formData.html || !formData.html.includes('przio-popup') ? (
                    <div 
                      className="mx-auto bg-white rounded-lg shadow-lg overflow-hidden flex items-center justify-center"
                      style={{
                        width: getPreviewWidth(),
                        maxWidth: '100%',
                        transition: 'width 0.3s ease',
                        minHeight: '600px',
                      }}
                      onDragOver={(e) => {
                        console.log('📦 Drag over instruction area');
                        e.preventDefault();
                        e.stopPropagation();
                      }}
                      onDrop={(e) => {
                        console.log('📦 Drop on instruction area');
                        e.preventDefault();
                        e.stopPropagation();
                        handleDirectDrop(e);
                      }}
                    >
                      <div className="text-center max-w-md p-8 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl border-2 border-dashed border-indigo-300">
                        <div className="text-6xl mb-4">📦</div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">Start Building Your Popup</h3>
                        <p className="text-gray-600 mb-4">
                          Drag and drop a <span className="font-semibold text-indigo-600">Container</span> element from the toolbar above to get started.
                        </p>
                        <div className="text-sm text-gray-500 bg-white rounded-lg p-3 border border-indigo-200">
                          💡 Tip: Add a Container first, then drag other elements inside it!
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div
                      className="mx-auto bg-white rounded-lg shadow-lg overflow-hidden"
                      style={{
                        width: getPreviewWidth(),
                        maxWidth: '100%',
                        transition: 'width 0.3s ease',
                        minHeight: '600px',
                      }}
                      onDragOver={(e) => {
                        console.log('📦 Drag over wrapper div');
                        e.preventDefault();
                        // Don't stopPropagation - let it reach the popup
                      }}
                      onDrop={(e) => {
                        console.log('📦 Drop on wrapper div');
                        e.preventDefault();
                        handleDirectDrop(e);
                      }}
                    >
                      {/* Direct Visual Editor */}
                      <div
                        ref={visualEditorRef}
                        className="relative p-8"
                        style={{ minHeight: '600px' }}
                        dangerouslySetInnerHTML={{ __html: formData.html }}
                      />
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'split' && (
                <div className="absolute inset-0 flex split-container">
                  <div
                    className="overflow-hidden border-r border-gray-200"
                    style={{ width: `${splitPosition}%` }}
                  >
                    <HTMLEditor
                      ref={htmlEditorRef}
                      value={formData.html}
                      onChange={(value) => setFormData({ ...formData, html: value || '' })}
                      isFullscreen={false}
                      onFullscreenChange={() => {}}
                    />
                  </div>
                  <div
                    className="relative cursor-col-resize bg-gray-200 hover:bg-indigo-300 transition-colors flex-shrink-0"
                    style={{ width: '4px' }}
                    onMouseDown={() => setIsResizing(true)}
                  >
                    <div className="absolute inset-y-0 left-0 right-0 flex items-center justify-center">
                      <div className="w-1 h-12 bg-gray-400 rounded"></div>
                    </div>
                  </div>
                  <div
                    className="overflow-hidden bg-gray-100 flex flex-col"
                    style={{ width: `${100 - splitPosition}%` }}
                  >
                    {/* Preview URL Input */}
                    <div className="flex-shrink-0 p-3 bg-white border-b border-gray-200 flex items-center gap-2">
                      <label className="text-sm text-gray-700 whitespace-nowrap font-medium">Preview URL:</label>
                      <input
                        type="text"
                        value={previewUrl}
                        onChange={(e) => setPreviewUrl(e.target.value)}
                        onBlur={(e) => {
                          // Auto-add https:// if no protocol
                          const url = e.target.value.trim();
                          if (url && !url.startsWith('http://') && !url.startsWith('https://')) {
                            setPreviewUrl(`https://${url}`);
                          }
                        }}
                        placeholder="https://example.com"
                        className="flex-1 px-3 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-indigo-50 hover:border-indigo-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                      />
                    </div>
                    <div className="flex-1 overflow-auto p-4 bg-gray-100">
                      <div
                        className="mx-auto bg-white rounded-lg shadow-lg"
                        style={{
                          width: getPreviewWidth(),
                          maxWidth: '100%',
                          transition: 'width 0.3s ease',
                          minHeight: '600px',
                        }}
                      >
                        {/* Direct DOM Preview - No iframe */}
                        <div
                          className="relative p-8"
                          style={{ minHeight: '600px' }}
                          dangerouslySetInnerHTML={{ __html: formData.html }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Hidden file input for image upload */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (!file || !projectId) return;
                setUploadingImage(true);
                try {
                  const uploadFormData = new FormData();
                  uploadFormData.append('image', file);
                  const response = await axios.post(`${API_URL}/uploads/images`, uploadFormData, {
                    headers: {
                      Authorization: `Bearer ${token}`,
                      'Content-Type': 'multipart/form-data',
                    },
                  });
                  const imageUrl = response.data.url;
                  injectSnippet(`<img src="${imageUrl}" alt="Image" style="max-width:100%;display:block;" />`);
                } catch (error: any) {
                  console.error('Image upload failed:', error);
                  window.alert(error?.response?.data?.error || 'Image upload failed');
                } finally {
                  setUploadingImage(false);
                  if (fileInputRef.current) fileInputRef.current.value = '';
                }
              }}
            />
          </div>
        </div>
      </div>

      {/* Floating Element Toolbar */}
      {showElementToolbar && (
        <div
          className="fixed bg-white border border-gray-300 rounded-lg shadow-xl flex items-center gap-2 px-3 py-2"
          style={{
            top: `${toolbarPosition.top}px`,
            left: `${toolbarPosition.left}px`,
            zIndex: 999999,
          }}
        >
          <button
            onClick={openCssEditor}
            className="flex items-center gap-1 px-3 py-1.5 text-sm text-indigo-600 hover:bg-indigo-50 rounded transition-colors"
            title="Edit CSS"
          >
            <Settings size={16} />
            <span>Edit CSS</span>
          </button>
          <div className="w-px h-6 bg-gray-300"></div>
          <button
            onClick={deleteSelectedElement}
            className="flex items-center gap-1 px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded transition-colors"
            title="Delete Element"
          >
            <Trash2 size={16} />
            <span>Delete</span>
          </button>
          <div className="w-px h-6 bg-gray-300"></div>
          <button
            onClick={() => {
              console.log('❌ Deselecting element');
              setShowElementToolbar(false);
              setSelectedElement({ id: '', element: null });
              // Remove all selected classes
              document.querySelectorAll('.przio-selected').forEach(el => {
                el.classList.remove('przio-selected');
              });
              if (visualEditorRef.current) {
                visualEditorRef.current.querySelectorAll('.przio-selected').forEach(el => {
                  el.classList.remove('przio-selected');
                });
              }
            }}
            className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
            title="Close"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* CSS Editor Modal */}
      {showCssEditor && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white">
              <h2 className="text-xl font-semibold text-gray-900">Edit Element CSS</h2>
              <button
                onClick={() => setShowCssEditor(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="px-6 py-6 space-y-6">
              {/* Layout & Dimensions */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Layout & Dimensions</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Width</label>
                    <input
                      type="text"
                      value={editingElementCss.width}
                      onChange={(e) => setEditingElementCss({ ...editingElementCss, width: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                      placeholder="auto, 100px, 50%"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Height</label>
                    <input
                      type="text"
                      value={editingElementCss.height}
                      onChange={(e) => setEditingElementCss({ ...editingElementCss, height: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                      placeholder="auto, 100px, 50%"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Padding</label>
                    <input
                      type="text"
                      value={editingElementCss.padding}
                      onChange={(e) => setEditingElementCss({ ...editingElementCss, padding: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                      placeholder="10px, 10px 20px"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Margin</label>
                    <input
                      type="text"
                      value={editingElementCss.margin}
                      onChange={(e) => setEditingElementCss({ ...editingElementCss, margin: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                      placeholder="10px, 10px 20px"
                    />
                  </div>
                </div>
              </div>

              {/* Border */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Border</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Width</label>
                    <input
                      type="text"
                      value={editingElementCss.borderWidth}
                      onChange={(e) => setEditingElementCss({ ...editingElementCss, borderWidth: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                      placeholder="1px, 2px"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Style</label>
                    <select
                      value={editingElementCss.borderStyle}
                      onChange={(e) => setEditingElementCss({ ...editingElementCss, borderStyle: e.target.value })}
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
                        onChange={(e) => setEditingElementCss({ ...editingElementCss, borderColor: e.target.value })}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                        placeholder="#000000"
                      />
                      <input
                        type="color"
                        value={editingElementCss.borderColor}
                        onChange={(e) => setEditingElementCss({ ...editingElementCss, borderColor: e.target.value })}
                        className="w-12 h-10 border border-gray-300 rounded-lg cursor-pointer"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Colors & Typography */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Colors & Typography</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Background Color</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={editingElementCss.backgroundColor}
                        onChange={(e) => setEditingElementCss({ ...editingElementCss, backgroundColor: e.target.value })}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                        placeholder="#ffffff"
                      />
                      <input
                        type="color"
                        value={editingElementCss.backgroundColor}
                        onChange={(e) => setEditingElementCss({ ...editingElementCss, backgroundColor: e.target.value })}
                        className="w-12 h-10 border border-gray-300 rounded-lg cursor-pointer"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Text Color</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={editingElementCss.color}
                        onChange={(e) => setEditingElementCss({ ...editingElementCss, color: e.target.value })}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                        placeholder="#000000"
                      />
                      <input
                        type="color"
                        value={editingElementCss.color}
                        onChange={(e) => setEditingElementCss({ ...editingElementCss, color: e.target.value })}
                        className="w-12 h-10 border border-gray-300 rounded-lg cursor-pointer"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Font Size</label>
                    <input
                      type="text"
                      value={editingElementCss.fontSize}
                      onChange={(e) => setEditingElementCss({ ...editingElementCss, fontSize: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                      placeholder="14px, 1rem"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Font Weight</label>
                    <select
                      value={editingElementCss.fontWeight}
                      onChange={(e) => setEditingElementCss({ ...editingElementCss, fontWeight: e.target.value })}
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
                onClick={() => setShowCssEditor(false)}
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
      )}

      {/* Popup Settings Modal */}
      {showPopupSettings && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white">
              <h2 className="text-xl font-semibold text-gray-900">Popup CSS Settings</h2>
              <button
                onClick={() => setShowPopupSettings(false)}
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
                  onChange={(e) => setPopupCssSettings({ ...popupCssSettings, padding: e.target.value })}
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
                  onChange={(e) => setPopupCssSettings({ ...popupCssSettings, border: e.target.value })}
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
                  onChange={(e) => setPopupCssSettings({ ...popupCssSettings, borderRadius: e.target.value })}
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
                    onChange={(e) => setPopupCssSettings({ ...popupCssSettings, backgroundColor: e.target.value })}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                    placeholder="#f9fafb"
                  />
                  <input
                    type="color"
                    value={popupCssSettings.backgroundColor}
                    onChange={(e) => setPopupCssSettings({ ...popupCssSettings, backgroundColor: e.target.value })}
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
                  onChange={(value: string) => setPopupCssSettings({ ...popupCssSettings, textAlign: value })}
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
                onClick={() => setShowPopupSettings(false)}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowPopupSettings(false);
                  // CSS will be applied automatically via useEffect
                }}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}

      <Alert
        isOpen={alert.isOpen}
        message={alert.message}
        type={alert.type}
        onClose={() => setAlert({ ...alert, isOpen: false })}
      />
    </div>
  );
}

