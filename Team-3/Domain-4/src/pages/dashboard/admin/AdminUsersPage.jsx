import React, { useState } from 'react';
import { Users, Search, Filter, ShieldCheck, UserCheck, Shield, CheckCircle2 } from 'lucide-react';
import Button from '../../../components/common/Button';
import Chip from '../../../components/common/Chip';
import authService from '../../../services/auth';

export default function AdminUsersPage() {
  const session = authService.getSession();
  const [filterRole, setFilterRole] = useState('all');
  const [search, setSearch] = useState('');

  const [users, setUsers] = useState([
    { id: 1, name: 'Jane Doe', email: 'jane.doe@example.com', role: 'job_seeker', status: 'Active', created: '2026-08-15', lastActive: 'Just now' },
    { id: 2, name: 'Alex Rivera', email: 'alex.recruiter@infosys.com', role: 'recruiter', status: 'Active', created: '2026-08-18', lastActive: '5m ago' },
    { id: 3, name: session?.user?.name || 'Administrator', email: session?.user?.email || 'admin@swipex.infosys.com', role: 'admin', status: 'Active', created: '2026-08-01', lastActive: 'Current session' },
    { id: 4, name: 'Devon Vance', email: 'devon.v@partner.com', role: 'recruiter', status: 'Active', created: '2026-08-22', lastActive: '1h ago' },
    { id: 5, name: 'Sarah Chen', email: 'sarah.c@techtalent.io', role: 'job_seeker', status: 'Active', created: '2026-08-25', lastActive: '2h ago' },
  ]);

  const handleRoleChange = (userId, newRole) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
    );
    if (session?.user?.id === userId || session?.user?.user_id === userId) {
      authService.setRole(newRole);
    }
  };

  const filtered = users.filter((u) => {
    const roleMatch = filterRole === 'all' || u.role === filterRole;
    const q = search.toLowerCase();
    const searchMatch = u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q);
    return roleMatch && searchMatch;
  });

  return (
    <div className="space-y-6 animate-fadeIn">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-outline-variant pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-purple-400" />
            <h1 className="text-xl sm:text-2xl font-extrabold text-content">User & Role Directory</h1>
          </div>
          <p className="text-xs text-content-muted mt-1">
            Global governance of candidate, recruiter, and administrator accounts.
          </p>
        </div>

        <span className="text-xs font-semibold px-3 py-1 rounded-full bg-purple-950/40 text-purple-300 border border-purple-800/30 self-start sm:self-auto">
          {users.length} Registered Accounts
        </span>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:max-w-md">
          <Search className="w-4 h-4 text-content-subtle absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search accounts by name or email..."
            className="w-full bg-surface-elevated border border-outline-variant rounded-xl pl-10 pr-4 py-2 text-xs text-content placeholder:text-content-subtle focus:outline-none focus:border-primary"
          />
        </div>

        <div className="flex items-center gap-1.5 self-start sm:self-auto">
          {['all', 'job_seeker', 'recruiter', 'admin'].map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setFilterRole(r)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize transition-all ${
                filterRole === r
                  ? 'bg-purple-600 text-surface'
                  : 'bg-surface-elevated text-content-muted hover:text-content'
              }`}
            >
              {r === 'all' ? 'All Roles' : r.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Users Table */}
      <div className="surface-card p-0 overflow-hidden border-white/[0.08]">
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left text-xs min-w-[620px]">
            <thead className="bg-white/[0.03] border-b border-outline-variant text-content-muted uppercase font-bold text-[10px] tracking-wider">
              <tr>
                <th className="p-4">Account Holder</th>
                <th className="p-4">Assigned Role</th>
                <th className="p-4">Account Status</th>
                <th className="p-4">Last Activity</th>
                <th className="p-4 text-right">RBAC Assignment</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/60">
              {filtered.map((user) => (
                <tr key={user.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-7 h-7 rounded-lg bg-primary-container/40 text-primary font-bold flex items-center justify-center text-xs shrink-0">
                        {user.name[0]}
                      </div>
                      <div className="min-w-0 max-w-[180px] sm:max-w-xs">
                        <span className="font-semibold text-content block truncate">{user.name}</span>
                        <span className="text-[11px] text-content-muted block truncate">{user.email}</span>
                      </div>
                    </div>
                  </td>

                  <td className="p-4">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium bg-surface-elevated text-content border border-outline-variant capitalize whitespace-nowrap">
                      {user.role.replace('_', ' ')}
                    </span>
                  </td>

                  <td className="p-4">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium bg-surface-elevated text-content-muted border border-outline-variant whitespace-nowrap">
                      {user.status}
                    </span>
                  </td>

                  <td className="p-4 text-content-muted font-mono text-[11px] whitespace-nowrap">
                    {user.lastActive}
                  </td>

                  <td className="p-4 text-right">
                    <select
                      value={user.role}
                      onChange={(e) => handleRoleChange(user.id, e.target.value)}
                      className="bg-surface-elevated border border-outline-variant rounded-xl px-2.5 py-1 text-xs text-content focus:outline-none focus:border-primary"
                    >
                      <option value="job_seeker">Job Seeker</option>
                      <option value="recruiter">Recruiter</option>
                      <option value="admin">Administrator</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
