import { Container } from '@/components/UI/Container';
import { Section } from '@/components/UI/Section';
import { Card } from '@/components/UI/Card';
import styles from './Overview.module.css';

export function Overview() {
  return (
    <Section padding="lg">
      <Container size="lg">
        <div className={styles.content}>
          <h1 className={styles.title}>סקירה כללית</h1>
          <p className={styles.intro}>
            מערכת מותג מתקדמת המספקת פתרונות מקיפים לבניית זהות חזקה ומשפיעה.
          </p>

          <div className={styles.grid}>
            <Card>
              <h2>חזון</h2>
              <p>
                לספק כלים ופתרונות מתקדמים המאפשרים לבנות זהות מותג חזקה ומשפיעה
                בשוק הישראלי והבינלאומי.
              </p>
            </Card>

            <Card>
              <h2>משימה</h2>
              <p>
                ליצור מערכת מקיפה, מקצועית ואמינה המסייעת לעסקים ולחברות לבנות
                ולנהל את זהות המותג שלהם בצורה מיטבית.
              </p>
            </Card>

            <Card>
              <h2>ערכים</h2>
              <p>
                מקצועיות, אמינות, חדשנות ושירות לקוחות מעולה הם הערכים המנחים
                אותנו בכל פרויקט.
              </p>
            </Card>
          </div>
        </div>
      </Container>
    </Section>
  );
}

