"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Github, Twitter, Linkedin, Mail, ExternalLink, Copy, Check } from "lucide-react"

const socialLinks = [
  {
    name: "GitHub",
    nameMarathi: "गिटहब",
    icon: <Github className="w-6 h-6" />,
    href: "https://github.com",
    handle: "@creator",
    color: "#333",
  },
  {
    name: "Twitter",
    nameMarathi: "ट्विटर",
    icon: <Twitter className="w-6 h-6" />,
    href: "https://twitter.com",
    handle: "@creator",
    color: "#1DA1F2",
  },
  {
    name: "LinkedIn",
    nameMarathi: "लिंक्डइन",
    icon: <Linkedin className="w-6 h-6" />,
    href: "https://linkedin.com",
    handle: "in/creator",
    color: "#0077B5",
  },
  {
    name: "Email",
    nameMarathi: "ईमेल",
    icon: <Mail className="w-6 h-6" />,
    href: "mailto:hello@creator.fun",
    handle: "hello@creator.fun",
    color: "#EA4335",
  },
]

export function ContactSection() {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null)

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text)
    setCopiedIndex(index)
    setTimeout(() => setCopiedIndex(null), 2000)
  }

  return (
    <section id="contact" className="py-24 px-6 bg-muted/30">
      <div className="max-w-4xl mx-auto">
        {/* Section header */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Let&apos;s Connect
          </h2>
          <p className="text-lg text-muted-foreground font-mono">
            चला जोडूया
          </p>
          <p className="text-muted-foreground mt-4 max-w-xl mx-auto">
            Have an idea? Want to collaborate? Just want to say hi?
            <br />
            <span className="text-sm opacity-70">
              काही कल्पना आहे? सहकार्य करायचे आहे? फक्त नमस्कार म्हणायचे आहे?
            </span>
          </p>
        </motion.div>

        {/* Social links grid */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: {
                staggerChildren: 0.1,
              },
            },
          }}
        >
          {socialLinks.map((link, index) => (
            <motion.div
              key={link.name}
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0 },
              }}
            >
              <div className="group relative bg-card border border-border rounded-2xl p-6 hover:border-primary/50 transition-all duration-300">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110"
                      style={{ backgroundColor: `${link.color}20`, color: link.color }}
                    >
                      {link.icon}
                    </div>
                    <div>
                      <h3 className="font-bold text-card-foreground">{link.name}</h3>
                      <p className="text-xs text-muted-foreground font-mono">{link.nameMarathi}</p>
                      <p className="text-sm text-muted-foreground mt-1">{link.handle}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <motion.button
                      onClick={() => copyToClipboard(link.handle, index)}
                      className="p-2 rounded-lg hover:bg-muted transition-colors"
                      whileTap={{ scale: 0.95 }}
                      title="Copy / कॉपी करा"
                    >
                      {copiedIndex === index ? (
                        <Check className="w-4 h-4 text-game" />
                      ) : (
                        <Copy className="w-4 h-4 text-muted-foreground" />
                      )}
                    </motion.button>
                    <motion.a
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-lg hover:bg-muted transition-colors"
                      whileTap={{ scale: 0.95 }}
                      title="Open / उघडा"
                    >
                      <ExternalLink className="w-4 h-4 text-muted-foreground" />
                    </motion.a>
                  </div>
                </div>

                {/* Hover gradient */}
                <motion.div
                  className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
                  style={{
                    background: `radial-gradient(circle at 20% 50%, ${link.color}10 0%, transparent 50%)`,
                  }}
                />
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Fun footer */}
        <motion.div
          className="mt-16 text-center"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
        >
          <p className="text-muted-foreground text-sm">
            Made with curiosity and too much coffee
          </p>
          <p className="text-muted-foreground/60 text-xs font-mono mt-1">
            कुतूहल आणि खूप कॉफीने बनवले
          </p>
        </motion.div>
      </div>
    </section>
  )
}
