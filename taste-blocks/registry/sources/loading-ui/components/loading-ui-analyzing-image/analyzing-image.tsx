"use client";

import { motion, useReducedMotion } from "motion/react";

import { cn } from "../../lib/utils";

import type { Transition } from "motion/react";

const transition: Transition = {
  duration: 2.5,
  ease: [0.175, 0.885, 0.32, 1],
  times: [0, 0.6, 0.6, 1],
  repeat: Infinity,
  repeatType: "mirror",
  repeatDelay: 0.2,
};

function AnalyzingImage({ className, ...props }: React.ComponentProps<"div">) {
  const shouldAnimate = useReducedMotion() === false;

  return (
    <div
      role="status"
      aria-label="Analyzing image"
      className={cn("relative isolate shrink-0", className)}
      {...props}
    >
      <style>{`
        @media (forced-colors: active) {
          .loading-ui-analyzing-image-motion {
            display: none;
          }
        }
      `}</style>
      <motion.div
        aria-hidden="true"
        initial={{
          clipPath: "inset(0% 0% 0% 0%)",
        }}
        whileInView={
          shouldAnimate
            ? {
                clipPath: [
                  "inset(0% 0% 0% 0%)",
                  "inset(0% 105% 0% 0%)",
                  "inset(0% 105% 0% 0%)",
                  "inset(0% 0% 0% 0%)",
                ],
              }
            : undefined
        }
        transition={transition}
        viewport={{ amount: 0.01 }}
        className="loading-ui-analyzing-image-motion absolute inset-0 z-10 bg-[var(--loading-ui-analyzing-image-background,var(--background))]"
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="size-full"
        >
          <path
            d="M4.27209 20.7279L10.8686 14.1314C11.2646 13.7354 11.4627 13.5373 11.691 13.4632C11.8918 13.3979 12.1082 13.3979 12.309 13.4632C12.5373 13.5373 12.7354 13.7354 13.1314 14.1314L19.6839 20.6839M14 15L16.8686 12.1314C17.2646 11.7354 17.4627 11.5373 17.691 11.4632C17.8918 11.3979 18.1082 11.3979 18.309 11.4632C18.5373 11.5373 18.7354 11.7354 19.1314 12.1314L22 15M10 9C10 10.1046 9.10457 11 8 11C6.89543 11 6 10.1046 6 9C6 7.89543 6.89543 7 8 7C9.10457 7 10 7.89543 10 9ZM6.8 21H17.2C18.8802 21 19.7202 21 20.362 20.673C20.9265 20.3854 21.3854 19.9265 21.673 19.362C22 18.7202 22 17.8802 22 16.2V7.8C22 6.11984 22 5.27976 21.673 4.63803C21.3854 4.07354 20.9265 3.6146 20.362 3.32698C19.7202 3 18.8802 3 17.2 3H6.8C5.11984 3 4.27976 3 3.63803 3.32698C3.07354 3.6146 2.6146 4.07354 2.32698 4.63803C2 5.27976 2 6.11984 2 7.8V16.2C2 17.8802 2 18.7202 2.32698 19.362C2.6146 19.9265 3.07354 20.3854 3.63803 20.673C4.27976 21 5.11984 21 6.8 21Z"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </motion.div>
      <motion.div
        aria-hidden="true"
        initial={{ transform: "translateX(1400%)" }}
        whileInView={
          shouldAnimate
            ? {
                transform: [
                  "translateX(1400%)",
                  "translateX(-80%)",
                  "translateX(-80%)",
                  "translateX(1400%)",
                ],
              }
            : undefined
        }
        transition={transition}
        viewport={{ amount: 0.01 }}
        className="loading-ui-analyzing-image-motion absolute z-10 h-full w-[7%] rounded-full bg-current"
      />
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="absolute inset-0 size-full"
      >
        <path
          d="M6.8 21H17.2C18.8802 21 19.7202 21 20.362 20.673C20.9265 20.3854 21.3854 19.9265 21.673 19.362C22 18.7202 22 17.8802 22 16.2V7.8C22 6.11984 22 5.27976 21.673 4.63803C21.3854 4.07354 20.9265 3.6146 20.362 3.32698C19.7202 3 18.8802 3 17.2 3H6.8C5.11984 3 4.27976 3 3.63803 3.32698C3.07354 3.6146 2.6146 4.07354 2.32698 4.63803C2 5.27976 2 6.11984 2 7.8V16.2C2 17.8802 2 18.7202 2.32698 19.362C2.6146 19.9265 3.07354 20.3854 3.63803 20.673C4.27976 21 5.11984 21 6.8 21Z"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <rect x="6" y="19" width="1" height="1" fill="currentColor" />
        <rect x="7" y="18" width="1" height="1" fill="currentColor" />
        <rect x="7" y="19" width="3" height="1" fill="currentColor" />
        <rect x="9" y="18" width="1" height="1" fill="currentColor" />
        <rect x="14" y="19" width="3" height="1" fill="currentColor" />
        <rect x="15" y="18" width="1" height="1" fill="currentColor" />
        <rect x="5" y="18" width="2" height="1" fill="currentColor" />
        <rect x="5" y="17" width="1" height="1" fill="currentColor" />
        <rect x="10" y="19" width="1" height="1" fill="currentColor" />
        <rect x="7" y="17" width="1" height="1" fill="currentColor" />
        <rect x="11" y="19" width="1" height="1" fill="currentColor" />
        <rect x="10" y="18" width="1" height="1" fill="currentColor" />
        <rect x="17" y="19" width="1" height="1" fill="currentColor" />
        <rect x="15" y="4" width="2" height="1" fill="currentColor" />
        <rect x="3" y="9" width="1" height="3" fill="currentColor" />
        <rect x="4" y="10" width="1" height="2" fill="currentColor" />
        <rect x="6" y="9" width="1" height="1" fill="currentColor" />
        <rect x="15" y="5" width="1" height="1" fill="currentColor" />
        <rect x="20" y="8" width="1" height="3" fill="currentColor" />
        <rect x="19" y="9" width="1" height="1" fill="currentColor" />
        <rect x="7" y="13" width="1" height="1" fill="currentColor" />
        <rect x="9" y="11" width="1" height="1" fill="currentColor" />
        <rect x="16" y="12" width="1" height="2" fill="currentColor" />
        <rect x="13" y="14" width="1" height="1" fill="currentColor" />
        <rect x="12" y="11" width="1" height="1" fill="currentColor" />
        <rect x="10" y="9" width="1" height="1" fill="currentColor" />
        <rect x="10" y="15" width="1" height="1" fill="currentColor" />
        <rect x="10" y="13" width="1" height="1" fill="currentColor" />
        <rect x="15" y="9" width="1" height="1" fill="currentColor" />
        <rect x="13" y="10" width="1" height="1" fill="currentColor" />
        <rect x="12" y="14" width="1" height="1" fill="currentColor" />
        <rect x="5" y="4" width="3" height="1" fill="currentColor" />
        <rect x="6" y="5" width="1" height="1" fill="currentColor" />
        <rect x="7" y="14" width="1" height="2" fill="currentColor" />
        <rect x="6" y="14" width="3" height="1" fill="currentColor" />
        <rect x="16" y="8" width="1" height="1" fill="currentColor" />
        <rect x="8" y="9" width="1" height="1" fill="currentColor" />
        <rect x="20" y="16" width="1" height="1" fill="currentColor" />
        <rect x="12" y="12" width="1" height="1" fill="currentColor" />
        <rect x="8" y="8" width="1" height="1" fill="currentColor" />
        <rect x="14" y="12" width="1" height="1" fill="currentColor" />
        <rect x="17" y="16" width="2" height="1" fill="currentColor" />
        <rect x="14" y="17" width="1" height="1" fill="currentColor" />
        <rect x="11" y="5" width="3" height="1" fill="currentColor" />
        <rect x="12" y="4" width="1" height="1" fill="currentColor" />
        <rect x="12" y="7" width="1" height="1" fill="currentColor" />
        <rect x="7" y="11" width="1" height="1" fill="currentColor" />
        <rect x="15" y="15" width="1" height="1" fill="currentColor" />
        <rect x="11" y="11" width="1" height="1" fill="currentColor" />
        <rect x="13" y="9" width="1" height="1" fill="currentColor" />
        <rect x="12" y="15" width="1" height="1" fill="currentColor" />
        <rect x="9" y="12" width="2" height="1" fill="currentColor" />
        <rect x="19" y="13" width="2" height="1" fill="currentColor" />
        <rect x="9" y="6" width="1" height="1" fill="currentColor" />
        <rect x="20" y="4" width="1" height="1" fill="currentColor" />
        <rect x="19" y="4" width="1" height="1" fill="currentColor" />
        <rect x="3" y="15" width="1" height="2" fill="currentColor" />
        <rect x="3" y="19" width="1" height="1" fill="currentColor" />
      </svg>
      <span className="sr-only">Analyzing image</span>
    </div>
  );
}

export { AnalyzingImage };
