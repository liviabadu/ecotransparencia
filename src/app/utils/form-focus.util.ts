/**
 * True quando o foco está em campo onde o usuário costuma digitar (Esc não deve disparar ações globais).
 */
export function isFocusInTextEntryField(): boolean {
  const el = document.activeElement;
  if (!el || !(el instanceof HTMLElement)) return false;
  if (el.isContentEditable) return true;
  const tag = el.tagName;
  if (tag === 'TEXTAREA' || tag === 'SELECT') return true;
  if (tag === 'INPUT') {
    const type = (el as HTMLInputElement).type?.toLowerCase() ?? 'text';
    const nonText = new Set([
      'button',
      'submit',
      'reset',
      'checkbox',
      'radio',
      'file',
      'hidden',
      'image',
    ]);
    return !nonText.has(type);
  }
  return false;
}
