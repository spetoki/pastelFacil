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
        <path d="M10.2 2.2c.2-.4.7-.4 1 0l1.4 2.9c.1.2.3.3.5.3h3.2c.4 0 .6.4.4.7l-2.6 1.9c-.2.1-.3.4-.2.6l1 3.2c.1.4-.2.7-.6.5l-2.7-2c-.2-.1-.5-.1-.7 0l-2.7 2c-.4.2-.8-.1-.6-.5l1-3.2c.1-.2 0-.5-.2-.6L5.6 6.1c-.2-.3 0-.7.4-.7h3.2c.2 0 .4-.1.5-.3l1.5-2.9Z" />
        <path d="m13.4 15.8.9-3c.1-.2 0-.5-.2-.6l-2.6-1.9c-.3-.2-.7 0-.4.4l2.1 2.5-1.7 5.6" />
        <path d="M12 22a9.92 9.92 0 0 0 8.5-5.03" />
        <path d="M3.5 16.97A9.92 9.92 0 0 0 12 22" />
    </svg>
);
