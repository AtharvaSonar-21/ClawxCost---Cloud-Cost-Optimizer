import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { apiPut } from '@/api/client'

export default function ProfileSettings() {
  const { user, updateProfileState } = useAuth()

  // Profile fields state
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [bio, setBio] = useState('')
  const [picture, setPicture] = useState('')
  const [email, setEmail] = useState('')

  // Password fields state
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  // UI state
  const [profileLoading, setProfileLoading] = useState(false)
  const [profileError, setProfileError] = useState('')
  const [profileSuccess, setProfileSuccess] = useState('')

  const [passwordLoading, setPasswordLoading] = useState(false)
  const [passwordError, setPasswordError] = useState('')
  const [passwordSuccess, setPasswordSuccess] = useState('')

  // Determine if it is a Google OAuth account (no password set)
  const isGoogleAccount = !user?.googleId ? false : true

  // Load user data on mount
  useEffect(() => {
    if (user) {
      setName(user.name || '')
      setEmail(user.email || '')
      setPhone(user.phone || '')
      setBio(user.bio || '')
      setPicture(user.picture || '')
    }
  }, [user])

  // Process image upload to Base64
  const handleAvatarChange = (e) => {
    const file = e.target.files[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      setProfileError('Please upload an image file.')
      return
    }

    if (file.size > 2 * 1024 * 1024) {
      setProfileError('Image size must be less than 2MB.')
      return
    }

    const reader = new FileReader()
    reader.onload = (event) => {
      setPicture(event.target.result)
      setProfileSuccess('Avatar updated locally. Remember to click Save Changes.')
    }
    reader.readAsDataURL(file)
  }

  // Handle profile form submit
  const handleProfileSubmit = async (e) => {
    e.preventDefault()
    setProfileError('')
    setProfileSuccess('')
    setProfileLoading(true)

    // Validations
    if (!name.trim() || name.trim().length < 2 || name.trim().length > 50) {
      setProfileError('Name must be between 2 and 50 characters.')
      setProfileLoading(false)
      return
    }

    if (phone && !/^\+?[0-9\s\-()]{7,15}$/.test(phone.trim())) {
      setProfileError('Invalid phone number format.')
      setProfileLoading(false)
      return
    }

    if (bio && bio.length > 300) {
      setProfileError('Bio must not exceed 300 characters.')
      setProfileLoading(false)
      return
    }

    try {
      const response = await apiPut('/auth/profile', {
        name: name.trim(),
        phone: phone.trim() || null,
        bio: bio.trim() || null,
        picture,
      })

      if (response.success) {
        // Sync context
        updateProfileState(response.data)
        setProfileSuccess('Profile saved successfully!')
      } else {
        setProfileError(response.message || 'Failed to update profile.')
      }
    } catch (err) {
      setProfileError(err.message || 'An error occurred.')
    } finally {
      setProfileLoading(false)
    }
  }

  // Handle password form submit
  const handlePasswordSubmit = async (e) => {
    e.preventDefault()
    setPasswordError('')
    setPasswordSuccess('')
    setPasswordLoading(true)

    // Validations
    if (!newPassword || newPassword.length < 8) {
      setPasswordError('New password must be at least 8 characters long.')
      setPasswordLoading(false)
      return
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('Passwords do not match.')
      setPasswordLoading(false)
      return
    }

    try {
      const response = await apiPut('/auth/change-password', {
        currentPassword: isGoogleAccount && !user?.passwordHash ? undefined : currentPassword,
        newPassword,
      })

      if (response.success) {
        setPasswordSuccess('Password changed successfully!')
        setCurrentPassword('')
        setNewPassword('')
        setConfirmPassword('')
      } else {
        setPasswordError(response.message || 'Failed to change password.')
      }
    } catch (err) {
      setPasswordError(err.message || 'An error occurred.')
    } finally {
      setPasswordLoading(false)
    }
  }

  // Generate fallback avatar initials
  const initials = name
    ? name
        .split(' ')
        .map((n) => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : 'CC'

  return (
    <div className="space-y-8">
      <h1 className="app-section-title">Account Settings</h1>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Profile Card */}
        <div className="lg:col-span-7 app-card space-y-6">
          <h2 className="text-xl font-pixel text-pixel-teal border-b border-pixel-teal pb-2">
            Edit Profile
          </h2>

          {profileError && (
            <div className="p-3 bg-pixel-coral text-pixel-darker border-2 border-pixel-coral font-pixel text-xs">
              {profileError}
            </div>
          )}

          {profileSuccess && (
            <div className="p-3 bg-pixel-teal text-pixel-darker border-2 border-pixel-teal font-pixel text-xs">
              {profileSuccess}
            </div>
          )}

          <form onSubmit={handleProfileSubmit} className="space-y-6">
            {/* Avatar section */}
            <div className="flex flex-col sm:flex-row items-center gap-4 border-2 border-dashed border-pixel-teal/40 p-4 bg-pixel-black/40">
              <div className="relative">
                {picture ? (
                  <img
                    src={picture}
                    alt="Avatar"
                    className="w-20 h-20 border-2 border-pixel-teal object-cover image-rendering-pixelated"
                  />
                ) : (
                  <div className="w-20 h-20 bg-pixel-purple border-2 border-pixel-teal flex items-center justify-center font-pixel text-lg text-white">
                    {initials}
                  </div>
                )}
              </div>
              <div className="text-center sm:text-left space-y-2 flex-1">
                <p className="font-pixel text-[11px] opacity-75">Upload Avatar (Max 2MB)</p>
                <label className="inline-block px-3 py-1.5 bg-pixel-teal text-pixel-darker border-2 border-pixel-teal font-pixel text-[10px] cursor-pointer hover:opacity-85">
                  Choose File
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-pixel text-[10px] opacity-75 mb-1.5">Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Full Name"
                  required
                  className="app-input"
                />
              </div>

              <div>
                <label className="block font-pixel text-[10px] opacity-75 mb-1.5">Email Address</label>
                <input
                  type="email"
                  value={email}
                  disabled
                  title="Email cannot be changed"
                  className="app-input opacity-50 cursor-not-allowed"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-pixel text-[10px] opacity-75 mb-1.5">Phone (Optional)</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+1-123-456-7890"
                  className="app-input"
                />
              </div>

              <div>
                <label className="block font-pixel text-[10px] opacity-75 mb-1.5">Role</label>
                <input
                  type="text"
                  value={user?.role?.toUpperCase() || 'USER'}
                  disabled
                  className="app-input opacity-50 cursor-not-allowed uppercase"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="font-pixel text-[10px] opacity-75">Bio / About</label>
                <span className="font-mono text-xs opacity-60">{bio.length}/300</span>
              </div>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value.slice(0, 300))}
                placeholder="Tell us about yourself..."
                rows={3}
                className="app-input w-full resize-none py-2"
              />
            </div>

            <button
              type="submit"
              disabled={profileLoading}
              className="app-btn-primary py-2.5 sm:w-auto px-6"
            >
              {profileLoading ? 'Saving...' : 'Save Changes'}
            </button>
          </form>
        </div>

        {/* Security / Password Card */}
        <div className="lg:col-span-5 app-card space-y-6">
          <h2 className="text-xl font-pixel text-pixel-coral border-b border-pixel-coral pb-2">
            Change Password
          </h2>

          {passwordError && (
            <div className="p-3 bg-pixel-coral text-pixel-darker border-2 border-pixel-coral font-pixel text-xs">
              {passwordError}
            </div>
          )}

          {passwordSuccess && (
            <div className="p-3 bg-pixel-teal text-pixel-darker border-2 border-pixel-teal font-pixel text-xs">
              {passwordSuccess}
            </div>
          )}

          {isGoogleAccount && (
            <div className="p-2.5 bg-pixel-purple/30 border border-pixel-purple text-xs font-mono mb-2">
              Note: This account is linked to Google. Establishing a password allows you to login with both Google and email/password in the future.
            </div>
          )}

          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            {!isGoogleAccount && (
              <div>
                <label className="block font-pixel text-[10px] opacity-75 mb-1.5">Current Password</label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Current Password"
                  required
                  className="app-input"
                />
              </div>
            )}

            <div>
              <label className="block font-pixel text-[10px] opacity-75 mb-1.5">New Password</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="New Password"
                required
                className="app-input"
              />
            </div>

            <div>
              <label className="block font-pixel text-[10px] opacity-75 mb-1.5">Confirm New Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm New Password"
                required
                className="app-input"
              />
            </div>

            <button
              type="submit"
              disabled={passwordLoading}
              className="w-full py-2 bg-pixel-coral border-2 border-pixel-coral hover:opacity-85 text-pixel-darker font-pixel text-xs disabled:opacity-50 cursor-pointer transition-opacity"
            >
              {passwordLoading ? 'Updating...' : 'Update Password'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
