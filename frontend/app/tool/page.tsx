'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../providers/AuthProvider';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import Link from 'next/link';
import HTMLEditor, { HTMLEditorRef } from '../../components/HTMLEditor';
import ConfirmDialog from '../../components/ConfirmDialog';
import Alert from '../../components/Alert';
import AuthHeader from '../../components/AuthHeader';
import {
  Table,
  Rows3,
  Square,
  LayoutGrid,
  Minus,
  Type,
  Heading1,
  Heading2,
  Heading3,
  Heading4,
  Heading5,
  Heading6,
  Bold,
  Italic,
  Link2,
  MousePointerClick,
  Image as ImageIcon,
  MoreHorizontal,
  Send,
  Save,
  X,
} from 'lucide-react';

const API_URL = '/api';

// Helper function to ensure image URLs are absolute
function ensureAbsoluteImageUrl(url: string): string {
  if (!url || url.trim() === '') return url;
  
  const trimmedUrl = url.trim();
  
  // If already absolute (starts with http:// or https://), return as-is
  if (trimmedUrl.startsWith('http://') || trimmedUrl.startsWith('https://')) {
    return trimmedUrl;
  }
  
  // Get base URL from environment or window location
  let baseUrl = process.env.NEXT_PUBLIC_APP_URL;
  if (!baseUrl || baseUrl.includes('localhost')) {
    if (typeof window !== 'undefined') {
      baseUrl = window.location.origin;
    } else {
      baseUrl = 'http://localhost:3000';
    }
  }
  
  // Remove trailing slash from baseUrl
  baseUrl = baseUrl.replace(/\/$/, '');
  
  // Ensure relative URL starts with /
  const relativePath = trimmedUrl.startsWith('/') ? trimmedUrl : `/${trimmedUrl}`;
  
  return `${baseUrl}${relativePath}`;
}

const defaultHtmlTemplate = `<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <title>Email Template</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>

<body style="margin:0; padding:0; background-color:#f2f4f7; font-family:Arial, Helvetica, sans-serif;">

    <table width="700" cellpadding="0" cellspacing="0" border="0" bgcolor="#f2f4f7" class="main-email" style="width:700px; max-width:100%; margin:0 auto;">
        <tbody><tr>
            <td align="center" style="padding:20px 10px;">
                <!-- Drag and Drop Placeholder -->
                <div class="przio-placeholder" style="position:relative; padding:60px 20px; border:2px dashed #cbd5e1; border-radius:12px; background-color:#ffffff; text-align:center; max-width:660px; margin:0 auto;" contenteditable="false">
                    <p style="margin:0 0 12px 0; font-size:32px; color:#64748b;">📧</p>
                    <p style="margin:0 0 8px 0; font-size:20px; font-weight:600; color:#1e293b;">
                        Start Building Your Email
                    </p>
                    <p style="margin:0; font-size:14px; color:#64748b; line-height:1.6;">
                        Drag and drop components from the toolbar<br>
                        to create your email template
                    </p>
                </div>
            </td>
        </tr>
    </tbody></table>

</body>

</html>`;

interface Template {
  _id: string;
  name: string;
  html: string;
  folder?: string;
  isDefault?: boolean;
  defaultTemplateId?: string;
  createdAt: string;
  updatedAt: string;
}


