import React from 'react';
import { BrandLogo } from '../../../components/common/BrandLogo';

export const LandingFooter: React.FC = () => {
  return (
    <footer className="bg-white border-t border-gray-100 py-10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        
        {/* Left: Brand */}
        <BrandLogo size="sm" />

        {/* Right: Copyright */}
        <div className="text-[13px] text-gray-400 font-medium text-center sm:text-right">
          &copy; 2026 BOIM. All rights reserved.
        </div>

      </div>
    </footer>
  );
};
