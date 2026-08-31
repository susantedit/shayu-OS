import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Award, Code, Mail, Globe, Sparkles, MessageSquare, Coffee
} from 'lucide-react'

const GithubIcon = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg>
)

const LinkedinIcon = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor"><path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9v8.37H9.25V10.9H6.46M7.86 6.78a1.68 1.68 0 1 0 0 3.36 1.68 1.68 0 0 0 0-3.36z"/></svg>
)

export default function CreatorApp() {
  const [activeTab, setActiveTab] = useState<'overview' | 'certifications' | 'techstack' | 'socials'>('overview')
  const containerRef = useRef<HTMLDivElement>(null)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    if (!containerRef.current) return
    const observer = new ResizeObserver(entries => {
      for (const entry of entries) {
        setIsMobile(entry.contentRect.width < 580)
      }
    })
    observer.observe(containerRef.current)
    return () => observer.disconnect()
  }, [])

  return (
    <div
      ref={containerRef}
      style={{
        display: 'flex', flexDirection: 'column', height: '100%',
        background: 'var(--color-window-bg)', color: 'var(--color-text-primary)',
        overflow: 'hidden', fontFamily: 'var(--font-sans)',
      }}
    >
      {/* Top Banner Header */}
      <div style={{
        padding: isMobile ? '16px' : '24px 28px',
        background: 'linear-gradient(135deg, rgba(232,130,155,0.15) 0%, rgba(107,63,160,0.1) 50%, rgba(126,221,214,0.1) 100%)',
        borderBottom: '1px solid var(--color-glass-border)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 14,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? 12 : 18, minWidth: 0, flex: 1 }}>
          {/* Animated Avatar / GIF Frame */}
          <div style={{
            position: 'relative', width: isMobile ? 54 : 72, height: isMobile ? 54 : 72, borderRadius: '50%', overflow: 'hidden',
            border: '2px solid var(--color-sakura)', boxShadow: '0 0 24px rgba(232,130,155,0.3)', flexShrink: 0,
          }}>
            <img
              src="https://cdn.dribbble.com/users/1019864/screenshots/3079099/codeloop.gif"
              alt="Kantaraj Luitel"
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </div>

          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              <h1 className="font-heading" style={{ fontSize: isMobile ? 18 : 24, fontWeight: 700, margin: 0, color: 'var(--color-text-primary)' }}>
                Kantaraj Luitel <span style={{ fontSize: isMobile ? 13 : 16, color: 'var(--color-sakura)', fontWeight: 600 }}>(Susant)</span>
              </h1>
              <span style={{ fontSize: 10, background: 'rgba(232,130,155,0.2)', color: 'var(--color-sakura)', padding: '2px 8px', borderRadius: 10, fontWeight: 700 }}>
                Creator of स्याउ OS
              </span>
            </div>

            <p style={{ fontSize: isMobile ? 11 : 13, color: 'var(--color-text-secondary)', marginTop: 4, margin: 0, fontWeight: 500, lineHeight: 1.4 }}>
              💻 Developer • 🔐 Cybersecurity Enthusiast • 🎬 Content Creator • 🏆 Hackathon Winner
            </p>
            <div style={{ fontSize: 11, color: 'var(--color-text-muted)', marginTop: 2, display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
              <span>📍 Nepal 🇳🇵</span> • <span>Cosmic International Academy</span>
            </div>
          </div>
        </div>

        {/* Quick Action Badges */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', width: isMobile ? '100%' : 'auto' }}>
          <a
            href="https://github.com/susantedit"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              flex: isMobile ? 1 : 'initial', justifyContent: 'center',
              padding: '7px 14px', borderRadius: 8, fontSize: 12, fontWeight: 600,
              background: 'var(--color-glass-card)', border: '1px solid var(--color-glass-border)',
              color: 'var(--color-text-primary)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 6,
              transition: 'all 0.2s ease', whiteSpace: 'nowrap',
            }}
          >
            <GithubIcon size={14} /> GitHub
          </a>
          <a
            href="https://buymeacoffee.com/Susantedit"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              flex: isMobile ? 1 : 'initial', justifyContent: 'center',
              padding: '7px 14px', borderRadius: 8, fontSize: 12, fontWeight: 700,
              background: 'linear-gradient(135deg, #FFDD00 0%, #F59E0B 100%)',
              color: '#1E1B4B', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 6,
              boxShadow: '0 4px 12px rgba(245,158,11,0.3)', whiteSpace: 'nowrap',
            }}
          >
            <Coffee size={14} /> Buy Coffee
          </a>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div style={{
        display: 'flex', gap: 6, padding: isMobile ? '8px 12px' : '12px 28px',
        borderBottom: '1px solid var(--color-glass-border)', background: 'rgba(0,0,0,0.02)',
        overflowX: 'auto', scrollbarWidth: 'none', msOverflowStyle: 'none', flexShrink: 0,
      }}>
        {[
          { id: 'overview', label: 'Overview', icon: Sparkles },
          { id: 'certifications', label: 'Certifications', icon: Award },
          { id: 'techstack', label: 'Tech Stack', icon: Code },
          { id: 'socials', label: 'Socials', icon: Globe },
        ].map(tab => {
          const Icon = tab.icon
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              style={{
                padding: '6px 14px', borderRadius: 8, fontSize: 12, fontWeight: 600,
                border: isActive ? '1px solid var(--color-sakura)' : '1px solid transparent',
                background: isActive ? 'rgba(232,130,155,0.15)' : 'transparent',
                color: isActive ? 'var(--color-sakura)' : 'var(--color-text-secondary)',
                cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6,
                transition: 'all 0.15s ease', whiteSpace: 'nowrap', flexShrink: 0,
              }}
            >
              <Icon size={14} /> {tab.label}
            </button>
          )
        })}
      </div>

      {/* Tab Content */}
      <div style={{ flex: 1, overflowY: 'auto', padding: isMobile ? '16px' : '24px 28px' }}>
        <AnimatePresence mode="wait">
          {activeTab === 'overview' && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              style={{ display: 'flex', flexDirection: 'column', gap: 16 }}
            >
              {/* Highlight Banner */}
              <div style={{
                padding: 14, borderRadius: 12,
                background: 'var(--color-glass-card)', border: '1px solid var(--color-glass-border)',
                display: 'flex', alignItems: 'center', gap: 12,
              }}>
                <Award size={26} style={{ color: 'var(--color-peach)', flexShrink: 0 }} />
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-text-primary)' }}>
                    🥈 2nd Place - Campfire Kathmandu 2026 (HackClub)
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--color-text-secondary)', marginTop: 2, lineHeight: 1.4 }}>
                    Honored to receive 2nd Place at Campfire Kathmandu 2026. Grateful to be part of an inspiring community building cool projects!
                  </div>
                </div>
              </div>

              {/* Object Inspector Card */}
              <div style={{
                background: 'rgba(10, 12, 20, 0.85)', borderRadius: 12, padding: 14,
                border: '1px solid var(--color-glass-border)', fontFamily: 'var(--font-mono)', fontSize: isMobile ? 11 : 12,
                lineHeight: 1.6, color: '#E2E8F0', overflowX: 'auto',
              }}>
                <div style={{ color: '#94A3B8', marginBottom: 6 }}>// Creator Data Object</div>
                <div><span style={{ color: '#F43F5E' }}>const</span> <span style={{ color: '#38BDF8' }}>kantaraj</span> = &#123;</div>
                <div style={{ paddingLeft: 16 }}><span style={{ color: '#A855F7' }}>name</span>: <span style={{ color: '#4ADE80' }}>"Kantaraj Luitel (Susant)"</span>,</div>
                <div style={{ paddingLeft: 16 }}><span style={{ color: '#A855F7' }}>location</span>: <span style={{ color: '#4ADE80' }}>"Nepal 🇳🇵"</span>,</div>
                <div style={{ paddingLeft: 16 }}><span style={{ color: '#A855F7' }}>role</span>: <span style={{ color: '#4ADE80' }}>"Student • Developer • AI Enthusiast"</span>,</div>
                <div style={{ paddingLeft: 16 }}><span style={{ color: '#A855F7' }}>education</span>: <span style={{ color: '#4ADE80' }}>"Cosmic International Academy"</span>,</div>
                <div style={{ paddingLeft: 16 }}><span style={{ color: '#A855F7' }}>achievements</span>: [</div>
                <div style={{ paddingLeft: 32, color: '#FDE047' }}>"🏆 2nd Place - Campfire Kathmandu 2026",</div>
                <div style={{ paddingLeft: 32, color: '#FDE047' }}>"🎓 Oracle Certified - GenAI Professional",</div>
                <div style={{ paddingLeft: 32, color: '#FDE047' }}>"🎓 Oracle Certified - AI Associate",</div>
                <div style={{ paddingLeft: 32, color: '#FDE047' }}>"🔐 APIsec Certified Practitioner"</div>
                <div style={{ paddingLeft: 16 }}>],</div>
                <div style={{ paddingLeft: 16 }}><span style={{ color: '#A855F7' }}>goal</span>: <span style={{ color: '#4ADE80' }}>"Build powerful AI & cybersecurity projects 🚀"</span></div>
                <div>&#125;;</div>
              </div>

              {/* Quote Card */}
              <div style={{
                padding: 14, borderRadius: 12, textAlign: 'center',
                background: 'linear-gradient(135deg, rgba(232,130,155,0.08) 0%, rgba(126,221,214,0.08) 100%)',
                border: '1px solid var(--color-glass-border)', fontSize: 12, fontWeight: 600, color: 'var(--color-text-primary)',
              }}>
                ✨ "Code. Break. Learn. Build again. Every expert was once a beginner."
              </div>
            </motion.div>
          )}

          {activeTab === 'certifications' && (
            <motion.div
              key="certifications"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(300px, 1fr))', gap: 12 }}
            >
              {[
                { title: 'Oracle Cloud Infrastructure 2025 Certified Generative AI Professional', org: 'Oracle Cloud', tag: 'Sep 2025 - Sep 2027', color: '#F80000' },
                { title: 'Oracle Cloud Infrastructure 2025 Certified AI Foundations Associate', org: 'Oracle Cloud', tag: 'Sep 2025 - Sep 2027', color: '#F80000' },
                { title: 'APIsec Certified Practitioner', org: 'APIsec University', tag: 'ID: 12UAQLBHVX4drA1N4jFdPHg18mwhJQAJKY', color: '#10B981' },
                { title: 'Advent of Cyber 2025', org: 'TryHackMe', tag: 'ID: THM-FJTSQDVCJI', color: '#3B82F6' },
                { title: '5-Day AI Agents Intensive Course', org: 'Google Cloud', tag: 'Dec 2025', color: '#4285F4' },
                { title: 'Introduction to Generative AI', org: 'Google Cloud', tag: 'Sep 2025', color: '#4285F4' },
                { title: 'Deloitte Australia - Cyber Job Simulation', org: 'Forage', tag: 'Oct 2025', color: '#8B5CF6' },
                { title: 'Introduction to Prompt Engineering with GitHub Copilot', org: 'Microsoft', tag: 'Sep 2025', color: '#6366F1' },
              ].map((c, i) => (
                <div key={i} style={{
                  padding: 14, borderRadius: 12, background: 'var(--color-glass-card)',
                  border: '1px solid var(--color-glass-border)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
                }}>
                  <div>
                    <div style={{ fontSize: 10, fontWeight: 700, color: c.color, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>
                      {c.org}
                    </div>
                    <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: 8, lineHeight: 1.4 }}>
                      {c.title}
                    </div>
                  </div>
                  <div style={{ fontSize: 10, color: 'var(--color-text-muted)', background: 'rgba(255,255,255,0.03)', padding: '3px 6px', borderRadius: 6, display: 'inline-block', width: 'fit-content' }}>
                    {c.tag}
                  </div>
                </div>
              ))}
            </motion.div>
          )}

          {activeTab === 'techstack' && (
            <motion.div
              key="techstack"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              style={{ display: 'flex', flexDirection: 'column', gap: 14 }}
            >
              <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, color: 'var(--color-sakura)' }}>
                Languages & Frameworks
              </div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {['JavaScript', 'TypeScript', 'React', 'Next.js', 'Python', 'C', 'HTML5', 'CSS3', 'Node.js', 'Express.js', 'SQL', 'Flutter', 'PHP'].map(t => (
                  <span key={t} style={{
                    padding: '5px 12px', borderRadius: 8, background: 'rgba(232,130,155,0.1)',
                    border: '1px solid rgba(232,130,155,0.2)', fontSize: 11, fontWeight: 600, color: 'var(--color-text-primary)',
                  }}>
                    {t}
                  </span>
                ))}
              </div>

              <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, color: 'var(--color-miku)', marginTop: 8 }}>
                Cloud, Security & Tools
              </div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {['Oracle Cloud', 'Google Cloud', 'AWS', 'Linux', 'Git', 'GitHub', 'VS Code', 'Kiro', 'API Security', 'TryHackMe', 'Figma', 'Databricks'].map(t => (
                  <span key={t} style={{
                    padding: '5px 12px', borderRadius: 8, background: 'rgba(126,221,214,0.1)',
                    border: '1px solid rgba(126,221,214,0.2)', fontSize: 11, fontWeight: 600, color: 'var(--color-text-primary)',
                  }}>
                    {t}
                  </span>
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === 'socials' && (
            <motion.div
              key="socials"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(220px, 1fr))', gap: 10 }}
            >
              {[
                { name: 'GitHub', handle: '@susantedit', url: 'https://github.com/susantedit', icon: GithubIcon, color: '#181717' },
                { name: 'LinkedIn', handle: 'Kantaraj Luitel', url: 'https://linkedin.com/in/kantaraj-luitel', icon: LinkedinIcon, color: '#0077B5' },
                { name: 'Instagram', handle: '@susantgamerz', url: 'https://instagram.com/susantgamerz', icon: Globe, color: '#E4405F' },
                { name: 'Facebook', handle: 'Kantaraj Luitel', url: 'https://facebook.com/Kantaraj.Luitel', icon: Globe, color: '#1877F2' },
                { name: 'WhatsApp', handle: '+977 9708838261', url: 'https://wa.me/9779708838261', icon: MessageSquare, color: '#25D366' },
                { name: 'Email', handle: 'susantedit@gmail.com', url: 'mailto:susantedit@gmail.com', icon: Mail, color: '#EA4335' },
              ].map((s, i) => {
                const Icon = s.icon
                return (
                  <a
                    key={i}
                    href={s.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      padding: 12, borderRadius: 10, background: 'var(--color-glass-card)',
                      border: '1px solid var(--color-glass-border)', textDecoration: 'none',
                      display: 'flex', alignItems: 'center', gap: 10, transition: 'all 0.15s ease',
                    }}
                  >
                    <div style={{
                      width: 32, height: 32, borderRadius: 8, background: 'rgba(255,255,255,0.06)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-sakura)', flexShrink: 0,
                    }}>
                      <Icon size={16} />
                    </div>
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-text-primary)' }}>{s.name}</div>
                      <div style={{ fontSize: 10, color: 'var(--color-text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.handle}</div>
                    </div>
                  </a>
                )
              })}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
