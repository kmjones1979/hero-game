export function Background() {
  return (
    <>
      <div aria-hidden className="fixed inset-0 -z-30 bg-ink" />

      <div
        aria-hidden
        className="fixed inset-0 -z-20"
        style={{
          backgroundImage: `
            radial-gradient(ellipse at 20% 10%, rgba(147,192,164,0.08), transparent 50%),
            radial-gradient(ellipse at 80% 60%, rgba(212,205,171,0.06), transparent 50%),
            radial-gradient(ellipse at 50% 100%, rgba(142,155,144,0.05), transparent 60%)
          `,
        }}
      />

      <div
        aria-hidden
        className="fixed inset-0 -z-10"
        style={{
          opacity: 0.04,
          mixBlendMode: "overlay",
          backgroundImage:
            "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='220' height='220'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/><feColorMatrix type='matrix' values='0 0 0 0 0.86  0 0 0 0 0.81  0 0 0 0 0.67  0 0 0 1 0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>\")",
        }}
      />
    </>
  );
}
