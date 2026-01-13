'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Navigation from '../../../../components/Navigation';
import Footer from '../../../../components/Footer';
import { Ticket, Clock, User, MessageSquare, ArrowLeft, Send, AlertCircle, X } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../../../../app/providers/AuthProvider';
import ImageUpload from '../../../../components/ImageUpload';
import Image from 'next/image';

interface TicketComment {
  userId: {
    _id: string;
    name: string;
    email: string;
  };
  userName: string;
  userEmail: string;
  comment: string;
  images?: string[];
  createdAt: string;
}

interface TicketTimeline {
  type: 'status' | 'priority' | 'assignment' | 'comment';
  userId: {
    _id: string;
    name: string;
    email: string;
  };
  userName: string;
  userEmail: string;
  oldValue?: string;
  newValue: string;
  comment?: string;
  createdAt: string;
}

interface TicketData {
  _id: string;
  ticketNumber: string;
  title: string;
  description: string;
  images?: string[];
  status: 'open' | 'in-progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  createdBy: {
    _id: string;
    name: string;
    email: string;
  };
  assignedUsers: Array<{
    _id: string;
    name: string;
    email: string;
  }>;
  comments: TicketComment[];
  timeline?: TicketTimeline[];
  createdAt: string;
  updatedAt: string;
}

