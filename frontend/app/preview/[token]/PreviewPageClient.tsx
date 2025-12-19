'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../../providers/AuthProvider';
import axios from 'axios';
import Link from 'next/link';
import ConfirmDialog from '../../../components/ConfirmDialog';

interface PreviewPageClientProps {
  html: string;
  shareToken: string;
}

interface Comment {
  _id: string;
  userId?: string;
  userName: string;
  comment: string;
  position: {
    x: number;
    y: number;
    elementSelector?: string;
  };
  createdAt: string;
  deleted?: boolean;
  resolved?: boolean;
}

interface User {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  role?: 'user' | 'admin';
}

export default function PreviewPageClient({ html, shareToken }: PreviewPageClientProps) {
  // Auth is optional for preview page (public access)
  let user: User | null = null;
  let token: string | null = null;
  try {
    const auth = useAuth();
    user = auth?.user || null;
    token = auth?.token || null;
  } catch (error) {
    // Auth not available (not wrapped in AuthProvider or not logged in)
    user = null;
    token = null;
  }
  const [previewMode, setPreviewMode] = useState<'mobile' | 'tablet' | 'desktop'>('desktop');
  const [previewZoom, setPreviewZoom] = useState(100);
  const [comments, setComments] = useState<Comment[]>([]);
  const [showCommentModal, setShowCommentModal] = useState(false);
  const [selectedPosition, setSelectedPosition] = useState<{ x: number; y: number; elementSelector?: string } | null>(null);
  const [commentText, setCommentText] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  const [hoveredComment, setHoveredComment] = useState<string | null>(null);
  const [commentMode, setCommentMode] = useState(false);
  const [showAllComments, setShowAllComments] = useState(true); // Active by default
  const [showTimeline, setShowTimeline] = useState(false); // Timeline view
  const [deletedComments, setDeletedComments] = useState<Comment[]>([]); // Track deleted comments
  const [resolvedComments, setResolvedComments] = useState<Set<string>>(new Set()); // Track resolved comment IDs
  const [timelinePosition, setTimelinePosition] = useState({ x: 0, y: 0 });
  const [timelineSize, setTimelineSize] = useState<{ width: number; height: number | string }>({ width: 500, height: '100%' });
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const timelineRef = useRef<HTMLDivElement>(null);
  const [deleteConfirmDialog, setDeleteConfirmDialog] = useState<{
    isOpen: boolean;
    commentId: string | null;
  }>({
    isOpen: false,
    commentId: null,
  });
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const previewContainerRef = useRef<HTMLDivElement>(null);

  const previewStyles = {
    mobile: { width: '375px', maxWidth: '100%' },
    tablet: { width: '768px', maxWidth: '100%' },
    desktop: { width: '100%', maxWidth: '100%' },
  };


  // Fetch comments
  const fetchComments = useCallback(async () => {
    try {
      const response = await axios.get(`/api/comments/${shareToken}`);
      const fetchedComments = response.data.comments || [];
      
      // Separate active and deleted comments
      const activeComments = fetchedComments.filter((c: Comment) => !c.deleted);
      const deletedComments = fetchedComments.filter((c: Comment) => c.deleted);
      
      setComments(activeComments);
      setDeletedComments(deletedComments);
      
      // Load resolved status from database
      const resolvedIds = new Set<string>();
      fetchedComments.forEach((comment: Comment) => {
        if (comment.resolved) {
          resolvedIds.add(comment._id);
        }
      });
      setResolvedComments(resolvedIds);
    } catch (error) {
      console.error('Failed to fetch comments:', error);
    }
  }, [shareToken]);

  // Get all comments including deleted ones
  const getAllComments = useCallback(() => {
    const activeComments = comments.map(c => ({ 
      ...c, 
      deleted: false,
      resolved: c.resolved || resolvedComments.has(c._id)
    }));
    const deleted = deletedComments.map(c => ({ 
      ...c, 
      deleted: true,
      resolved: c.resolved || resolvedComments.has(c._id)
    }));
    return [...activeComments, ...deleted].sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [comments, deletedComments, resolvedComments]);

  // Mark comment as resolved
  const markAsResolved = useCallback(async (commentId: string) => {
    if (!token) {
      alert('You must be logged in to resolve comments');
      return;
    }

    try {
      await axios.put(
        `/api/comments/${shareToken}/${commentId}/resolve`,
        { resolved: true },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      // Update local state
      setResolvedComments(prev => new Set([...Array.from(prev), commentId]));
      setComments(prevComments =>
        prevComments.map(c => (c._id === commentId ? { ...c, resolved: true } : c))
      );
      setDeletedComments(prevDeleted =>
        prevDeleted.map(c => (c._id === commentId ? { ...c, resolved: true } : c))
      );
    } catch (error: any) {
      console.error('Failed to resolve comment:', error);
      alert(error.response?.data?.error || 'Failed to resolve comment');
    }
  }, [shareToken, token]);

  // Unmark comment as resolved
  const markAsUnresolved = useCallback(async (commentId: string) => {
    if (!token) {
      alert('You must be logged in to unresolve comments');
      return;
    }

    try {
      await axios.put(
        `/api/comments/${shareToken}/${commentId}/resolve`,
        { resolved: false },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      // Update local state
      setResolvedComments(prev => {
        const newSet = new Set(Array.from(prev));
        newSet.delete(commentId);
        return newSet;
      });
      setComments(prevComments =>
        prevComments.map(c => (c._id === commentId ? { ...c, resolved: false } : c))
      );
      setDeletedComments(prevDeleted =>
        prevDeleted.map(c => (c._id === commentId ? { ...c, resolved: false } : c))
      );
    } catch (error: any) {
      console.error('Failed to unresolve comment:', error);
      alert(error.response?.data?.error || 'Failed to unresolve comment');
    }
  }, [shareToken, token]);

  useEffect(() => {
    if (shareToken) {
      fetchComments();
    }
  }, [shareToken, fetchComments]);

  // Initialize timeline height when shown
  useEffect(() => {
    if (showTimeline && timelineRef.current) {
      const container = timelineRef.current.parentElement;
      if (container && typeof timelineSize.height === 'string') {
        const containerHeight = container.getBoundingClientRect().height;
        setTimelineSize(prev => ({ ...prev, height: containerHeight }));
      }
    }
  }, [showTimeline, timelineSize.height]);

  // Handle timeline dragging
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging && timelineRef.current) {
        const container = timelineRef.current.parentElement;
        if (container) {
          const containerRect = container.getBoundingClientRect();
          const newX = e.clientX - dragStart.x;
          const newY = e.clientY - dragStart.y;
          
          // Constrain within container bounds
          const currentHeight = typeof timelineSize.height === 'string' 
            ? containerRect.height 
            : timelineSize.height;
          const maxX = containerRect.width - timelineSize.width;
          const maxY = containerRect.height - currentHeight;
          
          setTimelinePosition({
            x: Math.max(0, Math.min(newX, maxX)),
            y: Math.max(0, Math.min(newY, maxY)),
          });
        }
      }
      
      if (isResizing && timelineRef.current) {
        const container = timelineRef.current.parentElement;
        if (container) {
          const containerRect = container.getBoundingClientRect();
          const startHeight = typeof timelineSize.height === 'string' 
            ? containerRect.height 
            : timelineSize.height;
          const deltaY = e.clientY - dragStart.y;
          const newHeight = startHeight + deltaY;
          
          // Constrain height between min and max
          const minHeight = 200;
          const maxHeight = containerRect.height - timelinePosition.y;
          const constrainedHeight = Math.max(minHeight, Math.min(newHeight, maxHeight));
          
          setTimelineSize(prev => ({
            ...prev,
            height: constrainedHeight,
          }));
        }
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      setIsResizing(false);
    };

    if (isDragging || isResizing) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, isResizing, dragStart, timelineSize, timelinePosition]);

  // Delete comment directly (without confirmation)
  const deleteCommentDirectly = useCallback(async (commentId: string) => {
    if (!token) {
      alert('You must be logged in to delete comments');
      return;
    }

    try {
      await axios.delete(
        `/api/comments/${shareToken}/${commentId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      // Refresh comments from database to get updated deleted status
      await fetchComments();
      setHoveredComment(null); // Close tooltip after deletion
    } catch (error: any) {
      console.error('Failed to delete comment:', error);
      alert(error.response?.data?.error || 'Failed to delete comment');
    }
  }, [shareToken, token, fetchComments]);

  // Inject comment markers into iframe
  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe || comments.length === 0) return;

    const injectMarkers = () => {
      try {
        const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
        if (!iframeDoc || !iframeDoc.body) return;

        // Remove existing markers and clean up
        const existingMarkers = iframeDoc.querySelectorAll('.comment-marker-injected');
        existingMarkers.forEach(marker => {
          // Remove highlight from parent element if it's a target element
          const parent = marker.parentElement;
          if (parent && marker.getAttribute('data-target-element') === 'true') {
            parent.classList.remove('comment-target-highlight');
          }
          // Clean up event listeners
          if ((marker as any).__cleanup) {
            (marker as any).__cleanup();
          }
          marker.remove();
        });
        
        // Remove tooltips from body
        const existingTooltips = iframeDoc.querySelectorAll('.comment-tooltip-injected');
        existingTooltips.forEach(tooltip => {
          // Clean up event listeners
          if ((tooltip as any).__cleanup) {
            (tooltip as any).__cleanup();
          }
          tooltip.remove();
        });
        
        // Remove wrapper divs
        const wrappers = iframeDoc.querySelectorAll('.comment-marker-wrapper');
        wrappers.forEach(wrapper => wrapper.remove());
        
        // Clean up any remaining highlight classes
        const highlightedElements = iframeDoc.querySelectorAll('.comment-target-highlight');
        highlightedElements.forEach(el => {
          // Only remove if no marker is present
          if (!el.querySelector('.comment-marker-injected')) {
            el.classList.remove('comment-target-highlight');
          }
        });

        // Inject styles if not already present
        if (!iframeDoc.getElementById('comment-marker-styles')) {
          const style = iframeDoc.createElement('style');
          style.id = 'comment-marker-styles';
          style.textContent = `
            .comment-marker-injected {
              position: absolute;
              top: 8px;
              right: 8px;
              z-index: 10000;
              pointer-events: auto;
              cursor: pointer;
            }
            .comment-marker-pin {
              width: 24px;
              height: 24px;
              background: #4f46e5;
              border-radius: 50%;
              border: 2px solid white;
              box-shadow: 0 2px 8px rgba(0,0,0,0.3);
              display: flex;
              align-items: center;
              justify-content: center;
              transition: background 0.2s;
            }
            .comment-marker-pin:hover {
              background: #4338ca;
            }
            .comment-marker-pin svg {
              width: 16px;
              height: 16px;
              color: white;
            }
            .comment-target-highlight {
              position: relative;
              outline: 2px solid #4f46e5 !important;
              outline-offset: 2px;
              background-color: rgba(79, 70, 229, 0.1) !important;
              transition: all 0.2s ease;
            }
            .comment-target-highlight:hover {
              outline-color: #4338ca !important;
              background-color: rgba(79, 70, 229, 0.15) !important;
            }
            .comment-tooltip-injected {
              position: fixed;
              width: 256px;
              padding: 12px;
              border-radius: 8px;
              box-shadow: 0 4px 12px rgba(0,0,0,0.3);
              z-index: 10001;
              pointer-events: auto;
              color: white;
              font-family: system-ui, -apple-system, sans-serif;
              transform: translate(-50%, calc(-100% - 12px));
              transition: all 0.2s ease;
            }
            .comment-tooltip-injected.hovered {
              z-index: 10002;
              box-shadow: 0 8px 24px rgba(0,0,0,0.4);
              transform: translate(-50%, calc(-100% - 12px)) scale(1.05);
            }
            .comment-tooltip-header {
              display: flex;
              align-items: start;
              justify-content: space-between;
              margin-bottom: 8px;
              gap: 8px;
            }
            .comment-tooltip-user {
              font-size: 12px;
              font-weight: 600;
              opacity: 0.9;
              flex: 1;
            }
            .comment-tooltip-close {
              transition: color 0.2s;
              flex-shrink: 0;
              padding: 4px;
              cursor: pointer;
              border-radius: 4px;
              display: flex;
              align-items: center;
              justify-content: center;
              min-width: 20px;
              min-height: 20px;
            }
            .comment-tooltip-close:hover {
              background: rgba(255,255,255,0.2);
            }
            .comment-tooltip-text {
              font-size: 14px;
            }
            .comment-tooltip-arrow {
              position: absolute;
              left: 50%;
              bottom: 0;
              transform: translate(-50%, 100%);
              width: 0;
              height: 0;
              border-left: 8px solid transparent;
              border-right: 8px solid transparent;
              border-top: 8px solid;
            }
          `;
          iframeDoc.head.appendChild(style);
        }

        // Get all comments including deleted ones
        const allCommentsList = getAllComments();
        
        // Inject markers only for non-deleted comments (deleted comments still show in timeline)
        const activeCommentsForMarkers = allCommentsList.filter(c => !c.deleted);
        
        activeCommentsForMarkers.forEach((comment, index) => {
          const markerContainer = iframeDoc.createElement('div');
          markerContainer.className = 'comment-marker-injected';
          markerContainer.setAttribute('data-comment-id', comment._id);
          
          let targetElement: Element | null = null;
          let parentElement: Element = iframeDoc.body;
          
          // Try to find target element if selector exists
          if (comment.position.elementSelector) {
            try {
              targetElement = iframeDoc.querySelector(comment.position.elementSelector);
              if (targetElement) {
                parentElement = targetElement;
                // Make target element position relative if not already
                const computedStyle = iframeDoc.defaultView?.getComputedStyle(targetElement as HTMLElement);
                if (computedStyle && computedStyle.position === 'static') {
                  (targetElement as HTMLElement).style.position = 'relative';
                }
                // Store reference to target element on marker for cleanup
                markerContainer.setAttribute('data-target-element', 'true');
              }
            } catch (error) {
              console.error('Error finding target element:', error);
            }
          }

          // Fallback: create a wrapper div at the click position
          if (!targetElement) {
            const wrapper = iframeDoc.createElement('div');
            wrapper.style.position = 'absolute';
            wrapper.style.left = `${comment.position.x}px`;
            wrapper.style.top = `${comment.position.y}px`;
            wrapper.style.width = '1px';
            wrapper.style.height = '1px';
            wrapper.style.pointerEvents = 'none';
            wrapper.className = 'comment-marker-wrapper';
            iframeDoc.body.appendChild(wrapper);
            parentElement = wrapper;
            // Make wrapper position relative for marker positioning
            wrapper.style.position = 'relative';
          }

          // Create pin
          const commentIsDeleted = comment.deleted || false;
          const pin = iframeDoc.createElement('div');
          pin.className = 'comment-marker-pin';
          if (commentIsDeleted) {
            pin.style.opacity = '0.5';
            pin.style.cursor = 'default';
          }
          pin.innerHTML = `
            <svg fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
            </svg>
          `;

          // Handle hover - highlight target element and show tooltip
          pin.addEventListener('mouseenter', () => {
            setHoveredComment(comment._id);
            // Ensure target element is highlighted
            const parent = markerContainer.parentElement;
            if (parent && markerContainer.getAttribute('data-target-element') === 'true') {
              parent.classList.add('comment-target-highlight');
            }
            // Show tooltip on hover (additional to existing functionality)
            const tooltipEl = iframeDoc.querySelector(`[data-tooltip-id="${comment._id}"]`) as HTMLElement;
            if (tooltipEl) {
              tooltipEl.style.display = 'block';
              tooltipEl.classList.add('hovered');
              updateTooltipPosition();
            }
          });

          pin.addEventListener('mouseleave', () => {
            // Delay to allow moving to tooltip
            setTimeout(() => {
              const tooltipEl = iframeDoc.querySelector(`[data-tooltip-id="${comment._id}"]`) as HTMLElement;
              if (!tooltipEl || !tooltipEl.matches(':hover')) {
                setHoveredComment(null);
                // Remove highlight when not hovering
                const parent = markerContainer.parentElement;
                if (parent && markerContainer.getAttribute('data-target-element') === 'true') {
                  parent.classList.remove('comment-target-highlight');
                }
                // Hide tooltip if showAllComments is false, otherwise keep it visible
                if (tooltipEl) {
                  tooltipEl.classList.remove('hovered');
                  if (!showAllComments) {
                    tooltipEl.style.display = 'none';
                  }
                }
              }
            }, 100);
          });

          markerContainer.appendChild(pin);
          parentElement.appendChild(markerContainer);

          // Create tooltip in iframe body (not inside target element)
          const tooltip = iframeDoc.createElement('div');
          tooltip.className = 'comment-tooltip-injected';
          tooltip.setAttribute('data-tooltip-id', comment._id);
          tooltip.setAttribute('data-marker-id', comment._id);
          const tooltipIsDeleted = comment.deleted || false;
          // Show tooltip if showAllComments is true OR if it's being hovered
          tooltip.style.display = (showAllComments || hoveredComment === comment._id) ? 'block' : 'none';
          if (tooltipIsDeleted) {
            tooltip.style.opacity = '0.5';
            tooltip.style.pointerEvents = 'none';
          }

          const isResolved = comment.resolved || false;
          
          // Use green gradient for resolved comments, otherwise use normal gradients
          const resolvedGradient = 'linear-gradient(135deg, #059669 0%, #047857 100%)';
          const resolvedArrowColor = '#059669';
          
          const gradients = [
            'linear-gradient(135deg, #1f2937 0%, #111827 100%)',
            'linear-gradient(135deg, #3730a3 0%, #312e81 100%)',
            'linear-gradient(135deg, #6b21a8 0%, #581c87 100%)',
            'linear-gradient(135deg, #9d174d 0%, #831843 100%)',
            'linear-gradient(135deg, #1e40af 0%, #1e3a8a 100%)',
            'linear-gradient(135deg, #0f766e 0%, #134e4a 100%)',
          ];
          const arrowColors = ['#1f2937', '#3730a3', '#6b21a8', '#9d174d', '#1e40af', '#0f766e'];
          const gradientIndex = index % gradients.length;
          
          tooltip.style.background = isResolved ? resolvedGradient : gradients[gradientIndex];

          const userId = user?.id || (user as any)?._id;
          const canDelete = !tooltipIsDeleted && user && comment.userId && token && userId && 
            String(userId) === String(comment.userId);

          tooltip.innerHTML = `
            <div class="comment-tooltip-header">
              <div class="comment-tooltip-user">${comment.userName}${tooltipIsDeleted ? ' (Deleted)' : ''}</div>
              ${!tooltipIsDeleted ? `<div class="comment-tooltip-close" style="color: ${canDelete ? '#fca5a5' : 'white'};" data-action="${canDelete ? 'delete' : 'close'}">
                <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>` : ''}
            </div>
            <div class="comment-tooltip-text" style="${tooltipIsDeleted ? 'text-decoration: line-through; opacity: 0.7;' : ''}">${comment.comment}</div>
            <div class="comment-tooltip-arrow" style="border-top-color: ${isResolved ? resolvedArrowColor : arrowColors[gradientIndex]};"></div>
          `;

          // Function to update tooltip position based on marker position
          const updateTooltipPosition = () => {
            try {
              const markerRect = markerContainer.getBoundingClientRect();
              // Position tooltip above marker, centered horizontally
              tooltip.style.left = `${markerRect.left + (markerRect.width / 2)}px`;
              tooltip.style.top = `${markerRect.top}px`;
            } catch (error) {
              console.error('Error updating tooltip position:', error);
            }
          };

          // Update position initially
          updateTooltipPosition();

          // Handle tooltip hover - keep highlight active
          tooltip.addEventListener('mouseenter', () => {
            setHoveredComment(comment._id);
            // Keep target element highlighted
            const parent = markerContainer.parentElement;
            if (parent && markerContainer.getAttribute('data-target-element') === 'true') {
              parent.classList.add('comment-target-highlight');
            }
            // Add hovered class for enhanced styling
            tooltip.classList.add('hovered');
            updateTooltipPosition();
          });

          tooltip.addEventListener('mouseleave', () => {
            setHoveredComment(null);
            // Remove highlight when leaving tooltip
            const parent = markerContainer.parentElement;
            if (parent && markerContainer.getAttribute('data-target-element') === 'true') {
              parent.classList.remove('comment-target-highlight');
            }
            // Remove hovered class
            tooltip.classList.remove('hovered');
            // Hide tooltip if showAllComments is false
            if (!showAllComments) {
              tooltip.style.display = 'none';
            }
          });

          // Handle close/delete button (only if not deleted)
          if (!tooltipIsDeleted) {
            const closeBtn = tooltip.querySelector('.comment-tooltip-close');
            if (closeBtn) {
              closeBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                if (canDelete) {
                  deleteCommentDirectly(comment._id);
                } else {
                  setHoveredComment(null);
                }
              });
            }
          }

          // Append tooltip to iframe body
          iframeDoc.body.appendChild(tooltip);

          // Update position on scroll and resize (only when tooltips are visible)
          const handlePositionUpdate = () => {
            if (showAllComments) {
              updateTooltipPosition();
            }
          };
          iframe.contentWindow?.addEventListener('scroll', handlePositionUpdate, true);
          window.addEventListener('resize', handlePositionUpdate);

          // Store cleanup function
          (tooltip as any).__cleanup = () => {
            iframe.contentWindow?.removeEventListener('scroll', handlePositionUpdate, true);
            window.removeEventListener('resize', handlePositionUpdate);
          };
        });

        // Remove markers and tooltips for deleted comments
        const allCommentsForUpdate = getAllComments();
        const activeCommentIds = new Set(
          allCommentsForUpdate.filter(c => !c.deleted).map(c => c._id)
        );
        
        // Remove markers for deleted comments
        const markers = iframeDoc.querySelectorAll('.comment-marker-injected');
        markers.forEach((marker: Element) => {
          const commentId = marker.getAttribute('data-comment-id');
          if (commentId && !activeCommentIds.has(commentId)) {
            // Comment is deleted, remove marker and its wrapper if it's a wrapper
            const parent = marker.parentElement;
            marker.remove();
            // If parent is a wrapper div, remove it too
            if (parent && parent.classList.contains('comment-marker-wrapper')) {
              parent.remove();
            }
          }
        });
        
        // Remove tooltips for deleted comments
        const tooltips = iframeDoc.querySelectorAll('.comment-tooltip-injected');
        tooltips.forEach((tooltip: Element) => {
          const commentId = tooltip.getAttribute('data-tooltip-id');
          if (commentId && !activeCommentIds.has(commentId)) {
            // Cleanup event listeners if stored
            if ((tooltip as any).__cleanup) {
              (tooltip as any).__cleanup();
            }
            tooltip.remove();
          }
        });
        
        // Update highlights and tooltip visibility/positions for remaining active comments
        const remainingMarkers = iframeDoc.querySelectorAll('.comment-marker-injected');
        remainingMarkers.forEach((marker: Element) => {
          const commentId = marker.getAttribute('data-comment-id');
          const parent = marker.parentElement;
          const tooltip = iframeDoc.querySelector(`[data-tooltip-id="${commentId}"]`) as HTMLElement;
          const commentForUpdate = allCommentsForUpdate.find(c => c._id === commentId);
          const markerIsResolved = commentForUpdate?.resolved || false;
          
          if (tooltip) {
            // Show/hide tooltips based on showAllComments state OR hover state
            const isHovered = hoveredComment === commentId;
            tooltip.style.display = (showAllComments || isHovered) ? 'block' : 'none';
            
            // Add/remove hovered class for enhanced styling
            if (isHovered) {
              tooltip.classList.add('hovered');
            } else {
              tooltip.classList.remove('hovered');
            }
            
            // Update resolved state styling - green gradient for resolved
            if (markerIsResolved) {
              tooltip.style.background = 'linear-gradient(135deg, #059669 0%, #047857 100%)';
              const arrow = tooltip.querySelector('.comment-tooltip-arrow') as HTMLElement;
              if (arrow) {
                arrow.style.borderTopColor = '#059669';
              }
            }
            
            // Update tooltip position when visible
            if (showAllComments || isHovered) {
              try {
                const markerRect = marker.getBoundingClientRect();
                tooltip.style.left = `${markerRect.left + (markerRect.width / 2)}px`;
                tooltip.style.top = `${markerRect.top}px`;
              } catch (error) {
                console.error('Error updating tooltip position:', error);
              }
            }
          }
          
          // Update highlight based on hover state
          if (parent && marker.getAttribute('data-target-element') === 'true') {
            if (hoveredComment === commentId) {
              parent.classList.add('comment-target-highlight');
            } else {
              parent.classList.remove('comment-target-highlight');
            }
          }
        });
      } catch (error) {
        console.error('Error injecting markers:', error);
      }
    };

    // Wait for iframe to load
    if (iframe) {
      if (iframe.contentDocument?.readyState === 'complete') {
        injectMarkers();
      } else {
        iframe.addEventListener('load', injectMarkers);
        return () => iframe.removeEventListener('load', injectMarkers);
      }
    }

    // Re-inject when comments, hover state, showAllComments, or resolved state changes
    const timeoutId = setTimeout(injectMarkers, 100);
    return () => {
      clearTimeout(timeoutId);
    };
  }, [comments, deletedComments, resolvedComments, hoveredComment, user, token, html, deleteCommentDirectly, previewZoom, showAllComments, getAllComments]);

  // Get element selector at a point
  const getElementSelector = useCallback((iframe: HTMLIFrameElement, x: number, y: number): string | null => {
    try {
      const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
      if (!iframeDoc) return null;

      const element = iframeDoc.elementFromPoint(x, y);
      if (!element) return null;

      // Generate a simple selector
      const path: string[] = [];
      let current: Element | null = element;

      while (current && current !== iframeDoc.body) {
        let selector = current.tagName.toLowerCase();
        
        if (current.id) {
          selector += `#${current.id}`;
          path.unshift(selector);
          break;
        }
        
        if (current.className && typeof current.className === 'string') {
          const classes = current.className.trim().split(/\s+/).filter(Boolean);
          if (classes.length > 0) {
            selector += '.' + classes[0];
          }
        }

        // Add nth-child if needed for uniqueness
        const parent = current.parentElement;
        if (parent) {
          const siblings = Array.from(parent.children).filter(el => el.tagName === current!.tagName);
          if (siblings.length > 1) {
            const index = siblings.indexOf(current) + 1;
            selector += `:nth-of-type(${index})`;
          }
        }

        path.unshift(selector);
        current = current.parentElement;
      }

      return path.join(' > ') || null;
    } catch (error) {
      console.error('Error getting element selector:', error);
      return null;
    }
  }, []);

  // Handle click on preview to add comment
  const handlePreviewClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!commentMode || !previewContainerRef.current) return;

    // Don't handle clicks on comment markers
    const target = e.target as HTMLElement;
    if (target.closest('.comment-marker') || target.closest('.comment-tooltip')) {
      return;
    }

    const container = previewContainerRef.current;
    const rect = container.getBoundingClientRect();

    // Calculate position relative to container
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Adjust for zoom and get position relative to iframe
    const scale = previewZoom / 100;
    const adjustedX = x / scale;
    const adjustedY = y / scale;

    // Check if click is within preview bounds
    const iframe = iframeRef.current;
    if (iframe) {
      const iframeRect = iframe.getBoundingClientRect();
      const iframeX = e.clientX - iframeRect.left;
      const iframeY = e.clientY - iframeRect.top;

      if (iframeX >= 0 && iframeY >= 0 && iframeX <= iframeRect.width && iframeY <= iframeRect.height) {
        // Get element selector at click position
        const elementSelector = getElementSelector(iframe, iframeX / scale, iframeY / scale);
        
        setSelectedPosition({ 
          x: adjustedX, 
          y: adjustedY,
          elementSelector: elementSelector || undefined
        });
        setShowCommentModal(true);
      }
    }
  }, [previewZoom, commentMode, getElementSelector]);

  // Submit comment
  const handleSubmitComment = async () => {
    if (!commentText.trim() || !selectedPosition) return;

    setSubmittingComment(true);
    try {
      const response = await axios.post(
        `/api/comments/${shareToken}`,
        {
          comment: commentText.trim(),
          position: selectedPosition,
        },
        {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        }
      );

      setComments([response.data.comment, ...comments]);
      setCommentText('');
      setShowCommentModal(false);
      setSelectedPosition(null);
    } catch (error: any) {
      console.error('Failed to submit comment:', error);
      alert(error.response?.data?.error || 'Failed to submit comment');
    } finally {
      setSubmittingComment(false);
    }
  };

  // Delete comment with confirmation dialog
  const handleDeleteComment = (commentId: string) => {
    if (!token) {
      alert('You must be logged in to delete comments');
      return;
    }

    setDeleteConfirmDialog({
      isOpen: true,
      commentId,
    });
  };

  const confirmDeleteComment = async () => {
    if (!deleteConfirmDialog.commentId || !token) return;

    try {
      await axios.delete(
        `/api/comments/${shareToken}/${deleteConfirmDialog.commentId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setComments(comments.filter(c => c._id !== deleteConfirmDialog.commentId));
      setHoveredComment(null); // Close tooltip after deletion
      setDeleteConfirmDialog({ isOpen: false, commentId: null });
    } catch (error: any) {
      console.error('Failed to delete comment:', error);
      alert(error.response?.data?.error || 'Failed to delete comment');
      setDeleteConfirmDialog({ isOpen: false, commentId: null });
    }
  };

  // Get gradient colors for comments
  const getCommentGradient = (index: number) => {
    const gradients = [
      'from-gray-800 to-gray-900',
      'from-indigo-800 to-indigo-900',
      'from-purple-800 to-purple-900',
      'from-pink-800 to-pink-900',
      'from-blue-800 to-blue-900',
      'from-teal-800 to-teal-900',
    ];
    return gradients[index % gradients.length];
  };


  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <Link href="/" className="text-3xl md:text-4xl font-extrabold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                PRZIO
              </Link>
              <p className="text-sm text-gray-600 mt-1">Email Template Preview</p>
            </div>
            
            {/* Preview Controls */}
            <div className="flex items-center space-x-4">
              {/* Preview Mode Selector */}
              <div className="flex items-center space-x-2 bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setPreviewMode('mobile')}
                  className={`px-3 py-1.5 text-xs font-medium rounded transition-colors ${
                    previewMode === 'mobile'
                      ? 'bg-white text-indigo-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Mobile
                </button>
                <button
                  onClick={() => setPreviewMode('tablet')}
                  className={`px-3 py-1.5 text-xs font-medium rounded transition-colors ${
                    previewMode === 'tablet'
                      ? 'bg-white text-indigo-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Tablet
                </button>
                <button
                  onClick={() => setPreviewMode('desktop')}
                  className={`px-3 py-1.5 text-xs font-medium rounded transition-colors ${
                    previewMode === 'desktop'
                      ? 'bg-white text-indigo-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Desktop
                </button>
              </div>

              {/* Zoom Controls */}
              <div className="flex items-center space-x-2 bg-gray-100 rounded-lg px-3 py-1.5">
                <button
                  onClick={() => setPreviewZoom(Math.max(50, previewZoom - 10))}
                  className="text-gray-600 hover:text-gray-900"
                  disabled={previewZoom <= 50}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                  </svg>
                </button>
                <span className="text-sm font-medium text-gray-700 min-w-[3rem] text-center">
                  {previewZoom}%
                </span>
                <button
                  onClick={() => setPreviewZoom(Math.min(200, previewZoom + 10))}
                  className="text-gray-600 hover:text-gray-900"
                  disabled={previewZoom >= 200}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </button>
              </div>

              {/* Comment Mode Toggle */}
              <button
                onClick={() => setCommentMode(!commentMode)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                  commentMode
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
                title={commentMode ? 'Click to disable comment mode' : 'Click to enable comment mode'}
              >
                {commentMode ? (
                  <>
                    <svg className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    Comment Mode ON
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Add Comment
                  </>
                )}
              </button>

              {/* Show All Comments Toggle */}
              {comments.length > 0 && (
                <button
                  onClick={() => setShowAllComments(!showAllComments)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                    showAllComments
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                  title={showAllComments ? 'Hide all comments' : 'Show all comments'}
                >
                  <svg className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  Comments ({comments.length})
                </button>
              )}

              {/* Show Timeline Toggle */}
              {(comments.length > 0 || deletedComments.length > 0) && (
                <button
                  onClick={() => setShowTimeline(!showTimeline)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                    showTimeline
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                  title={showTimeline ? 'Hide timeline' : 'Show timeline'}
                >
                  <svg className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Timeline
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Preview Content */}
      <div className="w-full mx-auto px-4 sm:px-6 lg:px-8 py-8" style={{ height: 'calc(100vh - 200px)', position: 'relative' }}>
        <div className="flex justify-center relative" style={{ height: '100%', position: 'relative' }}>
          {/* Timeline Panel */}
          {showTimeline && (
            <div
              ref={timelineRef}
              className="absolute bg-white rounded-lg shadow-xl border border-gray-200 z-30 flex flex-col"
              style={{
                left: `${timelinePosition.x}px`,
                top: `${timelinePosition.y}px`,
                width: `${timelineSize.width}px`,
                height: typeof timelineSize.height === 'string' ? timelineSize.height : `${timelineSize.height}px`,
                cursor: isDragging ? 'grabbing' : 'default',
              }}
              onMouseDown={(e) => {
                // Only start dragging if clicking on the header
                if ((e.target as HTMLElement).closest('.timeline-header')) {
                  setIsDragging(true);
                  setDragStart({
                    x: e.clientX - timelinePosition.x,
                    y: e.clientY - timelinePosition.y,
                  });
                }
              }}
            >
              {/* Draggable Header */}
              <div 
                className="px-4 py-3 border-b border-gray-200 flex items-center justify-between bg-gradient-to-r from-blue-600 to-indigo-600 timeline-header cursor-grab active:cursor-grabbing rounded-t-lg"
              >
                <h3 className="text-lg font-semibold text-white">Comment Timeline</h3>
                <button
                  onClick={() => setShowTimeline(false)}
                  className="text-white hover:text-gray-200 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="flex-1 p-4" style={{ 
                overflowY: 'auto', 
                height: 'calc(100% - 60px)',
                minHeight: 0 
              }}>
                <div className="relative">
                  {/* Timeline line */}
                  <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-300"></div>
                  
                  {/* Timeline items */}
                  <div className="space-y-4">
                    {getAllComments().map((comment, index) => {
                      const isDeleted = comment.deleted || false;
                      const isResolved = comment.resolved || false;
                      const userId = user?.id || (user as any)?._id;
                      const canDelete = !isDeleted && user && comment.userId && token && userId && 
                        String(userId) === String(comment.userId);
                      
                      return (
                        <div key={comment._id} className="relative flex items-start">
                          {/* Timeline dot */}
                          <div className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center ${
                            isDeleted ? 'bg-gray-400' : 'bg-indigo-600'
                          }`}>
                            <div className={`w-3 h-3 rounded-full ${
                              isDeleted ? 'bg-gray-200' : 'bg-white'
                            }`}></div>
                          </div>
                          
                          {/* Comment card */}
                          <div className={`ml-4 flex-1 rounded-lg p-3 shadow-sm ${
                            isDeleted 
                              ? isResolved
                                ? 'bg-gray-100 opacity-60 border-2 border-green-400'
                                : 'bg-gray-100 opacity-60'
                              : isResolved
                              ? 'bg-gradient-to-br from-green-600 to-green-700 text-white'
                              : `bg-gradient-to-br ${getCommentGradient(index)} text-white`
                          }`}>
                            <div className="flex items-start justify-between mb-2">
                              <div className="text-xs font-semibold opacity-90">
                                {comment.userName}
                                {isDeleted && (
                                  <span className="ml-2 text-xs">
                                    (Deleted)
                                    {isResolved && <span className="ml-1 text-green-600 font-medium">• Marked as Resolved</span>}
                                  </span>
                                )}
                              </div>
                              <div className="text-xs opacity-75">
                                {new Date(comment.createdAt).toLocaleString()}
                              </div>
                            </div>
                            <div className={`text-sm leading-relaxed ${
                              isDeleted ? 'line-through opacity-70' : ''
                            }`}>
                              {comment.comment}
                            </div>
                            <div className="flex items-center gap-2 mt-2">
                              {!isDeleted && (
                                <>
                                  {comment.resolved ? (
                                    <button
                                      onClick={() => markAsUnresolved(comment._id)}
                                      className="text-xs bg-white bg-opacity-20 hover:bg-opacity-30 px-2 py-1 rounded transition-colors"
                                    >
                                      Mark as Unresolved
                                    </button>
                                  ) : (
                                    <button
                                      onClick={() => markAsResolved(comment._id)}
                                      className="text-xs bg-green-500 hover:bg-green-600 px-2 py-1 rounded transition-colors"
                                    >
                                      Mark as Resolved
                                    </button>
                                  )}
                                </>
                              )}
                              {canDelete && !isDeleted && (
                                <button
                                  onClick={() => deleteCommentDirectly(comment._id)}
                                  className="text-xs text-red-200 hover:text-red-100 transition-colors"
                                >
                                  Delete
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
              
              {/* Resize Handle */}
              <div
                className="absolute bottom-0 left-0 right-0 h-2 cursor-ns-resize hover:bg-blue-200 transition-colors"
                onMouseDown={(e) => {
                  e.preventDefault();
                  setIsResizing(true);
                  setDragStart({
                    x: e.clientX,
                    y: e.clientY,
                  });
                }}
                style={{
                  background: isResizing ? 'rgba(59, 130, 246, 0.3)' : 'transparent',
                }}
              />
            </div>
          )}

          {/* All Comments Panel - Hidden as requested */}
          {false && showAllComments && comments.length > 0 && (
            <div className="absolute left-0 top-0 w-80 bg-white rounded-lg shadow-xl border border-gray-200 z-30 max-h-[600px] overflow-hidden flex flex-col">
              <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between bg-gradient-to-r from-purple-600 to-indigo-600">
                <h3 className="text-lg font-semibold text-white">All Comments ({comments.length})</h3>
                <button
                  onClick={() => setShowAllComments(false)}
                  className="text-white hover:text-gray-200 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="overflow-y-auto flex-1 p-4 space-y-3">
                {comments.map((comment, index) => (
                  <div
                    key={comment._id}
                    className={`p-3 rounded-lg bg-gradient-to-br ${getCommentGradient(index)} text-white shadow-sm hover:shadow-md transition-shadow`}
                    onMouseEnter={() => setHoveredComment(comment._id)}
                    onMouseLeave={() => setHoveredComment(null)}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="text-xs font-semibold opacity-90">
                        {comment.userName}
                      </div>
                      <div className="text-xs opacity-75">
                        {new Date(comment.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="text-sm leading-relaxed">
                      {comment.comment}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          <div className="flex-1">
            <div
              ref={previewContainerRef}
              className={`bg-white rounded-lg shadow-lg overflow-visible m-auto border border-gray-200 relative ${
                commentMode ? 'cursor-crosshair' : ''
              }`}
              style={{
                ...previewStyles[previewMode],
                transform: `scale(${previewZoom / 100})`,
                transformOrigin: 'top center',
              }}
              onClick={handlePreviewClick}
            >
              <div className="relative w-full" style={{
                height: previewMode === 'mobile' ? '667px' : previewMode === 'tablet' ? '1024px' : '800px',
                minHeight: '400px',
              }}>
                <iframe
                  ref={iframeRef}
                  srcDoc={html || '<!doctype html><html><body></body></html>'}
                  className="w-full h-full border-0"
                  style={{
                    height: '100%',
                    width: '100%',
                    pointerEvents: commentMode ? 'none' : 'auto',
                  }}
                  title="Email Preview"
                />
                
                {/* Click overlay for capturing clicks when in comment mode */}
                {commentMode && (
                  <div 
                    className="absolute inset-0 pointer-events-auto"
                    style={{
                      cursor: 'crosshair',
                    }}
                  />
                )}
                
                {/* Comment markers and tooltips are now injected directly into the iframe HTML */}
              </div>
            </div>
          </div>
        </div>
      </div>


      {/* Comment Modal */}
      {showCommentModal && selectedPosition && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">Add Comment</h2>
              <button
                onClick={() => {
                  setShowCommentModal(false);
                  setSelectedPosition(null);
                  setCommentText('');
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
                Commenting as: <span className="font-semibold">{user?.name || 'Anonymous User'}</span>
              </p>
              <textarea
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Write your comment here..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none resize-none"
                rows={4}
                autoFocus
              />
            </div>
            <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowCommentModal(false);
                  setSelectedPosition(null);
                  setCommentText('');
                }}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitComment}
                disabled={!commentText.trim() || submittingComment}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submittingComment ? 'Submitting...' : 'Submit Comment'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Comment Confirmation Dialog */}
      <ConfirmDialog
        isOpen={deleteConfirmDialog.isOpen}
        title="Delete Comment"
        message="Are you sure you want to delete this comment? This action cannot be undone."
        type="danger"
        onConfirm={confirmDeleteComment}
        onCancel={() => setDeleteConfirmDialog({ isOpen: false, commentId: null })}
      />
    </div>
  );
}

