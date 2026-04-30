export const renderFlashMessage = (
  message: string,
  tone: 'neutral' | 'success' | 'warning',
): string => {
  const background =
    tone === 'success'
      ? 'rgba(22, 163, 74, 0.14)'
      : tone === 'warning'
        ? 'rgba(217, 119, 6, 0.16)'
        : 'rgba(31, 41, 51, 0.08)';

  const color =
    tone === 'success'
      ? '#166534'
      : tone === 'warning'
        ? '#92400e'
        : '#334155';

  return `
    <section style="max-width: 1100px; margin: 24px auto 0; padding: 0 20px;">
      <div style="border-radius: 14px; padding: 14px 16px; background: ${background}; color: ${color}; font: 500 0.95rem/1.4 'IBM Plex Sans', 'Segoe UI', sans-serif;">
        ${message}
      </div>
    </section>
  `;
};
