'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../../providers/AuthProvider';
import { useRouter, useSearchParams, useParams } from 'next/navigation';
import axios from 'axios';
import Link from 'next/link';
import AuthHeader from '../../../components/AuthHeader';
import Alert from '../../../components/Alert';
import { ChevronLeft, Save, Trash2, ChevronDown, ChevronUp, Table, Rows3, Square, LayoutGrid, Type, Heading1, Heading2, Heading3, Heading4, Heading5, Heading6, Bold, Italic, Link2, MousePointerClick, Image as ImageIcon, MoreHorizontal, X, Settings, Smartphone, Tablet, Monitor, ArrowUp, ArrowDown } from 'lucide-react';
import HTMLEditor, { HTMLEditorRef } from '../../../components/HTMLEditor';
import CustomDropdown from '../../../components/popups/CustomDropdown';
import PopupSidebar from '../../../components/popups/PopupSidebar';
import ElementToolbar from '../../../components/popups/ElementToolbar';
import CssEditorModal from '../../../components/popups/CssEditorModal';
import PopupSettingsModal from '../../../components/popups/PopupSettingsModal';

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
  const popupEl = doc.querySelector('.przio') || doc.querySelector('.przio-popup');
  
  let result = '';
  if (styleEl) {
    result += styleEl.outerHTML + '\n    ';
  }
  if (popupEl) {
    result += popupEl.outerHTML;
  }
  
  return result.trim();
};

