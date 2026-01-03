import { Link } from 'react-router-dom';
import { Container } from '@/components/UI/Container';
import { Section } from '@/components/UI/Section';
import { Button } from '@/components/UI/Button';
import styles from './NotFound.module.css';

export function NotFound() {
  return (
    <Section padding="xl">
      <Container size="md">
        <div className={styles.content}>
          <h1 className={styles.title}>404</h1>
          <p className={styles.message}>הדף המבוקש לא נמצא</p>
          <p className={styles.description}>
            הדף שחיפשת אינו קיים או הועבר למיקום אחר.
          </p>
          <Button as={Link} to="/" variant="primary" size="lg">
            חזור לדף הבית
          </Button>
        </div>
      </Container>
    </Section>
  );
}

