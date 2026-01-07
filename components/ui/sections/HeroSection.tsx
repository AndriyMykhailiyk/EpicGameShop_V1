interface HeroSectionProps {
  title: string;
  subtitle?: string;
  tags?: string[];
}

export default function HeroSection({
  title,
  subtitle,
  tags,
}: HeroSectionProps) {
  return (
    <section className="hero-section">
      <div className="hero-content">
        <h1 className="hero-title">{title}</h1>
        {subtitle && <h2 className="hero-subtitle">{subtitle}</h2>}
        {tags && tags.length > 0 && (
          <div className="hero-tags">
            {tags.map((tag, index) => (
              <span key={index} className="tag">
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
