import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from '../../ui/card';
import { Button } from '../../ui/button';
import { Modal } from '../../ui/modal';
import { Badge } from '../../ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../ui/table';
import { 
  PlusIcon, 
  ShieldIcon, 
  UsersIcon, 
  HomeIcon,
  EyeIcon,
  EditIcon,
  TrashIcon,
  SearchIcon,
  FilterIcon,
  UserPlusIcon,
  ClockIcon,
  TrendingUpIcon
} from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';
import { ResidentManagement } from './ResidentManagement';
import { GuardManagement } from './GuardManagement';

export const AdminDashboard = () => {
  const { db, userProfile, currentEstate, createGuard, createResident } = useAuth();
  const [activeTab, setActiveTab] = useState('residents');

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="glass-effect rounded-2xl p-4 sm:p-6 shadow-soft border-0">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-soft">
              <HomeIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold font-display text-neutral-800">
                Estate Management
              </h2>
              <p className="text-neutral-600">{currentEstate?.name} - Admin Dashboard</p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}

      {/* Tabs */}
      <div className="glass-effect rounded-2xl shadow-soft border-0">
        <div className="flex border-b border-neutral-200">
          <button
            onClick={() => setActiveTab('residents')}
            className={`px-6 py-4 font-semibold transition-colors ${
              activeTab === 'residents'
                ? 'text-primary-600 border-b-2 border-primary-600'
                : 'text-neutral-600 hover:text-neutral-800'
            }`}
          >
            Residents
          </button>
          <button
            onClick={() => setActiveTab('guards')}
            className={`px-6 py-4 font-semibold transition-colors ${
              activeTab === 'guards'
                ? 'text-primary-600 border-b-2 border-primary-600'
                : 'text-neutral-600 hover:text-neutral-800'
            }`}
          >
            Guards
          </button>
        </div>
      </div>

      {activeTab === 'residents' && <ResidentManagement />}
      {activeTab === 'guards' && <GuardManagement />}
    </div>
  );
};