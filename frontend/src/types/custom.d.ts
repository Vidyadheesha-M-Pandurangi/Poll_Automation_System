declare module '@radix-ui/react-checkbox';
declare module '@radix-ui/react-scroll-area';
declare module '@radix-ui/react-toggle-group';
declare module 'vaul';
declare module 'katex';
declare module 'file-saver';
declare module 'motion/react';
// Generic fallbacks for ai-components
declare module '../ai-components/*' {
  const Component: any;
  export default Component;
}
// Course store path fallbacks (should be real file but declare anyway)
declare module '@/lib/store/course-store';
declare module '../lib/store/course-store'; 