import { cn } from '../lib/utils';

export const Logo = ({ className, size = 'default', circular = false }) => {
  const sizes = {
    sm: 'w-8 h-8',
    default: 'w-10 h-10',
    lg: 'w-12 h-12',
    xl: 'w-14 h-14',
    '2xl': 'w-16 h-16'
  };

  if (circular) {
    return (
      <div className={cn(
        "rounded-full overflow-hidden bg-gradient-to-br from-gray-500 to-gray-700 p-[2px]",
        sizes[size],
        className
      )}>
        <div className="w-full h-full rounded-full overflow-hidden bg-background flex items-center justify-center">
          <img 
            src="https://customer-assets.emergentagent.com/job_fa09b28c-310a-426e-b85f-18054a70d8a1/artifacts/yuu49tcl_image.png"
            alt="SITERANK AI Logo"
            className="w-3/4 h-3/4 object-contain"
          />
        </div>
      </div>
    );
  }

  return (
    <img 
      src="https://customer-assets.emergentagent.com/job_fa09b28c-310a-426e-b85f-18054a70d8a1/artifacts/yuu49tcl_image.png"
      alt="SITERANK AI Logo"
      className={cn(sizes[size], 'object-contain', className)}
    />
  );
};

export default Logo;