// Helper function to generate a random 4-character alphabet suffix
const generateRandomSuffix = () => {
  const alphabet = 'abcdefghijklmnopqrstuvwxyz';
  let result = '';
  for (let i = 0; i < 4; i++) {
    result += alphabet.charAt(Math.floor(Math.random() * alphabet.length));
  }
  return result;
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
    borderRadius: '',
    // Responsive CSS
    mobileCss: {},
    tabletCss: {},
    desktopCss: {},
  });
  const previewIframeRef = useRef<HTMLIFrameElement>(null);
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
        
        // Ensure HTML has przio wrapper if it doesn't exist
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
        
        if (!popupHtml || (!popupHtml.includes('przio-popup') && !popupHtml.includes('przio'))) {
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
    <div class="przio" id="${popupId}">
    </div>`;
        } else {
          // Ensure the popup has the correct ID and embedded CSS styles
          const parser = new DOMParser();
          const doc = parser.parseFromString(popupHtml, 'text/html');
          const popupEl = doc.querySelector('.przio-popup') || doc.querySelector('.przio');
          if (popupEl) {
            // Ensure class is 'przio'
            if (popupEl.classList.contains('przio-popup')) {
              popupEl.classList.remove('przio-popup');
              popupEl.classList.add('przio');
            }
            
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

  // Inject snippet into popup HTML (only inside przio wrapper)
  const injectSnippet = useCallback((snippet: string, targetSelector?: string, insertPosition?: 'before' | 'after' | 'inside') => {
    try {
      setFormData((prev) => {
        const parser = new DOMParser();
        const doc = parser.parseFromString(wrapForParsing(prev.html || ''), 'text/html');
        
        // Prepare the new element
        const wrapper = doc.createElement('div');
        wrapper.innerHTML = snippet.trim();
        const node = wrapper.firstElementChild as HTMLElement;
        
        if (!node) return prev;

        // Generate unique ID and class for the new element as per user request
        const suffix = generateRandomSuffix();
        const newId = `przio-el-${suffix}`;
        const newClass = `przio-${suffix}`;
        
        node.id = newId;
        node.classList.add('przio-element', newClass);
        node.setAttribute('data-przio-id', newId);
        node.setAttribute('data-przio-class', newClass);

        // Extract inline styles and convert to embedded CSS
        const inlineStyle = node.getAttribute('style') || '';
        if (inlineStyle) {
          let styleEl = doc.querySelector('style');
          if (!styleEl) {
            styleEl = doc.createElement('style');
            doc.head.appendChild(styleEl);
          }
          styleEl.textContent = (styleEl.textContent || '') + `\n        .${newClass} { ${inlineStyle} }`;
          node.removeAttribute('style');
        }

        // Find the przio element - all content must be inside this
        const popupEl = doc.querySelector('.przio') || doc.querySelector('.przio-popup');
        if (!popupEl) {
          console.error('przio element not found');
          return prev;
        }
        
        // Helper to check if an element is inside przio
        const isInsidePopup = (el: Element | null): boolean => {
          if (!el) return false;
          return popupEl.contains(el) || el === popupEl;
        };
        
        let targetEl: Element | null = null;
        if (targetSelector) {
          try {
            targetEl = doc.querySelector(targetSelector);
            // Only allow target if it's inside przio
            if (targetEl && !isInsidePopup(targetEl)) {
              targetEl = null;
            }
          } catch {
            targetEl = null;
          }
        }
        
        // If no specific target, insert into popup
        if (!targetSelector || !targetEl || targetSelector === '.przio' || targetSelector === '.przio-popup') {
          popupEl.appendChild(node);
        } else {
          // Insert relative to target element
          if (insertPosition === 'before') {
            targetEl.parentElement?.insertBefore(node, targetEl);
          } else if (insertPosition === 'after') {
            targetEl.parentElement?.insertBefore(node, targetEl.nextSibling);
          } else {
            targetEl.appendChild(node);
          }
        }

        const nextHtml = extractPopupContent('<!doctype html>' + doc.documentElement.outerHTML);
        return { ...prev, html: nextHtml };
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
        const popupEl = doc.querySelector('.przio') || doc.querySelector('.przio-popup');
        const targetEl = doc.querySelector(selector);
        
        // Only allow removal if target is inside przio and not the popup itself
        if (targetEl && popupEl && popupEl.contains(targetEl) && targetEl !== popupEl) {
          // Collect all classes of target and its children to clean up CSS
          const elementsToCleanup = [targetEl, ...Array.from(targetEl.querySelectorAll('.przio-element'))];
          const classesToCleanup = elementsToCleanup
            .map(el => el.getAttribute('data-przio-class'))
            .filter(Boolean) as string[];

          // Remove the element
          targetEl.remove();

          // Clean up CSS rules
          const styleTag = doc.querySelector('style');
          if (styleTag && classesToCleanup.length > 0) {
            let styleContent = styleTag.textContent || '';
            classesToCleanup.forEach(className => {
              const classSelector = className.startsWith('przio-') ? `.${className}` : `#${className}`;
              const ruleRegex = new RegExp(`${classSelector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*\\{[^}]*\\}`, 'gs');
              styleContent = styleContent.replace(ruleRegex, '');
            });
            styleTag.textContent = styleContent.trim();
          }

          const nextHtml = extractPopupContent('<!doctype html>' + doc.documentElement.outerHTML);
          setSelectedElement({ id: '', element: null });
          return { ...prev, html: nextHtml };
        }
        return prev;
      });
    } catch (error) {
      console.error('Failed to remove element:', error);
    }
  }, []);

  // Move element up or down among siblings
  const moveElementSibling = useCallback((selector: string, direction: 'up' | 'down') => {
    try {
      setFormData((prev) => {
        const parser = new DOMParser();
        const doc = parser.parseFromString(wrapForParsing(prev.html || ''), 'text/html');
        const targetEl = doc.querySelector(selector);
        
        if (!targetEl || !targetEl.parentElement) return prev;
        
        const parent = targetEl.parentElement;
        if (direction === 'up') {
          const prevSibling = targetEl.previousElementSibling;
          if (prevSibling) {
            parent.insertBefore(targetEl, prevSibling);
          }
        } else {
          const nextSibling = targetEl.nextElementSibling;
          if (nextSibling) {
            parent.insertBefore(nextSibling, targetEl);
          }
        }
        
        const nextHtml = extractPopupContent('<!doctype html>' + doc.documentElement.outerHTML);
        return { ...prev, html: nextHtml };
      });
    } catch (error) {
      console.error('Failed to move element:', error);
    }
  }, []);

  // Load element CSS into editor
  const loadElementCss = useCallback((selector: string) => {
    // Try to find the CSS rule in the style tag from the current HTML state
    const parser = new DOMParser();
    const doc = parser.parseFromString(wrapForParsing(formData.html || ''), 'text/html');
    const styleTag = doc.querySelector('style');
    const element = doc.querySelector(selector) as HTMLElement;
    
    let cssFromStyleTag: Record<string, string> = {};
    const elementClass = element?.getAttribute('data-przio-class') || element?.id;
    
    if (styleTag && elementClass) {
      const styleContent = styleTag.textContent || '';
      const classSelector = elementClass.startsWith('przio-') ? `.${elementClass}` : `#${elementClass}`;
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
      width: cssFromStyleTag['width'] || '',
      height: cssFromStyleTag['height'] || '',
      padding: cssFromStyleTag['padding'] || '',
      margin: cssFromStyleTag['margin'] || '',
      borderWidth: cssFromStyleTag['border-width'] || '',
      borderStyle: cssFromStyleTag['border-style'] || 'solid',
      borderColor: cssFromStyleTag['border-color'] || '',
      backgroundColor: cssFromStyleTag['background-color'] || '',
      color: cssFromStyleTag['color'] || '',
      fontSize: cssFromStyleTag['font-size'] || '',
      fontWeight: cssFromStyleTag['font-weight'] || '',
      borderRadius: cssFromStyleTag['border-radius'] || '',
      mobileCss: {},
      tabletCss: {},
      desktopCss: {},
    });
  }, [formData.html]);

  // Handle element click for selection
  const handleElementClick = useCallback((element: HTMLElement, id: string) => {
    // This is now handled via postMessage for iframe consistency
  }, []);

  // Direct drop handler for visual editor
  const handleDirectDrop = useCallback((e: React.DragEvent) => {
    const snippet = draggingSnippetRef.current;
    if (!snippet) return;
    injectSnippet(snippet, '.przio', 'inside');
    setDraggingSnippet(null);
    draggingSnippetRef.current = null;
  }, [injectSnippet]);

  // Delete selected element
  const deleteSelectedElement = useCallback(() => {
    if (!selectedElement.id) return;
    removeElement(selectedElement.id);
    setSelectedElement({ id: '', element: null });
    setShowElementToolbar(false);
  }, [selectedElement, removeElement]);

  // Open CSS editor
  const openCssEditor = useCallback(() => {
    if (!selectedElement.id) return;
    setShowCssEditor(true);
  }, [selectedElement]);

  // Apply CSS changes to element
  const applyCssChanges = useCallback(() => {
    if (!selectedElement.id) return;

    const selector = selectedElement.id;
    
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
    if (editingElementCss.borderRadius) cssProperties += `border-radius: ${editingElementCss.borderRadius}; `;

    setFormData(prev => {
      const parser = new DOMParser();
      const doc = parser.parseFromString(wrapForParsing(prev.html || ''), 'text/html');
      const styleTag = doc.querySelector('style');
      const targetElement = doc.querySelector(selector);
      
      if (styleTag && targetElement) {
        let styleContent = styleTag.textContent || '';
        const elementClass = targetElement.getAttribute('data-przio-class') || targetElement.id;
        const classSelector = elementClass ? (elementClass.startsWith('przio-') ? `.${elementClass}` : `#${elementClass}`) : selector;
        
        const ruleRegex = new RegExp(`${classSelector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*\\{[^}]*\\}`, 'gs');
        
        if (styleContent.match(ruleRegex)) {
          styleContent = styleContent.replace(ruleRegex, `${classSelector} { ${cssProperties} }`);
        } else {
          styleContent += `\n        ${classSelector} { ${cssProperties} }`;
        }
        styleTag.textContent = styleContent;
      }
      
      const nextHtml = extractPopupContent('<!doctype html>' + doc.documentElement.outerHTML);
      return { ...prev, html: nextHtml };
    });

    setShowCssEditor(false);
  }, [selectedElement, editingElementCss]);

  // Re-attach event listeners to elements after HTML changes
  // This useEffect is no longer needed because we use iframe-based editor
  useEffect(() => {
    // If we want to do any top-level synchronization, we can do it here
  }, [formData.html]);

  // Setup iframe drag-drop handlers
  const setupIframeDragDrop = useCallback((iframe: HTMLIFrameElement | null) => {
    if (!iframe) return;
    
    console.log('🏗️ Setting up iframe drag-drop handlers');
    
    const setupDragHandlers = () => {
      const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
      if (!iframeDoc || !iframeDoc.body) {
        console.warn('⚠️ Iframe document or body not available');
        return;
      }

      console.log('✅ Iframe document ready, attaching handlers');
      const parentWindow = iframe.contentWindow?.parent || window;

      // Inject styles for drag-drop and selection
      let styleEl = iframeDoc.getElementById('przio-drag-styles');
      if (!styleEl) {
        styleEl = iframeDoc.createElement('style');
        styleEl.id = 'przio-drag-styles';
        styleEl.textContent = `
          .przio-editable:hover { outline: 2px dashed #94a3b8 !important; outline-offset: 2px; cursor: pointer; }
          .przio-selected { outline: 2px solid #4f46e5 !important; outline-offset: 2px; position: relative; z-index: 100000 !important; }
          .przio.przio-drag-over, .przio-popup.przio-drag-over { 
            outline: 2px dashed #4f46e5 !important; 
            outline-offset: 4px; 
            background-color: rgba(79, 70, 229, 0.05) !important; 
            min-height: 100px !important;
          }
          .przio:empty::before {
            content: 'Drag components here';
            display: flex;
            align-items: center;
            justify-content: center;
            height: 100px;
            color: #6366f1;
            font-size: 14px;
            font-weight: 500;
            border: 2px dashed #e0e7ff;
            border-radius: 8px;
            background: #f8fafc;
          }
          .przio > *:not(.przio-placeholder).przio-drag-over { 
            outline: 2px dashed #4f46e5 !important; 
            outline-offset: 2px; 
            background-color: rgba(79, 70, 229, 0.1) !important; 
          }
          /* Disable pointer events on the background site-iframe during drag */
          body.przio-dragging .site-iframe {
            pointer-events: none !important;
          }
        `;
        iframeDoc.head.appendChild(styleEl);
      }

      // Mark editable elements (only inside przio)
      const markEditableElements = () => {
        const popupEl = iframeDoc.querySelector('.przio') || iframeDoc.querySelector('.przio-popup');
        if (!popupEl) return;
        
        popupEl.querySelectorAll('*').forEach(el => {
          if (['DIV', 'P', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'A', 'BUTTON', 'IMG'].includes(el.tagName)) {
            el.classList.add('przio-editable');
            if (['P', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6'].includes(el.tagName)) {
              (el as HTMLElement).contentEditable = 'true';
              // Sync contentEditable changes back
              el.addEventListener('blur', () => {
                parentWindow.postMessage({ 
                  type: 'przio-content-updated', 
                  html: popupEl.innerHTML 
                }, '*');
              });
            }
          }
        });
      };

      // Setup drop handlers
      const setupDropHandlers = () => {
        const popupEl = (iframeDoc.querySelector('.przio') || iframeDoc.querySelector('.przio-popup')) as HTMLElement;
        const docBody = iframeDoc.body;

        if (!popupEl) {
          console.warn('❌ Popup element (.przio) not found in iframe');
          return;
        }

        // Global drag handlers on body
        docBody.addEventListener('dragover', (e) => {
          e.preventDefault();
          e.stopPropagation();
          docBody.classList.add('przio-dragging');
          
          // Find the deepest element under the cursor
          const target = iframeDoc.elementFromPoint(e.clientX, e.clientY);
          
          // Clear all previous drag-over highlights
          iframeDoc.querySelectorAll('.przio-drag-over').forEach(el => el.classList.remove('przio-drag-over'));
          
          if (target && (target === popupEl || popupEl.contains(target))) {
            target.classList.add('przio-drag-over');
          }
        }, false);

        docBody.addEventListener('dragleave', (e) => {
          if (e.relatedTarget === null || (e.relatedTarget as Node).nodeType === undefined) {
            docBody.classList.remove('przio-dragging');
            iframeDoc.querySelectorAll('.przio-drag-over').forEach(el => el.classList.remove('przio-drag-over'));
          }
        }, false);

        docBody.addEventListener('drop', (e) => {
          e.preventDefault();
          e.stopPropagation();
          docBody.classList.remove('przio-dragging');
          
          const target = iframeDoc.elementFromPoint(e.clientX, e.clientY);
          iframeDoc.querySelectorAll('.przio-drag-over').forEach(el => el.classList.remove('przio-drag-over'));
          
          if (target && (target === popupEl || popupEl.contains(target) || target === docBody)) {
            let selector = '.przio';
            let position: 'inside' | 'before' | 'after' = 'inside';
            
            // If dropping on a specific element inside the popup
            if (target && target !== docBody && (target === popupEl || popupEl.contains(target))) {
              selector = generateSelector(target);
              
              // Smart nesting logic:
              // If dropping on a DIV, we probably want to drop INSIDE it.
              // If dropping on a text element (P, H1-H6, etc.), we probably want to drop AFTER it.
              if (target.tagName === 'DIV' || target === popupEl) {
                position = 'inside';
              } else {
                position = 'after';
              }
            }
            
            console.log('📤 Sending drop message to parent', { selector, position, targetTag: target?.tagName });
            parentWindow.postMessage({ 
              type: 'przio-iframe-drop', 
              selector, 
              position 
            }, '*');
          }
        }, false);

        // Click to select
        popupEl.addEventListener('click', (e) => {
          const target = e.target as HTMLElement;
          console.log('鼠标 Click on:', target.tagName, target.className);
          
          if (target && target !== popupEl && popupEl.contains(target) && target.classList.contains('przio-editable')) {
            iframeDoc.querySelectorAll('.przio-selected').forEach(el => el.classList.remove('przio-selected'));
            target.classList.add('przio-selected');
            const selector = generateSelector(target);
            const rect = target.getBoundingClientRect();
            
            parentWindow.postMessage({ 
              type: 'przio-element-selected', 
              selector, 
              tagName: target.tagName,
              rect: {
                top: rect.top,
                left: rect.left,
                width: rect.width,
                height: rect.height
              }
            }, '*');
          } else if (target === popupEl) {
            iframeDoc.querySelectorAll('.przio-selected').forEach(el => el.classList.remove('przio-selected'));
            popupEl.classList.add('przio-selected');
            const rect = popupEl.getBoundingClientRect();
            
            parentWindow.postMessage({ 
              type: 'przio-element-selected', 
              selector: '.przio', 
              tagName: 'DIV',
              rect: {
                top: rect.top,
                left: rect.left,
                width: rect.width,
                height: rect.height
              }
            }, '*');
          }
        });
      };

      const generateSelector = (el: Element): string => {
        // 1. Try to find unique przio-xxxx class
        const przioClass = Array.from(el.classList).find(c => 
          c.startsWith('przio-') && 
          c !== 'przio' && 
          c !== 'przio-popup' && 
          c !== 'przio-element' && 
          c !== 'przio-editable' && 
          c !== 'przio-selected' && 
          c !== 'przio-drag-over'
        );
        
        if (przioClass) return `.${przioClass}`;

        // 2. Try ID
        if (el.id) return `#${el.id}`;

        // 3. Fallback to full path
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

    // Check if iframe is already loaded
    const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
    if (iframeDoc && iframeDoc.readyState === 'complete' && iframeDoc.body && iframeDoc.body.innerHTML !== '') {
      console.log('iframe already complete, setting up handlers immediately');
      setupDragHandlers();
    }
    
    // Also listen for load event (useful for srcDoc updates)
    iframe.addEventListener('load', setupDragHandlers);

    return () => {
      iframe.removeEventListener('load', setupDragHandlers);
    };
  }, []);

  // Listen for messages from iframe
  useEffect(() => {
    const handleMessage = (e: MessageEvent) => {
      if (e.data?.type === 'przio-iframe-drop') {
        let { selector, position } = e.data;
        const snippet = draggingSnippetRef.current;
        
        console.log('📥 Parent received drop message', { snippet: snippet?.substring(0, 30), selector, position });
        
        if (!snippet) {
          console.warn('⚠️ No snippet available for drop in parent');
          return;
        }
        injectSnippet(snippet, selector, position);
      } else if (e.data?.type === 'przio-element-selected') {
        const { selector, rect } = e.data;
        console.log('📥 Element selected in iframe:', selector, rect);
        
        setSelectedElement({ id: selector, element: null }); 
        
        if (rect && previewIframeRef.current) {
          const iframeRect = previewIframeRef.current.getBoundingClientRect();
          setToolbarPosition({
            top: iframeRect.top + rect.top - 55, // Adjusted offset
            left: iframeRect.left + rect.left,
          });
          setShowElementToolbar(true);
        }
        
        loadElementCss(selector);
      } else if (e.data?.type === 'przio-content-updated') {
        // Handle contentEditable updates if needed
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [injectSnippet, loadElementCss]);

  // Setup iframe when HTML changes or tab changes
  useEffect(() => {
    const iframe = previewIframeRef.current;
    if (!iframe) return;
    
    const cleanup = setupIframeDragDrop(iframe);
    return () => cleanup?.();
  }, [formData.html, activeTab, setupIframeDragDrop]);

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
    const popupElement = popupDoc.querySelector('.przio') || popupDoc.querySelector('.przio-popup');
    
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
        .przio, .przio-popup {
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
      const popupEl = doc.querySelector('.przio') || doc.querySelector('.przio-popup');
      
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
            <PopupSidebar
              formData={formData}
              setFormData={setFormData}
              isBasicSettingsCollapsed={isBasicSettingsCollapsed}
              setIsBasicSettingsCollapsed={setIsBasicSettingsCollapsed}
              previewUrl={previewUrl}
              setPreviewUrl={setPreviewUrl}
              addUrlCondition={addUrlCondition}
              updateUrlCondition={updateUrlCondition}
              removeUrlCondition={removeUrlCondition}
              updateLogicOperator={updateLogicOperator}
            />
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

          {/* Right Column - Visual Editor & Code Editor */}
          <div className="flex-1 overflow-hidden flex flex-col bg-white">
            {/* Tabs Header */}
            <div className="flex items-center justify-between px-4 bg-gray-50 border-b border-gray-200 h-12 flex-shrink-0">
              <div className="flex gap-1">
                {[
                  { id: 'editor', label: 'EDITOR', icon: <Type size={14} /> },
                  { id: 'split', label: 'SPLIT', icon: <Rows3 size={14} /> },
                  { id: 'preview', label: 'PREVIEW', icon: <Monitor size={14} /> }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${
                      activeTab === tab.id
                        ? 'bg-white text-indigo-600 border-x border-t border-gray-200 -mb-px shadow-sm'
                        : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    {tab.icon}
                    {tab.label}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-2">
                <div className="flex bg-gray-200 p-1 rounded-lg">
                  <button
                    onClick={() => setPreviewMode('mobile')}
                    className={`p-1.5 rounded-md transition-all ${previewMode === 'mobile' ? 'bg-white shadow-sm text-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
                  >
                    <Smartphone size={16} />
                  </button>
                  <button
                    onClick={() => setPreviewMode('tablet')}
                    className={`p-1.5 rounded-md transition-all ${previewMode === 'tablet' ? 'bg-white shadow-sm text-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
                  >
                    <Tablet size={16} />
                  </button>
                  <button
                    onClick={() => setPreviewMode('desktop')}
                    className={`p-1.5 rounded-md transition-all ${previewMode === 'desktop' ? 'bg-white shadow-sm text-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
                  >
                    <Monitor size={16} />
                  </button>
                </div>
              </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-hidden relative">
              {activeTab === 'editor' && (
                <div className="h-full">
                  <HTMLEditor
                    value={formData.html}
                    onChange={(val) => setFormData(prev => ({ ...prev, html: val || '' }))}
                    isFullscreen={false}
                    onFullscreenChange={() => {}}
                    ref={htmlEditorRef}
                  />
                </div>
              )}

              {activeTab === 'split' && (
                <div className="h-full flex split-container relative">
                  <div 
                    style={{ width: `${splitPosition}%` }} 
                    className="h-full border-r border-gray-200 overflow-hidden"
                  >
                    <HTMLEditor
                      value={formData.html}
                      onChange={(val) => setFormData(prev => ({ ...prev, html: val || '' }))}
                      isFullscreen={false}
                      onFullscreenChange={() => {}}
                      ref={htmlEditorRef}
                    />
                  </div>
                  
                  {/* Resize Handle */}
                  <div
                    onMouseDown={() => setIsResizing(true)}
                    className="absolute top-0 bottom-0 w-1 bg-gray-200 hover:bg-indigo-400 cursor-col-resize z-20 group transition-colors"
                    style={{ left: `calc(${splitPosition}% - 2px)` }}
                  >
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-8 bg-white border border-gray-300 rounded shadow-sm opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                      <div className="w-0.5 h-3 bg-gray-400 rounded-full mx-0.5"></div>
                      <div className="w-0.5 h-3 bg-gray-400 rounded-full mx-0.5"></div>
                    </div>
                  </div>

                  <div 
                    style={{ width: `${100 - splitPosition}%` }} 
                    className="h-full bg-gray-100 flex flex-col"
                  >
                    <div className="flex-1 flex items-center justify-center overflow-auto p-4">
                      <div 
                        className="bg-white shadow-xl transition-all overflow-hidden relative"
                        style={{ 
                          width: getPreviewWidth(), 
                          height: previewMode === 'desktop' ? '100%' : '667px',
                          maxHeight: '100%'
                        }}
                      >
                        <iframe
                          ref={previewIframeRef}
                          srcDoc={getPreviewHTML()}
                          className="w-full h-full border-0"
                          title="Preview"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'preview' && (
                <div className="h-full flex">
                  {/* Visual Builder Sidebar (only in preview mode) */}
                  <div className="w-48 bg-gray-50 border-r border-gray-200 flex-shrink-0 flex flex-col">
                    <div className="p-3 border-b border-gray-200 bg-white">
                      <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Elements</h3>
                    </div>
                    <div className="flex-1 overflow-y-auto p-2 space-y-2">
                      {DRAG_ITEMS.map((item) => (
                        <div
                          key={item.key}
                          draggable
                          onDragStart={(e) => {
                            setDraggingSnippet(item.snippet);
                            draggingSnippetRef.current = item.snippet;
                            e.dataTransfer.setData('text/plain', item.snippet);
                            // Also set a custom drag image or data if needed
                          }}
                          className="flex flex-col items-center justify-center p-3 bg-white border border-gray-200 rounded-lg hover:border-indigo-500 hover:text-indigo-600 cursor-grab active:cursor-grabbing transition-all shadow-sm group"
                        >
                          <div className="text-gray-400 group-hover:text-indigo-500 mb-1 transition-colors">
                            {item.icon}
                          </div>
                          <span className="text-[10px] font-medium text-gray-600 group-hover:text-indigo-600">{item.label}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Canvas Area */}
                  <div className="flex-1 bg-gray-100 flex flex-col">
                    <div className="flex-1 flex items-center justify-center overflow-auto p-8">
                      <div 
                        className="bg-white shadow-2xl transition-all overflow-hidden relative"
                        style={{ 
                          width: getPreviewWidth(), 
                          height: previewMode === 'desktop' ? '100%' : '667px',
                          maxHeight: '100%'
                        }}
                      >
                        <iframe
                          ref={previewIframeRef}
                          srcDoc={getPreviewHTML()}
                          className="w-full h-full border-0"
                          title="Visual Editor"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <ElementToolbar
        toolbarPosition={toolbarPosition}
        selectedElementId={selectedElement.id}
        moveElementSibling={moveElementSibling}
        openCssEditor={openCssEditor}
        deleteSelectedElement={deleteSelectedElement}
        onClose={() => {
          setShowElementToolbar(false);
          setSelectedElement({ id: '', element: null });
        }}
      />

      <CssEditorModal
        isOpen={showCssEditor}
        onClose={() => setShowCssEditor(false)}
        editingElementCss={editingElementCss}
        setEditingElementCss={setEditingElementCss}
        applyCssChanges={applyCssChanges}
      />

      <PopupSettingsModal
        isOpen={showPopupSettings}
        onClose={() => setShowPopupSettings(false)}
        popupCssSettings={popupCssSettings}
        setPopupCssSettings={setPopupCssSettings}
      />

      <Alert
        isOpen={alert.isOpen}
        message={alert.message}
        type={alert.type}
        onClose={() => setAlert({ ...alert, isOpen: false })}
      />
    </div>
  );
}

