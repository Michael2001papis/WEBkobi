import { Container } from '@/components/UI/Container';
import { Section } from '@/components/UI/Section';
import { Card } from '@/components/UI/Card';
import { Button } from '@/components/UI/Button';
import styles from './Contact.module.css';

export function Contact() {
  return (
    <Section padding="lg">
      <Container size="md">
        <div className={styles.content}>
          <h1 className={styles.title}>צור קשר</h1>
          <p className={styles.intro}>
            נשמח לשמוע מכם ולסייע לכם לבנות את זהות המותג שלכם.
          </p>

          <Card variant="elevated" className={styles.formCard}>
            <form className={styles.form} onSubmit={(e) => e.preventDefault()}>
              <div className={styles.field}>
                <label htmlFor="name" className={styles.label}>
                  שם מלא
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  className={styles.input}
                  required
                />
              </div>

              <div className={styles.field}>
                <label htmlFor="email" className={styles.label}>
                  דוא"ל
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  className={styles.input}
                  required
                />
              </div>

              <div className={styles.field}>
                <label htmlFor="message" className={styles.label}>
                  הודעה
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows={6}
                  className={styles.textarea}
                  required
                />
              </div>

              <Button type="submit" variant="primary" size="lg" className={styles.submit}>
                שלח הודעה
              </Button>
            </form>
          </Card>

          <div className={styles.info}>
            <Card>
              <h2>פרטי התקשרות</h2>
              <p>נשמח לענות על כל שאלה ולסייע לכם בכל נושא.</p>
              <p className={styles.note}>
                טופס זה הוא דוגמה. בעתיד ניתן לחבר אותו למערכת API.
              </p>
            </Card>
          </div>
        </div>
      </Container>
    </Section>
  );
}

