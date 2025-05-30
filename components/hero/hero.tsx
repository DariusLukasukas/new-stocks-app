"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, Variants } from "motion/react";

const TICKERS = [
  {
    label: "NVDA",
    value: "Nvidia Corporation",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 18 18">
        <g clipPath="url(#a)">
          <path fill="url(#b)" d="M0 0h18v18H0V0Z" />
          <path
            fill="#fff"
            d="M7.601 7.57v-.656c.065-.004.13-.008.195-.008 1.797-.057 2.975 1.547 2.975 1.547S9.5 10.218 8.136 10.218c-.183 0-.36-.029-.53-.085V8.14c.7.085.841.393 1.258 1.093l.936-.786s-.685-.894-1.834-.894a2.745 2.745 0 0 0-.365.016Zm0-2.17v.98l.195-.012c2.497-.086 4.13 2.048 4.13 2.048s-1.871 2.275-3.819 2.275c-.17 0-.336-.016-.502-.044v.607c.138.016.28.029.417.029 1.814 0 3.126-.928 4.397-2.02.21.17 1.073.578 1.251.756-1.206 1.012-4.02 1.826-5.615 1.826-.154 0-.3-.008-.446-.024v.854H14.5V5.4H7.601Zm0 4.733v.518c-1.676-.3-2.141-2.045-2.141-2.045s.805-.89 2.141-1.036v.567h-.004c-.7-.085-1.25.57-1.25.57s.31 1.106 1.254 1.426Zm-2.975-1.6s.991-1.465 2.98-1.619V6.38C5.402 6.558 3.5 8.42 3.5 8.42s1.077 3.118 4.101 3.401v-.567c-2.218-.275-2.975-2.72-2.975-2.72Z"
          />
        </g>
        <defs>
          <linearGradient
            id="b"
            x1="16"
            x2="5.5"
            y1="-.5"
            y2="18"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#85B737" />
            <stop offset="1" stopColor="#597B20" />
          </linearGradient>
          <clipPath id="a">
            <path fill="#fff" d="M0 0h18v18H0z" />
          </clipPath>
        </defs>
      </svg>
    ),
  },
  {
    label: "GOOGL",
    value: "Google LLC",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 18 18">
        <path fill="#fff" d="M0 0h18v18H0z" />
        <path
          fill="#4285F4"
          d="M13.8 9.114c0-.355-.032-.696-.09-1.023H9v1.936h2.69a2.306 2.306 0 0 1-1.004 1.505v1.259h1.623c.946-.873 1.491-2.155 1.491-3.677Z"
        />
        <path
          fill="#34A853"
          d="M9 14c1.35 0 2.482-.445 3.31-1.209l-1.624-1.26c-.445.3-1.013.483-1.686.483-1.3 0-2.405-.878-2.8-2.06H4.536v1.291A4.995 4.995 0 0 0 9 14Z"
        />
        <path
          fill="#FBBC05"
          d="M6.2 9.95c-.1-.3-.16-.618-.16-.95 0-.332.06-.65.16-.95V6.759H4.536a4.938 4.938 0 0 0 0 4.482l1.296-1.01.368-.281Z"
        />
        <path
          fill="#EA4335"
          d="M9 5.99c.736 0 1.39.255 1.914.746l1.431-1.431C11.477 4.495 10.35 4 9 4a4.991 4.991 0 0 0-4.464 2.76L6.2 8.05C6.595 6.868 7.7 5.99 9 5.99Z"
        />
      </svg>
    ),
  },
  {
    label: "META",
    value: "Meta Platforms, Inc.",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 18 18">
        <g clipPath="url(#a)">
          <path fill="#F1F5F8" d="M0 0h18v18H0V0Z" />
          <g clipPath="url(#b)">
            <path
              fill="#0081FB"
              d="M4.298 10.357c0 .459.1.81.232 1.023a.79.79 0 0 0 .69.397c.34 0 .648-.083 1.244-.908.477-.66 1.039-1.588 1.417-2.17l.641-.985c.445-.683.96-1.444 1.55-1.96.483-.42 1.003-.654 1.526-.654.88 0 1.716.51 2.357 1.466.701 1.047 1.041 2.365 1.041 3.725 0 .809-.16 1.403-.43 1.873-.262.455-.772.908-1.631.908v-1.295c.735 0 .919-.676.919-1.45 0-1.102-.258-2.326-.824-3.2-.4-.621-.922-1-1.494-1-.62 0-1.118.468-1.678 1.301-.298.443-.604.983-.947 1.591l-.378.67c-.759 1.347-.951 1.655-1.331 2.16-.665.887-1.233 1.223-1.981 1.223-.887 0-1.448-.384-1.795-.963-.284-.473-.424-1.092-.424-1.798l1.296.046Z"
            />
            <path
              fill="url(#c)"
              d="M4.024 6.657C4.618 5.74 5.475 5.1 6.458 5.1c.57 0 1.135.168 1.726.652.647.527 1.336 1.397 2.196 2.83l.308.514c.744 1.24 1.168 1.878 1.415 2.18.319.386.542.501.832.501.735 0 .919-.676.919-1.45l1.142-.036c0 .809-.16 1.403-.43 1.873-.262.455-.772.908-1.631.908-.534 0-1.007-.116-1.53-.61-.402-.379-.873-1.052-1.234-1.658L9.096 9.006c-.54-.902-1.036-1.574-1.322-1.879-.308-.328-.705-.724-1.336-.724-.513 0-.947.36-1.31.91l-1.104-.656Z"
            />
            <path
              fill="url(#d)"
              d="M6.438 6.403c-.513 0-.947.36-1.31.91-.515.776-.83 1.933-.83 3.044 0 .459.1.81.232 1.023l-1.104.729c-.284-.473-.424-1.092-.424-1.798 0-1.283.353-2.621 1.022-3.654C4.618 5.74 5.475 5.1 6.458 5.1l-.02 1.303Z"
            />
          </g>
        </g>
        <defs>
          <linearGradient
            id="c"
            x1="5.547"
            x2="13.805"
            y1="9.983"
            y2="10.401"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#0064E1" />
            <stop offset=".4" stopColor="#0064E1" />
            <stop offset=".8" stopColor="#0073EE" />
            <stop offset="1" stopColor="#0082FB" />
          </linearGradient>
          <linearGradient
            id="d"
            x1="4.879"
            x2="4.879"
            y1="10.902"
            y2="7.855"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#0082FB" />
            <stop offset="1" stopColor="#0064E0" />
          </linearGradient>
          <clipPath id="a">
            <path fill="#fff" d="M0 0h18v18H0z" />
          </clipPath>
          <clipPath id="b">
            <path fill="#fff" d="M3 5.1h12v7.972H3z" />
          </clipPath>
        </defs>
      </svg>
    ),
  },
  {
    label: "AAPL",
    value: "Apple Inc.",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 18 18">
        <g clipPath="url(#a)">
          <path d="M0 0h18v18H0V0Z" />
          <path
            fill="#fff"
            d="M12.615 10.597a4.92 4.92 0 0 1-.645 1.287c-.256.363-.466.614-.626.753-.25.23-.518.347-.805.353-.206 0-.455-.059-.744-.177a2.135 2.135 0 0 0-.8-.176c-.255 0-.529.058-.822.176-.294.118-.531.18-.712.186-.274.012-.55-.108-.823-.362-.175-.151-.393-.412-.655-.78a5.383 5.383 0 0 1-.693-1.37A4.991 4.991 0 0 1 5 8.857c0-.603.131-1.124.393-1.56a2.36 2.36 0 0 1 .829-.832c.338-.2.72-.306 1.107-.31.22 0 .506.068.862.2.355.133.582.2.682.2.076 0 .329-.079.758-.236.406-.145.75-.205 1.03-.182.76.062 1.332.36 1.712.898-.68.41-1.017.985-1.01 1.722.006.574.215 1.053.626 1.432.187.176.395.312.626.409v-.001ZM10.702 4c.006.06.01.12.01.18 0 .45-.166.87-.495 1.26-.397.462-.878.73-1.4.687a1.391 1.391 0 0 1-.01-.17c0-.433.19-.895.524-1.273.168-.192.381-.35.639-.478A1.93 1.93 0 0 1 10.702 4Z"
          />
        </g>
        <defs>
          <clipPath id="a">
            <path fill="#fff" d="M0 0h18v18H0z" />
          </clipPath>
        </defs>
      </svg>
    ),
  },
  {
    label: "TSLA",
    value: "Tesla, Inc.",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 18 18">
        <g clipPath="url(#a)">
          <path fill="#E31937" d="M0 0h18v18H0V0Z" />
          <path
            fill="#fff"
            d="m9 15 1.5-8c1.334 0 1.654.272 1.715.872 0 0 .894-.335 1.346-1.016C11.8 6.037 10 6 10 6L9 7.25 8 6s-1.8.037-3.56.856c.45.68 1.345 1.016 1.345 1.016.061-.6.39-.871 1.715-.872L9 15Z"
          />
          <path
            fill="#fff"
            d="M9 5.608a11.35 11.35 0 0 1 4.688.955C13.91 6.16 14 6 14 6c-1.823-.724-3.53-.994-5-1-1.47.006-3.177.276-5 1 0 0 .114.2.313.563A11.348 11.348 0 0 1 9 5.608Z"
          />
        </g>
        <defs>
          <clipPath id="a">
            <path fill="#fff" d="M0 0h18v18H0z" />
          </clipPath>
        </defs>
      </svg>
    ),
  },
];

