import React from "react";
import {
  Github,
  Linkedin,
  Twitter,
  Layers,
  Globe
} from "lucide-react";
import { Link } from "react-router-dom";

const Footer: React.FC = () => {
  const year = new Date().getFullYear();

  return (
    <footer className="w-full bg-white border-t border-zinc-200 py-12 lg:py-16">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 lg:gap-12 mb-16">
          <div className="col-span-2 lg:col-span-2">
            <Link to="/" className="flex items-center gap-2 mb-6">
              <div className="bg-zinc-900 text-white p-1.5 rounded-lg">
                <Layers size={20} strokeWidth={2.5} />
              </div>
              <span className="text-xl font-bold tracking-tight text-zinc-900">Collabryta</span>
            </Link>
            <p className="text-zinc-500 text-sm leading-relaxed mb-6 max-w-sm">
              The modern workspace for high-performance teams. Sync tasks, docs, and conversations in one unified platform.
            </p>
            <div className="flex gap-4">
              <SocialLink href="#" icon={<Twitter size={16} />} label="Twitter" />
              <SocialLink href="#" icon={<Github size={16} />} label="GitHub" />
              <SocialLink href="#" icon={<Linkedin size={16} />} label="LinkedIn" />
            </div>
          </div>

          <FooterColumn
            title="Platform"
            links={[
              { label: "Tasks", to: "/tasks" },
              { label: "Messages", to: "/messages" },
              { label: "Files", to: "/files" },
              { label: "Calendar", to: "/calendar" },
            ]}
          />

          <FooterColumn
            title="Company"
            links={[
              { label: "About", to: "/about" },
              { label: "Careers", to: "/careers" },
              { label: "Blog", to: "/blog" },
              { label: "Press", to: "/press" }
            ]}
          />

          <FooterColumn
            title="Resources"
            links={[
              { label: "Help Center", to: "/help" },
              { label: "API", to: "/api" },
              { label: "Status", to: "/status" },
              { label: "Terms", to: "/terms" }
            ]}
          />
        </div>

        <div className="border-t border-zinc-200 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-zinc-500 font-medium">
            &copy; {year} Collabryta Inc. All rights reserved.
          </p>

          <div className="flex items-center gap-6">
            <button className="flex items-center gap-2 text-sm text-zinc-500 hover:text-zinc-900 transition-colors font-medium">
              <Globe size={14} />
              <span>English (US)</span>
            </button>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500" />
              <span className="text-sm text-zinc-500 font-medium">All systems normal</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

const FooterColumn: React.FC<{ title: string; links: { label: string; to: string }[] }> = ({ title, links }) => (
  <div>
    <h3 className="font-semibold text-zinc-900 text-sm mb-4">{title}</h3>
    <ul className="space-y-3">
      {links.map((link) => (
        <li key={link.label}>
          <Link
            to={link.to}
            className="text-zinc-500 text-sm hover:text-zinc-900 transition-colors"
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
    className="w-8 h-8 flex items-center justify-center rounded-lg bg-zinc-100 text-zinc-500 hover:bg-zinc-900 hover:text-white transition-all duration-200"
    aria-label={label}
  >
    {icon}
  </a>
);

export default Footer;
