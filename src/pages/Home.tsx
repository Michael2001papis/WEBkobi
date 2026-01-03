import { Link } from 'react-router-dom';
import { Container } from '@/components/UI/Container';
import { Section } from '@/components/UI/Section';
import { Button } from '@/components/UI/Button';
import styles from './Home.module.css';

export function Home() {
  return (
    <>
      <Section variant="default" padding="xl" className={styles.hero} aria-label="דף הבית">
        <Container size="lg">
          <div className={styles.heroContent}>
            <h1 className={styles.headline}>מערכת מותג מתקדמת</h1>
            <p className={styles.subheadline}>
              פתרונות מקצועיים לבניית זהות מותג חזקה ומשפיעה. אנו מספקים כלים מתקדמים
              ומומחיות מקצועית להצלחת העסק שלכם.
            </p>
            <div className={styles.ctaGroup}>
              <Button as={Link} to="/capabilities" variant="primary" size="lg">
                הכר את השירותים
              </Button>
              <Button as={Link} to="/overview" variant="secondary" size="lg">
                למידע נוסף
              </Button>
            </div>
          </div>
        </Container>
      </Section>

      <Section variant="muted" padding="xl">
        <Container size="lg">
          <div className={styles.features}>
            <div className={styles.feature}>
              <h2>מקצועיות</h2>
              <p>צוות מנוסה עם שנים של ניסיון מוכח בתחום</p>
            </div>
            <div className={styles.feature}>
              <h2>אמינות</h2>
              <p>פתרונות אמינים ובדוקים לפרויקטים מורכבים</p>
            </div>
            <div className={styles.feature}>
              <h2>חדשנות</h2>
              <p>טכנולוגיות מתקדמות וכלים מובילים בשוק</p>
            </div>
          </div>
        </Container>
      </Section>
    </>
  );
}

