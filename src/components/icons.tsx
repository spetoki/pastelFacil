import type { SVGProps } from "react";

export const Logo = (props: SVGProps<SVGSVGElement>) => (
    <svg 
        xmlns="http://www.w3.org/2000/svg" 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        {...props}
    >
        <path d="M12 2a10 10 0 0 0-10 10c0 5.52 4.48 10 10 10s10-4.48 10-10c0-5.52-4.48-10-10-10Z" />
        <path d="M12 2v20" />
        <path d="M12 12c4.42 0 8-2.69 8-6" />
        <path d="M12 12c-4.42 0-8-2.69-8-6" />
        <path d="M12 12c4.42 0 8 2.69 8 6" />
        <path d="M12 12c-4.42 0-8 2.69-8 6" />
    </svg>
);
