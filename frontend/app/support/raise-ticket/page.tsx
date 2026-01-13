'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navigation from '../../../components/Navigation';
import Footer from '../../../components/Footer';
import { Ticket, AlertCircle, CheckCircle, ArrowLeft } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../../../app/providers/AuthProvider';
import ImageUpload from '../../../components/ImageUpload';

export default function RaiseTicketPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high' | 'urgent'>('medium');
  const [images, setImages] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [createdTicket, setCreatedTicket] = useState<{ _id: string; ticketNumber: string } | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
        <Navigation />
        <div className="max-w-3xl mx-auto px-4 py-20 text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
        <Footer />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    setIsSubmitting(true);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Please login to raise a ticket');
        setIsSubmitting(false);
        return;
      }

      // Step 1: Create the ticket
      const response = await axios.post(
        '/api/tickets',
        { title, description, priority, images: images },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.ticket) {
        const ticket = response.data.ticket;
        setCreatedTicket({ _id: ticket._id, ticketNumber: ticket.ticketNumber });
        setSuccess(true);
        setTimeout(() => {
          router.push(`/support/tickets/${ticket._id}`);
        }, 1500);
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to create ticket. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
      <Navigation />

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <button
          onClick={() => router.push('/support')}
          className="flex items-center gap-2 text-gray-600 hover:text-indigo-600 mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Support
        </button>

        <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center">
              <Ticket className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Raise a Support Ticket</h1>
              <p className="text-gray-600 mt-1">Fill out the form below to create a new support ticket</p>
            </div>
          </div>

          {createdTicket && (
            <div className="mb-6">
              <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
                <p className="text-sm text-indigo-700">
                  <span className="font-semibold">Ticket Number:</span>{' '}
                  <span className="font-mono text-base">{createdTicket.ticketNumber}</span>
                </p>
              </div>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          {success && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6 flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-green-600 font-semibold">Ticket created successfully!</p>
                <p className="text-green-600 text-sm mt-1">Redirecting to your ticket...</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="title" className="block text-sm font-semibold text-gray-700 mb-2">
                Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Brief description of your issue"
              />
            </div>

            <div>
              <label htmlFor="priority" className="block text-sm font-semibold text-gray-700 mb-2">
                Priority
              </label>
              <select
                id="priority"
                value={priority}
                onChange={(e) => setPriority(e.target.value as 'low' | 'medium' | 'high' | 'urgent')}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
              <p className="text-sm text-gray-500 mt-2">
                Select the priority level based on the urgency of your issue
              </p>
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-semibold text-gray-700 mb-2">
                Description <span className="text-red-500">*</span>
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                rows={8}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                placeholder="Please provide detailed information about your issue. Include any error messages, steps to reproduce, or relevant context that will help us assist you better."
              />
              <p className="text-sm text-gray-500 mt-2">
                Provide as much detail as possible to help us resolve your issue quickly
              </p>
            </div>

            <div>
              <ImageUpload
                images={images}
                onImagesChange={setImages}
                uploadEndpoint="/api/tickets/upload-temp-image"
                maxImages={10}
                disabled={isSubmitting}
              />
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-semibold hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isSubmitting ? 'Creating Ticket...' : 'Create Ticket'}
              </button>
              <button
                type="button"
                onClick={() => router.push('/support')}
                className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>

      <Footer />
    </div>
  );
}
