
// import React, { useState, useEffect } from 'react';
// import Navbar from '../components/Navbar';
// import Sidebar from '../components/Sidebar';
// import { 
//   User, Mail, Briefcase, GraduationCap, MapPin, 
//   Save, RefreshCw, CheckCircle2, Shield, Lock
// } from 'lucide-react';
// import { AuthService } from '../services/api';

// export default function Profile() {
//   const [loading, setLoading] = useState(true);
//   const [saving, setSaving] = useState(false);
//   const [successMessage, setSuccessMessage] = useState(null);

//   const [formData, setFormData] = useState({
//     full_name: 'Asha Candidate',
//     email: 'asha@swipex.ai',
//     title: 'Software Development Engineer (B.Tech CSM)',
//     location: 'Bengaluru, India',
//     bio: 'Passionate computer science engineer specializing in AI/ML solutions, Python backend architecture, and dynamic web applications.',
//     preferred_role: 'Full Stack & Backend Developer',
//     experience_level: 'Entry Level (Fresher / 2027 Grad)',
//     github_url: 'https://github.com/ashacandidate',
//     linkedin_url: 'https://linkedin.com/in/ashacandidate'
//   });

//   useEffect(() => {
//     loadUserProfile();
//   }, []);

//   const loadUserProfile = async () => {
//     setLoading(true);
//     try {
//       const user = await AuthService.getCurrentUser();
//       if (user) {
//         setFormData(prev => ({
//           ...prev,
//           full_name: user.full_name || user.name || prev.full_name,
//           email: user.email || prev.email,
//           title: user.title || prev.title,
//           location: user.location || prev.location
//         }));
//       }
//     } catch (err) {
//       console.warn("Backend offline, using local profile state:", err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleInputChange = (e) => {
//     const { name, value } = e.target;
//     setFormData(prev => ({ ...prev, [name]: value }));
//   };

//   const handleSaveProfile = async (e) => {
//     e.preventDefault();
//     setSaving(true);
//     setSuccessMessage(null);

//     try {
//       // API call placeholder for profile update
//       await new Promise(resolve => setTimeout(resolve, 600));
//       setSuccessMessage("Profile preferences updated successfully!");
//     } catch (err) {
//       console.warn("Save profile notice:", err);
//     } finally {
//       setSaving(false);
//     }
//   };

//   return (
//     <div className="min-h-screen bg-[#FFF5EE] text-zinc-900 flex flex-col font-sans selection:bg-orange-500 selection:text-white">
//       {/* Top Navbar */}
//       <Navbar />

//       <div className="flex flex-1">
//         {/* Left Sidebar */}
//         <Sidebar />

//         {/* Main Content Workspace */}
//         <main className="flex-1 p-8 max-w-5xl space-y-8">
//           {/* Header */}
//           <div>
//             <h1 className="text-2xl font-black text-zinc-950 tracking-tight">
//               Profile & <span className="text-orange-500">Preferences</span>
//             </h1>
//             <p className="text-xs text-zinc-500 font-medium mt-1">
//               Manage your personal information, career target roles, and profile settings
//             </p>
//           </div>

//           {/* Alert Message */}
//           {successMessage && (
//             <div className="p-4 bg-orange-50 border border-orange-200/80 rounded-2xl flex items-center gap-3 text-xs font-bold text-orange-700">
//               <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-orange-500" />
//               <span>{successMessage}</span>
//             </div>
//           )}

//           {loading ? (
//             <div className="text-center py-20 space-y-3">
//               <RefreshCw className="w-8 h-8 text-orange-500 animate-spin mx-auto" />
//               <p className="text-xs font-bold text-zinc-400">Loading profile data...</p>
//             </div>
//           ) : (
//             <form onSubmit={handleSaveProfile} className="space-y-6">
              
//               {/* Account Identity Card */}
//               <div className="bg-white p-6 rounded-3xl border border-orange-200/80 shadow-xs space-y-6">
//                 <div className="flex items-center gap-4">
//                   <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-500 text-white font-black text-xl flex items-center justify-center shadow-md shadow-orange-500/20">
//                     {formData.full_name.charAt(0)}
//                   </div>
//                   <div>
//                     <h2 className="text-lg font-black text-zinc-950">{formData.full_name}</h2>
//                     <p className="text-xs font-bold text-orange-600">{formData.title}</p>
//                   </div>
//                 </div>

