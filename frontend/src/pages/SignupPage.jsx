import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  User,
  Mail,
  Lock,
  Upload,
  ArrowRight,
  FileText,
  X,
  Chrome,
} from "lucide-react";

import { useApp } from "../context/AppContext";

export function SignupPage() {
  const { signup, addToast } = useApp();

  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "Full Stack Developer",
    experience: "Fresher",
    resumeName: "",
    resumeFile: null,
  });

  const [isLoading, setIsLoading] = useState(false);

  // ============================================================
  // GOOGLE SIGNUP / LOGIN
  // ============================================================

  const handleGoogleSignup = () => {
    const authBaseUrl =
      import.meta.env.VITE_AUTH_API_BASE_URL ||
      "http://127.0.0.1:5001/api/v1";

    window.location.href =
      `${authBaseUrl}/auth/google`;
  };

  // ============================================================
  // INPUT CHANGE
  // ============================================================

  const handleInputChange = (e) => {
    const {
      name,
      value,
    } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // ============================================================
  // RESUME SELECTION
  // ============================================================

  const handleResumeSelect = (e) => {
    const selectedFile =
      e.target.files?.[0];

    if (!selectedFile) {
      return;
    }

    const validType =
      /\.(pdf|docx|doc)$/i.test(
        selectedFile.name
      );

    if (!validType) {
      addToast(
        "Please upload a PDF or DOCX file.",
        "error"
      );

      e.target.value = "";
      return;
    }

    const maxSize =
      10 * 1024 * 1024;

    if (selectedFile.size > maxSize) {
      addToast(
        "Resume must be smaller than 10MB.",
        "error"
      );

      e.target.value = "";
      return;
    }

    setFormData((prev) => ({
      ...prev,
      resumeName:
        selectedFile.name,
      resumeFile:
        selectedFile,
    }));

    addToast(
      `Selected ${selectedFile.name}`,
      "info"
    );
  };

  // ============================================================
  // REMOVE RESUME
  // ============================================================

  const handleRemoveResume = () => {
    setFormData((prev) => ({
      ...prev,
      resumeName: "",
      resumeFile: null,
    }));

    const input =
      document.getElementById(
        "signup-resume"
      );

    if (input) {
      input.value = "";
    }
  };

  // ============================================================
  // SUBMIT
  // ============================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    setIsLoading(true);

    try {
      const ok =
        await signup(formData);

      if (ok) {
        navigate("/");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // ============================================================
  // UI
  // ============================================================

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12">

      <div className="w-full max-w-lg bg-white rounded-2xl border border-slate-200 shadow-md p-8 sm:p-10 space-y-6 animate-in fade-in zoom-in-95 duration-200">

        {/* ====================================================
            HEADER
        ===================================================== */}

        <div className="text-center space-y-1.5">

          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-emerald-600 text-white font-bold text-xl shadow-xs mb-1">
            SX
          </div>

          <div>

            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Create your account
            </h1>

            <p className="text-xs font-semibold text-emerald-700 uppercase tracking-wider mt-0.5">
              SwipeX Job Discovery
            </p>

          </div>

          <p className="text-xs text-slate-500 pt-1">
            Join candidates discovering
            opportunities through
            intelligent swipe discovery
          </p>

        </div>

        {/* ====================================================
            GOOGLE SIGNUP
        ===================================================== */}

        <button
          type="button"
          onClick={handleGoogleSignup}
          disabled={isLoading}
          id="btn-google-signup"
          className="w-full flex items-center justify-center gap-3 py-3 px-4 bg-white hover:bg-slate-50 disabled:opacity-50 border border-slate-300 text-slate-700 rounded-xl text-xs font-bold shadow-sm transition-all"
        >

          <Chrome className="w-4 h-4" />

          <span>
            Continue with Google
          </span>

        </button>

        {/* ====================================================
            DIVIDER
        ===================================================== */}

        <div className="relative flex items-center justify-center">

          <div className="border-t border-slate-200 w-full" />

          <span className="bg-white px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400 absolute">
            Or create account with email
          </span>

        </div>

        {/* ====================================================
            SIGNUP FORM
        ===================================================== */}

        <form
          onSubmit={handleSubmit}
          className="space-y-4"
        >

          {/* NAME */}

          <div>

            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
              Full Name
            </label>

            <div className="relative">

              <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />

              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="e.g. Rahul Sharma"
                required
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors"
              />

            </div>

          </div>

          {/* EMAIL */}

          <div>

            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
              Email Address
            </label>

            <div className="relative">

              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />

              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="name@example.com"
                required
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors"
              />

            </div>

          </div>

          {/* PASSWORD */}

          <div>

            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
              Password
            </label>

            <div className="relative">

              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />

              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="••••••••"
                required
                minLength={6}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors"
              />

            </div>

          </div>

          {/* ROLE + EXPERIENCE */}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

            <div>

              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                Target Role
              </label>

              <select
                name="role"
                value={formData.role}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              >

                <option value="Frontend Developer">
                  Frontend Developer
                </option>

                <option value="Full Stack Developer">
                  Full Stack Developer
                </option>

                <option value="AI / ML Engineer">
                  AI / ML Engineer
                </option>

                <option value="Backend Developer">
                  Backend Developer
                </option>

                <option value="Data Scientist">
                  Data Scientist
                </option>

              </select>

            </div>

            <div>

              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                Experience Level
              </label>

              <select
                name="experience"
                value={formData.experience}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              >

                <option value="Fresher">
                  Fresher (0 Years)
                </option>

                <option value="0-1 Year">
                  0-1 Year
                </option>

                <option value="1-3 Years">
                  1-3 Years
                </option>

                <option value="3-5 Years">
                  3-5 Years
                </option>

                <option value="5+ Years">
                  5+ Years
                </option>

              </select>

            </div>

          </div>

          {/* RESUME UPLOAD */}

          <div>

            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
              Resume (Optional, for ATS matching)
            </label>

            {!formData.resumeFile ? (

              <div className="relative">

                <input
                  type="file"
                  accept=".pdf,.docx,.doc"
                  onChange={handleResumeSelect}
                  id="signup-resume"
                  className="hidden"
                />

                <label
                  htmlFor="signup-resume"
                  className="flex items-center justify-between p-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl cursor-pointer transition-colors"
                >

                  <div className="flex items-center gap-2 text-xs font-medium text-slate-600">

                    <Upload className="w-4 h-4 text-emerald-600" />

                    <span>
                      Upload PDF or DOCX resume
                    </span>

                  </div>

                  <span className="text-xs font-semibold text-emerald-700">
                    Browse
                  </span>

                </label>

              </div>

            ) : (

              <div className="flex items-center justify-between p-3 bg-emerald-50 border border-emerald-200 rounded-xl">

                <div className="flex items-center gap-3 min-w-0">

                  <div className="w-9 h-9 rounded-lg bg-white border border-emerald-200 flex items-center justify-center shrink-0">

                    <FileText className="w-4 h-4 text-emerald-600" />

                  </div>

                  <div className="min-w-0">

                    <p className="text-xs font-bold text-slate-900 truncate">
                      {formData.resumeName}
                    </p>

                    <p className="text-[11px] text-slate-500">
                      {(
                        formData.resumeFile.size /
                        (1024 * 1024)
                      ).toFixed(2)}{" "}
                      MB • Ready to upload
                    </p>

                  </div>

                </div>

                <button
                  type="button"
                  onClick={handleRemoveResume}
                  disabled={isLoading}
                  className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                  title="Remove resume"
                >

                  <X className="w-4 h-4" />

                </button>

              </div>

            )}

          </div>

          {/* SUBMIT */}

          <button
            type="submit"
            disabled={isLoading}
            id="btn-signup-submit"
            className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-xs active:scale-98 transition-all"
          >

            <span>
              {isLoading
                ? "Creating Account..."
                : "Create Account"}
            </span>

            {!isLoading && (
              <ArrowRight className="w-4 h-4" />
            )}

          </button>

        </form>

        {/* FOOTER */}

        <div className="text-center pt-2 border-t border-slate-100">

          <p className="text-xs text-slate-500">

            Already have an account?{" "}

            <Link
              to="/login"
              className="text-emerald-700 font-bold hover:underline"
            >
              Log in
            </Link>

          </p>

        </div>

      </div>
    </div>
  );
}

export default SignupPage;







// import React, { useState } from "react";
// import { Link, useNavigate } from "react-router-dom";
// import {
//   User,
//   Mail,
//   Lock,
//   Upload,
//   ArrowRight,
//   FileText,
//   X,
// } from "lucide-react";

// import { useApp } from "../context/AppContext";

// export function SignupPage() {
//   const { signup, addToast } = useApp();

//   const navigate = useNavigate();

//   const [formData, setFormData] = useState({
//     name: "",
//     email: "",
//     password: "",
//     role: "Full Stack Developer",
//     experience: "Fresher",

//     // Display name
//     resumeName: "",

//     // Actual File object
//     resumeFile: null,
//   });

//   const [isLoading, setIsLoading] =
//     useState(false);

//   // ============================================================
//   // INPUT CHANGE
//   // ============================================================

//   const handleInputChange = (e) => {
//     const {
//       name,
//       value,
//     } = e.target;

//     setFormData((prev) => ({
//       ...prev,
//       [name]: value,
//     }));
//   };

//   // ============================================================
//   // RESUME SELECTION
//   // ============================================================

//   const handleResumeSelect = (e) => {
//     const selectedFile =
//       e.target.files?.[0];

//     if (!selectedFile) {
//       return;
//     }

//     // Validate extension
//     const validType =
//       /\.(pdf|docx|doc)$/i.test(
//         selectedFile.name
//       );

//     if (!validType) {
//       addToast(
//         "Please upload a PDF or DOCX file.",
//         "error"
//       );

//       e.target.value = "";
//       return;
//     }

//     // 10 MB maximum
//     const maxSize =
//       10 * 1024 * 1024;

//     if (selectedFile.size > maxSize) {
//       addToast(
//         "Resume must be smaller than 10MB.",
//         "error"
//       );

//       e.target.value = "";
//       return;
//     }

//     setFormData((prev) => ({
//       ...prev,
//       resumeName:
//         selectedFile.name,
//       resumeFile:
//         selectedFile,
//     }));

//     addToast(
//       `Selected ${selectedFile.name}`,
//       "info"
//     );
//   };

//   // ============================================================
//   // REMOVE RESUME
//   // ============================================================

//   const handleRemoveResume = () => {
//     setFormData((prev) => ({
//       ...prev,
//       resumeName: "",
//       resumeFile: null,
//     }));

//     const input =
//       document.getElementById(
//         "signup-resume"
//       );

//     if (input) {
//       input.value = "";
//     }
//   };

//   // ============================================================
//   // SUBMIT
//   // ============================================================

//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     setIsLoading(true);

//     try {
//       const ok =
//         await signup(formData);

//       if (ok) {
//         navigate("/");
//       }
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   // ============================================================
//   // UI
//   // ============================================================

//   return (
//     <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12">

//       <div className="w-full max-w-lg bg-white rounded-2xl border border-slate-200 shadow-md p-8 sm:p-10 space-y-6 animate-in fade-in zoom-in-95 duration-200">

//         {/* ====================================================
//             HEADER
//         ===================================================== */}

//         <div className="text-center space-y-1.5">

//           <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-emerald-600 text-white font-bold text-xl shadow-xs mb-1">
//             SX
//           </div>

//           <div>

//             <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
//               Create your account
//             </h1>

//             <p className="text-xs font-semibold text-emerald-700 uppercase tracking-wider mt-0.5">
//               SwipeX Job Discovery
//             </p>

//           </div>

//           <p className="text-xs text-slate-500 pt-1">
//             Join candidates discovering
//             opportunities through
//             intelligent swipe discovery
//           </p>

//         </div>

//         {/* ====================================================
//             SIGNUP FORM
//         ===================================================== */}

//         <form
//           onSubmit={handleSubmit}
//           className="space-y-4"
//         >

//           {/* ==================================================
//               NAME
//           =================================================== */}

//           <div>

//             <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
//               Full Name
//             </label>

//             <div className="relative">

//               <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />

//               <input
//                 type="text"
//                 name="name"
//                 value={formData.name}
//                 onChange={
//                   handleInputChange
//                 }
//                 placeholder="e.g. Rahul Sharma"
//                 required
//                 className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors"
//               />

//             </div>

//           </div>

//           {/* ==================================================
//               EMAIL
//           =================================================== */}

//           <div>

//             <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
//               Email Address
//             </label>

//             <div className="relative">

//               <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />

//               <input
//                 type="email"
//                 name="email"
//                 value={formData.email}
//                 onChange={
//                   handleInputChange
//                 }
//                 placeholder="name@example.com"
//                 required
//                 className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors"
//               />

//             </div>

//           </div>

//           {/* ==================================================
//               PASSWORD
//           =================================================== */}

//           <div>

//             <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
//               Password
//             </label>

//             <div className="relative">

//               <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />

//               <input
//                 type="password"
//                 name="password"
//                 value={formData.password}
//                 onChange={
//                   handleInputChange
//                 }
//                 placeholder="••••••••"
//                 required
//                 minLength={6}
//                 className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors"
//               />

//             </div>

//           </div>

//           {/* ==================================================
//               ROLE + EXPERIENCE
//           =================================================== */}

//           <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

//             <div>

//               <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
//                 Target Role
//               </label>

//               <select
//                 name="role"
//                 value={formData.role}
//                 onChange={
//                   handleInputChange
//                 }
//                 className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
//               >

//                 <option value="Frontend Developer">
//                   Frontend Developer
//                 </option>

//                 <option value="Full Stack Developer">
//                   Full Stack Developer
//                 </option>

//                 <option value="AI / ML Engineer">
//                   AI / ML Engineer
//                 </option>

//                 <option value="Backend Developer">
//                   Backend Developer
//                 </option>

//                 <option value="Data Scientist">
//                   Data Scientist
//                 </option>

//               </select>

//             </div>

//             <div>

//               <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
//                 Experience Level
//               </label>

//               <select
//                 name="experience"
//                 value={formData.experience}
//                 onChange={
//                   handleInputChange
//                 }
//                 className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
//               >

//                 <option value="Fresher">
//                   Fresher (0 Years)
//                 </option>

//                 <option value="0-1 Year">
//                   0-1 Year
//                 </option>

//                 <option value="1-3 Years">
//                   1-3 Years
//                 </option>

//                 <option value="3-5 Years">
//                   3-5 Years
//                 </option>

//                 <option value="5+ Years">
//                   5+ Years
//                 </option>

//               </select>

//             </div>

//           </div>

//           {/* ==================================================
//               RESUME UPLOAD
//           =================================================== */}

//           <div>

//             <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
//               Resume (Optional, for ATS matching)
//             </label>

//             {!formData.resumeFile ? (

//               <div className="relative">

//                 <input
//                   type="file"
//                   accept=".pdf,.docx,.doc"
//                   onChange={
//                     handleResumeSelect
//                   }
//                   id="signup-resume"
//                   className="hidden"
//                 />

//                 <label
//                   htmlFor="signup-resume"
//                   className="flex items-center justify-between p-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl cursor-pointer transition-colors"
//                 >

//                   <div className="flex items-center gap-2 text-xs font-medium text-slate-600">

//                     <Upload className="w-4 h-4 text-emerald-600" />

//                     <span>
//                       Upload PDF or DOCX resume
//                     </span>

//                   </div>

//                   <span className="text-xs font-semibold text-emerald-700">
//                     Browse
//                   </span>

//                 </label>

//               </div>

//             ) : (

//               <div className="flex items-center justify-between p-3 bg-emerald-50 border border-emerald-200 rounded-xl">

//                 <div className="flex items-center gap-3 min-w-0">

//                   <div className="w-9 h-9 rounded-lg bg-white border border-emerald-200 flex items-center justify-center shrink-0">

//                     <FileText className="w-4 h-4 text-emerald-600" />

//                   </div>

//                   <div className="min-w-0">

//                     <p className="text-xs font-bold text-slate-900 truncate">
//                       {formData.resumeName}
//                     </p>

//                     <p className="text-[11px] text-slate-500">
//                       {(
//                         formData.resumeFile
//                           .size /
//                         (1024 * 1024)
//                       ).toFixed(2)}{" "}
//                       MB • Ready to upload
//                     </p>

//                   </div>

//                 </div>

//                 <button
//                   type="button"
//                   onClick={
//                     handleRemoveResume
//                   }
//                   disabled={isLoading}
//                   className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
//                   title="Remove resume"
//                 >

//                   <X className="w-4 h-4" />

//                 </button>

//               </div>

//             )}

//           </div>

//           {/* ==================================================
//               SUBMIT
//           =================================================== */}

//           <button
//             type="submit"
//             disabled={isLoading}
//             id="btn-signup-submit"
//             className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-xs active:scale-98 transition-all"
//           >

//             <span>
//               {isLoading
//                 ? "Creating Account..."
//                 : "Create Account"}
//             </span>

//             {!isLoading && (
//               <ArrowRight className="w-4 h-4" />
//             )}

//           </button>

//         </form>

//         {/* ====================================================
//             FOOTER
//         ===================================================== */}

//         <div className="text-center pt-2 border-t border-slate-100">

//           <p className="text-xs text-slate-500">

//             Already have an account?{" "}

//             <Link
//               to="/login"
//               className="text-emerald-700 font-bold hover:underline"
//             >
//               Log in
//             </Link>

//           </p>

//         </div>

//       </div>

//     </div>
//   );
// }

// export default SignupPage;