'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { X, Loader2 } from 'lucide-react';
import { createPortal } from 'react-dom';

export default function NewOrganizationPage() {
  const router = useRouter();
  const [isVisible, setIsVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    organizationName: '',
    adminEmail: '',
    status: 'Active',
    password: '',
    confirmPassword: ''
  });

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 16);
    return () => clearTimeout(timer);
  }, []);

  const handleClose = useCallback(() => {
    setIsVisible(false);
    setTimeout(() => router.push('/super-admin/organizations'), 300);
  }, [router]);

  const handleBackdropClick = useCallback((e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  }, [handleClose]);

  const handleClear = useCallback(() => {
    setFormData({
      organizationName: '',
      adminEmail: '',
      status: 'Active',
      password: '',
      confirmPassword: ''
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log('Creating organization:', formData);
      handleClose();
    } catch (error) {
      console.error('Error creating organization:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [handleClose]);

  const modal = (
    <div 
      onClick={handleBackdropClick}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex z-[99999]"
      style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0, 0, 0, 0.5)', zIndex: 99999 }}
    >
      <div 
        className="ml-auto w-full max-w-md bg-white shadow-xl transform transition-transform duration-300 ease-in-out z-[100000] flex flex-col"
        style={{ 
          transform: isVisible ? 'translateX(0)' : 'translateX(100%)', 
          zIndex: 100000,
          height: '100vh',
          minHeight: '100vh'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-6 border-b border-gray-100 flex-shrink-0">
          <div className="flex items-center justify-between">
            <h2 className="text-[20px] font-semibold text-[#16A34A]">
              Add New Organization
            </h2>
            <button 
              onClick={handleClose} 
              className="text-gray-400 hover:text-gray-600 transition-colors p-1"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Form Body - Scrollable */}
        <div className="flex-1 overflow-y-auto px-6 py-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Organization Information Section */}
            <div>
              <h3 className="text-[16px] font-medium text-gray-900 mb-4">Add Information</h3>
            </div>

            {/* Organization Name */}
            <div className="space-y-2">
              <Label className="text-[14px] font-medium text-[#4F46E5] mb-2 block">
                Organization Name<span className="text-red-500 ml-1">*</span>
              </Label>
              <Input 
                className="h-[48px] border-2 border-[#4F46E5] focus:border-[#4F46E5] focus:ring-[#4F46E5] text-[16px] rounded-lg" 
                placeholder="CG Group Pvt.Ltd" 
                value={formData.organizationName}
                onChange={(e) => handleInputChange('organizationName', e.target.value)}
                disabled={isLoading}
                required
              />
            </div>

            {/* Admin Email */}
            <div className="space-y-2">
              <Label className="text-[14px] font-medium text-[#4F46E5] mb-2 block">
                Admin Email<span className="text-red-500 ml-1">*</span>
              </Label>
              <Input 
                type="email"
                className="h-[48px] border-2 border-[#4F46E5] focus:border-[#4F46E5] focus:ring-[#4F46E5] text-[16px] rounded-lg" 
                placeholder="Abinashgoktebabutiwari 666@gmail.com" 
                value={formData.adminEmail}
                onChange={(e) => handleInputChange('adminEmail', e.target.value)}
                disabled={isLoading}
                required
              />
            </div>

            {/* Status */}
            <div className="space-y-2">
              <Label className="text-[14px] font-medium text-[#4F46E5] mb-2 block">
                Status<span className="text-red-500 ml-1">*</span>
              </Label>
              <Select 
                value={formData.status} 
                onValueChange={(value) => handleInputChange('status', value)}
                disabled={isLoading}
              >
                <SelectTrigger className="h-[48px] border-2 border-[#4F46E5] focus:border-[#4F46E5] text-[16px] rounded-lg">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Password Row */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-[14px] font-medium text-[#4F46E5] mb-2 block">
                  Password<span className="text-red-500 ml-1">*</span>
                </Label>
                <Input 
                  type="password"
                  className="h-[48px] border-2 border-[#4F46E5] focus:border-[#4F46E5] focus:ring-[#4F46E5] text-[16px] rounded-lg" 
                  placeholder="************" 
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  disabled={isLoading}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label className="text-[14px] font-medium text-[#4F46E5] mb-2 block">
                  Confirm Password<span className="text-red-500 ml-1">*</span>
                </Label>
                <Input 
                  type="password"
                  className="h-[48px] border-2 border-[#4F46E5] focus:border-[#4F46E5] focus:ring-[#4F46E5] text-[16px] rounded-lg" 
                  placeholder="*********" 
                  value={formData.confirmPassword}
                  onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                  disabled={isLoading}
                  required
                />
              </div>
            </div>
          </form>
        </div>

        {/* Footer - At Very Bottom */}
        <div className="px-6 py-6 bg-gradient-to-r from-[#4F46E5] via-[#7C8FE8] to-[#A8B5EB] flex-shrink-0 mt-auto border-t-0">
          <div className="flex justify-end gap-3">
            <Button
              type="button"
              onClick={handleClear}
              disabled={isLoading}
              className="bg-[#EF4444] hover:bg-[#DC2626] text-white px-8 py-2 h-[44px] text-[14px] font-medium rounded-lg"
            >
              Clear
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isLoading}
              className="bg-[#4F46E5] hover:bg-[#4338CA] text-white px-8 py-2 h-[44px] text-[14px] font-medium rounded-lg"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Organization"
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );

  // Render portal only on client side
  if (typeof window === 'undefined') return null;

  return createPortal(modal, document.body);
} 