//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
//                   <div className="space-y-1.5">
//                     <label className="text-xs font-black text-zinc-700 uppercase tracking-wider flex items-center gap-1.5">
//                       <User className="w-3.5 h-3.5 text-orange-500" /> Full Name
//                     </label>
//                     <input 
//                       type="text"
//                       name="full_name"
//                       value={formData.full_name}
//                       onChange={handleInputChange}
//                       className="w-full bg-orange-50/40 border border-orange-200/80 rounded-2xl px-4 py-2.5 text-xs font-bold text-zinc-800 focus:outline-none focus:border-orange-500 transition"
//                     />
//                   </div>

//                   <div className="space-y-1.5">
//                     <label className="text-xs font-black text-zinc-700 uppercase tracking-wider flex items-center gap-1.5">
//                       <Mail className="w-3.5 h-3.5 text-orange-500" /> Email Address
//                     </label>
//                     <input 
//                       type="email"
//                       name="email"
//                       value={formData.email}
//                       onChange={handleInputChange}
//                       className="w-full bg-orange-50/40 border border-orange-200/80 rounded-2xl px-4 py-2.5 text-xs font-bold text-zinc-800 focus:outline-none focus:border-orange-500 transition"
//                     />
//                   </div>
//                 </div>
//               </div>

//               {/* Career Preferences */}
//               <div className="bg-white p-6 rounded-3xl border border-orange-200/80 shadow-xs space-y-4">
//                 <h3 className="text-xs font-black text-zinc-950 uppercase tracking-wider flex items-center gap-2">
//                   <Briefcase className="w-4 h-4 text-orange-500" /> Career & Role Objectives
//                 </h3>

//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                   <div className="space-y-1.5">
//                     <label className="text-xs font-black text-zinc-700 uppercase tracking-wider">Target Position Title</label>
//                     <input 
//                       type="text"
//                       name="preferred_role"
//                       value={formData.preferred_role}
//                       onChange={handleInputChange}
//                       className="w-full bg-orange-50/40 border border-orange-200/80 rounded-2xl px-4 py-2.5 text-xs font-bold text-zinc-800 focus:outline-none focus:border-orange-500 transition"
//                     />
//                   </div>

//                   <div className="space-y-1.5">
//                     <label className="text-xs font-black text-zinc-700 uppercase tracking-wider">Experience Level</label>
//                     <input 
//                       type="text"
//                       name="experience_level"
//                       value={formData.experience_level}
//                       onChange={handleInputChange}
//                       className="w-full bg-orange-50/40 border border-orange-200/80 rounded-2xl px-4 py-2.5 text-xs font-bold text-zinc-800 focus:outline-none focus:border-orange-500 transition"
//                     />
//                   </div>

//                   <div className="md:col-span-2 space-y-1.5">
//                     <label className="text-xs font-black text-zinc-700 uppercase tracking-wider">Professional Summary / Bio</label>
//                     <textarea 
//                       name="bio"
//                       rows={3}
//                       value={formData.bio}
//                       onChange={handleInputChange}
//                       className="w-full bg-orange-50/40 border border-orange-200/80 rounded-2xl p-4 text-xs font-bold text-zinc-800 focus:outline-none focus:border-orange-500 transition"
//                     />
//                   </div>
//                 </div>
//               </div>

//               {/* Action Button */}
//               <div className="flex justify-end">
//                 <button
//                   type="submit"
//                   disabled={saving}
//                   className="px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-2xl text-xs font-bold flex items-center gap-2 shadow-xs transition cursor-pointer disabled:opacity-50"
//                 >
//                   {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
//                   <span>Save Profile Preferences</span>
//                 </button>
//               </div>

//             </form>
//           )}
//         </main>
//       </div>
//     </div>
//   );
// }

import React, { useState, useEffect, useCallback } from 'react';
import { 
  User, FileText, Briefcase, Award, Settings, UploadCloud, 
  Trash2, CheckCircle2, Sparkles, Plus, X, Lock, Bell, 
  Building2, GraduationCap, DollarSign, MapPin, RefreshCw, Eye
} from 'lucide-react';
import { 
  getCurrentUser, 
  getResumes, 
  uploadResume, 
  setActiveVersion, 
  deleteResume,
  getNotificationPreferences,
  updateNotificationPreferences
} from '../services/api';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';

