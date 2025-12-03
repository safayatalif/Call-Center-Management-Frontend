'use client';

import { useState, useEffect } from 'react';
import { authAPI } from '@/lib/api';

export default function SettingsPage() {
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    // Password change state
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [passwordSuccess, setPasswordSuccess] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const response = await authAPI.getProfile();
            if (response.success) {
                setUser(response.user);
            }
        } catch (error) {
            console.error('Failed to fetch profile:', error);
        } finally {
            setLoading(false);
        }
    };

    const handlePasswordChange = async (e: React.FormEvent) => {
        e.preventDefault();
        setPasswordError('');
        setPasswordSuccess('');

        if (newPassword !== confirmPassword) {
            setPasswordError('New passwords do not match');
            return;
        }

        if (newPassword.length < 6) {
            setPasswordError('Password must be at least 6 characters long');
            return;
        }

        setIsSubmitting(true);

        try {
            const response = await authAPI.updatePassword({
                currentPassword,
                newPassword
            });

            if (response.success) {
                setPasswordSuccess('Password updated successfully');
                setCurrentPassword('');
                setNewPassword('');
                setConfirmPassword('');
            }
        } catch (error: any) {
            setPasswordError(error.message || 'Failed to update password');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) {
        return <div className="p-8 text-center">Loading settings...</div>;
    }

    return (
        <div>
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
                <p className="text-sm text-gray-600">Manage your account preferences</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Profile Information */}
                <div className="card h-fit">
                    <h2 className="text-lg font-bold text-gray-900 mb-4">Profile Information</h2>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                            <input
                                type="text"
                                value={user?.name || ''}
                                disabled
                                className="w-full border border-gray-300 rounded-lg px-4 py-2 bg-gray-50 text-gray-500"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                            <input
                                type="email"
                                value={user?.emailidoffical || ''}
                                disabled
                                className="w-full border border-gray-300 rounded-lg px-4 py-2 bg-gray-50 text-gray-500"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                            <input
                                type="text"
                                value={user?.role || ''}
                                disabled
                                className="w-full border border-gray-300 rounded-lg px-4 py-2 bg-gray-50 text-gray-500"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Employee Code</label>
                            <input
                                type="text"
                                value={user?.empcode || '-'}
                                disabled
                                className="w-full border border-gray-300 rounded-lg px-4 py-2 bg-gray-50 text-gray-500"
                            />
                        </div>
                    </div>
                </div>

                {/* Change Password */}
                <div className="card h-fit">
                    <h2 className="text-lg font-bold text-gray-900 mb-4">Change Password</h2>

                    <form onSubmit={handlePasswordChange} className="space-y-4">
                        {passwordError && (
                            <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">
                                {passwordError}
                            </div>
                        )}

                        {passwordSuccess && (
                            <div className="bg-green-50 text-green-600 p-3 rounded-lg text-sm">
                                {passwordSuccess}
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
                            <input
                                type="password"
                                value={currentPassword}
                                onChange={(e) => setCurrentPassword(e.target.value)}
                                required
                                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:border-[#468847]"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                            <input
                                type="password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                required
                                minLength={6}
                                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:border-[#468847]"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
                            <input
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                                minLength={6}
                                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:border-[#468847]"
                            />
                        </div>

                        <div className="pt-2">
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full bg-[#468847] hover:bg-[#3d7a3e] text-white font-medium py-2 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isSubmitting ? 'Updating...' : 'Update Password'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
