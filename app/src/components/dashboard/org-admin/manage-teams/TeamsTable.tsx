"use client";

import * as React from "react";
import { Eye, Edit, Trash2, ChevronUp, ChevronDown, ArrowUpDown } from "lucide-react";
import { useState, useMemo } from "react";

// Team data type matching Figma design
export interface Team {
  id: string;
  teamName: string;
  teamLead: string;
  contactNumber: string;
  teamMembers: Array<{
    id: string;
    name: string;
    avatar?: string;
  }>;
  assignedProjects: string;
  extraProjectsCount?: number;
}

interface TeamsTableProps {
  data: Team[];
  onView?: (team: Team) => void;
  onEdit?: (team: Team) => void;
  onDelete?: (team: Team) => void;
}

export function TeamsTable({ data, onView, onEdit, onDelete }: TeamsTableProps) {
  const [sortConfig, setSortConfig] = useState<{
    key: keyof Team;
    direction: 'asc' | 'desc' | null;
  }>({ key: 'teamName', direction: null });

  const sortedData = useMemo(() => {
    if (sortConfig.direction === null) return data;

    return [...data].sort((a, b) => {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];
      
      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [data, sortConfig]);

  const handleSort = (key: keyof Team) => {
    setSortConfig(current => ({
      key,
      direction: current.key === key && current.direction === 'asc' 
        ? 'desc' 
        : current.key === key && current.direction === 'desc'
        ? null
        : 'asc'
    }));
  };

  const getSortIcon = (key: keyof Team) => {
    if (sortConfig.key !== key || sortConfig.direction === null) {
      return <ArrowUpDown className="h-4 w-4 text-gray-400" />;
    }
    return sortConfig.direction === 'asc' 
      ? <ChevronUp className="h-4 w-4 text-[#4F46E5]" />
      : <ChevronDown className="h-4 w-4 text-[#4F46E5]" />;
  };

  const [expandedTeams, setExpandedTeams] = useState<Set<string>>(new Set());

  const toggleExpanded = (teamId: string) => {
    setExpandedTeams(prev => {
      const newSet = new Set(prev);
      if (newSet.has(teamId)) {
        newSet.delete(teamId);
      } else {
        newSet.add(teamId);
      }
      return newSet;
    });
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          {/* Exact Figma Header Design - Purple Background */}
          <thead className="bg-[#F1F0FF] border-b border-gray-200">
            <tr>
              <th className="px-6 py-4 text-left">
                <button
                  onClick={() => handleSort('teamName')}
                  className="flex items-center gap-2 text-[14px] font-semibold text-gray-900 hover:text-[#4F46E5] transition-colors"
                >
                  Team Name
                  {getSortIcon('teamName')}
                </button>
              </th>
              <th className="px-6 py-4 text-left">
                <button
                  onClick={() => handleSort('teamLead')}
                  className="flex items-center gap-2 text-[14px] font-semibold text-gray-900 hover:text-[#4F46E5] transition-colors"
                >
                  Team Lead
                  {getSortIcon('teamLead')}
                </button>
              </th>
              <th className="px-6 py-4 text-left">
                <button
                  onClick={() => handleSort('contactNumber')}
                  className="flex items-center gap-2 text-[14px] font-semibold text-gray-900 hover:text-[#4F46E5] transition-colors"
                >
                  Contact Number
                  {getSortIcon('contactNumber')}
                </button>
              </th>
              <th className="px-6 py-4 text-left text-[14px] font-semibold text-gray-900">
                Team Members
              </th>
              <th className="px-6 py-4 text-left">
                <button
                  onClick={() => handleSort('assignedProjects')}
                  className="flex items-center gap-2 text-[14px] font-semibold text-gray-900 hover:text-[#4F46E5] transition-colors"
                >
                  Assigned Projects
                  {getSortIcon('assignedProjects')}
                </button>
              </th>
              <th className="px-6 py-4 text-center text-[14px] font-semibold text-gray-900">
                Actions
              </th>
            </tr>
          </thead>
          {/* Table Body */}
          <tbody className="divide-y divide-gray-100">
            {sortedData.map((team, index) => (
              <tr 
                key={team.id} 
                className={`hover:bg-gray-50 transition-colors ${
                  index % 2 === 0 ? 'bg-white' : 'bg-gray-25'
                }`}
              >
                <td className="px-6 py-4">
                  <div className="text-[14px] font-medium text-gray-900">
                    {team.teamName}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-[14px] text-gray-700">
                    {team.teamLead}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-[14px] text-gray-700">
                    {team.contactNumber}
                  </div>
                </td>
                <td className="px-6 py-4">
                  {/* Team Members - Exact Figma Overlapping Avatar Design */}
                  <div className="flex items-center">
                    {/* Show first 3 avatars with overlap */}
                    <div className="flex -space-x-2">
                      {team.teamMembers.slice(0, 3).map((member, idx) => (
                        <div 
                          key={member.id}
                          className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-[12px] font-medium border-2 border-white relative"
                          style={{ zIndex: 10 - idx }}
                          title={member.name}
                        >
                          {member.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                        </div>
                      ))}
                    </div>
                    
                    {/* Count and Expand/Collapse */}
                    {team.teamMembers.length > 3 && (
                      <div className="ml-3 flex items-center gap-2">
                        <span className="text-[12px] text-gray-500">
                          {expandedTeams.has(team.id) 
                            ? `Hide ${team.teamMembers.length - 3} members`
                            : `+${team.teamMembers.length - 3} more`
                          }
                        </span>
                        <button
                          onClick={() => toggleExpanded(team.id)}
                          className="text-[12px] text-[#4F46E5] hover:text-[#4338CA] font-medium"
                        >
                          {expandedTeams.has(team.id) ? 'Show Less' : 'Show More'}
                        </button>
                      </div>
                    )}
                    
                    {/* Expanded Members */}
                    {expandedTeams.has(team.id) && team.teamMembers.length > 3 && (
                      <div className="ml-4 flex flex-wrap gap-2">
                        {team.teamMembers.slice(3).map((member, idx) => (
                          <div 
                            key={member.id}
                            className="h-6 w-6 rounded-full bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center text-white text-[10px] font-medium"
                            title={member.name}
                          >
                            {member.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-[14px] text-gray-700">
                    {team.assignedProjects}
                  </div>
                </td>
                <td className="px-6 py-4">
                  {/* Exact Figma Action Buttons - Circular Design */}
                  <div className="flex items-center justify-center gap-2">
                    <button
                      onClick={() => onView?.(team)}
                      className="w-8 h-8 rounded-full bg-[#4F46E5] text-white flex items-center justify-center hover:bg-[#4338CA] transition-colors"
                      title="View Details"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => onEdit?.(team)}
                      className="w-8 h-8 rounded-full bg-[#4F46E5] text-white flex items-center justify-center hover:bg-[#4338CA] transition-colors"
                      title="Edit Team"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => onDelete?.(team)}
                      className="w-8 h-8 rounded-full bg-[#EF4444] text-white flex items-center justify-center hover:bg-[#DC2626] transition-colors"
                      title="Delete Team"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* Pagination Footer - Exact Figma Design */}
      <div className="px-6 py-4 bg-white border-t border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button className="px-4 py-2 text-[14px] text-gray-600 hover:bg-gray-50 rounded-lg transition-colors font-medium">
            ← Previous
          </button>
        </div>
        
        <div className="flex items-center gap-1">
          <button className="w-9 h-9 flex items-center justify-center text-[14px] bg-[#4F46E5] text-white rounded-lg transition-colors font-medium">
            1
          </button>
          <button className="w-9 h-9 flex items-center justify-center text-[14px] text-gray-600 hover:bg-gray-50 rounded-lg transition-colors font-medium">
            2
          </button>
          <button className="w-9 h-9 flex items-center justify-center text-[14px] text-gray-600 hover:bg-gray-50 rounded-lg transition-colors font-medium">
            3
          </button>
          <span className="text-[14px] text-gray-400 mx-2">...</span>
          <button className="w-9 h-9 flex items-center justify-center text-[14px] text-gray-600 hover:bg-gray-50 rounded-lg transition-colors font-medium">
            8
          </button>
          <button className="w-9 h-9 flex items-center justify-center text-[14px] text-gray-600 hover:bg-gray-50 rounded-lg transition-colors font-medium">
            9
          </button>
          <button className="w-9 h-9 flex items-center justify-center text-[14px] text-gray-600 hover:bg-gray-50 rounded-lg transition-colors font-medium">
            10
          </button>
        </div>
        
        <div className="flex items-center gap-2">
          <button className="px-4 py-2 text-[14px] text-gray-600 hover:bg-gray-50 rounded-lg transition-colors font-medium">
            Next →
          </button>
        </div>
      </div>
    </div>
  );
}