export default function ToolPage() {
  const { user, token, logout, loading: authLoading } = useAuth();
  const router = useRouter();
  const searchParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
  const [projectId, setProjectId] = useState<string | null>(null);
  const [projectInfo, setProjectInfo] = useState<{ name: string; role: 'owner' | 'ProjectAdmin' | 'emailDeveloper' } | null>(null);
  const [checkingProject, setCheckingProject] = useState(true);
  const [html, setHtml] = useState(defaultHtmlTemplate);
  const [templateName, setTemplateName] = useState('');
  const [templates, setTemplates] = useState<Template[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'editor' | 'preview' | 'split'>('split');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [previewMode, setPreviewMode] = useState<'mobile' | 'tablet' | 'desktop'>('desktop');
  const [previewZoom, setPreviewZoom] = useState(100); // Zoom percentage
  const [splitPosition, setSplitPosition] = useState(50); // Percentage
  const [isResizing, setIsResizing] = useState(false);
  const [draggingSnippet, setDraggingSnippet] = useState<string | null>(null);
  const [isOverCanvas, setIsOverCanvas] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [originalHtml, setOriginalHtml] = useState(defaultHtmlTemplate);
  const [originalTemplateName, setOriginalTemplateName] = useState('');
  const [isNewUnsavedTemplate, setIsNewUnsavedTemplate] = useState(false);
  const [folders, setFolders] = useState<Array<{ _id?: string; name: string }>>([]);
  const [selectedFolder, setSelectedFolder] = useState<string>('');
  const [showNewFolderInput, setShowNewFolderInput] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [showNewPageInput, setShowNewPageInput] = useState(false);
  const [newPageName, setNewPageName] = useState('');
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());
  const [draggedTemplate, setDraggedTemplate] = useState<string | null>(null);
  const [dragOverFolder, setDragOverFolder] = useState<string | null>(null);
  const [showSettingsDropdown, setShowSettingsDropdown] = useState(false);
  const [showSendEmailModal, setShowSendEmailModal] = useState(false);
  const [showProgressModal, setShowProgressModal] = useState(false);
  const [emailProgress, setEmailProgress] = useState({ sent: 0, pending: 0, failed: 0, total: 0 });
  const [selectedSmtp, setSelectedSmtp] = useState<string>('');
  const [selectedRecipients, setSelectedRecipients] = useState<string[]>([]);
  const [selectedFolders, setSelectedFolders] = useState<string[]>([]);
  const [smtpConfigs, setSmtpConfigs] = useState<any[]>([]);
  const [recipients, setRecipients] = useState<any[]>([]);
  const [recipientFolders, setRecipientFolders] = useState<string[]>([]);
  const [emailSubject, setEmailSubject] = useState('');
  const [sendingEmails, setSendingEmails] = useState(false);
  const [recipientSearch, setRecipientSearch] = useState('');
  const [expandedRecipientFolders, setExpandedRecipientFolders] = useState<Set<string>>(new Set());
  const [showSearchSuggestions, setShowSearchSuggestions] = useState(false);
  const [highlightedSuggestionIndex, setHighlightedSuggestionIndex] = useState(-1);
  const [templateSearch, setTemplateSearch] = useState('');
  const [showTemplateSuggestions, setShowTemplateSuggestions] = useState(false);
  const [highlightedTemplateIndex, setHighlightedTemplateIndex] = useState(-1);
  const [showTemplateDropdown, setShowTemplateDropdown] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    type?: 'danger' | 'warning' | 'info';
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
    type: 'warning',
  });
  const [alert, setAlert] = useState<{
    isOpen: boolean;
    message: string;
    type?: 'success' | 'error' | 'warning' | 'info';
  }>({
    isOpen: false,
    message: '',
    type: 'info',
  });
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareUrl, setShareUrl] = useState('');
  const [creatingShareLink, setCreatingShareLink] = useState(false);
  const isSavingRef = useRef(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const splitIframeRef = useRef<HTMLIFrameElement>(null);
  const previewIframeRef = useRef<HTMLIFrameElement>(null);
  const htmlEditorRef = useRef<HTMLEditorRef>(null);
  const [dropTargetElement, setDropTargetElement] = useState<string | null>(null);
  const [selectedElement, setSelectedElement] = useState<{ selector: string; tagName: string } | null>(null);
  const [showMoreTools, setShowMoreTools] = useState(false);
  const [showImageUrlModal, setShowImageUrlModal] = useState(false);
  const [imageUrlInput, setImageUrlInput] = useState('');
  const [targetImageSelector, setTargetImageSelector] = useState<string | null>(null);
  const [showLinkEditModal, setShowLinkEditModal] = useState(false);
  const [linkUrlInput, setLinkUrlInput] = useState('');
  const [targetLinkSelector, setTargetLinkSelector] = useState<string | null>(null);
  const [showCssEditModal, setShowCssEditModal] = useState(false);
  const [cssEditInput, setCssEditInput] = useState('');
  const [targetCssSelector, setTargetCssSelector] = useState<string | null>(null);
  const [targetCssTagName, setTargetCssTagName] = useState<string>('');
  const [showAdvancedCss, setShowAdvancedCss] = useState(false);
  const [cssFields, setCssFields] = useState({
    paddingTop: '',
    paddingRight: '',
    paddingBottom: '',
    paddingLeft: '',
    marginTop: '',
    marginRight: '',
    marginBottom: '',
    marginLeft: '',
    fontSize: '',
    width: '',
    height: '',
    backgroundColor: '',
    color: '',
    borderSpacing: '',
    cellSpacing: '',
    cellPadding: '',
    border: '',
    borderWidth: '',
    borderColor: '',
    borderStyle: '',
    borderCollapse: '',
    colspan: '',
    attrWidth: '', // HTML attribute width for TABLE/TD
    attrHeight: '', // HTML attribute height for TABLE/TD
  });

  // Image placeholder - a styled div that looks like an image placeholder
  const IMAGE_PLACEHOLDER = '<div class="przio-image-placeholder" style="width:100%;min-height:150px;background:linear-gradient(135deg,#e0e7ff 0%,#c7d2fe 100%);border:2px dashed #6366f1;border-radius:8px;display:flex;align-items:center;justify-content:center;cursor:pointer;position:relative;"><div style="text-align:center;color:#4f46e5;"><svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg><p style="margin:8px 0 0;font-size:14px;font-weight:500;">Click to add image</p></div></div>';

  // Mini placeholder for container elements - shows drop instruction
  const MINI_PLACEHOLDER = '<div class="przio-placeholder przio-mini-placeholder" style="padding:20px 12px;border:2px dashed #c7d2fe;border-radius:8px;background-color:#f8fafc;text-align:center;"><p style="margin:0;font-size:12px;color:#6b7280;">Drop elements here</p></div>';
  
  // Cell placeholder - smaller version for table cells
  const CELL_PLACEHOLDER = '<div class="przio-placeholder przio-cell-placeholder" style="padding:12px 8px;border:1px dashed #c7d2fe;border-radius:4px;background-color:#f8fafc;text-align:center;"><p style="margin:0;font-size:11px;color:#9ca3af;">Drop here</p></div>';

  // Primary items shown in main toolbar, secondary items in dropdown
  const DRAG_ITEMS: Array<{
    key: string;
    label: string;
    snippet: string;
    icon: React.ReactNode;
    primary?: boolean;
  }> = [
    // Primary items (always visible)
    { key: 'table', label: 'Table', snippet: `<table style="width:100%;border-collapse:collapse;"><tr><td style="border:1px solid #e5e7eb;padding:12px;">${CELL_PLACEHOLDER}</td><td style="border:1px solid #e5e7eb;padding:12px;">${CELL_PLACEHOLDER}</td></tr></table>`, icon: <Table size={16} />, primary: true },
    { key: 'div', label: 'Container', snippet: `<div style="padding:16px;background:#f9fafb;border:1px solid #e5e7eb;border-radius:8px;">${MINI_PLACEHOLDER}</div>`, icon: <LayoutGrid size={16} />, primary: true },
    { key: 'p', label: 'Paragraph', snippet: '<p style="margin:0 0 12px 0;font-size:14px;line-height:1.6;color:#111827;">Your paragraph text here</p>', icon: <Type size={16} />, primary: true },
    { key: 'h1', label: 'H1', snippet: '<h1 style="margin:0 0 16px 0;font-size:32px;font-weight:700;color:#111827;">Heading 1</h1>', icon: <Heading1 size={16} />, primary: true },
    { key: 'h2', label: 'H2', snippet: '<h2 style="margin:0 0 14px 0;font-size:24px;font-weight:700;color:#111827;">Heading 2</h2>', icon: <Heading2 size={16} />, primary: true },
    { key: 'a', label: 'Link', snippet: '<p style="margin:0 0 12px 0;"><a href="#" style="color:#4f46e5;text-decoration:underline;font-weight:500;">Click here</a></p>', icon: <Link2 size={16} />, primary: true },
    { key: 'button', label: 'Button', snippet: '<p style="margin:0 0 12px 0;text-align:center;"><a href="#" style="display:inline-block;padding:12px 24px;background:linear-gradient(90deg,#4f46e5,#0ea5e9);color:#ffffff;text-decoration:none;border-radius:6px;font-weight:600;font-size:14px;">Button Text</a></p>', icon: <MousePointerClick size={16} />, primary: true },
    { key: 'image', label: 'Image', snippet: '__IMAGE_PLACEHOLDER__', icon: <ImageIcon size={16} />, primary: true },
    { key: 'tr', label: 'Row', snippet: `<tr><td style="border:1px solid #e5e7eb;padding:12px;">${CELL_PLACEHOLDER}</td><td style="border:1px solid #e5e7eb;padding:12px;">${CELL_PLACEHOLDER}</td></tr>`, icon: <Rows3 size={16} />, primary: true },
    { key: 'td', label: 'Cell', snippet: `<td style="border:1px solid #e5e7eb;padding:12px;">${CELL_PLACEHOLDER}</td>`, icon: <Square size={16} />, primary: true },
    // Secondary items (in dropdown)
    { key: 'hr', label: 'Divider', snippet: '<hr style="border:none;border-top:1px solid #e5e7eb;margin:16px 0;" />', icon: <Minus size={16} /> },
    { key: 'h3', label: 'H3', snippet: '<h3 style="margin:0 0 12px 0;font-size:20px;font-weight:600;color:#111827;">Heading 3</h3>', icon: <Heading3 size={16} /> },
    { key: 'h4', label: 'H4', snippet: '<h4 style="margin:0 0 10px 0;font-size:18px;font-weight:600;color:#111827;">Heading 4</h4>', icon: <Heading4 size={16} /> },
    { key: 'h5', label: 'H5', snippet: '<h5 style="margin:0 0 8px 0;font-size:16px;font-weight:600;color:#111827;">Heading 5</h5>', icon: <Heading5 size={16} /> },
    { key: 'h6', label: 'H6', snippet: '<h6 style="margin:0 0 8px 0;font-size:14px;font-weight:600;color:#111827;">Heading 6</h6>', icon: <Heading6 size={16} /> },
    { key: 'bold', label: 'Bold', snippet: '<p style="margin:0 0 12px 0;font-size:14px;line-height:1.6;color:#111827;"><strong>Bold text here</strong></p>', icon: <Bold size={16} /> },
    { key: 'italic', label: 'Italic', snippet: '<p style="margin:0 0 12px 0;font-size:14px;line-height:1.6;color:#111827;"><em>Italic text here</em></p>', icon: <Italic size={16} /> },
  ];
  
  const primaryItems = DRAG_ITEMS.filter(item => item.primary);
  const secondaryItems = DRAG_ITEMS.filter(item => !item.primary);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  const injectSnippet = useCallback((snippet: string, targetSelector?: string, insertPosition?: 'before' | 'after' | 'inside') => {
    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(html || '<!doctype html><html><body></body></html>', 'text/html');
      const wrapper = doc.createElement('div');
      wrapper.innerHTML = snippet.trim();
      const node = wrapper.firstElementChild || wrapper;
      
      // Find the main-email element - all content must be inside this
      const mainEmailEl = doc.querySelector('.main-email');
      if (!mainEmailEl) {
        console.error('main-email element not found');
        return;
      }
      
      // Helper to check if an element is inside main-email
      const isInsideMainEmail = (el: Element | null): boolean => {
        if (!el) return false;
        return mainEmailEl.contains(el) || el === mainEmailEl;
      };
      
      // Helper to find the insertion point inside main-email
      const findInsertionPoint = (): Element => {
        // Find the td inside main-email (the content area)
        const contentTd = mainEmailEl.querySelector('td');
        return contentTd || mainEmailEl;
      };
      
      let targetEl: Element | null = null;
      if (targetSelector) {
        try {
          targetEl = doc.querySelector(targetSelector);
          // Only allow target if it's inside main-email
          if (targetEl && !isInsideMainEmail(targetEl)) {
            targetEl = null;
          }
        } catch {
          targetEl = null;
        }
      }
      
      // Helper to remove all placeholders from a container
      const removePlaceholdersFromContainer = (container: Element | null) => {
        if (!container) return;
        container.querySelectorAll('.przio-placeholder').forEach(p => p.remove());
      };
      
      // If target itself is a placeholder, replace it with the new content
      if (targetEl?.classList.contains('przio-placeholder')) {
        const parent = targetEl.parentElement;
        if (parent && isInsideMainEmail(parent)) {
          parent.insertBefore(node.cloneNode(true), targetEl);
          targetEl.remove();
          const nextHtml = '<!doctype html>' + doc.documentElement.outerHTML;
          setHtml(nextHtml);
          return;
        }
      }
      
      // If dropping before/after an element, check if sibling placeholders should be removed
      if (targetEl && (insertPosition === 'before' || insertPosition === 'after')) {
        const parent = targetEl.parentElement;
        if (parent && isInsideMainEmail(parent)) {
          // Remove any placeholder siblings in the same parent
          removePlaceholdersFromContainer(parent);
        }
      }
      
      // If dropping inside a container, remove its placeholder children
      if (targetEl && insertPosition === 'inside') {
        if (isInsideMainEmail(targetEl)) {
          removePlaceholdersFromContainer(targetEl);
        }
      }
      
      // If no specific target, insert into main-email content area
      if (!targetSelector || !targetEl) {
        const insertionPoint = findInsertionPoint();
        // Remove placeholder if it exists in the insertion point
        removePlaceholdersFromContainer(insertionPoint);
        insertionPoint.appendChild(node.cloneNode(true));
        const nextHtml = '<!doctype html>' + doc.documentElement.outerHTML;
        setHtml(nextHtml);
        return;
      }
      
      // Insert relative to target element (only if inside main-email)
      if (targetEl && insertPosition && isInsideMainEmail(targetEl)) {
        if (insertPosition === 'before') {
          targetEl.parentElement?.insertBefore(node.cloneNode(true), targetEl);
        } else if (insertPosition === 'after') {
          targetEl.parentElement?.insertBefore(node.cloneNode(true), targetEl.nextSibling);
        } else {
          targetEl.appendChild(node.cloneNode(true));
        }
        const nextHtml = '<!doctype html>' + doc.documentElement.outerHTML;
        setHtml(nextHtml);
      }
    } catch (error) {
      console.error('Failed to inject snippet:', error);
    }
  }, [html]);

  // Remove an element from the HTML by selector
  const removeElement = useCallback((selector: string) => {
    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(html || '<!doctype html><html><body></body></html>', 'text/html');
      const targetEl = doc.querySelector(selector);
      
      if (targetEl && targetEl !== doc.body) {
        targetEl.remove();
        const nextHtml = '<!doctype html>' + doc.documentElement.outerHTML;
        setHtml(nextHtml);
        setSelectedElement(null);
      }
    } catch (error) {
      console.error('Failed to remove element:', error);
    }
  }, [html]);

  // Move element up or down
  const moveElement = useCallback((selector: string, direction: 'up' | 'down') => {
    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(html || '<!doctype html><html><body></body></html>', 'text/html');
      const targetEl = doc.querySelector(selector);
      
      if (targetEl && targetEl.parentElement) {
        const parent = targetEl.parentElement;
        if (direction === 'up' && targetEl.previousElementSibling) {
          parent.insertBefore(targetEl, targetEl.previousElementSibling);
        } else if (direction === 'down' && targetEl.nextElementSibling) {
          parent.insertBefore(targetEl.nextElementSibling, targetEl);
        }
        const nextHtml = '<!doctype html>' + doc.documentElement.outerHTML;
        setHtml(nextHtml);
      }
    } catch (error) {
      console.error('Failed to move element:', error);
    }
  }, [html]);

  // Duplicate an element
  const duplicateElement = useCallback((selector: string) => {
    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(html || '<!doctype html><html><body></body></html>', 'text/html');
      const targetEl = doc.querySelector(selector);
      
      if (targetEl && targetEl.parentElement) {
        const clone = targetEl.cloneNode(true);
        targetEl.parentElement.insertBefore(clone, targetEl.nextSibling);
        const nextHtml = '<!doctype html>' + doc.documentElement.outerHTML;
        setHtml(nextHtml);
      }
    } catch (error) {
      console.error('Failed to duplicate element:', error);
    }
  }, [html]);

  // Update image src or replace placeholder with image
  const updateImageSrc = useCallback((selector: string, newSrc: string) => {
    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(html || '<!doctype html><html><body></body></html>', 'text/html');
      const targetEl = doc.querySelector(selector);
      
      if (targetEl) {
        // Check if it's an image placeholder
        if (targetEl.classList.contains('przio-image-placeholder')) {
          // Replace placeholder with actual image
          const img = doc.createElement('img');
          img.src = newSrc;
          img.alt = 'Uploaded image';
          img.style.cssText = 'max-width:100%;display:block;';
          targetEl.parentElement?.replaceChild(img, targetEl);
        } else if (targetEl.tagName === 'IMG') {
          // Update existing image src
          (targetEl as HTMLImageElement).src = newSrc;
        }
        const nextHtml = '<!doctype html>' + doc.documentElement.outerHTML;
        setHtml(nextHtml);
      }
    } catch (error) {
      console.error('Failed to update image:', error);
    }
  }, [html]);

  // Update text content of an element
  const updateTextContent = useCallback((selector: string, newText: string) => {
    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(html || '<!doctype html><html><body></body></html>', 'text/html');
      const targetEl = doc.querySelector(selector);
      
      if (targetEl) {
        targetEl.innerHTML = newText;
        const nextHtml = '<!doctype html>' + doc.documentElement.outerHTML;
        setHtml(nextHtml);
      }
    } catch (error) {
      console.error('Failed to update text:', error);
    }
  }, [html]);

  // Update href attribute of an anchor tag
  const updateLinkHref = useCallback((selector: string, newHref: string) => {
    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(html || '<!doctype html><html><body></body></html>', 'text/html');
      const targetEl = doc.querySelector(selector);
      
      if (targetEl && targetEl.tagName === 'A') {
        (targetEl as HTMLAnchorElement).href = newHref;
        const nextHtml = '<!doctype html>' + doc.documentElement.outerHTML;
        setHtml(nextHtml);
      }
    } catch (error) {
      console.error('Failed to update link:', error);
    }
  }, [html]);

  // Update inline style of an element
  const updateElementStyle = useCallback((selector: string, newStyle: string) => {
    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(html || '<!doctype html><html><body></body></html>', 'text/html');
      const targetEl = doc.querySelector(selector);
      
      if (targetEl) {
        (targetEl as HTMLElement).style.cssText = newStyle;
        const nextHtml = '<!doctype html>' + doc.documentElement.outerHTML;
        setHtml(nextHtml);
      }
    } catch (error) {
      console.error('Failed to update style:', error);
    }
  }, [html]);

  // Handle image file upload for a specific selector
  const handleImageUploadForSelector = useCallback(async (file: File, selector: string) => {
    try {
      setUploadingImage(true);
      const form = new FormData();
      form.append('file', file);
      form.append('shareToken', projectId || 'tool');
      const res = await fetch('/api/uploads/images', {
        method: 'POST',
        body: form,
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error || 'Upload failed');
      }
      updateImageSrc(selector, data.url);
    } catch (error: any) {
      window.alert(error?.message || 'Image upload failed');
    } finally {
      setUploadingImage(false);
    }
  }, [projectId, updateImageSrc]);

  // Setup drag-and-drop handlers inside iframe
  const setupIframeDragDrop = useCallback((iframe: HTMLIFrameElement | null) => {
    if (!iframe) return;
    
    const setupDragHandlers = () => {
      const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
      if (!iframeDoc || !iframeDoc.body) return;

      // Get parent window reference for postMessage (this is the React app window)
      const parentWindow = iframe.contentWindow?.parent || window;

      // Inject styles for drag-drop and element selection
      let styleEl = iframeDoc.getElementById('przio-drag-styles');
      if (!styleEl) {
        styleEl = iframeDoc.createElement('style');
        styleEl.id = 'przio-drag-styles';
        styleEl.textContent = `
          /* Hover effect for editable elements */
          .przio-editable:hover {
            outline: 2px dashed #94a3b8 !important;
            outline-offset: 2px;
            cursor: pointer;
          }
          
          /* Selected element */
          .przio-selected {
            outline: 2px solid #4f46e5 !important;
            outline-offset: 2px;
            position: relative;
          }
          
          /* Drop zone styles */
          .przio-drop-zone {
            position: relative;
          }
          .przio-drop-zone::after {
            content: '';
            position: absolute;
            inset: 0;
            background: rgba(79, 70, 229, 0.1);
            border: 2px dashed #4f46e5;
            border-radius: 4px;
            pointer-events: none;
            opacity: 0;
            transition: opacity 0.15s ease;
          }
          .przio-drop-zone.przio-drag-over::after {
            opacity: 1;
          }
          
          /* Drop indicator line */
          .przio-drop-indicator {
            position: absolute;
            left: 0;
            right: 0;
            height: 4px;
            background: linear-gradient(90deg, #4f46e5, #8b5cf6);
            border-radius: 2px;
            pointer-events: none;
            z-index: 10000;
            box-shadow: 0 0 8px rgba(79, 70, 229, 0.5);
          }
          .przio-drop-indicator::before,
          .przio-drop-indicator::after {
            content: '';
            position: absolute;
            width: 8px;
            height: 8px;
            background: #4f46e5;
            border-radius: 50%;
            top: 50%;
            transform: translateY(-50%);
          }
          .przio-drop-indicator::before { left: -4px; }
          .przio-drop-indicator::after { right: -4px; }
          
          /* Dragging cursor */
          body.przio-dragging * {
            cursor: copy !important;
          }
          
          /* Placeholder styles - non-interactive */
          .przio-placeholder {
            pointer-events: none;
            user-select: none;
            -webkit-user-select: none;
            -moz-user-select: none;
            -ms-user-select: none;
            contenteditable: false !important;
            cursor: default !important;
          }
          .przio-placeholder * {
            pointer-events: none;
            user-select: none;
            -webkit-user-select: none;
            -moz-user-select: none;
            -ms-user-select: none;
            contenteditable: false !important;
          }
          .przio-placeholder-close {
            pointer-events: auto !important;
          }
          body.przio-dragging .przio-placeholder {
            background: linear-gradient(135deg, #c7d2fe 0%, #a5b4fc 100%) !important;
            border-color: #6366f1 !important;
          }
          body.przio-dragging .przio-placeholder p {
            color: #4f46e5 !important;
          }
          
          /* Element action toolbar */
          .przio-toolbar {
            position: fixed;
            display: flex;
            gap: 4px;
            background: linear-gradient(135deg, #1f2937 0%, #111827 100%);
            padding: 8px 12px;
            border-radius: 10px;
            box-shadow: 0 8px 24px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.1);
            z-index: 99999;
            white-space: nowrap;
            animation: przio-toolbar-appear 0.15s ease-out;
          }
          @keyframes przio-toolbar-appear {
            from { opacity: 0; transform: scale(0.95) translateY(5px); }
            to { opacity: 1; transform: scale(1) translateY(0); }
          }
          .przio-toolbar::after {
            content: '';
            position: absolute;
            bottom: -6px;
            left: 50%;
            transform: translateX(-50%);
            border-left: 8px solid transparent;
            border-right: 8px solid transparent;
            border-top: 8px solid #111827;
          }
          .przio-toolbar button {
            background: rgba(255,255,255,0.1);
            border: none;
            color: white;
            padding: 6px 10px;
            border-radius: 6px;
            cursor: pointer;
            font-size: 14px;
            display: flex;
            align-items: center;
            gap: 4px;
            transition: all 0.15s;
          }
          .przio-toolbar button:hover {
            background: rgba(255,255,255,0.25);
            transform: scale(1.05);
          }
          .przio-toolbar button.delete:hover {
            background: #ef4444;
          }
          .przio-toolbar .tag-name {
            color: #a5b4fc;
            font-size: 11px;
            font-weight: 600;
            padding: 4px 8px;
            background: rgba(99, 102, 241, 0.4);
            border-radius: 6px;
            margin-right: 6px;
            display: flex;
            align-items: center;
          }
          
          /* Text editing styles */
          .przio-text-editable {
            cursor: text;
          }
          .przio-text-editable:focus {
            outline: 2px solid #4f46e5 !important;
            outline-offset: 2px;
            background: rgba(79, 70, 229, 0.05);
          }
          
          /* Image and placeholder hover controls */
          .przio-image-wrapper {
            position: relative;
            display: inline-block;
          }
          .przio-image-controls {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            display: none;
            gap: 8px;
            background: rgba(0,0,0,0.8);
            padding: 12px 16px;
            border-radius: 12px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.4);
            z-index: 10002;
          }
          .przio-image-placeholder:hover .przio-image-controls,
          img.przio-has-controls:hover + .przio-image-controls,
          .przio-image-controls:hover {
            display: flex;
          }
          .przio-image-controls button {
            background: linear-gradient(135deg, #4f46e5, #6366f1);
            border: none;
            color: white;
            padding: 10px 16px;
            border-radius: 8px;
            cursor: pointer;
            font-size: 13px;
            font-weight: 500;
            display: flex;
            align-items: center;
            gap: 6px;
            transition: all 0.2s;
            white-space: nowrap;
          }
          .przio-image-controls button:hover {
            background: linear-gradient(135deg, #4338ca, #4f46e5);
            transform: scale(1.05);
          }
          .przio-image-controls button.upload-btn {
            background: linear-gradient(135deg, #059669, #10b981);
          }
          .przio-image-controls button.upload-btn:hover {
            background: linear-gradient(135deg, #047857, #059669);
          }
          
          /* Image placeholder specific styles */
          .przio-image-placeholder {
            position: relative;
          }
          .przio-image-placeholder:hover {
            border-color: #4f46e5 !important;
            background: linear-gradient(135deg,#c7d2fe 0%,#a5b4fc 100%) !important;
          }
        `;
        iframeDoc.head.appendChild(styleEl);
      }

      // Remove existing elements
      iframeDoc.querySelectorAll('.przio-drop-indicator, .przio-toolbar').forEach(el => el.remove());

      // Create drop indicator element
      const dropIndicator = iframeDoc.createElement('div');
      dropIndicator.className = 'przio-drop-indicator';
      dropIndicator.style.display = 'none';
      iframeDoc.body.appendChild(dropIndicator);

      let currentTarget: Element | null = null;
      let insertPosition: 'before' | 'after' | 'inside' = 'after';
      let currentlySelected: Element | null = null;
      let toolbar: HTMLElement | null = null;

      const blockTags = ['DIV', 'P', 'TABLE', 'TR', 'TD', 'TH', 'SECTION', 'ARTICLE', 'HEADER', 'FOOTER', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'UL', 'OL', 'LI', 'IMG', 'A', 'SPAN', 'STRONG', 'EM', 'B', 'I', 'HR'];

      const getDropPosition = (e: DragEvent, element: Element): 'before' | 'after' | 'inside' => {
        const rect = element.getBoundingClientRect();
        const y = e.clientY - rect.top;
        const threshold = rect.height * 0.25;
        
        if (y < threshold) return 'before';
        if (y > rect.height - threshold) return 'after';
        return 'inside';
      };

      // Classes added by visual editor that should be skipped when generating selectors
      const visualEditorClasses = ['przio-image-wrapper', 'przio-drop-indicator', 'przio-toolbar', 'przio-image-controls'];
      
      const generateSelector = (el: Element): string => {
        const path: string[] = [];
        let current: Element | null = el;
        while (current && current !== iframeDoc.body) {
          // Skip visual editor wrapper elements
          if (visualEditorClasses.some(cls => current?.classList.contains(cls))) {
            current = current.parentElement;
            continue;
          }
          
          let selector = current.tagName.toLowerCase();
          if (current.id && !current.id.startsWith('przio-')) {
            selector = `#${current.id}`;
            path.unshift(selector);
            break;
          }
          const parent = current.parentElement;
          if (parent) {
            // Filter out visual editor elements when counting siblings
            const siblings = Array.from(parent.children).filter(c => 
              c.tagName === current!.tagName && 
              !visualEditorClasses.some(cls => c.classList.contains(cls))
            );
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

      // Text element tags that should show blinking cursor for editing
      // Only pure text elements - not structural elements like TD, TH, A, SPAN
      const textEditableTags = ['P', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'STRONG', 'EM', 'B', 'I'];

      // Add editable class and setup interactive elements
      const markEditableElements = () => {
        iframeDoc.querySelectorAll('*').forEach(el => {
          // Skip placeholder and its children
          if (el.classList.contains('przio-placeholder') || el.closest('.przio-placeholder')) {
            return;
          }
          
          if (blockTags.includes(el.tagName) && !el.classList.contains('przio-drop-indicator') && !el.classList.contains('przio-toolbar') && !el.classList.contains('przio-image-controls')) {
            el.classList.add('przio-editable');
            
            // Make only pure text elements contenteditable (p, headings, bold, italic)
            // These will show the blinking cursor for text editing
            if (textEditableTags.includes(el.tagName) && !el.querySelector('img') && !el.classList.contains('przio-image-placeholder')) {
              el.classList.add('przio-text-editable');
              (el as HTMLElement).contentEditable = 'true';
            }
          }
        });
        
        // Setup image placeholders and images with hover controls
        setupImageControls();
      };

      // Add hover controls to images and placeholders
      const setupImageControls = () => {
        // Handle image placeholders
        iframeDoc.querySelectorAll('.przio-image-placeholder').forEach(placeholder => {
          if (placeholder.querySelector('.przio-image-controls')) return; // Already has controls
          
          const controls = iframeDoc.createElement('div');
          controls.className = 'przio-image-controls';
          const selector = generateSelector(placeholder);
          controls.innerHTML = `
            <button class="url-btn" data-selector="${selector}">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
                <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
              </svg>
              Add URL
            </button>
            <button class="upload-btn" data-selector="${selector}">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="17 8 12 3 7 8"></polyline>
                <line x1="12" y1="3" x2="12" y2="15"></line>
              </svg>
              Upload
            </button>
          `;
          
          controls.querySelector('.url-btn')?.addEventListener('click', (e) => {
            e.stopPropagation();
            e.preventDefault();
            parentWindow.postMessage({ type: 'przio-image-add-url', selector }, '*');
          });
          
          controls.querySelector('.upload-btn')?.addEventListener('click', (e) => {
            e.stopPropagation();
            e.preventDefault();
            parentWindow.postMessage({ type: 'przio-image-upload', selector }, '*');
          });
          
          placeholder.appendChild(controls);
        });
        
        // Handle existing images
        iframeDoc.querySelectorAll('img:not(.przio-has-controls)').forEach(img => {
          img.classList.add('przio-has-controls');
          const selector = generateSelector(img);
          
          // Create a wrapper for positioning
          const wrapper = iframeDoc.createElement('div');
          wrapper.style.cssText = 'position:relative;display:inline-block;';
          wrapper.className = 'przio-image-wrapper';
          img.parentElement?.insertBefore(wrapper, img);
          wrapper.appendChild(img);
          
          const controls = iframeDoc.createElement('div');
          controls.className = 'przio-image-controls';
          controls.innerHTML = `
            <button class="url-btn" data-selector="${selector}">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
                <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
              </svg>
              Change URL
            </button>
            <button class="upload-btn" data-selector="${selector}">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="17 8 12 3 7 8"></polyline>
                <line x1="12" y1="3" x2="12" y2="15"></line>
              </svg>
              Replace
            </button>
          `;
          
          controls.querySelector('.url-btn')?.addEventListener('click', (e) => {
            e.stopPropagation();
            e.preventDefault();
            parentWindow.postMessage({ type: 'przio-image-add-url', selector }, '*');
          });
          
          controls.querySelector('.upload-btn')?.addEventListener('click', (e) => {
            e.stopPropagation();
            e.preventDefault();
            parentWindow.postMessage({ type: 'przio-image-upload', selector }, '*');
          });
          
          wrapper.appendChild(controls);
        });
      };

      markEditableElements();

      // Setup placeholder close buttons
      const setupPlaceholderCloseButtons = () => {
        iframeDoc.querySelectorAll('.przio-placeholder-close').forEach(closeBtn => {
          if ((closeBtn as any)._przioHandlerAttached) return;
          (closeBtn as any)._przioHandlerAttached = true;
          
          closeBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            e.preventDefault();
            const placeholder = closeBtn.closest('.przio-placeholder');
            if (placeholder) {
              const selector = generateSelector(placeholder);
              parentWindow.postMessage({ type: 'przio-element-action', action: 'delete', selector }, '*');
            }
          });
          
          // Add hover effect
          closeBtn.addEventListener('mouseenter', () => {
            (closeBtn as HTMLElement).style.transform = 'scale(1.1)';
            (closeBtn as HTMLElement).style.background = '#dc2626';
          });
          closeBtn.addEventListener('mouseleave', () => {
            (closeBtn as HTMLElement).style.transform = 'scale(1)';
            (closeBtn as HTMLElement).style.background = '#ef4444';
          });
        });
      };
      
      setupPlaceholderCloseButtons();

      // Remove toolbar
      const removeToolbar = () => {
        if (toolbar) {
          toolbar.remove();
          toolbar = null;
        }
      };
      
      // Handle text blur - save changes
      const handleTextBlur = (e: FocusEvent) => {
        const target = e.target as Element;
        if (target.classList.contains('przio-text-editable')) {
          const selector = generateSelector(target);
          const newText = (target as HTMLElement).innerHTML;
          parentWindow.postMessage({ type: 'przio-text-update', selector, text: newText }, '*');
        }
      };

      // Create and show toolbar for selected element
      const showToolbar = (element: Element) => {
        removeToolbar();
        
        toolbar = iframeDoc.createElement('div');
        toolbar.className = 'przio-toolbar';
        
        const tagName = element.tagName.toLowerCase();
        const selector = generateSelector(element);
        
        // Check if this is an anchor tag to show edit link button
        const isAnchor = tagName === 'a';
        const currentHref = isAnchor ? (element as HTMLAnchorElement).href : '';
        const currentStyle = (element as HTMLElement).style.cssText || '';
        
        toolbar.innerHTML = `
          <span class="tag-name">&lt;${tagName}&gt;</span>
          <button class="edit-style" title="Edit Styles">🎨</button>
          ${isAnchor ? '<button class="edit-link" title="Edit Link">🔗</button>' : ''}
          <button class="move-up" title="Move Up">↑</button>
          <button class="move-down" title="Move Down">↓</button>
          <button class="duplicate" title="Duplicate">⧉</button>
          <button class="delete" title="Delete">🗑</button>
        `;
        
        // Append to body first so we can measure it
        iframeDoc.body.appendChild(toolbar);
        
        // Position toolbar above the element
        const rect = element.getBoundingClientRect();
        const toolbarRect = toolbar.getBoundingClientRect();
        
        // Calculate position - try above first, if not enough space, show below
        let topPos = rect.top - toolbarRect.height - 8;
        if (topPos < 10) {
          topPos = rect.bottom + 8; // Show below if not enough space above
        }
        
        // Center horizontally on the element
        let leftPos = rect.left + (rect.width / 2) - (toolbarRect.width / 2);
        // Keep within viewport
        leftPos = Math.max(10, Math.min(leftPos, iframeDoc.documentElement.clientWidth - toolbarRect.width - 10));
        
        toolbar.style.position = 'fixed';
        toolbar.style.top = `${topPos}px`;
        toolbar.style.left = `${leftPos}px`;
        toolbar.style.transform = 'none'; // Remove the translateX since we're calculating position
        
        // Add event listeners
        toolbar.querySelector('.edit-style')?.addEventListener('click', (e) => {
          e.stopPropagation();
          e.preventDefault();
          // Get additional attributes for table elements
          const colspan = (element as HTMLTableCellElement).colSpan || '';
          const tableEl = element.closest('table') || (element.tagName === 'TABLE' ? element : null);
          const cellSpacing = tableEl?.getAttribute('cellspacing') || '';
          const cellPadding = tableEl?.getAttribute('cellpadding') || '';
          // Get width and height attributes for TABLE and TD elements
          const attrWidth = (element as HTMLElement).getAttribute('width') || '';
          const attrHeight = (element as HTMLElement).getAttribute('height') || '';
          parentWindow.postMessage({ type: 'przio-edit-style', selector, currentStyle, tagName, colspan, cellSpacing, cellPadding, attrWidth, attrHeight }, '*');
        });
        if (isAnchor) {
          toolbar.querySelector('.edit-link')?.addEventListener('click', (e) => {
            e.stopPropagation();
            e.preventDefault();
            parentWindow.postMessage({ type: 'przio-edit-link', selector, currentHref }, '*');
          });
        }
        toolbar.querySelector('.move-up')?.addEventListener('click', (e) => {
          e.stopPropagation();
          e.preventDefault();
          parentWindow.postMessage({ type: 'przio-element-action', action: 'move-up', selector }, '*');
        });
        toolbar.querySelector('.move-down')?.addEventListener('click', (e) => {
          e.stopPropagation();
          e.preventDefault();
          parentWindow.postMessage({ type: 'przio-element-action', action: 'move-down', selector }, '*');
        });
        toolbar.querySelector('.duplicate')?.addEventListener('click', (e) => {
          e.stopPropagation();
          e.preventDefault();
          parentWindow.postMessage({ type: 'przio-element-action', action: 'duplicate', selector }, '*');
        });
        toolbar.querySelector('.delete')?.addEventListener('click', (e) => {
          e.stopPropagation();
          e.preventDefault();
          parentWindow.postMessage({ type: 'przio-element-action', action: 'delete', selector }, '*');
        });
      };

      // Handle element selection
      const handleClick = (e: MouseEvent) => {
        const target = e.target as Element;
        
        // Ignore clicks on toolbar or image controls
        if (target.closest('.przio-toolbar') || target.closest('.przio-image-controls')) return;
        
        // Ignore clicks on placeholder and its children (except the close button)
        if (target.closest('.przio-placeholder') && !target.classList.contains('przio-placeholder-close')) {
          return;
        }
        
        // For text-editable elements, show toolbar but allow text editing
        const isTextEditable = target.classList.contains('przio-text-editable') || target.closest('.przio-text-editable');
        
        if (!isTextEditable) {
          e.preventDefault();
          e.stopPropagation();
        }
        
        // Clear previous selection
        iframeDoc.querySelectorAll('.przio-selected').forEach(el => el.classList.remove('przio-selected'));
        
        // Find nearest editable element
        let editableEl: Element | null = target;
        while (editableEl && !editableEl.classList.contains('przio-editable') && editableEl !== iframeDoc.body) {
          editableEl = editableEl.parentElement;
        }
        
        // Don't show toolbar for placeholder elements
        if (editableEl?.closest('.przio-placeholder') || editableEl?.classList.contains('przio-placeholder')) {
          currentlySelected = null;
          removeToolbar();
          parentWindow.postMessage({ type: 'przio-element-deselected' }, '*');
          return;
        }
        
        if (editableEl && editableEl !== iframeDoc.body) {
          editableEl.classList.add('przio-selected');
          currentlySelected = editableEl;
          showToolbar(editableEl);
          
          const selector = generateSelector(editableEl);
          parentWindow.postMessage({ 
            type: 'przio-element-selected', 
            selector, 
            tagName: editableEl.tagName.toLowerCase() 
          }, '*');
        } else {
          currentlySelected = null;
          removeToolbar();
          parentWindow.postMessage({ type: 'przio-element-deselected' }, '*');
        }
      };

      // Handle keyboard delete
      const handleKeyDown = (e: KeyboardEvent) => {
        // Check if user is editing text in a contenteditable element
        const activeElement = iframeDoc.activeElement;
        const isEditingText = activeElement && (
          (activeElement as HTMLElement).contentEditable === 'true' ||
          activeElement.classList.contains('przio-text-editable') ||
          activeElement.closest('.przio-text-editable') !== null
        );
        
        // Check if the currently selected element itself is contenteditable
        const selectedIsEditable = currentlySelected && (
          (currentlySelected as HTMLElement).contentEditable === 'true' ||
          currentlySelected.classList.contains('przio-text-editable')
        );
        
        // Check if there's a text selection inside a contenteditable element
        const selection = iframeDoc.getSelection();
        let selectionInEditable = false;
        if (selection && selection.rangeCount > 0) {
          const range = selection.getRangeAt(0);
          const container = range.commonAncestorContainer;
          // Check if the container or its parent is a contenteditable element
          const containerElement = container.nodeType === Node.TEXT_NODE 
            ? container.parentElement 
            : container as Element;
          selectionInEditable = containerElement?.closest('.przio-text-editable') !== null ||
                                containerElement?.classList.contains('przio-text-editable') ||
                                (containerElement as HTMLElement)?.contentEditable === 'true';
        }
        
        // Only delete element if not editing text
        if ((e.key === 'Delete' || e.key === 'Backspace') && currentlySelected && !isEditingText && !selectedIsEditable && !selectionInEditable) {
          e.preventDefault();
          const selector = generateSelector(currentlySelected);
          parentWindow.postMessage({ type: 'przio-element-action', action: 'delete', selector }, '*');
        } else if (e.key === 'Escape') {
          iframeDoc.querySelectorAll('.przio-selected').forEach(el => el.classList.remove('przio-selected'));
          currentlySelected = null;
          removeToolbar();
          parentWindow.postMessage({ type: 'przio-element-deselected' }, '*');
        }
      };

      const handleDragOver = (e: DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        
        // Find the main-email element - only allow dropping inside it
        const mainEmailEl = iframeDoc.querySelector('.main-email');
        if (!mainEmailEl) {
          dropIndicator.style.display = 'none';
          return;
        }
        
        const target = e.target as Element;
        if (!target || target === iframeDoc.body) {
          // If no target, allow dropping into main-email's content area
          const contentTd = mainEmailEl.querySelector('td');
          if (contentTd) {
            currentTarget = contentTd;
            insertPosition = 'inside';
            const rect = contentTd.getBoundingClientRect();
            dropIndicator.style.display = 'block';
            dropIndicator.style.left = `${rect.left}px`;
            dropIndicator.style.width = `${rect.width}px`;
            dropIndicator.style.top = `${rect.bottom - 2}px`;
            iframeDoc.querySelectorAll('.przio-drag-over').forEach(el => el.classList.remove('przio-drag-over'));
            contentTd.classList.add('przio-drag-over');
          } else {
            dropIndicator.style.display = 'none';
            currentTarget = mainEmailEl;
            insertPosition = 'inside';
          }
          return;
        }

        // Check if target is inside main-email
        if (!mainEmailEl.contains(target) && target !== mainEmailEl) {
          dropIndicator.style.display = 'none';
          iframeDoc.querySelectorAll('.przio-drag-over').forEach(el => el.classList.remove('przio-drag-over'));
          return;
        }

        // Check if target is inside a placeholder - if so, target the placeholder's parent
        const placeholderAncestor = target.closest('.przio-placeholder');
        if (placeholderAncestor && mainEmailEl.contains(placeholderAncestor)) {
          const placeholderParent = placeholderAncestor.parentElement;
          if (placeholderParent && placeholderParent !== iframeDoc.body && mainEmailEl.contains(placeholderParent)) {
            currentTarget = placeholderParent;
            insertPosition = 'inside';
            
            // Highlight the parent container
            const rect = placeholderParent.getBoundingClientRect();
            dropIndicator.style.display = 'block';
            dropIndicator.style.left = `${rect.left}px`;
            dropIndicator.style.width = `${rect.width}px`;
            dropIndicator.style.top = `${rect.bottom - 2}px`;
            
            iframeDoc.querySelectorAll('.przio-drag-over').forEach(el => el.classList.remove('przio-drag-over'));
            placeholderParent.classList.add('przio-drag-over');
            return;
          }
        }

        // Find the nearest block-level element that's inside main-email
        let dropTarget: Element | null = target;
        while (dropTarget && !blockTags.includes(dropTarget.tagName) && dropTarget !== iframeDoc.body && dropTarget !== mainEmailEl) {
          dropTarget = dropTarget.parentElement;
        }
        
        // Ensure dropTarget is inside main-email
        if (!dropTarget || dropTarget === iframeDoc.body || !mainEmailEl.contains(dropTarget) && dropTarget !== mainEmailEl) {
          // Fallback to main-email's content area
          const contentTd = mainEmailEl.querySelector('td');
          if (contentTd) {
            currentTarget = contentTd;
            insertPosition = 'inside';
            const rect = contentTd.getBoundingClientRect();
            dropIndicator.style.display = 'block';
            dropIndicator.style.left = `${rect.left}px`;
            dropIndicator.style.width = `${rect.width}px`;
            dropIndicator.style.top = `${rect.bottom - 2}px`;
            iframeDoc.querySelectorAll('.przio-drag-over').forEach(el => el.classList.remove('przio-drag-over'));
            contentTd.classList.add('przio-drag-over');
          } else {
            dropIndicator.style.display = 'none';
            currentTarget = mainEmailEl;
            insertPosition = 'inside';
          }
          return;
        }

        currentTarget = dropTarget;
        insertPosition = getDropPosition(e, dropTarget);

        // Position the indicator
        const rect = dropTarget.getBoundingClientRect();
        dropIndicator.style.display = 'block';
        dropIndicator.style.left = `${rect.left}px`;
        dropIndicator.style.width = `${rect.width}px`;
        
        if (insertPosition === 'before') {
          dropIndicator.style.top = `${rect.top - 2}px`;
        } else if (insertPosition === 'after') {
          dropIndicator.style.top = `${rect.bottom - 2}px`;
        } else {
          dropIndicator.style.top = `${rect.bottom - 2}px`;
        }

        iframeDoc.querySelectorAll('.przio-drag-over').forEach(el => el.classList.remove('przio-drag-over'));
        if (insertPosition === 'inside') {
          dropTarget.classList.add('przio-drag-over');
        }
      };

      const handleDragEnter = (e: DragEvent) => {
        e.preventDefault();
        iframeDoc.body.classList.add('przio-dragging');
      };

      const handleDragLeave = (e: DragEvent) => {
        const relatedTarget = e.relatedTarget as Element;
        if (!relatedTarget || !iframeDoc.body.contains(relatedTarget)) {
          dropIndicator.style.display = 'none';
          iframeDoc.querySelectorAll('.przio-drag-over').forEach(el => el.classList.remove('przio-drag-over'));
          iframeDoc.body.classList.remove('przio-dragging');
        }
      };

      const handleDrop = (e: DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        
        dropIndicator.style.display = 'none';
        iframeDoc.querySelectorAll('.przio-drag-over').forEach(el => el.classList.remove('przio-drag-over'));
        iframeDoc.body.classList.remove('przio-dragging');

        const snippetData = e.dataTransfer?.getData('text/plain');
        if (!snippetData) return;

        // Ensure we only drop inside main-email
        const mainEmailEl = iframeDoc.querySelector('.main-email');
        if (!mainEmailEl) return;

        // If currentTarget is set and is inside main-email, use it
        if (currentTarget && currentTarget !== iframeDoc.body && (mainEmailEl.contains(currentTarget) || currentTarget === mainEmailEl)) {
          const selector = generateSelector(currentTarget);
          setDropTargetElement(selector);
          
          parentWindow.postMessage({ 
            type: 'przio-iframe-drop', 
            snippet: snippetData, 
            selector, 
            position: insertPosition 
          }, '*');
        } else {
          // Fallback: drop into main-email's content area
          const contentTd = mainEmailEl.querySelector('td');
          if (contentTd) {
            const selector = generateSelector(contentTd);
            setDropTargetElement(selector);
            parentWindow.postMessage({ 
              type: 'przio-iframe-drop', 
              snippet: snippetData, 
              selector, 
              position: 'inside' 
            }, '*');
          } else {
            parentWindow.postMessage({ 
              type: 'przio-iframe-drop', 
              snippet: snippetData, 
              selector: null, 
              position: 'inside' 
            }, '*');
          }
        }
      };

      // Attach event listeners
      iframeDoc.body.addEventListener('dragover', handleDragOver);
      iframeDoc.body.addEventListener('dragenter', handleDragEnter);
      iframeDoc.body.addEventListener('dragleave', handleDragLeave);
      iframeDoc.body.addEventListener('drop', handleDrop);
      iframeDoc.body.addEventListener('click', handleClick);
      iframeDoc.addEventListener('keydown', handleKeyDown);
      iframeDoc.body.addEventListener('focusout', handleTextBlur);

      // Cleanup function
      return () => {
        iframeDoc.body.removeEventListener('dragover', handleDragOver);
        iframeDoc.body.removeEventListener('dragenter', handleDragEnter);
        iframeDoc.body.removeEventListener('dragleave', handleDragLeave);
        iframeDoc.body.removeEventListener('drop', handleDrop);
        iframeDoc.body.removeEventListener('click', handleClick);
        iframeDoc.removeEventListener('keydown', handleKeyDown);
        iframeDoc.body.removeEventListener('focusout', handleTextBlur);
      };
    };

    // Setup when iframe loads
    if (iframe.contentDocument?.readyState === 'complete') {
      setupDragHandlers();
    }
    iframe.addEventListener('load', setupDragHandlers);
    
    return () => {
      iframe.removeEventListener('load', setupDragHandlers);
    };
  }, []);

  // Listen for messages from iframe (drop, select, actions)
  useEffect(() => {
    const handleMessage = (e: MessageEvent) => {
      if (e.data?.type === 'przio-iframe-drop') {
        const { snippet, selector, position } = e.data;
        if (snippet === '__IMAGE__') {
          const url = window.prompt('Paste an image URL or leave blank to upload a file');
          if (url && url.trim()) {
            const absoluteUrl = ensureAbsoluteImageUrl(url.trim());
            injectSnippet(`<img src="${absoluteUrl}" alt="Image" style="max-width:100%;display:block;" />`, selector, position);
            return;
          }
          fileInputRef.current?.click();
          return;
        }
        // Handle image placeholder
        if (snippet === '__IMAGE_PLACEHOLDER__') {
          injectSnippet(IMAGE_PLACEHOLDER, selector, position);
          return;
        }
        injectSnippet(snippet, selector, position);
      } else if (e.data?.type === 'przio-element-selected') {
        setSelectedElement({ selector: e.data.selector, tagName: e.data.tagName });
        
        // Highlight in editor - find element position in HTML
        if (htmlEditorRef.current && e.data.tagName) {
          try {
            const parser = new DOMParser();
            const doc = parser.parseFromString(html || '', 'text/html');
            const targetEl = doc.querySelector(e.data.selector);
            
            if (targetEl) {
              // Get the outer HTML of the element
              const outerHtml = targetEl.outerHTML;
              // Find a unique identifier - first 50 chars of the element
              const searchStr = outerHtml.substring(0, Math.min(80, outerHtml.length));
              
              // Find line number in the HTML source
              const lines = html.split('\n');
              let foundLine = -1;
              let foundCol = -1;
              let endLine = -1;
              let endCol = -1;
              
              for (let i = 0; i < lines.length; i++) {
                const idx = lines[i].indexOf(searchStr.substring(0, 30));
                if (idx !== -1) {
                  foundLine = i + 1; // Monaco uses 1-based line numbers
                  foundCol = idx + 1;
                  
                  // Find the end of the opening tag
                  const tagMatch = lines[i].substring(idx).match(/<[^>]+>/);
                  if (tagMatch) {
                    endLine = i + 1;
                    endCol = idx + tagMatch[0].length + 1;
                  }
                  break;
                }
              }
              
              if (foundLine > 0) {
                htmlEditorRef.current.highlightRange(foundLine, foundCol, endLine || foundLine, endCol || foundCol + 20);
              }
            }
          } catch (err) {
            console.error('Failed to highlight in editor:', err);
          }
        }
      } else if (e.data?.type === 'przio-element-deselected') {
        setSelectedElement(null);
        // Clear highlights in editor
        if (htmlEditorRef.current) {
          htmlEditorRef.current.clearHighlights();
        }
      } else if (e.data?.type === 'przio-element-action') {
        const { action, selector } = e.data;
        if (action === 'delete') {
          removeElement(selector);
        } else if (action === 'move-up') {
          moveElement(selector, 'up');
        } else if (action === 'move-down') {
          moveElement(selector, 'down');
        } else if (action === 'duplicate') {
          duplicateElement(selector);
        }
      } else if (e.data?.type === 'przio-image-add-url') {
        // Open modal to add image URL
        setTargetImageSelector(e.data.selector);
        setImageUrlInput('');
        setShowImageUrlModal(true);
      } else if (e.data?.type === 'przio-image-upload') {
        // Trigger file input for this specific image
        setTargetImageSelector(e.data.selector);
        fileInputRef.current?.click();
      } else if (e.data?.type === 'przio-text-update') {
        // Update text content
        updateTextContent(e.data.selector, e.data.text);
      } else if (e.data?.type === 'przio-edit-link') {
        // Open modal to edit link URL
        setTargetLinkSelector(e.data.selector);
        setLinkUrlInput(e.data.currentHref || '');
        setShowLinkEditModal(true);
      } else if (e.data?.type === 'przio-edit-style') {
        // Open modal to edit CSS styles
        setTargetCssSelector(e.data.selector);
        setTargetCssTagName(e.data.tagName || '');
        setShowAdvancedCss(false);
        
        // Parse current style into fields
        const styleStr = e.data.currentStyle || '';
        
        // Helper to parse individual CSS property
        const parseCssValue = (property: string): string => {
          const regex = new RegExp(`${property}\\s*:\\s*([^;]+)`, 'i');
          const match = styleStr.match(regex);
          return match ? match[1].trim() : '';
        };
        
        // Parse shorthand padding (padding: top right bottom left OR padding: vertical horizontal)
        const parseShorthandPadding = () => {
          const paddingShorthand = parseCssValue('padding');
          if (!paddingShorthand) return { top: '', right: '', bottom: '', left: '' };
          
          const values = paddingShorthand.split(/\s+/);
          if (values.length === 1) {
            return { top: values[0], right: values[0], bottom: values[0], left: values[0] };
          } else if (values.length === 2) {
            return { top: values[0], right: values[1], bottom: values[0], left: values[1] };
          } else if (values.length === 3) {
            return { top: values[0], right: values[1], bottom: values[2], left: values[1] };
          } else if (values.length >= 4) {
            return { top: values[0], right: values[1], bottom: values[2], left: values[3] };
          }
          return { top: '', right: '', bottom: '', left: '' };
        };
        
        // Parse shorthand margin
        const parseShorthandMargin = () => {
          const marginShorthand = parseCssValue('margin');
          if (!marginShorthand) return { top: '', right: '', bottom: '', left: '' };
          
          const values = marginShorthand.split(/\s+/);
          if (values.length === 1) {
            return { top: values[0], right: values[0], bottom: values[0], left: values[0] };
          } else if (values.length === 2) {
            return { top: values[0], right: values[1], bottom: values[0], left: values[1] };
          } else if (values.length === 3) {
            return { top: values[0], right: values[1], bottom: values[2], left: values[1] };
          } else if (values.length >= 4) {
            return { top: values[0], right: values[1], bottom: values[2], left: values[3] };
          }
          return { top: '', right: '', bottom: '', left: '' };
        };
        
        const shorthandPadding = parseShorthandPadding();
        const shorthandMargin = parseShorthandMargin();
        
        setCssFields({
          paddingTop: parseCssValue('padding-top') || shorthandPadding.top,
          paddingRight: parseCssValue('padding-right') || shorthandPadding.right,
          paddingBottom: parseCssValue('padding-bottom') || shorthandPadding.bottom,
          paddingLeft: parseCssValue('padding-left') || shorthandPadding.left,
          marginTop: parseCssValue('margin-top') || shorthandMargin.top,
          marginRight: parseCssValue('margin-right') || shorthandMargin.right,
          marginBottom: parseCssValue('margin-bottom') || shorthandMargin.bottom,
          marginLeft: parseCssValue('margin-left') || shorthandMargin.left,
          fontSize: parseCssValue('font-size'),
          width: parseCssValue('width'),
          height: parseCssValue('height'),
          backgroundColor: parseCssValue('background-color') || parseCssValue('background'),
          color: parseCssValue('color'),
          borderSpacing: parseCssValue('border-spacing'),
          cellSpacing: e.data.cellSpacing || '',
          cellPadding: e.data.cellPadding || '',
          border: parseCssValue('border'),
          borderWidth: parseCssValue('border-width'),
          borderColor: parseCssValue('border-color'),
          borderStyle: parseCssValue('border-style'),
          borderCollapse: parseCssValue('border-collapse'),
          colspan: e.data.colspan || '',
          attrWidth: e.data.attrWidth || '',
          attrHeight: e.data.attrHeight || '',
        });
        
        // Format the CSS for advanced editor
        const formattedCss = styleStr
          .split(';')
          .map((rule: string) => rule.trim())
          .filter((rule: string) => rule)
          .join(';\n') + (styleStr ? ';' : '');
        setCssEditInput(formattedCss);
        setShowCssEditModal(true);
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [injectSnippet, removeElement, moveElement, duplicateElement, updateTextContent, updateLinkHref, updateElementStyle, IMAGE_PLACEHOLDER, html]);

  // Setup iframe drag-drop when html changes
  useEffect(() => {
    const cleanup1 = setupIframeDragDrop(splitIframeRef.current);
    const cleanup2 = setupIframeDragDrop(previewIframeRef.current);
    return () => {
      cleanup1?.();
      cleanup2?.();
    };
  }, [html, setupIframeDragDrop]);

  const handleDropOnCanvas = useCallback((snippet?: string) => {
    const value = snippet || draggingSnippet;
    setIsOverCanvas(false);
    if (!value) return;

    if (value === '__IMAGE__') {
      const url = window.prompt('Paste an image URL or leave blank to upload a file');
      if (url && url.trim()) {
        const absoluteUrl = ensureAbsoluteImageUrl(url.trim());
        injectSnippet(`<img src="${absoluteUrl}" alt="Image" style="max-width:100%;display:block;" />`);
        return;
      }
      fileInputRef.current?.click();
      return;
    }

    // Handle image placeholder - insert placeholder directly
    if (value === '__IMAGE_PLACEHOLDER__') {
      injectSnippet(IMAGE_PLACEHOLDER);
      return;
    }

    injectSnippet(value);
  }, [draggingSnippet, injectSnippet, IMAGE_PLACEHOLDER]);

  const handleFileSelect = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingImage(true);
      const form = new FormData();
      form.append('file', file);
      form.append('shareToken', projectId || 'tool');
      const res = await fetch('/api/uploads/images', {
        method: 'POST',
        body: form,
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error || 'Upload failed');
      }
      
      // If we have a target image selector, update that image/placeholder
      if (targetImageSelector) {
        const absoluteUrl = ensureAbsoluteImageUrl(data.url);
        updateImageSrc(targetImageSelector, absoluteUrl);
        setTargetImageSelector(null);
      } else {
        const absoluteUrl = ensureAbsoluteImageUrl(data.url);
        injectSnippet(`<img src="${absoluteUrl}" alt="Uploaded image" style="max-width:100%;display:block;" />`);
      }
    } catch (error: any) {
      window.alert(error?.message || 'Image upload failed');
    } finally {
      setUploadingImage(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  }, [injectSnippet, projectId, targetImageSelector, updateImageSrc]);

  const fetchSmtpConfigs = useCallback(async () => {
    try {
      // Fetch user's SMTP configs
      const userSmtpResponse = await axios.get('/api/user/smtp', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const userSmtpConfigs = userSmtpResponse.data.smtpConfigs || [];

      // Fetch admin SMTP configs (public, default active one)
      const adminSmtpResponse = await axios.get('/api/admin/smtp/public');
      const adminSmtpConfigs = (adminSmtpResponse.data.smtpConfigs || []).map((smtp: any) => {
        const adminSmtp = {
          ...smtp,
          _id: `admin_${smtp._id}`, // Prefix to distinguish from user SMTP
          isAdminSmtp: true,
          // Explicitly preserve isDefault and isActive
          isDefault: smtp.isDefault === true,
          isActive: smtp.isActive === true,
        };
        console.log('Admin SMTP mapped:', {
          originalId: smtp._id,
          mappedId: adminSmtp._id,
          isDefault: adminSmtp.isDefault,
          isActive: adminSmtp.isActive,
          title: adminSmtp.title,
        });
        return adminSmtp;
      });

      // Combine: user SMTP first, then admin SMTP
      const allConfigs = [...userSmtpConfigs, ...adminSmtpConfigs];
      setSmtpConfigs(allConfigs);

      // Debug logging
      console.log('SMTP Configs Debug:', {
        userSmtpCount: userSmtpConfigs.length,
        adminSmtpCount: adminSmtpConfigs.length,
        adminSmtpConfigs: adminSmtpConfigs,
        allConfigsCount: allConfigs.length,
      });

      // Set default to active user SMTP, or default admin SMTP, or first one
      const activeUser = userSmtpConfigs.find((s: any) => s.isActive);
      const defaultAdmin = adminSmtpConfigs.find((s: any) => s.isDefault === true);
      
      console.log('SMTP Selection Debug:', {
        activeUser: activeUser ? activeUser._id : null,
        defaultAdmin: defaultAdmin ? defaultAdmin._id : null,
        defaultAdminDetails: defaultAdmin,
      });
      
      if (activeUser) {
        setSelectedSmtp(activeUser._id);
      } else if (defaultAdmin) {
        setSelectedSmtp(defaultAdmin._id);
      } else if (allConfigs.length > 0) {
        setSelectedSmtp(allConfigs[0]._id);
      }
    } catch (error) {
      console.error('Error fetching SMTP configs:', error);
    }
  }, [token]);

  const fetchRecipients = useCallback(async () => {
    try {
      // If projectId is available, fetch project-specific recipients (includes Team Members folder)
      // Otherwise, fetch personal recipients
      const url = projectId 
        ? `/api/user/recipients?projectId=${projectId}`
        : '/api/user/recipients';
      
      const response = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const recipientsData = response.data.recipients || [];
      setRecipients(recipientsData);
      
      // Extract unique folders
      const uniqueFolders = Array.from(
        new Set(recipientsData.map((r: any) => (r.folder || '').trim()).filter((f: string) => f))
      ) as string[];
      
      // Ensure Team Members folder appears first if it exists
      const sortedFolders = uniqueFolders.sort((a, b) => {
        if (a === 'Team Members') return -1;
        if (b === 'Team Members') return 1;
        return a.localeCompare(b);
      });
      
      setRecipientFolders(sortedFolders);
      
      console.log('Recipients fetched:', recipientsData.length, 'Folders:', sortedFolders);
    } catch (error) {
      console.error('Error fetching recipients:', error);
    }
  }, [token, projectId]);

  const fetchTemplates = useCallback(async () => {
    if (!projectId) return;
    
    try {
      const response = await axios.get(`${API_URL}/templates?projectId=${projectId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTemplates(response.data.templates);
      
      // Fetch folders after templates are loaded
      const foldersResponse = await axios.get(`${API_URL}/folders?type=template&projectId=${projectId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const dbFolders = foldersResponse.data.folders || [];
      const dbFolderMap = new Map<string, { _id: string; name: string }>(
        dbFolders.map((f: any) => [f.name, { _id: f._id, name: f.name }])
      );
      
      // Extract unique folders from templates
      const foldersFromTemplates = Array.from(new Set(
        response.data.templates
          .map((t: Template) => t.folder)
          .filter((f: string | undefined) => f && f.trim())
      )) as string[];
      
      // Merge DB folders with folders from templates
      const allFolderNames = Array.from(new Set([...dbFolders.map((f: any) => f.name), ...foldersFromTemplates]));
      const allFolders: Array<{ _id?: string; name: string }> = allFolderNames.map((name: string) => {
        // If folder exists in DB, use DB folder object, otherwise create a name-only object
        const dbFolder = dbFolderMap.get(name);
        if (dbFolder) {
          return { _id: dbFolder._id, name: dbFolder.name };
        }
        return { name };
      }).sort((a, b) => a.name.localeCompare(b.name));
      setFolders(allFolders);
      
      // Auto-expand folders that have templates
      const foldersWithTemplates = foldersFromTemplates.filter(folder => 
        response.data.templates.some((t: Template) => t.folder === folder)
      );
      setExpandedFolders(new Set(foldersWithTemplates));
    } catch (error) {
      console.error('Failed to fetch templates:', error);
    } finally {
      setLoading(false);
    }
  }, [token, projectId]);

  // Check project access
  useEffect(() => {
    const checkProject = async () => {
      if (!user || !token) {
        setCheckingProject(false);
        return;
      }

      // Get projectId from query params or localStorage
      const urlParams = new URLSearchParams(window.location.search);
      const queryProjectId = urlParams.get('projectId');
      const storedProjectId = localStorage.getItem('selectedProjectId');
      const currentProjectId = queryProjectId || storedProjectId;

      if (!currentProjectId) {
        router.push('/projects');
        return;
      }

      try {
        // Verify user has access to this project
        const response = await axios.get(`${API_URL}/projects/${currentProjectId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        
        setProjectId(currentProjectId);
        setProjectInfo({
          name: response.data.project.name,
          role: response.data.project.role,
        });
        localStorage.setItem('selectedProjectId', currentProjectId);
      } catch (error: any) {
        console.error('Project access error:', error);
        localStorage.removeItem('selectedProjectId');
        router.push('/projects');
      } finally {
        setCheckingProject(false);
      }
    };

    checkProject();
  }, [user, token, router]);

  useEffect(() => {
    if (user && token && projectId && !checkingProject) {
      fetchTemplates();
      fetchSmtpConfigs();
      fetchRecipients();
    }
  }, [user, token, projectId, checkingProject, fetchTemplates, fetchSmtpConfigs, fetchRecipients]);

  // Set default template when modal opens
  useEffect(() => {
    if (showSendEmailModal) {
      // If a template is currently selected, use it
      if (selectedTemplate && templates.find(t => t._id === selectedTemplate)) {
        // Already set
      } else if (templates.length > 0) {
        // Try to find template matching current HTML
        const matchingTemplate = templates.find(t => t.html.trim() === html.trim());
        if (matchingTemplate) {
          setSelectedTemplate(matchingTemplate._id);
        } else {
          // Default to first template
          setSelectedTemplate(templates[0]._id);
        }
      }
    }
  }, [showSendEmailModal, templates, selectedTemplate, html]);

  // Ref to store the save function for auto-save
  const autoSaveNewTemplateRef = useRef<() => void>(() => {});

  // Auto-save new template immediately on creation
  useEffect(() => {
    // Only auto-save if:
    // 1. It's a new unsaved template
    // 2. Template name is set
    // 3. Not currently saving
    if (
      isNewUnsavedTemplate &&
      templateName.trim() &&
      html.trim() &&
      !isSavingRef.current &&
      token &&
      projectId
    ) {
      // Small delay to ensure state is stable
      const timeoutId = setTimeout(() => {
        autoSaveNewTemplateRef.current();
      }, 500);
      
      return () => clearTimeout(timeoutId);
    }
  }, [isNewUnsavedTemplate, templateName, html, token, projectId]);

  const handleSaveTemplate = async () => {
    // Prevent duplicate saves
    if (isSavingRef.current) {
      return;
    }

    // Show alert if fields are empty
    if (!templateName.trim() || !html.trim()) {
      setAlert({
        isOpen: true,
        message: 'Please provide a template name and HTML content',
        type: 'error',
      });
      return;
    }

    isSavingRef.current = true;
    setSaving(true);

    try {
      if (selectedTemplate) {
        // Update existing template
        await axios.put(
          `${API_URL}/templates/${selectedTemplate}`,
          { name: templateName, html, folder: selectedFolder || undefined, projectId: projectId || undefined },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } else {
        // Create new template
        const response = await axios.post(
          `${API_URL}/templates`,
          { 
            name: templateName, 
            html, 
            folder: selectedFolder || undefined,
            isDefault: false,
            projectId: projectId || undefined
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        // Update selectedTemplate after creating
        if (response.data.template) {
          setSelectedTemplate(response.data.template._id);
        }
      }
      await fetchTemplates();
      setLastSaved(new Date());
      setOriginalHtml(html);
      setOriginalTemplateName(templateName);
      setIsNewUnsavedTemplate(false); // Reset flag after saving
      
      // Show success message
      setAlert({
        isOpen: true,
        message: 'Template saved successfully!',
        type: 'success',
      });
    } catch (error: any) {
      setAlert({
        isOpen: true,
        message: error.response?.data?.error || 'Failed to save template',
        type: 'error',
      });
    } finally {
      isSavingRef.current = false;
      setSaving(false);
    }
  };

  // Update the ref to point to handleSaveTemplate
  autoSaveNewTemplateRef.current = handleSaveTemplate;

  const handleLoadTemplate = (template: Template) => {
    setHtml(template.html);
    setTemplateName(template.name);
    setSelectedTemplate(template._id);
    setOriginalHtml(template.html);
    setOriginalTemplateName(template.name);
    setIsNewUnsavedTemplate(false); // Reset flag when loading existing template
    setSelectedFolder(template.folder || '');
    setLastSaved(null);
    // Switch to split view to enable visual editor
    if (activeTab === 'editor') {
      setActiveTab('split');
    }
  };


  const handleSelectSuggestion = (recipient: any) => {
    if (!selectedRecipients.includes(recipient._id)) {
      setSelectedRecipients([...selectedRecipients, recipient._id]);
    }
    // Expand the folder if recipient is in a folder
    if (recipient.folder && !expandedRecipientFolders.has(recipient.folder)) {
      setExpandedRecipientFolders(new Set([...Array.from(expandedRecipientFolders), recipient.folder]));
    }
    setRecipientSearch('');
    setShowSearchSuggestions(false);
    setHighlightedSuggestionIndex(-1);
  };

  const handleSelectTemplateSuggestion = (template: any) => {
    setSelectedTemplate(template._id);
    setHtml(template.html);
    setTemplateName(template.name);
    setTemplateSearch('');
    setShowTemplateDropdown(false);
    setShowTemplateSuggestions(false);
    setHighlightedTemplateIndex(-1);
  };

  const handleSendEmails = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedTemplate || !selectedSmtp || (selectedRecipients.length === 0 && selectedFolders.length === 0)) {
      return;
    }

    // Get all recipient emails
    let recipientEmails: string[] = [];
    
    // Add individual recipients
    selectedRecipients.forEach(id => {
      const recipient = recipients.find(r => r._id === id);
      if (recipient) {
        recipientEmails.push(recipient.email);
      }
    });

    // Add recipients from selected folders
    selectedFolders.forEach(folder => {
      const folderRecipients = recipients.filter(r => r.folder === folder);
      folderRecipients.forEach(r => {
        if (!recipientEmails.includes(r.email)) {
          recipientEmails.push(r.email);
        }
      });
    });

    if (recipientEmails.length === 0) {
      setAlert({
        isOpen: true,
        message: 'Please select at least one recipient',
        type: 'error',
      });
      return;
    }

    const template = templates.find(t => t._id === selectedTemplate);
    if (!template) {
      setAlert({
        isOpen: true,
        message: 'Template not found',
        type: 'error',
      });
      return;
    }

    setSendingEmails(true);
    setShowSendEmailModal(false);
    setShowProgressModal(true);
    setEmailProgress({ sent: 0, pending: recipientEmails.length, failed: 0, total: recipientEmails.length });

    try {
      // Use the template's HTML, not the current editor HTML
      const response = await axios.post(
        '/api/emails/send-bulk',
        {
          templateId: selectedTemplate,
          html: template.html,
          subject: emailSubject,
          smtpId: selectedSmtp,
          recipients: recipientEmails,
          projectId: projectId || undefined,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      // Update progress from response
      if (response.data.progress) {
        setEmailProgress(response.data.progress);
      } else {
        setEmailProgress({
          sent: response.data.sent || recipientEmails.length,
          pending: 0,
          failed: response.data.failed || 0,
          total: recipientEmails.length,
        });
      }
    } catch (error: any) {
      console.error('Error sending emails:', error);
      setEmailProgress(prev => ({
        ...prev,
        failed: prev.total - prev.sent,
        pending: 0,
      }));
    } finally {
      setSendingEmails(false);
      setSelectedRecipients([]);
      setSelectedFolders([]);
    }
  };


  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) return;

    const folderName = newFolderName.trim();
    
    try {
      // Save folder to database
      const response = await axios.post(
        `${API_URL}/folders`,
        { name: folderName, type: 'template', projectId: projectId || undefined },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Update local state
      const folderExists = folders.some(f => f.name === folderName);
      if (!folderExists) {
        setFolders([...folders, { _id: response.data.folder._id, name: folderName }].sort((a, b) => a.name.localeCompare(b.name)));
      }
      setSelectedFolder(folderName);
      setNewFolderName('');
      setShowNewFolderInput(false);
    } catch (error: any) {
      console.error('Failed to create folder:', error);
      const errorMessage = error.response?.data?.error || 'Failed to create folder';
      setAlert({
        isOpen: true,
        message: errorMessage,
        type: 'error',
      });
      
      // Still add to local state if it's a duplicate error (folder might already exist in DB)
      if (error.response?.status === 400 && errorMessage.includes('already exists')) {
        const folderExists = folders.some(f => f.name === folderName);
        if (!folderExists) {
          // Try to fetch the folder from DB to get its ID
          try {
            const foldersResponse = await axios.get(`${API_URL}/folders?type=template${projectId ? `&projectId=${projectId}` : ''}`, {
              headers: { Authorization: `Bearer ${token}` },
            });
            const dbFolder = foldersResponse.data.folders?.find((f: any) => f.name === folderName);
            if (dbFolder) {
              setFolders([...folders, { _id: dbFolder._id, name: folderName }].sort((a, b) => a.name.localeCompare(b.name)));
            } else {
              setFolders([...folders, { name: folderName }].sort((a, b) => a.name.localeCompare(b.name)));
            }
          } catch {
            setFolders([...folders, { name: folderName }].sort((a, b) => a.name.localeCompare(b.name)));
          }
        }
        setSelectedFolder(folderName);
        setNewFolderName('');
        setShowNewFolderInput(false);
      }
    }
  };

  const handleCreateNewPage = () => {
    if (newPageName.trim()) {
      setTemplateName(newPageName.trim());
      setHtml(defaultHtmlTemplate);
      setSelectedTemplate(null);
      setOriginalHtml(defaultHtmlTemplate);
      setOriginalTemplateName('');
      setNewPageName('');
      setShowNewPageInput(false);
      setIsNewUnsavedTemplate(true); // Mark as new template needing initial save
      // Switch to split view to enable visual editor
      if (activeTab === 'editor') {
        setActiveTab('split');
      }
    }
  };

  const toggleFolder = (folder: string) => {
    setExpandedFolders(prev => {
      const newSet = new Set(prev);
      if (newSet.has(folder)) {
        newSet.delete(folder);
      } else {
        newSet.add(folder);
      }
      return newSet;
    });
  };

  const handleDragStart = (e: React.DragEvent, templateId: string) => {
    setDraggedTemplate(templateId);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', templateId);
  };

  const handleDragOver = (e: React.DragEvent, folder: string | null) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverFolder(folder);
  };

  const handleDragLeave = () => {
    setDragOverFolder(null);
  };

  const handleDrop = async (e: React.DragEvent, targetFolder: string | null) => {
    e.preventDefault();
    setDragOverFolder(null);
    
    if (!draggedTemplate) return;

    const template = templates.find(t => t._id === draggedTemplate);
    if (!template) return;

    // Don't do anything if dropped on the same folder
    if (template.folder === targetFolder) {
      setDraggedTemplate(null);
      return;
    }

    try {
      await axios.put(
        `${API_URL}/templates/${draggedTemplate}`,
        { 
          name: template.name, 
          html: template.html,
          folder: targetFolder || undefined,
          projectId: projectId || undefined
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      await fetchTemplates();
      
      // If the template was moved to a folder, expand that folder
      if (targetFolder) {
        setExpandedFolders(prev => new Set(prev).add(targetFolder));
      }
    } catch (error: any) {
      setAlert({
        isOpen: true,
        message: error.response?.data?.error || 'Failed to move template',
        type: 'error',
      });
    } finally {
      setDraggedTemplate(null);
    }
  };

  const handleDeleteFolder = (folderId: string, folderName: string) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Delete Folder',
      message: `Are you sure you want to delete the folder "${folderName}"? This will only delete the folder if it's empty.`,
      type: 'danger',
      onConfirm: async () => {
        setConfirmDialog({ ...confirmDialog, isOpen: false });
        try {
          await axios.delete(`${API_URL}/folders/${folderId}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          
          // Remove folder from state
          setFolders(folders.filter(f => f._id !== folderId));
          
          // Clear selected folder if it was the deleted one
          if (selectedFolder === folderName) {
            setSelectedFolder('');
          }
          
          // Remove from expanded folders
          setExpandedFolders(prev => {
            const newSet = new Set(prev);
            newSet.delete(folderName);
            return newSet;
          });
          
          // Refresh templates to update folder list
          await fetchTemplates();
        } catch (error: any) {
          const errorMessage = error.response?.data?.error || 'Failed to delete folder';
          setAlert({
            isOpen: true,
            message: errorMessage,
            type: 'error',
          });
        }
      },
    });
  };

  // Group templates by folder
  const groupedTemplates = templates.reduce((acc, template) => {
    const folder = template.folder || '';
    if (!acc[folder]) {
      acc[folder] = [];
    }
    acc[folder].push(template);
    return acc;
  }, {} as Record<string, Template[]>);

  // Separate folders and templates without folders
  const templatesWithoutFolder = groupedTemplates[''] || [];
  const folderOrder = folders.map(f => f.name);

  const handleShare = async () => {
    if (!html || !html.trim()) {
      setAlert({
        isOpen: true,
        message: 'Please add some content to share',
        type: 'error',
      });
      return;
    }

    setCreatingShareLink(true);
    try {
      const response = await axios.post(
        `${API_URL}/share/create`,
        {
          html: html,
          templateId: selectedTemplate || undefined,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setShareUrl(response.data.shareUrl);
      setShowShareModal(true);
    } catch (error: any) {
      console.error('Share error:', error);
      const errorMessage = error.response?.data?.error || error.response?.data?.details || 'Failed to create share link';
      setAlert({
        isOpen: true,
        message: errorMessage,
        type: 'error',
      });
    } finally {
      setCreatingShareLink(false);
    }
  };

  const handleCopyShareLink = () => {
    if (shareUrl) {
      navigator.clipboard.writeText(shareUrl);
      setAlert({
        isOpen: true,
        message: 'Share link copied to clipboard!',
        type: 'success',
      });
    }
  };

  const handleCopyTemplateId = () => {
    if (selectedTemplate) {
      navigator.clipboard.writeText(selectedTemplate);
      setAlert({
        isOpen: true,
        message: 'Template ID copied to clipboard!',
        type: 'success',
      });
    }
  };

  const handleDeleteTemplate = (id: string) => {
    const template = templates.find(t => t._id === id);
    const templateName = template?.name || 'this template';
    
    setConfirmDialog({
      isOpen: true,
      title: 'Delete Template',
      message: `Are you sure you want to delete "${templateName}"? This action cannot be undone.`,
      type: 'danger',
      onConfirm: async () => {
        setConfirmDialog({ ...confirmDialog, isOpen: false });
        try {
          await axios.delete(`${API_URL}/templates/${id}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          await fetchTemplates();
          if (selectedTemplate === id) {
            setHtml('');
            setTemplateName('');
            setSelectedTemplate(null);
          }
          setAlert({
            isOpen: true,
            message: 'Template deleted successfully',
            type: 'success',
          });
        } catch (error: any) {
          setAlert({
            isOpen: true,
            message: error.response?.data?.error || 'Failed to delete template',
            type: 'error',
          });
        }
      },
    });
  };

  const handleNewTemplate = () => {
    setHtml(defaultHtmlTemplate);
    setTemplateName('');
    setSelectedTemplate(null);
    setOriginalHtml(defaultHtmlTemplate);
    setOriginalTemplateName('');
    setLastSaved(null);
    setIsNewUnsavedTemplate(false); // Reset flag
  };

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

  if (authLoading || loading || checkingProject) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user || !projectId || !projectInfo) {
    return null;
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50 overflow-hidden">
      {/* Header */}
      {!isFullscreen && projectInfo && (
        <AuthHeader showProjectInfo={projectInfo} projectId={projectId || undefined} />
      )}

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar - Templates */}
        {!isFullscreen && (
          <div className="w-64 bg-white border-r border-gray-200 flex-shrink-0 overflow-y-auto">
            <div className="p-4">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-gray-900">My Templates</h2>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setShowNewFolderInput(!showNewFolderInput)}
                    className="p-2 text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                    title="New Folder"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => setShowNewPageInput(!showNewPageInput)}
                    className="p-2 text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                    title="New HTML Page"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  </button>
                </div>
              </div>
              
              {/* New Folder Input */}
              {showNewFolderInput && (
                <div className="mb-3 p-2 bg-gray-50 rounded-lg">
                  <input
                    type="text"
                    value={newFolderName}
                    onChange={(e) => setNewFolderName(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleCreateFolder()}
                    placeholder="Folder name..."
                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none mb-2"
                    autoFocus
                  />
                  <div className="flex space-x-2">
                    <button
                      onClick={handleCreateFolder}
                      className="flex-1 px-2 py-1 text-xs bg-indigo-600 text-white rounded hover:bg-indigo-700"
                    >
                      Create
                    </button>
                    <button
                      onClick={() => {
                        setShowNewFolderInput(false);
                        setNewFolderName('');
                      }}
                      className="flex-1 px-2 py-1 text-xs bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {/* New Page Input */}
              {showNewPageInput && (
                <div className="mb-3 p-2 bg-gray-50 rounded-lg">
                  <input
                    type="text"
                    value={newPageName}
                    onChange={(e) => setNewPageName(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleCreateNewPage()}
                    placeholder="Page name..."
                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none mb-2"
                    autoFocus
                  />
                  <div className="flex space-x-2">
                    <button
                      onClick={handleCreateNewPage}
                      className="flex-1 px-2 py-1 text-xs bg-indigo-600 text-white rounded hover:bg-indigo-700"
                    >
                      Create
                    </button>
                    <button
                      onClick={() => {
                        setShowNewPageInput(false);
                        setNewPageName('');
                      }}
                      className="flex-1 px-2 py-1 text-xs bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              <div className="space-y-1">
                {templates.length === 0 && folders.length === 0 ? (
                  <div className="text-center py-4">
                    <p className="text-sm text-gray-500 mb-2">No templates yet</p>
                    <p className="text-xs text-gray-400">Create a new template to get started</p>
                  </div>
                ) : (
                  <>
                    {/* Folders with Accordion */}
                    {folders.map((folder) => {
                      const folderName = folder.name;
                      const folderTemplates = groupedTemplates[folderName] || [];
                      const isExpanded = expandedFolders.has(folderName);
                      const isDraggedOver = dragOverFolder === folderName;

                      return (
                        <div key={folderName} className="border border-gray-200 rounded-lg overflow-hidden">
                          {/* Folder Accordion Header */}
                          <div
                            className={`flex items-center justify-between p-2.5 bg-gray-50 transition-colors ${
                              isDraggedOver
                                ? 'bg-indigo-100 border-b-2 border-indigo-400'
                                : 'hover:bg-gray-100'
                            }`}
                            onDragOver={(e) => {
                              e.preventDefault();
                              handleDragOver(e, folderName);
                            }}
                            onDragLeave={handleDragLeave}
                            onDrop={(e) => handleDrop(e, folderName)}
                          >
                            <div 
                              className="flex items-center space-x-2 flex-1 cursor-pointer"
                              onClick={() => toggleFolder(folderName)}
                            >
                              <svg
                                className={`w-4 h-4 text-gray-600 transition-transform duration-200 ${isExpanded ? 'rotate-90' : ''}`}
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                              </svg>
                              <svg
                                className="w-4 h-4 text-indigo-600"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                              </svg>
                              <span className="text-sm font-medium text-gray-700">{folderName}</span>
                              <span className="text-xs text-gray-500 bg-gray-200 px-1.5 py-0.5 rounded-full">
                                {folderTemplates.length}
                              </span>
                            </div>
                            {folder._id && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteFolder(folder._id!, folderName);
                                }}
                                className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded transition-colors ml-2"
                                title="Delete folder"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                            )}
                          </div>
                          
                          {/* Folder Accordion Content */}
                          {isExpanded && (
                            <div className="bg-white border-t border-gray-200">
                              <div className="p-2 space-y-1">
                                {folderTemplates.length === 0 ? (
                                  <div className="text-center py-4 text-sm text-gray-400">
                                    <p>No templates in this folder</p>
                                    <p className="text-xs mt-1">Create a template and save it here</p>
                                  </div>
                                ) : (
                                  folderTemplates.map((template) => (
                                  <div
                                    key={template._id}
                                    draggable
                                    onDragStart={(e) => handleDragStart(e, template._id)}
                                    className={`p-2 rounded border cursor-pointer transition-all ${
                                      selectedTemplate === template._id
                                        ? 'border-indigo-500 bg-indigo-50 shadow-sm'
                                        : draggedTemplate === template._id
                                        ? 'opacity-50 border-gray-300'
                                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                                    }`}
                                  >
                                    <div className="flex justify-between items-start">
                                      <div
                                        onClick={() => handleLoadTemplate(template)}
                                        className="flex-1 cursor-pointer min-w-0"
                                      >
                                        <div className="flex items-center space-x-2 mb-1">
                                          <svg className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                          </svg>
                                          <h3 className="font-medium text-sm text-gray-900 truncate">
                                            {template.name}
                                          </h3>
                                        </div>
                                        <p className="text-xs text-gray-500 ml-5.5">
                                          {new Date(template.updatedAt).toLocaleDateString()}
                                        </p>
                                      </div>
                                      <div className="flex items-center space-x-1 flex-shrink-0 ml-2">
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleDeleteTemplate(template._id);
                                          }}
                                          className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
                                          title="Delete template"
                                        >
                                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                          </svg>
                                        </button>
                                      </div>
                                    </div>
                                  </div>
                                  ))
                                )}
                                
                                {/* Drop Zone inside folder */}
                                <div
                                  className={`p-2 rounded border-2 border-dashed transition-colors ${
                                    isDraggedOver && dragOverFolder === folderName
                                      ? 'border-indigo-400 bg-indigo-50'
                                      : 'border-gray-200'
                                  }`}
                                  onDragOver={(e) => {
                                    e.preventDefault();
                                    handleDragOver(e, folderName);
                                  }}
                                  onDragLeave={handleDragLeave}
                                  onDrop={(e) => handleDrop(e, folderName)}
                                >
                                  <p className="text-xs text-center text-gray-400">
                                    {isDraggedOver ? 'Drop here to add to folder' : 'Drag template here'}
                                  </p>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}

                    {/* Templates without folder */}
                    {templatesWithoutFolder.length > 0 && (
                      <div className="border border-gray-200 rounded-lg overflow-hidden">
                        <div className="p-2.5 bg-gray-50 border-b border-gray-200">
                          <div className="flex items-center space-x-2">
                            <svg
                              className="w-4 h-4 text-gray-600"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            <span className="text-sm font-medium text-gray-700">Other Templates</span>
                            <span className="text-xs text-gray-500 bg-gray-200 px-1.5 py-0.5 rounded-full">
                              {templatesWithoutFolder.length}
                            </span>
                          </div>
                        </div>
                        <div className="p-2 space-y-1 bg-white">
                          {templatesWithoutFolder.map((template) => (
                            <div
                              key={template._id}
                              draggable
                              onDragStart={(e) => handleDragStart(e, template._id)}
                              className={`p-2 rounded border cursor-pointer transition-all ${
                                selectedTemplate === template._id
                                  ? 'border-indigo-500 bg-indigo-50 shadow-sm'
                                  : draggedTemplate === template._id
                                  ? 'opacity-50 border-gray-300'
                                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                              }`}
                            >
                              <div className="flex justify-between items-start">
                                <div
                                  onClick={() => handleLoadTemplate(template)}
                                  className="flex-1 cursor-pointer min-w-0"
                                >
                                  <div className="flex items-center space-x-2 mb-1">
                                    <svg className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                    <h3 className="font-medium text-sm text-gray-900 truncate">
                                      {template.name}
                                    </h3>
                                  </div>
                                  <p className="text-xs text-gray-500 ml-5.5">
                                    {new Date(template.updatedAt).toLocaleDateString()}
                                  </p>
                                </div>
                                <div className="flex items-center space-x-1 flex-shrink-0 ml-2">
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleDeleteTemplate(template._id);
                                    }}
                                    className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
                                    title="Delete template"
                                  >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="bg-white flex flex-col h-full">
            {/* Toolbar */}
            {!isFullscreen && (
              <div className="border-b border-gray-200 p-4 flex-shrink-0">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="flex-1 flex items-center space-x-2">
                    <input
                      type="text"
                      value={templateName}
                      onChange={(e) => setTemplateName(e.target.value)}
                      placeholder="Template name..."
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                    />
                    {(folders.length > 0 || selectedFolder) && (
                      <div className="relative">
                        <select
                          value={selectedFolder}
                          onChange={(e) => setSelectedFolder(e.target.value)}
                          className="px-3 py-2 pr-8 text-sm border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all appearance-none cursor-pointer hover:border-gray-400 shadow-sm"
                        >
                          <option value="">No Folder</option>
                          {folders.map((folder) => (
                            <option key={folder.name} value={folder.name}>
                              {folder.name}
                            </option>
                          ))}
                          {/* Show selected folder even if it's not in folders yet (newly created) */}
                          {selectedFolder && !folders.some(f => f.name === selectedFolder) && (
                            <option key={selectedFolder} value={selectedFolder}>
                              {selectedFolder}
                            </option>
                          )}
                        </select>
                        <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center space-x-3">
                    {lastSaved && !saving && (
                      <div className="text-xs text-gray-500 flex items-center gap-1">
                        <svg className="w-3.5 h-3.5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Last saved {lastSaved.toLocaleTimeString()}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Tabs */}
            {!isFullscreen && (
              <div className="border-b border-gray-200 flex-shrink-0">
                <div className="flex justify-between items-center">
                  <div className="flex">
                    <button
                      onClick={() => setActiveTab('split')}
                      className={`px-6 py-3 font-medium text-sm transition-colors ${
                        activeTab === 'split'
                          ? 'text-indigo-600 border-b-2 border-indigo-600'
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      Split View
                    </button>
                    <button
                      onClick={() => setActiveTab('editor')}
                      className={`px-6 py-3 font-medium text-sm transition-colors ${
                        activeTab === 'editor'
                          ? 'text-indigo-600 border-b-2 border-indigo-600'
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      Editor
                    </button>
                    <button
                      onClick={() => setActiveTab('preview')}
                      className={`px-6 py-3 font-medium text-sm transition-colors ${
                        activeTab === 'preview'
                          ? 'text-indigo-600 border-b-2 border-indigo-600'
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      Preview
                    </button>
                  </div>
                  <div className="flex items-center space-x-3 mr-[10px]">
                    {selectedTemplate && (
                      <div className="flex items-center space-x-2 bg-gray-200 px-2 py-1 rounded">
                        <span className="text-xs text-gray-500 font-mono">
                          Template ID: {selectedTemplate}
                        </span>
                        <button
                          onClick={handleCopyTemplateId}
                          className="p-1 text-gray-500 hover:text-indigo-600 hover:bg-gray-300 rounded transition-colors"
                          title="Copy Template ID"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                        </button>
                      </div>
                    )}
                    {activeTab === 'editor' && !isFullscreen && (
                      <button
                        onClick={() => setIsFullscreen(true)}
                        className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center space-x-2"
                        title="Enter fullscreen (ESC to exit)"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                        </svg>
                        <span>Fullscreen</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Content */}
            <div className="flex-1 overflow-hidden">
                {activeTab === 'split' ? (
                  <div className="h-full flex split-container relative">
                    {/* Editor - Left Half */}
                    <div 
                      className="flex flex-col h-full border-r border-gray-200"
                      style={{ width: `${splitPosition}%` }}
                    >
                      <div className="px-4 py-2 bg-gray-50 border-b border-gray-200 flex items-center justify-between flex-shrink-0">
                        <span className="text-sm font-medium text-gray-700">Editor</span>
                        <button
                          onClick={() => setActiveTab('editor')}
                          className="text-xs text-gray-500 hover:text-gray-700"
                          title="Expand editor"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </button>
                      </div>
                      <div className="flex-1 overflow-hidden min-h-0">
                        <HTMLEditor
                          ref={htmlEditorRef}
                          value={html}
                          onChange={(value) => setHtml(value || '')}
                          isFullscreen={false}
                          onFullscreenChange={setIsFullscreen}
                        />
                      </div>
                    </div>
                    {/* Resizer */}
                    <div
                      className="w-1 bg-gray-200 hover:bg-indigo-500 cursor-col-resize transition-colors flex-shrink-0 relative group z-10"
                      onMouseDown={(e) => {
                        e.preventDefault();
                        setIsResizing(true);
                      }}
                      style={{ minWidth: '4px', width: '4px' }}
                    >
                      <div className="absolute inset-y-0 -left-1 -right-1 bg-transparent group-hover:bg-indigo-100/50 transition-colors"></div>
                      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="flex space-x-0.5">
                          <div className="w-0.5 h-8 bg-indigo-500 rounded"></div>
                          <div className="w-0.5 h-8 bg-indigo-500 rounded"></div>
                        </div>
                      </div>
                    </div>
                    {/* Preview - Right Half */}
                    <div 
                      className="flex flex-col flex-1 h-full min-w-0"
                      style={{ width: `${100 - splitPosition}%` }}
                    >
                      <div className="px-4 py-2 bg-gray-50 border-b border-gray-200 flex items-center justify-between flex-shrink-0">
                        <span className="text-sm font-medium text-gray-700">Preview</span>
                        <div className="flex items-center space-x-2">
                          <div className="flex items-center space-x-1 bg-white rounded border border-gray-300 p-1">
                            <button
                              onClick={() => setPreviewMode('mobile')}
                              className={`px-2 py-1 text-xs rounded transition-colors ${
                                previewMode === 'mobile'
                                  ? 'bg-indigo-600 text-white'
                                  : 'text-gray-600 hover:bg-gray-100'
                              }`}
                              title="Mobile view (375px)"
                            >
                              📱
                            </button>
                            <button
                              onClick={() => setPreviewMode('tablet')}
                              className={`px-2 py-1 text-xs rounded transition-colors ${
                                previewMode === 'tablet'
                                  ? 'bg-indigo-600 text-white'
                                  : 'text-gray-600 hover:bg-gray-100'
                              }`}
                              title="Tablet view (768px)"
                            >
                              📱
                            </button>
                            <button
                              onClick={() => setPreviewMode('desktop')}
                              className={`px-2 py-1 text-xs rounded transition-colors ${
                                previewMode === 'desktop'
                                  ? 'bg-indigo-600 text-white'
                                  : 'text-gray-600 hover:bg-gray-100'
                              }`}
                              title="Desktop view (100%)"
                            >
                              💻
                            </button>
                          </div>
                          <div className="flex items-center space-x-1 bg-white rounded border border-gray-300 p-1">
                            <button
                              onClick={() => setPreviewZoom(prev => Math.max(25, prev - 25))}
                              className="px-2 py-1 text-xs text-gray-600 hover:bg-gray-100 rounded transition-colors"
                              title="Zoom out"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM13 10H7" />
                              </svg>
                            </button>
                            <span className="px-2 py-1 text-xs text-gray-600 font-medium min-w-[3rem] text-center">
                              {previewZoom}%
                            </span>
                            <button
                              onClick={() => setPreviewZoom(prev => Math.min(200, prev + 25))}
                              className="px-2 py-1 text-xs text-gray-600 hover:bg-gray-100 rounded transition-colors"
                              title="Zoom in"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7" />
                              </svg>
                            </button>
                            <button
                              onClick={() => setPreviewZoom(100)}
                              className="px-2 py-1 text-xs text-gray-600 hover:bg-gray-100 rounded transition-colors"
                              title="Reset zoom"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                              </svg>
                            </button>
                          </div>
                          <button
                            onClick={handleShare}
                            disabled={creatingShareLink || !html || !html.trim()}
                            className="px-2 py-1 text-xs text-gray-600 hover:bg-gray-100 rounded transition-colors border border-gray-300 bg-white disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Share preview"
                          >
                            {creatingShareLink ? (
                              <div className="w-4 h-4 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                            ) : (
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                              </svg>
                            )}
                          </button>
                          <button
                            onClick={() => setActiveTab('preview')}
                            className="text-xs text-gray-500 hover:text-gray-700"
                            title="Expand preview"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                          </button>
                        </div>
                      </div>
                      <div
                        className="flex-1 overflow-y-auto bg-gray-100 min-h-0"
                        onDragOver={(e) => {
                          e.preventDefault();
                          setIsOverCanvas(true);
                        }}
                        onDragEnter={() => setIsOverCanvas(true)}
                        onDragLeave={() => setIsOverCanvas(false)}
                        onDrop={(e) => {
                          e.preventDefault();
                          handleDropOnCanvas();
                        }}
                      >
                        <div className="px-3 pt-2">
                          <div className="bg-indigo-50 border border-indigo-100 text-sm text-gray-700 rounded-lg px-3 py-2 flex items-start gap-2">
                            <span className="text-indigo-600 font-semibold">Tip:</span>
                            <span>Drag components from the toolbar into this preview. Drop the Image chip to paste a URL or upload a file.</span>
                          </div>
                        </div>
                        <div className="h-full flex items-center justify-center p-2">
                          <div
                            className={`bg-white shadow-lg transition-all duration-300 relative ${
                              previewMode === 'mobile' ? 'w-[375px]' :
                              previewMode === 'tablet' ? 'w-[768px]' :
                              'w-full max-w-full'
                            }`}
                            style={{
                              height: '100%',
                              minHeight: previewMode === 'mobile' ? '667px' : previewMode === 'tablet' ? '1024px' : '100%',
                              transform: `scale(${previewZoom / 100})`,
                              transformOrigin: 'center center',
                            }}
                          >
                            {isOverCanvas && (
                              <div
                                className="absolute inset-0 bg-indigo-50/80 border-2 border-dashed border-indigo-400 rounded-lg z-20 flex items-center justify-center text-indigo-700 text-sm font-medium backdrop-blur-[1px] animate-pulse"
                                onDragOver={(e) => e.preventDefault()}
                                onDrop={(e) => {
                                  e.preventDefault();
                                  handleDropOnCanvas();
                                }}
                              >
                                <div className="flex items-center gap-2 px-4 py-2 bg-white/80 rounded-full shadow-sm border border-indigo-200">
                                  <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7h16M4 12h16M4 17h16M9 3l-2 4M17 3l-2 4" />
                                  </svg>
                                  <span>Drop to add into email body</span>
                                </div>
                              </div>
                            )}
                            <iframe
                              ref={splitIframeRef}
                              srcDoc={html}
                              className="w-full h-full border-0"
                              title="Email Preview"
                              style={{
                                height: '100%',
                                minHeight: previewMode === 'mobile' ? '667px' : previewMode === 'tablet' ? '1024px' : '100%',
                                pointerEvents: 'auto',
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : activeTab === 'editor' ? (
                  <HTMLEditor
                    ref={htmlEditorRef}
                    value={html}
                    onChange={(value) => setHtml(value || '')}
                    isFullscreen={isFullscreen}
                    onFullscreenChange={setIsFullscreen}
                  />
                ) : (
                  <div className="flex-1 flex flex-col h-full min-h-0">
                    <div className="px-4 py-2 bg-gray-50 border-b border-gray-200 flex items-center justify-between flex-shrink-0">
                      <span className="text-sm font-medium text-gray-700">Preview</span>
                      <div className="flex items-center space-x-2">
                        <div className="flex items-center space-x-1 bg-white rounded border border-gray-300 p-1">
                          <button
                            onClick={() => setPreviewMode('mobile')}
                            className={`px-3 py-1.5 text-xs rounded transition-colors font-medium ${
                              previewMode === 'mobile'
                                ? 'bg-indigo-600 text-white'
                                : 'text-gray-600 hover:bg-gray-100'
                            }`}
                            title="Mobile view (375px)"
                          >
                            📱 Mobile
                          </button>
                          <button
                            onClick={() => setPreviewMode('tablet')}
                            className={`px-3 py-1.5 text-xs rounded transition-colors font-medium ${
                              previewMode === 'tablet'
                                ? 'bg-indigo-600 text-white'
                                : 'text-gray-600 hover:bg-gray-100'
                            }`}
                            title="Tablet view (768px)"
                          >
                            📱 Tablet
                          </button>
                          <button
                            onClick={() => setPreviewMode('desktop')}
                            className={`px-3 py-1.5 text-xs rounded transition-colors font-medium ${
                              previewMode === 'desktop'
                                ? 'bg-indigo-600 text-white'
                                : 'text-gray-600 hover:bg-gray-100'
                            }`}
                            title="Desktop view (100%)"
                          >
                            💻 Desktop
                          </button>
                        </div>
                        <div className="flex items-center space-x-1 bg-white rounded border border-gray-300 p-1">
                          <button
                            onClick={() => setPreviewZoom(prev => Math.max(25, prev - 25))}
                            className="px-2 py-1.5 text-xs text-gray-600 hover:bg-gray-100 rounded transition-colors"
                            title="Zoom out"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM13 10H7" />
                            </svg>
                          </button>
                          <span className="px-2 py-1.5 text-xs text-gray-600 font-medium min-w-[3rem] text-center">
                            {previewZoom}%
                          </span>
                          <button
                            onClick={() => setPreviewZoom(prev => Math.min(200, prev + 25))}
                            className="px-2 py-1.5 text-xs text-gray-600 hover:bg-gray-100 rounded transition-colors"
                            title="Zoom in"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7" />
                            </svg>
                          </button>
                          <button
                            onClick={() => setPreviewZoom(100)}
                            className="px-2 py-1.5 text-xs text-gray-600 hover:bg-gray-100 rounded transition-colors"
                            title="Reset zoom"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                          </button>
                        </div>
                        <button
                          onClick={handleShare}
                          disabled={creatingShareLink || !html || !html.trim()}
                          className="px-2 py-1.5 text-xs text-gray-600 hover:bg-gray-100 rounded transition-colors border border-gray-300 bg-white disabled:opacity-50 disabled:cursor-not-allowed"
                          title="Share preview"
                        >
                          {creatingShareLink ? (
                            <div className="w-4 h-4 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                          ) : (
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                            </svg>
                          )}
                        </button>
                      </div>
                    </div>
                    <div
                      className="flex-1 overflow-y-auto bg-gray-100 min-h-0"
                      onDragOver={(e) => {
                        e.preventDefault();
                        setIsOverCanvas(true);
                      }}
                      onDragEnter={() => setIsOverCanvas(true)}
                      onDragLeave={() => setIsOverCanvas(false)}
                      onDrop={(e) => {
                        e.preventDefault();
                        handleDropOnCanvas();
                      }}
                    >
                      <div className="px-4 pt-3">
                        <div className="bg-indigo-50 border border-indigo-100 text-sm text-gray-700 rounded-lg px-3 py-2 flex items-start gap-2">
                          <span className="text-indigo-600 font-semibold">Tip:</span>
                          <span>Drag components from the toolbar into this preview. Drop the Image chip to paste a URL or upload a file.</span>
                        </div>
                      </div>
                      <div className="h-full flex items-center justify-center p-4">
                        <div
                          className={`bg-white shadow-lg transition-all duration-300 relative ${
                            previewMode === 'mobile' ? 'w-[375px]' :
                            previewMode === 'tablet' ? 'w-[768px]' :
                            'w-full max-w-full'
                          }`}
                          style={{
                            height: '100%',
                            minHeight: previewMode === 'mobile' ? '667px' : previewMode === 'tablet' ? '1024px' : '100%',
                            transform: `scale(${previewZoom / 100})`,
                            transformOrigin: 'center center',
                          }}
                        >
                          {isOverCanvas && (
                            <div
                              className="absolute inset-0 bg-indigo-50/80 border-2 border-dashed border-indigo-400 rounded-lg z-20 flex items-center justify-center text-indigo-700 text-sm font-medium backdrop-blur-[1px] animate-pulse"
                              onDragOver={(e) => e.preventDefault()}
                              onDrop={(e) => {
                                e.preventDefault();
                                handleDropOnCanvas();
                              }}
                            >
                              <div className="flex items-center gap-2 px-4 py-2 bg-white/80 rounded-full shadow-sm border border-indigo-200">
                                <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7h16M4 12h16M4 17h16M9 3l-2 4M17 3l-2 4" />
                                </svg>
                                <span>Drop to add into email body</span>
                              </div>
                            </div>
                          )}
                          <iframe
                            ref={previewIframeRef}
                            srcDoc={html}
                            className="w-full h-full border-0"
                            title="Email Preview"
                            style={{
                              height: '100%',
                              minHeight: previewMode === 'mobile' ? '667px' : previewMode === 'tablet' ? '1024px' : '100%',
                              pointerEvents: 'auto',
                            }}
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

      {/* Compact Drag & Drop Toolbar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-40">
        <div className="max-w-7xl mx-auto px-3 py-2">
          <div className="flex items-center gap-1">
            {/* Primary Tool Icons */}
            {primaryItems.map(item => (
              <button
                key={item.key}
                draggable
                onDragStart={(e) => {
                  e.dataTransfer.setData('text/plain', item.snippet);
                  e.dataTransfer.effectAllowed = 'copy';
                  setDraggingSnippet(item.snippet);
                }}
                onDragEnd={() => setDraggingSnippet(null)}
                onClick={() => handleDropOnCanvas(item.snippet)}
                className="p-2 rounded-lg border border-gray-200 bg-gray-50 hover:bg-indigo-50 hover:border-indigo-300 text-gray-600 hover:text-indigo-600 transition-all cursor-grab active:cursor-grabbing group relative"
                title={item.label}
              >
                {item.icon}
                {/* Tooltip */}
                <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 text-xs font-medium text-white bg-gray-900 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                  {item.label}
                </span>
              </button>
            ))}

            {/* More Tools Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowMoreTools(!showMoreTools)}
                className={`p-2 rounded-lg border transition-all ${
                  showMoreTools 
                    ? 'border-indigo-400 bg-indigo-100 text-indigo-600' 
                    : 'border-gray-200 bg-gray-50 hover:bg-gray-100 text-gray-600 hover:text-gray-800'
                }`}
                title="More tools"
              >
                <MoreHorizontal size={16} />
              </button>

              {/* Dropdown Menu */}
              {showMoreTools && (
                <>
                  {/* Backdrop */}
                  <div 
                    className="fixed inset-0 z-40" 
                    onClick={() => setShowMoreTools(false)}
                  />
                  {/* Dropup Panel */}
                  <div className="absolute bottom-full left-0 mb-2 bg-white rounded-xl shadow-2xl border border-gray-200 p-3 z-50 min-w-[280px]">
                    <div className="flex items-center justify-between mb-3 pb-2 border-b border-gray-100">
                      <span className="text-sm font-semibold text-gray-700">More Components</span>
                      <button 
                        onClick={() => setShowMoreTools(false)}
                        className="p-1 hover:bg-gray-100 rounded text-gray-400 hover:text-gray-600"
                      >
                        <X size={14} />
                      </button>
                    </div>
                    <div className="grid grid-cols-4 gap-2">
                      {secondaryItems.map(item => (
                        <button
                          key={item.key}
                          draggable
                          onDragStart={(e) => {
                            e.dataTransfer.setData('text/plain', item.snippet);
                            e.dataTransfer.effectAllowed = 'copy';
                            setDraggingSnippet(item.snippet);
                            setShowMoreTools(false);
                          }}
                          onDragEnd={() => setDraggingSnippet(null)}
                          onClick={() => {
                            handleDropOnCanvas(item.snippet);
                            setShowMoreTools(false);
                          }}
                          className="flex flex-col items-center gap-1 p-2 rounded-lg border border-gray-100 bg-gray-50 hover:bg-indigo-50 hover:border-indigo-300 text-gray-600 hover:text-indigo-600 transition-all cursor-grab active:cursor-grabbing"
                          title={item.label}
                        >
                          {item.icon}
                          <span className="text-[10px] font-medium">{item.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Divider */}
            <div className="w-px h-6 bg-gray-300 mx-1"></div>

            {/* Spacer */}
            <div className="flex-1"></div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setShowSendEmailModal(true);
                  setEmailSubject(`Email from ${templateName || 'Template'}`);
                }}
                className="px-3 py-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-medium rounded-lg shadow-sm hover:shadow transition-all flex items-center gap-2"
                title="Send Email"
              >
                <Send size={16} />
                <span className="hidden sm:inline">Send Email</span>
              </button>
              <button
                onClick={() => handleSaveTemplate()}
                disabled={saving || !templateName.trim() || !html.trim()}
                className="px-3 py-2 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-medium rounded-lg shadow-sm hover:shadow transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                title="Save Changes"
              >
                {saving ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <Save size={16} />
                )}
                <span className="hidden sm:inline">{saving ? 'Saving...' : 'Save Changes'}</span>
              </button>
            </div>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileSelect}
          />
        </div>
      </div>

      {/* Send Email Side Panel */}
      {showSendEmailModal && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-50 transition-opacity duration-300"
            onClick={() => {
              setShowSendEmailModal(false);
              setRecipientSearch('');
              setExpandedRecipientFolders(new Set());
              setTemplateSearch('');
              setShowTemplateSuggestions(false);
              setShowTemplateDropdown(false);
            }}
          ></div>
          
          {/* Side Panel */}
          <div className="fixed top-0 right-0 h-full w-1/2 z-50 transform transition-transform duration-300 ease-in-out">
            <div className="bg-white h-full shadow-2xl flex flex-col overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
                <h2 className="text-2xl font-bold text-gray-900">Send Email</h2>
                <button
                      onClick={() => {
                        setShowSendEmailModal(false);
                        setRecipientSearch('');
                        setExpandedRecipientFolders(new Set());
                        setSelectedRecipients([]);
                        setSelectedFolders([]);
                        setTemplateSearch('');
                        setShowTemplateSuggestions(false);
                        setShowTemplateDropdown(false);
                      }}
                  className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                  aria-label="Close panel"
                >
                  <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              {/* Content */}
              <div className="flex-1 overflow-y-auto p-6">
                <form onSubmit={handleSendEmails} className="h-full flex flex-col">
                  {/* Template Selection */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Select Template <span className="text-red-500">*</span>
                    </label>
                    <div 
                      className="relative"
                      onBlur={(e) => {
                        // Close dropdown if clicking outside
                        if (!e.currentTarget.contains(e.relatedTarget as Node)) {
                          setTimeout(() => setShowTemplateDropdown(false), 200);
                        }
                      }}
                    >
                      {/* Custom Select Button */}
                      <button
                        type="button"
                        onClick={() => {
                          setShowTemplateDropdown(!showTemplateDropdown);
                          setTemplateSearch('');
                        }}
                        className={`w-full px-4 py-3 pr-10 text-left border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all ${
                          showTemplateDropdown ? 'ring-2 ring-blue-500 border-blue-500' : 'hover:border-gray-400'
                        } ${!selectedTemplate ? 'text-gray-500' : ''}`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="truncate">
                            {selectedTemplate 
                              ? templates.find(t => t._id === selectedTemplate)?.name || 'Select a template...'
                              : 'Select a template...'}
                          </span>
                          <svg 
                            className={`w-5 h-5 text-gray-400 transition-transform ${showTemplateDropdown ? 'transform rotate-180' : ''}`}
                            fill="none" 
                            stroke="currentColor" 
                            viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </div>
                      </button>

                      {/* Dropdown Menu */}
                      {showTemplateDropdown && (
                        <div className="absolute z-20 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-xl max-h-96 overflow-hidden flex flex-col">
                          {/* Search Input */}
                          <div className="p-3 border-b border-gray-200 bg-gray-50">
                            <input
                              type="text"
                              value={templateSearch}
                              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                setTemplateSearch(e.target.value);
                                setHighlightedTemplateIndex(-1);
                              }}
                              onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                                const searchLower = templateSearch.toLowerCase();
                                const filtered = templates.filter(t => 
                                  t.name.toLowerCase().includes(searchLower) ||
                                  (t.folder || '').toLowerCase().includes(searchLower)
                                );
                                
                                if (e.key === 'ArrowDown') {
                                  e.preventDefault();
                                  setHighlightedTemplateIndex(prev => 
                                    prev < filtered.length - 1 ? prev + 1 : prev
                                  );
                                } else if (e.key === 'ArrowUp') {
                                  e.preventDefault();
                                  setHighlightedTemplateIndex(prev => prev > 0 ? prev - 1 : -1);
                                } else if (e.key === 'Enter' && highlightedTemplateIndex >= 0) {
                                  e.preventDefault();
                                  handleSelectTemplateSuggestion(filtered[highlightedTemplateIndex]);
                                }
                              }}
                              placeholder="Search templates..."
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm"
                              autoFocus
                            />
                          </div>

                          {/* Template List */}
                          <div className="overflow-y-auto max-h-80">
                            {(() => {
                              const searchLower = templateSearch.toLowerCase();
                              const filteredTemplates = templates.filter(t => 
                                !templateSearch.trim() ||
                                t.name.toLowerCase().includes(searchLower) ||
                                (t.folder || '').toLowerCase().includes(searchLower)
                              );

                              // Group by folder
                              const grouped: Record<string, typeof templates> = {};
                              const rootTemplates: typeof templates = [];

                              filteredTemplates.forEach(t => {
                                const folder = (t.folder || '').trim();
                                if (folder) {
                                  if (!grouped[folder]) {
                                    grouped[folder] = [];
                                  }
                                  grouped[folder].push(t);
                                } else {
                                  rootTemplates.push(t);
                                }
                              });

                              const folderNames = Object.keys(grouped).sort();

                              if (filteredTemplates.length === 0) {
                                return (
                                  <div className="px-4 py-8 text-center text-gray-500 text-sm">
                                    No templates found
                                  </div>
                                );
                              }

                              return (
                                <div>
                                  {/* Root Templates (No Folder) */}
                                  {rootTemplates.length > 0 && (
                                    <div className="py-2">
                                      <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                                        No Folder
                                      </div>
                                      {rootTemplates.map((template, index) => (
                                        <div
                                          key={template._id}
                                          onClick={() => handleSelectTemplateSuggestion(template)}
                                          onMouseEnter={() => {
                                            const globalIndex = rootTemplates.findIndex(t => t._id === template._id);
                                            setHighlightedTemplateIndex(globalIndex);
                                          }}
                                          className={`px-4 py-3 cursor-pointer transition-colors ${
                                            highlightedTemplateIndex === index ? 'bg-blue-50' : 'hover:bg-gray-50'
                                          } ${selectedTemplate === template._id ? 'bg-green-50 border-l-4 border-green-500' : ''}`}
                                        >
                                          <div className="flex items-center space-x-3">
                                            {selectedTemplate === template._id && (
                                              <svg className="w-5 h-5 text-green-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                              </svg>
                                            )}
                                            <div className="flex-1 min-w-0">
                                              <div className="text-sm font-medium text-gray-900 truncate">
                                                {template.name}
                                              </div>
                                            </div>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  )}

                                  {/* Folders */}
                                  {folderNames.map((folderName) => {
                                    const folderTemplates = grouped[folderName];
                                    return (
                                      <div key={folderName} className="py-2 border-t border-gray-100">
                                        <div className="px-4 py-2 flex items-center space-x-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                                          </svg>
                                          <span>{folderName}</span>
                                        </div>
                                        {folderTemplates.map((template) => {
                                          const globalIndex = rootTemplates.length + 
                                            folderNames.slice(0, folderNames.indexOf(folderName)).reduce((sum, f) => sum + grouped[f].length, 0) +
                                            folderTemplates.findIndex(t => t._id === template._id);
                                          
                                          return (
                                            <div
                                              key={template._id}
                                              onClick={() => handleSelectTemplateSuggestion(template)}
                                              onMouseEnter={() => setHighlightedTemplateIndex(globalIndex)}
                                              className={`px-4 py-3 cursor-pointer transition-colors ${
                                                highlightedTemplateIndex === globalIndex ? 'bg-blue-50' : 'hover:bg-gray-50'
                                              } ${selectedTemplate === template._id ? 'bg-green-50 border-l-4 border-green-500' : ''}`}
                                            >
                                              <div className="flex items-center space-x-3">
                                                {selectedTemplate === template._id && (
                                                  <svg className="w-5 h-5 text-green-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                  </svg>
                                                )}
                                                <div className="flex-1 min-w-0">
                                                  <div className="text-sm font-medium text-gray-900 truncate">
                                                    {template.name}
                                                  </div>
                                                </div>
                                              </div>
                                            </div>
                                          );
                                        })}
                                      </div>
                                    );
                                  })}
                                </div>
                              );
                            })()}
                          </div>
                        </div>
                      )}
                    </div>
                    {selectedTemplate && (
                      <p className="mt-2 text-sm text-gray-500">
                        Selected: <strong>{templates.find(t => t._id === selectedTemplate)?.name}</strong>
                        {templates.find(t => t._id === selectedTemplate)?.folder && (
                          <span className="text-gray-400"> • {templates.find(t => t._id === selectedTemplate)?.folder}</span>
                        )}
                      </p>
                    )}
                  </div>

                  {/* Email Subject */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Subject <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={emailSubject}
                      onChange={(e) => setEmailSubject(e.target.value)}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                      placeholder="Enter email subject"
                    />
                  </div>

                  {/* SMTP Selection */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Send From (SMTP) <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <select
                        value={selectedSmtp}
                        onChange={(e) => setSelectedSmtp(e.target.value)}
                        className="w-full px-4 py-3 pr-10 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all appearance-none cursor-pointer hover:border-gray-400 shadow-sm"
                        required
                      >
                      <option value="">Select SMTP configuration...</option>
                      {smtpConfigs.map((smtp) => (
                        <option key={smtp._id} value={smtp._id}>
                          {smtp.isAdminSmtp ? '📧 ' : ''}{smtp.title || smtp.name || 'Default'} - {smtp.smtpFrom} {smtp.isActive && '(Active)'} {smtp.isDefault && '(Default)'}
                        </option>
                      ))}
                      </select>
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>
                  </div>

                  {/* Recipients Selection */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Select Recipients <span className="text-red-500">*</span>
                    </label>
                    
                    {/* Search Filter with Suggestions */}
                    <div className="mb-4 relative">
                      <input
                        type="text"
                        value={recipientSearch}
                        onChange={(e) => {
                          setRecipientSearch(e.target.value);
                          setShowSearchSuggestions(e.target.value.trim().length > 0);
                          setHighlightedSuggestionIndex(-1);
                        }}
                        onFocus={() => {
                          if (recipientSearch.trim().length > 0) {
                            setShowSearchSuggestions(true);
                          }
                        }}
                        onBlur={() => {
                          // Delay to allow click on suggestion
                          setTimeout(() => setShowSearchSuggestions(false), 200);
                        }}
                        onKeyDown={(e) => {
                          if (!showSearchSuggestions) return;
                          
                          const searchLower = recipientSearch.toLowerCase();
                          const filteredSuggestions = recipients
                            .filter(r => 
                              r.name.toLowerCase().includes(searchLower) ||
                              r.email.toLowerCase().includes(searchLower) ||
                              (r.folder || '').toLowerCase().includes(searchLower)
                            )
                            .slice(0, 10);
                          
                          if (filteredSuggestions.length === 0) return;
                          
                          if (e.key === 'ArrowDown') {
                            e.preventDefault();
                            setHighlightedSuggestionIndex(prev => 
                              prev < filteredSuggestions.length - 1 ? prev + 1 : prev
                            );
                          } else if (e.key === 'ArrowUp') {
                            e.preventDefault();
                            setHighlightedSuggestionIndex(prev => prev > 0 ? prev - 1 : -1);
                          } else if (e.key === 'Enter' && highlightedSuggestionIndex >= 0) {
                            e.preventDefault();
                            const suggestion = filteredSuggestions[highlightedSuggestionIndex];
                            handleSelectSuggestion(suggestion);
                          } else if (e.key === 'Escape') {
                            setShowSearchSuggestions(false);
                          }
                        }}
                        placeholder="Search recipients by name or email..."
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                      />
                      
                      {/* Search Suggestions Dropdown */}
                      {showSearchSuggestions && recipientSearch.trim().length > 0 && (() => {
                        const searchLower = recipientSearch.toLowerCase();
                        const filteredSuggestions = recipients
                          .filter(r => 
                            r.name.toLowerCase().includes(searchLower) ||
                            r.email.toLowerCase().includes(searchLower) ||
                            (r.folder || '').toLowerCase().includes(searchLower)
                          )
                          .slice(0, 10) // Limit to 10 suggestions
                          .map(r => ({
                            ...r,
                            matchType: r.name.toLowerCase().includes(searchLower) ? 'name' :
                                      r.email.toLowerCase().includes(searchLower) ? 'email' : 'folder'
                          }));

                        return filteredSuggestions.length > 0 ? (
                          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-64 overflow-y-auto">
                            {filteredSuggestions.map((recipient, index) => (
                              <div
                                key={recipient._id}
                                onClick={() => handleSelectSuggestion(recipient)}
                                onMouseEnter={() => setHighlightedSuggestionIndex(index)}
                                className={`px-4 py-3 cursor-pointer hover:bg-blue-50 transition-colors ${
                                  highlightedSuggestionIndex === index ? 'bg-blue-50' : ''
                                } ${selectedRecipients.includes(recipient._id) ? 'bg-green-50' : ''}`}
                              >
                                <div className="flex items-center justify-between">
                                  <div className="flex-1">
                                    <div className="flex items-center space-x-2">
                                      {selectedRecipients.includes(recipient._id) && (
                                        <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                      )}
                                      <span className="text-sm font-medium text-gray-900">
                                        {recipient.name}
                                      </span>
                                    </div>
                                    <div className="text-xs text-gray-500 mt-0.5">
                                      {recipient.email}
                                    </div>
                                    {recipient.folder && (
                                      <div className="text-xs text-gray-400 mt-0.5 flex items-center space-x-1">
                                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                                        </svg>
                                        <span>{recipient.folder}</span>
                                      </div>
                                    )}
                                  </div>
                                  <div className="ml-2">
                                    {recipient.matchType === 'name' && (
                                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded">Name</span>
                                    )}
                                    {recipient.matchType === 'email' && (
                                      <span className="text-xs bg-purple-100 text-purple-800 px-2 py-0.5 rounded">Email</span>
                                    )}
                                    {recipient.matchType === 'folder' && (
                                      <span className="text-xs bg-gray-100 text-gray-800 px-2 py-0.5 rounded">Folder</span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : null;
                      })()}
                    </div>

                    {/* Accordion-style Folder View */}
                    <div className="border border-gray-200 rounded-lg max-h-96 overflow-y-auto">
                      {/* Group recipients by folder */}
                      {(() => {
                        // Filter recipients based on search
                        const filteredRecipients = recipients.filter(r => {
                          if (!recipientSearch.trim()) return true;
                          const search = recipientSearch.toLowerCase();
                          return (
                            r.name.toLowerCase().includes(search) ||
                            r.email.toLowerCase().includes(search) ||
                            (r.folder || '').toLowerCase().includes(search)
                          );
                        });

                        // Group by folder
                        const grouped: Record<string, typeof recipients> = {};
                        const rootRecipients: typeof recipients = [];

                        filteredRecipients.forEach(r => {
                          // Handle empty string folders properly
                          const folder = (r.folder || '').trim();
                          if (folder) {
                            if (!grouped[folder]) {
                              grouped[folder] = [];
                            }
                            grouped[folder].push(r);
                          } else {
                            rootRecipients.push(r);
                          }
                        });

                        // Sort folders with Team Members first
                        const folderNames = Object.keys(grouped).sort((a, b) => {
                          if (a === 'Team Members') return -1;
                          if (b === 'Team Members') return 1;
                          return a.localeCompare(b);
                        });

                        return (
                          <div className="divide-y divide-gray-200">
                            {/* Root Recipients (No Folder) */}
                            {rootRecipients.length > 0 && (
                              <div className="p-3">
                                <div className="flex items-center justify-between mb-2">
                                  <label className="flex items-center space-x-2 cursor-pointer">
                                    <input
                                      type="checkbox"
                                      checked={rootRecipients.every(r => selectedRecipients.includes(r._id))}
                                      onChange={(e) => {
                                        if (e.target.checked) {
                                          const rootIds = rootRecipients.map(r => r._id);
                                          setSelectedRecipients([...selectedRecipients, ...rootIds.filter(id => !selectedRecipients.includes(id))]);
                                        } else {
                                          setSelectedRecipients(selectedRecipients.filter(id => !rootRecipients.some(r => r._id === id)));
                                        }
                                      }}
                                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                    />
                                    <span className="text-sm font-semibold text-gray-700">Root (No Folder)</span>
                                    <span className="text-xs text-gray-500">({rootRecipients.length})</span>
                                  </label>
                                </div>
                                <div className="ml-6 space-y-1">
                                  {rootRecipients.map((recipient) => (
                                    <label key={recipient._id} className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-2 rounded">
                                      <input
                                        type="checkbox"
                                        checked={selectedRecipients.includes(recipient._id)}
                                        onChange={(e) => {
                                          if (e.target.checked) {
                                            setSelectedRecipients([...selectedRecipients, recipient._id]);
                                          } else {
                                            setSelectedRecipients(selectedRecipients.filter(id => id !== recipient._id));
                                          }
                                        }}
                                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                      />
                                      <span className="text-sm text-gray-700">{recipient.name} <span className="text-gray-500">({recipient.email})</span></span>
                                    </label>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Folders */}
                            {folderNames.map((folderName) => {
                              const folderRecipients = grouped[folderName];
                              const isExpanded = expandedRecipientFolders.has(folderName);
                              const allSelected = folderRecipients.every(r => selectedRecipients.includes(r._id));
                              const someSelected = folderRecipients.some(r => selectedRecipients.includes(r._id));

                              return (
                                <div key={folderName} className="border-b border-gray-200 last:border-b-0">
                                  {/* Folder Header */}
                                  <div
                                    className="p-3 bg-gray-50 hover:bg-gray-100 cursor-pointer"
                                    onClick={() => {
                                      const newExpanded = new Set(expandedRecipientFolders);
                                      if (newExpanded.has(folderName)) {
                                        newExpanded.delete(folderName);
                                      } else {
                                        newExpanded.add(folderName);
                                      }
                                      setExpandedRecipientFolders(newExpanded);
                                    }}
                                  >
                                    <div className="flex items-center justify-between">
                                      <div className="flex items-center space-x-2 flex-1">
                                        <svg
                                          className={`w-4 h-4 text-gray-500 transform transition-transform ${isExpanded ? 'rotate-90' : ''}`}
                                          fill="none"
                                          stroke="currentColor"
                                          viewBox="0 0 24 24"
                                        >
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                        </svg>
                                        <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                                        </svg>
                                        <label
                                          className="flex items-center space-x-2 cursor-pointer flex-1"
                                          onClick={(e) => e.stopPropagation()}
                                        >
                                          <input
                                            type="checkbox"
                                            checked={allSelected}
                                            ref={(input) => {
                                              if (input) input.indeterminate = someSelected && !allSelected;
                                            }}
                                            onChange={(e) => {
                                              if (e.target.checked) {
                                                // Select all recipients in folder
                                                const folderIds = folderRecipients.map(r => r._id);
                                                setSelectedRecipients([...selectedRecipients, ...folderIds.filter(id => !selectedRecipients.includes(id))]);
                                                // Also select folder
                                                if (!selectedFolders.includes(folderName)) {
                                                  setSelectedFolders([...selectedFolders, folderName]);
                                                }
                                              } else {
                                                // Deselect all recipients in folder
                                                setSelectedRecipients(selectedRecipients.filter(id => !folderRecipients.some(r => r._id === id)));
                                                // Deselect folder
                                                setSelectedFolders(selectedFolders.filter(f => f !== folderName));
                                              }
                                            }}
                                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                          />
                                          <span className="text-sm font-semibold text-gray-700">{folderName}</span>
                                          <span className="text-xs text-gray-500">({folderRecipients.length})</span>
                                        </label>
                                      </div>
                                    </div>
                                  </div>

                                  {/* Folder Recipients */}
                                  {isExpanded && (
                                    <div className="bg-white p-3">
                                      <div className="ml-6 space-y-1">
                                        {folderRecipients.map((recipient) => (
                                          <label key={recipient._id} className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-2 rounded">
                                            <input
                                              type="checkbox"
                                              checked={selectedRecipients.includes(recipient._id)}
                                              onChange={(e) => {
                                                if (e.target.checked) {
                                                  setSelectedRecipients([...selectedRecipients, recipient._id]);
                                                } else {
                                                  setSelectedRecipients(selectedRecipients.filter(id => id !== recipient._id));
                                                  // If deselecting individual, also deselect folder if it was selected
                                                  if (selectedFolders.includes(folderName)) {
                                                    setSelectedFolders(selectedFolders.filter(f => f !== folderName));
                                                  }
                                                }
                                              }}
                                              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                            />
                                            <span className="text-sm text-gray-700">{recipient.name} <span className="text-gray-500">({recipient.email})</span></span>
                                          </label>
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        );
                      })()}
                    </div>

                    {/* Selection Summary */}
                    {(selectedRecipients.length > 0 || selectedFolders.length > 0) && (
                      <p className="mt-3 text-sm text-blue-600 font-medium">
                        Selected: {selectedRecipients.length} recipient(s) {selectedFolders.length > 0 && `+ ${selectedFolders.length} folder(s)`}
                      </p>
                    )}
                  </div>
                  
                  {/* Footer - Sticky at bottom of form */}
                  <div className="mt-auto pt-6 border-t border-gray-200">
                    <div className="flex justify-end space-x-3">
                      <button
                        type="button"
                        onClick={() => {
                          setShowSendEmailModal(false);
                          setSelectedRecipients([]);
                          setSelectedFolders([]);
                          setRecipientSearch('');
                          setExpandedRecipientFolders(new Set());
                          setTemplateSearch('');
                          setShowTemplateSuggestions(false);
                          setShowTemplateDropdown(false);
                        }}
                        className="px-6 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={sendingEmails || !selectedSmtp || (selectedRecipients.length === 0 && selectedFolders.length === 0)}
                        className="px-6 py-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {sendingEmails ? 'Sending...' : 'Confirm & Send'}
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Progress Modal - Fixed at right bottom */}
      {showProgressModal && (
        <div className="fixed bottom-8 right-8 bg-white rounded-lg shadow-2xl border border-gray-200 z-50 w-80">
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Sending Emails</h3>
              <button
                onClick={() => {
                  if (emailProgress.sent + emailProgress.failed >= emailProgress.total) {
                    setShowProgressModal(false);
                    setEmailProgress({ sent: 0, pending: 0, failed: 0, total: 0 });
                  }
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
          <div className="p-4">
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Total:</span>
                <span className="font-semibold">{emailProgress.total}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-green-600">Sent:</span>
                <span className="font-semibold text-green-600">{emailProgress.sent}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-yellow-600">Pending:</span>
                <span className="font-semibold text-yellow-600">{emailProgress.pending}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-red-600">Failed:</span>
                <span className="font-semibold text-red-600">{emailProgress.failed}</span>
              </div>
              <div className="mt-4">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${((emailProgress.sent + emailProgress.failed) / emailProgress.total) * 100}%` }}
                  ></div>
                </div>
              </div>
              {emailProgress.sent + emailProgress.failed >= emailProgress.total && (
                <p className="text-sm text-center text-green-600 font-semibold mt-2">
                  All emails processed!
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Confirm Dialog */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title={confirmDialog.title}
        message={confirmDialog.message}
        type={confirmDialog.type}
        onConfirm={confirmDialog.onConfirm}
        onCancel={() => setConfirmDialog({ ...confirmDialog, isOpen: false })}
      />

      {/* Alert */}
      <Alert
        isOpen={alert.isOpen}
        message={alert.message}
        type={alert.type}
        onClose={() => setAlert({ ...alert, isOpen: false })}
      />

      {/* Image URL Modal */}
      {showImageUrlModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full mx-4 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-indigo-500 to-purple-600">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                      <circle cx="8.5" cy="8.5" r="1.5"></circle>
                      <polyline points="21 15 16 10 5 21"></polyline>
                    </svg>
                  </div>
                  <h2 className="text-lg font-semibold text-white">Add Image URL</h2>
                </div>
                <button
                  onClick={() => {
                    setShowImageUrlModal(false);
                    setImageUrlInput('');
                    setTargetImageSelector(null);
                  }}
                  className="text-white/80 hover:text-white transition-colors p-1"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            <div className="px-6 py-5">
              <p className="text-sm text-gray-600 mb-4">
                Enter the URL of the image you want to add. Make sure the URL is publicly accessible.
              </p>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Image URL
                  </label>
                  <input
                    type="url"
                    value={imageUrlInput}
                    onChange={(e) => setImageUrlInput(e.target.value)}
                    placeholder="https://example.com/image.jpg"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                    autoFocus
                  />
                </div>
                {imageUrlInput && (
                  <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                    <p className="text-xs text-gray-500 mb-2">Preview:</p>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img 
                      src={ensureAbsoluteImageUrl(imageUrlInput)} 
                      alt="Preview" 
                      className="max-h-32 max-w-full object-contain rounded"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                      onLoad={(e) => {
                        (e.target as HTMLImageElement).style.display = 'block';
                      }}
                    />
                  </div>
                )}
              </div>
            </div>
            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowImageUrlModal(false);
                  setImageUrlInput('');
                  setTargetImageSelector(null);
                }}
                className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (imageUrlInput.trim() && targetImageSelector) {
                    const absoluteUrl = ensureAbsoluteImageUrl(imageUrlInput.trim());
                    updateImageSrc(targetImageSelector, absoluteUrl);
                    setShowImageUrlModal(false);
                    setImageUrlInput('');
                    setTargetImageSelector(null);
                  }
                }}
                disabled={!imageUrlInput.trim()}
                className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Add Image
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Link Edit Modal */}
      {showLinkEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full mx-4 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-blue-500 to-cyan-600">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                    </svg>
                  </div>
                  <h2 className="text-lg font-semibold text-white">Edit Link</h2>
                </div>
                <button
                  onClick={() => {
                    setShowLinkEditModal(false);
                    setLinkUrlInput('');
                    setTargetLinkSelector(null);
                  }}
                  className="text-white/80 hover:text-white transition-colors p-1"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            <div className="px-6 py-5">
              <p className="text-sm text-gray-600 mb-4">
                Enter the URL for this link. This will update the href attribute of the anchor tag.
              </p>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Link URL
                  </label>
                  <input
                    type="url"
                    value={linkUrlInput}
                    onChange={(e) => setLinkUrlInput(e.target.value)}
                    placeholder="https://example.com"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                    autoFocus
                  />
                </div>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowLinkEditModal(false);
                  setLinkUrlInput('');
                  setTargetLinkSelector(null);
                }}
                className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (linkUrlInput.trim() && targetLinkSelector) {
                    updateLinkHref(targetLinkSelector, linkUrlInput.trim());
                    setShowLinkEditModal(false);
                    setLinkUrlInput('');
                    setTargetLinkSelector(null);
                  }
                }}
                disabled={!linkUrlInput.trim()}
                className="px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg hover:from-blue-700 hover:to-cyan-700 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Update Link
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CSS Edit Modal */}
      {showCssEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full mx-4 overflow-hidden max-h-[90vh] flex flex-col">
            <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-pink-500 to-purple-600 flex-shrink-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-white">Edit Styles</h2>
                    <p className="text-xs text-white/70">&lt;{targetCssTagName}&gt; element</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setShowCssEditModal(false);
                    setCssEditInput('');
                    setTargetCssSelector(null);
                    setTargetCssTagName('');
                    setShowAdvancedCss(false);
                  }}
                  className="text-white/80 hover:text-white transition-colors p-1"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            <div className="px-6 py-5 flex-1 overflow-y-auto">
              {!showAdvancedCss ? (
                <div className="space-y-5">
                  {/* Colors */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Background Color</label>
                      <div className="flex gap-2">
                        <input
                          type="color"
                          value={cssFields.backgroundColor || '#ffffff'}
                          onChange={(e) => setCssFields({ ...cssFields, backgroundColor: e.target.value })}
                          className="w-10 h-10 rounded border border-gray-300 cursor-pointer"
                        />
                        <input
                          type="text"
                          value={cssFields.backgroundColor}
                          onChange={(e) => setCssFields({ ...cssFields, backgroundColor: e.target.value })}
                          placeholder="#ffffff"
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Text Color</label>
                      <div className="flex gap-2">
                        <input
                          type="color"
                          value={cssFields.color || '#000000'}
                          onChange={(e) => setCssFields({ ...cssFields, color: e.target.value })}
                          className="w-10 h-10 rounded border border-gray-300 cursor-pointer"
                        />
                        <input
                          type="text"
                          value={cssFields.color}
                          onChange={(e) => setCssFields({ ...cssFields, color: e.target.value })}
                          placeholder="#333333"
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Size */}
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Font Size</label>
                      <input
                        type="text"
                        value={cssFields.fontSize}
                        onChange={(e) => setCssFields({ ...cssFields, fontSize: e.target.value })}
                        placeholder="16px"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Width</label>
                      <input
                        type="text"
                        value={cssFields.width}
                        onChange={(e) => setCssFields({ ...cssFields, width: e.target.value })}
                        placeholder="100%"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Height</label>
                      <input
                        type="text"
                        value={cssFields.height}
                        onChange={(e) => setCssFields({ ...cssFields, height: e.target.value })}
                        placeholder="auto"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none"
                      />
                    </div>
                  </div>

                  {/* Padding */}
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-2">Padding</label>
                    <div className="grid grid-cols-4 gap-2">
                      <div>
                        <span className="text-xs text-gray-400">Top</span>
                        <input
                          type="text"
                          value={cssFields.paddingTop}
                          onChange={(e) => setCssFields({ ...cssFields, paddingTop: e.target.value })}
                          placeholder="0px"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none"
                        />
                      </div>
                      <div>
                        <span className="text-xs text-gray-400">Right</span>
                        <input
                          type="text"
                          value={cssFields.paddingRight}
                          onChange={(e) => setCssFields({ ...cssFields, paddingRight: e.target.value })}
                          placeholder="0px"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none"
                        />
                      </div>
                      <div>
                        <span className="text-xs text-gray-400">Bottom</span>
                        <input
                          type="text"
                          value={cssFields.paddingBottom}
                          onChange={(e) => setCssFields({ ...cssFields, paddingBottom: e.target.value })}
                          placeholder="0px"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none"
                        />
                      </div>
                      <div>
                        <span className="text-xs text-gray-400">Left</span>
                        <input
                          type="text"
                          value={cssFields.paddingLeft}
                          onChange={(e) => setCssFields({ ...cssFields, paddingLeft: e.target.value })}
                          placeholder="0px"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Margin */}
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-2">Margin</label>
                    <div className="grid grid-cols-4 gap-2">
                      <div>
                        <span className="text-xs text-gray-400">Top</span>
                        <input
                          type="text"
                          value={cssFields.marginTop}
                          onChange={(e) => setCssFields({ ...cssFields, marginTop: e.target.value })}
                          placeholder="0px"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none"
                        />
                      </div>
                      <div>
                        <span className="text-xs text-gray-400">Right</span>
                        <input
                          type="text"
                          value={cssFields.marginRight}
                          onChange={(e) => setCssFields({ ...cssFields, marginRight: e.target.value })}
                          placeholder="0px"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none"
                        />
                      </div>
                      <div>
                        <span className="text-xs text-gray-400">Bottom</span>
                        <input
                          type="text"
                          value={cssFields.marginBottom}
                          onChange={(e) => setCssFields({ ...cssFields, marginBottom: e.target.value })}
                          placeholder="0px"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none"
                        />
                      </div>
                      <div>
                        <span className="text-xs text-gray-400">Left</span>
                        <input
                          type="text"
                          value={cssFields.marginLeft}
                          onChange={(e) => setCssFields({ ...cssFields, marginLeft: e.target.value })}
                          placeholder="0px"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Table specific */}
                  {(targetCssTagName === 'td' || targetCssTagName === 'th' || targetCssTagName === 'table' || targetCssTagName === 'tr') && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <label className="block text-xs font-medium text-gray-600">Table & Border Properties</label>
                        <button
                          type="button"
                          onClick={() => setCssFields({ 
                            ...cssFields, 
                            border: '0', 
                            borderWidth: '0',
                            borderSpacing: '0',
                            borderCollapse: 'collapse'
                          })}
                          className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 rounded transition-colors"
                        >
                          Set Border: 0
                        </button>
                      </div>
                      
                      {/* Border Settings */}
                      <div className="grid grid-cols-4 gap-3">
                        <div>
                          <label className="block text-xs text-gray-400 mb-1">Border Width</label>
                          <input
                            type="text"
                            value={cssFields.borderWidth}
                            onChange={(e) => setCssFields({ ...cssFields, borderWidth: e.target.value })}
                            placeholder="0 or 1px"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-400 mb-1">Border Style</label>
                          <select
                            value={cssFields.borderStyle}
                            onChange={(e) => setCssFields({ ...cssFields, borderStyle: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none"
                          >
                            <option value="">Default</option>
                            <option value="none">None</option>
                            <option value="solid">Solid</option>
                            <option value="dashed">Dashed</option>
                            <option value="dotted">Dotted</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs text-gray-400 mb-1">Border Color</label>
                          <div className="flex gap-1">
                            <input
                              type="color"
                              value={cssFields.borderColor || '#e5e7eb'}
                              onChange={(e) => setCssFields({ ...cssFields, borderColor: e.target.value })}
                              className="w-8 h-9 rounded border border-gray-300 cursor-pointer"
                            />
                            <input
                              type="text"
                              value={cssFields.borderColor}
                              onChange={(e) => setCssFields({ ...cssFields, borderColor: e.target.value })}
                              placeholder="#e5e7eb"
                              className="flex-1 px-2 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-xs text-gray-400 mb-1">Border Spacing</label>
                          <input
                            type="text"
                            value={cssFields.borderSpacing}
                            onChange={(e) => setCssFields({ ...cssFields, borderSpacing: e.target.value })}
                            placeholder="0px"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none"
                          />
                        </div>
                      </div>
                      
                      {/* Border shorthand (for advanced) */}
                      <div>
                        <label className="block text-xs text-gray-400 mb-1">Border (shorthand)</label>
                        <input
                          type="text"
                          value={cssFields.border}
                          onChange={(e) => setCssFields({ ...cssFields, border: e.target.value })}
                          placeholder="0 or 1px solid #ccc"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none"
                        />
                      </div>
                      
                      {/* Table-specific attributes row */}
                      <div className="grid grid-cols-3 gap-4">
                        {targetCssTagName === 'table' && (
                          <div>
                            <label className="block text-xs text-gray-400 mb-1">Border Collapse</label>
                            <select
                              value={cssFields.borderCollapse}
                              onChange={(e) => setCssFields({ ...cssFields, borderCollapse: e.target.value })}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none"
                            >
                              <option value="">Default</option>
                              <option value="collapse">Collapse</option>
                              <option value="separate">Separate</option>
                            </select>
                          </div>
                        )}
                        <div>
                          <label className="block text-xs text-gray-400 mb-1">Cell Spacing</label>
                          <input
                            type="text"
                            value={cssFields.cellSpacing}
                            onChange={(e) => setCssFields({ ...cssFields, cellSpacing: e.target.value })}
                            placeholder="0"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-400 mb-1">Cell Padding</label>
                          <input
                            type="text"
                            value={cssFields.cellPadding}
                            onChange={(e) => setCssFields({ ...cssFields, cellPadding: e.target.value })}
                            placeholder="0"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none"
                          />
                        </div>
                        {(targetCssTagName === 'td' || targetCssTagName === 'th') && (
                          <div>
                            <label className="block text-xs text-gray-400 mb-1">Colspan</label>
                            <input
                              type="number"
                              value={cssFields.colspan}
                              onChange={(e) => setCssFields({ ...cssFields, colspan: e.target.value })}
                              placeholder="1"
                              min="1"
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none"
                            />
                          </div>
                        )}
                      </div>
                      
                      {/* Width and Height HTML Attributes for TABLE and TD */}
                      {(targetCssTagName === 'table' || targetCssTagName === 'td' || targetCssTagName === 'th') && (
                        <div className="grid grid-cols-2 gap-4 mt-4">
                          <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">Width Attribute</label>
                            <input
                              type="text"
                              value={cssFields.attrWidth}
                              onChange={(e) => setCssFields({ ...cssFields, attrWidth: e.target.value })}
                              placeholder="50%"
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none"
                            />
                            <p className="text-xs text-gray-400 mt-1">HTML width attribute (e.g., 50%, 700px)</p>
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">Height Attribute</label>
                            <input
                              type="text"
                              value={cssFields.attrHeight}
                              onChange={(e) => setCssFields({ ...cssFields, attrHeight: e.target.value })}
                              placeholder="50%"
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none"
                            />
                            <p className="text-xs text-gray-400 mt-1">HTML height attribute (e.g., 50%, 200px)</p>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Advanced CSS Toggle */}
                  <button
                    onClick={() => setShowAdvancedCss(true)}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-purple-400 hover:text-purple-600 transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    <span className="font-medium">Advanced CSS Editor</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <button
                      onClick={() => setShowAdvancedCss(false)}
                      className="flex items-center gap-2 text-sm text-purple-600 hover:text-purple-800 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                      Back to Basic Editor
                    </button>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      CSS Styles
                    </label>
                    <textarea
                      value={cssEditInput}
                      onChange={(e) => setCssEditInput(e.target.value)}
                      placeholder="color: #333333;
font-size: 16px;
padding: 10px 20px;
background-color: #ffffff;"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-all font-mono text-sm"
                      rows={12}
                      autoFocus
                    />
                  </div>
                </div>
              )}
            </div>
            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-end gap-3 flex-shrink-0">
              <button
                onClick={() => {
                  setShowCssEditModal(false);
                  setCssEditInput('');
                  setTargetCssSelector(null);
                  setTargetCssTagName('');
                  setShowAdvancedCss(false);
                }}
                className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (targetCssSelector) {
                    let finalCss = '';
                    
                    if (showAdvancedCss) {
                      // Use the raw CSS from textarea
                      finalCss = cssEditInput
                        .split('\n')
                        .map(line => line.trim())
                        .filter(line => line)
                        .join(' ')
                        .replace(/;\s*/g, '; ')
                        .trim();
                    } else {
                      // Parse existing styles to preserve properties not in our form
                      const existingStyles: Record<string, string> = {};
                      cssEditInput.split(';').forEach(rule => {
                        const [prop, val] = rule.split(':').map(s => s.trim());
                        if (prop && val) {
                          existingStyles[prop.toLowerCase()] = val;
                        }
                      });
                      
                      // Properties handled by our form (will be replaced/removed)
                      const formProperties = [
                        'padding', 'padding-top', 'padding-right', 'padding-bottom', 'padding-left',
                        'margin', 'margin-top', 'margin-right', 'margin-bottom', 'margin-left',
                        'font-size', 'width', 'height', 'background-color', 'background', 'color', 
                        'border-spacing', 'border', 'border-width', 'border-style', 'border-color', 'border-collapse'
                      ];
                      
                      // Keep existing styles that are NOT handled by our form
                      const preservedStyles: string[] = [];
                      Object.entries(existingStyles).forEach(([prop, val]) => {
                        if (!formProperties.includes(prop)) {
                          preservedStyles.push(`${prop}: ${val}`);
                        }
                      });
                      
                      // Build CSS from form fields
                      const cssProps: string[] = [...preservedStyles];
                      if (cssFields.paddingTop) cssProps.push(`padding-top: ${cssFields.paddingTop}`);
                      if (cssFields.paddingRight) cssProps.push(`padding-right: ${cssFields.paddingRight}`);
                      if (cssFields.paddingBottom) cssProps.push(`padding-bottom: ${cssFields.paddingBottom}`);
                      if (cssFields.paddingLeft) cssProps.push(`padding-left: ${cssFields.paddingLeft}`);
                      if (cssFields.marginTop) cssProps.push(`margin-top: ${cssFields.marginTop}`);
                      if (cssFields.marginRight) cssProps.push(`margin-right: ${cssFields.marginRight}`);
                      if (cssFields.marginBottom) cssProps.push(`margin-bottom: ${cssFields.marginBottom}`);
                      if (cssFields.marginLeft) cssProps.push(`margin-left: ${cssFields.marginLeft}`);
                      if (cssFields.fontSize) cssProps.push(`font-size: ${cssFields.fontSize}`);
                      if (cssFields.width) cssProps.push(`width: ${cssFields.width}`);
                      if (cssFields.height) cssProps.push(`height: ${cssFields.height}`);
                      if (cssFields.backgroundColor) cssProps.push(`background-color: ${cssFields.backgroundColor}`);
                      if (cssFields.color) cssProps.push(`color: ${cssFields.color}`);
                      if (cssFields.borderSpacing) cssProps.push(`border-spacing: ${cssFields.borderSpacing}`);
                      if (cssFields.border) cssProps.push(`border: ${cssFields.border}`);
                      if (cssFields.borderWidth) cssProps.push(`border-width: ${cssFields.borderWidth}`);
                      if (cssFields.borderStyle) cssProps.push(`border-style: ${cssFields.borderStyle}`);
                      if (cssFields.borderColor) cssProps.push(`border-color: ${cssFields.borderColor}`);
                      if (cssFields.borderCollapse) cssProps.push(`border-collapse: ${cssFields.borderCollapse}`);
                      finalCss = cssProps.join('; ') + (cssProps.length ? ';' : '');
                    }
                    
                    // Apply styles and colspan in one update to avoid stale state issues
                    try {
                      const parser = new DOMParser();
                      const doc = parser.parseFromString(html || '<!doctype html><html><body></body></html>', 'text/html');
                      const targetEl = doc.querySelector(targetCssSelector);
                      
                      if (targetEl) {
                        // Apply CSS styles
                        (targetEl as HTMLElement).style.cssText = finalCss;
                        
                        // Handle colspan attribute for TD/TH
                        if ((targetCssTagName === 'td' || targetCssTagName === 'th') && cssFields.colspan) {
                          (targetEl as HTMLTableCellElement).colSpan = parseInt(cssFields.colspan) || 1;
                        }
                        
                        // Handle width and height HTML attributes for TABLE and TD/TH
                        if (targetCssTagName === 'table' || targetCssTagName === 'td' || targetCssTagName === 'th') {
                          if (cssFields.attrWidth !== undefined) {
                            if (cssFields.attrWidth === '') {
                              targetEl.removeAttribute('width');
                            } else {
                              targetEl.setAttribute('width', cssFields.attrWidth);
                            }
                          }
                          if (cssFields.attrHeight !== undefined) {
                            if (cssFields.attrHeight === '') {
                              targetEl.removeAttribute('height');
                            } else {
                              targetEl.setAttribute('height', cssFields.attrHeight);
                            }
                          }
                        }
                        
                        // Handle table attributes (cellspacing, cellpadding, border)
                        if (targetCssTagName === 'table') {
                          const tableEl = targetEl as HTMLTableElement;
                          if (cssFields.cellSpacing !== undefined) {
                            if (cssFields.cellSpacing === '' || cssFields.cellSpacing === '0') {
                              tableEl.removeAttribute('cellspacing');
                              tableEl.setAttribute('cellspacing', '0');
                            } else {
                              tableEl.setAttribute('cellspacing', cssFields.cellSpacing);
                            }
                          }
                          if (cssFields.cellPadding !== undefined) {
                            if (cssFields.cellPadding === '' || cssFields.cellPadding === '0') {
                              tableEl.removeAttribute('cellpadding');
                              tableEl.setAttribute('cellpadding', '0');
                            } else {
                              tableEl.setAttribute('cellpadding', cssFields.cellPadding);
                            }
                          }
                        }
                        
                        const nextHtml = '<!doctype html>' + doc.documentElement.outerHTML;
                        setHtml(nextHtml);
                      } else {
                        console.error('Element not found with selector:', targetCssSelector);
                      }
                    } catch (e) {
                      console.error('Failed to apply styles:', e);
                    }
                    
                    setShowCssEditModal(false);
                    setCssEditInput('');
                    setTargetCssSelector(null);
                    setTargetCssTagName('');
                    setShowAdvancedCss(false);
                  }
                }}
                className="px-4 py-2 bg-gradient-to-r from-pink-600 to-purple-600 text-white rounded-lg hover:from-pink-700 hover:to-purple-700 transition-all font-medium"
              >
                Apply Styles
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">Share Preview</h2>
              <button
                onClick={() => {
                  setShowShareModal(false);
                  setShareUrl('');
                }}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="px-6 py-4">
              <p className="text-sm text-gray-600 mb-4">
                Share this link with others to let them preview your email template. Anyone with this link can view the preview.
              </p>
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={shareUrl}
                  readOnly
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                />
                <button
                  onClick={handleCopyShareLink}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
                >
                  Copy Link
                </button>
              </div>
              <div className="mt-4 flex justify-end">
                <button
                  onClick={() => {
                    setShowShareModal(false);
                    setShareUrl('');
                  }}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


