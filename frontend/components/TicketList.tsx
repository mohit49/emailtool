'use client';

import { useState, useEffect } from 'react';
import { Ticket, Clock, User, MessageSquare, ChevronRight } from 'lucide-react';
import axios from 'axios';
import Link from 'next/link';

interface TicketComment {
  userId: {
    _id: string;
    name: string;
    email: string;
  };
  userName: string;
  userEmail: string;
  comment: string;
  createdAt: string;
}

interface Ticket {
  _id: string;
  ticketNumber: string;
  title: string;
  description: string;
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
  createdAt: string;
  updatedAt: string;
}

export default function TicketList() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchTickets = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setLoading(false);
        return;
      }

      const response = await axios.get('/api/tickets', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setTickets(response.data.tickets || []);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load tickets');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

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
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        <p className="mt-4 text-gray-600">Loading tickets...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-600">
        {error}
      </div>
    );
  }

  if (tickets.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-2xl shadow-lg">
        <Ticket className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600 text-lg">No tickets found</p>
        <p className="text-gray-500 text-sm mt-2">Create your first support ticket to get started</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {tickets.map((ticket) => (
        <Link
          key={ticket._id}
          href={`/support/tickets/${ticket._id}`}
          className="block bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 p-6"
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2 flex-wrap">
                <span className="text-sm font-mono font-semibold text-indigo-600 bg-indigo-50 px-3 py-1 rounded">
                  {ticket.ticketNumber}
                </span>
                <h3 className="text-xl font-bold text-gray-900">{ticket.title}</h3>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(ticket.status)}`}>
                  {ticket.status.replace('-', ' ').toUpperCase()}
                </span>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getPriorityColor(ticket.priority)}`}>
                  {ticket.priority.toUpperCase()}
                </span>
              </div>
              <p className="text-gray-600 mb-4 line-clamp-2">{ticket.description}</p>
              <div className="flex items-center gap-6 text-sm text-gray-500">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  <span>{ticket.createdBy.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  <span>{new Date(ticket.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4" />
                  <span>{ticket.comments.length} comment{ticket.comments.length !== 1 ? 's' : ''}</span>
                </div>
              </div>
            </div>
            <ChevronRight className="w-6 h-6 text-gray-400 flex-shrink-0" />
          </div>
        </Link>
      ))}
    </div>
  );
}
