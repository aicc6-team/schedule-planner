interface AvatarProps {
  src?: string;
  alt?: string;
  name?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  status?: 'online' | 'offline' | 'away';
}

const sizeClasses = {
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-12 h-12 text-base',
  xl: 'w-16 h-16 text-lg',
};

const statusClasses = {
  online: 'bg-green-400',
  offline: 'bg-secondary-400',
  away: 'bg-yellow-400',
};

export default function Avatar({ 
  src, 
  alt, 
  name, 
  size = 'md',
  status 
}: AvatarProps) {
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="relative inline-block">
      <div className={`${sizeClasses[size]} rounded-full bg-secondary-200 flex items-center justify-center font-medium text-secondary-700 overflow-hidden`}>
        {src ? (
          <img 
            src={src} 
            alt={alt || name || 'Avatar'} 
            className="w-full h-full object-cover"
          />
        ) : name ? (
          getInitials(name)
        ) : (
          '?'
        )}
      </div>
      
      {status && (
        <span className={`absolute bottom-0 right-0 block ${statusClasses[status]} ring-2 ring-white rounded-full ${
          size === 'sm' ? 'w-2 h-2' :
          size === 'md' ? 'w-2.5 h-2.5' :
          size === 'lg' ? 'w-3 h-3' : 'w-4 h-4'
        }`} />
      )}
    </div>
  );
} 