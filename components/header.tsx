"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { ConnectWalletButton } from "@/components/wallet-provider"

interface HeaderProps {
  title?: string
  subtitle?: string
  showCreateButton?: boolean
}

export default function Header({
  title = "SwapBox",
  subtitle = "Decentralized Token Trading Platform",
  showCreateButton = true,
}: HeaderProps) {
  return (
    <motion.header
      className="border-b border-[#222222] bg-black/95 backdrop-blur supports-[backdrop-filter]:bg-black/60"
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          <Link href="/">
            <motion.div
              initial={{ x: -50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              <motion.h1
                className="text-3xl font-bold bg-gradient-to-r from-primary to-[#169976] bg-clip-text text-transparent"
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                {title}
              </motion.h1>
              <p className="text-white/80">{subtitle}</p>
            </motion.div>
          </Link>

          <motion.div
            className="flex items-center gap-4"
            initial={{ x: 50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            <ConnectWalletButton />

            {showCreateButton && (
              <Link href="/create">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button className="gap-2 bg-primary hover:bg-[#169976] text-black font-bold glow-primary">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                    >
                      <Plus className="h-4 w-4" />
                    </motion.div>
                    Create Box
                  </Button>
                </motion.div>
              </Link>
            )}
          </motion.div>
        </div>
      </div>
    </motion.header>
  )
}
