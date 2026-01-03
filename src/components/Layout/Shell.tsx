import { Outlet } from 'react-router-dom';
import { Header } from './Header';
import { Footer } from './Footer';
import { ChatAssistantWidget } from '@/features/chat-assistant/assistant.widget.stub';
import styles from './Shell.module.css';

export function Shell() {
  return (
    <div className={styles.shell}>
      <Header />
      <main className={styles.main}>
        <Outlet />
      </main>
      <Footer />
      <ChatAssistantWidget />
    </div>
  );
}

