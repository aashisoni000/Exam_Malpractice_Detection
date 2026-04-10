// pages/NotFound.jsx
// 404 catch-all page for unmatched routes.

import { Link } from 'react-router-dom';
import { ShieldCheckIcon } from '../components/Icons';

const NotFound = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 px-4">
      <div className="text-center max-w-md">
        {/* Icon */}
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-slate-800/60 border border-slate-700/40 mb-6">
          <ShieldCheckIcon className="w-10 h-10 text-slate-600" />
        </div>

        {/* Heading */}
        <h1 className="text-7xl font-bold text-slate-700 mb-2">404</h1>
        <h2 className="text-xl font-semibold text-white mb-3">Page Not Found</h2>
        <p className="text-slate-400 text-sm mb-8 leading-relaxed">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
          Please check the URL or navigate back.
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link to="/login" className="btn-primary no-underline">
            Go to Login
          </Link>
          <button
            onClick={() => window.history.back()}
            className="text-sm text-slate-400 hover:text-white transition-colors duration-200 
                       border border-slate-700/40 hover:border-slate-600 px-6 py-3 rounded-xl"
          >
            Go Back
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
