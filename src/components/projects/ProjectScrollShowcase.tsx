import { useRef, useState } from 'react';
import {
  useScroll,
  useTransform,
  useMotionValueEvent,
  motion,
  type MotionValue,
} from 'framer-motion';

interface Project {
  title: string;
  katakana: string;
  description: string;
  tech: string[];
  year: number;
  url?: string;
  github?: string;
  order: number;
}

interface ProjectCardProps {
  project: Project;
  index: number;
  total: number;
  scrollYProgress: MotionValue<number>;
}

function ProjectCard({ project, index, total, scrollYProgress }: ProjectCardProps) {
  const segment = 1 / total;
  const start = index * segment;
  const end = (index + 1) * segment;
  const fadeBuffer = segment * 0.18;

  const isLast = index === total - 1;
  const opacity = useTransform(
    scrollYProgress,
    [start, start + fadeBuffer, end - fadeBuffer, end],
    [0, 1, 1, isLast ? 1 : 0]
  );
  const y = useTransform(scrollYProgress, [start, start + fadeBuffer], [40, 0]);
  const scale = useTransform(scrollYProgress, [start, start + fadeBuffer], [0.96, 1]);

  const num = String(index + 1).padStart(2, '0');

  return (
    <motion.article
      style={{ opacity, y, scale }}
      className="absolute inset-0 flex items-center justify-center px-6 md:px-16 pointer-events-none overflow-y-auto py-6 md:py-0"
      aria-hidden={false}
    >
      <div className="w-full max-w-5xl pointer-events-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-0 border-3 border-charcoal bg-cream shadow-[8px_8px_0px_#1a1a1a]">

          {/* Left: number + title */}
          <div className="p-6 md:p-12 flex flex-col justify-between">
            <div>
              <span className="font-display text-[4rem] md:text-[6rem] leading-none text-red-accent select-none block">
                {num}
              </span>
              <p className="font-display text-olive text-sm tracking-widest mt-1 mb-3">
                {project.katakana}
              </p>
              <h2 className="font-display text-charcoal text-4xl md:text-5xl leading-tight tracking-wide">
                {project.title.toUpperCase()}
              </h2>
            </div>

            <div className="mt-8 flex gap-3">
              {project.github && (
                <a
                  href={project.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="border-3 border-charcoal font-display tracking-widest text-sm px-5 py-2 text-charcoal hover:bg-charcoal hover:text-cream transition-colors"
                >
                  GITHUB
                </a>
              )}
              {project.url && (
                <a
                  href={project.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="border-3 border-red-accent font-display tracking-widest text-sm px-5 py-2 text-red-accent hover:bg-red-accent hover:text-cream transition-colors"
                >
                  LIVE →
                </a>
              )}
            </div>
          </div>

          {/* Right: description + tech + year */}
          <div className="p-6 md:p-12 flex flex-col justify-between bg-parchment panel-separator">
            <p className="font-body text-charcoal/80 text-base leading-relaxed">
              {project.description}
            </p>

            <div className="mt-8">
              <p className="font-display text-xs tracking-widest text-olive mb-3">TECH STACK</p>
              <div className="flex flex-wrap gap-2">
                {project.tech.map((t) => (
                  <span
                    key={t}
                    className="border-3 border-charcoal font-body text-xs px-3 py-1 text-charcoal bg-cream"
                  >
                    {t}
                  </span>
                ))}
              </div>
              <p className="font-display text-charcoal/30 text-4xl md:text-6xl mt-4 text-right leading-none select-none">
                {project.year}
              </p>
            </div>
          </div>
        </div>
      </div>
    </motion.article>
  );
}

function SectionIntro({ scrollYProgress }: { scrollYProgress: MotionValue<number> }) {
  const opacity = useTransform(scrollYProgress, [0, 0.07], [1, 0]);
  const scale  = useTransform(scrollYProgress, [0, 0.07], [1, 1.06]);
  const y      = useTransform(scrollYProgress, [0, 0.07], [0, -24]);

  return (
    <motion.div
      style={{ opacity, scale, y }}
      className="absolute inset-0 flex flex-col items-center justify-center z-10 pointer-events-none px-8"
    >
      {/* Top rule */}
      <div className="flex items-center gap-6 w-full max-w-lg mb-8">
        <span className="flex-1 h-px bg-charcoal/30" />
        <span className="font-display text-red-accent text-sm tracking-widest">SELECTED WORK</span>
        <span className="flex-1 h-px bg-charcoal/30" />
      </div>

      {/* Big title */}
      <h2 className="font-display text-charcoal text-[clamp(5rem,16vw,13rem)] leading-none tracking-tight text-center">
        PROJECTS
      </h2>

      {/* Halftone decoration */}
      <div className="mt-6 flex items-center gap-3">
        <span className="w-2 h-2 bg-red-accent" />
        <span className="w-2 h-2 bg-olive" />
        <span className="w-2 h-2 bg-charcoal" />
      </div>

      {/* Scroll nudge */}
      <p className="font-display text-charcoal/30 text-xs tracking-widest mt-8">
        SCROLL TO EXPLORE
      </p>
    </motion.div>
  );
}

export default function ProjectScrollShowcase({ projects }: { projects: Project[] }) {
  const sorted = [...projects].sort((a, b) => a.order - b.order);
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  });

  useMotionValueEvent(scrollYProgress, 'change', (latest) => {
    const idx = Math.min(Math.floor(latest * sorted.length), sorted.length - 1);
    setActiveIndex(idx);
  });

  return (
    <section
      id="projects"
      ref={containerRef}
      style={{ height: `${Math.max(sorted.length, 2) * 100}vh` }}
      className="relative"
    >
      {/* Sticky viewport */}
      <div className="sticky top-0 h-screen overflow-hidden bg-parchment border-t-3 border-charcoal">

        {/* Intro overlay — fades out as first card fades in */}
        <SectionIntro scrollYProgress={scrollYProgress} />

        {/* Project cards */}
        {sorted.map((project, i) => (
          <ProjectCard
            key={project.title}
            project={project}
            index={i}
            total={sorted.length}
            scrollYProgress={scrollYProgress}
          />
        ))}

        {/* Progress dots (right side) */}
        <div className="absolute right-6 top-1/2 -translate-y-1/2 flex flex-col gap-3 z-10">
          {sorted.map((_, i) => (
            <div
              key={i}
              className={`w-2 h-2 transition-colors duration-300 border-2 border-charcoal ${
                i === activeIndex ? 'bg-red-accent border-red-accent' : 'bg-transparent'
              }`}
            />
          ))}
        </div>

        {/* Project counter */}
        <div className="absolute bottom-8 left-8 md:left-16 font-display text-charcoal/30 text-sm tracking-widest">
          {String(activeIndex + 1).padStart(2, '0')} / {String(sorted.length).padStart(2, '0')}
        </div>
      </div>
    </section>
  );
}
