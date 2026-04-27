import { useRef, useState, FormEvent } from 'react';
import { motion, useInView, type Variants } from 'framer-motion';
import { MdCallEnd, MdSend, MdPhone, MdEmail, MdLocationOn, MdOpenInNew } from 'react-icons/md';
import './Contact.css';

const container: Variants = { hidden: {}, show: { transition: { staggerChildren: 0.1 } } };
const item: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
};

export default function Contact({ onEnd }: { onEnd: () => void }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-100px' });
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setSent(true);
  };

  return (
    <section className="contact" id="contact">
      <div className="section-wrap">
        <motion.div
          ref={ref}
          variants={container}
          initial="hidden"
          animate={inView ? 'show' : 'hidden'}
        >
          <motion.div variants={item} className="contact-header">
            <span className="contact-num">04</span>
            <div>
              <span className="contact-prompt">{'>'} OPTION 4 SELECTED — TO CONNECT, PRESS 9</span>
              <h2 className="contact-title">TRANSFER CALL</h2>
            </div>
          </motion.div>

          <div className="contact-grid">
            {/* Info */}
            <motion.div variants={item} className="contact-info">
              <div className="contact-info-header">DIRECT EXTENSIONS</div>
              {[
                { icon: <MdEmail size={14} />, label: 'EMAIL', val: 'yadavvaibhavkumar7@gmail.com', href: 'mailto:yadavvaibhavkumar7@gmail.com' },
                { icon: <MdPhone size={14} />, label: 'PHONE', val: '+1 945-542-0116', href: 'tel:+19455420116' },
                { icon: <MdLocationOn size={14} />, label: 'LOCATION', val: 'Richardson, TX, USA', href: undefined },
                { icon: <MdOpenInNew size={14} />, label: 'LINKEDIN', val: 'vaibhavkumar-yadav-633552233', href: 'https://www.linkedin.com/in/vaibhavkumar-yadav-633552233/' },
              ].map(({ icon, label, val, href }) => (
                <div key={label} className="contact-info-row">
                  <div className="contact-info-icon">{icon}</div>
                  <div>
                    <div className="contact-info-label">{label}</div>
                    {href ? (
                      <a href={href} target={href.startsWith('http') ? '_blank' : undefined} rel={href.startsWith('http') ? 'noopener noreferrer' : undefined} className="contact-info-val contact-info-link">{val}</a>
                    ) : (
                      <div className="contact-info-val">{val}</div>
                    )}
                  </div>
                </div>
              ))}

              <div className="contact-availability">
                <div className="contact-avail-dot" />
                <div>
                  <div className="contact-avail-status">AVAILABLE FOR OPPORTUNITIES</div>
                  <div className="contact-avail-detail">Open to Genesys Cloud roles globally</div>
                </div>
              </div>
            </motion.div>

            {/* Form */}
            <motion.div variants={item}>
              {sent ? (
                <div className="contact-sent">
                  <div className="contact-sent-icon">✓</div>
                  <div className="contact-sent-msg">MESSAGE TRANSFERRED</div>
                  <p>Call request received. Will connect within 24 hours.</p>
                </div>
              ) : (
                <form className="contact-form" onSubmit={handleSubmit}>
                  <div className="contact-form-header">INITIATE TRANSFER</div>
                  <div className="contact-field">
                    <label className="contact-label" htmlFor="cf-name">CALLER NAME</label>
                    <input id="cf-name" className="contact-input" type="text" placeholder="Your name" required />
                  </div>
                  <div className="contact-field">
                    <label className="contact-label" htmlFor="cf-email">CALLER EMAIL</label>
                    <input id="cf-email" className="contact-input" type="email" placeholder="your@email.com" required />
                  </div>
                  <div className="contact-field">
                    <label className="contact-label" htmlFor="cf-msg">MESSAGE / REASON FOR CALL</label>
                    <textarea id="cf-msg" className="contact-input contact-textarea" placeholder="Describe the opportunity..." rows={4} required />
                  </div>
                  <button type="submit" className="contact-submit">
                    TRANSFER <MdSend size={14} />
                  </button>
                </form>
              )}
            </motion.div>
          </div>

          {/* End call */}
          <motion.div variants={item} className="contact-endcall-wrap">
            <div className="contact-endcall-label">
              To disconnect this session, press END CALL
            </div>
            <motion.button
              type="button"
              className="contact-endcall"
              onClick={onEnd}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.95 }}
            >
              <MdCallEnd size={22} />
              END CALL
            </motion.button>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
