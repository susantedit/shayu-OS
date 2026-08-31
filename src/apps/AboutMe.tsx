import { motion } from 'framer-motion'
import { ExternalLink, Mail, Globe, Sparkles, UserCheck } from 'lucide-react'
import { useDesktopStore } from '../store/desktopStore'

export default function AboutMe() {
  const openWindow = useDesktopStore(s => s.openWindow)

  return (
    <div style={{
      padding: 24,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: 16,
      textAlign: 'center',
      height: '100%',
    }}>
      <motion.div
        style={{
          width: 80, height: 80, borderRadius: '50%', overflow: 'hidden',
          boxShadow: '0 4px 20px rgba(232,130,155,0.3)',
          border: '2px solid var(--color-sakura)',
        }}
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 200, delay: 0.1 }}
      >
        <img
          src="https://cdn.dribbble.com/users/1019864/screenshots/3079099/codeloop.gif"
          alt="Kantaraj Luitel (Susant)"
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 4 }}>
          <img src="/syauOS.png" alt="स्याउ OS" style={{ width: 26, height: 26, objectFit: 'contain' }} />
          <h2 style={{ fontSize: 22, margin: 0, color: 'var(--color-text-primary)', display: 'flex', alignItems: 'center', gap: 6 }}>
            <span className="font-syau" style={{ fontWeight: 600 }}>स्याउ</span>
            <span className="font-os" style={{ fontWeight: 700, color: 'var(--color-sakura)', letterSpacing: '0.08em' }}>OS</span>
          </h2>
        </div>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: 13, fontWeight: 500 }}>
          Created by <strong style={{ color: 'var(--color-text-primary)' }}>Kantaraj Luitel (Susant)</strong>
        </p>
      </motion.div>

      <motion.div
        style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center' }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        {['Developer', 'Cybersecurity', 'Content Creator', 'AI Enthusiast'].map(tag => (
          <span
            key={tag}
            style={{
              padding: '4px 12px',
              borderRadius: 'var(--radius-pill)',
              background: 'rgba(232,130,155,0.08)',
              fontSize: 12,
              fontWeight: 600,
              color: 'var(--color-sakura)',
              border: '1px solid rgba(232,130,155,0.15)',
            }}
          >
            {tag}
          </span>
        ))}
      </motion.div>

      <motion.div
        style={{
          background: 'var(--color-glass-card)',
          backdropFilter: 'blur(16px)',
          borderRadius: 14,
          padding: 16,
          width: '100%',
          textAlign: 'left',
          fontSize: 12,
          lineHeight: 1.6,
          color: 'var(--color-text-secondary)',
          border: '1px solid var(--color-glass-border)',
        }}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <p>
          <strong style={{ color: 'var(--color-text-primary)' }}>Kantaraj Luitel (Susant)</strong> is a student, developer, AI researcher, and cybersecurity enthusiast from Nepal 🇳🇵.
          <br /><br />
          🏆 <strong>2nd Place</strong> - Campfire Kathmandu 2026 (HackClub)
          <br />
          🎓 <strong>Oracle Cloud Certified</strong> Generative AI Professional & AI Foundations Associate
          <br />
          🔐 <strong>APIsec Certified</strong> Practitioner
        </p>
      </motion.div>

      <motion.button
        onClick={() => openWindow('creator', 'Kantaraj Luitel (Susant) - Creator Profile', 860, 580)}
        style={{
          width: '100%', padding: '10px 16px', borderRadius: 10,
          background: 'linear-gradient(135deg, var(--color-sakura) 0%, var(--color-sakura-deep) 100%)',
          color: 'white', fontWeight: 700, fontSize: 13, border: 'none', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          boxShadow: '0 4px 16px rgba(232,130,155,0.3)',
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <UserCheck size={16} /> Open Full Creator Profile App
      </motion.button>
    </div>
  )
}
