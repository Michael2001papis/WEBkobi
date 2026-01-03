import { Container } from '@/components/UI/Container';
import { Section } from '@/components/UI/Section';
import { Card } from '@/components/UI/Card';
import styles from './Capabilities.module.css';

const capabilities = [
  {
    title: 'פיתוח זהות מותג',
    description: 'יצירה ופיתוח של זהות מותג ייחודית ומשפיעה המתאימה לחזון העסק.',
  },
  {
    title: 'עיצוב גרפי',
    description: 'עיצוב גרפי מקצועי לכל סוגי המדיה והפלטפורמות הדיגיטליות.',
  },
  {
    title: 'פיתוח דיגיטלי',
    description: 'פיתוח פתרונות דיגיטליים מתקדמים ומותאמים אישית לצרכים שלכם.',
  },
  {
    title: 'ייעוץ אסטרטגי',
    description: 'ייעוץ מקצועי ואסטרטגי לבניית תכנית מותג מקיפה ויעילה.',
  },
  {
    title: 'ניהול תוכן',
    description: 'יצירה וניהול של תוכן איכותי ומשפיע עבור כל ערוצי התקשורת.',
  },
  {
    title: 'ניתוח וביצועים',
    description: 'ניתוח מעמיק של ביצועי המותג ושיפור מתמיד של התוצאות.',
  },
];

export function Capabilities() {
  return (
    <Section padding="lg">
      <Container size="lg">
        <div className={styles.content}>
          <h1 className={styles.title}>יכולות ושירותים</h1>
          <p className={styles.intro}>
            אנו מציעים מגוון רחב של שירותים מקצועיים לבניית וניהול זהות מותג
            חזקה.
          </p>

          <div className={styles.grid}>
            {capabilities.map((capability, index) => (
              <Card key={index} variant="elevated">
                <h2>{capability.title}</h2>
                <p>{capability.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </Container>
    </Section>
  );
}

