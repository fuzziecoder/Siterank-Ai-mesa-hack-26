import { cn } from '../lib/utils';

export const Logo = ({ className, size = 'default' }) => {
  const sizes = {
    sm: 'w-6 h-6',
    default: 'w-8 h-8',
    lg: 'w-10 h-10',
    xl: 'w-12 h-12'
  };

  return (
    <img 
      src="https://customer-assets.emergentagent.com/job_fa09b28c-310a-426e-b85f-18054a70d8a1/artifacts/yuu49tcl_image.png"
      alt="SITERANK AI Logo"
      className={cn(sizes[size], 'object-contain', className)}
    />
  );
};

export default Logo;
