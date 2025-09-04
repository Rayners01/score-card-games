'use client';

import { Righteous, New_Rocker } from "next/font/google";
import { motion } from "framer-motion";
import { Button } from '@/components/ui/button';

import { useRouter } from "next/navigation";

const righteous = Righteous({
  weight: '400',
  subsets: ['latin']
});

const newRocker = New_Rocker({
  weight: '400',
  subsets: ['latin']
});

export default function Home() {

  const router = useRouter();

  return (
    <div className="w-full h-[100dvh] flex flex-col md:flex-row overflow-hidden">
      {/* Dutch Blitz Side */}
      <div className="w-full md:w-1/2 h-1/2 md:h-full flex items-center justify-center bg-gradient-to-br from-green-700 to-emerald-500 relative overflow-hidden">
        <motion.div
          className="pointer-events-none absolute inset-0 bg-[url('/folk_pattern.png')] bg-repeat opacity-20 mix-blend-overlay will-change-transform"
          animate={{ backgroundPosition: ["0% 0%", "100% 100%"] }}
          transition={{ repeat: Infinity, duration: 20, ease: "linear" }}
        />
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 1.1 }}>
          <Button
            className={`${newRocker.className} text-yellow-400 text-4xl px-10 py-6 rounded-2xl shadow-lg shadow-black bg-gradient-to-br from-green-900 to-green-600 border-4 border-yellow-400`}
            onClick={() => router.push('/blitz')}
          >
            DUTCH BLITZ
          </Button>
        </motion.div>
      </div>

      {/* Flip 7 Side */}
      <div className="w-full md:w-1/2 h-1/2 md:h-full flex items-center justify-center bg-gradient-to-tr from-pink-500 via-yellow-400 to-blue-500 relative overflow-hidden">
        <motion.div
          className="pointer-events-none absolute inset-0 opacity-25 bg-[url('/retro_pattern.webp')] bg-repeat mix-blend-overlay will-change-transform"
          animate={{ 
            backgroundPositionX: ["0%", "50%", "0%"],
            backgroundPositionY: ["0%", "50%", "0%"]
          }}
          transition={{ repeat: Infinity, duration: 6, ease: "linear" }}
        />
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 1.1 }}>
          <Button
            className={`${righteous.className} text-white text-5xl px-12 py-6 rounded-2xl shadow-xl shadow-black bg-gradient-to-r from-red-500 via-yellow-400 to-blue-500 border-4 border-white`}
            onClick={() => console.log("FLIP7")}
          >
            FLIP 7
          </Button>
        </motion.div>
      </div>
    </div>
  );
}