const CARD_HEIGHT = 80;
const GAP = 10;

const stackVariants: Variants = {
  closed: { scale: 1, y: 0, height: CARD_HEIGHT + GAP },
  open: { scale: 0.9, y: 10, height: 5 * CARD_HEIGHT + 5 * GAP },
};

const closedMotion = (i: number) => ({
  y: -i * GAP,
  scale: 1 - i * 0.1,
  opacity: 1 - i * 0.2,
  filter: `brightness(${1 - i * 0.05})`,
  zIndex: TICKERS.length - i,
});
const openMotion = (i: number) => ({
  y: i * (CARD_HEIGHT + GAP),
  scale: 1,
  opacity: 1,
  filter: `brightness(1)`,
  zIndex: TICKERS.length - i,
});

function Stack() {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState(TICKERS);
  const rotateRef = useRef<number | null>(null);

  // the rotation logic extracted for reuse
  const rotateOnce = () => {
    setItems((prev) => {
      if (prev.length === 0) return prev;
      const [first, ...rest] = prev;
      return [...rest, first];
    });
  };

  useEffect(() => {
    if (!open) {
      rotateOnce();
      // returns a number in the browser
      rotateRef.current = window.setInterval(rotateOnce, 4000);
    } else {
      // clear and reset to null
      if (rotateRef.current !== null) {
        clearInterval(rotateRef.current);
        rotateRef.current = null;
      }
    }
    return () => {
      if (rotateRef.current !== null) {
        clearInterval(rotateRef.current);
      }
    };
  }, [open]);

  return (
    <AnimatePresence>
      <motion.div
        initial="closed"
        animate={open ? "open" : "closed"}
        variants={stackVariants}
        className="relative flex w-xs flex-col"
      >
        {items.map(({ label, value, icon }, i) => (
          <motion.div
            key={label}
            custom={i}
            initial={closedMotion(i)}
            onClick={() => setOpen(!open)}
            animate={open ? openMotion(i) : closedMotion(i)}
            transition={{ type: "spring", stiffness: 300, damping: 40 }}
            style={{
              pointerEvents: i === 0 ? "auto" : "none",
              cursor: i === 0 ? "pointer" : "default",
            }}
            className="bg-background-secondary absolute top-0 flex w-xs flex-row gap-2 overflow-hidden rounded-3xl will-change-transform backface-hidden"
          >
            <div className="size-20 overflow-hidden rounded-3xl">{icon}</div>
            <div className="flex flex-col justify-center">
              <p className="font-bold">{label}</p>
              <p className="text-text-secondary font-semibold">{value}</p>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </AnimatePresence>
  );
}

export default function Hero() {
  return (
    <section className="flex flex-col items-center justify-center pt-44">
      <Stack />
      <div className="flex flex-col gap-2 pt-12 text-center leading-8 text-balance">
        <h2 className="text-6xl font-bold tracking-tight">
          Make better investments.
        </h2>
        <p className="text-text-secondary text-xl">
          {
            "Acme offers a streamlined view of real-time market data, investment platform that empowers users to make informed decisions and achieve their financial goals."
          }
        </p>
      </div>
    </section>
  );
}
