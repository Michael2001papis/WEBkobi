import { Container } from '@/components/UI/Container';
import { Section } from '@/components/UI/Section';
import { Card } from '@/components/UI/Card';
import styles from './Trust.module.css';

const trustPoints = [
  {
    title: 'ניסיון מוכח',
    description:
      'צוות מנוסה עם שנים של ניסיון מוצלח בפרויקטים מורכבים ומגוונים.',
  },
  {
    title: 'אמינות גבוהה',
    description: 'מחויבות מלאה לאמינות, שקיפות ושירות לקוחות מעולה.',
  },
  {
    title: 'גישה מקצועית',
    description:
      'גישה מקצועית ומסודרת לכל פרויקט, עם תשומת לב לפרטים הקטנים.',
  },
  {
    title: 'תוצאות מוכחות',
    description:
      'היסטוריה של הצלחות ופרויקטים מובילים עם תוצאות מוכחות ומדידות.',
  },
];

export function Trust() {
  return (
    <Section padding="lg">
      <Container size="lg">
        <div className={styles.content}>
          <h1 className={styles.title}>למה לבחור בנו</h1>
          <p className={styles.intro}>
            אנו מחויבים לספק שירות מקצועי, אמין ואיכותי לכל לקוח ולקוחה.
          </p>

          <div className={styles.grid}>
            {trustPoints.map((point, index) => (
              <Card key={index}>
                <h2>{point.title}</h2>
                <p>{point.description}</p>
              </Card>
            ))}
          </div>

          <div className={styles.commitment}>
            <Card variant="elevated">
              <h2>המחויבות שלנו</h2>
              <p>
                אנו מתחייבים לספק פתרונות איכותיים, מקצועיים ואמינים המסייעים
                לכם להשיג את המטרות העסקיות שלכם. השירות שלנו מבוסס על ערכים
                של מקצועיות, שקיפות ושותפות אמיתית עם הלקוחות שלנו.
              </p>
            </Card>
          </div>
        </div>
      </Container>
    </Section>
  );
}

