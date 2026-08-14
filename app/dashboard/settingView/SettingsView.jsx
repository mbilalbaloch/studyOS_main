'use client';

import { useState } from 'react';
import { User, Mail, Lock, Save, Camera, Loader2 } from 'lucide-react';

export default function SettingsView({ user, supabase }) {
  const [fullName, setFullName] = useState(user?.user_metadata?.full_name || '');
  const [newPassword, setNewPassword] = useState('');
  const [avatarUrl, setAvatarUrl] = useState(user?.user_metadata?.avatar_url || '');
  const [uploading, setUploading] = useState(false);
  const [settingsLoading, setSettingsLoading] = useState(false);
  const [settingsMessage, setSettingsMessage] = useState(null);

  const userInitial = fullName ? fullName.charAt(0).toUpperCase() : (user?.email ? user.email.charAt(0).toUpperCase() : 'B');

  // Handle Profile Picture Upload
  const handleAvatarChange = async (e) => {
    try {
      setUploading(true);
      setSettingsMessage(null);

      if (!e.target.files || e.target.files.length === 0) {
        throw new Error('You must select an image to upload.');
      }

      const file = e.target.files[0];
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      // Upload to Supabase 'avatars' bucket
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      // Get Public URL
      const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);
      const publicUrl = data.publicUrl;

      // Update user metadata immediately with new avatar
      const { error: updateError } = await supabase.auth.updateUser({
        data: { avatar_url: publicUrl }
      });

      if (updateError) throw updateError;

      setAvatarUrl(publicUrl);
      setSettingsMessage({ type: 'success', text: 'Profile picture updated successfully!' });
    } catch (error) {
      setSettingsMessage({ type: 'error', text: error.message });
    } finally {
      setUploading(false);
    }
  };

  // Handle Name and Password Update
  const handleUpdateSettings = async (e) => {
    e.preventDefault();
    setSettingsLoading(true);
    setSettingsMessage(null);

    const updateData = { data: { full_name: fullName, avatar_url: avatarUrl } };
    if (newPassword.trim().length > 0) {
      if (newPassword.length < 8) {
        setSettingsMessage({ type: 'error', text: 'Password must be at least 8 characters.' });
        setSettingsLoading(false);
        return;
      }
      updateData.password = newPassword;
    }

    const { error } = await supabase.auth.updateUser(updateData);

    if (error) {
      setSettingsMessage({ type: 'error', text: error.message });
    } else {
      setSettingsMessage({ type: 'success', text: 'Profile and settings updated successfully!' });
      setNewPassword('');
    }
    setSettingsLoading(false);
  };

  return (
    <>
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-zinc-100 uppercase mb-1">
          Profile & Settings
        </h1>
        <p className="text-sm text-zinc-400">
          Update your profile picture, display name, and account security.
        </p>
      </div>

      <div className="bg-[#0c0d10] border border-zinc-800/80 rounded-2xl p-6 md:p-8 shadow-xl">
        {settingsMessage && (
          <div className={`mb-6 p-3.5 text-sm rounded-xl text-center border ${
            settingsMessage.type === 'error' 
              ? 'text-red-400 bg-red-950/40 border-red-900/60' 
              : 'text-emerald-400 bg-emerald-950/40 border-emerald-900/60'
          }`}>
            {settingsMessage.text}
          </div>
        )}

        {/* Instagram/Facebook Style Profile Picture Section */}
        <div className="flex items-center gap-6 mb-8 pb-6 border-b border-zinc-800/80">
          <div className="relative group">
            <div className="w-20 h-20 rounded-full overflow-hidden bg-zinc-900 border-2 border-zinc-700/80 flex items-center justify-center text-zinc-200 font-bold text-2xl shadow-inner">
              {avatarUrl ? (
                <img src={avatarUrl} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <span>{userInitial}</span>
              )}
            </div>

            <label className="absolute inset-0 bg-black/60 rounded-full flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
              {uploading ? (
                <Loader2 size={20} className="animate-spin text-white" />
              ) : (
                <>
                  <Camera size={20} className="text-white mb-0.5" />
                  <span className="text-[10px] font-semibold text-white tracking-wider uppercase">Change</span>
                </>
              )}
              <input 
                type="file" 
                accept="image/*" 
                onChange={handleAvatarChange} 
                disabled={uploading}
                className="hidden" 
              />
            </label>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-zinc-200 mb-1">Profile Photo</h3>
            <p className="text-xs text-zinc-400 mb-3">Click your avatar to upload a new photo from your device.</p>
            <label className="inline-flex items-center gap-2 px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700/80 rounded-xl text-xs font-medium text-zinc-200 cursor-pointer transition-all">
              <span>{uploading ? 'Uploading...' : 'Upload new photo'}</span>
              <input 
                type="file" 
                accept="image/*" 
                onChange={handleAvatarChange} 
                disabled={uploading}
                className="hidden" 
              />
            </label>
          </div>
        </div>

        {/* Form Fields */}
        <form onSubmit={handleUpdateSettings} className="space-y-6">
          <div>
            <label className="block text-[13px] font-medium text-zinc-300 mb-2">
              Email Address (Account ID)
            </label>
            <div className="flex items-center gap-3 w-full px-4 py-3 bg-black/60 border border-zinc-800/80 rounded-xl text-zinc-400 text-sm">
              <Mail size={16} className="text-zinc-500" />
              <span>{user?.email}</span>
            </div>
          </div>

          <div>
            <label className="block text-[13px] font-medium text-zinc-300 mb-2">
              Profile Name
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-zinc-500">
                <User size={16} />
              </span>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Enter your name"
                className="w-full pl-11 pr-4 py-3 bg-black border border-zinc-800 rounded-xl text-zinc-100 placeholder-zinc-600 text-sm focus:outline-none focus:ring-1 focus:ring-zinc-500 focus:border-zinc-500 transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-[13px] font-medium text-zinc-300 mb-2">
              New Password
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-zinc-500">
                <Lock size={16} />
              </span>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Leave blank to keep current password"
                className="w-full pl-11 pr-4 py-3 bg-black border border-zinc-800 rounded-xl text-zinc-100 placeholder-zinc-600 text-sm focus:outline-none focus:ring-1 focus:ring-zinc-500 focus:border-zinc-500 transition-all"
              />
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              disabled={settingsLoading}
              className="py-3 px-6 bg-zinc-100 hover:bg-white active:scale-[0.98] text-zinc-950 font-semibold rounded-xl text-sm transition-all shadow-lg flex items-center gap-2 cursor-pointer"
            >
              <Save size={16} />
              <span>{settingsLoading ? 'Saving...' : 'Save profile'}</span>
            </button>
          </div>
        </form>
      </div>
    </>
  );
}