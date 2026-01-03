// שילוב class names בצורה בטוחה
export function classnames(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}

