import React, { useState } from 'react';

const initialProfile = {
  name: 'Chamodi Dilki',
  patientId: '10234',
  email: 'chamodi@example.com',
  dob: '1998-05-12',
  gender: 'Female',
  phone: '+94 77 123 4567',
  address: 'Colombo, Sri Lanka',
  bloodGroup: 'O+',
  allergies: 'None',
  chronic: 'None',
};

const ProfilePage: React.FC = () => {
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [profile, setProfile] = useState(initialProfile);
  const [editing, setEditing] = useState<{[key: string]: boolean}>({});
  const [editValues, setEditValues] = useState<{[key: string]: string}>({});

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setAvatarUrl(ev.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleEdit = (field: string) => {
    setEditing({ ...editing, [field]: true });
    setEditValues({ ...editValues, [field]: profile[field as keyof typeof profile] });
  };

  const handleInputChange = (field: string, value: string) => {
    setEditValues({ ...editValues, [field]: value });
  };

  const handleSave = (field: string) => {
    setProfile({ ...profile, [field]: editValues[field] });
    setEditing({ ...editing, [field]: false });
  };

  const handleCancel = (field: string) => {
    setEditing({ ...editing, [field]: false });
    setEditValues({ ...editValues, [field]: profile[field as keyof typeof profile] });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#eaf1ff] to-[#f8fafc] flex justify-center items-center px-2 sm:px-4">
      <div className="w-full max-w-4xl mx-auto px-2 sm:px-6 py-6 sm:py-12">
        <div className="rounded-2xl bg-white/90 backdrop-blur-lg shadow-2xl p-4 sm:p-10 flex flex-col items-center gap-6 sm:gap-8 border border-[#e4e9fb]">
          <label htmlFor="avatar-upload" className="relative cursor-pointer group">
            <div className="h-24 w-24 sm:h-32 sm:w-32 rounded-full border-4 border-[#2a6bb7] bg-gradient-to-br from-[#eaf1ff] to-[#dbeafe] flex items-center justify-center text-3xl sm:text-4xl font-bold text-[#2a6bb7] shadow-xl overflow-hidden transition group-hover:brightness-95">
              {avatarUrl ? (
                <img src={avatarUrl} alt="Profile" className="h-full w-full object-cover rounded-full" />
              ) : (
                <span>CD</span>
              )}
              <span className="absolute bottom-2 right-2 sm:bottom-3 sm:right-3 bg-white/90 rounded-full px-2 sm:px-3 py-1 text-xs text-[#2a6bb7] shadow group-hover:bg-[#eaf1ff] transition border border-[#e4e9fb]">Change</span>
            </div>
            <input
              id="avatar-upload"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleAvatarChange}
            />
          </label>
          <div className="w-full flex flex-col sm:flex-row gap-2 sm:gap-3 items-center justify-center">
            {/* Name */}
            <div className="flex items-center gap-2">
              {editing.name ? (
                <input
                  className="text-2xl sm:text-4xl font-extrabold text-[#1b2b4b] tracking-tight bg-[#eaf1ff] rounded px-2 py-1 border border-[#2a6bb7] w-40 sm:w-64"
                  value={editValues.name}
                  onChange={e => handleInputChange('name', e.target.value)}
                  autoFocus
                />
              ) : (
                <span
                  className="text-2xl sm:text-4xl font-extrabold text-[#1b2b4b] tracking-tight cursor-pointer hover:bg-[#eaf1ff] rounded px-2 w-40 sm:w-64 truncate"
                  onClick={() => handleEdit('name')}
                  title="Click to edit"
                >{profile.name}</span>
              )}
              {editing.name && (
                <>
                  <button className="ml-2 text-xs px-2 py-1 rounded bg-[#2a6bb7] text-white" onClick={() => handleSave('name')}>Save</button>
                  <button className="ml-1 text-xs px-2 py-1 rounded bg-[#ffeaea] text-[#c0392b]" onClick={() => handleCancel('name')}>Cancel</button>
                </>
              )}
            </div>
            {/* Patient ID */}
            <div className="flex items-center gap-2">
              {editing.patientId ? (
                <input
                  className="text-xs sm:text-sm px-2 sm:px-4 py-1 rounded-full bg-[#eaf1ff] text-[#2a6bb7] font-semibold border border-[#2a6bb7] w-24 sm:w-40"
                  value={editValues.patientId}
                  onChange={e => handleInputChange('patientId', e.target.value)}
                  autoFocus
                />
              ) : (
                <span
                  className="text-xs sm:text-sm px-2 sm:px-4 py-1 rounded-full bg-[#eaf1ff] text-[#2a6bb7] font-semibold cursor-pointer w-24 sm:w-40 truncate"
                  onClick={() => handleEdit('patientId')}
                  title="Click to edit"
                >Patient ID {profile.patientId}</span>
              )}
              {editing.patientId && (
                <>
                  <button className="ml-2 text-xs px-2 py-1 rounded bg-[#2a6bb7] text-white" onClick={() => handleSave('patientId')}>Save</button>
                  <button className="ml-1 text-xs px-2 py-1 rounded bg-[#ffeaea] text-[#c0392b]" onClick={() => handleCancel('patientId')}>Cancel</button>
                </>
              )}
            </div>
            {/* Email */}
            <div className="flex items-center gap-2">
              {editing.email ? (
                <input
                  className="text-xs sm:text-sm px-2 sm:px-4 py-1 rounded-full bg-[#f5f8ff] text-[#6f7d95] font-semibold border border-[#2a6bb7] w-32 sm:w-56"
                  value={editValues.email}
                  onChange={e => handleInputChange('email', e.target.value)}
                  autoFocus
                />
              ) : (
                <span
                  className="text-xs sm:text-sm px-2 sm:px-4 py-1 rounded-full bg-[#f5f8ff] text-[#6f7d95] font-semibold cursor-pointer w-32 sm:w-56 truncate"
                  onClick={() => handleEdit('email')}
                  title="Click to edit"
                >{profile.email}</span>
              )}
              {editing.email && (
                <>
                  <button className="ml-2 text-xs px-2 py-1 rounded bg-[#2a6bb7] text-white" onClick={() => handleSave('email')}>Save</button>
                  <button className="ml-1 text-xs px-2 py-1 rounded bg-[#ffeaea] text-[#c0392b]" onClick={() => handleCancel('email')}>Cancel</button>
                </>
              )}
            </div>
          </div>
          <div className="w-full grid gap-6 sm:gap-8 grid-cols-1 sm:grid-cols-2 mt-8">
            <div className="rounded-xl bg-white/95 p-4 sm:p-6 shadow-md flex flex-col justify-center border border-[#e4e9fb]">
              <h2 className="text-lg font-semibold text-[#1b2b4b] mb-4">Personal Information</h2>
              <div className="space-y-3 sm:space-y-4 text-xs sm:text-sm text-[#526086]">
                {/* DOB */}
                <div className="flex justify-between items-center">
                  <span>Date of Birth:</span>
                  {editing.dob ? (
                    <input className="bg-[#eaf1ff] rounded px-2 py-1 border border-[#2a6bb7]" value={editValues.dob} onChange={e => handleInputChange('dob', e.target.value)} autoFocus />
                  ) : (
                    <span className="cursor-pointer hover:bg-[#eaf1ff] rounded px-2" onClick={() => handleEdit('dob')} title="Click to edit">{profile.dob}</span>
                  )}
                  {editing.dob && (
                    <>
                      <button className="ml-2 text-xs px-2 py-1 rounded bg-[#2a6bb7] text-white" onClick={() => handleSave('dob')}>Save</button>
                      <button className="ml-1 text-xs px-2 py-1 rounded bg-[#ffeaea] text-[#c0392b]" onClick={() => handleCancel('dob')}>Cancel</button>
                    </>
                  )}
                </div>
                {/* Gender */}
                <div className="flex justify-between items-center">
                  <span>Gender:</span>
                  {editing.gender ? (
                    <input className="bg-[#eaf1ff] rounded px-2 py-1 border border-[#2a6bb7]" value={editValues.gender} onChange={e => handleInputChange('gender', e.target.value)} autoFocus />
                  ) : (
                    <span className="cursor-pointer hover:bg-[#eaf1ff] rounded px-2" onClick={() => handleEdit('gender')} title="Click to edit">{profile.gender}</span>
                  )}
                  {editing.gender && (
                    <>
                      <button className="ml-2 text-xs px-2 py-1 rounded bg-[#2a6bb7] text-white" onClick={() => handleSave('gender')}>Save</button>
                      <button className="ml-1 text-xs px-2 py-1 rounded bg-[#ffeaea] text-[#c0392b]" onClick={() => handleCancel('gender')}>Cancel</button>
                    </>
                  )}
                </div>
                {/* Phone */}
                <div className="flex justify-between items-center">
                  <span>Phone:</span>
                  {editing.phone ? (
                    <input className="bg-[#eaf1ff] rounded px-2 py-1 border border-[#2a6bb7]" value={editValues.phone} onChange={e => handleInputChange('phone', e.target.value)} autoFocus />
                  ) : (
                    <span className="cursor-pointer hover:bg-[#eaf1ff] rounded px-2" onClick={() => handleEdit('phone')} title="Click to edit">{profile.phone}</span>
                  )}
                  {editing.phone && (
                    <>
                      <button className="ml-2 text-xs px-2 py-1 rounded bg-[#2a6bb7] text-white" onClick={() => handleSave('phone')}>Save</button>
                      <button className="ml-1 text-xs px-2 py-1 rounded bg-[#ffeaea] text-[#c0392b]" onClick={() => handleCancel('phone')}>Cancel</button>
                    </>
                  )}
                </div>
                {/* Address */}
                <div className="flex justify-between items-center">
                  <span>Address:</span>
                  {editing.address ? (
                    <input className="bg-[#eaf1ff] rounded px-2 py-1 border border-[#2a6bb7]" value={editValues.address} onChange={e => handleInputChange('address', e.target.value)} autoFocus />
                  ) : (
                    <span className="cursor-pointer hover:bg-[#eaf1ff] rounded px-2" onClick={() => handleEdit('address')} title="Click to edit">{profile.address}</span>
                  )}
                  {editing.address && (
                    <>
                      <button className="ml-2 text-xs px-2 py-1 rounded bg-[#2a6bb7] text-white" onClick={() => handleSave('address')}>Save</button>
                      <button className="ml-1 text-xs px-2 py-1 rounded bg-[#ffeaea] text-[#c0392b]" onClick={() => handleCancel('address')}>Cancel</button>
                    </>
                  )}
                </div>
              </div>
            </div>
            <div className="rounded-xl bg-white/95 p-4 sm:p-6 shadow-md flex flex-col justify-center border border-[#e4e9fb]">
              <h2 className="text-lg font-semibold text-[#1b2b4b] mb-4">Medical Info</h2>
              <div className="space-y-3 sm:space-y-4 text-xs sm:text-sm text-[#526086]">
                {/* Blood Group */}
                <div className="flex justify-between items-center">
                  <span>Blood Group:</span>
                  {editing.bloodGroup ? (
                    <input className="bg-[#eaf1ff] rounded px-2 py-1 border border-[#2a6bb7]" value={editValues.bloodGroup} onChange={e => handleInputChange('bloodGroup', e.target.value)} autoFocus />
                  ) : (
                    <span className="cursor-pointer hover:bg-[#eaf1ff] rounded px-2" onClick={() => handleEdit('bloodGroup')} title="Click to edit">{profile.bloodGroup}</span>
                  )}
                  {editing.bloodGroup && (
                    <>
                      <button className="ml-2 text-xs px-2 py-1 rounded bg-[#2a6bb7] text-white" onClick={() => handleSave('bloodGroup')}>Save</button>
                      <button className="ml-1 text-xs px-2 py-1 rounded bg-[#ffeaea] text-[#c0392b]" onClick={() => handleCancel('bloodGroup')}>Cancel</button>
                    </>
                  )}
                </div>
                {/* Allergies */}
                <div className="flex justify-between items-center">
                  <span>Allergies:</span>
                  {editing.allergies ? (
                    <input className="bg-[#eaf1ff] rounded px-2 py-1 border border-[#2a6bb7]" value={editValues.allergies} onChange={e => handleInputChange('allergies', e.target.value)} autoFocus />
                  ) : (
                    <span className="cursor-pointer hover:bg-[#eaf1ff] rounded px-2" onClick={() => handleEdit('allergies')} title="Click to edit">{profile.allergies}</span>
                  )}
                  {editing.allergies && (
                    <>
                      <button className="ml-2 text-xs px-2 py-1 rounded bg-[#2a6bb7] text-white" onClick={() => handleSave('allergies')}>Save</button>
                      <button className="ml-1 text-xs px-2 py-1 rounded bg-[#ffeaea] text-[#c0392b]" onClick={() => handleCancel('allergies')}>Cancel</button>
                    </>
                  )}
                </div>
                {/* Chronic */}
                <div className="flex justify-between items-center">
                  <span>Chronic Conditions:</span>
                  {editing.chronic ? (
                    <input className="bg-[#eaf1ff] rounded px-2 py-1 border border-[#2a6bb7]" value={editValues.chronic} onChange={e => handleInputChange('chronic', e.target.value)} autoFocus />
                  ) : (
                    <span className="cursor-pointer hover:bg-[#eaf1ff] rounded px-2" onClick={() => handleEdit('chronic')} title="Click to edit">{profile.chronic}</span>
                  )}
                  {editing.chronic && (
                    <>
                      <button className="ml-2 text-xs px-2 py-1 rounded bg-[#2a6bb7] text-white" onClick={() => handleSave('chronic')}>Save</button>
                      <button className="ml-1 text-xs px-2 py-1 rounded bg-[#ffeaea] text-[#c0392b]" onClick={() => handleCancel('chronic')}>Cancel</button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
          <div className="w-full mt-8 flex flex-col sm:flex-row gap-2 sm:gap-4">
            <button className="flex-1 rounded-lg bg-[#2a6bb7] px-4 sm:px-6 py-2 sm:py-3 text-white font-semibold shadow-lg hover:bg-[#1f4f8a] transition-all duration-150">Edit Profile</button>
            <button className="flex-1 rounded-lg bg-[#eaf1ff] px-4 sm:px-6 py-2 sm:py-3 text-[#2a6bb7] font-semibold border border-[#dbeafe] shadow-lg hover:bg-[#dbeafe] transition-all duration-150">Change Password</button>
            <button className="flex-1 rounded-lg bg-[#ffeaea] px-4 sm:px-6 py-2 sm:py-3 text-[#c0392b] font-semibold border border-[#ffd6d6] shadow-lg hover:bg-[#ffd6d6] transition-all duration-150">Logout</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