export default function TicketDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [ticket, setTicket] = useState<TicketData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [comment, setComment] = useState('');
  const [commentImages, setCommentImages] = useState<string[]>([]);
  const [ticketImages, setTicketImages] = useState<string[]>([]);
  const [status, setStatus] = useState<'open' | 'in-progress' | 'resolved' | 'closed'>('open');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high' | 'urgent'>('medium');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showStatusCommentModal, setShowStatusCommentModal] = useState(false);
  const [showPriorityCommentModal, setShowPriorityCommentModal] = useState(false);
  const [pendingStatus, setPendingStatus] = useState<'open' | 'in-progress' | 'resolved' | 'closed' | null>(null);
  const [pendingPriority, setPendingPriority] = useState<'low' | 'medium' | 'high' | 'urgent' | null>(null);
  const [statusComment, setStatusComment] = useState('');
  const [priorityComment, setPriorityComment] = useState('');

  const ticketId = params.id as string;

  const fetchTicket = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }

      const response = await axios.get(`/api/tickets/${ticketId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setTicket(response.data.ticket);
      setStatus(response.data.ticket.status);
      setPriority(response.data.ticket.priority);
      setTicketImages(response.data.ticket.images || []);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load ticket');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (ticketId) {
      fetchTicket();
    }
  }, [ticketId]);

  // Keep status and priority in sync with ticket
  useEffect(() => {
    if (ticket && !showStatusCommentModal && !showPriorityCommentModal) {
      setStatus(ticket.status);
      setPriority(ticket.priority);
    }
  }, [ticket, showStatusCommentModal, showPriorityCommentModal]);

  const canUpdate = () => {
    if (!ticket || !user) return false;
    if (user.role === 'admin') return true;
    if (ticket.createdBy._id.toString() === user.id) return true;
    return ticket.assignedUsers.some((assigned) => assigned._id.toString() === user.id);
  };

  const handleAddComment = async () => {
    if ((!comment.trim() && commentImages.length === 0) || !canUpdate()) return;

    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(
        `/api/tickets/${ticketId}`,
        { 
          comment: comment.trim(),
          commentImages: commentImages,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setTicket(response.data.ticket);
      setComment('');
      setCommentImages([]);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to add comment');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTicketImagesUpdate = async (images: string[]) => {
    if (!canUpdate()) return;

    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(
        `/api/tickets/${ticketId}`,
        { images: images },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setTicket(response.data.ticket);
      setTicketImages(images);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to update images');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStatusChange = (newStatus: 'open' | 'in-progress' | 'resolved' | 'closed') => {
    if (!canUpdate() || newStatus === status) return;
    
    // Show modal to ask for comment
    setPendingStatus(newStatus);
    setStatusComment(`Status changed to ${newStatus.replace('-', ' ').toUpperCase()}. `);
    setShowStatusCommentModal(true);
  };

  const handleConfirmStatusChange = async () => {
    if (!pendingStatus) return;

    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      
      // Update status with comment
      await axios.put(
        `/api/tickets/${ticketId}`,
        { 
          status: pendingStatus,
          comment: statusComment.trim(),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Refresh ticket data
      await fetchTicket();
      
      setShowStatusCommentModal(false);
      setPendingStatus(null);
      setStatusComment('');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to update status');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancelStatusChange = () => {
    setShowStatusCommentModal(false);
    setPendingStatus(null);
    setStatusComment('');
    // Reset dropdown to current status
    if (ticket) {
      setStatus(ticket.status);
    }
  };

  const handlePriorityChange = (newPriority: 'low' | 'medium' | 'high' | 'urgent') => {
    if (!canUpdate() || newPriority === priority) return;
    
    // Show modal to ask for comment
    setPendingPriority(newPriority);
    setPriorityComment(`Priority changed to ${newPriority.toUpperCase()}. `);
    setShowPriorityCommentModal(true);
  };

  const handleConfirmPriorityChange = async () => {
    if (!pendingPriority) return;

    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      
      // Update priority with comment
      await axios.put(
        `/api/tickets/${ticketId}`,
        { 
          priority: pendingPriority,
          comment: priorityComment.trim(),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Refresh ticket data
      await fetchTicket();
      
      setShowPriorityCommentModal(false);
      setPendingPriority(null);
      setPriorityComment('');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to update priority');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancelPriorityChange = () => {
    setShowPriorityCommentModal(false);
    setPendingPriority(null);
    setPriorityComment('');
    // Reset dropdown to current priority
    if (ticket) {
      setPriority(ticket.priority);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open':
        return 'bg-blue-100 text-blue-800';
      case 'in-progress':
        return 'bg-yellow-100 text-yellow-800';
      case 'resolved':
        return 'bg-green-100 text-green-800';
      case 'closed':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-100 text-red-800';
      case 'high':
        return 'bg-orange-100 text-orange-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
        <Navigation />
        <div className="max-w-4xl mx-auto px-4 py-20">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            <p className="mt-4 text-gray-600">Loading ticket...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error && !ticket) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
        <Navigation />
        <div className="max-w-4xl mx-auto px-4 py-20">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
            <p className="text-red-600 text-lg">{error}</p>
            <button
              onClick={() => router.push('/support')}
              className="mt-4 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Back to Support
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!ticket) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
      <Navigation />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <button
          onClick={() => router.push('/support')}
          className="flex items-center gap-2 text-gray-600 hover:text-indigo-600 mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Support
        </button>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        {/* Priority Change Comment Modal */}
        {showPriorityCommentModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-gray-900">Update Priority</h2>
                <button
                  onClick={handleCancelPriorityChange}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                  disabled={isSubmitting}
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <div className="mb-4">
                <p className="text-gray-700 mb-2">
                  You are changing the priority to:{' '}
                  <span className="font-semibold text-indigo-600">
                    {pendingPriority?.toUpperCase()}
                  </span>
                </p>
                <p className="text-sm text-gray-600 mb-4">
                  Please add a comment explaining the reason for this priority change.
                </p>
              </div>

              <div className="mb-6">
                <label htmlFor="priority-comment" className="block text-sm font-semibold text-gray-700 mb-2">
                  Comment <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="priority-comment"
                  value={priorityComment}
                  onChange={(e) => setPriorityComment(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                  placeholder="Explain the reason for this priority change..."
                  disabled={isSubmitting}
                  autoFocus
                />
              </div>

              <div className="flex justify-end gap-3">
                <button
                  onClick={handleCancelPriorityChange}
                  disabled={isSubmitting}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmPriorityChange}
                  disabled={isSubmitting || !priorityComment.trim()}
                  className="px-6 py-2 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isSubmitting ? 'Updating...' : 'Update Priority'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Status Change Comment Modal */}
        {showStatusCommentModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-gray-900">Update Status</h2>
                <button
                  onClick={handleCancelStatusChange}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                  disabled={isSubmitting}
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <div className="mb-4">
                <p className="text-gray-700 mb-2">
                  You are changing the status to:{' '}
                  <span className="font-semibold text-indigo-600">
                    {pendingStatus?.replace('-', ' ').toUpperCase()}
                  </span>
                </p>
                <p className="text-sm text-gray-600 mb-4">
                  Please add a comment explaining the reason for this status change.
                </p>
              </div>

              <div className="mb-6">
                <label htmlFor="status-comment" className="block text-sm font-semibold text-gray-700 mb-2">
                  Comment <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="status-comment"
                  value={statusComment}
                  onChange={(e) => setStatusComment(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                  placeholder="Explain the reason for this status change..."
                  disabled={isSubmitting}
                  autoFocus
                />
              </div>

              <div className="flex justify-end gap-3">
                <button
                  onClick={handleCancelStatusChange}
                  disabled={isSubmitting}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmStatusChange}
                  disabled={isSubmitting || !statusComment.trim()}
                  className="px-6 py-2 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isSubmitting ? 'Updating...' : 'Update Status'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Status and Priority Update (if user can update) - At the top */}
        {canUpdate() && (
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-4 flex-wrap">
                <div className="flex items-center gap-3">
                  <label htmlFor="status-select" className="text-sm font-semibold text-gray-700 whitespace-nowrap">
                    Status:
                  </label>
                  <select
                    id="status-select"
                    value={status}
                    onChange={(e) => handleStatusChange(e.target.value as 'open' | 'in-progress' | 'resolved' | 'closed')}
                    disabled={isSubmitting}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed font-semibold min-w-[150px]"
                    style={{
                      backgroundColor: status === 'open' ? '#dbeafe' : 
                                     status === 'in-progress' ? '#fef3c7' : 
                                     status === 'resolved' ? '#d1fae5' : '#f3f4f6',
                      color: status === 'open' ? '#1e40af' : 
                             status === 'in-progress' ? '#92400e' : 
                             status === 'resolved' ? '#065f46' : '#374151',
                    }}
                  >
                    <option value="open">Open</option>
                    <option value="in-progress">In Progress</option>
                    <option value="resolved">Resolved</option>
                    <option value="closed">Closed</option>
                  </select>
                </div>
                <div className="flex items-center gap-3">
                  <label htmlFor="priority-select" className="text-sm font-semibold text-gray-700 whitespace-nowrap">
                    Priority:
                  </label>
                  <select
                    id="priority-select"
                    value={priority}
                    onChange={(e) => handlePriorityChange(e.target.value as 'low' | 'medium' | 'high' | 'urgent')}
                    disabled={isSubmitting}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed font-semibold min-w-[120px]"
                    style={{
                      backgroundColor: priority === 'urgent' ? '#fee2e2' : 
                                     priority === 'high' ? '#fed7aa' : 
                                     priority === 'medium' ? '#fef3c7' : '#f3f4f6',
                      color: priority === 'urgent' ? '#991b1b' : 
                             priority === 'high' ? '#9a3412' : 
                             priority === 'medium' ? '#854d0e' : '#374151',
                    }}
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Ticket Header */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-sm font-mono font-semibold text-indigo-600 bg-indigo-50 px-4 py-2 rounded-lg">
                  {ticket.ticketNumber}
                </span>
              </div>
              <div className="flex items-center gap-3 mb-4">
                <Ticket className="w-6 h-6 text-indigo-600" />
                <h1 className="text-3xl font-bold text-gray-900">{ticket.title}</h1>
              </div>
              {!canUpdate() && (
                <div className="flex items-center gap-3 mb-6">
                  <span className={`px-4 py-2 rounded-full text-sm font-semibold ${getStatusColor(ticket.status)}`}>
                    {ticket.status.replace('-', ' ').toUpperCase()}
                  </span>
                  <span className={`px-4 py-2 rounded-full text-sm font-semibold ${getPriorityColor(ticket.priority)}`}>
                    {ticket.priority.toUpperCase()}
                  </span>
                </div>
              )}
            </div>
          </div>

          <p className="text-gray-700 leading-relaxed mb-6 whitespace-pre-wrap">{ticket.description}</p>

          {/* Display Ticket Images */}
          {ticket.images && ticket.images.length > 0 && (
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Ticket Images</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {ticket.images.map((url, index) => (
                  <div key={index} className="relative aspect-square rounded-lg overflow-hidden bg-gray-100 border border-gray-200">
                    <Image
                      src={url}
                      alt={`Ticket image ${index + 1}`}
                      fill
                      className="object-cover"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Ticket Images Upload */}
          {canUpdate() && (
            <div className="mb-6 pt-6 border-t border-gray-200">
              <ImageUpload
                images={ticketImages}
                onImagesChange={handleTicketImagesUpdate}
                uploadEndpoint={`/api/tickets/${ticketId}/upload-image`}
                maxImages={10}
                disabled={isSubmitting}
              />
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-6 border-t border-gray-200">
            <div className="flex items-center gap-3 text-gray-600">
              <User className="w-5 h-5" />
              <div>
                <p className="text-sm text-gray-500">Created by</p>
                <p className="font-semibold">{ticket.createdBy.name}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 text-gray-600">
              <Clock className="w-5 h-5" />
              <div>
                <p className="text-sm text-gray-500">Created on</p>
                <p className="font-semibold">{new Date(ticket.createdAt).toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Timeline Section */}
        {ticket.timeline && ticket.timeline.length > 0 && (
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <Clock className="w-6 h-6" />
              Timeline
            </h2>
            <div className="space-y-4">
              {[...ticket.timeline].reverse().map((entry, index) => (
                <div key={index} className="border-l-4 border-indigo-500 pl-4 py-2">
                  <div className="flex items-center gap-2 mb-1">
                    <User className="w-4 h-4 text-gray-500" />
                    <span className="font-semibold text-gray-900">{entry.userName}</span>
                    <span className="text-sm text-gray-500">
                      {new Date(entry.createdAt).toLocaleString()}
                    </span>
                  </div>
                  {entry.type === 'status' && (
                    <p className="text-gray-700">
                      Changed status from{' '}
                      <span className="font-semibold">{entry.oldValue?.replace('-', ' ').toUpperCase()}</span> to{' '}
                      <span className="font-semibold">{entry.newValue.replace('-', ' ').toUpperCase()}</span>
                      {entry.comment && (
                        <span className="text-gray-600">: {entry.comment}</span>
                      )}
                    </p>
                  )}
                  {entry.type === 'priority' && (
                    <p className="text-gray-700">
                      Changed priority from{' '}
                      <span className="font-semibold">{entry.oldValue?.toUpperCase()}</span> to{' '}
                      <span className="font-semibold">{entry.newValue.toUpperCase()}</span>
                      {entry.comment && (
                        <span className="text-gray-600">: {entry.comment}</span>
                      )}
                    </p>
                  )}
                  {entry.type === 'comment' && (
                    <p className="text-gray-700">{entry.newValue}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Comments Section */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <MessageSquare className="w-6 h-6" />
            Comments ({ticket.comments.length})
          </h2>

          {/* Comments List */}
          <div className="space-y-6 mb-8">
            {ticket.comments.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No comments yet</p>
            ) : (
              ticket.comments.map((comment, index) => (
                <div key={index} className="border-l-4 border-indigo-500 pl-4 py-2">
                  <div className="flex items-center gap-2 mb-2">
                    <User className="w-4 h-4 text-gray-500" />
                    <span className="font-semibold text-gray-900">{comment.userName}</span>
                    <span className="text-sm text-gray-500">
                      {new Date(comment.createdAt).toLocaleString()}
                    </span>
                  </div>
                  {comment.comment && (
                    <p className="text-gray-700 whitespace-pre-wrap mb-3">{comment.comment}</p>
                  )}
                  {/* Comment Images */}
                  {comment.images && comment.images.length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-3">
                      {comment.images.map((url, imgIndex) => (
                        <div key={imgIndex} className="relative aspect-square rounded-lg overflow-hidden bg-gray-100 border border-gray-200">
                          <Image
                            src={url}
                            alt={`Comment image ${imgIndex + 1}`}
                            fill
                            className="object-cover"
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>

          {/* Add Comment Form */}
          {canUpdate() ? (
            <div className="border-t border-gray-200 pt-6">
              <label htmlFor="comment" className="block text-sm font-semibold text-gray-700 mb-2">
                Add a Comment
              </label>
              <div className="space-y-4">
                <textarea
                  id="comment"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                  placeholder="Type your comment here..."
                />
                <ImageUpload
                  images={commentImages}
                  onImagesChange={setCommentImages}
                  uploadEndpoint={`/api/tickets/${ticketId}/upload-image`}
                  maxImages={5}
                  disabled={isSubmitting}
                />
                <div className="flex justify-end">
                  <button
                    onClick={handleAddComment}
                    disabled={(!comment.trim() && commentImages.length === 0) || isSubmitting}
                    className="px-6 py-2 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                  >
                    <Send className="w-4 h-4" />
                    {isSubmitting ? 'Sending...' : 'Send'}
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="border-t border-gray-200 pt-6">
              <p className="text-gray-500 text-sm">
                Only administrators, ticket creator, or assigned users can add comments.
              </p>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}