export default function Profile() {
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'resumes' | 'preferences' | 'security'
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [savingPrefs, setSavingPrefs] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  // 1. User Info State
  const [user, setUser] = useState({
    name: 'Alex Morgan',
    email: 'alex.morgan@example.com',
    role: 'Computer Science & ML Engineer',
    location: 'San Francisco, CA (Open to Remote)',
    phone: '+1 (555) 234-5678',
    github: 'https://github.com/alexmorgan',
    linkedin: 'https://linkedin.com/in/alexmorgan',
    completion_rate: 85
  });

  // 2. Resumes State
  const [resumes, setResumes] = useState([]);

  // 3. Career & Skills Preferences State
  const [targetTitles, setTargetTitles] = useState(['Python Developer', 'Full Stack Engineer', 'ML Specialist']);
  const [newTitleInput, setNewTitleInput] = useState('');
  const [skills, setSkills] = useState(['Python', 'React', 'FastAPI', 'Node.js', 'PostgreSQL', 'Docker', 'Tailwind CSS']);
  const [newSkillInput, setNewSkillInput] = useState('');
  const [workplaceType, setWorkplaceType] = useState({ remote: true, hybrid: true, onsite: false });
  const [salaryRange, setSalaryRange] = useState({ min: 80000, max: 140000 });

  // 4. Notification & Alert Preferences State
  const [notificationPrefs, setNotificationPrefs] = useState({
    enabled_types: ['high_match', 'instant_job', 'startup_hiring'],
    channels: ['in_app', 'email'],
    match_threshold: 80
  });

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Fetch initial profile data
  const loadProfileData = useCallback(async () => {
    try {
      setLoading(true);
      
      // Load current user
      const userData = await getCurrentUser().catch(() => null);
      if (userData) {
        setUser((prev) => ({
          ...prev,
          name: userData.name || prev.name,
          email: userData.email || prev.email,
        }));
      }

      // Load uploaded resumes
      const resumeList = await getResumes().catch(() => []);
      if (Array.isArray(resumeList)) {
        setResumes(resumeList);
      } else if (resumeList && resumeList.items) {
        setResumes(resumeList.items);
      }

      // Load alert preferences
      const prefs = await getNotificationPreferences().catch(() => null);
      if (prefs) {
        setNotificationPrefs({
          enabled_types: prefs.enabled_types || ['high_match'],
          channels: prefs.channels || ['in_app'],
          match_threshold: prefs.match_threshold ?? 80
        });
      }
    } catch (err) {
      console.error('Failed to load profile data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProfileData();
  }, [loadProfileData]);

  // Handle Resume File Upload
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append('file', file);
      
      await uploadResume(formData);
      showToast('Resume uploaded and parsed successfully!');
      
      // Refresh resume list
      const updatedResumes = await getResumes().catch(() => []);
      setResumes(Array.isArray(updatedResumes) ? updatedResumes : updatedResumes.items || []);
    } catch (err) {
      console.error('Failed to upload resume:', err);
      showToast('Upload failed. Please ensure file is PDF or DOCX.');
    } finally {
      setUploading(false);
    }
  };

  // Set active resume version
  const handleActivateResume = async (resumeId) => {
    try {
      await setActiveVersion(resumeId);
      setResumes((prev) =>
        prev.map((r) => ({ ...r, is_active: r.id === resumeId }))
      );
      showToast('Primary active resume updated!');
    } catch (err) {
      console.error('Failed to set active resume:', err);
    }
  };

  // Delete resume version
  const handleDeleteResume = async (resumeId) => {
    try {
      await deleteResume(resumeId);
      setResumes((prev) => prev.filter((r) => r.id !== resumeId));
      showToast('Resume version removed.');
    } catch (err) {
      console.error('Failed to delete resume:', err);
    }
  };

  // Save Alert Preferences
  const handleSaveNotificationPrefs = async (e) => {
    e.preventDefault();
    try {
      setSavingPrefs(true);
      await updateNotificationPreferences(notificationPrefs);
      showToast('Notification & match threshold saved!');
    } catch (err) {
      console.error('Failed to update preferences:', err);
    } finally {
      setSavingPrefs(false);
    }
  };

  // Add / Remove Tags
  const addTargetTitle = () => {
    if (newTitleInput.trim() && !targetTitles.includes(newTitleInput.trim())) {
      setTargetTitles([...targetTitles, newTitleInput.trim()]);
      setNewTitleInput('');
    }
  };

  const removeTargetTitle = (title) => {
    setTargetTitles(targetTitles.filter((t) => t !== title));
  };

  const addSkill = () => {
    if (newSkillInput.trim() && !skills.includes(newSkillInput.trim())) {
      setSkills([...skills, newSkillInput.trim()]);
      setNewSkillInput('');
    }
  };

  const removeSkill = (skill) => {
    setSkills(skills.filter((s) => s !== skill));
  };

  return (
    <div className="min-h-screen bg-[#FFF5EE] text-zinc-900 flex flex-col font-sans selection:bg-orange-500 selection:text-white">
      <Navbar />

      {/* Toast Notification Popup */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 bg-zinc-950 text-white px-4 py-3 rounded-2xl shadow-xl text-xs font-bold flex items-center gap-2 animate-bounce">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          {toastMessage}
        </div>
      )}

      <div className="flex flex-1">
        <Sidebar />

        <main className="flex-1 p-6 max-w-5xl mx-auto w-full space-y-6">
          
          {/* SECTION 1: HEADER & PROFILE SUMMARY */}
          <div className="bg-white border border-orange-200/80 rounded-3xl p-6 shadow-2xs space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-500 text-white flex items-center justify-center font-black text-2xl shadow-md shadow-orange-500/20">
                  {user.name.split(' ').map((n) => n[0]).join('')}
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h1 className="text-xl font-black text-zinc-950">{user.name}</h1>
                    <span className="bg-emerald-100 text-emerald-800 text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full border border-emerald-200">
                      Open to Work
                    </span>
                  </div>
                  <p className="text-xs text-zinc-500 font-bold">{user.role}</p>
                  <p className="text-[11px] text-zinc-400 font-medium flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-orange-500" /> {user.location} &bull; {user.email}
                  </p>
                </div>
              </div>

              <div className="w-full sm:w-auto bg-orange-50/60 p-3 rounded-2xl border border-orange-200/80 space-y-1.5">
                <div className="flex justify-between items-center text-[10px] font-black uppercase text-zinc-500 tracking-wider">
                  <span>Profile Strength</span>
                  <span className="text-orange-600">{user.completion_rate}%</span>
                </div>
                <div className="w-36 h-2 bg-orange-100 rounded-full overflow-hidden">
                  <div className="h-full bg-orange-500 rounded-full" style={{ width: `${user.completion_rate}%` }} />
                </div>
              </div>
            </div>

            {/* TAB NAVIGATION BUTTONS */}
            <div className="flex gap-2 border-t border-orange-100 pt-4 overflow-x-auto text-xs font-bold">
              {[
                { id: 'overview', label: 'Overview & Skills', icon: User },
                { id: 'resumes', label: 'Resume Hub', icon: FileText },
                { id: 'preferences', label: 'Career Preferences', icon: Briefcase },
                { id: 'alerts', label: 'Alert Settings', icon: Bell },
              ].map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-4 py-2 rounded-xl transition flex items-center gap-2 cursor-pointer shrink-0 ${
                      isActive
                        ? 'bg-orange-500 text-white shadow-xs'
                        : 'text-zinc-600 hover:bg-orange-50'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-zinc-400'}`} />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* SECTION 2: TAB 1 - OVERVIEW & VERIFIED SKILLS */}
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Verified Technical Skills */}
              <div className="md:col-span-2 bg-white border border-orange-200/80 rounded-3xl p-6 shadow-2xs space-y-4">
                <h3 className="text-xs font-black uppercase text-zinc-950 tracking-wider flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-orange-500" /> Verified Technical Skills ({skills.length})
                </h3>
                <p className="text-xs text-zinc-500 font-medium">
                  Skills extracted from your active resume and used during AI ATS job match evaluations:
                </p>

                <div className="flex flex-wrap gap-2 pt-2">
                  {skills.map((skill) => (
                    <span
                      key={skill}
                      className="text-xs font-bold bg-orange-50 text-orange-800 border border-orange-200/80 px-3 py-1.5 rounded-xl flex items-center gap-1.5"
                    >
                      {skill}
                      <button onClick={() => removeSkill(skill)} className="hover:text-rose-600 cursor-pointer">
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </span>
                  ))}
                </div>

                <div className="flex gap-2 pt-3 border-t border-orange-100">
                  <input
                    type="text"
                    value={newSkillInput}
                    onChange={(e) => setNewSkillInput(e.target.value)}
                    placeholder="Add a new skill (e.g., GraphQL, AWS)..."
                    className="flex-1 p-2.5 bg-orange-50/40 border border-orange-200/80 rounded-xl text-xs font-medium focus:outline-none focus:border-orange-500"
                  />
                  <button
                    onClick={addSkill}
                    className="px-4 py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs rounded-xl shadow-xs cursor-pointer flex items-center gap-1"
                  >
                    <Plus className="w-4 h-4" /> Add Skill
                  </button>
                </div>
              </div>

              {/* Background Summary */}
              <div className="bg-white border border-orange-200/80 rounded-3xl p-6 shadow-2xs space-y-4">
                <h3 className="text-xs font-black uppercase text-zinc-950 tracking-wider flex items-center gap-2">
                  <GraduationCap className="w-4 h-4 text-orange-500" /> Education & Links
                </h3>
                
                <div className="space-y-3 text-xs font-medium text-zinc-600">
                  <div>
                    <p className="font-black text-zinc-900">B.Tech in Computer Science (CSM)</p>
                    <p className="text-zinc-400">Class of 2027</p>
                  </div>
                  
                  <div className="pt-2 border-t border-orange-100 space-y-1">
                    <p className="font-bold text-zinc-900">Portfolio & Profiles</p>
                    <p><a href={user.github} target="_blank" rel="noreferrer" className="text-orange-600 hover:underline">GitHub Profile</a></p>
                    <p><a href={user.linkedin} target="_blank" rel="noreferrer" className="text-orange-600 hover:underline">LinkedIn Profile</a></p>
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* SECTION 3: TAB 2 - RESUME HUB */}
          {activeTab === 'resumes' && (
            <div className="space-y-6">
              
              {/* Drag and Drop Uploader */}
              <div className="bg-white border-2 border-dashed border-orange-300 hover:border-orange-500 rounded-3xl p-8 text-center space-y-3 transition bg-orange-50/20">
                <UploadCloud className="w-10 h-10 text-orange-500 mx-auto" />
                <div>
                  <h3 className="text-sm font-black text-zinc-950">Upload New Resume Version</h3>
                  <p className="text-xs text-zinc-500 font-medium mt-0.5">Supports PDF and DOCX files up to 5MB</p>
                </div>

                <label className="inline-block px-5 py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs rounded-xl cursor-pointer shadow-xs transition">
                  {uploading ? 'Parsing Resume...' : 'Browse Computer'}
                  <input type="file" accept=".pdf,.docx" onChange={handleFileUpload} disabled={uploading} className="hidden" />
                </label>
              </div>

              {/* Uploaded Resumes List */}
              <div className="bg-white border border-orange-200/80 rounded-3xl p-6 shadow-2xs space-y-4">
                <h3 className="text-xs font-black uppercase text-zinc-950 tracking-wider flex items-center gap-2">
                  <FileText className="w-4 h-4 text-orange-500" /> Resume Versions ({resumes.length})
                </h3>

                {loading ? (
                  <div className="py-8 text-center text-zinc-400 text-xs font-medium">
                    <RefreshCw className="w-5 h-5 animate-spin mx-auto text-orange-500 mb-2" />
                    Loading resume versions...
                  </div>
                ) : resumes.length === 0 ? (
                  <div className="py-8 text-center text-zinc-400 text-xs font-medium">
                    No resumes uploaded yet. Upload one above to enable AI job matching!
                  </div>
                ) : (
                  <div className="space-y-3">
                    {resumes.map((resume) => (
                      <div
                        key={resume.id}
                        className={`p-4 rounded-2xl border transition flex items-center justify-between gap-4 ${
                          resume.is_active
                            ? 'bg-orange-50/60 border-orange-300 shadow-2xs'
                            : 'bg-white border-orange-200/80 hover:border-orange-300'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`p-2.5 rounded-xl ${resume.is_active ? 'bg-orange-500 text-white' : 'bg-orange-100 text-orange-600'}`}>
                            <FileText className="w-5 h-5" />
                          </div>

                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="text-xs font-black text-zinc-950">{resume.filename || 'Uploaded_Resume.pdf'}</h4>
                              {resume.is_active && (
                                <span className="text-[9px] font-black uppercase bg-orange-500 text-white px-2 py-0.5 rounded-md">
                                  Primary Active
                                </span>
                              )}
                            </div>
                            <p className="text-[10px] text-zinc-400 font-medium">
                              Uploaded on {resume.created_at ? new Date(resume.created_at).toLocaleDateString() : 'Recent'}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          {!resume.is_active && (
                            <button
                              onClick={() => handleActivateResume(resume.id)}
                              className="px-3 py-1.5 bg-orange-100 hover:bg-orange-200 text-orange-800 text-xs font-bold rounded-xl transition cursor-pointer"
                            >
                              Make Active
                            </button>
                          )}

                          <button
                            onClick={() => handleDeleteResume(resume.id)}
                            className="p-2 text-zinc-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition cursor-pointer"
                            title="Delete Version"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>
          )}

          {/* SECTION 4: TAB 3 - CAREER PREFERENCES */}
          {activeTab === 'preferences' && (
            <div className="bg-white border border-orange-200/80 rounded-3xl p-6 shadow-2xs space-y-6">
              
              {/* Target Job Titles */}
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase text-zinc-400 tracking-wider block">
                  Target Job Titles
                </label>
                <div className="flex flex-wrap gap-2">
                  {targetTitles.map((title) => (
                    <span key={title} className="text-xs font-bold bg-orange-50 text-orange-800 border border-orange-200/80 px-3 py-1.5 rounded-xl flex items-center gap-1.5">
                      {title}
                      <button onClick={() => removeTargetTitle(title)} className="hover:text-rose-600 cursor-pointer">
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </span>
                  ))}
                </div>

                <div className="flex gap-2 max-w-md">
                  <input
                    type="text"
                    value={newTitleInput}
                    onChange={(e) => setNewTitleInput(e.target.value)}
                    placeholder="Add job title (e.g., Backend Developer)..."
                    className="flex-1 p-2.5 bg-orange-50/40 border border-orange-200/80 rounded-xl text-xs font-medium focus:outline-none focus:border-orange-500"
                  />
                  <button onClick={addTargetTitle} className="px-4 py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs rounded-xl shadow-xs cursor-pointer">
                    Add
                  </button>
                </div>
              </div>

              {/* Workplace Arrangement */}
              <div className="space-y-3 pt-4 border-t border-orange-100">
                <label className="text-[10px] font-black uppercase text-zinc-400 tracking-wider block">
                  Workplace Preference
                </label>
                <div className="flex gap-4 text-xs font-bold">
                  {[
                    { key: 'remote', label: 'Remote' },
                    { key: 'hybrid', label: 'Hybrid' },
                    { key: 'onsite', label: 'On-site' },
                  ].map((item) => (
                    <label key={item.key} className="flex items-center gap-2 cursor-pointer p-2.5 bg-orange-50/40 border border-orange-100 rounded-xl">
                      <input
                        type="checkbox"
                        checked={workplaceType[item.key]}
                        onChange={(e) => setWorkplaceType({ ...workplaceType, [item.key]: e.target.checked })}
                        className="accent-orange-500 rounded"
                      />
                      <span className="text-zinc-800">{item.label}</span>
                    </label>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* SECTION 5: TAB 4 - ALERT SETTINGS */}
          {activeTab === 'alerts' && (
            <div className="bg-white border border-orange-200/80 rounded-3xl p-6 shadow-2xs space-y-6">
              <form onSubmit={handleSaveNotificationPrefs} className="space-y-5 text-xs font-bold">
                
                {/* Threshold Slider */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] uppercase text-zinc-400 font-black tracking-wider block">
                      Minimum AI Match Score Threshold
                    </label>
                    <span className="text-orange-600 font-black">{notificationPrefs.match_threshold}% Match</span>
                  </div>
                  <input
                    type="range"
                    min="50"
                    max="100"
                    value={notificationPrefs.match_threshold}
                    onChange={(e) => setNotificationPrefs({ ...notificationPrefs, match_threshold: parseInt(e.target.value) })}
                    className="w-full accent-orange-500 cursor-pointer"
                  />
                </div>

                <div className="pt-3 border-t border-orange-100">
                  <button
                    type="submit"
                    disabled={savingPrefs}
                    className="px-5 py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl shadow-xs cursor-pointer flex items-center gap-2"
                  >
                    {savingPrefs ? <RefreshCw className="w-4 h-4 animate-spin" /> : 'Save Alert Thresholds'}
                  </button>
                </div>
              </form>
            </div>
          )}

        </main>
      </div>
    </div>
  );
}