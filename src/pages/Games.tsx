import { useState, useMemo, useEffect } from 'react';
import { Section } from '@/components/UI/Section';
import { Card } from '@/components/UI/Card';
import { classnames } from '@/lib/classnames';
import styles from './Games.module.css';

// טיפוס למשחק
interface Game {
  id: string;
  title: string;
  description: string;
  folder: string;
  thumbnail?: string;
  badges?: ('new' | 'classic' | 'fast')[];
}

interface GamesData {
  games: Game[];
}

export function Games() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBadge, setSelectedBadge] = useState<string | null>(null);
  const [games, setGames] = useState<Game[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // טעינת משחקים מ-JSON
  useEffect(() => {
    const loadGames = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const baseUrl = import.meta.env.BASE_URL || '/';
        const response = await fetch(`${baseUrl}games/games.json`);
        
        if (!response.ok) {
          throw new Error('לא ניתן לטעון את רשימת המשחקים');
        }
        
        const data: GamesData = await response.json();
        setGames(data.games || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'שגיאה בטעינת המשחקים');
        setGames([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadGames();
  }, []);

  // סינון משחקים
  const filteredGames = useMemo(() => {
    let filtered = games;

    // סינון לפי חיפוש
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (game) =>
          game.title.toLowerCase().includes(query) ||
          game.description.toLowerCase().includes(query) ||
          game.id.toLowerCase().includes(query)
      );
    }

    // סינון לפי badge
    if (selectedBadge) {
      filtered = filtered.filter((game) => game.badges?.includes(selectedBadge as 'new' | 'classic' | 'fast'));
    }

    return filtered;
  }, [games, searchQuery, selectedBadge]);

  const badgeLabels = {
    new: 'חדש',
    classic: 'קלאסי',
    fast: 'מהיר',
  };

  return (
    <>
      <Section variant="default" padding="xl">
        <div className={styles.content}>
          <h1 className={styles.title}>משחקים שלי</h1>
          <p className={styles.intro}>
            אוסף משחקים להעברת הזמן. בחר משחק להתחיל.
          </p>

          {/* חיפוש וסינון */}
          <div className={styles.filters}>
            <div className={styles.searchContainer}>
              <input
                type="text"
                className={styles.searchInput}
                placeholder="חפש משחק..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className={styles.badgeFilters}>
              <button
                type="button"
                className={classnames(styles.badgeFilter, !selectedBadge && styles.active)}
                onClick={() => setSelectedBadge(null)}
              >
                הכל
              </button>
              {(['new', 'classic', 'fast'] as const).map((badge) => (
                <button
                  key={badge}
                  type="button"
                  className={classnames(
                    styles.badgeFilter,
                    selectedBadge === badge && styles.active
                  )}
                  onClick={() => setSelectedBadge(selectedBadge === badge ? null : badge)}
                >
                  {badgeLabels[badge]}
                </button>
              ))}
            </div>
          </div>

          {/* Loading */}
          {isLoading && (
            <div className={styles.emptyState}>
              <div className={styles.emptyIcon}>⏳</div>
              <p className={styles.emptyTitle}>טוען משחקים...</p>
            </div>
          )}

          {/* Error */}
          {error && !isLoading && (
            <div className={styles.emptyState}>
              <div className={styles.emptyIcon}>⚠️</div>
              <p className={styles.emptyTitle}>{error}</p>
              <p className={styles.hint}>
                ודא שקובץ <code>public/games/games.json</code> קיים ותקין
              </p>
            </div>
          )}

          {/* תוצאות */}
          {!isLoading && !error && filteredGames.length === 0 ? (
            <div className={styles.emptyState}>
              <div className={styles.emptyIcon}>🎮</div>
              <p className={styles.emptyTitle}>
                {searchQuery || selectedBadge
                  ? 'לא נמצאו משחקים התואמים לחיפוש'
                  : 'אין משחקים זמינים כרגע'}
              </p>
              {searchQuery || selectedBadge ? (
                <button
                  type="button"
                  className={styles.clearFilters}
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedBadge(null);
                  }}
                >
                  נקה חיפוש
                </button>
              ) : (
                <p className={styles.hint}>
                  הוסף משחקים לתיקיית <code>public/games</code>
                </p>
              )}
            </div>
          ) : (
            <>
              <div className={styles.resultsCount}>
                נמצאו {filteredGames.length} משחק{filteredGames.length !== 1 ? 'ים' : ''}
              </div>
              <div className={styles.grid}>
                {filteredGames.map((game) => (
                  <Card key={game.id} className={styles.gameCard}>
                    {game.thumbnail && (
                      <div className={styles.thumbnail}>
                        <img src={game.thumbnail} alt={game.title} />
                      </div>
                    )}
                    <div className={styles.gameHeader}>
                      <h2>{game.title}</h2>
                      {game.badges && game.badges.length > 0 && (
                        <div className={styles.badges}>
                          {game.badges.map((badge) => (
                            <span
                              key={badge}
                              className={classnames(styles.badge, styles[`badge-${badge}`])}
                            >
                              {badgeLabels[badge]}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <p>{game.description}</p>
                    <a
                      href={`${import.meta.env.BASE_URL || '/'}games/${game.folder}/`}
                      className={styles.playButton}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      שחק
                    </a>
                  </Card>
                ))}
              </div>
            </>
          )}
        </div>
      </Section>
    </>
  );
}

