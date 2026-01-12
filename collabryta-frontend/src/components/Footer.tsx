import React from "react";
import {
  Github,
  Linkedin,
  Twitter,
  Hexagon,
  Globe
} from "lucide-react";
import { Link } from "react-router-dom";

const Footer: React.FC = () => {
  const year = new Date().getFullYear();

  return (
    <footer className="w-full bg-white text-slate-600 mt-auto border-t border-slate-200 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">


        {/* Middle Section: Links Grid */}
        <div className="py-16 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8 lg:gap-12">
          <div className="col-span-2 md:col-span-3 lg:col-span-2">
            <div className="flex items-center gap-2 mb-6">
              <div className="p-1.5 bg-blue-600 rounded-lg shadow-sm">
                <Hexagon size={24} className="text-white fill-blue-600" />
              </div>
              <span className="text-2xl font-bold text-slate-900 tracking-tight">Collabryta</span>
            </div>
            <p className="text-slate-500 text-sm leading-relaxed mb-6 max-w-sm">
              The all-in-one workspace that brings your team's tasks, docs, and conversations together. Designed for speed, built for scale.
            </p>
            <div className="flex gap-4">
              <SocialLink href="#" icon={<Twitter size={18} />} label="Twitter" />
              <SocialLink href="#" icon={<Github size={18} />} label="GitHub" />
              <SocialLink href="#" icon={<Linkedin size={18} />} label="LinkedIn" />
            </div>
          </div>

          <FooterColumn
            title="Platform"
            links={[
              { label: "Task Management", to: "/tasks" },
              { label: "Real-time Chat", to: "/messages" },
              { label: "File Storage", to: "/files" },
              { label: "Team Members", to: "/team" },
            ]}
          />

          <FooterColumn
            title="Company"
            links={[
              { label: "About Us", to: "/about" },
              { label: "Careers", to: "/careers" },
              { label: "Blog", to: "/blog" },
              { label: "Press Kit", to: "/press" },
              { label: "Contact", to: "/contact" }
            ]}
          />

          <FooterColumn
            title="Support"
            links={[
              { label: "Help Center", to: "/help-center" },
              { label: "Community", to: "/community" },
              { label: "API Status", to: "/status" },
              { label: "Documentation", to: "/docs" },
              { label: "Report a Bug", to: "/report-bug" }
            ]}
          />
        </div>

        {/* Bottom Section */}
        <div className="py-8 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex flex-col md:flex-row items-center gap-4 text-sm text-slate-500">
            <span>&copy; {year} Collabryta Inc.</span>
            <div className="hidden md:block w-1 h-1 bg-slate-300 rounded-full"></div>
            <Link to="/privacy" className="hover:text-blue-600 transition-colors">Privacy Policy</Link>
            <div className="hidden md:block w-1 h-1 bg-slate-300 rounded-full"></div>
            <Link to="/terms" className="hover:text-blue-600 transition-colors">Terms of Service</Link>
          </div>

          <div className="flex items-center gap-6">
            <button className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-800 transition-colors bg-slate-50 px-3 py-1.5 rounded-full border border-slate-200">
              <Globe size={14} />
              <span>English (US)</span>
            </button>

            <div className="h-4 w-px bg-slate-200"></div>

            <div className="flex items-center gap-2 cursor-help group">
              <div className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-500 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
              </div>
              <span className="text-xs font-medium text-slate-600 group-hover:text-green-600 transition-colors">Systems Normal</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

// Sub-components
const FooterColumn: React.FC<{ title: string; links: { label: string; to: string }[] }> = ({ title, links }) => (
  <div>
    <h3 className="font-bold text-slate-900 text-sm tracking-wide uppercase mb-5">{title}</h3>
    <ul className="space-y-3">
      {links.map((link) => (
        <li key={link.label}>
          <Link
            to={link.to}
            className="text-slate-500 text-sm hover:text-blue-600 hover:translate-x-0.5 transition-all inline-block"
          >
            {link.label}
          </Link>
        </li>
      ))}
    </ul>
  </div>
);

const SocialLink: React.FC<{ href: string; icon: React.ReactNode; label: string }> = ({ href, icon, label }) => (
  <a
    href={href}
    className="w-10 h-10 flex items-center justify-center rounded-lg bg-white text-slate-400 hover:bg-slate-50 hover:text-blue-600 hover:scale-105 transition-all shadow-sm border border-slate-200"
    aria-label={label}
  >
    {icon}
  </a>
);

export default Footer;
